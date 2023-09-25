import type { AbstractLevelDOWN } from 'abstract-leveldown';
import {
  RailgunEngine,
  RailgunWallet,
  ViewOnlyWallet,
  AbstractWallet,
  EngineEvent,
  MerkletreeHistoryScanEventData,
  MerkletreeHistoryScanUpdateData,
  POIList,
  POIListType,
  GetLatestValidatedRailgunTxid,
} from '@railgun-community/engine';
import {
  MerkletreeScanUpdateEvent,
  MerkletreeScanStatus,
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
import { quickSyncEventsGraph } from '../quick-sync/quick-sync-events-graph';
import { quickSyncRailgunTransactions } from '../railgun-txids/railgun-tx-sync-graph';
import { WalletPOIRequester } from '../../poi/wallet-poi-requester';
import { MerklerootValidator } from '@railgun-community/engine/dist/models/merkletree-types';
import { WalletPOI } from '../../poi/wallet-poi';
import { TempTestWalletPOIRequester } from '../../poi/temp-test-wallet-poi-requester';

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

const getPOITxidMerklerootValidator = (
  poiNodeURL?: string,
): MerklerootValidator => {
  const poiRequester = isDefined(poiNodeURL)
    ? new WalletPOIRequester(poiNodeURL)
    : // TODO: Remove this temp tester
      new TempTestWalletPOIRequester();

  const txidMerklerootValidator: MerklerootValidator = (
    chain,
    tree,
    index,
    merkleroot,
  ) =>
    poiRequester.validateRailgunTxidMerkleroot(chain, tree, index, merkleroot);
  return txidMerklerootValidator;
};

const getPOILatestValidatedRailgunTxid = (
  poiNodeURL?: string,
): GetLatestValidatedRailgunTxid => {
  const poiRequester = isDefined(poiNodeURL)
    ? new WalletPOIRequester(poiNodeURL)
    : // TODO: Remove this temp tester
      new TempTestWalletPOIRequester();

  const getLatestValidatedRailgunTxid: GetLatestValidatedRailgunTxid = chain =>
    poiRequester.getLatestValidatedRailgunTxid(chain);
  return getLatestValidatedRailgunTxid;
};

/**
 *
 * @param walletSource - Name for your wallet implementation. Encrypted and viewable in private transaction history. Maximum of 16 characters, lowercase.
 * @param db - LevelDOWN compatible database for storing encrypted wallets.
 * @param shouldDebug - Whether to forward Engine debug logs to Logger.
 * @param artifactStore - Persistent store for downloading large artifact files. See Wallet SDK Developer Guide for platform implementations.
 * @param useNativeArtifacts - Whether to download native C++ or web-assembly artifacts. TRUE for mobile. FALSE for nodejs and browser.
 * @param skipMerkletreeScans - Whether to skip merkletree syncs and private balance scans. Only set to TRUE in shield-only applications that don't load private wallets or balances.
 * @param isPOINode - Run the Engine as a POI node with full Railgun TXID merkletrees. Set this to false for all wallet implementations.
 * @param poiNodeURL - POI aggregator node URL.
 * @returns
 */
export const startRailgunEngine = (
  walletSource: string,
  db: AbstractLevelDOWN,
  shouldDebug: boolean,
  artifactStore: ArtifactStore,
  useNativeArtifacts: boolean,
  skipMerkletreeScans: boolean,
  isPOINode: boolean,
  poiNodeURL?: string,
  customPOILists?: POIList[],
): void => {
  if (engine) return;
  try {
    setArtifactStore(artifactStore);
    setUseNativeArtifacts(useNativeArtifacts);

    engine = new RailgunEngine(
      walletSource,
      db,
      artifactGetterDownloadJustInTime,
      quickSyncEventsGraph,
      quickSyncRailgunTransactions,
      getPOITxidMerklerootValidator(poiNodeURL),
      getPOILatestValidatedRailgunTxid(poiNodeURL),
      shouldDebug ? createEngineDebugger() : undefined,
      skipMerkletreeScans,
      isPOINode,
    );

    WalletPOI.init(poiNodeURL, customPOILists ?? [], engine);
  } catch (err) {
    throw reportAndSanitizeError(startRailgunEngine.name, err);
  }
};

export const stopRailgunEngine = async () => {
  await engine?.unload();
  engine = undefined;
};

export { POIList, POIListType };
