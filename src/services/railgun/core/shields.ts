import {
  NETWORK_CONFIG,
  NetworkName,
  TXIDVersion,
} from '@railgun-community/shared-models';
import { getEngine } from './engine';
import { ACTIVE_TXID_VERSIONS } from '@railgun-community/engine';

export type ShieldData = {
  txid: string;
  commitmentHash: string;
  npk: string;
  timestamp: Optional<number>;
  blockNumber: number;
  utxoTree: number;
  utxoIndex: number;
};

export const getAllShields = async (
  networkName: NetworkName,
  startingBlock: number,
): Promise<ShieldData[]> => {
  const shieldsForEachTxidVersion = await Promise.all(
    ACTIVE_TXID_VERSIONS.map(async txidVersion => {
      const shields = await getShieldsForTXIDVersion(
        txidVersion,
        networkName,
        startingBlock,
      );

      return shields;
    }),
  );
  return shieldsForEachTxidVersion.flat();
};

export const getShieldsForTXIDVersion = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  startingBlock: number,
): Promise<ShieldData[]> => {
  const engine = getEngine();
  const { chain } = NETWORK_CONFIG[networkName];
  const shieldCommitments = await engine.getAllShieldCommitments(
    txidVersion,
    chain,
    startingBlock,
  );

  return shieldCommitments.map(commitment => {
    const shieldData: ShieldData = {
      txid: `0x${commitment.txid}`,
      commitmentHash: `0x${commitment.hash}`,
      npk: `0x${commitment.preImage.npk}`,
      utxoTree: commitment.utxoTree,
      utxoIndex: commitment.utxoIndex,
      timestamp: commitment.timestamp,
      blockNumber: commitment.blockNumber,
    };
    return shieldData;
  });
};
