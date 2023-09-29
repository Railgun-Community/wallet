import {
  NETWORK_CONFIG,
  NetworkName,
  TXIDVersion,
} from '@railgun-community/shared-models';
import { getEngine } from '../core';

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

export const fullResetTXIDMerkletrees = async (networkName: NetworkName) => {
  const chain = NETWORK_CONFIG[networkName].chain;
  return getEngine().fullResetTXIDMerkletrees(chain);
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
