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
  POIProofProgressEvent,
  RailgunBalancesEvent,
  TXIDVersion,
  isDefined,
} from '@railgun-community/shared-models';
import {
  onBalancesUpdate,
  onWalletPOIProofProgress,
  setOnBalanceUpdateCallback,
  setOnWalletPOIProofProgressCallback,
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
let walletTokenBalanceStub: SinonStub;

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
      RailgunWallet,
      'getTokenBalancesByTxidVersion',
    ).resolves(balances);
    walletTokenBalanceStub = Sinon.stub(
      RailgunWallet.prototype,
      'getTokenBalances',
    ).resolves(balances);
  });
  afterEach(() => {
    walletBalanceStub.resetHistory();
    walletTokenBalanceStub.resetHistory();
  });
  after(async () => {
    walletBalanceStub.restore();
    walletTokenBalanceStub.restore();
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
    expect(walletTokenBalanceStub.calledOnce).to.be.true;
    expect(formattedBalances.chain).to.deep.equal(chain);
    expect(formattedBalances.erc20Amounts.length).to.equal(1);
    expect(formattedBalances.erc20Amounts[0]).to.deep.equal({
      tokenAddress: '0x0000000000000000000000000000000000012536',
      amount: 10n,
    });
  });

  it('Should parse poi proof progress response', async () => {
    let proofProgress!: POIProofProgressEvent;
    const callback = (proofProgressEvent: POIProofProgressEvent) => {
      proofProgress = proofProgressEvent;
    };
    setOnWalletPOIProofProgressCallback(callback);
    const chain: Chain = { type: ChainType.EVM, id: 69 };
    const progress = 5;
    const listKey = 'listKey';
    const txid = 'txid';
    const railgunTxid = 'railgunTxid';
    const index = 2;
    const totalCount = 10;
    onWalletPOIProofProgress(
      txidVersion,
      wallet,
      chain,
      progress,
      listKey,
      txid,
      railgunTxid,
      index,
      totalCount,
      undefined, // errMessage
    );
    expect(proofProgress.chain).to.deep.equal(chain);
    expect(proofProgress.railgunWalletID).to.equal(wallet.id);
    expect(proofProgress.progress).to.equal(progress);
    expect(proofProgress.listKey).to.equal(listKey);
    expect(proofProgress.txid).to.equal(txid);
    expect(proofProgress.railgunTxid).to.equal(railgunTxid);
    expect(proofProgress.index).to.equal(index);
    expect(proofProgress.totalCount).to.equal(totalCount);
    expect(proofProgress.txidVersion).to.equal(txidVersion);
    expect(proofProgress.errMessage).to.be.undefined;
  });
});
