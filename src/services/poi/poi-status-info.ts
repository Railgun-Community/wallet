import {
  TXOsReceivedPOIStatusInfo,
  TXOsSpentPOIStatusInfo,
} from '@railgun-community/engine';
import { walletForID } from '../railgun/core';
import { NETWORK_CONFIG, NetworkName } from '@railgun-community/shared-models';

export const getTXOsReceivedPOIStatusInfoForWallet = (
  networkName: NetworkName,
  walletID: string,
): Promise<TXOsReceivedPOIStatusInfo[]> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  const wallet = walletForID(walletID);
  return wallet.getTXOsReceivedPOIStatusInfo(chain);
};

export const getTXOsSpentPOIStatusInfoForWallet = (
  networkName: NetworkName,
  walletID: string,
): Promise<TXOsSpentPOIStatusInfo[]> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  const wallet = walletForID(walletID);
  return wallet.getTXOsSpentPOIStatusInfo(chain);
};

export const generatePOIForWalletAndRailgunTxid = (
  networkName: NetworkName,
  walletID: string,
  railgunTxid: string,
): Promise<void> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  const wallet = walletForID(walletID);
  return wallet.generatePOIsAllSentCommitmentsAndUnshieldEvents(
    chain,
    railgunTxid,
  );
};

export const refreshReceivePOIsForWallet = (
  networkName: NetworkName,
  walletID: string,
  railgunTxid?: string,
): Promise<void> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  const wallet = walletForID(walletID);
  return wallet.refreshReceivePOIsAllTXOs(chain, railgunTxid);
};

export const refreshSpentPOIsForWallet = (
  networkName: NetworkName,
  walletID: string,
  railgunTxid?: string,
): Promise<void> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  const wallet = walletForID(walletID);
  return wallet.refreshSpentPOIsAllSentCommitmentsAndUnshieldEvents(
    chain,
    railgunTxid,
  );
};
