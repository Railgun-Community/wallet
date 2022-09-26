import {
  ArtifactName,
  ArtifactVariant,
  ArtifactMapping,
  ArtifactVariantMapping,
  ARTIFACT_URL_PATHS_VARIANTS_V1,
} from '@railgun-community/shared-models/dist/models/artifact';
import brotliDecompress from 'brotli/decompress';
import { createHash } from 'crypto';
import { sendErrorMessage } from '../../utils/logger';

const RAILGUN_REMOTE_RESOURCES_URL = 'https://beacon.railgun.ch';

export const artifactDir = (artifactVariant: ArtifactVariant) => {
  return `v1/${artifactVariant}`;
};

export const artifactPath = (
  artifactName: ArtifactName,
  artifactVariant: ArtifactVariant,
): string => {
  switch (artifactName) {
    case ArtifactName.WASM:
      return `${artifactDir(artifactVariant)}/small.wasm`;
    case ArtifactName.ZKEY:
      return `${artifactDir(artifactVariant)}/small_final.zkey`;
    case ArtifactName.VKEY:
      return `${artifactDir(artifactVariant)}/vkey.json`;
    case ArtifactName.DAT:
      return `${artifactDir(artifactVariant)}/native.dat`;
  }
};

export const getArtifactPaths = (
  artifactVariant: ArtifactVariant,
): ArtifactMapping => {
  return {
    [ArtifactName.ZKEY]: artifactPath(ArtifactName.ZKEY, artifactVariant),
    [ArtifactName.WASM]: artifactPath(ArtifactName.WASM, artifactVariant),
    [ArtifactName.VKEY]: artifactPath(ArtifactName.VKEY, artifactVariant),
    [ArtifactName.DAT]: artifactPath(ArtifactName.DAT, artifactVariant),
  };
};

export const decompressArtifact = (arrayBuffer: ArrayBuffer): Buffer => {
  return brotliDecompress(Buffer.from(arrayBuffer));
};

export const getExpectedHash = (
  artifactName: ArtifactName,
  artifactVariant: ArtifactVariant,
) => {
  const hash = ARTIFACT_HASHES[artifactVariant][artifactName];
  if (!hash) {
    throw new Error(
      `No blob hash for artifact ${artifactName}:${artifactVariant}`,
    );
  }
  return hash;
};

export const validateArtifactDownload = async (
  data: ArrayBuffer | string,
  artifactName: ArtifactName,
  artifactVariant: ArtifactVariant,
): Promise<boolean> => {
  const formattedData = data instanceof ArrayBuffer ? Buffer.from(data) : data;
  const hash = createHash('sha256').update(formattedData).digest('hex');
  const expectedHash = getExpectedHash(artifactName, artifactVariant);
  if (hash !== expectedHash) {
    sendErrorMessage(
      `Validate artifact blob for ${artifactName}:${artifactVariant}. Got ${hash}, expected ${expectedHash}.`,
    );
  }
  return hash === expectedHash;
};

export const getArtifactUrl = (
  artifactName: ArtifactName,
  artifactVariant: ArtifactVariant,
) => {
  const urlPath = ARTIFACT_URL_PATHS_VARIANTS_V1[artifactVariant][artifactName];
  if (!urlPath) {
    throw new Error(
      `No URL path for artifact ${artifactName}:${artifactVariant}`,
    );
  }
  return `${RAILGUN_REMOTE_RESOURCES_URL}/${urlPath}`;
};

const ARTIFACT_HASHES: ArtifactVariantMapping = {
  [ArtifactVariant.Variant_1_by_2]: {
    [ArtifactName.VKEY]:
      'cd22faf223ec4faddf4e012a532577c5b5994fe8b83841b6967e19ef80bc7d75',
    [ArtifactName.ZKEY]:
      '1f463c250ce847573b642c98112f97f0d15599b7945d375058aff7173f044f24',
    [ArtifactName.WASM]:
      '32565f091f18681e71c9da401471436cfa1a9d37b455b0d7f71fb38b3056737f',
    [ArtifactName.DAT]:
      '2bc8a50a215f7a175edf57d7453d2683cf7094f672779d8ee8322bd999f090c2',
  },
  [ArtifactVariant.Variant_1_by_3]: {
    [ArtifactName.VKEY]:
      'f86c117cc3cfd4d02a6e1ac24883d8a8828122c73e0930186fa1da8307a88882',
    [ArtifactName.ZKEY]:
      '063764f690a0d1d10ceeddcac0c6ca06de1f59fce3dfa8c186918df83895c679',
    [ArtifactName.WASM]:
      '9cd27f60908b7e3676b25b535499cc53531b37490bfd598353063558c550f332',
    [ArtifactName.DAT]:
      'a0874a12f1cc7742a97a1c880432566ca970e7018fe6f73c70f6457d2c50d71a',
  },
  [ArtifactVariant.Variant_2_by_2]: {
    [ArtifactName.VKEY]:
      'a663b281bcb18341b3bbf25799e99da4af1fa71397ce47a3e61caece160311ae',
    [ArtifactName.ZKEY]:
      'dd647bbffb97f8856097778d19bfa5b733a25888c66c06269bf88b46dc7898be',
    [ArtifactName.WASM]:
      'd474961b35271ce25c623501c019377a401de7cfb7c9ea2d9405f6bc3dcd4ebb',
    [ArtifactName.DAT]:
      '06091300067a26001424ef7cd916b497001e7a748815179fe54aa92ccd11789d',
  },
  [ArtifactVariant.Variant_2_by_3]: {
    [ArtifactName.VKEY]:
      '36fca3cc2ceb8a68d2e95031aa5f86a7d9c39dcbd8c8e2b2cf9513ed48f043b2',
    [ArtifactName.ZKEY]:
      'd64da8947096f042bd6134436dca97959208a86efc2ce1327dd31b66929cfa5e',
    [ArtifactName.WASM]:
      '395eefd5e64c234b2a20d2684a7d9f204bc0b4808c76c6b2ef40c9a54f3f762f',
    [ArtifactName.DAT]:
      '1c5e76ae8c03cb8c903b862bf93f72fdd25ec90a480a1a2f422abb60909ac3a2',
  },
  [ArtifactVariant.Variant_8_by_2]: {
    [ArtifactName.VKEY]:
      '0081bfa9c8a1e3332597aede95a7c2a588f11cca34ea59abc89fb3d38787c798',
    [ArtifactName.ZKEY]:
      '347adb8eb14dae991975cbf998fd919c4766d9fc718baf81c887b0bd0f67aab0',
    [ArtifactName.WASM]:
      'f672dccea5142f568825fbbb6353b33dd05ce49a9dcc0e360da81cc277d44a41',
    [ArtifactName.DAT]:
      '38486da3788b73ccffd19fe650bd7ea98922e05237408546d415f9aa20263860',
  },
};
