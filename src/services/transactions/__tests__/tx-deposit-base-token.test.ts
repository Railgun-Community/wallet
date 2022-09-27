import { FallbackProvider } from '@ethersproject/providers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { BigNumber } from '@ethersproject/bignumber';
import Sinon, { SinonStub } from 'sinon';
import { NetworkName } from '@railgun-community/shared-models/dist/models/network-config';
import { deserializeTransaction } from '@railgun-community/shared-models/dist/utils/serializer';
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
import {
  populateDepositBaseToken,
  gasEstimateForDepositBaseToken,
} from '../tx-deposit-base-token';
import { decimalToHexString } from '../../../utils/format';
import { createRailgunWallet } from '../../railgun/wallets/wallets';
import { RelayAdaptContract } from '@railgun-community/engine/dist/contracts/relay-adapt';
import { PopulatedTransaction } from '@ethersproject/contracts';

let gasEstimateStub: SinonStub;
let sendTxStub: SinonStub;
let relayAdaptPopulateDepositBaseToken: SinonStub;
let railgunWalletID: string;

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

describe('tx-deposit-base-token', () => {
  before(async () => {
    initTestEngine();
    await initTestEngineNetwork();
    const railgunWalletResponse = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
    );
    if (!railgunWalletResponse.railgunWalletInfo) {
      throw new Error('No railgun wallet created.');
    }
    railgunWalletID = railgunWalletResponse.railgunWalletInfo.id;
    relayAdaptPopulateDepositBaseToken = Sinon.stub(
      RelayAdaptContract.prototype,
      'populateDepositBaseToken',
    ).resolves({ data: '0x0123' } as PopulatedTransaction);
  });
  afterEach(() => {
    gasEstimateStub?.restore();
    sendTxStub?.restore();
    relayAdaptPopulateDepositBaseToken?.restore();
  });

  it('Should get gas estimate for valid deposit base token', async () => {
    stubSuccess();
    const rsp = await gasEstimateForDepositBaseToken(
      NetworkName.EthereumRopsten,
      railgunWalletID,
      MOCK_TOKEN_AMOUNTS[0],
      MOCK_ETH_WALLET_ADDRESS,
    );
    expect(rsp.error).to.be.undefined;
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(200));
  });

  it('Should error on gas estimates for invalid deposit base token', async () => {
    stubSuccess();
    const rsp = await gasEstimateForDepositBaseToken(
      NetworkName.EthereumRopsten,
      '12345',
      MOCK_TOKEN_AMOUNTS[0],
      MOCK_ETH_WALLET_ADDRESS,
    );
    expect(rsp.error).to.equal('No RAILGUN wallet for ID');
  });

  it('Should error for ethers rejections', async () => {
    stubFailure();
    const rsp = await gasEstimateForDepositBaseToken(
      NetworkName.EthereumRopsten,
      railgunWalletID,
      MOCK_TOKEN_AMOUNTS[0],
      MOCK_ETH_WALLET_ADDRESS,
    );
    expect(rsp.error).to.equal('test rejection - gas estimate');
  });

  it('Should send tx for valid deposit base token', async () => {
    stubSuccess();
    const rsp = await populateDepositBaseToken(
      NetworkName.EthereumRopsten,
      railgunWalletID,
      MOCK_TOKEN_AMOUNTS[0],
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

  it('Should error on send tx for invalid deposit base token', async () => {
    stubSuccess();
    const rsp = await populateDepositBaseToken(
      NetworkName.EthereumRopsten,
      '12345',
      MOCK_TOKEN_AMOUNTS[0],
      undefined, // gasDetailsSerialized
    );
    expect(rsp.error).to.equal('No RAILGUN wallet for ID');
  });
});
