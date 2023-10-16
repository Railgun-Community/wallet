import {
  ByteLength,
  RailgunTransaction,
  formatToByteLength,
} from '@railgun-community/engine';
import { GetRailgunTransactionsAfterGraphIDQuery } from './graphql';
import { graphTokenTypeToEngineTokenType } from '../quick-sync/graph-type-formatters';
import { getAddress } from 'ethers';

export type GraphRailgunTransactions =
  GetRailgunTransactionsAfterGraphIDQuery['transactions'];

export const formatRailgunTransactions = (
  txs: GraphRailgunTransactions,
): RailgunTransaction[] => {
  return txs.map(tx => {
    const unshield: RailgunTransaction['unshield'] = tx.hasUnshield
      ? {
          tokenData: {
            tokenType: graphTokenTypeToEngineTokenType(
              tx.unshieldToken.tokenType,
            ),
            tokenAddress: getAddress(tx.unshieldToken.tokenAddress),
            tokenSubID: tx.unshieldToken.tokenSubID,
          },
          toAddress: tx.unshieldToAddress,
          value: tx.unshieldValue,
        }
      : undefined;

    const railgunTransaction: RailgunTransaction = {
      graphID: tx.id,
      commitments: tx.commitments.map(commitment =>
        formatToByteLength(commitment, ByteLength.UINT_256, true),
      ),
      nullifiers: tx.nullifiers.map(nullifier =>
        formatToByteLength(nullifier, ByteLength.UINT_256, true),
      ),
      boundParamsHash: formatToByteLength(
        tx.boundParamsHash,
        ByteLength.UINT_256,
        true,
      ),
      blockNumber: Number(tx.blockNumber),
      timestamp: Number(tx.blockTimestamp),
      utxoTreeIn: Number(tx.utxoTreeIn),
      utxoTreeOut: Number(tx.utxoTreeOut),
      utxoBatchStartPositionOut: Number(tx.utxoBatchStartPositionOut),
      txid: formatToByteLength(tx.transactionHash, ByteLength.UINT_256, false),
      unshield,
    };
    return railgunTransaction;
  });
};
