import { ContractTransaction } from 'ethers';
import { sendErrorMessage } from './logger';

export const compareStringArrays = (
  a: Optional<string[]>,
  b: Optional<string[]>,
): boolean => {
  if (!a && !b) {
    return true;
  }
  if (!a || !b || a.length !== b.length) {
    return false;
  }
  for (const el of a) {
    if (!b.includes(el)) {
      return false;
    }
  }
  return true;
};

export const compareContractTransactionArrays = (
  a: Optional<ContractTransaction[]>,
  b: Optional<ContractTransaction[]>,
): boolean => {
  if (!a && !b) {
    return true;
  }
  if (!a || !b || a.length !== b.length) {
    return false;
  }
  try {
    for (let i = 0; i < a.length; i += 1) {
      for (const key of Object.keys(a[i])) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if ((a[i] as any)[key] !== (b[i] as any)[key]) {
          return false;
        }
      }
    }
  } catch (err) {
    if (!(err instanceof Error)) {
      throw new Error('Non-error thrown in compareContractTransactionArrays', {
        cause: err,
      });
    }
    sendErrorMessage(
      `Could not compare contract transaction arrays: ${err.message}`,
    );
    return false;
  }

  return true;
};
