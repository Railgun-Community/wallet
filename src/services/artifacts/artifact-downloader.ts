import { Artifact, ArtifactName } from '@railgun-community/shared-models';
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

export class ArtifactDownloader {
  private artifactStore: ArtifactStore;
  private useNativeArtifacts: boolean;

  constructor(artifactStore: ArtifactStore, useNativeArtifacts: boolean) {
    this.artifactStore = artifactStore;
    this.useNativeArtifacts = useNativeArtifacts;
  }

  downloadArtifacts = async (artifactIPFSHash: string): Promise<void> => {
    const [vkeyPath, zkeyPath, wasmOrDatPath] = await Promise.all([
      this.downloadArtifact(ArtifactName.VKEY, artifactIPFSHash),
      this.downloadArtifact(ArtifactName.ZKEY, artifactIPFSHash),
      this.downloadArtifact(
        this.useNativeArtifacts ? ArtifactName.DAT : ArtifactName.WASM,
        artifactIPFSHash,
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
    artifactIPFSHash: string,
  ): Promise<string | undefined> => {
    const path = artifactDownloadsPath(artifactName, artifactIPFSHash);
    if (await this.artifactStore.exists(path)) {
      return path;
    }
    try {
      const url = getArtifactUrl(artifactName, artifactIPFSHash);
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

      const decompressedData = ArtifactDownloader.getArtifactData(
        dataFormatted,
        artifactName,
      );
      await this.artifactStore.store(
        artifactDownloadsDir(artifactIPFSHash),
        path,
        decompressedData,
      );

      return path;
    } catch (err) {
      reportAndSanitizeError(err);
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
      return null;
    }
  };

  getDownloadedArtifacts = async (
    artifactIPFSHash: string,
  ): Promise<Artifact> => {
    const artifactDownloadsPaths = getArtifactDownloadsPaths(artifactIPFSHash);

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
