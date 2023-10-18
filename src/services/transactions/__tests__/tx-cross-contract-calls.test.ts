import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon, { SinonStub, SinonSpy } from 'sinon';
import {
  RailgunWallet,
  TransactionStruct,
  TransactionBatch,
  RelayAdaptContract,
  getTokenDataERC20,
  MINIMUM_RELAY_ADAPT_CROSS_CONTRACT_CALLS_GAS_LIMIT,
} from '@railgun-community/engine';
import {
  RailgunERC20Amount,
  NetworkName,
  NETWORK_CONFIG,
  EVMGasType,
  RailgunERC20AmountRecipient,
  TransactionGasDetails,
  isDefined,
  TXIDVersion,
} from '@railgun-community/shared-models';
import {
  closeTestEngine,
  initTestEngine,
  initTestEngineNetwork,
} from '../../../tests/setup.test';
import {
  MOCK_BOUND_PARAMS,
  MOCK_COMMITMENTS,
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_ERC20_RECIPIENTS,
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_FEE_TOKEN_DETAILS,
  MOCK_FORMATTED_RELAYER_FEE_COMMITMENT_CIPHERTEXT,
  MOCK_MNEMONIC,
  MOCK_NFT_AMOUNTS,
  MOCK_NFT_AMOUNT_RECIPIENTS,
  MOCK_NULLIFIERS,
  MOCK_TOKEN_ADDRESS,
  MOCK_TOKEN_ADDRESS_2,
  MOCK_TOKEN_AMOUNTS,
  MOCK_TOKEN_FEE,
  MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
} from '../../../tests/mocks.test';
import {
  createRailgunWallet,
  fullWalletForID,
} from '../../railgun/wallets/wallets';
import { setCachedProvedTransaction } from '../proof-cache';
import {
  createNFTTokenDataFromRailgunNFTAmount,
  gasEstimateForUnprovenCrossContractCalls,
  generateCrossContractCallsProof,
  getRelayAdaptTransactionError,
  parseRelayAdaptReturnValue,
  populateProvedCrossContractCalls,
} from '../tx-cross-contract-calls';
import FormattedRelayAdaptErrorLogs from './json/formatted-relay-adapt-error-logs.json';
import { ContractTransaction, FallbackProvider } from 'ethers';

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

const txidVersion = TXIDVersion.V2_PoseidonMerkle;

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

const mockCrossContractCalls: ContractTransaction[] = [
  {
    to: MOCK_ETH_WALLET_ADDRESS,
    data: '0x0789',
    value: BigInt('0x01'),
  },
  {
    to: MOCK_ETH_WALLET_ADDRESS,
    data: '0x9789',
    value: BigInt('0x02'),
  },
];

const MOCK_TOKEN_AMOUNTS_DIFFERENT: RailgunERC20Amount[] = [
  {
    tokenAddress: MOCK_TOKEN_ADDRESS,
    amount: 100n,
  },
  {
    tokenAddress: MOCK_TOKEN_ADDRESS_2,
    amount: 300n,
  },
];

const overallBatchMinGasPrice = BigInt('0x1000');

const minGasLimit = MINIMUM_RELAY_ADAPT_CROSS_CONTRACT_CALLS_GAS_LIMIT;

const gasDetails: TransactionGasDetails = {
  evmGasType: EVMGasType.Type1,
  gasEstimate: 2000n,
  gasPrice: overallBatchMinGasPrice,
};

const stubGasEstimateSuccess = () => {
  gasEstimateStub = Sinon.stub(
    FallbackProvider.prototype,
    'estimateGas',
  ).resolves(BigInt('200'));
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
  before(async function run() {
    this.timeout(30000);
    initTestEngine();
    await initTestEngineNetwork();
    const railgunWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!isDefined(railgunWalletInfo)) {
      throw new Error('Expected railgunWalletInfo');
    }
    railgunWallet = fullWalletForID(railgunWalletInfo.id);

    const relayerWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!isDefined(relayerWalletInfo)) {
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
    ).resolves({
      provedTransactions: [
        {
          nullifiers: MOCK_NULLIFIERS,
        },
      ] as TransactionStruct[],
      preTransactionPOIsPerTxidLeafPerList: {},
    });
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
    ).resolves({ data: '0x0123' } as ContractTransaction);
  });
  afterEach(() => {
    gasEstimateStub?.restore();
    addUnshieldDataSpy?.restore();
    erc20NoteSpy?.restore();
  });
  after(async () => {
    railProveStub.restore();
    railDummyProveStub.restore();
    relayAdaptPopulateCrossContractCalls.restore();
    await closeTestEngine();
  });

  // GAS ESTIMATE

  it('Should get gas estimates for valid cross contract calls', async () => {
    stubGasEstimateSuccess();
    spyOnSetUnshield();
    const rsp = await gasEstimateForUnprovenCrossContractCalls(
      txidVersion,
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS,
      MOCK_NFT_AMOUNTS,
      MOCK_ERC20_RECIPIENTS,
      MOCK_NFT_AMOUNT_RECIPIENTS,
      mockCrossContractCalls,
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
      minGasLimit,
    );
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
    // expect(rsp.gasEstimate).to.equal(7500n + 280n);
    expect(rsp.gasEstimate).to.equal(3_200_000n); // Cross Contract Minimum
  }).timeout(10000);

  it('Should get gas estimates for valid cross contract calls, public wallet', async () => {
    stubGasEstimateSuccess();
    spyOnSetUnshield();
    const rsp = await gasEstimateForUnprovenCrossContractCalls(
      txidVersion,
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS,
      MOCK_NFT_AMOUNTS,
      MOCK_ERC20_RECIPIENTS,
      MOCK_NFT_AMOUNT_RECIPIENTS,
      mockCrossContractCalls,
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      true, // sendWithPublicWallet
      minGasLimit,
    );

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
    // expect(rsp.gasEstimate).to.equal(7500n + 280n);
    expect(rsp.gasEstimate).to.equal(3_200_000n); // Cross Contract Minimum
  }).timeout(10000);

  it('Should error on gas estimates for invalid cross contract calls', async () => {
    stubGasEstimateSuccess();
    await expect(
      gasEstimateForUnprovenCrossContractCalls(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_DB_ENCRYPTION_KEY,
        MOCK_TOKEN_AMOUNTS,
        MOCK_NFT_AMOUNTS,
        MOCK_ERC20_RECIPIENTS,
        MOCK_NFT_AMOUNT_RECIPIENTS,
        [{ data: 'abc' } as ContractTransaction], // Invalid
        MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
        MOCK_FEE_TOKEN_DETAILS,
        false, // sendWithPublicWallet
        minGasLimit,
      ),
    ).rejectedWith(`Cross-contract calls require to and data fields.`);
  });

  it('Should error on cross contract calls gas estimate for ethers rejections', async () => {
    stubGasEstimateFailure();
    await expect(
      gasEstimateForUnprovenCrossContractCalls(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_DB_ENCRYPTION_KEY,
        MOCK_TOKEN_AMOUNTS,
        MOCK_NFT_AMOUNTS,
        MOCK_ERC20_RECIPIENTS,
        MOCK_NFT_AMOUNT_RECIPIENTS,
        mockCrossContractCalls,
        MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
        MOCK_FEE_TOKEN_DETAILS,
        false, // sendWithPublicWallet
        minGasLimit,
      ),
    ).rejectedWith(
      'RelayAdapt multicall failed at index UNKNOWN with error: test rejection - gas estimate',
    );
  });

  // PROVE AND SEND

  it('Should populate tx for valid cross contract calls', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    spyOnSetUnshield();
    await generateCrossContractCallsProof(
      txidVersion,
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS,
      MOCK_NFT_AMOUNTS,
      MOCK_ERC20_RECIPIENTS,
      MOCK_NFT_AMOUNT_RECIPIENTS,
      mockCrossContractCalls,
      relayerFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      minGasLimit,
      () => {}, // progressCallback
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
      txidVersion,
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNTS,
      MOCK_NFT_AMOUNTS,
      MOCK_ERC20_RECIPIENTS,
      MOCK_NFT_AMOUNT_RECIPIENTS,
      mockCrossContractCalls,
      relayerFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      gasDetails, // gasDetails
    );
    expect(populateResponse.nullifiers).to.deep.equal([
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000000000000000000000000000002',
    ]);

    const { transaction } = populateResponse;

    expect(transaction.nonce).to.equal(undefined);
    expect(transaction.gasPrice?.toString()).to.equal('4096');
    expect(transaction.gasLimit).to.equal(2400n);
    expect(transaction.value?.toString()).to.equal(undefined);
    expect(transaction.data).to.equal('0x0123');
    expect(transaction.to).to.equal(undefined);
    expect(transaction.chainId).to.equal(undefined);
    expect(transaction.type).to.equal(1);
  });

  it('Should error on populate tx for invalid cross contract calls', async () => {
    stubGasEstimateSuccess();
    await expect(
      populateProvedCrossContractCalls(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_TOKEN_AMOUNTS_DIFFERENT,
        MOCK_NFT_AMOUNTS,
        MOCK_ERC20_RECIPIENTS,
        MOCK_NFT_AMOUNT_RECIPIENTS,
        [{ data: '123' } as ContractTransaction], // Invalid
        relayerFeeERC20AmountRecipient,
        false, // sendWithPublicWallet
        overallBatchMinGasPrice,
        gasDetails,
      ),
    ).rejectedWith(
      'Invalid proof for this transaction. Mismatch: relayAdaptUnshieldERC20Amounts.',
    );
  });

  it('Should error on populate cross contract calls tx for unproved transaction', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    await expect(
      populateProvedCrossContractCalls(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_TOKEN_AMOUNTS,
        MOCK_NFT_AMOUNTS,
        MOCK_ERC20_RECIPIENTS,
        MOCK_NFT_AMOUNT_RECIPIENTS,
        mockCrossContractCalls,
        relayerFeeERC20AmountRecipient,
        false, // sendWithPublicWallet
        overallBatchMinGasPrice,
        gasDetails,
      ),
    ).rejectedWith('Invalid proof for this transaction. No proof found.');
  });

  it('Should error on populate cross contract calls tx when params changed (invalid cached proof)', async () => {
    stubGasEstimateSuccess();
    await generateCrossContractCallsProof(
      txidVersion,
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS,
      MOCK_NFT_AMOUNTS,
      MOCK_ERC20_RECIPIENTS,
      MOCK_NFT_AMOUNT_RECIPIENTS,
      mockCrossContractCalls,
      relayerFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      minGasLimit,
      () => {}, // progressCallback
    );
    await expect(
      populateProvedCrossContractCalls(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_TOKEN_AMOUNTS_DIFFERENT,
        MOCK_NFT_AMOUNTS,
        MOCK_ERC20_RECIPIENTS,
        MOCK_NFT_AMOUNT_RECIPIENTS,
        mockCrossContractCalls,
        relayerFeeERC20AmountRecipient,
        false, // sendWithPublicWallet
        overallBatchMinGasPrice,
        gasDetails,
      ),
    ).rejectedWith(
      'Invalid proof for this transaction. Mismatch: relayAdaptUnshieldERC20Amounts.',
    );
  });

  it('Should decode and parse relay adapt error logs (from failed Sushi V2 LP removal)', () => {
    const transactionError = getRelayAdaptTransactionError(
      FormattedRelayAdaptErrorLogs,
    );
    expect(transactionError).to.equal('ds-math-sub-underflow');
  });

  it('Should parse relay adapt log revert data', () => {
    const transactionError = parseRelayAdaptReturnValue(
      `0x5c0dee5d00000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000006408c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001564732d6d6174682d7375622d756e646572666c6f77000000000000000000000000000000000000000000000000000000000000000000000000000000`,
    );
    expect(transactionError).to.equal('ds-math-sub-underflow');
  });

  it('Should parse relay adapt revert data from railgun cookbook', () => {
    const transactionError = parseRelayAdaptReturnValue(
      `0x5c0dee5d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002d52656c617941646170743a205265667573696e6720746f2063616c6c205261696c67756e20636f6e747261637400000000000000000000000000000000000000`,
    );
    expect(transactionError).to.equal(
      'RelayAdapt: Refusing to call Railgun contract',
    );
  });
});
