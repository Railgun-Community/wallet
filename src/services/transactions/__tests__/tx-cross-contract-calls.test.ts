import {
  FallbackProvider,
  JsonRpcProvider,
  TransactionReceipt,
} from '@ethersproject/providers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon, { SinonStub, SinonSpy } from 'sinon';
import { Wallet as RailgunWallet } from '@railgun-community/engine/dist/wallet/wallet';
import { RailgunWalletTokenAmount } from '@railgun-community/shared-models/dist/models/response-types';
import {
  NetworkName,
  NETWORK_CONFIG,
} from '@railgun-community/shared-models/dist/models/network-config';
import { BigNumber } from '@ethersproject/bignumber';
import { PopulatedTransaction } from '@ethersproject/contracts';
import {
  deserializeTransaction,
  serializeUnsignedTransaction,
} from '@railgun-community/shared-models/dist/utils/serializer';
import { SerializedTransaction } from '@railgun-community/engine/dist/models/formatted-types';
import {
  initTestEngine,
  initTestEngineNetwork,
} from '../../../test/setup.test';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_FEE_TOKEN_DETAILS,
  MOCK_MNEMONIC,
  MOCK_TOKEN_ADDRESS,
  MOCK_TOKEN_ADDRESS_2,
  MOCK_TOKEN_AMOUNTS,
  MOCK_TOKEN_FEE,
  MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
  TEST_POLYGON_RPC,
} from '../../../test/mocks.test';
import { createRailgunWallet } from '../../railgun/wallets/wallets';
import { fullWalletForID } from '../../railgun/core/engine';
import { setCachedProvedTransaction } from '../proof-cache';
import { decimalToHexString } from '../../../utils/format';
import { TransactionBatch } from '@railgun-community/engine/dist/transaction/transaction-batch';
import { RelayAdaptContract } from '@railgun-community/engine/dist/contracts/relay-adapt';
import {
  gasEstimateForUnprovenCrossContractCalls,
  generateCrossContractCallsProof,
  getRelayAdaptTransactionError,
  populateProvedCrossContractCalls,
} from '../tx-cross-contract-calls';

let gasEstimateStub: SinonStub;
let railProveStub: SinonStub;
let railDummyProveStub: SinonStub;
let relayAdaptPopulateCrossContractCalls: SinonStub;
let setWithdrawSpy: SinonSpy;
let erc20NoteSpy: SinonSpy;

let railgunWallet: RailgunWallet;
let railgunWalletAddress: string;
let relayerRailgunAddress: string;

const ropstenRelayAdaptContract =
  NETWORK_CONFIG[NetworkName.EthereumRopsten].relayAdaptContract;

chai.use(chaiAsPromised);
const { expect } = chai;

const mockCrossContractCalls: PopulatedTransaction[] = [
  {
    to: MOCK_ETH_WALLET_ADDRESS,
    data: '0x0789',
    value: BigNumber.from('0x01'),
  },
  {
    to: MOCK_ETH_WALLET_ADDRESS,
    data: '0x9789',
    value: BigNumber.from('0x02'),
  },
];
const mockCrossContractCallsSerialized: string[] = mockCrossContractCalls.map(
  serializeUnsignedTransaction,
);

const MOCK_TOKEN_AMOUNTS_DIFFERENT: RailgunWalletTokenAmount[] = [
  {
    tokenAddress: MOCK_TOKEN_ADDRESS,
    amountString: '100',
  },
  {
    tokenAddress: MOCK_TOKEN_ADDRESS_2,
    amountString: '300',
  },
];

const stubGasEstimateSuccess = () => {
  gasEstimateStub = Sinon.stub(
    FallbackProvider.prototype,
    'estimateGas',
  ).resolves(BigNumber.from('200'));
};

const stubGasEstimateFailure = () => {
  gasEstimateStub = Sinon.stub(
    FallbackProvider.prototype,
    'estimateGas',
  ).rejects(new Error('test rejection - gas estimate'));
};

const spyOnSetWithdraw = () => {
  setWithdrawSpy = Sinon.spy(TransactionBatch.prototype, 'setWithdraw');
};

describe('tx-cross-contract-calls', () => {
  before(async () => {
    initTestEngine();
    await initTestEngineNetwork();
    const { railgunWalletInfo } = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
    );
    if (!railgunWalletInfo) {
      throw new Error('Expected railgunWalletInfo');
    }
    railgunWallet = fullWalletForID(railgunWalletInfo.id);
    railgunWalletAddress = railgunWallet.getAddress(undefined);

    const { railgunWalletInfo: relayerWalletInfo } = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
    );
    if (!relayerWalletInfo) {
      throw new Error('Expected relayerWalletInfo');
    }
    relayerRailgunAddress = relayerWalletInfo.railgunAddress;

    railProveStub = Sinon.stub(
      TransactionBatch.prototype,
      'generateSerializedTransactions',
    ).resolves([{}] as SerializedTransaction[]);
    railDummyProveStub = Sinon.stub(
      TransactionBatch.prototype,
      'generateDummySerializedTransactions',
    ).resolves([
      {
        commitments: [BigInt(2)],
        nullifiers: [BigInt(1), BigInt(2)],
      },
    ] as SerializedTransaction[]);
    relayAdaptPopulateCrossContractCalls = Sinon.stub(
      RelayAdaptContract.prototype,
      'populateCrossContractCalls',
    ).resolves({ data: '0x0123' } as PopulatedTransaction);
  });
  afterEach(() => {
    gasEstimateStub?.restore();
    setWithdrawSpy?.restore();
    erc20NoteSpy?.restore();
  });
  after(() => {
    railProveStub.restore();
    railDummyProveStub.restore();
    relayAdaptPopulateCrossContractCalls.restore();
  });

  // WITHDRAW - GAS ESTIMATE

  it('Should get gas estimates for valid cross contract calls', async () => {
    stubGasEstimateSuccess();
    spyOnSetWithdraw();
    const rsp = await gasEstimateForUnprovenCrossContractCalls(
      NetworkName.EthereumRopsten,
      railgunWalletAddress,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      mockCrossContractCallsSerialized,
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.error).to.be.undefined;
    expect(setWithdrawSpy.called).to.be.true;
    expect(setWithdrawSpy.args).to.deep.equal([
      [ropstenRelayAdaptContract, '0x0100', false], // run 1 - token 1
      [ropstenRelayAdaptContract, '0x0200', false], // run 1 - token 2
      [ropstenRelayAdaptContract, '0x0100', false], // run 2 - token 1
      [ropstenRelayAdaptContract, '0x0200', false], // run 2 - token 2
    ]);
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(280));
  });

  it('Should get gas estimates for valid cross contract calls: public wallet', async () => {
    stubGasEstimateSuccess();
    spyOnSetWithdraw();
    const rsp = await gasEstimateForUnprovenCrossContractCalls(
      NetworkName.EthereumRopsten,
      railgunWalletAddress,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      mockCrossContractCallsSerialized,
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      true, // sendWithPublicWallet
    );
    expect(rsp.error).to.be.undefined;
    expect(setWithdrawSpy.called).to.be.true;
    expect(setWithdrawSpy.args).to.deep.equal([
      [ropstenRelayAdaptContract, '0x0100', false],
      [ropstenRelayAdaptContract, '0x0200', false],
    ]);
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(280));
  });

  it('Should error on gas estimates for invalid cross contract calls', async () => {
    stubGasEstimateSuccess();
    const rsp = await gasEstimateForUnprovenCrossContractCalls(
      NetworkName.EthereumRopsten,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      mockCrossContractCallsSerialized,
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.error).to.equal('Invalid RAILGUN address.');
  });

  it('Should error on cross contract calls gas estimate for ethers rejections', async () => {
    stubGasEstimateFailure();
    const rsp = await gasEstimateForUnprovenCrossContractCalls(
      NetworkName.EthereumRopsten,
      railgunWalletAddress,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      mockCrossContractCallsSerialized,
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.error).to.equal('test rejection - gas estimate');
  });

  // WITHDRAW - PROVE AND SEND

  it('Should populate tx for valid cross contract calls', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    spyOnSetWithdraw();
    const proofResponse = await generateCrossContractCallsProof(
      NetworkName.EthereumRopsten,
      railgunWalletAddress,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      mockCrossContractCallsSerialized,
      relayerRailgunAddress,
      MOCK_TOKEN_FEE,
      false, // sendWithPublicAddress
      () => {}, // progressCallback
    );
    expect(proofResponse.error).to.be.undefined;
    expect(setWithdrawSpy.called).to.be.true;
    expect(setWithdrawSpy.args).to.deep.equal([
      [ropstenRelayAdaptContract, '0x0100', false], // dummy proof #1
      [ropstenRelayAdaptContract, '0x0200', false], // dummy proof #2
      [ropstenRelayAdaptContract, '0x0100', false], // actual proof #1
      [ropstenRelayAdaptContract, '0x0200', false], // actual proof #2
    ]);
    const populateResponse = await populateProvedCrossContractCalls(
      NetworkName.EthereumRopsten,
      railgunWalletAddress,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      mockCrossContractCallsSerialized,
      relayerRailgunAddress,
      MOCK_TOKEN_FEE,
      false, // sendWithPublicAddress
      undefined, // gasDetailsSerialized
    );
    expect(populateResponse.error).to.be.undefined;
    expect(populateResponse.serializedTransaction).to.equal(
      '0xc88080808080820123',
    );

    const deserialized = deserializeTransaction(
      populateResponse.serializedTransaction as string,
      2,
      1,
    );

    expect(deserialized.nonce).to.equal(2);
    expect(deserialized.gasPrice?.toString()).to.equal('0');
    expect(deserialized.gasLimit?.toString()).to.equal('0');
    expect(deserialized.value?.toString()).to.equal('0');
    expect(deserialized.data).to.equal('0x0123');
    expect(deserialized.to).to.equal(null);
    expect(deserialized.chainId).to.equal(1);
    expect(deserialized.type).to.equal(undefined);
    expect(Object.keys(deserialized).length).to.equal(8);
  });

  it('Should error on populate tx for invalid cross contract calls', async () => {
    stubGasEstimateSuccess();
    const rsp = await populateProvedCrossContractCalls(
      NetworkName.EthereumRopsten,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      mockCrossContractCallsSerialized,
      relayerRailgunAddress,
      MOCK_TOKEN_FEE,
      false, // sendWithPublicAddress
      undefined, // gasDetailsSerialized
    );
    expect(rsp.error).to.equal('Invalid RAILGUN address.');
  });

  it('Should error on populate cross contract calls tx for unproved transaction', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    const rsp = await populateProvedCrossContractCalls(
      NetworkName.EthereumRopsten,
      railgunWalletAddress,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      mockCrossContractCallsSerialized,
      relayerRailgunAddress,
      MOCK_TOKEN_FEE,
      false, // sendWithPublicAddress
      undefined, // gasDetailsSerialized
    );
    expect(rsp.error).to.equal('Transaction has not been proven.');
  });

  it('Should error on populate cross contract calls tx when params changed (invalid cached proof)', async () => {
    stubGasEstimateSuccess();
    const proofResponse = await generateCrossContractCallsProof(
      NetworkName.EthereumRopsten,
      railgunWalletAddress,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      mockCrossContractCallsSerialized,
      relayerRailgunAddress,
      MOCK_TOKEN_FEE,
      false, // sendWithPublicAddress
      () => {}, // progressCallback
    );
    expect(proofResponse.error).to.be.undefined;
    const rsp = await populateProvedCrossContractCalls(
      NetworkName.EthereumRopsten,
      railgunWalletAddress,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNTS_DIFFERENT,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      mockCrossContractCallsSerialized,
      relayerRailgunAddress,
      MOCK_TOKEN_FEE,
      false, // sendWithPublicAddress
      undefined, // gasDetailsSerialized
    );
    expect(rsp.error).to.equal('Transaction has not been proven.');
  });

  it('Should invalidate cross contract call as unsuccessful', async () => {
    const provider = new JsonRpcProvider(TEST_POLYGON_RPC);
    const txReceipt: TransactionReceipt = await provider.getTransactionReceipt(
      '0x56c3b9bfb573e6f49f21b8e09282edd01a93bbb965b1f4debbf7316ea3d878dd',
    );
    expect(getRelayAdaptTransactionError(txReceipt.logs)).to.equal(
      'Unknown Relay Adapt error.',
    );

    const txReceipt2: TransactionReceipt = await provider.getTransactionReceipt(
      '0xeeaf0c55b4c34516402ce1c0d1eb4e3d2664b11204f2fc9988ec57ae7a1220ff',
    );
    expect(getRelayAdaptTransactionError(txReceipt2.logs)).to.equal(
      'ERC20: transfer amount exceeds allowance',
    );
  }).timeout(10000);
});
