import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_FALLBACK_PROVIDER_JSON_CONFIG_GOERLI,
  MOCK_MNEMONIC,
} from '../../../../tests/mocks.test';
import {
  closeTestEngine,
  initTestEngine,
  pollUntilMerkletreeScanned,
} from '../../../../tests/setup.test';
import { createRailgunWallet } from '../wallets';
import { refreshRailgunBalances } from '../balances';
import {
  Chain,
  NETWORK_CONFIG,
  NetworkName,
  isDefined,
} from '@railgun-community/shared-models';
import { loadProvider } from '../../core/providers';
import { walletForID } from '../../core';

chai.use(chaiAsPromised);
const { expect } = chai;

let railgunWalletID: string;

const networkName = NetworkName.EthereumGoerli;
const chain: Chain = NETWORK_CONFIG[networkName].chain;

describe('balances-live', () => {
  before(async function run() {
    this.timeout(30000);

    initTestEngine();

    const mnemonic = MOCK_MNEMONIC;

    const railgunWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      mnemonic,
      undefined, // creationBlockNumbers
    );
    if (!isDefined(railgunWalletInfo)) {
      return;
    }
    railgunWalletID = railgunWalletInfo.id;

    await loadProvider(
      MOCK_FALLBACK_PROVIDER_JSON_CONFIG_GOERLI,
      networkName,
      10000, // pollingInterval
    );
    await pollUntilMerkletreeScanned();
  });

  after(async () => {
    await closeTestEngine();
  });

  it('Should run live balance fetch, transaction history scan, and POI status info scan', async () => {
    const fullRescan = false;
    await refreshRailgunBalances(chain, railgunWalletID, fullRescan);

    const wallet = walletForID(railgunWalletID);
    const balances = await wallet.balances(chain);
    expect(Object.keys(balances).length).to.be.greaterThanOrEqual(1);

    const transactionHistory = await wallet.getTransactionHistory(
      chain,
      undefined,
    );
    expect(transactionHistory.length).to.be.greaterThanOrEqual(2);

    const poiStatusReceived = await wallet.getTXOsReceivedPOIStatusInfo(chain);
    expect(poiStatusReceived.length).to.be.greaterThanOrEqual(2);
    expect(poiStatusReceived[0].railgunTxid).to.not.equal('Missing');

    // const poiStatusSpent = await wallet.getTXOsSpentPOIStatusInfo(chain);
    // expect(poiStatusSpent.length).to.be.greaterThanOrEqual(1);
    // expect(poiStatusSpent[0].railgunTransactionInfo).to.not.equal('Not found');
  }).timeout(30000);
});
