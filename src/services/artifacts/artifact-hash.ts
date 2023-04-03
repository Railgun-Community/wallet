import { ArtifactName } from '@railgun-community/shared-models';
import { createHash } from 'crypto';
import { sendErrorMessage } from '../../utils/logger';
import ARTIFACT_V2_HASHES from './json/artifact-v2-hashes.json';

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
  if (!variantHashes) {
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
  const hash = createHash('sha256').update(data).digest('hex');
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
