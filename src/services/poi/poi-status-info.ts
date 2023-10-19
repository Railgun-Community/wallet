import {
  TXOsReceivedPOIStatusInfo,
  TXOsSpentPOIStatusInfo,
} from '@railgun-community/engine';
import {
  NETWORK_CONFIG,
  NetworkName,
  TXIDVersion,
} from '@railgun-community/shared-models';
import { walletForID } from '../railgun/wallets/wallets';

export const getTXOsReceivedPOIStatusInfoForWallet = (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  walletID: string,
): Promise<TXOsReceivedPOIStatusInfo[]> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  const wallet = walletForID(walletID);
  return wallet.getTXOsReceivedPOIStatusInfo(txidVersion, chain);
};

export const getTXOsSpentPOIStatusInfoForWallet = (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  walletID: string,
): Promise<TXOsSpentPOIStatusInfo[]> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  const wallet = walletForID(walletID);
  return wallet.getTXOsSpentPOIStatusInfo(txidVersion, chain);
};

export const generatePOIsForWalletAndRailgunTxid = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  walletID: string,
  railgunTxid: string,
): Promise<void> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  const wallet = walletForID(walletID);
  await wallet.generatePOIsForRailgunTxid(chain, txidVersion, railgunTxid);
};

export const generatePOIsForWallet = async (
  networkName: NetworkName,
  walletID: string,
): Promise<void> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  const wallet = walletForID(walletID);
  await wallet.refreshPOIsForAllTXIDVersions(chain);
};

export const refreshReceivePOIsForWallet = (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  walletID: string,
): Promise<void> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  const wallet = walletForID(walletID);
  return wallet.refreshReceivePOIsAllTXOs(txidVersion, chain);
};

export const refreshSpentPOIsForWallet = (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  walletID: string,
  railgunTxid?: string,
): Promise<void> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  const wallet = walletForID(walletID);
  return wallet.refreshSpentPOIsAllSentCommitmentsAndUnshieldEvents(
    txidVersion,
    chain,
    railgunTxid,
  );
};

export const getChainTxidsStillPendingSpentPOIs = (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  walletID: string,
): Promise<string[]> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  const wallet = walletForID(walletID);
  return wallet.getChainTxidsStillPendingSpentPOIs(txidVersion, chain);
};

export const getSpendableReceivedChainTxids = (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  walletID: string,
): Promise<string[]> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  const wallet = walletForID(walletID);
  return wallet.getSpendableReceivedChainTxids(txidVersion, chain);
};
