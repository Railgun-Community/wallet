import type { AbstractLevelDOWN } from 'abstract-leveldown';
import {
  RailgunEngine,
  RailgunWallet,
  ViewOnlyWallet,
  AbstractWallet,
  EngineEvent,
  MerkletreeHistoryScanEventData,
  POIList,
  POIListType,
} from '@railgun-community/engine';
import {
  MerkletreeScanUpdateEvent,
  isDefined,
} from '@railgun-community/shared-models';
import { sendErrorMessage, sendMessage } from '../../../utils/logger';
import {
  artifactGetterDownloadJustInTime,
  setArtifactStore,
  setUseNativeArtifacts,
} from './artifacts';
import { ArtifactStore } from '../../artifacts/artifact-store';
import { reportAndSanitizeError } from '../../../utils/error';
import { quickSyncEventsGraphV2 } from '../quick-sync/quick-sync-events-graph';
import { quickSyncRailgunTransactions } from '../railgun-txids/railgun-txid-sync-graph';
import { WalletPOI } from '../../poi/wallet-poi';
import { WalletPOINodeInterface } from '../../poi/wallet-poi-node-interface';
import { POIValidation } from '../../poi/poi-validation';
import { POIProof } from '../../poi/poi-proof';

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

export const walletForID = (id: string): AbstractWallet => {
  const engine = getEngine();
  const wallet = engine.wallets[id];
  if (!isDefined(wallet)) {
    throw new Error('No RAILGUN wallet for ID');
  }
  return wallet;
};

export const fullWalletForID = (id: string): RailgunWallet => {
  const wallet = walletForID(id);
  if (!(wallet instanceof RailgunWallet)) {
    throw new Error('Can not load View-Only wallet.');
  }
  return wallet;
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

export const setOnUTXOMerkletreeScanCallback = (
  onUTXOMerkletreeScanCallback: (scanData: MerkletreeScanUpdateEvent) => void,
) => {
  const engine = getEngine();
  engine.on(
    EngineEvent.UTXOMerkletreeHistoryScanUpdate,
    ({ chain, scanStatus, progress }: MerkletreeHistoryScanEventData) =>
      onUTXOMerkletreeScanCallback({
        scanStatus,
        chain,
        progress: progress ?? 0.0,
      }),
  );
};

export const setOnTXIDMerkletreeScanCallback = (
  onTXIDMerkletreeScanCallback: (scanData: MerkletreeScanUpdateEvent) => void,
) => {
  const engine = getEngine();
  engine.on(
    EngineEvent.TXIDMerkletreeHistoryScanUpdate,
    ({ chain, scanStatus, progress }: MerkletreeHistoryScanEventData) =>
      onTXIDMerkletreeScanCallback({
        scanStatus,
        chain,
        progress: progress ?? 0.0,
      }),
  );
};

/**
 *
 * @param walletSource - Name for your wallet implementation. Encrypted and viewable in private transaction history. Maximum of 16 characters, lowercase.
 * @param db - LevelDOWN compatible database for storing encrypted wallets.
 * @param shouldDebug - Whether to forward Engine debug logs to Logger.
 * @param artifactStore - Persistent store for downloading large artifact files. See Wallet SDK Developer Guide for platform implementations.
 * @param useNativeArtifacts - Whether to download native C++ or web-assembly artifacts. TRUE for mobile. FALSE for nodejs and browser.
 * @param skipMerkletreeScans - Whether to skip merkletree syncs and private balance scans. Only set to TRUE in shield-only applications that don't load private wallets or balances.
 * @param poiNodeURL - POI aggregator node URL.
 * @param customPOILists - POI lists to use for additional wallet protections after default lists.
 * @returns
 */
export const startRailgunEngine = (
  walletSource: string,
  db: AbstractLevelDOWN,
  shouldDebug: boolean,
  artifactStore: ArtifactStore,
  useNativeArtifacts: boolean,
  skipMerkletreeScans: boolean,
  poiNodeURL?: string,
  customPOILists?: POIList[],
): void => {
  if (engine) {
    return;
  }
  try {
    setArtifactStore(artifactStore);
    setUseNativeArtifacts(useNativeArtifacts);

    engine = RailgunEngine.initForWallet(
      walletSource,
      db,
      artifactGetterDownloadJustInTime,
      quickSyncEventsGraphV2,
      quickSyncRailgunTransactions,
      WalletPOI.getPOITxidMerklerootValidator(poiNodeURL),
      WalletPOI.getPOILatestValidatedRailgunTxid(poiNodeURL),
      shouldDebug ? createEngineDebugger() : undefined,
      skipMerkletreeScans,
    );

    if (isDefined(poiNodeURL)) {
      POIProof.init(engine);
      const poiNodeInterface = new WalletPOINodeInterface(poiNodeURL);
      WalletPOI.init(poiNodeInterface, customPOILists ?? []);
      POIValidation.init(WalletPOI.getPOIMerklerootsValidator(poiNodeURL));
    }
  } catch (err) {
    throw reportAndSanitizeError(startRailgunEngine.name, err);
  }
};

export const startRailgunEngineForPOINode = (
  db: AbstractLevelDOWN,
  shouldDebug: boolean,
  artifactStore: ArtifactStore,
): void => {
  if (engine) {
    return;
  }
  try {
    setArtifactStore(artifactStore);
    setUseNativeArtifacts(false);

    engine = RailgunEngine.initForPOINode(
      db,
      artifactGetterDownloadJustInTime,
      quickSyncEventsGraphV2,
      quickSyncRailgunTransactions,
      shouldDebug ? createEngineDebugger() : undefined,
    );
    POIProof.init(engine);
  } catch (err) {
    throw reportAndSanitizeError(startRailgunEngineForPOINode.name, err);
  }
};

export const stopRailgunEngine = async () => {
  await engine?.unload();
  engine = undefined;
};

export { POIList, POIListType };
