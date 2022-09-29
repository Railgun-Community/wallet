import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { RailgunWallet } from '@railgun-community/engine/dist/wallet/railgun-wallet';
import Sinon, { SinonStub } from 'sinon';
import { RailgunBalancesEvent } from '@railgun-community/shared-models/dist/models/response-types';
import { ByteLength, nToHex } from '@railgun-community/engine/dist/utils/bytes';
import {
  onBalancesUpdate,
  setOnBalanceUpdateCallback,
} from '../balance-update';
import { createRailgunWallet } from '../wallets';
import { fullWalletForID } from '../../core/engine';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_MNEMONIC,
} from '../../../../test/mocks.test';
import { initTestEngine } from '../../../../test/setup.test';
import { Balances } from '@railgun-community/engine/dist/models/wallet-types';
import {
  Chain,
  ChainType,
} from '@railgun-community/engine/dist/models/engine-types';

chai.use(chaiAsPromised);
const { expect } = chai;

const MOCK_TOKEN_ADDRESS = '0x012536';

let wallet: RailgunWallet;

let walletBalanceStub: SinonStub;

describe('balance-update', () => {
  before(async () => {
    initTestEngine();
    const { railgunWalletInfo } = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
    );
    if (!railgunWalletInfo) {
      throw new Error('Expected railgunWalletInfo');
    }
    wallet = fullWalletForID(railgunWalletInfo.id);
    const tokenAddress = MOCK_TOKEN_ADDRESS.replace('0x', '');
    const balances: Balances = {
      [tokenAddress]: {
        balance: BigInt(10),
        utxos: [],
      },
    };
    walletBalanceStub = Sinon.stub(
      RailgunWallet.prototype,
      'balances',
    ).resolves(balances);
  });
  afterEach(() => {
    walletBalanceStub.resetHistory();
  });
  after(() => {
    walletBalanceStub.restore();
  });

  it('Should not pull balances without callback', async () => {
    setOnBalanceUpdateCallback(undefined);
    const chain: Chain = { type: ChainType.EVM, id: 1 };
    await expect(onBalancesUpdate(wallet, chain)).to.be.fulfilled;
    expect(walletBalanceStub.notCalled).to.be.true;
  });

  it('Should parse wallet balances response', async () => {
    let formattedBalances!: RailgunBalancesEvent;
    const callback = (balancesFormatted: RailgunBalancesEvent) => {
      formattedBalances = balancesFormatted;
    };
    setOnBalanceUpdateCallback(callback);
    const chain: Chain = { type: ChainType.EVM, id: 69 };
    await expect(onBalancesUpdate(wallet, chain)).to.be.fulfilled;
    expect(walletBalanceStub.calledOnce).to.be.true;
    expect(formattedBalances.chain).to.deep.equal(chain);
    expect(formattedBalances.tokenBalancesSerialized.length).to.equal(1);
    expect(formattedBalances.tokenBalancesSerialized[0]).to.deep.equal({
      tokenAddress: MOCK_TOKEN_ADDRESS,
      balanceString: nToHex(BigInt(10), ByteLength.UINT_256, true),
    });
  });
});
