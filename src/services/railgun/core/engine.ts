import type { AbstractLevelDOWN } from 'abstract-leveldown';
import {
  RailgunEngine,
  RailgunWallet,
  Database,
  ViewOnlyWallet,
  AbstractWallet,
  EngineEvent,
  MerkletreeHistoryScanEventData,
  MerkletreeHistoryScanUpdateData,
} from '@railgun-community/engine';
import {
  MerkletreeScanUpdateEvent,
  StartRailgunEngineResponse,
  MerkletreeScanStatus,
} from '@railgun-community/shared-models';
import { sendErrorMessage, sendMessage } from '../../../utils/logger';
import {
  artifactsGetter,
  setArtifactStore,
  setUseNativeArtifacts,
} from './artifacts';
import { ArtifactStore } from '../../artifacts/artifact-store';
import { quickSyncIPNS } from '../scan/quick-sync-ipns';

let engine: Optional<RailgunEngine>;

export type EngineDebugger = {
  log: (msg: string) => void;
  error: (error: Error) => void;
};

export const getEngine = (): RailgunEngine => {
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

const createEngineDebugger = (): EngineDebugger => {
  return {
    log: (msg: string) => sendMessage(msg),
    error: (error: Error) => sendErrorMessage(error),
  };
};

export const setOnMerkletreeScanCallback = (
  onMerkletreeScanCallback: (scanData: MerkletreeScanUpdateEvent) => void,
) => {
  const engine = getEngine();
  engine.on(
    EngineEvent.MerkletreeHistoryScanStarted,
    ({ chain }: MerkletreeHistoryScanEventData) =>
      onMerkletreeScanCallback({
        scanStatus: MerkletreeScanStatus.Started,
        chain,
        progress: 0.0,
      }),
  );
  engine.on(
    EngineEvent.MerkletreeHistoryScanUpdate,
    ({ chain, progress }: MerkletreeHistoryScanUpdateData) =>
      onMerkletreeScanCallback({
        scanStatus: MerkletreeScanStatus.Updated,
        chain,
        progress,
      }),
  );
  engine.on(
    EngineEvent.MerkletreeHistoryScanComplete,
    ({ chain }: MerkletreeHistoryScanEventData) =>
      onMerkletreeScanCallback({
        scanStatus: MerkletreeScanStatus.Complete,
        chain,
        progress: 1.0,
      }),
  );
  engine.on(
    EngineEvent.MerkletreeHistoryScanIncomplete,
    ({ chain }: MerkletreeHistoryScanEventData) =>
      onMerkletreeScanCallback({
        scanStatus: MerkletreeScanStatus.Incomplete,
        chain,
        progress: 1.0,
      }),
  );
};

export const formatTempEngineV3StartBlockNumbersEVM =
  (tempEngineV3StartBlockNumbersEVM: {
    [chainID: string]: number;
  }): number[][] => {
    const engineV3StartBlockNumbersEVM: number[] = [];
    const chainIDs = Object.keys(tempEngineV3StartBlockNumbersEVM);
    chainIDs.forEach(chainID => {
      engineV3StartBlockNumbersEVM[Number(chainID)] =
        tempEngineV3StartBlockNumbersEVM[chainID];
    });
    return [engineV3StartBlockNumbersEVM]; // index 0 is EVM.
  };

export const startRailgunEngine = (
  walletSource: string,
  db: AbstractLevelDOWN,
  shouldDebug: boolean,
  artifactStore: ArtifactStore,
  useNativeArtifacts: boolean,
  tempEngineV3StartBlockNumbersEVM: { [chainID: string]: number },
): StartRailgunEngineResponse => {
  if (engine) {
    const response: StartRailgunEngineResponse = {};
    return response;
  }
  try {
    engine = new RailgunEngine(
      walletSource,
      db,
      artifactsGetter,
      quickSyncIPNS,
      shouldDebug ? createEngineDebugger() : undefined,
      formatTempEngineV3StartBlockNumbersEVM(tempEngineV3StartBlockNumbersEVM),
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
