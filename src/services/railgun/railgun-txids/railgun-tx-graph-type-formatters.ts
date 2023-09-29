import { RailgunTransaction } from '@railgun-community/engine';
import { GetRailgunTransactionsAfterGraphIDQuery } from './graphql';

export type GraphRailgunTransactions =
  GetRailgunTransactionsAfterGraphIDQuery['transactionInterfaces'];

export const formatRailgunTransactionsV2 = (
  txs: GraphRailgunTransactions,
): RailgunTransaction[] => {
  return txs.map(tx => {
    return {
      graphID: tx.id,
      commitments: tx.commitments,
      nullifiers: tx.nullifiers,
      boundParamsHash: tx.boundParamsHash,
      blockNumber: Number(tx.blockNumber),
      utxoTreeIn: undefined, // V3 will need this param
      globalStartPositionOut: undefined, // V3 will need this param
    };
  });
};
