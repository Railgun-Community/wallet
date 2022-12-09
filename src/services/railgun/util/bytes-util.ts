import {
  randomHex,
  formatToByteLength,
  ByteLength,
} from '@railgun-community/engine';

export const parseRailgunBalanceAddress = (tokenAddress: string): string => {
  return formatToByteLength(tokenAddress, ByteLength.Address, true);
};

export const getRandomBytes = (length: number): string => {
  return randomHex(length);
};
