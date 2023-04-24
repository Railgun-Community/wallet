import { FallbackProvider, TransactionReceipt } from '@ethersproject/providers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon, { SinonStub, SinonSpy } from 'sinon';
import {
  RailgunWallet,
  TransactionStruct,
  TransactionBatch,
  RelayAdaptContract,
  getTokenDataERC20,
} from '@railgun-community/engine';
import {
  RailgunERC20Amount,
  NetworkName,
  NETWORK_CONFIG,
  deserializeTransaction,
  serializeUnsignedTransaction,
  EVMGasType,
  TransactionGasDetailsSerialized,
  RailgunERC20AmountRecipient,
  createFallbackProviderFromJsonConfig,
  decimalToHexString,
} from '@railgun-community/shared-models';
import { BigNumber } from '@ethersproject/bignumber';
import { PopulatedTransaction } from '@ethersproject/contracts';
import {
  initTestEngine,
  initTestEngineNetwork,
} from '../../../tests/setup.test';
import {
  MOCK_BOUND_PARAMS,
  MOCK_COMMITMENTS,
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
  MOCK_FEE_TOKEN_DETAILS,
  MOCK_FORMATTED_RELAYER_FEE_COMMITMENT_CIPHERTEXT,
  MOCK_MNEMONIC,
  MOCK_NFT_AMOUNTS,
  MOCK_NULLIFIERS,
  MOCK_TOKEN_ADDRESS,
  MOCK_TOKEN_ADDRESS_2,
  MOCK_TOKEN_AMOUNTS,
  MOCK_TOKEN_FEE,
  MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
} from '../../../tests/mocks.test';
import { createRailgunWallet } from '../../railgun/wallets/wallets';
import { fullWalletForID } from '../../railgun/core/engine';
import { setCachedProvedTransaction } from '../proof-cache';
import {
  createNFTTokenDataFromRailgunNFTAmount,
  gasEstimateForUnprovenCrossContractCalls,
  generateCrossContractCallsProof,
  getRelayAdaptTransactionError,
  populateProvedCrossContractCalls,
} from '../tx-cross-contract-calls';

let gasEstimateStub: SinonStub;
let railProveStub: SinonStub;
let railDummyProveStub: SinonStub;
let relayAdaptPopulateCrossContractCalls: SinonStub;
let addUnshieldDataSpy: SinonSpy;
let erc20NoteSpy: SinonSpy;

let railgunWallet: RailgunWallet;
let relayerFeeERC20AmountRecipient: RailgunERC20AmountRecipient;

const polygonRelayAdaptContract =
  NETWORK_CONFIG[NetworkName.Polygon].relayAdaptContract;

chai.use(chaiAsPromised);
const { expect } = chai;

const mockERC20TokenData0 = getTokenDataERC20(
  MOCK_TOKEN_AMOUNTS[0].tokenAddress,
);
const mockERC20TokenData1 = getTokenDataERC20(
  MOCK_TOKEN_AMOUNTS[1].tokenAddress,
);
const mockNFTTokenData0 = createNFTTokenDataFromRailgunNFTAmount(
  MOCK_NFT_AMOUNTS[0],
);
const mockNFTTokenData1 = createNFTTokenDataFromRailgunNFTAmount(
  MOCK_NFT_AMOUNTS[1],
);

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

const MOCK_TOKEN_AMOUNTS_DIFFERENT: RailgunERC20Amount[] = [
  {
    tokenAddress: MOCK_TOKEN_ADDRESS,
    amountString: '100',
  },
  {
    tokenAddress: MOCK_TOKEN_ADDRESS_2,
    amountString: '300',
  },
];

const overallBatchMinGasPrice = '0x1000';

const gasDetailsSerialized: TransactionGasDetailsSerialized = {
  evmGasType: EVMGasType.Type1,
  gasEstimateString: '0x00',
  gasPriceString: overallBatchMinGasPrice,
};

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

const spyOnSetUnshield = () => {
  addUnshieldDataSpy = Sinon.spy(TransactionBatch.prototype, 'addUnshieldData');
};

describe('tx-cross-contract-calls', () => {
  before(async () => {
    initTestEngine();
    await initTestEngineNetwork();
    const { railgunWalletInfo } = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!railgunWalletInfo) {
      throw new Error('Expected railgunWalletInfo');
    }
    railgunWallet = fullWalletForID(railgunWalletInfo.id);

    const { railgunWalletInfo: relayerWalletInfo } = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!relayerWalletInfo) {
      throw new Error('Expected relayerWalletInfo');
    }
    const relayerRailgunAddress = relayerWalletInfo.railgunAddress;

    relayerFeeERC20AmountRecipient = {
      ...MOCK_TOKEN_FEE,
      recipientAddress: relayerRailgunAddress,
    };

    railProveStub = Sinon.stub(
      TransactionBatch.prototype,
      'generateTransactions',
    ).resolves([
      {
        nullifiers: MOCK_NULLIFIERS,
      },
    ] as TransactionStruct[]);
    railDummyProveStub = Sinon.stub(
      TransactionBatch.prototype,
      'generateDummyTransactions',
    ).resolves([
      {
        commitments: MOCK_COMMITMENTS,
        boundParams: MOCK_BOUND_PARAMS,
        nullifiers: MOCK_NULLIFIERS,
      },
    ] as unknown as TransactionStruct[]);
    relayAdaptPopulateCrossContractCalls = Sinon.stub(
      RelayAdaptContract.prototype,
      'populateCrossContractCalls',
    ).resolves({ data: '0x0123' } as PopulatedTransaction);
  });
  afterEach(() => {
    gasEstimateStub?.restore();
    addUnshieldDataSpy?.restore();
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
    spyOnSetUnshield();
    const rsp = await gasEstimateForUnprovenCrossContractCalls(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS,
      MOCK_NFT_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      MOCK_NFT_AMOUNTS,
      mockCrossContractCallsSerialized,
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.error).to.be.undefined;
    expect(rsp.relayerFeeCommitment).to.not.be.undefined;
    expect(rsp.relayerFeeCommitment?.commitmentCiphertext).to.deep.equal(
      MOCK_FORMATTED_RELAYER_FEE_COMMITMENT_CIPHERTEXT,
    );
    expect(addUnshieldDataSpy.called).to.be.true;
    expect(addUnshieldDataSpy.args).to.deep.equal([
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockERC20TokenData0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // run 1 - erc20 1
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockERC20TokenData1,
          value: BigInt('0x0200'),
          allowOverride: false,
        },
      ], // run 1 - erc20 2
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockNFTTokenData0,
          value: BigInt('1'),
          allowOverride: false,
        },
      ], // run 1 - nft 0
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockNFTTokenData1,
          value: BigInt('2'),
          allowOverride: false,
        },
      ], // run 1 - nft 1
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockERC20TokenData0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // run 2 - erc20 1
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockERC20TokenData1,
          value: BigInt('0x0200'),
          allowOverride: false,
        },
      ], // run 2 - erc20 2
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockNFTTokenData0,
          value: BigInt('1'),
          allowOverride: false,
        },
      ], // run 2 - nft 0
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockNFTTokenData1,
          value: BigInt('2'),
          allowOverride: false,
        },
      ], // run 2 - nft 1
    ]);
    // Add 7500 for the dummy tx variance
    // expect(rsp.gasEstimateString).to.equal(decimalToHexString(7500 + 280));
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(2_800_000)); // Cross Contract Minimum
  }).timeout(10000);

  it('Should get gas estimates for valid cross contract calls, public wallet', async () => {
    stubGasEstimateSuccess();
    spyOnSetUnshield();
    const rsp = await gasEstimateForUnprovenCrossContractCalls(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS,
      MOCK_NFT_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      MOCK_NFT_AMOUNTS,
      mockCrossContractCallsSerialized,
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      true, // sendWithPublicWallet
    );

    expect(rsp.error).to.be.undefined;
    expect(rsp.relayerFeeCommitment).to.be.undefined;
    expect(addUnshieldDataSpy.called).to.be.true;
    expect(addUnshieldDataSpy.args).to.deep.equal([
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockERC20TokenData0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // run 1 - erc20 1
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockERC20TokenData1,
          value: BigInt('0x0200'),
          allowOverride: false,
        },
      ], // run 1 - erc20 2
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockNFTTokenData0,
          value: BigInt('1'),
          allowOverride: false,
        },
      ], // run 1 - nft 0
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockNFTTokenData1,
          value: BigInt('2'),
          allowOverride: false,
        },
      ], // run 1 - nft 1
    ]);
    // Add 7500 for the dummy tx variance
    // expect(rsp.gasEstimateString).to.equal(decimalToHexString(7500 + 280));
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(2_800_000)); // Cross Contract Minimum
  }).timeout(10000);

  it('Should error on gas estimates for invalid cross contract calls', async () => {
    stubGasEstimateSuccess();
    const rsp = await gasEstimateForUnprovenCrossContractCalls(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS,
      MOCK_NFT_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      MOCK_NFT_AMOUNTS,
      ['abc'], // Invalid
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.error).to.equal('Invalid cross contract calls.');
  });

  it('Should error on cross contract calls gas estimate for ethers rejections', async () => {
    stubGasEstimateFailure();
    const rsp = await gasEstimateForUnprovenCrossContractCalls(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS,
      MOCK_NFT_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      MOCK_NFT_AMOUNTS,
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
    spyOnSetUnshield();
    const proofResponse = await generateCrossContractCallsProof(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS,
      MOCK_NFT_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      MOCK_NFT_AMOUNTS,
      mockCrossContractCallsSerialized,
      relayerFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      () => {}, // progressCallback
    );
    expect(proofResponse.error).to.be.undefined;
    expect(addUnshieldDataSpy.called).to.be.true;
    expect(addUnshieldDataSpy.args).to.deep.equal([
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockERC20TokenData0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // dummy proof - erc20 token 0
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockERC20TokenData1,
          value: BigInt('0x0200'),
          allowOverride: false,
        },
      ], // dummy proof - erc20 token 1
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockNFTTokenData0,
          value: BigInt('1'),
          allowOverride: false,
        },
      ], // dummy proof - nft 0
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockNFTTokenData1,
          value: BigInt('2'),
          allowOverride: false,
        },
      ], // actual proof - nft 1
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockERC20TokenData0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // actual proof - erc20 token 0
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockERC20TokenData1,
          value: BigInt('0x0200'),
          allowOverride: false,
        },
      ], // actual proof - erc20 token 1
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockNFTTokenData0,
          value: BigInt('1'),
          allowOverride: false,
        },
      ], // actual proof - nft 0
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockNFTTokenData1,
          value: BigInt('2'),
          allowOverride: false,
        },
      ], // actual proof - nft 1
    ]);
    const populateResponse = await populateProvedCrossContractCalls(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNTS,
      MOCK_NFT_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      MOCK_NFT_AMOUNTS,
      mockCrossContractCallsSerialized,
      relayerFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      gasDetailsSerialized, // gasDetailsSerialized
    );
    expect(populateResponse.error).to.be.undefined;
    expect(populateResponse.serializedTransaction).to.equal(
      '0x01cc8080821000808080820123c0',
    );
    expect(populateResponse.nullifiers).to.deep.equal([
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000000000000000000000000000002',
    ]);

    const deserialized = deserializeTransaction(
      populateResponse.serializedTransaction as string,
      2,
      1,
    );

    expect(deserialized.nonce).to.equal(2);
    expect(deserialized.gasPrice?.toString()).to.equal('4096');
    expect(deserialized.gasLimit).to.equal(undefined);
    expect(deserialized.value?.toString()).to.equal('0');
    expect(deserialized.data).to.equal('0x0123');
    expect(deserialized.to).to.equal(null);
    expect(deserialized.chainId).to.equal(1);
    expect(deserialized.type).to.equal(1);
    expect(Object.keys(deserialized).length).to.equal(8);
  });

  it('Should error on populate tx for invalid cross contract calls', async () => {
    stubGasEstimateSuccess();
    const rsp = await populateProvedCrossContractCalls(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNTS_DIFFERENT,
      MOCK_NFT_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      MOCK_NFT_AMOUNTS,
      ['123'], // Invalid
      relayerFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      gasDetailsSerialized,
    );
    expect(rsp.error).to.equal(
      'Invalid proof for this transaction. Mismatch: relayAdaptUnshieldERC20Amounts.',
    );
  });

  it('Should error on populate cross contract calls tx for unproved transaction', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    const rsp = await populateProvedCrossContractCalls(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNTS,
      MOCK_NFT_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      MOCK_NFT_AMOUNTS,
      mockCrossContractCallsSerialized,
      relayerFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      gasDetailsSerialized,
    );
    expect(rsp.error).to.equal(
      'Invalid proof for this transaction. No proof found.',
    );
  });

  it('Should error on populate cross contract calls tx when params changed (invalid cached proof)', async () => {
    stubGasEstimateSuccess();
    const proofResponse = await generateCrossContractCallsProof(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS,
      MOCK_NFT_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      MOCK_NFT_AMOUNTS,
      mockCrossContractCallsSerialized,
      relayerFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      () => {}, // progressCallback
    );
    expect(proofResponse.error).to.be.undefined;
    const rsp = await populateProvedCrossContractCalls(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNTS_DIFFERENT,
      MOCK_NFT_AMOUNTS,
      MOCK_TOKEN_AMOUNTS.map(t => t.tokenAddress),
      MOCK_NFT_AMOUNTS,
      mockCrossContractCallsSerialized,
      relayerFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      gasDetailsSerialized,
    );
    expect(rsp.error).to.equal(
      'Invalid proof for this transaction. Mismatch: relayAdaptUnshieldERC20Amounts.',
    );
  });

  it.skip('Should invalidate cross contract call as unsuccessful', async () => {
    const provider = createFallbackProviderFromJsonConfig(
      MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
    );
    const txReceipt: TransactionReceipt = await provider.getTransactionReceipt(
      '0x56c3b9bfb573e6f49f21b8e09282edd01a93bbb965b1f4debbf7316ea3d878dd',
    );
    expect(txReceipt).to.not.equal(
      null,
      'Could not get live transaction receipt (RPC error)',
    );
    expect(getRelayAdaptTransactionError(txReceipt.logs)).to.equal(
      'Unknown Relay Adapt error.',
    );

    const txReceipt2: TransactionReceipt = await provider.getTransactionReceipt(
      '0xeeaf0c55b4c34516402ce1c0d1eb4e3d2664b11204f2fc9988ec57ae7a1220ff',
    );
    expect(txReceipt).to.not.equal(
      null,
      'Could not get live transaction receipt (RPC error)',
    );
    expect(getRelayAdaptTransactionError(txReceipt2.logs)).to.equal(
      'ERC20: transfer amount exceeds allowance',
    );
  }).timeout(10000);
});
