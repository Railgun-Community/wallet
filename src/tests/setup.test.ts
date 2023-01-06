/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
import LevelDOWN from 'leveldown';
import fs from 'fs';
import { NetworkName, ArtifactVariant } from '@railgun-community/shared-models';
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
import { overrideArtifact } from '../services/railgun/core/artifacts';
import { setOnBalanceUpdateCallback } from '../services/railgun/wallets/balance-update';
import testArtifacts from '@railgun-community/test-artifacts';

const LEPTON_TEST_DB = 'test.db';
const db = new LevelDOWN(LEPTON_TEST_DB);

const setupTests = () => {
  setTestArtifacts();

  // Uncomment to enable logger during tests (Do not commit).
  // setLoggers(console.log, console.error);

  // Remove artifacts.
  const { warn } = console;
  fs.rm('v1', { recursive: true }, () => {
    warn('Error removing test db.');
  });
};

before(() => {
  setupTests();
});

after(() => {
  const { warn } = console;
  fs.rm(LEPTON_TEST_DB, { recursive: true }, () => {
    warn('Error removing test db.');
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
  const shouldDebug = true;
  const response = startRailgunEngine(
    TEST_WALLET_SOURCE,
    db,
    shouldDebug,
    testArtifactStore,
    useNativeArtifacts,
  );
  if (response.error) {
    throw new Error(response.error);
  }

  // TODO: Clear listeners when test engine is reset.
  setOnBalanceUpdateCallback(MOCK_BALANCES_UPDATE_CALLBACK);
  setOnMerkletreeScanCallback(MOCK_HISTORY_SCAN_CALLBACK);
};

export const setTestArtifacts = () => {
  overrideArtifact(ArtifactVariant.Variant_1_by_2, testArtifacts[1][2]);
  overrideArtifact(ArtifactVariant.Variant_1_by_3, testArtifacts[1][3]);
  overrideArtifact(ArtifactVariant.Variant_2_by_2, testArtifacts[2][2]);
  overrideArtifact(ArtifactVariant.Variant_2_by_3, testArtifacts[2][3]);
  overrideArtifact(ArtifactVariant.Variant_8_by_2, testArtifacts[8][2]);
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
