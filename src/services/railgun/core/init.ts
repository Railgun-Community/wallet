import type { AbstractLevelDOWN } from 'abstract-leveldown';
import {
  RailgunEngine,
  EngineEvent,
  MerkletreeHistoryScanEventData,
  POIList,
  POIListType,
  UTXOScanDecryptBalancesCompleteEventData,
  AbstractWallet,
  POIMerklerootsValidator,
} from '@railgun-community/engine';
import {
  MerkletreeScanUpdateEvent,
  isDefined,
  type Chain,
} from '@railgun-community/shared-models';
import { sendErrorMessage, sendMessage } from '../../../utils/logger';
import {
  artifactGetterDownloadJustInTime,
  setArtifactStore,
  setUseNativeArtifacts,
} from './artifacts';
import { ArtifactStore } from '../../artifacts/artifact-store';
import { reportAndSanitizeError } from '../../../utils/error';
import { quickSyncEventsGraph } from '../quick-sync/quick-sync-events';
import { quickSyncRailgunTransactionsV2 } from '../railgun-txids/railgun-txid-sync-graph-v2';
import { WalletPOI } from '../../poi/wallet-poi';
import {
  WalletPOINodeInterface,
  type BatchListUpdateEvent,
} from '../../poi/wallet-poi-node-interface';
import { setEngine, getEngine, hasEngine } from './engine';
import { onBalancesUpdate } from '../wallets/balance-update';
import { POIValidator } from '../../poi';

export { type BatchListUpdateEvent } from '../../poi/wallet-poi-node-interface';

export type EngineDebugger = {
  log: (msg: string) => void;
  error: (error: Error) => void;
  verboseScanLogging: boolean;
};

const createEngineDebugger = (verboseScanLogging: boolean): EngineDebugger => {
  return {
    log: (msg: string) => sendMessage(msg),
    error: (error: Error) => sendErrorMessage(error),
    verboseScanLogging,
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

const setOnUTXOScanDecryptBalancesCompleteListener = () => {
  const engine = getEngine();
  engine.on(
    EngineEvent.UTXOScanDecryptBalancesComplete,
    ({
      txidVersion,
      chain,
      walletIdFilter,
    }: UTXOScanDecryptBalancesCompleteEventData) => {
      const updateWalletBalances = async () => {
        let walletsToUpdate: AbstractWallet[] = Object.values(engine.wallets);
        if (isDefined(walletIdFilter)) {
          walletsToUpdate = walletsToUpdate.filter(wallet =>
            walletIdFilter.includes(wallet.id),
          );
        }

        // await onBalancesUpdate calls for each wallet
        await Promise.all(
          walletsToUpdate.map(wallet =>
            onBalancesUpdate(txidVersion, wallet, chain),
          ),
        );

        // emit event to notify listeners that UTXOMerkletreeHistoryScan is complete
        engine.emitScanEventHistoryComplete(txidVersion, chain);
      };

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      updateWalletBalances();
    },
  );
};

export const setBatchListCallback = (
  onBatchListCallback: (callbackData: BatchListUpdateEvent) => void,
) => {
  WalletPOINodeInterface.setListBatchCallback(onBatchListCallback);
};

export const pausePPOIBatchingForChain = (chain: Chain) => {
  WalletPOINodeInterface.pause(chain);
};

export const resumePPOIBatching = (chain: Chain) => {
  WalletPOINodeInterface.unpause(chain);
};

/**
 *
 * @param walletSource - Name for your wallet implementation. Encrypted and viewable in private transaction history. Maximum of 16 characters, lowercase.
 * @param db - LevelDOWN compatible database for storing encrypted wallets.
 * @param shouldDebug - Whether to forward Engine debug logs to Logger.
 * @param artifactStore - Persistent store for downloading large artifact files. See Wallet SDK Developer Guide for platform implementations.
 * @param useNativeArtifacts - Whether to download native C++ or web-assembly artifacts. TRUE for mobile. FALSE for nodejs and browser.
 * @param skipMerkletreeScans - Whether to skip merkletree syncs and private balance scans. Only set to TRUE in shield-only applications that don't load private wallets or balances.
 * @param poiNodeURLs - List of POI aggregator node URLs, in order of priority.
 * @param customPOILists - POI lists to use for additional wallet protections after default lists.
 * @returns
 */
export const startRailgunEngine = async (
  walletSource: string,
  db: AbstractLevelDOWN,
  shouldDebug: boolean,
  artifactStore: ArtifactStore,
  useNativeArtifacts: boolean,
  skipMerkletreeScans: boolean,
  poiNodeURLs?: string[],
  customPOILists?: POIList[],
  verboseScanLogging = false,
): Promise<void> => {
  if (hasEngine()) {
    return;
  }
  try {
    setArtifactStore(artifactStore);
    setUseNativeArtifacts(useNativeArtifacts);

    const engine = await RailgunEngine.initForWallet(
      walletSource,
      db,
      artifactGetterDownloadJustInTime,
      quickSyncEventsGraph,
      quickSyncRailgunTransactionsV2,
      WalletPOI.getPOITxidMerklerootValidator(poiNodeURLs),
      WalletPOI.getPOILatestValidatedRailgunTxid(poiNodeURLs),
      shouldDebug ? createEngineDebugger(verboseScanLogging) : undefined,
      skipMerkletreeScans,
    );
    setEngine(engine);

    setOnUTXOScanDecryptBalancesCompleteListener();

    if (isDefined(poiNodeURLs)) {
      const poiNodeInterface = new WalletPOINodeInterface(poiNodeURLs);
      WalletPOI.init(poiNodeInterface, customPOILists ?? []);
    }
  } catch (err) {
    throw reportAndSanitizeError(startRailgunEngine.name, err);
  }
};

export const startRailgunEngineForPOINode = async (
  db: AbstractLevelDOWN,
  shouldDebug: boolean,
  artifactStore: ArtifactStore,
  validatePOIMerkleroots: POIMerklerootsValidator,
): Promise<void> => {
  if (hasEngine()) {
    return;
  }
  try {
    setArtifactStore(artifactStore);
    setUseNativeArtifacts(false);

    POIValidator.initForPOINode(validatePOIMerkleroots);

    const engine = await RailgunEngine.initForPOINode(
      db,
      artifactGetterDownloadJustInTime,
      quickSyncEventsGraph,
      quickSyncRailgunTransactionsV2,
      shouldDebug
        ? createEngineDebugger(
            false, // verboseScanLogging
          )
        : undefined,
    );
    setEngine(engine);
  } catch (err) {
    throw reportAndSanitizeError(startRailgunEngineForPOINode.name, err);
  }
};

export const stopRailgunEngine = async () => {
  if (!hasEngine()) {
    return;
  }
  await getEngine()?.unload();
  setEngine(undefined);
};

export { POIList, POIListType };
