import {
  ArtifactName,
  ArtifactMapping,
} from '@railgun-community/shared-models';
import brotliDecompress from 'brotli/decompress';

const IPFS_GATEWAY = 'https://ipfs-lb.com';

export const artifactDownloadsDir = (artifactIPFSHash: string) => {
  return `artifacts-v2/${artifactIPFSHash}`;
};

export const artifactDownloadsPath = (
  artifactName: ArtifactName,
  artifactIPFSHash: string,
): string => {
  switch (artifactName) {
    case ArtifactName.WASM:
      return `${artifactDownloadsDir(artifactIPFSHash)}/wasm`;
    case ArtifactName.ZKEY:
      return `${artifactDownloadsDir(artifactIPFSHash)}/zkey`;
    case ArtifactName.VKEY:
      return `${artifactDownloadsDir(artifactIPFSHash)}/vkey.json`;
    case ArtifactName.DAT:
      return `${artifactDownloadsDir(artifactIPFSHash)}/dat`;
  }
};

export const getArtifactDownloadsPaths = (
  artifactIPFSHash: string,
): ArtifactMapping => {
  return {
    [ArtifactName.ZKEY]: artifactDownloadsPath(
      ArtifactName.ZKEY,
      artifactIPFSHash,
    ),
    [ArtifactName.WASM]: artifactDownloadsPath(
      ArtifactName.WASM,
      artifactIPFSHash,
    ),
    [ArtifactName.VKEY]: artifactDownloadsPath(
      ArtifactName.VKEY,
      artifactIPFSHash,
    ),
    [ArtifactName.DAT]: artifactDownloadsPath(
      ArtifactName.DAT,
      artifactIPFSHash,
    ),
  };
};

export const decompressArtifact = (arrayBuffer: ArrayBuffer): Buffer => {
  const decompress = brotliDecompress as (input: Buffer) => Buffer;
  return decompress(Buffer.from(arrayBuffer));
};

const getArtifactIPFSFilepath = (artifactName: ArtifactName) => {
  switch (artifactName) {
    case ArtifactName.ZKEY:
      return 'zkey.br';
    case ArtifactName.WASM:
      return 'r1cs.br';
    case ArtifactName.VKEY:
      return 'vkey.json';
    case ArtifactName.DAT:
      throw new Error('Requires dat ipfs filepath');
  }
  throw new Error('Invalid artifact name.');
};

export const getArtifactUrl = (
  artifactName: ArtifactName,
  artifactIPFSHash: string,
) => {
  const artifactFilepath = getArtifactIPFSFilepath(artifactName);

  return `${IPFS_GATEWAY}/ipfs/${artifactIPFSHash}/${artifactFilepath}`;
};
