import { ArtifactGetter, PublicInputs } from '@railgun-community/engine';
import {
  Artifact,
  assertArtifactExists,
} from '@railgun-community/shared-models';
import { ArtifactDownloader } from '../../artifacts/artifact-downloader';
import { ArtifactStore } from '../../artifacts/artifact-store';
import { getArtifactVariantString } from '../../artifacts/artifact-util';

let artifactStore: ArtifactStore;
let useNativeArtifacts: boolean;

export const artifactCache: MapType<Artifact> = {};

export const setArtifactStore = (store: ArtifactStore) => {
  artifactStore = store;
};
export const setUseNativeArtifacts = (useNative: boolean) => {
  useNativeArtifacts = useNative;
};

export const getArtifacts = async (inputs: PublicInputs): Promise<Artifact> => {
  const nullifiers = inputs.nullifiers.length;
  const commitments = inputs.commitmentsOut.length;
  assertArtifactExists(nullifiers, commitments);

  const artifactVariantString = getArtifactVariantString(
    nullifiers,
    commitments,
  );

  // Use artifact in cache if available.
  if (artifactCache[artifactVariantString]) {
    return artifactCache[artifactVariantString];
  }

  const downloader = new ArtifactDownloader(artifactStore, useNativeArtifacts);

  // Try to pull previously downloaded from storage.
  try {
    const downloadedArtifacts = await downloader.getDownloadedArtifacts(
      artifactVariantString,
    );
    artifactCache[artifactVariantString] = downloadedArtifacts;
    return downloadedArtifacts;
  } catch (err) {
    // No op. Artifacts not yet downloaded.
  }

  // Download anew. Throws upon error.
  await downloader.downloadArtifacts(artifactVariantString);
  const downloadedArtifacts = await downloader.getDownloadedArtifacts(
    artifactVariantString,
  );
  artifactCache[artifactVariantString] = downloadedArtifacts;
  return downloadedArtifacts;
};

export const artifactGetterDownloadJustInTime: ArtifactGetter = {
  assertArtifactExists,
  getArtifacts,
};

export const overrideArtifact = (
  artifactVariant: string,
  artifact: Artifact,
) => {
  artifactCache[artifactVariant] = artifact;
};

export const clearArtifactCache = () => {
  for (const key in artifactCache) {
    if (artifactCache[key]) {
      delete artifactCache[key];
    }
  }
};
