import { ArtifactGetter, PublicInputs } from '@railgun-community/engine';
import {
  Artifact,
  assertArtifactExists,
  ipfsHashForArtifact,
} from '@railgun-community/shared-models';
import { ArtifactDownloader } from '../../artifacts/artifact-downloader';
import { ArtifactStore } from '../../artifacts/artifact-store';

let artifactStore: ArtifactStore;
let useNativeArtifacts: boolean;

export const artifactCache: MapType<Artifact> = {};

export const setArtifactStore = (store: ArtifactStore) => {
  artifactStore = store;
};
export const setUseNativeArtifacts = (native: boolean) => {
  useNativeArtifacts = native;
};

export const getArtifacts = async (inputs: PublicInputs): Promise<Artifact> => {
  const nullifiers = inputs.nullifiers.length;
  const commitments = inputs.commitmentsOut.length;
  assertArtifactExists(nullifiers, commitments);

  const artifactIPFSHash = ipfsHashForArtifact(nullifiers, commitments);

  // Use artifact in cache if available.
  if (artifactCache[artifactIPFSHash]) {
    return artifactCache[artifactIPFSHash];
  }

  const downloader = new ArtifactDownloader(artifactStore, useNativeArtifacts);

  // Try to pull previously downloaded from storage.
  try {
    const downloadedArtifacts = await downloader.getDownloadedArtifacts(
      artifactIPFSHash,
    );
    artifactCache[artifactIPFSHash] = downloadedArtifacts;
    return downloadedArtifacts;
  } catch (err) {
    // No op. Artifacts not yet downloaded.
  }

  // Download anew. Throws upon error.
  await downloader.downloadArtifacts(artifactIPFSHash);
  const downloadedArtifacts = await downloader.getDownloadedArtifacts(
    artifactIPFSHash,
  );
  artifactCache[artifactIPFSHash] = downloadedArtifacts;
  return downloadedArtifacts;
};

export const artifactGetterDownloadJustInTime: ArtifactGetter = {
  assertArtifactExists,
  getArtifacts,
};

export const overrideArtifact = (
  artifactVariant: string,
  artifactGroup: Artifact,
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
