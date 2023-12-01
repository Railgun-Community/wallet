import {
  NETWORK_CONFIG,
  NetworkName,
  TXIDVersion,
  isDefined,
} from '@railgun-community/shared-models';
import { getEngine, getTXIDMerkletreeForNetwork } from '../core';

export const validateRailgunTxidMerkleroot = (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  tree: number,
  index: number,
  merkleroot: string,
): Promise<boolean> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  return getEngine().validateHistoricalRailgunTxidMerkleroot(
    txidVersion,
    chain,
    tree,
    index,
    merkleroot,
  );
};

export const validateRailgunTxidOccurredBeforeBlockNumber = (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  tree: number,
  index: number,
  blockNumber: number,
): Promise<boolean> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  return getEngine().validateRailgunTxidOccurredBeforeBlockNumber(
    txidVersion,
    chain,
    tree,
    index,
    blockNumber,
  );
};

export const validateRailgunTxidExists = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunTxid: string,
) => {
  const txidMerkletree = getTXIDMerkletreeForNetwork(txidVersion, networkName);
  const railgunTransaction = await txidMerkletree.getRailgunTransactionByTxid(
    railgunTxid,
  );
  return isDefined(railgunTransaction);
};

export const getGlobalUTXOTreePositionForRailgunTransactionCommitment = (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  tree: number,
  index: number,
  commitmentHash: string,
): Promise<number> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  return getEngine().getGlobalUTXOTreePositionForRailgunTransactionCommitment(
    txidVersion,
    chain,
    tree,
    index,
    commitmentHash,
  );
};

export const syncRailgunTransactionsV2 = async (
  networkName: NetworkName,
): Promise<void> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  return getEngine().syncRailgunTransactionsV2(chain, 'manual trigger');
};

export const fullResetTXIDMerkletreesV2 = async (networkName: NetworkName) => {
  const chain = NETWORK_CONFIG[networkName].chain;
  return getEngine().fullResetTXIDMerkletreesV2(chain);
};

export const resetRailgunTxidsAfterTxidIndex = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  txidIndex: number,
): Promise<void> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  return getEngine().resetRailgunTxidsAfterTxidIndex(
    txidVersion,
    chain,
    txidIndex,
  );
};

export const getLatestRailgunTxidData = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
): Promise<{
  txidIndex: number;
  merkleroot: string;
}> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  return getEngine().getLatestRailgunTxidData(txidVersion, chain);
};

export const getRailgunTxidMerkleroot = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  tree: number,
  index: number,
) => {
  const chain = NETWORK_CONFIG[networkName].chain;
  return getEngine().getHistoricalRailgunTxidMerkleroot(
    txidVersion,
    chain,
    tree,
    index,
  );
};
