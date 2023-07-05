import * as ed from '@noble/ed25519';
import {
  arrayify,
  hexlify,
  hexStringToBytes,
  encryptJSONDataWithSharedKey,
  tryDecryptJSONDataWithSharedKey,
  getPublicViewingKey,
  verifyED25519,
  EncryptedData,
  ViewingKeyPair,
} from '@railgun-community/engine';
import { EncryptDataWithSharedKeyResponse } from '@railgun-community/shared-models';
import { getRandomBytes } from './bytes';
import { pbkdf2 as _pbkdf2 } from 'ethereum-cryptography/pbkdf2.js';

export const verifyRelayerSignature = (
  signature: string | Uint8Array,
  data: string | Uint8Array,
  signingKey: Uint8Array,
): Promise<boolean> => {
  return verifyED25519(data, signature, signingKey);
};

export const encryptDataWithSharedKey = async (
  data: object,
  externalPubKey: Uint8Array,
): Promise<EncryptDataWithSharedKeyResponse> => {
  const randomPrivKey = hexStringToBytes(getRandomBytes(32));
  const randomPubKeyUint8Array = await getPublicViewingKey(randomPrivKey);
  const randomPubKey = hexlify(randomPubKeyUint8Array);
  const sharedKey = await ed.getSharedSecret(randomPrivKey, externalPubKey);
  const encryptedData = encryptJSONDataWithSharedKey(data, sharedKey);
  return { encryptedData, randomPubKey, sharedKey };
};

export const decryptAESGCM256 = (
  encryptedData: EncryptedData,
  sharedKey: Uint8Array,
): object | null => {
  return tryDecryptJSONDataWithSharedKey(encryptedData, sharedKey);
};

export const encryptAESGCM256 = (
  data: object,
  sharedKey: Uint8Array,
): EncryptedData => {
  return encryptJSONDataWithSharedKey(data, sharedKey);
};

/**
 * Calculates PBKDF2 hash
 * @param secret - input
 * @param salt - salt
 * @param iterations - rounds
 */
export const pbkdf2 = async (
  secret: string,
  salt: string,
  iterations: number,
): Promise<string> => {
  const secretBuffer = Buffer.from(secret, 'utf-8');
  const secretFormatted = new Uint8Array(arrayify(secretBuffer));
  const saltFormatted = new Uint8Array(arrayify(salt));

  const keyLength = 32; // Bytes
  const digest = 'sha256';

  const key: Uint8Array = await _pbkdf2(
    secretFormatted,
    saltFormatted,
    iterations,
    keyLength,
    digest,
  );
  return hexlify(key);
};

export {
  encryptJSONDataWithSharedKey,
  tryDecryptJSONDataWithSharedKey,
  EncryptedData,
  getPublicViewingKey,
  ViewingKeyPair,
};
