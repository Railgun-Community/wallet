import {
  ArtifactGroup,
  ArtifactName,
  ArtifactVariant,
} from '@railgun-community/shared-models';
import axios, { ResponseType } from 'axios';
import { sendErrorMessage } from '../../utils/logger';
import {
  artifactDir,
  artifactPath,
  decompressArtifact,
  getArtifactPaths,
  getArtifactUrl,
  validateArtifactDownload,
} from './artifact-util';
import { ArtifactStore } from './artifact-store';

export class ArtifactDownloader {
  private artifactStore: ArtifactStore;
  private useNativeArtifacts: boolean;

  constructor(artifactStore: ArtifactStore, useNativeArtifacts: boolean) {
    this.artifactStore = artifactStore;
    this.useNativeArtifacts = useNativeArtifacts;
  }

  downloadArtifactsForVariant = async (
    artifactVariant: ArtifactVariant,
  ): Promise<void> => {
    const [vkeyPath, zkeyPath, wasmOrDatPath] = await Promise.all([
      this.downloadArtifact(ArtifactName.VKEY, artifactVariant),
      this.downloadArtifact(ArtifactName.ZKEY, artifactVariant),
      this.downloadArtifact(
        this.useNativeArtifacts ? ArtifactName.DAT : ArtifactName.WASM,
        artifactVariant,
      ),
    ]);

    if (!vkeyPath) {
      throw new Error('Could not download vkey artifact.');
    }
    if (!zkeyPath) {
      throw new Error('Could not download zkey artifact.');
    }
    if (!wasmOrDatPath) {
      throw new Error('Could not download wasm/dat artifact.');
    }
  };

  private downloadArtifact = async (
    artifactName: ArtifactName,
    artifactVariant: ArtifactVariant,
  ): Promise<string | undefined> => {
    const path = artifactPath(artifactName, artifactVariant);
    if (await this.artifactStore.exists(path)) {
      return path;
    }
    try {
      const url = getArtifactUrl(artifactName, artifactVariant);
      const result = await axios.get(url, {
        method: 'GET',
        responseType: ArtifactDownloader.artifactResponseType(artifactName),
      });
      const data: ArrayBuffer | Buffer | object = result.data;

      // NodeJS downloads as Buffer.
      // Browser downloads as ArrayBuffer.
      // Both will validate with the same hash.
      const dataFormatted: ArrayBuffer | Buffer | string =
        data instanceof ArrayBuffer || data instanceof Buffer
          ? (data as ArrayBuffer | Buffer)
          : JSON.stringify(data);

      const isValid = await validateArtifactDownload(
        dataFormatted,
        artifactName,
        artifactVariant,
      );
      if (isValid) {
        const decompressedData = ArtifactDownloader.getArtifactData(
          dataFormatted,
          artifactName,
        );
        await this.artifactStore.store(
          artifactDir(artifactVariant),
          path,
          decompressedData,
        );
      } else {
        throw new Error(`Invalid artifact download: ${artifactName}`);
      }

      return path;
    } catch (err) {
      sendErrorMessage(err.message);
      return undefined;
    }
  };

  private static getArtifactData = (
    data: string | ArrayBuffer,
    artifactName: ArtifactName,
  ): string | Buffer => {
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
      const storedItem = (await this.artifactStore.get(path)) as
        | string
        | Buffer
        | null;
      return storedItem;
    } catch (err) {
      sendErrorMessage(err);
      return null;
    }
  };

  getDownloadedArtifacts = async (
    artifactVariant: ArtifactVariant,
  ): Promise<ArtifactGroup> => {
    const artifactPaths = getArtifactPaths(artifactVariant);

    const [vkeyString, zkeyBuffer, datBuffer, wasmBuffer] = await Promise.all([
      this.getDownloadedArtifact(artifactPaths[ArtifactName.VKEY]),
      this.getDownloadedArtifact(artifactPaths[ArtifactName.ZKEY]),
      this.useNativeArtifacts
        ? this.getDownloadedArtifact(artifactPaths[ArtifactName.DAT])
        : Promise.resolve(undefined),
      !this.useNativeArtifacts
        ? this.getDownloadedArtifact(artifactPaths[ArtifactName.WASM])
        : Promise.resolve(undefined),
    ]);
    if (vkeyString == null) {
      throw new Error('Could not retrieve vkey artifact.');
    }
    if (zkeyBuffer == null) {
      throw new Error('Could not retrieve zkey artifact.');
    }
    if (datBuffer == null && wasmBuffer == null) {
      throw new Error('Could not retrieve dat/wasm artifact.');
    }

    return {
      vkey: JSON.parse(vkeyString as string),
      zkey: zkeyBuffer as Buffer,
      wasm: wasmBuffer as Buffer | undefined,
      dat: datBuffer as Buffer | undefined,
    };
  };
}
