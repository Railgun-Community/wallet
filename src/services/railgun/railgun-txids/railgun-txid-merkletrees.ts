import { NETWORK_CONFIG, NetworkName } from '@railgun-community/shared-models';
import { getEngine } from '../core';

export const validateRailgunTxidMerkleroot = (
  networkName: NetworkName,
  tree: number,
  index: number,
  merkleroot: string,
): Promise<boolean> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  return getEngine().validateHistoricalRailgunTxidMerkleroot(
    chain,
    tree,
    index,
    merkleroot,
  );
};

export const fullResetRailgunTxidMerkletrees = async (
  networkName: NetworkName,
) => {
  const chain = NETWORK_CONFIG[networkName].chain;
  return getEngine().fullResetRailgunTxidMerkletrees(chain);
};

export const resetRailgunTxidsAfterTxidIndex = async (
  networkName: NetworkName,
  txidIndex: number,
): Promise<void> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  return getEngine().resetRailgunTxidsAfterTxidIndex(chain, txidIndex);
};

export const getLatestRailgunTxidData = async (
  networkName: NetworkName,
): Promise<{
  txidIndex: number;
  merkleroot: string;
}> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  return getEngine().getLatestRailgunTxidData(chain);
};

export const getRailgunTxidMerkleroot = async (
  networkName: NetworkName,
  tree: number,
  index: number,
) => {
  const chain = NETWORK_CONFIG[networkName].chain;
  return getEngine().getHistoricalRailgunTxidMerkleroot(chain, tree, index);
};
