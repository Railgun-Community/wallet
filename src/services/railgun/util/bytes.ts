import {
  ByteLength,
  ByteUtils,
  fromUTF8String,
  toUTF8String,
  Database,
} from '@railgun-community/engine';

export const parseRailgunTokenAddress = (tokenAddress: string): string => {
  return ByteUtils.formatToByteLength(tokenAddress, ByteLength.Address, true);
};

export const getRandomBytes = (length: number): string => {
  return ByteUtils.randomHex(length);
};

export const bytesToHex = (bytes: Uint8Array): string => {
  return Buffer.from(bytes).toString('hex');
};

export { ByteLength, ByteUtils, fromUTF8String, toUTF8String, Database };
