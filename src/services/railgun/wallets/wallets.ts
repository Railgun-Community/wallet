import {
  RailgunWallet,
  EngineEvent,
  WalletScannedEventData,
  BytesData,
  AbstractWallet,
  WalletData,
  AddressData,
  RailgunEngine,
  ByteLength,
  hexlify,
  nToHex,
  hexStringToBytes,
} from '@railgun-community/engine';
import { getAddress } from '@ethersproject/address';
import {
  RailgunWalletInfo,
  LoadRailgunWalletResponse,
  RailgunWalletAddressDataSerialized,
  NetworkName,
  NETWORK_CONFIG,
} from '@railgun-community/shared-models';
import { getEngine, walletForID } from '../core/engine';
import { onBalancesUpdate } from './balance-update';
import { reportAndSanitizeError } from '../../../utils/error';

const subscribeToBalanceEvents = (wallet: AbstractWallet) => {
  wallet.on(
    EngineEvent.WalletScanComplete,
    ({ chain }: WalletScannedEventData) => onBalancesUpdate(wallet, chain),
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
    wallet = await engine.loadExistingWallet(encryptionKey, railgunWalletID);
  }

  subscribeToBalanceEvents(wallet);
  return infoForWallet(wallet);
};

const createWallet = async (
  encryptionKey: string,
  mnemonic: string,
  creationBlockNumbers: Optional<MapType<number>>,
): Promise<RailgunWalletInfo> => {
  const formattedCreationBlockNumbers =
    formatCreationBlockNumbers(creationBlockNumbers);

  const engine = getEngine();
  const wallet = await engine.createWalletFromMnemonic(
    encryptionKey,
    mnemonic,
    0,
    formattedCreationBlockNumbers,
  );
  subscribeToBalanceEvents(wallet);
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
  subscribeToBalanceEvents(wallet);
  return infoForWallet(wallet);
};

export const createRailgunWallet = async (
  encryptionKey: string,
  mnemonic: string,
  creationBlockNumbers: Optional<MapType<number>>,
): Promise<LoadRailgunWalletResponse> => {
  try {
    const railgunWalletInfo = await createWallet(
      encryptionKey,
      mnemonic,
      creationBlockNumbers,
    );
    const response: LoadRailgunWalletResponse = { railgunWalletInfo };
    return response;
  } catch (err) {
    throw reportAndSanitizeError(
      createRailgunWallet.name,
      err,
    );
  }
};

export const createViewOnlyRailgunWallet = async (
  encryptionKey: string,
  shareableViewingKey: string,
  creationBlockNumbers: Optional<MapType<number>>,
): Promise<LoadRailgunWalletResponse> => {
  try {
    const railgunWalletInfo = await createViewOnlyWallet(
      encryptionKey,
      shareableViewingKey,
      creationBlockNumbers,
    );
    const response: LoadRailgunWalletResponse = { railgunWalletInfo };
    return response;
  } catch (err) {
    throw reportAndSanitizeError(createViewOnlyRailgunWallet.name, err);
  }
};

export const loadWalletByID = async (
  encryptionKey: string,
  railgunWalletID: string,
  isViewOnlyWallet: boolean,
): Promise<LoadRailgunWalletResponse> => {
  try {
    const railgunWalletInfo = await loadExistingWallet(
      encryptionKey,
      railgunWalletID,
      isViewOnlyWallet,
    );
    const response: LoadRailgunWalletResponse = { railgunWalletInfo };
    return response;
  } catch (err) {
    const sanitizedError = reportAndSanitizeError(loadWalletByID.name, err);
    throw new Error(`Could not load RAILGUN wallet: ${sanitizedError.message}`);
  }
};

export const unloadWalletByID = (railgunWalletID: string): void => {
  try {
    const engine = getEngine();
    engine.unloadWallet(railgunWalletID);
  } catch (err) {
    throw new Error('Could not unload RAILGUN wallet.');
  }
};

export const getWalletMnemonic = async (
  encryptionKey: BytesData,
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

export const serializeRailgunWalletAddressData = (
  addressData: AddressData,
): RailgunWalletAddressDataSerialized => {
  const { viewingPublicKey, masterPublicKey } = addressData;
  const viewingPublicKeySerialized = hexlify(viewingPublicKey);
  const masterPublicKeySerialized = nToHex(
    masterPublicKey,
    ByteLength.UINT_256,
  );
  return {
    viewingPublicKey: viewingPublicKeySerialized,
    masterPublicKey: masterPublicKeySerialized,
  };
};

export const signWithWalletViewingKey = async (
  railgunWalletID: string,
  message: string,
): Promise<string> => {
  const wallet = walletForID(railgunWalletID);
  const signature = await wallet.signWithViewingKey(hexStringToBytes(message));
  return hexlify(signature);
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

    formattedCreationBlockNumbers[network.chain.type] ??= [];

    formattedCreationBlockNumbers[network.chain.type][network.chain.id] =
      creationBlockNumbers[networkName];
  }

  return formattedCreationBlockNumbers;
};
