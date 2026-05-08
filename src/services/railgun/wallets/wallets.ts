import { Authorization, getAddress } from 'ethers';
import {
  RailgunWallet,
  EngineEvent,
  WalletScannedEventData,
  AbstractWallet,
  WalletData,
  AddressData,
  RailgunEngine,
  ByteUtils,
  POICurrentProofEventData,
  ViewOnlyWallet,
  TransactionStructV2,
  TransactionStructV3,
  RelayAdapt7702,
} from '@railgun-community/engine';
import {
  RailgunWalletInfo,
  NetworkName,
  NETWORK_CONFIG,
  isDefined,
  Chain,
} from '@railgun-community/shared-models';
import { onBalancesUpdate, onWalletPOIProofProgress } from './balance-update';
import { reportAndSanitizeError } from '../../../utils/error';
import { getEngine } from '../core/engine';
import { getFallbackProviderForNetwork } from '../core/providers';

export const awaitWalletScan = (walletID: string, chain: Chain) => {
  const wallet = walletForID(walletID);
  return new Promise((resolve, reject) =>
    wallet.once(
      EngineEvent.WalletDecryptBalancesComplete,
      ({ chain: returnedChain }: WalletScannedEventData) =>
        returnedChain.type === chain.type && returnedChain.id === chain.id
          ? resolve(returnedChain)
          : reject(),
    ),
  );
};

export const awaitMultipleWalletScans = async (
  walletID: string,
  chain: Chain,
  numScans: number,
) => {
  let i = 0;
  while (i < numScans) {
    // eslint-disable-next-line no-await-in-loop
    await awaitWalletScan(walletID, chain);
    i += 1;
  }
  return Promise.resolve();
};

export const walletForID = (id: string): AbstractWallet => {
  const engine = getEngine();
  const wallet = engine.wallets[id];
  if (!isDefined(wallet)) {
    throw new Error('No RAILGUN wallet for ID');
  }
  return wallet;
};

export const fullWalletForID = (id: string): RailgunWallet => {
  const wallet = walletForID(id);
  if (!(wallet instanceof RailgunWallet)) {
    throw new Error('Can not load View-Only wallet.');
  }
  return wallet;
};

export const viewOnlyWalletForID = (id: string): RailgunWallet => {
  const wallet = walletForID(id);
  if (!(wallet instanceof ViewOnlyWallet)) {
    throw new Error('Can only load View-Only wallet.');
  }
  return wallet as RailgunWallet;
};

const subscribeToEvents = (wallet: AbstractWallet) => {
  wallet.on(
    EngineEvent.WalletDecryptBalancesComplete,
    ({ txidVersion, chain }: WalletScannedEventData) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      onBalancesUpdate(txidVersion, wallet, chain);
    },
  );
  wallet.on(
    EngineEvent.POIProofUpdate,
    ({
      status,
      txidVersion,
      chain,
      progress,
      listKey,
      txid,
      railgunTxid,
      index,
      totalCount,
      errorMsg,
    }: POICurrentProofEventData) => {
      onWalletPOIProofProgress(
        status,
        txidVersion,
        wallet,
        chain,
        progress,
        listKey,
        txid,
        railgunTxid,
        index,
        totalCount,
        errorMsg,
      );
    },
  );
};

const addressForWallet = (wallet: AbstractWallet): string => {
  return wallet.getAddress();
};

const infoForWallet = (wallet: AbstractWallet): RailgunWalletInfo => {
  const railgunAddress = addressForWallet(wallet);
  return {
    id: wallet.id,
    railgunAddress,
  };
};

const getExistingWallet = (
  railgunWalletID: string,
): Optional<AbstractWallet> => {
  try {
    const existingWallet = walletForID(railgunWalletID);
    return existingWallet;
  } catch (_err) {
    return undefined;
  }
};

const loadExistingWallet = async (
  encryptionKey: string,
  railgunWalletID: string,
  isViewOnlyWallet: boolean,
  mnemonicPassword?: string,
): Promise<RailgunWalletInfo> => {
  const existingWallet = getExistingWallet(railgunWalletID);
  if (existingWallet) {
    return infoForWallet(existingWallet);
  }
  const engine = getEngine();
  let wallet: AbstractWallet;

  if (isViewOnlyWallet) {
    wallet = await engine.loadExistingViewOnlyWallet(
      encryptionKey,
      railgunWalletID,
    );
  } else {
    // The BIP39 mnemonic password is never persisted, so it must be supplied
    // again on load for password-protected wallets. The engine verifies it
    // reproduces the wallet ID and throws on a wrong/missing password.
    wallet = await engine.loadExistingWallet(
      encryptionKey,
      railgunWalletID,
      mnemonicPassword,
    );
  }

  subscribeToEvents(wallet);
  return infoForWallet(wallet);
};

const createWallet = async (
  encryptionKey: string,
  mnemonic: string,
  mnemonicPassword: string,
  creationBlockNumbers: Optional<MapType<number>>,
  railgunWalletDerivationIndex?: number,
): Promise<RailgunWalletInfo> => {
  const formattedCreationBlockNumbers =
    formatCreationBlockNumbers(creationBlockNumbers);

  const engine = getEngine();
  const wallet = mnemonicPassword === ''
    ? await engine.createWalletFromMnemonic(
      encryptionKey,
      mnemonic,
      railgunWalletDerivationIndex ?? 0,
      formattedCreationBlockNumbers,
    )
    : await engine.createWalletFromMnemonicWithPassword(
      encryptionKey,
      mnemonic,
      mnemonicPassword,
      railgunWalletDerivationIndex ?? 0,
      formattedCreationBlockNumbers,
    );
  subscribeToEvents(wallet);
  return infoForWallet(wallet);
};

const createViewOnlyWallet = async (
  encryptionKey: string,
  shareableViewingKey: string,
  creationBlockNumbers: Optional<MapType<number>>,
): Promise<RailgunWalletInfo> => {
  const formattedCreationBlockNumbers =
    formatCreationBlockNumbers(creationBlockNumbers);

  const engine = getEngine();
  const wallet = await engine.createViewOnlyWalletFromShareableViewingKey(
    encryptionKey,
    shareableViewingKey,
    formattedCreationBlockNumbers,
  );
  subscribeToEvents(wallet);
  return infoForWallet(wallet);
};

export const createRailgunWallet = async (
  encryptionKey: string,
  mnemonic: string,
  creationBlockNumbers: Optional<MapType<number>>,
  railgunWalletDerivationIndex?: number,
  // Optional BIP39 mnemonic password (second factor). When omitted/empty the
  // wallet is created without one, preserving the legacy wallet ID. It is never
  // persisted and must be supplied again on load (loadWalletByID) and on spend.
  mnemonicPassword?: string,
): Promise<RailgunWalletInfo> => {
  try {
    return await createWallet(
      encryptionKey,
      mnemonic,
      mnemonicPassword ?? '',
      creationBlockNumbers,
      railgunWalletDerivationIndex,
    );
  } catch (err) {
    throw reportAndSanitizeError(createRailgunWallet.name, err);
  }
};

export const createViewOnlyRailgunWallet = async (
  encryptionKey: string,
  shareableViewingKey: string,
  creationBlockNumbers: Optional<MapType<number>>,
): Promise<RailgunWalletInfo> => {
  try {
    return await createViewOnlyWallet(
      encryptionKey,
      shareableViewingKey,
      creationBlockNumbers,
    );
  } catch (err) {
    throw reportAndSanitizeError(createViewOnlyRailgunWallet.name, err);
  }
};

export const loadWalletByID = async (
  encryptionKey: string,
  railgunWalletID: string,
  isViewOnlyWallet: boolean,
  mnemonicPassword?: string,
): Promise<RailgunWalletInfo> => {
  try {
    return await loadExistingWallet(
      encryptionKey,
      railgunWalletID,
      isViewOnlyWallet,
      mnemonicPassword,
    );
  } catch (err) {
    const sanitizedError = reportAndSanitizeError(loadWalletByID.name, err);
    throw new Error(`Could not load RAILGUN wallet`, { cause: sanitizedError });
  }
};

export const unloadWalletByID = (railgunWalletID: string): void => {
  try {
    const engine = getEngine();
    engine.unloadWallet(railgunWalletID);
  } catch (err) {
    throw new Error('Could not unload RAILGUN wallet.', { cause: err });
  }
};

export const deleteWalletByID = async (
  railgunWalletID: string,
): Promise<void> => {
  try {
    const engine = getEngine();
    await engine.deleteWallet(railgunWalletID);
  } catch (err) {
    throw new Error('Could not delete RAILGUN wallet.', { cause: err });
  }
};

export const getWalletMnemonic = async (
  encryptionKey: string,
  railgunWalletID: string,
) => {
  const { db } = getEngine();
  // Reload wallet to ensure that encryption key is valid.
  const walletData = (await RailgunWallet.getEncryptedData(
    db,
    encryptionKey,
    railgunWalletID,
  )) as WalletData;

  if (!walletData.mnemonic) {
    throw new Error('No mnemonic for wallet.');
  }
  return walletData.mnemonic;
};

export const getRailgunWalletAddressData = (address: string): AddressData => {
  assertValidRailgunAddress(address);
  return RailgunEngine.decodeAddress(address);
};

export const getRailgunWalletPrivateViewingKey = (
  railgunWalletID: string,
): Uint8Array => {
  const wallet = walletForID(railgunWalletID);
  return wallet.getViewingKeyPair().privateKey;
};

export const signWithWalletViewingKey = async (
  railgunWalletID: string,
  message: string,
): Promise<string> => {
  const wallet = walletForID(railgunWalletID);
  const signature = await wallet.signWithViewingKey(
    ByteUtils.hexStringToBytes(message),
  );
  return ByteUtils.hexlify(signature);
};

export const assertValidRailgunAddress = (address: string): void => {
  if (!validateRailgunAddress(address)) {
    throw new Error('Invalid RAILGUN address.');
  }
};

export const validateRailgunAddress = (address: string): boolean => {
  try {
    return RailgunEngine.decodeAddress(address) != null;
  } catch (err) {
    return false;
  }
};

export const assertValidEthAddress = (address: string) => {
  if (!validateEthAddress(address)) {
    throw new Error('Invalid wallet address.');
  }
};

export const validateEthAddress = (address: string): boolean => {
  try {
    getAddress(address);
    return true;
  } catch (err) {
    return false;
  }
};

export const getRailgunAddress = (
  railgunWalletID: string,
): Optional<string> => {
  try {
    const wallet = walletForID(railgunWalletID);
    return wallet.getAddress();
  } catch (err) {
    reportAndSanitizeError(getRailgunAddress.name, err);
    return undefined;
  }
};

export const getWalletShareableViewingKey = async (
  railgunWalletID: string,
): Promise<Optional<string>> => {
  try {
    const wallet = walletForID(railgunWalletID);
    return wallet.generateShareableViewingKey();
  } catch (err) {
    reportAndSanitizeError(getWalletShareableViewingKey.name, err);
    return undefined;
  }
};

const formatCreationBlockNumbers = (
  creationBlockNumbers: Optional<MapType<number>>,
): Optional<number[][]> => {
  // Format creationBlockNumbers from client side { <NetworkName>: <BlockNumber> } map to @railgun-community/engine's number[][] type
  if (!creationBlockNumbers) return;

  const formattedCreationBlockNumbers: number[][] = [];
  const networksNames = Object.keys(creationBlockNumbers) as NetworkName[];

  for (const networkName of networksNames) {
    const network = NETWORK_CONFIG[networkName];

    const blockNumber = creationBlockNumbers[networkName];
    if (!isDefined(blockNumber)) {
      continue;
    }

    formattedCreationBlockNumbers[network.chain.type] ??= [];
    formattedCreationBlockNumbers[network.chain.type][network.chain.id] =
      blockNumber;
  }

  return formattedCreationBlockNumbers;
};

export const sign7702Request = async (
  walletID: string,
  encryptionKey: string,
  networkName: NetworkName,
  contractAddress: string,
  chainId: bigint,
  transactions: (TransactionStructV2 | TransactionStructV3)[],
  actionData: RelayAdapt7702.ActionDataStruct,
): Promise<{ authorization: Authorization; signature: string }> => {
  const wallet = fullWalletForID(walletID);
  const provider = getFallbackProviderForNetwork(networkName);
  const ephemeralWallet = (await wallet.getCurrentEphemeralWallet(
    encryptionKey,
    chainId,
  )).connect(provider);
  const nonce = await ephemeralWallet.getNonce('latest');

  return wallet.sign7702Request(
    encryptionKey,
    contractAddress,
    chainId,
    transactions,
    actionData,
    nonce,
  );
};

export const ratchetEphemeralAddress = async (
  walletID: string,
  networkName: NetworkName,
): Promise<void> => {
  const wallet = fullWalletForID(walletID);
  const chainId = BigInt(NETWORK_CONFIG[networkName].chain.id);
  return wallet.ratchetEphemeralAddress(chainId);
};

export const getCurrentEphemeralAddress = async (
  walletID: string,
  encryptionKey: string,
  networkName: NetworkName,
): Promise<string> => {
  const wallet = await getCurrentEphemeralWallet(walletID, encryptionKey, networkName);
  return wallet.address;
};

export const getCurrentEphemeralWallet = async (
  walletID: string,
  encryptionKey: string,
  networkName: NetworkName,
) => {
  const wallet = fullWalletForID(walletID);
  const chainId = BigInt(NETWORK_CONFIG[networkName].chain.id);
  return wallet.getCurrentEphemeralWallet(encryptionKey, chainId);
};
