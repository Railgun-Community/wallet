import { NETWORK_CONFIG, NetworkName } from '@railgun-community/shared-models';
import { getEngine } from './engine';

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
) => {
  const engine = getEngine();
  const { chain } = NETWORK_CONFIG[networkName];
  const shieldCommitments = await engine.getAllShieldCommitments(
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
