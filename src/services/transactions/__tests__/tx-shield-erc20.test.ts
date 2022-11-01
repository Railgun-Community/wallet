import { FallbackProvider } from '@ethersproject/providers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { BigNumber } from '@ethersproject/bignumber';
import Sinon, { SinonStub } from 'sinon';
import {
  NetworkName,
  deserializeTransaction,
} from '@railgun-community/shared-models';
import {
  initTestEngine,
  initTestEngineNetwork,
} from '../../../test/setup.test';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_MNEMONIC,
  MOCK_TOKEN_AMOUNTS,
} from '../../../test/mocks.test';
import { populateShield, gasEstimateForShield } from '../tx-shield-erc20';
import { decimalToHexString } from '../../../utils/format';
import { createRailgunWallet } from '../../railgun/wallets/wallets';
import { getRandomBytes } from '../../railgun';

let gasEstimateStub: SinonStub;
let sendTxStub: SinonStub;
let railgunAddress: string;

const shieldPrivateKey = getRandomBytes(32);

chai.use(chaiAsPromised);
const { expect } = chai;

const stubSuccess = () => {
  gasEstimateStub = Sinon.stub(
    FallbackProvider.prototype,
    'estimateGas',
  ).resolves(BigNumber.from(decimalToHexString(200)));
};

const stubFailure = () => {
  gasEstimateStub = Sinon.stub(
    FallbackProvider.prototype,
    'estimateGas',
  ).rejects(new Error('test rejection - gas estimate'));
};

describe('tx-shield-erc20', () => {
  before(async () => {
    initTestEngine();
    await initTestEngineNetwork();
    const railgunWalletResponse = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!railgunWalletResponse.railgunWalletInfo) {
      throw new Error('No railgun wallet created.');
    }
    railgunAddress = railgunWalletResponse.railgunWalletInfo.railgunAddress;
  });
  afterEach(() => {
    gasEstimateStub?.restore();
    sendTxStub?.restore();
  });

  it('Should get gas estimate for valid shield', async () => {
    stubSuccess();
    const rsp = await gasEstimateForShield(
      NetworkName.Polygon,
      railgunAddress,
      shieldPrivateKey,
      MOCK_TOKEN_AMOUNTS,
      MOCK_ETH_WALLET_ADDRESS,
    );
    expect(rsp.error).to.be.undefined;
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(200));
  });

  it('Should error on gas estimates for invalid shield', async () => {
    stubSuccess();
    const rsp = await gasEstimateForShield(
      NetworkName.Polygon,
      '123456789',
      shieldPrivateKey,
      MOCK_TOKEN_AMOUNTS,
      MOCK_ETH_WALLET_ADDRESS,
    );
    expect(rsp.error).to.equal('Invalid RAILGUN address.');
  });

  it('Should error for ethers rejections', async () => {
    stubFailure();
    const rsp = await gasEstimateForShield(
      NetworkName.Polygon,
      railgunAddress,
      shieldPrivateKey,
      MOCK_TOKEN_AMOUNTS,
      MOCK_ETH_WALLET_ADDRESS,
    );
    expect(rsp.error).to.equal('test rejection - gas estimate');
  });

  it('Should send tx for valid shield', async () => {
    stubSuccess();
    const rsp = await populateShield(
      NetworkName.Polygon,
      railgunAddress,
      shieldPrivateKey,
      MOCK_TOKEN_AMOUNTS,
      undefined, // gasDetailsSerialized
    );
    expect(rsp.error).to.be.undefined;
    const parsedTx = deserializeTransaction(
      rsp.serializedTransaction ?? '',
      2,
      1,
    );
    expect(parsedTx).to.be.an('object');
    expect(parsedTx.data).to.be.a('string');
    expect(parsedTx.to).to.be.a('string');
  });

  it('Should error on send tx for invalid shield', async () => {
    stubSuccess();
    const rsp = await populateShield(
      NetworkName.Polygon,
      '123456789',
      shieldPrivateKey,
      MOCK_TOKEN_AMOUNTS,
      undefined, // gasDetailsSerialized
    );
    expect(rsp.error).to.equal('Invalid RAILGUN address.');
  });
});
