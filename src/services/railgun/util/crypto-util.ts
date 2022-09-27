import * as ed from '@noble/ed25519';
import {
  hexlify,
  hexStringToBytes,
} from '@railgun-community/engine/dist/utils/bytes';
import { EncryptDataWithSharedKeyResponse } from '@railgun-community/shared-models/dist/models/response-types';
import {
  encryptJSONDataWithSharedKey,
  tryDecryptJSONDataWithSharedKey,
} from '@railgun-community/engine/dist/utils/ecies';
import {
  getPublicViewingKey,
  verifyED25519,
} from '@railgun-community/engine/dist/utils/keys-utils';
import { EncryptedData } from '@railgun-community/engine/dist/models/formatted-types';
import { getRandomBytes } from './bytes-util';

export const verifyRelayerSignature = (
  signature: Uint8Array,
  data: Uint8Array,
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
): Promise<object | null> => {
  return tryDecryptJSONDataWithSharedKey(encryptedData, sharedKey);
};
