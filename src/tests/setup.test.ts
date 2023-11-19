/// <reference types="../types/global" />
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
  MOCK_BALANCES_UPDATE_CALLBACK,
  MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
  MOCK_POI_PROOF_PROGRESS_CALLBACK_CALLBACK,
  TEST_WALLET_SOURCE,
} from './mocks.test';
import { ArtifactStore } from '../services/artifacts/artifact-store';
import {
  setOnBalanceUpdateCallback,
  setOnWalletPOIProofProgressCallback,
} from '../services/railgun/wallets/balance-update';
import { WalletPOI } from '../services/poi/wallet-poi';
import { TestWalletPOIRequester } from './poi/test-wallet-poi-requester.test';
import { TestWalletPOINodeInterface } from './poi/test-wallet-poi-node-interface.test';
import {
  GetLatestValidatedRailgunTxid,
  MerklerootValidator,
  SnarkJSGroth16,
  TXOPOIListStatus,
} from '@railgun-community/engine';
import {
  getEngine,
  loadProvider,
  setOnTXIDMerkletreeScanCallback,
  setOnUTXOMerkletreeScanCallback,
  startRailgunEngine,
  stopRailgunEngine,
} from '../services/railgun/core';
import { groth16 } from 'snarkjs';
import { setLoggers } from '../utils';

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

beforeEach(() => {
  TestWalletPOINodeInterface.overridePOIsListStatus = TXOPOIListStatus.Missing;
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

let currentUTXOMerkletreeScanStatus: Optional<MerkletreeScanStatus>;
let currentTXIDMerkletreeScanStatus: Optional<MerkletreeScanStatus>;

export const utxoMerkletreeHistoryScanCallback = (
  scanData: MerkletreeScanUpdateEvent,
): void => {
  currentUTXOMerkletreeScanStatus = scanData.scanStatus;
};

export const txidMerkletreeHistoryScanCallback = (
  scanData: MerkletreeScanUpdateEvent,
): void => {
  currentTXIDMerkletreeScanStatus = scanData.scanStatus;
};

export const clearAllMerkletreeScanStatus = () => {
  currentUTXOMerkletreeScanStatus = undefined;
  currentTXIDMerkletreeScanStatus = undefined;
};

export const initTestEngine = (useNativeArtifacts = false) => {
  // SETUP TEST WALLET POI REQUESTER
  const testPOIRequester = new TestWalletPOIRequester();
  const txidMerklerootValidator: MerklerootValidator = (
    txidVersion,
    chain,
    tree,
    index,
    merkleroot,
  ) =>
    testPOIRequester.validateRailgunTxidMerkleroot(
      txidVersion,
      chain,
      tree,
      index,
      merkleroot,
    );
  WalletPOI.getPOITxidMerklerootValidator = () => txidMerklerootValidator;
  const getLatestValidatedRailgunTxid: GetLatestValidatedRailgunTxid = (
    txidVersion,
    chain,
  ) => testPOIRequester.getLatestValidatedRailgunTxid(txidVersion, chain);
  WalletPOI.getPOILatestValidatedRailgunTxid = () =>
    getLatestValidatedRailgunTxid;

  // Set 'true' to debug tests
  const shouldDebug = false;

  if (shouldDebug) {
    setLoggers(console.log, console.error);
  }

  startRailgunEngine(
    TEST_WALLET_SOURCE,
    db,
    shouldDebug,
    testArtifactStore,
    useNativeArtifacts,
    false, // skipMerkletreeScans
    undefined, // poiNodeURL
  );

  const testPOINodeInterface = new TestWalletPOINodeInterface();
  WalletPOI.init(testPOINodeInterface, []);

  getEngine().prover.setSnarkJSGroth16(groth16 as SnarkJSGroth16);

  setOnBalanceUpdateCallback(MOCK_BALANCES_UPDATE_CALLBACK);
  setOnWalletPOIProofProgressCallback(
    MOCK_POI_PROOF_PROGRESS_CALLBACK_CALLBACK,
  );

  setOnUTXOMerkletreeScanCallback(utxoMerkletreeHistoryScanCallback);
  setOnTXIDMerkletreeScanCallback(txidMerkletreeHistoryScanCallback);
};

export const initTestEngineNetworks = async () => {
  // Don't wait for async. It will try to load historical events, which takes a while.
  await loadProvider(
    MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
    NetworkName.Polygon,
    undefined, // walletIdFilter
    10000, // pollingInterval
  );
};

export const closeTestEngine = async () => {
  await stopRailgunEngine();

  clearAllMerkletreeScanStatus();
};

export const pollUntilUTXOMerkletreeScanned = async () => {
  const status = await poll(
    async () => currentUTXOMerkletreeScanStatus,
    status => status === MerkletreeScanStatus.Complete,
    50,
    60000 / 50, // 60 sec.
  );
  if (status !== MerkletreeScanStatus.Complete) {
    throw new Error(`UTXO merkletree scan should be completed - timed out`);
  }
};

export const pollUntilTXIDMerkletreeScanned = async () => {
  const status = await poll(
    async () => currentTXIDMerkletreeScanStatus,
    status => status === MerkletreeScanStatus.Complete,
    50,
    90000 / 50, // 90 sec.
  );
  if (status !== MerkletreeScanStatus.Complete) {
    throw new Error(`TXID merkletree scan should be completed - timed out`);
  }
};
