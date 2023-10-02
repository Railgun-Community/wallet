import {
  TXOsReceivedPOIStatusInfo,
  TXOsSpentPOIStatusInfo,
} from '@railgun-community/engine';
import { walletForID } from '../railgun/core';
import {
  NETWORK_CONFIG,
  NetworkName,
  TXIDVersion,
} from '@railgun-community/shared-models';

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

export const generatePOIForWalletAndRailgunTxid = (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  walletID: string,
  railgunTxid: string,
): Promise<void> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  const wallet = walletForID(walletID);
  return wallet.generatePOIsAllSentCommitmentsAndUnshieldEvents(
    chain,
    txidVersion,
    railgunTxid,
  );
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
