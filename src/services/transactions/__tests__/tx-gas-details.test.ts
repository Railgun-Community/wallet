import { FallbackProvider, TransactionRequest } from '@ethersproject/providers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon, { SinonStub } from 'sinon';
import { createFallbackProviderFromJsonConfig } from '@railgun-community/shared-models/dist/models/fallback-provider';
import { PopulatedTransaction } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import {
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
} from '../../../test/mocks.test';
import { decimalToHexString } from '../../../utils/format';
import {
  gasEstimateResponse,
  getGasEstimate,
  setGasDetailsForPopulatedTransaction,
} from '../tx-gas-details';
import { EVMGasType } from '@railgun-community/shared-models/dist/models/network-config';
import { TransactionGasDetailsSerialized } from '@railgun-community/shared-models/dist/models/response-types';

let gasEstimateStub: SinonStub;

chai.use(chaiAsPromised);
const { expect } = chai;

describe('tx-gas', () => {
  afterEach(() => {
    gasEstimateStub?.restore();
  });

  it('Should format gas estimate response', async () => {
    gasEstimateStub = Sinon.stub(
      FallbackProvider.prototype,
      'estimateGas',
    ).resolves(BigNumber.from('200'));

    const populatedTransaction = {} as PopulatedTransaction;
    const fallbackProvider = createFallbackProviderFromJsonConfig(
      MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
    );
    const gasEstimate = await getGasEstimate(
      populatedTransaction,
      fallbackProvider,
      MOCK_ETH_WALLET_ADDRESS,
    );
    const rsp = gasEstimateResponse(gasEstimate);

    expect(gasEstimateStub.callCount).to.equal(1);

    expect(rsp.error).to.be.undefined;
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(200));
  });

  it('Should pull gas estimate for basic transaction', async () => {
    const fallbackProvider = createFallbackProviderFromJsonConfig(
      MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
    );
    const tx: TransactionRequest = {
      chainId: 3,
      to: MOCK_ETH_WALLET_ADDRESS,
      value: BigNumber.from('100'),
    };
    const gasEstimate = await getGasEstimate(
      tx,
      fallbackProvider,
      MOCK_ETH_WALLET_ADDRESS,
    );
    const rsp = gasEstimateResponse(gasEstimate);
    expect(rsp.error).to.be.undefined;
    expect(rsp.gasEstimateString).to.not.be.undefined;
  }).timeout(5000);

  it('Should set gas details for populated tx', () => {
    const populatedTransaction = {} as PopulatedTransaction;
    const gasDetailsSerialized: TransactionGasDetailsSerialized = {
      evmGasType: EVMGasType.Type2,
      gasEstimateString: decimalToHexString(100000),
      maxFeePerGasString: decimalToHexString(10000),
      maxPriorityFeePerGasString: decimalToHexString(500),
    };
    setGasDetailsForPopulatedTransaction(
      populatedTransaction,
      gasDetailsSerialized,
    );
    expect(populatedTransaction.gasLimit?.toHexString()).to.equal(
      decimalToHexString(120000),
    );
    expect(populatedTransaction.type).to.equal(2);
    expect(populatedTransaction.gasPrice).to.be.undefined;
    expect(populatedTransaction.maxFeePerGas?.toHexString()).to.equal(
      decimalToHexString(10000),
    );
    expect(populatedTransaction.maxPriorityFeePerGas?.toHexString()).to.equal(
      decimalToHexString(500),
    );
  });
});
