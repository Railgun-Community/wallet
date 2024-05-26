import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_FALLBACK_PROVIDER_JSON_CONFIG_SEPOLIA,
  MOCK_MNEMONIC,
} from '../../../../tests/mocks.test';
import {
  closeTestEngine,
  initTestEngine,
  pollUntilTXIDMerkletreeScanned,
  pollUntilUTXOMerkletreeScanned,
} from '../../../../tests/setup.test';
import { createRailgunWallet, fullWalletForID } from '../wallets';
import { rescanFullUTXOMerkletreesAndWallets } from '../balances';
import {
  Chain,
  NETWORK_CONFIG,
  NetworkName,
  isDefined,
} from '@railgun-community/shared-models';
import { loadProvider } from '../../core/load-provider';
import { getTXIDMerkletreeForNetwork } from '../../core/merkletree';
import { getTestTXIDVersion, isV2Test } from '../../../../tests/helper.test';
import { getEngine } from '../../core/engine';

chai.use(chaiAsPromised);
const { expect } = chai;

let railgunWalletID: string;

const txidVersion = getTestTXIDVersion();

const networkName = NetworkName.EthereumSepolia;
const chain: Chain = NETWORK_CONFIG[networkName].chain;

describe('balances-live', () => {
  before(async function run() {
    this.timeout(360_000);
    await initTestEngine();
    const railgunWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!isDefined(railgunWalletInfo)) {
      throw new Error('Expected railgunWalletInfo');
    }
    railgunWalletID = railgunWalletInfo.id;

    await loadProvider(
      MOCK_FALLBACK_PROVIDER_JSON_CONFIG_SEPOLIA,
      networkName,
      10_000, // pollingInterval
    );
    const { chain } = NETWORK_CONFIG[networkName];
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getEngine().scanContractHistory(
      chain,
      undefined, // walletIdFilter
    );
    await Promise.all([
      pollUntilUTXOMerkletreeScanned(),
      // Enable this when running on a network supporting PPOI:
      pollUntilTXIDMerkletreeScanned(),
    ]);
  });

  after(async () => {
    await closeTestEngine();
  });

  it('[V2] Should run live balance fetch, transaction history scan, and POI status info scan', async function run() {
    if (!isV2Test()) {
      this.skip();
      return;
    }

    await rescanFullUTXOMerkletreesAndWallets(chain, [railgunWalletID]);

    const wallet = fullWalletForID(railgunWalletID);
    const balances = await wallet.getTokenBalances(
      txidVersion,
      chain,
      false, // onlySpendable
    );

    // Note: railgunWallet above needs to perform transactions on above network to have balances
    expect(Object.keys(balances).length).to.be.greaterThanOrEqual(1);

    const transactionHistory = await wallet.getTransactionHistory(
      chain,
      undefined,
    );
    expect(transactionHistory.length).to.be.greaterThanOrEqual(2);

    const poiStatusReceived = await wallet.getTXOsReceivedPOIStatusInfo(
      txidVersion,
      chain,
    );
    expect(poiStatusReceived.length).to.be.greaterThanOrEqual(2);
    expect(poiStatusReceived[0].strings.blindedCommitment).to.not.equal(
      'Missing',
    );

    const txidMerkletree = getTXIDMerkletreeForNetwork(
      txidVersion,
      networkName,
    );
    expect(txidMerkletree.savedPOILaunchSnapshot).to.equal(true);

    const poiStatusSpent = await wallet.getTXOsSpentPOIStatusInfo(
      txidVersion,
      chain,
    );
    expect(poiStatusSpent.length).to.be.greaterThanOrEqual(1);
    expect(poiStatusSpent[0].strings.railgunTransactionInfo).to.not.equal(
      'Not found',
    );
  }).timeout(90_000);
});
