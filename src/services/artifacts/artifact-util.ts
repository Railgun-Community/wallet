import {
  ArtifactName,
  ArtifactMapping,
} from '@railgun-community/shared-models';
import brotliDecompress from 'brotli/decompress';

const IPFS_GATEWAY = 'https://ipfs-lb.com';

const MASTER_IPFS_HASH_ARTIFACTS =
  'QmUsmnK4PFc7zDp2cmC4wBZxYLjNyRgWfs5GNcJJ2uLcpU';

const IPFS_HASH_ARTIFACTS_POI =
  'QmZrP9zaZw2LwErT2yA6VpMWm65UdToQiKj4DtStVsUJHr';

export const ARTIFACT_VARIANT_STRING_POI_PREFIX = 'POI';

export const artifactDownloadsDir = (artifactVariantString: string) => {
  if (artifactVariantString.startsWith(ARTIFACT_VARIANT_STRING_POI_PREFIX)) {
    return `artifacts-v2.1/poi-nov-2-23/${artifactVariantString}`;
  }

  return `artifacts-v2.1/${artifactVariantString}`;
};

export const getArtifactVariantString = (
  nullifiers: number,
  commitments: number,
) => {
  return `${nullifiers.toString().padStart(2, '0')}x${commitments.toString().padStart(2, '0')}`;
};

export const getArtifactVariantStringPOI = (
  maxInputs: number,
  maxOutputs: number,
) => {
  return `${ARTIFACT_VARIANT_STRING_POI_PREFIX}_${maxInputs}x${maxOutputs}`;
};

export const artifactDownloadsPath = (
  artifactName: ArtifactName,
  artifactVariantString: string,
): string => {
  switch (artifactName) {
    case ArtifactName.WASM:
      return `${artifactDownloadsDir(artifactVariantString)}/wasm`;
    case ArtifactName.ZKEY:
      return `${artifactDownloadsDir(artifactVariantString)}/zkey`;
    case ArtifactName.VKEY:
      return `${artifactDownloadsDir(artifactVariantString)}/vkey.json`;
    case ArtifactName.DAT:
      return `${artifactDownloadsDir(artifactVariantString)}/dat`;
  }
};

export const getArtifactDownloadsPaths = (
  artifactVariantString: string,
): ArtifactMapping => {
  return {
    [ArtifactName.ZKEY]: artifactDownloadsPath(
      ArtifactName.ZKEY,
      artifactVariantString,
    ),
    [ArtifactName.WASM]: artifactDownloadsPath(
      ArtifactName.WASM,
      artifactVariantString,
    ),
    [ArtifactName.VKEY]: artifactDownloadsPath(
      ArtifactName.VKEY,
      artifactVariantString,
    ),
    [ArtifactName.DAT]: artifactDownloadsPath(
      ArtifactName.DAT,
      artifactVariantString,
    ),
  };
};

export const decompressArtifact = (arrayBuffer: ArrayBuffer): Uint8Array => {
  const decompress = brotliDecompress as (input: Uint8Array) => Uint8Array;
  return decompress(Buffer.from(arrayBuffer));
};

const getArtifactIPFSFilepath = (
  artifactName: ArtifactName,
  artifactVariantString: string,
) => {
  switch (artifactName) {
    case ArtifactName.ZKEY:
      return `circuits/${artifactVariantString}/zkey.br`;
    case ArtifactName.WASM:
      return `prover/snarkjs/${artifactVariantString}.wasm.br`;
    case ArtifactName.VKEY:
      return `circuits/${artifactVariantString}/vkey.json`;
    case ArtifactName.DAT:
      return `prover/native/${artifactVariantString}.dat.br`;
  }
  throw new Error('Invalid artifact.');
};

const getArtifactIPFSFilepathPOI = (artifactName: ArtifactName) => {
  switch (artifactName) {
    case ArtifactName.ZKEY:
      return `zkey.br`;
    case ArtifactName.WASM:
      return `wasm.br`;
    case ArtifactName.VKEY:
      return `vkey.json`;
    case ArtifactName.DAT:
      return `dat.br`;
  }
  throw new Error('Invalid artifact.');
};

export const getArtifactUrl = (
  artifactName: ArtifactName,
  artifactVariantString: string,
) => {
  if (artifactVariantString.startsWith(ARTIFACT_VARIANT_STRING_POI_PREFIX)) {
    if (
      artifactVariantString === getArtifactVariantStringPOI(3, 3) ||
      artifactVariantString === getArtifactVariantStringPOI(13, 13)
    ) {
      return `${IPFS_GATEWAY}/ipfs/${IPFS_HASH_ARTIFACTS_POI}/${artifactVariantString}/${getArtifactIPFSFilepathPOI(
        artifactName,
      )}`;
    }
    throw new Error(`Invalid POI artifact: ${artifactVariantString}.`);
  }

  const artifactFilepath = getArtifactIPFSFilepath(
    artifactName,
    artifactVariantString,
  );
  
  return `${IPFS_GATEWAY}/ipfs/${MASTER_IPFS_HASH_ARTIFACTS}/${artifactFilepath}`;
};
