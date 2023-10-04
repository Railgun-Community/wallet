import {
  ByteLength,
  RailgunTransaction,
  formatToByteLength,
  getTokenDataHash,
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
    const unshieldTokenHash = tx.hasUnshield
      ? getTokenDataHash({
          tokenType: graphTokenTypeToEngineTokenType(tx.token.tokenType),
          tokenAddress: getAddress(tx.token.tokenAddress),
          tokenSubID: tx.token.tokenSubID,
        })
      : undefined;

    return {
      graphID: tx.id,
      commitments: tx.commitments,
      nullifiers: tx.nullifiers,
      boundParamsHash: tx.boundParamsHash,
      blockNumber: Number(tx.blockNumber),
      utxoTreeIn: Number(tx.utxoTreeIn),
      utxoTreeOut: Number(tx.utxoTreeOut),
      utxoBatchStartPositionOut: Number(tx.utxoBatchStartPositionOut),
      txid: formatToByteLength(tx.transactionHash, ByteLength.UINT_256, false),
      hasUnshield: tx.hasUnshield,
      unshieldTokenHash,
    };
  });
};
