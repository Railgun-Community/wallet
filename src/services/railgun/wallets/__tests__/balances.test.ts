import { RailgunEngine, RailgunWallet } from '@railgun-community/engine';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon, { SinonStub } from 'sinon';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_MNEMONIC,
} from '../../../../tests/mocks.test';
import { closeTestEngine, initTestEngine } from '../../../../tests/setup.test';
import { createRailgunWallet } from '../wallets';
import {
  refreshBalances,
  rescanFullUTXOMerkletreesAndWallets,
} from '../balances';
import { Chain, ChainType, isDefined } from '@railgun-community/shared-models';

chai.use(chaiAsPromised);
const { expect } = chai;

let walletScanStub: SinonStub;
let walletFullScanStub: SinonStub;
let engineScanStub: SinonStub;
let engineFullScanStub: SinonStub;

describe('balances', () => {
  before(async () => {
    await initTestEngine();
    const railgunWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!isDefined(railgunWalletInfo)) {
      return;
    }
    walletScanStub = Sinon.stub(
      RailgunWallet.prototype,
      'decryptBalances',
    ).resolves();

    engineScanStub = Sinon.stub(
      RailgunEngine.prototype,
      'scanContractHistory',
    ).resolves();

    walletFullScanStub = Sinon.stub(
      RailgunWallet.prototype,
      'fullRedecryptBalancesAllTXIDVersions',
    ).resolves();

    engineFullScanStub = Sinon.stub(
      RailgunEngine.prototype,
      'fullRescanUTXOMerkletreesAndWallets',
    ).resolves();
  });
  afterEach(() => {
    walletScanStub.resetHistory();
    engineScanStub.resetHistory();
    walletFullScanStub.resetHistory();
    engineFullScanStub.resetHistory();
  });
  after(async () => {
    walletScanStub.restore();
    engineScanStub.restore();
    walletFullScanStub.restore();
    engineFullScanStub.restore();
    await closeTestEngine();
  });

  it('Should scan for updates to merkletree and wallets', async () => {
    const chain: Chain = { type: ChainType.EVM, id: 1 };
    const response = await refreshBalances(
      chain,
      undefined, // walletIdFilter
    );
    expect(response).to.be.undefined;
    expect(engineScanStub.calledOnce).to.be.true;
  });

  it('Should run full rescan of merkletree and wallets', async () => {
    const chain: Chain = { type: ChainType.EVM, id: 1 };
    const response = await rescanFullUTXOMerkletreesAndWallets(
      chain,
      undefined, // walletIdFilter
    );
    expect(response).to.be.undefined;
    expect(engineFullScanStub.calledOnce).to.be.true;
  });
});
