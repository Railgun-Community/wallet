import { ArtifactName, isDefined } from '@railgun-community/shared-models';
import { sha256 } from 'ethereum-cryptography/sha256.js';
import { sendErrorMessage } from '../../utils/logger';
import ARTIFACT_V2_HASHES from './json/artifact-v2-hashes.json';
import { hexStringToBytes, hexlify } from '@railgun-community/engine';

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

export const validateArtifactDownload = async (
  data: Buffer | string,
  artifactName: ArtifactName,
  artifactVariantString: string,
): Promise<boolean> => {
  if (artifactName === ArtifactName.VKEY) {
    return true;
  }
  const dataBytes = Buffer.isBuffer(data)
    ? new Uint8Array(data.buffer)
    : hexStringToBytes(data);
  const hash = hexlify(sha256(dataBytes));
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
