/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
import LevelDOWN from 'leveldown';
import fs from 'fs';
import {
  MerkletreeScanStatus,
  MerkletreeScanUpdateEvent,
  NetworkName,
  poll,
} from '@railgun-community/shared-models';
import {
  setOnMerkletreeScanCallback,
  startRailgunEngine,
  stopRailgunEngine,
} from '../services/railgun/core/engine';
import {
  MOCK_BALANCES_UPDATE_CALLBACK,
  MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
  TEST_WALLET_SOURCE,
} from './mocks.test';
import { loadProvider } from '../services/railgun/core/providers';
import { ArtifactStore } from '../services/artifacts/artifact-store';
import { setOnBalanceUpdateCallback } from '../services/railgun/wallets/balance-update';

const ENGINE_TEST_DB = 'test.db';
const db = new LevelDOWN(ENGINE_TEST_DB);

const setupTests = () => {
  // Uncomment to enable logger during tests (Do not commit).
  // setLoggers(console.log, console.error);
};

const rmDirSafe = async (dir: string) => {
  if (await fileExists(dir)) {
    await fs.promises.rm(dir, { recursive: true });
  }
};

before(async () => {
  await rmDirSafe(ENGINE_TEST_DB);
  await rmDirSafe('artifacts-v2.1');
  setupTests();
});

const fileExists = (path: string): Promise<boolean> => {
  return new Promise(resolve => {
    fs.promises
      .access(path)
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
};

const testArtifactStore = new ArtifactStore(
  fs.promises.readFile,
  async (dir, path, data) => {
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(path, data);
  },
  fileExists,
);

let currentMerkletreeScanStatus: Optional<MerkletreeScanStatus>;

export const merkletreeHistoryScanCallback = (
  scanData: MerkletreeScanUpdateEvent,
): void => {
  currentMerkletreeScanStatus = scanData.scanStatus;
};

export const clearMerkletreeScanStatus = () => {
  currentMerkletreeScanStatus = undefined;
};

export const initTestEngine = (useNativeArtifacts = false) => {
  const shouldDebug = false;
  startRailgunEngine(
    TEST_WALLET_SOURCE,
    db,
    shouldDebug,
    testArtifactStore,
    useNativeArtifacts,
    false, // skipMerkletreeScans
    false, // isPOINode
    undefined, // poiNodeURL
  );

  setOnBalanceUpdateCallback(MOCK_BALANCES_UPDATE_CALLBACK);
  setOnMerkletreeScanCallback(merkletreeHistoryScanCallback);
};

export const initTestEngineNetwork = async () => {
  // Don't wait for async. It will try to load historical events, which takes a while.
  return loadProvider(
    MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
    NetworkName.Polygon,
    10000, // pollingInterval
  );
};

export const closeTestEngine = async () => {
  await stopRailgunEngine();

  clearMerkletreeScanStatus();
};

export const pollUntilMerkletreeScanned = async () => {
  const status = await poll(
    async () => currentMerkletreeScanStatus,
    status => status === MerkletreeScanStatus.Complete,
    50,
    30000 / 50, // 30 sec.
  );
  if (status !== MerkletreeScanStatus.Complete) {
    throw new Error(`Merkletree scan should be completed - timed out`);
  }
};
