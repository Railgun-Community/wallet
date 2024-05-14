import { ByteLength, ByteUtils } from '@railgun-community/engine';

export const parseRailgunTokenAddress = (tokenAddress: string): string => {
  return ByteUtils.formatToByteLength(tokenAddress, ByteLength.Address, true);
};

export const getRandomBytes = (length: number): string => {
  return ByteUtils.randomHex(length);
};

export const bytesToHex = (bytes: Uint8Array): string => {
  return Buffer.from(bytes).toString('hex');
};

export { ByteLength, ByteUtils };
