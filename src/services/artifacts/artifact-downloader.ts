import {
  Artifact,
  ArtifactName,
  isDefined,
  promiseTimeout,
} from '@railgun-community/shared-models';
import axios, { ResponseType } from 'axios';
import {
  artifactDownloadsDir,
  artifactDownloadsPath,
  decompressArtifact,
  getArtifactDownloadsPaths,
  getArtifactUrl,
} from './artifact-util';
import { ArtifactStore } from './artifact-store';
import { reportAndSanitizeError } from '../../utils/error';
import { sendMessage } from '../../utils/logger';
import { validateArtifactDownload } from './artifact-hash';

export class ArtifactDownloader {
  private artifactStore: ArtifactStore;
  private useNativeArtifacts: boolean;

  constructor(artifactStore: ArtifactStore, useNativeArtifacts: boolean) {
    this.artifactStore = artifactStore;
    this.useNativeArtifacts = useNativeArtifacts;
  }

  downloadArtifacts = async (artifactVariantString: string): Promise<void> => {
    sendMessage(`Downloading artifacts: ${artifactVariantString}`);

    const [vkeyPath, zkeyPath, wasmOrDatPath] = await promiseTimeout(
      Promise.all([
        this.downloadArtifact(ArtifactName.VKEY, artifactVariantString),
        this.downloadArtifact(ArtifactName.ZKEY, artifactVariantString),
        this.downloadArtifact(
          this.useNativeArtifacts ? ArtifactName.DAT : ArtifactName.WASM,
          artifactVariantString,
        ),
      ]),
      45000,
      new Error(
        `Timed out downloading artifact files for ${artifactVariantString} circuit. Please try again.`,
      ),
    );

    if (!isDefined(vkeyPath)) {
      throw new Error('Could not download vkey artifact.');
    }
    if (!isDefined(zkeyPath)) {
      throw new Error('Could not download zkey artifact.');
    }
    if (!isDefined(wasmOrDatPath)) {
      throw new Error(
        this.useNativeArtifacts
          ? 'Could not download dat artifact.'
          : 'Could not download wasm artifact.',
      );
    }
  };

  private downloadArtifact = async (
    artifactName: ArtifactName,
    artifactVariantString: string,
  ): Promise<string | undefined> => {
    const path = artifactDownloadsPath(artifactName, artifactVariantString);
    if (await this.artifactStore.exists(path)) {
      return path;
    }
    try {
      const url = getArtifactUrl(artifactName, artifactVariantString);

      const { data } = await axios.get<ArrayBuffer | Buffer | object>(url, {
        method: 'GET',
        responseType: ArtifactDownloader.artifactResponseType(artifactName),
      });

      // NodeJS downloads as Buffer.
      // Browser downloads as ArrayBuffer.
      // Both will validate with the same hash.

      let dataFormatted: ArrayBuffer | Buffer | string;

      if (data instanceof ArrayBuffer || data instanceof Buffer) {
        dataFormatted = data;
      } else if (typeof data === 'object') {
        dataFormatted = JSON.stringify(data);
      } else if (typeof data === 'string') {
        dataFormatted = JSON.stringify(JSON.parse(data));
      } else {
        throw new Error('Unexpected response data type');
      }

      const decompressedData = ArtifactDownloader.getArtifactData(
        dataFormatted,
        artifactName,
      );

      const isValid = await validateArtifactDownload(
        decompressedData,
        artifactName,
        artifactVariantString,
      );
      if (isValid) {
        await this.artifactStore.store(
          artifactDownloadsDir(artifactVariantString),
          path,
          decompressedData,
        );
      } else {
        throw new Error(
          `Invalid hash for artifact download: ${artifactName} for ${artifactVariantString}.`,
        );
      }

      return path;
    } catch (err) {
      throw reportAndSanitizeError(this.downloadArtifact.name, err);
    }
  };

  private static getArtifactData = (
    data: string | ArrayBuffer,
    artifactName: ArtifactName,
  ): string | Uint8Array => {
    switch (artifactName) {
      case ArtifactName.VKEY:
        return data as string;
      case ArtifactName.ZKEY:
      case ArtifactName.DAT:
      case ArtifactName.WASM:
        return decompressArtifact(data as ArrayBuffer);
    }
  };

  private static artifactResponseType = (
    artifactName: ArtifactName,
  ): ResponseType => {
    switch (artifactName) {
      case ArtifactName.VKEY:
        return 'text';
      case ArtifactName.ZKEY:
      case ArtifactName.DAT:
      case ArtifactName.WASM:
        return 'arraybuffer';
    }
  };

  private getDownloadedArtifact = async (
    path: string,
  ): Promise<string | Buffer | null> => {
    try {
      const storedItem = await this.artifactStore.get(path);
      return storedItem;
    } catch (err) {
      return null;
    }
  };

  getDownloadedArtifacts = async (
    artifactVariantString: string,
  ): Promise<Artifact> => {
    const artifactDownloadsPaths = getArtifactDownloadsPaths(
      artifactVariantString,
    );

    const [vkeyString, zkeyBuffer, datBuffer, wasmBuffer] = await Promise.all([
      this.getDownloadedArtifact(artifactDownloadsPaths[ArtifactName.VKEY]),
      this.getDownloadedArtifact(artifactDownloadsPaths[ArtifactName.ZKEY]),
      this.useNativeArtifacts
        ? this.getDownloadedArtifact(artifactDownloadsPaths[ArtifactName.DAT])
        : Promise.resolve(undefined),
      !this.useNativeArtifacts
        ? this.getDownloadedArtifact(artifactDownloadsPaths[ArtifactName.WASM])
        : Promise.resolve(undefined),
    ]);
    if (vkeyString == null) {
      throw new Error('Could not retrieve vkey artifact.');
    }
    if (zkeyBuffer == null) {
      throw new Error('Could not retrieve zkey artifact.');
    }
    if (this.useNativeArtifacts && datBuffer == null) {
      throw new Error('Could not retrieve dat artifact.');
    }
    if (!this.useNativeArtifacts && wasmBuffer == null) {
      throw new Error('Could not retrieve wasm artifact.');
    }

    return {
      vkey: JSON.parse(vkeyString as string),
      zkey: zkeyBuffer as Buffer,
      wasm: wasmBuffer as Buffer | undefined,
      dat: datBuffer as Buffer | undefined,
    };
  };
}
