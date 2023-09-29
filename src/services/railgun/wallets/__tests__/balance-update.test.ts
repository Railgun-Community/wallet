import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  RailgunWallet,
  TokenBalances,
  Chain,
  ChainType,
  getTokenDataERC20,
} from '@railgun-community/engine';
import Sinon, { SinonStub } from 'sinon';
import {
  RailgunBalancesEvent,
  TXIDVersion,
  isDefined,
} from '@railgun-community/shared-models';
import {
  onBalancesUpdate,
  setOnBalanceUpdateCallback,
} from '../balance-update';
import { createRailgunWallet } from '../wallets';
import { fullWalletForID } from '../../core/engine';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_MNEMONIC,
} from '../../../../tests/mocks.test';
import { closeTestEngine, initTestEngine } from '../../../../tests/setup.test';

chai.use(chaiAsPromised);
const { expect } = chai;

const MOCK_TOKEN_ADDRESS = '0x012536';

const txidVersion = TXIDVersion.V2_PoseidonMerkle;

let wallet: RailgunWallet;

let walletBalanceStub: SinonStub;

describe('balance-update', () => {
  before(async () => {
    initTestEngine();
    const railgunWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!isDefined(railgunWalletInfo)) {
      throw new Error('Expected railgunWalletInfo');
    }
    wallet = fullWalletForID(railgunWalletInfo.id);
    const tokenAddress = MOCK_TOKEN_ADDRESS.replace('0x', '');
    const tokenData = getTokenDataERC20(tokenAddress);
    const balances: TokenBalances = {
      [tokenAddress]: {
        balance: BigInt(10),
        utxos: [],
        tokenData,
      },
    };
    walletBalanceStub = Sinon.stub(
      RailgunWallet.prototype,
      'getTokenBalancesByTxidVersion',
    ).resolves(balances);
  });
  afterEach(() => {
    walletBalanceStub.resetHistory();
  });
  after(async () => {
    walletBalanceStub.restore();
    await closeTestEngine();
  });

  it('Should not pull balances without callback', async () => {
    setOnBalanceUpdateCallback(undefined);
    const chain: Chain = { type: ChainType.EVM, id: 1 };
    await expect(onBalancesUpdate(txidVersion, wallet, chain)).to.be.fulfilled;
    expect(walletBalanceStub.notCalled).to.be.true;
  });

  it('Should parse wallet balances response', async () => {
    let formattedBalances!: RailgunBalancesEvent;
    const callback = (balancesFormatted: RailgunBalancesEvent) => {
      formattedBalances = balancesFormatted;
    };
    setOnBalanceUpdateCallback(callback);
    const chain: Chain = { type: ChainType.EVM, id: 69 };
    await expect(onBalancesUpdate(txidVersion, wallet, chain)).to.be.fulfilled;
    expect(walletBalanceStub.calledOnce).to.be.true;
    expect(formattedBalances.chain).to.deep.equal(chain);
    expect(formattedBalances.erc20Amounts.length).to.equal(1);
    expect(formattedBalances.erc20Amounts[0]).to.deep.equal({
      tokenAddress: '0x0000000000000000000000000000000000012536',
      amount: 10n,
    });
  });
});
