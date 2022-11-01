import { PublicInputs } from '@railgun-community/engine';
import {
  ArtifactGroup,
  ArtifactVariant,
} from '@railgun-community/shared-models';
import { ArtifactDownloader } from '../../artifacts/artifact-downloader';
import { ArtifactStore } from '../../artifacts/artifact-store';

let artifactStore: ArtifactStore;
let useNativeArtifacts: boolean;

export const artifactCache: MapType<ArtifactGroup> = {};

export const setArtifactStore = (store: ArtifactStore) => {
  artifactStore = store;
};
export const setUseNativeArtifacts = (native: boolean) => {
  useNativeArtifacts = native;
};

const artifactVariantExists = (artifactVariant: ArtifactVariant) => {
  return Object.values(ArtifactVariant).includes(artifactVariant);
};

const getArtifactVariant = (inputs: PublicInputs): ArtifactVariant => {
  const artifactVariant =
    `${inputs.nullifiers.length}x${inputs.commitmentsOut.length}` as ArtifactVariant;
  if (!artifactVariantExists(artifactVariant)) {
    throw new Error(
      `Circuit not supported by RAILGUN at this time: ${inputs.nullifiers.length}x${inputs.commitmentsOut.length}. If unshielding, try exact amount in wallet. Or, select a different Relayer fee token.`,
    );
  }
  return artifactVariant;
};

export const artifactsGetter = async (
  inputs: PublicInputs,
): Promise<ArtifactGroup> => {
  const artifactVariant = getArtifactVariant(inputs);

  // Use artifact in cache if available.
  if (artifactCache[artifactVariant]) {
    return artifactCache[artifactVariant];
  }

  const downloader = new ArtifactDownloader(artifactStore, useNativeArtifacts);

  // Try to pull previously downloaded from storage.
  try {
    const downloadedArtifacts = await downloader.getDownloadedArtifacts(
      artifactVariant,
    );
    artifactCache[artifactVariant] = downloadedArtifacts;
    return downloadedArtifacts;
  } catch (err) {
    // No op. Artifacts not yet downloaded.
  }

  // Download anew. Throws upon error.
  await downloader.downloadArtifactsForVariant(artifactVariant);
  const downloadedArtifacts = await downloader.getDownloadedArtifacts(
    artifactVariant,
  );
  artifactCache[artifactVariant] = downloadedArtifacts;
  return downloadedArtifacts;
};

export const overrideArtifact = (
  artifactVariant: ArtifactVariant,
  artifactGroup: ArtifactGroup,
) => {
  artifactCache[artifactVariant] = artifactGroup;
};

export const clearArtifactCache = () => {
  for (const key in artifactCache) {
    if (artifactCache[key]) {
      delete artifactCache[key];
    }
  }
};
