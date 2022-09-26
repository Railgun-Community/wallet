import { Wallet as RailgunWallet } from '@railgun-community/lepton/dist/wallet/wallet';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon, { SinonStub } from 'sinon';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_MNEMONIC,
} from '../../../../test/mocks.test';
import { initTestLepton } from '../../../../test/setup.test';
import { createRailgunWallet } from '../wallets';
import { refreshRailgunBalances } from '../balances';
import {
  Chain,
  ChainType,
} from '@railgun-community/shared-models/dist/models/response-types';

chai.use(chaiAsPromised);
const { expect } = chai;

let walletScanStub: SinonStub;
let knownWalletID: string;

describe('balances', () => {
  before(async () => {
    initTestLepton();
    const { railgunWalletInfo } = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
    );
    if (!railgunWalletInfo) {
      return;
    }
    knownWalletID = railgunWalletInfo.id;
    walletScanStub = Sinon.stub(
      RailgunWallet.prototype,
      'scanBalances',
    ).resolves();
  });
  afterEach(() => {
    walletScanStub.resetHistory();
  });
  after(() => {
    walletScanStub.restore();
  });

  it('Should run wallet scan if active wallet for ID', async () => {
    const fullRescan = false;
    const chain: Chain = { type: ChainType.EVM, id: 1 };
    const response = await refreshRailgunBalances(
      chain,
      knownWalletID,
      fullRescan,
    );
    expect(response).to.deep.equal({});
    expect(walletScanStub.calledOnce).to.be.true;
  });

  it('Should throw if no active wallet for ID', async () => {
    const fullRescan = false;
    const chain: Chain = { type: ChainType.EVM, id: 1 };
    const response = await refreshRailgunBalances(chain, 'unknown', fullRescan);
    expect(response).to.deep.equal({
      error: 'No RAILGUN wallet for ID',
    });
    expect(walletScanStub.notCalled).to.be.true;
  });
});
