import { sanitizeError } from '@railgun-community/shared-models';
import { sendErrorMessage } from './logger';

export const reportAndSanitizeError = (
  func: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: Error | any,
): Error => {
  sendErrorMessage(`Caught error in RAILGUN Wallet SDK: ${func}`);

  if (err instanceof Error) {
    const error = sanitizeError(err);
    sendErrorMessage(error);
    return error;
  }

  const error = new Error('Unknown error.');
  sendErrorMessage(error);
  return error;
};
