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
  pollUntilTXIDMerkletreeScanned,
  pollUntilUTXOMerkletreeScanned,
} from '../../../../tests/setup.test';
import { createRailgunWallet, walletForID } from '../wallets';
import { refreshRailgunBalances } from '../balances';
import {
  Chain,
  NETWORK_CONFIG,
  NetworkName,
  TXIDVersion,
  isDefined,
} from '@railgun-community/shared-models';
import { loadProvider } from '../../core/load-provider';
import { getTXIDMerkletreeForNetwork } from '../../core/merkletree';

chai.use(chaiAsPromised);
const { expect } = chai;

let railgunWalletID: string;

const txidVersion = TXIDVersion.V2_PoseidonMerkle;

const networkName = NetworkName.EthereumGoerli;
const chain: Chain = NETWORK_CONFIG[networkName].chain;

describe('balances-live', () => {
  before(async function run() {
    this.timeout(60000);

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

    await Promise.all([
      pollUntilUTXOMerkletreeScanned(),
      pollUntilTXIDMerkletreeScanned(),
    ]);
  });

  after(async () => {
    await closeTestEngine();
  });

  it('Should run live balance fetch, transaction history scan, and POI status info scan', async () => {
    const fullRescan = false;
    await refreshRailgunBalances(
      txidVersion,
      chain,
      railgunWalletID,
      fullRescan,
    );

    const wallet = walletForID(railgunWalletID);
    const balances = await wallet.getTokenBalances(
      txidVersion,
      chain,
      false, // onlySpendable
    );
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

    // const poiStatusSpent = await wallet.getTXOsSpentPOIStatusInfo(
    //   txidVersion,
    //   chain,
    // );
    // expect(poiStatusSpent.length).to.be.greaterThanOrEqual(1);
    // expect(poiStatusSpent[0].strings.railgunTransactionInfo).to.not.equal(
    //   'Not found',
    // );
  }).timeout(30000);
});
