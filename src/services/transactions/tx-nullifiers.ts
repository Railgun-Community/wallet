import {
  Chain,
  RailgunTxidFromNullifiersResponse,
  TXIDVersion,
} from '@railgun-community/shared-models';
import { reportAndSanitizeError } from '../../utils/error';
import { getEngine } from '../railgun/core/engine';

export const getCompletedTxidFromNullifiers = async (
  txidVersion: TXIDVersion,
  chain: Chain,
  nullifiers: string[],
): Promise<RailgunTxidFromNullifiersResponse> => {
  try {
    const engine = getEngine();
    const txid: Optional<string> = await engine.getCompletedTxidFromNullifiers(
      txidVersion,
      chain,
      nullifiers,
    );
    return { txid };
  } catch (err) {
    throw reportAndSanitizeError(getCompletedTxidFromNullifiers.name, err);
  }
};
