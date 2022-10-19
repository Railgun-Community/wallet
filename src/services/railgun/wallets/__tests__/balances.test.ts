import { RailgunEngine, RailgunWallet } from '@railgun-community/engine';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon, { SinonStub } from 'sinon';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_MNEMONIC,
} from '../../../../test/mocks.test';
import { initTestEngine } from '../../../../test/setup.test';
import { createRailgunWallet } from '../wallets';
import {
  fullRescanBalancesAllWallets,
  refreshRailgunBalances,
  rescanFullMerkletreesAndWallets,
  scanUpdatesForMerkletreeAndWallets,
} from '../balances';
import { Chain, ChainType } from '@railgun-community/shared-models';

chai.use(chaiAsPromised);
const { expect } = chai;

let walletScanStub: SinonStub;
let walletFullScanStub: SinonStub;
let engineScanStub: SinonStub;
let engineFullScanStub: SinonStub;
let knownWalletID: string;

describe('balances', () => {
  before(async () => {
    initTestEngine();
    const { railgunWalletInfo } = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!railgunWalletInfo) {
      return;
    }
    knownWalletID = railgunWalletInfo.id;
    walletScanStub = Sinon.stub(
      RailgunWallet.prototype,
      'scanBalances',
    ).resolves();

    engineScanStub = Sinon.stub(
      RailgunEngine.prototype,
      'scanHistory',
    ).resolves();

    walletFullScanStub = Sinon.stub(
      RailgunWallet.prototype,
      'fullRescanBalances',
    ).resolves();

    engineFullScanStub = Sinon.stub(
      RailgunEngine.prototype,
      'fullRescanMerkletreesAndWallets',
    ).resolves();
  });
  afterEach(() => {
    walletScanStub.resetHistory();
    engineScanStub.resetHistory();
    walletFullScanStub.resetHistory();
    engineFullScanStub.resetHistory();
  });
  after(() => {
    walletScanStub.restore();
    engineScanStub.restore();
    walletFullScanStub.restore();
    engineFullScanStub.restore();
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
    expect(engineScanStub.calledOnce).to.be.true;
  });

  it('Should throw if no active wallet for ID', async () => {
    const fullRescan = false;
    const chain: Chain = { type: ChainType.EVM, id: 1 };
    const response = await refreshRailgunBalances(chain, 'unknown', fullRescan);
    expect(response).to.deep.equal({
      error: 'No RAILGUN wallet for ID',
    });
    expect(walletScanStub.notCalled).to.be.true;
    expect(engineScanStub.notCalled).to.be.true;
  });

  it('Should scan for updates to merkletree and wallets', async () => {
    const chain: Chain = { type: ChainType.EVM, id: 1 };
    const response = await scanUpdatesForMerkletreeAndWallets(chain);
    expect(response).to.deep.equal({});
    expect(engineScanStub.calledOnce).to.be.true;
  });

  it('Should run full rescan of merkletree and wallets', async () => {
    const chain: Chain = { type: ChainType.EVM, id: 1 };
    const response = await rescanFullMerkletreesAndWallets(chain);
    expect(response).to.deep.equal({});
    expect(engineFullScanStub.calledOnce).to.be.true;
  });
});
