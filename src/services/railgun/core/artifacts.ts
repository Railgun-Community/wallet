import { ArtifactGetter, PublicInputsRailgun } from '@railgun-community/engine';
import {
  Artifact,
  assertArtifactExists,
  isDefined,
} from '@railgun-community/shared-models';
import { ArtifactDownloader } from '../../artifacts/artifact-downloader';
import { ArtifactStore } from '../../artifacts/artifact-store';
import {
  getArtifactVariantString,
  getArtifactVariantStringPOI,
} from '../../artifacts/artifact-util';

let artifactStore: ArtifactStore;
let useNativeArtifacts: boolean;

export const artifactCache: MapType<Artifact> = {};

export const setArtifactStore = (store: ArtifactStore) => {
  artifactStore = store;
};
export const setUseNativeArtifacts = (useNative: boolean) => {
  useNativeArtifacts = useNative;
};

export const getArtifacts = async (
  inputs: PublicInputsRailgun,
): Promise<Artifact> => {
  const nullifiers = inputs.nullifiers.length;
  const commitments = inputs.commitmentsOut.length;
  assertArtifactExists(nullifiers, commitments);

  if (useNativeArtifacts) {
    if (commitments > 3) {
      // native-prover-small only has INPUTS (1-10) and OUTPUTS (1-3)
      throw new Error(
        `Native artifacts (small) only support up to 3 circuit outputs. Cannot get artifacts for circuit: ${nullifiers}x${commitments}.`,
      );
    }
  }

  const artifactVariantString = getArtifactVariantString(
    nullifiers,
    commitments,
  );

  return downloadAndCacheArtifact(artifactVariantString);
};

const downloadAndCacheArtifact = async (
  artifactVariantString: string,
): Promise<Artifact> => {
  // Use artifact in cache if available.
  const cachedArtifact = artifactCache[artifactVariantString];
  if (isDefined(cachedArtifact)) {
    return cachedArtifact;
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

const getArtifactsPOI = (maxInputs: number, maxOutputs: number) => {
  const artifactVariant = getArtifactVariantStringPOI(maxInputs, maxOutputs);
  return downloadAndCacheArtifact(artifactVariant);
};

export const artifactGetterDownloadJustInTime: ArtifactGetter = {
  assertArtifactExists,
  getArtifacts,
  getArtifactsPOI,
};

export const overrideArtifact = (
  artifactVariant: string,
  artifact: Artifact,
) => {
  artifactCache[artifactVariant] = artifact;
};

export const clearArtifactCache = () => {
  for (const key in artifactCache) {
    if (isDefined(artifactCache[key])) {
      delete artifactCache[key];
    }
  }
};
