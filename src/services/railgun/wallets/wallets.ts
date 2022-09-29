import { RailgunWallet } from '@railgun-community/engine/dist/wallet/railgun-wallet';
import { getAddress } from '@ethersproject/address';
import {
  RailgunWalletInfo,
  LoadRailgunWalletResponse,
  UnloadRailgunWalletResponse,
  TransactionHistorySerializedResponse,
  TransactionHistoryItem,
  RailgunWalletTokenAmount,
  RailgunWalletSendTokenAmount,
  RailgunWalletReceiveTokenAmount,
} from '@railgun-community/shared-models/dist/models/response-types';
import {
  EngineEvent,
  ScannedEventData,
} from '@railgun-community/engine/dist/models/event-types';
import { BytesData } from '@railgun-community/engine/dist/models/formatted-types';
import { getEngine, walletForID } from '../core/engine';
import { sendErrorMessage } from '../../../utils/logger';
import { onBalancesUpdate } from './balance-update';
import { BigNumber } from '@ethersproject/bignumber';
import { parseRailgunBalanceAddress } from '../util/bytes-util';
import {
  TransactionHistoryTransferTokenAmount,
  TransactionHistoryTokenAmount,
  TransactionHistoryEntry,
} from '@railgun-community/engine/dist/models/wallet-types';
import {
  AbstractWallet,
  WalletData,
} from '@railgun-community/engine/dist/wallet/abstract-wallet';
import { Chain } from '@railgun-community/engine/dist/models/engine-types';
import {
  networkForChain,
  NetworkName,
} from '@railgun-community/shared-models/dist/models/network-config';
import { AddressData } from '@railgun-community/engine/dist/key-derivation/bech32';
import { RailgunEngine } from '@railgun-community/engine/dist/railgun-engine';
import {
  ByteLength,
  hexlify,
  nToHex,
} from '@railgun-community/engine/dist/utils/bytes';

const subscribeToBalanceEvents = (wallet: AbstractWallet) => {
  wallet.on(EngineEvent.WalletScanComplete, ({ chain }: ScannedEventData) =>
    onBalancesUpdate(wallet, chain),
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
  isViewOnlyWallet?: boolean,
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
): Promise<RailgunWalletInfo> => {
  const engine = getEngine();
  const wallet = await engine.createWalletFromMnemonic(encryptionKey, mnemonic);
  subscribeToBalanceEvents(wallet);
  return infoForWallet(wallet);
};

const createViewOnlyWallet = async (
  encryptionKey: string,
  shareableViewingKey: string,
): Promise<RailgunWalletInfo> => {
  const engine = getEngine();
  const wallet = await engine.createViewOnlyWalletFromShareableViewingKey(
    encryptionKey,
    shareableViewingKey,
  );
  subscribeToBalanceEvents(wallet);
  return infoForWallet(wallet);
};

export const createRailgunWallet = async (
  encryptionKey: string,
  mnemonic: string,
): Promise<LoadRailgunWalletResponse> => {
  try {
    const railgunWalletInfo = await createWallet(encryptionKey, mnemonic);
    const response: LoadRailgunWalletResponse = { railgunWalletInfo };
    return response;
  } catch (err) {
    sendErrorMessage(err.stack);
    const response: LoadRailgunWalletResponse = {
      error: err.message,
    };
    return response;
  }
};

export const createViewOnlyRailgunWallet = async (
  encryptionKey: string,
  shareableViewingKey: string,
): Promise<LoadRailgunWalletResponse> => {
  try {
    const railgunWalletInfo = await createViewOnlyWallet(
      encryptionKey,
      shareableViewingKey,
    );
    const response: LoadRailgunWalletResponse = { railgunWalletInfo };
    return response;
  } catch (err) {
    sendErrorMessage(err.stack);
    const response: LoadRailgunWalletResponse = {
      error: err.message,
    };
    return response;
  }
};

export const loadWalletByID = async (
  encryptionKey: string,
  railgunWalletID: string,
  isViewOnlyWallet?: boolean,
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
    sendErrorMessage(err.stack);
    const response: LoadRailgunWalletResponse = {
      error: 'Could not load RAILGUN wallet.',
    };
    return response;
  }
};

export const unloadWalletByID = (
  railgunWalletID: string,
): UnloadRailgunWalletResponse => {
  try {
    const engine = getEngine();
    engine.unloadWallet(railgunWalletID);
    const response: UnloadRailgunWalletResponse = {};
    return response;
  } catch (err) {
    sendErrorMessage(err.stack);
    const response: UnloadRailgunWalletResponse = {
      error: 'Could not unload RAILGUN wallet.',
    };
    return response;
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

export const serializeRailgunWalletAddressData = (
  addressData: AddressData,
): { viewingPublicKey: string; masterPublicKey: string } => {
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

export const assertValidRailgunAddress = (
  address: string,
  networkName?: NetworkName,
): void => {
  if (!validateRailgunAddress(address)) {
    throw new Error('Invalid RAILGUN address.');
  }
  if (networkName) {
    const decoded = RailgunEngine.decodeAddress(address);
    if (decoded.chain) {
      const network = networkForChain(decoded.chain);
      if (network && network.name !== networkName) {
        throw new Error(
          `RAILGUN address ${address} can only accept tokens on network ${network.publicName}.`,
        );
      }
    }
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
  chain: Optional<Chain>,
  railgunWalletID: string,
): Optional<string> => {
  try {
    const wallet = walletForID(railgunWalletID);
    return wallet.getAddress(chain);
  } catch (err) {
    sendErrorMessage(err.stack);
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
    sendErrorMessage(err.stack);
    return undefined;
  }
};

const transactionHistoryReceiveTokenAmountToRailgunTokenAmount = (
  transactionHistoryTokenAmount: TransactionHistoryTokenAmount,
): RailgunWalletReceiveTokenAmount => {
  return {
    ...transactionHistoryTokenAmountToRailgunTokenAmount(
      transactionHistoryTokenAmount,
    ),
    memoText: transactionHistoryTokenAmount.memoText,
  };
};

const transactionHistoryTransferTokenAmountToRailgunTokenAmount = (
  transactionHistoryTokenAmount: TransactionHistoryTransferTokenAmount,
): RailgunWalletSendTokenAmount => {
  const walletSource = transactionHistoryTokenAmount.noteExtraData
    ? transactionHistoryTokenAmount.noteExtraData.walletSource
    : undefined;
  return {
    ...transactionHistoryTokenAmountToRailgunTokenAmount(
      transactionHistoryTokenAmount,
    ),
    recipientAddress: transactionHistoryTokenAmount.recipientAddress,
    memoText: transactionHistoryTokenAmount.memoText,
    walletSource,
  };
};

const transactionHistoryTokenAmountToRailgunTokenAmount = (
  transactionHistoryTokenAmount: TransactionHistoryTokenAmount,
): RailgunWalletTokenAmount => {
  return {
    tokenAddress: parseRailgunBalanceAddress(
      transactionHistoryTokenAmount.token,
    ).toLowerCase(),
    amountString: BigNumber.from(
      transactionHistoryTokenAmount.amount,
    ).toHexString(),
  };
};

const serializeTransactionHistory = (
  transactionHistory: TransactionHistoryEntry[],
): TransactionHistoryItem[] => {
  return transactionHistory.map(historyItem => ({
    txid: `0x${historyItem.txid}`,
    transferTokenAmounts: historyItem.transferTokenAmounts.map(
      transactionHistoryTransferTokenAmountToRailgunTokenAmount,
    ),
    relayerFeeTokenAmount: historyItem.relayerFeeTokenAmount
      ? transactionHistoryTokenAmountToRailgunTokenAmount(
          historyItem.relayerFeeTokenAmount,
        )
      : undefined,
    changeTokenAmounts: historyItem.changeTokenAmounts.map(
      transactionHistoryTokenAmountToRailgunTokenAmount,
    ),
    receiveTokenAmounts: historyItem.receiveTokenAmounts.map(
      transactionHistoryReceiveTokenAmountToRailgunTokenAmount,
    ),
    version: historyItem.version,
  }));
};

export const getWalletTransactionHistory = async (
  chain: Chain,
  railgunWalletID: string,
): Promise<TransactionHistorySerializedResponse> => {
  try {
    const wallet = walletForID(railgunWalletID);
    const transactionHistory = await wallet.getTransactionHistory(chain);
    return {
      items: serializeTransactionHistory(transactionHistory),
    };
  } catch (err) {
    sendErrorMessage(err.stack);
    const response: LoadRailgunWalletResponse = {
      error: 'Could not load RAILGUN wallet transaction history.',
    };
    return response;
  }
};
