import { RailgunTransaction } from '@railgun-community/engine';
import { PoiMessageHashesQuery } from './graphql';

type GraphRailgunTransactions = PoiMessageHashesQuery['transactionInterfaces'];

export const formatRailgunTransactions = (
  txs: GraphRailgunTransactions,
): RailgunTransaction[] => {
  return txs.map(tx => {
    return {
      graphID: tx.id,
      commitments: tx.commitments,
      nullifiers: tx.nullifiers,
      boundParamsHash: tx.boundParamsHash,
    };
  });
};
