import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon, { SinonStub } from 'sinon';
import {
  CommitmentSummary,
  createFallbackProviderFromJsonConfig,
  EVMGasType,
  NetworkName,
  TransactionGasDetails,
} from '@railgun-community/shared-models';
import {
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
} from '../../../tests/mocks.test';
import {
  gasEstimateResponse,
  getGasEstimate,
  setGasDetailsForTransaction,
} from '../tx-gas-details';
import { setFallbackProviderForNetwork } from '../../railgun';
import { ContractTransaction, FallbackProvider } from 'ethers';
import { getTestTXIDVersion } from '../../../tests/helper.test';

let gasEstimateStub: SinonStub;

const txidVersion = getTestTXIDVersion();

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
    ).resolves(BigInt('200'));

    const transaction = {} as ContractTransaction;
    const fallbackProvider = createFallbackProviderFromJsonConfig(
      MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
    );
    setFallbackProviderForNetwork(NetworkName.Polygon, fallbackProvider);
    const gasEstimate = await getGasEstimate(
      txidVersion,
      NetworkName.Polygon,
      transaction,
      MOCK_ETH_WALLET_ADDRESS,
      true, // sendWithPublicWallet
      false, // isCrossContractCall
    );

    const isGasEstimateWithDummyProof = false;
    const rsp = gasEstimateResponse(
      gasEstimate,
      undefined, // relayerFeeCommitment
      isGasEstimateWithDummyProof,
    );

    expect(gasEstimateStub.callCount).to.equal(1);
    expect(rsp.gasEstimate).to.equal(200n);
  });

  it('Should pull gas estimate for basic transaction - self-signed', async () => {
    const fallbackProvider = createFallbackProviderFromJsonConfig(
      MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
    );
    setFallbackProviderForNetwork(NetworkName.Polygon, fallbackProvider);
    const tx: ContractTransaction = {
      chainId: 1n,
      to: MOCK_ETH_WALLET_ADDRESS,
      value: BigInt('100'),
      data: '0x',
    };
    const gasEstimate = await getGasEstimate(
      txidVersion,
      NetworkName.Polygon,
      tx,
      MOCK_ETH_WALLET_ADDRESS,
      true, // sendWithPublicWallet
      false, // isCrossContractCall
    );
    const isGasEstimateWithDummyProof = true;
    const rsp = gasEstimateResponse(
      gasEstimate,
      undefined, // relayerFeeCommitment
      isGasEstimateWithDummyProof,
    );
    expect(rsp.gasEstimate).to.not.be.undefined;
  }).timeout(10000);

  it('Should pull gas estimate for basic transaction - relayer', async () => {
    const fallbackProvider = createFallbackProviderFromJsonConfig(
      MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
    );
    setFallbackProviderForNetwork(NetworkName.Polygon, fallbackProvider);
    const tx: ContractTransaction = {
      chainId: 1n,
      to: MOCK_ETH_WALLET_ADDRESS,
      value: BigInt('100'),
      data: '0x',
    };
    const gasEstimate = await getGasEstimate(
      txidVersion,
      NetworkName.Polygon,
      tx,
      MOCK_ETH_WALLET_ADDRESS,
      false, // sendWithPublicWallet
      false, // isCrossContractCall
    );
    const isGasEstimateWithDummyProof = true;
    const rsp = gasEstimateResponse(
      gasEstimate,
      {} as CommitmentSummary,
      isGasEstimateWithDummyProof,
    );
    expect(rsp.gasEstimate).to.not.be.undefined;
  }).timeout(10000);

  it('Should set gas details for populated tx', () => {
    const transaction = {} as ContractTransaction;
    const gasDetailsType0: TransactionGasDetails = {
      evmGasType: EVMGasType.Type0,
      gasEstimate: 100000n,
      gasPrice: 500n,
    };
    const gasDetailsType1: TransactionGasDetails = {
      evmGasType: EVMGasType.Type1,
      gasEstimate: 100000n,
      gasPrice: 500n,
    };
    const gasDetailsType2: TransactionGasDetails = {
      evmGasType: EVMGasType.Type2,
      gasEstimate: 120000n,
      maxFeePerGas: 10000n,
      maxPriorityFeePerGas: 500n,
    };
    // Polygon - self-sign
    setGasDetailsForTransaction(
      NetworkName.Polygon,
      transaction,
      gasDetailsType2,
      true, // sendWithPublicWallet
    );
    expect(transaction.type).to.equal(2);
    expect(transaction.gasLimit).to.equal(144000n);
    expect(transaction.gasPrice).to.be.undefined;
    expect(transaction.maxFeePerGas).to.equal(10000n);
    expect(transaction.maxPriorityFeePerGas).to.equal(500n);
    // Polygon - Relayer
    setGasDetailsForTransaction(
      NetworkName.Polygon,
      transaction,
      gasDetailsType1,
      false, // sendWithPublicWallet
    );
    // BNB - self-sign
    setGasDetailsForTransaction(
      NetworkName.BNBChain,
      transaction,
      gasDetailsType0,
      true, // sendWithPublicWallet
    );
    // BNB - Relayer
    setGasDetailsForTransaction(
      NetworkName.BNBChain,
      transaction,
      gasDetailsType0,
      false, // sendWithPublicWallet
    );
    expect(() =>
      setGasDetailsForTransaction(
        NetworkName.Polygon,
        transaction,
        gasDetailsType2, // mismatch
        true, // sendWithPublicWallet
      ),
    ).to.throw;
    expect(transaction.type).to.equal(0);
    expect(transaction.gasLimit).to.equal(120000n);
    expect(transaction.gasPrice).to.equal(500n);
  });
});
