import { createHash } from 'crypto';
import { ArtifactName, isDefined } from '@railgun-community/shared-models';
import { sha256 } from 'ethereum-cryptography/sha256.js';
import { sendErrorMessage } from '../../utils/logger';
import ARTIFACT_V2_HASHES from './json/artifact-v2-hashes.json';
import { ByteUtils } from '@railgun-community/engine';
import { isReactNative } from '../railgun/util/runtime';

type ArtifactHashesJson = Record<
  string,
  Record<ArtifactName.DAT | ArtifactName.WASM | ArtifactName.ZKEY, string>
>;

const getExpectedArtifactHash = (
  artifactName: ArtifactName,
  artifactVariantString: string,
): string => {
  const hashes = ARTIFACT_V2_HASHES as ArtifactHashesJson;
  const variantHashes = hashes[artifactVariantString];
  if (!isDefined(variantHashes)) {
    throw new Error(
      `No hashes for variant ${artifactName}: ${artifactVariantString}`,
    );
  }
  if (artifactName === ArtifactName.VKEY) {
    throw new Error(`No artifact hashes for vkey.`);
  }
  const hash = variantHashes[artifactName];
  if (!hash) {
    throw new Error(
      `No hash for artifact ${artifactName}: ${artifactVariantString}`,
    );
  }
  return hash;
};

const getDataBytes = (data: Uint8Array | Buffer | string): Uint8Array => {
  if (data instanceof Uint8Array) {
    return data;
  }
  if (Buffer.isBuffer(data)) {
    return data.buffer as Uint8Array;
  }
  return ByteUtils.hexStringToBytes(data);
};

export const validateArtifactDownload = async (
  data: Uint8Array | Buffer | string,
  artifactName: ArtifactName,
  artifactVariantString: string,
): Promise<boolean> => {
  if (artifactName === ArtifactName.VKEY) {
    return true;
  }
  const dataBytes = getDataBytes(data);
  const hash = isReactNative
    ? ByteUtils.hexlify(sha256(dataBytes))
    : createHash('sha256').update(dataBytes).digest('hex');
  const expectedHash = getExpectedArtifactHash(
    artifactName,
    artifactVariantString,
  );
  if (hash !== expectedHash) {
    sendErrorMessage(
      `Validate artifact blob for ${artifactName}: ${artifactVariantString}. Got ${hash}, expected ${expectedHash}.`,
    );
  }
  return hash === expectedHash;
};
