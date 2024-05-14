import {
  ByteLength,
  RailgunTransactionV2,
  RailgunTransactionVersion,
  ByteUtils,
} from '@railgun-community/engine';
import { GetRailgunTransactionsAfterGraphIDQuery } from './graphql';
import { getAddress } from 'ethers';
import { graphTokenTypeToEngineTokenType } from '../quick-sync/shared-formatters';

export type GraphRailgunTransactions =
  GetRailgunTransactionsAfterGraphIDQuery['transactions'];

export const formatRailgunTransactions = (
  txs: GraphRailgunTransactions,
): RailgunTransactionV2[] => {
  return txs.map(tx => {
    const unshield: RailgunTransactionV2['unshield'] = tx.hasUnshield
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

    const railgunTransaction: RailgunTransactionV2 = {
      version: RailgunTransactionVersion.V2,
      graphID: tx.id,
      commitments: tx.commitments.map(commitment =>
        ByteUtils.formatToByteLength(commitment, ByteLength.UINT_256, true),
      ),
      nullifiers: tx.nullifiers.map(nullifier =>
        ByteUtils.formatToByteLength(nullifier, ByteLength.UINT_256, true),
      ),
      boundParamsHash: ByteUtils.formatToByteLength(
        tx.boundParamsHash,
        ByteLength.UINT_256,
        true,
      ),
      blockNumber: Number(tx.blockNumber),
      timestamp: Number(tx.blockTimestamp),
      utxoTreeIn: Number(tx.utxoTreeIn),
      utxoTreeOut: Number(tx.utxoTreeOut),
      utxoBatchStartPositionOut: Number(tx.utxoBatchStartPositionOut),
      txid: ByteUtils.formatToByteLength(
        tx.transactionHash,
        ByteLength.UINT_256,
        false,
      ),
      unshield,
      verificationHash: ByteUtils.formatToByteLength(
        tx.verificationHash,
        ByteLength.UINT_256,
        true,
      ),
    };
    return railgunTransaction;
  });
};
