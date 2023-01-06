import { sanitizeError } from '@railgun-community/shared-models';
import { sendErrorMessage } from './logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reportAndSanitizeError = (err: Error | any): Error => {
  if (err instanceof Error) {
    const error = sanitizeError(err);
    sendErrorMessage(error);
    return error;
  }

  const error = new Error('Unknown error.');
  sendErrorMessage(error);
  return error;
};
