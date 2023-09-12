import {
  randomHex,
  formatToByteLength,
  ByteLength,
  hexlify,
  fromUTF8String,
  toUTF8String,
  hexStringToBytes,
  nToHex,
  hexToBigInt,
  numberify,
} from '@railgun-community/engine';

export const parseRailgunTokenAddress = (tokenAddress: string): string => {
  return formatToByteLength(tokenAddress, ByteLength.Address, true);
};

export const getRandomBytes = (length: number): string => {
  return randomHex(length);
};

export const bytesToHex = (bytes: Uint8Array): string => {
  return Buffer.from(bytes).toString('hex');
};

export {
  nToHex,
  hexToBigInt,
  numberify,
  hexlify,
  fromUTF8String,
  toUTF8String,
  hexStringToBytes,
  ByteLength,
};
