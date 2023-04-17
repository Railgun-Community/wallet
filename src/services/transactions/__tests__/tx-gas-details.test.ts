import { FallbackProvider, TransactionRequest } from '@ethersproject/providers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon, { SinonStub } from 'sinon';
import {
  createFallbackProviderFromJsonConfig,
  decimalToHexString,
  EVMGasType,
  NetworkName,
  TransactionGasDetailsSerialized,
} from '@railgun-community/shared-models';
import { PopulatedTransaction } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import {
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
} from '../../../tests/mocks.test';
import {
  gasEstimateResponse,
  getGasEstimate,
  setGasDetailsForPopulatedTransaction,
} from '../tx-gas-details';
import { setProviderForNetwork } from '../../railgun';

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
    setProviderForNetwork(NetworkName.Polygon, fallbackProvider);
    const gasEstimate = await getGasEstimate(
      NetworkName.Polygon,
      populatedTransaction,
      MOCK_ETH_WALLET_ADDRESS,
      true, // sendWithPublicWallet
    );

    const isGasEstimateWithDummyProof = false;
    const rsp = gasEstimateResponse(gasEstimate, isGasEstimateWithDummyProof);

    expect(gasEstimateStub.callCount).to.equal(1);

    expect(rsp.error).to.be.undefined;
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(200));
  });

  it('Should pull gas estimate for basic transaction - self-signed', async () => {
    const fallbackProvider = createFallbackProviderFromJsonConfig(
      MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
    );
    setProviderForNetwork(NetworkName.Polygon, fallbackProvider);
    const tx: TransactionRequest = {
      chainId: 1,
      to: MOCK_ETH_WALLET_ADDRESS,
      value: BigNumber.from('100'),
    };
    const gasEstimate = await getGasEstimate(
      NetworkName.Polygon,
      tx,
      MOCK_ETH_WALLET_ADDRESS,
      true, // sendWithPublicWallet
    );
    const isGasEstimateWithDummyProof = true;
    const rsp = gasEstimateResponse(gasEstimate, isGasEstimateWithDummyProof);
    expect(rsp.error).to.be.undefined;
    expect(rsp.gasEstimateString).to.not.be.undefined;
  }).timeout(10000);

  it('Should pull gas estimate for basic transaction - relayer', async () => {
    const fallbackProvider = createFallbackProviderFromJsonConfig(
      MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
    );
    setProviderForNetwork(NetworkName.Polygon, fallbackProvider);
    const tx: TransactionRequest = {
      chainId: 1,
      to: MOCK_ETH_WALLET_ADDRESS,
      value: BigNumber.from('100'),
    };
    const gasEstimate = await getGasEstimate(
      NetworkName.Polygon,
      tx,
      MOCK_ETH_WALLET_ADDRESS,
      false, // sendWithPublicWallet
    );
    const isGasEstimateWithDummyProof = true;
    const rsp = gasEstimateResponse(gasEstimate, isGasEstimateWithDummyProof);
    expect(rsp.error).to.be.undefined;
    expect(rsp.gasEstimateString).to.not.be.undefined;
  }).timeout(10000);

  it('Should set gas details for populated tx', () => {
    const populatedTransaction = {} as PopulatedTransaction;
    const gasDetailsSerializedType0: TransactionGasDetailsSerialized = {
      evmGasType: EVMGasType.Type0,
      gasEstimateString: decimalToHexString(100000),
      gasPriceString: decimalToHexString(500),
    };
    const gasDetailsSerializedType1: TransactionGasDetailsSerialized = {
      evmGasType: EVMGasType.Type1,
      gasEstimateString: decimalToHexString(100000),
      gasPriceString: decimalToHexString(500),
    };
    const gasDetailsSerializedType2: TransactionGasDetailsSerialized = {
      evmGasType: EVMGasType.Type2,
      gasEstimateString: decimalToHexString(120000),
      maxFeePerGasString: decimalToHexString(10000),
      maxPriorityFeePerGasString: decimalToHexString(500),
    };
    // Polygon - self-sign
    setGasDetailsForPopulatedTransaction(
      NetworkName.Polygon,
      populatedTransaction,
      gasDetailsSerializedType2,
      true, // sendWithPublicWallet
    );
    expect(populatedTransaction.type).to.equal(2);
    expect(populatedTransaction.gasLimit?.toHexString()).to.equal(
      decimalToHexString(144000),
    );
    expect(populatedTransaction.gasPrice).to.be.undefined;
    expect(populatedTransaction.maxFeePerGas?.toHexString()).to.equal(
      decimalToHexString(10000),
    );
    expect(populatedTransaction.maxPriorityFeePerGas?.toHexString()).to.equal(
      decimalToHexString(500),
    );
    // Polygon - Relayer
    setGasDetailsForPopulatedTransaction(
      NetworkName.Polygon,
      populatedTransaction,
      gasDetailsSerializedType1,
      false, // sendWithPublicWallet
    );
    // BNB - self-sign
    setGasDetailsForPopulatedTransaction(
      NetworkName.BNBChain,
      populatedTransaction,
      gasDetailsSerializedType0,
      true, // sendWithPublicWallet
    );
    // BNB - Relayer
    setGasDetailsForPopulatedTransaction(
      NetworkName.BNBChain,
      populatedTransaction,
      gasDetailsSerializedType0,
      false, // sendWithPublicWallet
    );
    expect(() =>
      setGasDetailsForPopulatedTransaction(
        NetworkName.Polygon,
        populatedTransaction,
        gasDetailsSerializedType2, // mismatch
        true, // sendWithPublicWallet
      ),
    ).to.throw;
    expect(populatedTransaction.type).to.equal(0);
    expect(populatedTransaction.gasLimit?.toHexString()).to.equal(
      decimalToHexString(120000),
    );
    expect(populatedTransaction.gasPrice?.toHexString()).to.equal(
      decimalToHexString(500),
    );
  });
});
