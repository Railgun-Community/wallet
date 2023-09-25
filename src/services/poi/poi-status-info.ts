import {
  TXOsReceivedPOIStatusInfo,
  TXOsSpentPOIStatusInfo,
  POIsPerList,
} from '@railgun-community/engine';
import { walletForID } from '../railgun';
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

export { TXOsReceivedPOIStatusInfo, TXOsSpentPOIStatusInfo, POIsPerList };
