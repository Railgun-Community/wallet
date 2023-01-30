import { FallbackProvider } from '@ethersproject/providers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { BigNumber } from '@ethersproject/bignumber';
import Sinon, { SinonStub } from 'sinon';
import {
  NetworkName,
  deserializeTransaction,
  EVMGasType,
  TransactionGasDetailsSerialized,
  decimalToHexString,
} from '@railgun-community/shared-models';
import {
  initTestEngine,
  initTestEngineNetwork,
} from '../../../tests/setup.test';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_MNEMONIC,
  MOCK_TOKEN_AMOUNTS,
} from '../../../tests/mocks.test';
import {
  populateShieldBaseToken,
  gasEstimateForShieldBaseToken,
} from '../tx-shield-base-token';
import { createRailgunWallet } from '../../railgun/wallets/wallets';
import { PopulatedTransaction } from '@ethersproject/contracts';
import { randomHex, RelayAdaptContract } from '@railgun-community/engine';

let gasEstimateStub: SinonStub;
let sendTxStub: SinonStub;
let relayAdaptPopulateShieldBaseToken: SinonStub;
let railgunAddress: string;

const shieldPrivateKey = randomHex(32);

chai.use(chaiAsPromised);
const { expect } = chai;

const gasDetailsSerialized: TransactionGasDetailsSerialized = {
  evmGasType: EVMGasType.Type2,
  gasEstimateString: '0x00',
  maxFeePerGasString: '0x1000',
  maxPriorityFeePerGasString: '0x100',
};

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

describe('tx-shield-base-token', () => {
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
    relayAdaptPopulateShieldBaseToken = Sinon.stub(
      RelayAdaptContract.prototype,
      'populateShieldBaseToken',
    ).resolves({ data: '0x0123' } as PopulatedTransaction);
  });
  afterEach(() => {
    gasEstimateStub?.restore();
    sendTxStub?.restore();
    relayAdaptPopulateShieldBaseToken?.restore();
  });

  it('Should get gas estimate for valid shield base token', async () => {
    stubSuccess();
    const rsp = await gasEstimateForShieldBaseToken(
      NetworkName.Polygon,
      railgunAddress,
      shieldPrivateKey,
      MOCK_TOKEN_AMOUNTS[0],
      MOCK_ETH_WALLET_ADDRESS,
    );
    expect(rsp.error).to.be.undefined;
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(200));
  });

  it('Should error on gas estimates for invalid shield base token', async () => {
    stubSuccess();
    const rsp = await gasEstimateForShieldBaseToken(
      NetworkName.Polygon,
      '123456789',
      shieldPrivateKey,
      MOCK_TOKEN_AMOUNTS[0],
      MOCK_ETH_WALLET_ADDRESS,
    );
    expect(rsp.error).to.equal('Invalid RAILGUN address.');
  });

  it('Should error for ethers rejections', async () => {
    stubFailure();
    const rsp = await gasEstimateForShieldBaseToken(
      NetworkName.Polygon,
      railgunAddress,
      shieldPrivateKey,
      MOCK_TOKEN_AMOUNTS[0],
      MOCK_ETH_WALLET_ADDRESS,
    );
    expect(rsp.error).to.equal('test rejection - gas estimate');
  });

  it('Should send tx for valid shield base token', async () => {
    stubSuccess();
    const rsp = await populateShieldBaseToken(
      NetworkName.Polygon,
      railgunAddress,
      shieldPrivateKey,
      MOCK_TOKEN_AMOUNTS[0],
      gasDetailsSerialized,
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

  it('Should error on send tx for invalid shield base token', async () => {
    stubSuccess();
    const rsp = await populateShieldBaseToken(
      NetworkName.Polygon,
      '123456789',
      shieldPrivateKey,
      MOCK_TOKEN_AMOUNTS[0],
      gasDetailsSerialized,
    );
    expect(rsp.error).to.equal('Invalid RAILGUN address.');
  });
});
