/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
import LevelDOWN from 'leveldown';
import fs from 'fs';
import { NetworkName } from '@railgun-community/shared-models';
import {
  setOnMerkletreeScanCallback,
  startRailgunEngine,
} from '../services/railgun/core/engine';
import {
  MOCK_BALANCES_UPDATE_CALLBACK,
  MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
  MOCK_HISTORY_SCAN_CALLBACK,
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

before(() => {
  setupTests();
});

after(() => {
  const { warn } = console;
  fs.rm(ENGINE_TEST_DB, { recursive: true }, () => {
    warn('Error removing test db.');
  });
  fs.rm('artifacts-v2.1', { recursive: true }, () => {
    // Note: expect this error when we aren't running artifact download tests.
    warn('Error removing test artifacts.');
  });
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

export const initTestEngine = (useNativeArtifacts = false) => {
  const shouldDebug = false;
  const response = startRailgunEngine(
    TEST_WALLET_SOURCE,
    db,
    shouldDebug,
    testArtifactStore,
    useNativeArtifacts,
    false, // skipMerkletreeScans
  );
  if (response.error) {
    throw new Error(response.error);
  }

  // TODO: Clear listeners when test engine is reset.
  setOnBalanceUpdateCallback(MOCK_BALANCES_UPDATE_CALLBACK);
  setOnMerkletreeScanCallback(MOCK_HISTORY_SCAN_CALLBACK);
};

export const initTestEngineNetwork = async () => {
  const shouldDebug = false;

  // Don't wait for async. It will try to load historical events, which takes a while.
  return loadProvider(
    MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
    NetworkName.Polygon,
    shouldDebug,
  );
};
