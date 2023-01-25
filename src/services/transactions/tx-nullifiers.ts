import {
  Chain,
  RailgunTxidFromNullifiersResponse,
} from '@railgun-community/shared-models';
import { reportAndSanitizeError } from '../../utils/error';
import { getEngine } from '../railgun';

export const getCompletedTxidFromNullifiers = async (
  chain: Chain,
  nullifiers: string[],
): Promise<RailgunTxidFromNullifiersResponse> => {
  try {
    const engine = getEngine();
    const txid: Optional<string> = await engine.getCompletedTxidFromNullifiers(
      chain,
      nullifiers,
    );
    return { txid };
  } catch (err) {
    const sanitizedError = reportAndSanitizeError(err);
    const response: RailgunTxidFromNullifiersResponse = {
      error: sanitizedError.message,
    };
    return response;
  }
};
