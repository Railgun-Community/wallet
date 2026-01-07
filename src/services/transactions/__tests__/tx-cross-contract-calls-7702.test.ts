import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon, { SinonStub, SinonSpy } from 'sinon';
import {
  RailgunWallet,
  TransactionBatch,
  getTokenDataERC20,
  MINIMUM_RELAY_ADAPT_CROSS_CONTRACT_CALLS_GAS_LIMIT_V2,
  TransactionStructV2,
  RelayAdapt7702Helper,
  RelayAdaptVersionedSmartContracts,
 TXIDVersion } from '@railgun-community/engine';
import {
  NetworkName,
  NETWORK_CONFIG,
  RailgunERC20AmountRecipient,
  isDefined,
  TransactionGasDetails,
  EVMGasType,
  RailgunERC20Amount,
} from '@railgun-community/shared-models';
import {
  closeTestEngine,
  initTestEngine,
  initTestEngineNetworks,
} from '../../../tests/setup.test';
import {
  MOCK_BOUND_PARAMS_V2,
  MOCK_COMMITMENTS,
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_FEE_TOKEN_DETAILS,
  MOCK_MNEMONIC,
  MOCK_NULLIFIERS,
  MOCK_TOKEN_AMOUNTS,
  MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
  MOCK_ERC20_RECIPIENTS,
  MOCK_FALLBACK_PROVIDER_JSON_CONFIG_POLYGON,
  MOCK_FORMATTED_BROADCASTER_FEE_COMMITMENT_CIPHERTEXT_V2,
  MOCK_NFT_AMOUNTS,
  MOCK_NFT_AMOUNT_RECIPIENTS,
  MOCK_TOKEN_ADDRESS,
  MOCK_TOKEN_ADDRESS_2,
} from '../../../tests/mocks.test';
import {
  createRailgunWallet,
  fullWalletForID,
} from '../../railgun/wallets/wallets';
import * as Wallets from '../../railgun/wallets/wallets';
import { setCachedProvedTransaction } from '../proof-cache';
import {
  gasEstimateForUnprovenCrossContractCalls7702,
  generateCrossContractCallsProof7702,
} from '../tx-cross-contract-calls-7702';
import { ContractTransaction, FallbackProvider, Wallet } from 'ethers';
import { getTestTXIDVersion, isV2Test } from '../../../tests/helper.test';
import { createNFTTokenDataFromRailgunNFTAmount, populateProvedCrossContractCalls } from '../tx-cross-contract-calls';

let gasEstimateStub: SinonStub;
let railProveStub: SinonStub;
let railDummyProveStub: SinonStub;
let relayAdaptGetAdaptParamsStub: SinonStub;
let signEIP7702AuthorizationStub: SinonStub;
let signExecutionAuthorizationStub: SinonStub;
let relayAdaptGasEstimateStub: SinonStub;
let addUnshieldDataSpy: SinonSpy;

let railgunWallet: RailgunWallet;
let broadcasterFeeERC20AmountRecipient: RailgunERC20AmountRecipient;

const MOCK_RELAY_ADAPT_7702_ADDRESS = '0x276C216D241856199A83bf27b2286659e5b877D3';

const polygonRelayAdaptContract7702 = MOCK_RELAY_ADAPT_7702_ADDRESS;

const mockEphemeralWallet = {
  address: MOCK_ETH_WALLET_ADDRESS,
  privateKey: '0xprivate',
} as unknown as Wallet;

chai.use(chaiAsPromised);
const { expect } = chai;

const txidVersion = getTestTXIDVersion();


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
    value: 0n,
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

const minGasLimit = MINIMUM_RELAY_ADAPT_CROSS_CONTRACT_CALLS_GAS_LIMIT_V2;

const gasDetails: TransactionGasDetails = {
  evmGasType: EVMGasType.Type1,
  gasEstimate: 2000n,
  gasPrice: overallBatchMinGasPrice,
};


const MOCK_TRANSACTION_STRUCT_V2: TransactionStructV2 = {
  txidVersion: TXIDVersion.V2_PoseidonMerkle,
  proof: {
    a: { x: 1n, y: 2n },
    b: { x: [3n, 4n], y: [5n, 6n] },
    c: { x: 7n, y: 8n },
  },
  merkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000001',
  nullifiers: MOCK_NULLIFIERS,
  commitments: MOCK_COMMITMENTS,
  boundParams: {
    treeNumber: 0n,
    minGasPrice: 0n,
    unshield: 0n,
    chainID: 137n,
    adaptContract: MOCK_ETH_WALLET_ADDRESS,
    adaptParams:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    commitmentCiphertext: MOCK_BOUND_PARAMS_V2.commitmentCiphertext as any,
  },
  unshieldPreimage: {
    npk: '0x0000000000000000000000000000000000000000000000000000000000000000',
    token: {
      tokenType: 0n,
      tokenAddress: MOCK_TOKEN_AMOUNTS[0].tokenAddress,
      tokenSubID: 0n,
    },
    value: 100n,
  },
};

const stubRelayAdaptGasEstimate = () => {
  relayAdaptGasEstimateStub = Sinon.stub(
    RelayAdaptVersionedSmartContracts,
    'estimateGasWithErrorHandler',
  ).resolves(BigInt('200'));
};

const stubGasEstimateSuccess = () => {
  gasEstimateStub = Sinon.stub(
    FallbackProvider.prototype,
    'estimateGas',
  ).resolves(BigInt('200'));
};

const stubRelayAdaptGasEstimateFailure = () => {
  relayAdaptGasEstimateStub = Sinon.stub(
    RelayAdaptVersionedSmartContracts,
    'estimateGasWithErrorHandler',
  ).rejects(new Error('RelayAdapt multicall failed at index UNKNOWN.'));
};

const spyOnSetUnshield = () => {
  addUnshieldDataSpy = Sinon.spy(TransactionBatch.prototype, 'addUnshieldData');
};

describe('tx-cross-contract-calls-7702', () => {
  before(async () => {
    await initTestEngine();
    await initTestEngineNetworks(
      NetworkName.Polygon,
      MOCK_FALLBACK_PROVIDER_JSON_CONFIG_POLYGON,
    );
    const walletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!isDefined(walletInfo)) {
      throw new Error('Could not create railgun wallet');
    }
    railgunWallet = fullWalletForID(walletInfo.id);

    const broadcasterWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!isDefined(broadcasterWalletInfo)) {
      throw new Error('Expected broadcasterWalletInfo');
    }
    const broadcasterRailgunAddress = broadcasterWalletInfo.railgunAddress;

    broadcasterFeeERC20AmountRecipient = {
      ...MOCK_TOKEN_AMOUNTS[0],
      recipientAddress: broadcasterRailgunAddress,
    };

    railProveStub = Sinon.stub(
      TransactionBatch.prototype,
      'generateTransactions',
    ).resolves({
      provedTransactions: [MOCK_TRANSACTION_STRUCT_V2],
      preTransactionPOIsPerTxidLeafPerList: {},
    });

    railDummyProveStub = Sinon.stub(
      TransactionBatch.prototype,
      'generateDummyTransactions',
    ).resolves([MOCK_TRANSACTION_STRUCT_V2]);

    relayAdaptGetAdaptParamsStub = Sinon.stub(
      RelayAdapt7702Helper,
      'getAdaptParams',
    ).returns(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    );

    signEIP7702AuthorizationStub = Sinon.stub(
      Wallets,
      'sign7702Request',
    ).resolves({
      authorization: {
        chainId: '137',
        address: polygonRelayAdaptContract7702,
        nonce: 0,
        yParity: 0,
        r: '0x01',
        s: '0x02',
      },
      signature:
        '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    });

    Sinon.stub(Wallets, 'getCurrentEphemeralAddress').resolves(
      MOCK_ETH_WALLET_ADDRESS,
    );
  });

  afterEach(() => {
    gasEstimateStub?.restore();
    relayAdaptGasEstimateStub?.restore();
    addUnshieldDataSpy?.restore();
  });

  after(async () => {
    await closeTestEngine();
    railProveStub.restore();
    railDummyProveStub.restore();
    relayAdaptGetAdaptParamsStub.restore();
    signEIP7702AuthorizationStub.restore();
    (Wallets.getCurrentEphemeralAddress as SinonStub).restore();
  });
  
  // GAS ESTIMATE

  it('Should get gas estimates for valid cross contract calls', async () => {
    stubRelayAdaptGasEstimate();
    spyOnSetUnshield();
    const response = await gasEstimateForUnprovenCrossContractCalls7702(
      txidVersion,
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS, // unshieldERC20Amounts
      MOCK_NFT_AMOUNTS, // unshieldNFTAmounts
      MOCK_ERC20_RECIPIENTS, // shieldERC20Recipients
      MOCK_NFT_AMOUNT_RECIPIENTS, // shieldNFTRecipients
      mockCrossContractCalls,
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
      minGasLimit, // minGasLimit
    );
    expect(response.broadcasterFeeCommitment).to.not.be.undefined;
    expect(response.broadcasterFeeCommitment?.commitmentCiphertext).to.deep.equal(
    isV2Test()
        ? MOCK_FORMATTED_BROADCASTER_FEE_COMMITMENT_CIPHERTEXT_V2
        : MOCK_FORMATTED_BROADCASTER_FEE_COMMITMENT_CIPHERTEXT_V2,
    );
    expect(addUnshieldDataSpy.called).to.be.true;

    expect(addUnshieldDataSpy.args).to.deep.equal([
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockERC20TokenData0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // run 1 - erc20 1
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockERC20TokenData1,
          value: BigInt('0x0200'),
          allowOverride: false,
        },
      ], // run 1 - erc20 2
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockNFTTokenData0,
          value: BigInt('1'),
          allowOverride: false,
        },
      ], // run 1 - nft 0
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockNFTTokenData1,
          value: BigInt('2'),
          allowOverride: false,
        },
      ], // run 1 - nft 1
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockERC20TokenData0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // run 2 - erc20 1
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockERC20TokenData1,
          value: BigInt('0x0200'),
          allowOverride: false,
        },
      ], // run 2 - erc20 2
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockNFTTokenData0,
          value: BigInt('1'),
          allowOverride: false,
        },
      ], // run 2 - nft 0
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockNFTTokenData1,
          value: BigInt('2'),
          allowOverride: false,
        },
      ], // run 2 - nft 1
    ]);

    expect(response.gasEstimate).to.be.a('bigint');
    expect(response.gasEstimate >= MINIMUM_RELAY_ADAPT_CROSS_CONTRACT_CALLS_GAS_LIMIT_V2).to.be.true;
  }).timeout(10_000);

  it('Should get gas estimates for valid cross contract calls, public wallet', async () => {
    stubRelayAdaptGasEstimate();
    spyOnSetUnshield();
    const response = await gasEstimateForUnprovenCrossContractCalls7702(
      txidVersion,
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS, // unshieldERC20Amounts
      MOCK_NFT_AMOUNTS, // unshieldNFTAmounts
      MOCK_ERC20_RECIPIENTS, // shieldERC20Recipients
      MOCK_NFT_AMOUNT_RECIPIENTS, // shieldNFTRecipients
      mockCrossContractCalls,
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      true, // sendWithPublicWallet
      minGasLimit, // minGasLimit
    );

    expect(response.broadcasterFeeCommitment).to.be.undefined;
    expect(response.gasEstimate).to.be.a('bigint');
    expect(response.gasEstimate >= MINIMUM_RELAY_ADAPT_CROSS_CONTRACT_CALLS_GAS_LIMIT_V2).to.be.true;
    expect(addUnshieldDataSpy.called).to.be.true;
    expect(addUnshieldDataSpy.args).to.deep.equal([
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockERC20TokenData0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // run 1 - erc20 1
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockERC20TokenData1,
          value: BigInt('0x0200'),
          allowOverride: false,
        },
      ], // run 1 - erc20 2
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockNFTTokenData0,
          value: BigInt('1'),
          allowOverride: false,
        },
      ], // run 1 - nft 0
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockNFTTokenData1,
          value: BigInt('2'),
          allowOverride: false,
        },
      ], // run 1 - nft 1
    ]);
  }).timeout(10_000);

  it('Should error on gas estimates for invalid cross contract calls', async () => {
    stubGasEstimateSuccess();
    await expect(
      gasEstimateForUnprovenCrossContractCalls7702(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_DB_ENCRYPTION_KEY,
        MOCK_TOKEN_AMOUNTS,
        [],
        MOCK_ERC20_RECIPIENTS,
        [],
        [{ data: 'abc' } as ContractTransaction], // Invalid
        MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
        MOCK_FEE_TOKEN_DETAILS,
        false, // sendWithPublicWallet
        undefined, // minGasLimit
      ),
    ).rejectedWith(
      `Cross-contract calls require to and data fields (7702).`,
    );
  });

  it('Should error on cross contract calls gas estimate for ethers rejections', async () => {
    stubRelayAdaptGasEstimateFailure();
    await expect(
      gasEstimateForUnprovenCrossContractCalls7702(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_DB_ENCRYPTION_KEY,
        MOCK_TOKEN_AMOUNTS, // unshieldERC20Amounts
        MOCK_NFT_AMOUNTS, // unshieldNFTAmounts
        MOCK_ERC20_RECIPIENTS, // shieldERC20Recipients
        MOCK_NFT_AMOUNT_RECIPIENTS, // shieldNFTRecipients
        mockCrossContractCalls,
        MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
        MOCK_FEE_TOKEN_DETAILS,
        false, // sendWithPublicWallet
        minGasLimit, // minGasLimit
      ),
    ).rejectedWith('RelayAdapt multicall failed at index UNKNOWN.');
  });

  // PROVE AND SEND

  it('Should populate tx for valid cross contract calls', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    spyOnSetUnshield();
    await generateCrossContractCallsProof7702(
      txidVersion,
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS, // unshieldERC20Amounts
      MOCK_NFT_AMOUNTS, // unshieldNFTAmounts
      MOCK_ERC20_RECIPIENTS, // shieldERC20Recipients
      MOCK_NFT_AMOUNT_RECIPIENTS, // shieldNFTRecipients
      mockCrossContractCalls,
      broadcasterFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice, // overallBatchMinGasPrice
      minGasLimit, // minGasLimit
      () => {}, // progressCallback
    );

    expect(addUnshieldDataSpy.called).to.be.true;
    expect(addUnshieldDataSpy.args).to.deep.equal([
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockERC20TokenData0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // dummy proof - erc20 token 0
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockERC20TokenData1,
          value: BigInt('0x0200'),
          allowOverride: false,
        },
      ], // dummy proof - erc20 token 1
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockNFTTokenData0,
          value: BigInt('1'),
          allowOverride: false,
        },
      ], // dummy proof - nft 0
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockNFTTokenData1,
          value: BigInt('2'),
          allowOverride: false,
        },
      ], // actual proof - nft 1
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockERC20TokenData0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // actual proof - erc20 token 0
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockERC20TokenData1,
          value: BigInt('0x0200'),
          allowOverride: false,
        },
      ], // actual proof - erc20 token 1
      [
        {
          toAddress: mockEphemeralWallet.address,
          tokenData: mockNFTTokenData0,
          value: BigInt('1'),
          allowOverride: false,
        },
      ], // actual proof - nft 0
      [
        {
          toAddress: mockEphemeralWallet.address,
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
      broadcasterFeeERC20AmountRecipient,
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
    expect(transaction.value?.toString()).to.equal('0');
    expect(transaction.data).to.not.equal(undefined);
    expect(transaction.to).to.equal(mockEphemeralWallet.address);
    expect(transaction.chainId).to.equal(undefined);
    expect(transaction.type).to.equal(1);
  });

  it('Should error on populate cross contract calls tx when params changed (invalid cached proof)', async () => {
    stubGasEstimateSuccess();
    await generateCrossContractCallsProof7702(
      txidVersion,
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS,
      MOCK_NFT_AMOUNTS,
      MOCK_ERC20_RECIPIENTS,
      MOCK_NFT_AMOUNT_RECIPIENTS,
      mockCrossContractCalls,
      broadcasterFeeERC20AmountRecipient,
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
        broadcasterFeeERC20AmountRecipient,
        false, // sendWithPublicWallet
        overallBatchMinGasPrice,
        gasDetails,
      ),
    ).rejectedWith('Invalid proof for this transaction');
  });

  it('Should error on generate proof for invalid cross contract calls', async () => {
    stubGasEstimateSuccess();
    await expect(
      generateCrossContractCallsProof7702(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_DB_ENCRYPTION_KEY,
        MOCK_TOKEN_AMOUNTS, // unshieldERC20Amounts
        [], // unshieldNFTAmounts
        MOCK_ERC20_RECIPIENTS, // shieldERC20Recipients
        [], // shieldNFTRecipients
        [{ data: 'abc' } as ContractTransaction], // Invalid
        broadcasterFeeERC20AmountRecipient,
        false, // sendWithPublicWallet
        undefined, // overallBatchMinGasPrice
        undefined, // minGasLimit
        () => {}, // progressCallback
      ),
    ).rejectedWith(
      `Cross-contract calls require to and data fields (7702).`,
    );
  });
});
