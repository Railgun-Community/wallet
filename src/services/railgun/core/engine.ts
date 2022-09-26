import type { AbstractLevelDOWN } from 'abstract-leveldown';
import { Lepton } from '@railgun-community/lepton';
import { Wallet as RailgunWallet } from '@railgun-community/lepton/dist/wallet/wallet';
import { Database } from '@railgun-community/lepton/dist/database';
import {
  MerkletreeScanUpdateEvent,
  StartRailgunEngineResponse,
} from '@railgun-community/shared-models/dist/models/response-types';
import { sendErrorMessage, sendMessage } from '../../../utils/logger';
import {
  artifactsGetter,
  setArtifactStore,
  setUseNativeArtifacts,
} from './artifacts';
import { ArtifactStore } from '../../artifacts/artifact-store';
import { ViewOnlyWallet } from '@railgun-community/lepton/dist/wallet/view-only-wallet';
import { AbstractWallet } from '@railgun-community/lepton/dist/wallet/abstract-wallet';
import { quickSyncLegacy } from '../scan/legacy/quick-sync-legacy';
import {
  LeptonEvent,
  MerkletreeHistoryScanEventData,
  MerkletreeHistoryScanUpdateData,
} from '@railgun-community/lepton/dist/models/event-types';
import { MerkletreeScanStatus } from '@railgun-community/shared-models/dist/models/merkletree-scan';

let engine: Optional<Lepton>;

export type LeptonDebugger = {
  log: (msg: string) => void;
  error: (error: Error) => void;
};

export const getEngine = (): Lepton => {
  if (!engine) {
    throw new Error('RAILGUN Engine not yet initialized.');
  }
  return engine;
};

const getActiveDB = (): Database => {
  if (!engine) {
    throw new Error(
      'RAILGUN Engine not yet initialized. Please reload your app or try again.',
    );
  }
  return engine.db;
};

export const walletForID = (id: string): AbstractWallet => {
  const wallet = engine?.wallets[id];
  if (!wallet) {
    throw new Error('No RAILGUN wallet for ID');
  }
  return wallet;
};

export const fullWalletForID = (id: string): RailgunWallet => {
  const wallet = walletForID(id);
  if (!(wallet instanceof RailgunWallet)) {
    throw new Error('Can not load View-Only wallet.');
  }
  return wallet as RailgunWallet;
};

export const viewOnlyWalletForID = (id: string): RailgunWallet => {
  const wallet = walletForID(id);
  if (!(wallet instanceof ViewOnlyWallet)) {
    throw new Error('Can only load View-Only wallet.');
  }
  return wallet as RailgunWallet;
};

const createLeptonDebugger = (): LeptonDebugger => {
  return {
    log: (msg: string) => sendMessage(msg),
    error: (error: Error) => sendErrorMessage(error),
  };
};

export const setOnHistoryScanCallback = (
  onHistoryScanCallback: (scanData: MerkletreeScanUpdateEvent) => void,
) => {
  const engine = getEngine();
  engine.on(
    LeptonEvent.MerkletreeHistoryScanStarted,
    ({ chain }: MerkletreeHistoryScanEventData) =>
      onHistoryScanCallback({
        scanStatus: MerkletreeScanStatus.Started,
        chain,
        progress: 0.0,
      }),
  );
  engine.on(
    LeptonEvent.MerkletreeHistoryScanUpdate,
    ({ chain, progress }: MerkletreeHistoryScanUpdateData) =>
      onHistoryScanCallback({
        scanStatus: MerkletreeScanStatus.Updated,
        chain,
        progress,
      }),
  );
  engine.on(
    LeptonEvent.MerkletreeHistoryScanComplete,
    ({ chain }: MerkletreeHistoryScanEventData) =>
      onHistoryScanCallback({
        scanStatus: MerkletreeScanStatus.Complete,
        chain,
        progress: 1.0,
      }),
  );
  engine.on(
    LeptonEvent.MerkletreeHistoryScanIncomplete,
    ({ chain }: MerkletreeHistoryScanEventData) =>
      onHistoryScanCallback({
        scanStatus: MerkletreeScanStatus.Incomplete,
        chain,
        progress: 1.0,
      }),
  );
};

export const startRailgunEngine = (
  walletSource: string,
  db: AbstractLevelDOWN,
  shouldDebug: boolean,
  artifactStore: ArtifactStore,
  useNativeArtifacts: boolean,
): StartRailgunEngineResponse => {
  if (engine) {
    const response: StartRailgunEngineResponse = {};
    return response;
  }
  try {
    engine = new Lepton(
      walletSource,
      db,
      artifactsGetter,
      quickSyncLegacy,
      shouldDebug ? createLeptonDebugger() : undefined,
    );
    setArtifactStore(artifactStore);
    setUseNativeArtifacts(useNativeArtifacts);

    const response: StartRailgunEngineResponse = {};
    return response;
  } catch (err) {
    sendErrorMessage(err.stack);
    const response: StartRailgunEngineResponse = { error: err.message };
    return response;
  }
};

export const closeRailgunEngine = () => {
  getActiveDB().close();
  engine = undefined;
};
