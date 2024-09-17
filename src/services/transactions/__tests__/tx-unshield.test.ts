import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon, { SinonStub, SinonSpy } from 'sinon';
import {
  RailgunVersionedSmartContracts,
  RailgunWallet,
  RelayAdaptVersionedSmartContracts,
  TransactionBatch,
  TransactionStructV2,
  TransactionStructV3,
  getTokenDataERC20,
  getTokenDataNFT,
} from '@railgun-community/engine';
import {
  RailgunERC20Amount,
  NetworkName,
  NETWORK_CONFIG,
  EVMGasType,
  RailgunERC20AmountRecipient,
  TransactionGasDetails,
  isDefined,
} from '@railgun-community/shared-models';
import {
  closeTestEngine,
  initTestEngine,
  initTestEngineNetworks,
} from '../../../tests/setup.test';
import {
  MOCK_BOUND_PARAMS_V2,
  MOCK_BOUND_PARAMS_V3,
  MOCK_COMMITMENTS,
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_FEE_TOKEN_DETAILS,
  MOCK_FORMATTED_BROADCASTER_FEE_COMMITMENT_CIPHERTEXT_V2,
  MOCK_FORMATTED_BROADCASTER_FEE_COMMITMENT_CIPHERTEXT_V3,
  MOCK_MNEMONIC,
  MOCK_NFT_AMOUNT_RECIPIENTS_UNSHIELD,
  MOCK_NULLIFIERS,
  MOCK_RAILGUN_WALLET_ADDRESS,
  MOCK_TOKEN_ADDRESS,
  MOCK_TOKEN_ADDRESS_2,
  MOCK_TOKEN_AMOUNTS,
  MOCK_TOKEN_FEE,
  MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
} from '../../../tests/mocks.test';
import {
  populateProvedUnshield,
  gasEstimateForUnprovenUnshield,
  populateProvedUnshieldBaseToken,
  gasEstimateForUnprovenUnshieldBaseToken,
  populateProvedUnshieldToOrigin,
  gasEstimateForUnprovenUnshieldToOrigin,
} from '../tx-unshield';
import {
  generateUnshieldBaseTokenProof,
  generateUnshieldProof,
  generateUnshieldToOriginProof,
} from '../tx-proof-unshield';
import * as txGasDetailsModule from '../tx-gas-details';
import {
  createRailgunWallet,
  fullWalletForID,
} from '../../railgun/wallets/wallets';
import { setCachedProvedTransaction } from '../proof-cache';
import { ContractTransaction, FallbackProvider } from 'ethers';
import {
  MOCK_SHIELD_TXID_FOR_BALANCES,
  MOCK_TOKEN_BALANCE,
  createEngineWalletBalancesStub,
  restoreEngineStubs,
} from '../../../tests/stubs/engine-stubs.test';
import { getTestTXIDVersion, isV2Test } from '../../../tests/helper.test';

let gasEstimateStub: SinonStub;
let railProveStub: SinonStub;
let railDummyProveStub: SinonStub;
let railTransactStub: SinonStub;
let relayAdaptPopulateUnshieldBaseToken: SinonStub;
let addUnshieldDataSpy: SinonSpy;
let erc20NoteSpy: SinonSpy;

let railgunWallet: RailgunWallet;
let broadcasterFeeERC20AmountRecipient: RailgunERC20AmountRecipient;

const polygonRelayAdaptContract =
  NETWORK_CONFIG[NetworkName.Polygon].relayAdaptContract;

chai.use(chaiAsPromised);
const { expect } = chai;

const txidVersion = getTestTXIDVersion();

const mockERC20TokenData0 = getTokenDataERC20(
  MOCK_TOKEN_AMOUNTS[0].tokenAddress,
);
const mockERC20TokenData1 = getTokenDataERC20(
  MOCK_TOKEN_AMOUNTS[1].tokenAddress,
);
const mockNFTTokenData0 = getTokenDataNFT(
  MOCK_NFT_AMOUNT_RECIPIENTS_UNSHIELD[0].nftAddress,
  MOCK_NFT_AMOUNT_RECIPIENTS_UNSHIELD[0].nftTokenType as 1 | 2,
  MOCK_NFT_AMOUNT_RECIPIENTS_UNSHIELD[0].tokenSubID,
);
const mockNFTTokenData1 = getTokenDataNFT(
  MOCK_NFT_AMOUNT_RECIPIENTS_UNSHIELD[1].nftAddress,
  MOCK_NFT_AMOUNT_RECIPIENTS_UNSHIELD[1].nftTokenType as 1 | 2,
  MOCK_NFT_AMOUNT_RECIPIENTS_UNSHIELD[1].tokenSubID,
);

const MOCK_TOKEN_AMOUNTS_DIFFERENT: RailgunERC20Amount[] = [
  {
    tokenAddress: MOCK_TOKEN_ADDRESS,
    amount: BigInt(0x0100),
  },
  {
    tokenAddress: MOCK_TOKEN_ADDRESS_2,
    amount: BigInt(0x0300),
  },
];

const overallBatchMinGasPrice = BigInt('0x1000');

const gasDetails: TransactionGasDetails = {
  evmGasType: EVMGasType.Type1,
  gasEstimate: 1000n,
  gasPrice: overallBatchMinGasPrice,
};
const gasDetailsType2: TransactionGasDetails = {
  evmGasType: EVMGasType.Type2,
  gasEstimate: 1000n,
  maxFeePerGas: overallBatchMinGasPrice,
  maxPriorityFeePerGas: overallBatchMinGasPrice,
};

const MOCK_TOKEN_AMOUNT_RECIPIENTS_INVALID: RailgunERC20AmountRecipient[] =
  MOCK_TOKEN_AMOUNTS.map(erc20Amount => ({
    ...erc20Amount,
    recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
  }));

const MOCK_TOKEN_AMOUNT_RECIPIENTS: RailgunERC20AmountRecipient[] =
  MOCK_TOKEN_AMOUNTS.map(erc20Amount => ({
    ...erc20Amount,
    recipientAddress: MOCK_ETH_WALLET_ADDRESS,
  }));

const MOCK_TOKEN_AMOUNT_RECIPIENTS_DIFFERENT: RailgunERC20AmountRecipient[] =
  MOCK_TOKEN_AMOUNTS_DIFFERENT.map(erc20Amount => ({
    ...erc20Amount,
    recipientAddress: MOCK_ETH_WALLET_ADDRESS,
  }));

const stubGasEstimateSuccess = () => {
  gasEstimateStub = Sinon.stub(txGasDetailsModule, 'getGasEstimate').resolves(
    BigInt('200'),
  );
};

const stubGasEstimateFailure = () => {
  gasEstimateStub = Sinon.stub(txGasDetailsModule, 'getGasEstimate').rejects(
    new Error('test rejection - gas estimate'),
  );
};

const spyOnSetUnshield = () => {
  addUnshieldDataSpy = Sinon.spy(TransactionBatch.prototype, 'addUnshieldData');
};

describe('tx-unshield', () => {
  before(async function run() {
    this.timeout(60_000);
    await initTestEngine();
    await initTestEngineNetworks();
    const railgunWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!isDefined(railgunWalletInfo)) {
      throw new Error('Expected railgunWalletInfo');
    }
    railgunWallet = fullWalletForID(railgunWalletInfo.id);

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
      ...MOCK_TOKEN_FEE,
      recipientAddress: broadcasterRailgunAddress,
    };

    railProveStub = Sinon.stub(
      TransactionBatch.prototype,
      'generateTransactions',
    ).resolves({
      provedTransactions: [
        {
          nullifiers: MOCK_NULLIFIERS,
        },
      ] as (TransactionStructV2 | TransactionStructV3)[],
      preTransactionPOIsPerTxidLeafPerList: {},
    });
    railDummyProveStub = Sinon.stub(
      TransactionBatch.prototype,
      'generateDummyTransactions',
    ).resolves([
      {
        txidVersion,
        commitments: MOCK_COMMITMENTS,
        boundParams: isV2Test() ? MOCK_BOUND_PARAMS_V2 : MOCK_BOUND_PARAMS_V3,
        nullifiers: MOCK_NULLIFIERS,
      },
    ] as (TransactionStructV2 | TransactionStructV3)[]);
    railTransactStub = Sinon.stub(
      RailgunVersionedSmartContracts,
      'generateTransact',
    ).resolves({ data: '0x0123' } as ContractTransaction);
    relayAdaptPopulateUnshieldBaseToken = Sinon.stub(
      RelayAdaptVersionedSmartContracts,
      'populateUnshieldBaseToken',
    ).resolves({ data: '0x0123' } as ContractTransaction);

    // For Unshield To Origin
    await createEngineWalletBalancesStub(
      railgunWallet.addressKeys,
      MOCK_TOKEN_ADDRESS,
      0,
    );
  });
  afterEach(() => {
    gasEstimateStub?.restore();
    addUnshieldDataSpy?.restore();
    erc20NoteSpy?.restore();
  });
  after(async () => {
    railProveStub.restore();
    railDummyProveStub.restore();
    railTransactStub.restore();
    relayAdaptPopulateUnshieldBaseToken.restore();
    restoreEngineStubs();
    await closeTestEngine();
  });

  // UNSHIELD - GAS ESTIMATE

  it('Should get gas estimates for valid Unshield', async () => {
    stubGasEstimateSuccess();
    spyOnSetUnshield();
    const rsp = await gasEstimateForUnprovenUnshield(
      txidVersion,
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      [], // nftAmountRecipients
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.broadcasterFeeCommitment).to.not.be.undefined;
    expect(rsp.broadcasterFeeCommitment?.commitmentCiphertext).to.deep.equal(
      isV2Test()
        ? MOCK_FORMATTED_BROADCASTER_FEE_COMMITMENT_CIPHERTEXT_V2
        : MOCK_FORMATTED_BROADCASTER_FEE_COMMITMENT_CIPHERTEXT_V3,
    );
    expect(addUnshieldDataSpy.called).to.be.true;
    expect(addUnshieldDataSpy.args).to.deep.equal([
      [
        {
          toAddress: MOCK_ETH_WALLET_ADDRESS,
          tokenData: mockERC20TokenData0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // run 1 - token 1
      [
        {
          toAddress: MOCK_ETH_WALLET_ADDRESS,
          tokenData: mockERC20TokenData1,
          value: BigInt('0x0200'),
          allowOverride: false,
        },
      ], // run 1 - token 2
      [
        {
          toAddress: MOCK_ETH_WALLET_ADDRESS,
          tokenData: mockERC20TokenData0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // run 2 - token 1
      [
        {
          toAddress: MOCK_ETH_WALLET_ADDRESS,
          tokenData: mockERC20TokenData1,
          value: BigInt('0x0200'),
          allowOverride: false,
        },
      ], // run 2 - token 2
    ]);
    // Add 9000 for the dummy tx variance
    expect(rsp.gasEstimate).to.equal(9000n + 200n);
  }).timeout(30_000);

  it('Should get gas estimates for valid Unshield To Origin', async () => {
    stubGasEstimateSuccess();
    spyOnSetUnshield();
    const rsp = await gasEstimateForUnprovenUnshieldToOrigin(
      MOCK_SHIELD_TXID_FOR_BALANCES, // originalShieldTxid
      txidVersion,
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      [
        {
          tokenAddress: MOCK_TOKEN_ADDRESS,
          amount: MOCK_TOKEN_BALANCE,
          recipientAddress: MOCK_ETH_WALLET_ADDRESS,
        },
      ],
      [], // nftAmountRecipients
    );
    expect(rsp.broadcasterFeeCommitment).to.be.undefined;
    expect(addUnshieldDataSpy.called).to.be.true;
    expect(addUnshieldDataSpy.args).to.deep.equal([
      [
        {
          toAddress: MOCK_ETH_WALLET_ADDRESS,
          tokenData: mockERC20TokenData0,
          value: MOCK_TOKEN_BALANCE,
          allowOverride: false,
        },
      ],
    ]);
    // Add 9000 for the dummy tx variance
    expect(rsp.gasEstimate).to.equal(9000n + 200n);
  }).timeout(30_000);

  it('Should error on gas estimates for invalid Unshield', async () => {
    stubGasEstimateSuccess();
    await expect(
      gasEstimateForUnprovenUnshield(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_DB_ENCRYPTION_KEY,
        MOCK_TOKEN_AMOUNT_RECIPIENTS_INVALID,
        [], // nftAmountRecipients
        MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
        MOCK_FEE_TOKEN_DETAILS,
        false, // sendWithPublicWallet
      ),
    ).rejectedWith('Invalid wallet address.');
  });

  it('Should error on unshield gas estimate for ethers rejections', async () => {
    stubGasEstimateFailure();
    await expect(
      gasEstimateForUnprovenUnshield(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_DB_ENCRYPTION_KEY,
        MOCK_TOKEN_AMOUNT_RECIPIENTS,
        [], // nftAmountRecipients
        MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
        MOCK_FEE_TOKEN_DETAILS,
        false, // sendWithPublicWallet
      ),
    ).rejectedWith('test rejection - gas estimate');
  });

  // UNSHIELD BASE TOKEN - GAS ESTIMATE

  it('Should get gas estimates for valid Unshield base token', async () => {
    stubGasEstimateSuccess();
    spyOnSetUnshield();
    const rsp = await gasEstimateForUnprovenUnshieldBaseToken(
      txidVersion,
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS[0],
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.broadcasterFeeCommitment).to.not.be.undefined;
    expect(rsp.broadcasterFeeCommitment?.commitmentCiphertext).to.deep.equal(
      isV2Test()
        ? MOCK_FORMATTED_BROADCASTER_FEE_COMMITMENT_CIPHERTEXT_V2
        : MOCK_FORMATTED_BROADCASTER_FEE_COMMITMENT_CIPHERTEXT_V3,
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
      ],
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockERC20TokenData0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ],
    ]);
    // Add 9000 for the dummy tx variance
    expect(rsp.gasEstimate).to.equal(9000n + 200n);
  }).timeout(30_000);

  it('Should get gas estimates for valid Unshield base token: public wallet', async () => {
    stubGasEstimateSuccess();
    spyOnSetUnshield();
    const rsp = await gasEstimateForUnprovenUnshieldBaseToken(
      txidVersion,
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS[0],
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      true, // sendWithPublicWallet
    );
    expect(rsp.broadcasterFeeCommitment).to.be.undefined;
    expect(addUnshieldDataSpy.called).to.be.true;
    expect(addUnshieldDataSpy.args).to.deep.equal([
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockERC20TokenData0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ],
    ]);
    // Add 9000 for the dummy tx variance
    expect(rsp.gasEstimate).to.equal(9000n + 200n);
  }).timeout(30_000);

  it('Should error on gas estimates for invalid Unshield base token', async () => {
    stubGasEstimateSuccess();
    await expect(
      gasEstimateForUnprovenUnshieldBaseToken(
        txidVersion,
        NetworkName.Polygon,
        MOCK_RAILGUN_WALLET_ADDRESS,
        railgunWallet.id,
        MOCK_DB_ENCRYPTION_KEY,
        MOCK_TOKEN_AMOUNTS[0],
        MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
        MOCK_FEE_TOKEN_DETAILS,
        false, // sendWithPublicWallet
      ),
    ).rejectedWith('Invalid wallet address.');
  });

  it('Should error on unshield base token gas estimate for ethers rejections', async () => {
    stubGasEstimateFailure();
    await expect(
      gasEstimateForUnprovenUnshieldBaseToken(
        txidVersion,
        NetworkName.Polygon,
        MOCK_ETH_WALLET_ADDRESS,
        railgunWallet.id,
        MOCK_DB_ENCRYPTION_KEY,
        MOCK_TOKEN_AMOUNTS[0],
        MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
        MOCK_FEE_TOKEN_DETAILS,
        false, // sendWithPublicWallet
      ),
    ).rejectedWith('test rejection - gas estimate');
  });

  // UNSHIELD - PROVE AND SEND

  it('Should populate tx for valid Unshield', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    spyOnSetUnshield();
    await generateUnshieldProof(
      txidVersion,
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      MOCK_NFT_AMOUNT_RECIPIENTS_UNSHIELD,
      broadcasterFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      () => {}, // progressCallback
    );
    expect(addUnshieldDataSpy.called).to.be.true;
    expect(addUnshieldDataSpy.args).to.deep.equal([
      [
        {
          toAddress: MOCK_ETH_WALLET_ADDRESS,
          tokenData: mockERC20TokenData0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // run 1 - erc20 token 1
      [
        {
          toAddress: MOCK_ETH_WALLET_ADDRESS,
          tokenData: mockERC20TokenData1,
          value: BigInt('0x0200'),
          allowOverride: false,
        },
      ], // run 1 - erc20 token 2
      [
        {
          toAddress: MOCK_ETH_WALLET_ADDRESS,
          tokenData: mockNFTTokenData0,
          value: BigInt(1),
          allowOverride: false,
        },
      ], // run 1 - NFT token 1
      [
        {
          toAddress: MOCK_ETH_WALLET_ADDRESS,
          tokenData: mockNFTTokenData1,
          value: BigInt(2),
          allowOverride: false,
        },
      ], // run 1 - NFT token 2
    ]);
    const populateResponse = await populateProvedUnshield(
      txidVersion,
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      MOCK_NFT_AMOUNT_RECIPIENTS_UNSHIELD,
      broadcasterFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      gasDetails,
    );
    expect(populateResponse.nullifiers).to.deep.equal([
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000000000000000000000000000002',
    ]);

    const { transaction } = populateResponse;

    expect(transaction.nonce).to.equal(undefined);
    expect(transaction.gasPrice?.toString()).to.equal('4096');
    expect(transaction.gasLimit).to.equal(1200n);
    expect(transaction.value?.toString()).to.equal(undefined);
    expect(transaction.data).to.equal('0x0123');
    expect(transaction.to).to.equal(undefined);
    expect(transaction.chainId).to.equal(undefined);
    expect(transaction.type).to.equal(1);
  });

  it('Should populate tx for valid Unshield To Origin', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    spyOnSetUnshield();
    await generateUnshieldToOriginProof(
      MOCK_SHIELD_TXID_FOR_BALANCES, // originalShieldTxid
      txidVersion,
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      [
        {
          tokenAddress: MOCK_TOKEN_ADDRESS,
          amount: MOCK_TOKEN_BALANCE,
          recipientAddress: MOCK_ETH_WALLET_ADDRESS,
        },
      ],
      [],
      () => {}, // progressCallback
    );
    expect(addUnshieldDataSpy.called).to.be.true;
    expect(addUnshieldDataSpy.args).to.deep.equal([
      [
        {
          toAddress: MOCK_ETH_WALLET_ADDRESS,
          tokenData: mockERC20TokenData0,
          value: MOCK_TOKEN_BALANCE,
          allowOverride: false,
        },
      ], // run 1 - erc20 token 1
    ]);
    const populateResponse = await populateProvedUnshieldToOrigin(
      txidVersion,
      NetworkName.Polygon,
      railgunWallet.id,
      [
        {
          tokenAddress: MOCK_TOKEN_ADDRESS,
          amount: MOCK_TOKEN_BALANCE,
          recipientAddress: MOCK_ETH_WALLET_ADDRESS,
        },
      ],
      [],
      gasDetailsType2,
    );
    expect(populateResponse.nullifiers).to.deep.equal([
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000000000000000000000000000002',
    ]);

    const { transaction } = populateResponse;

    expect(transaction.nonce).to.equal(undefined);
    expect(transaction.gasLimit).to.equal(1200n);
    expect(transaction.value?.toString()).to.equal(undefined);
    expect(transaction.data).to.equal('0x0123');
    expect(transaction.to).to.equal(undefined);
    expect(transaction.chainId).to.equal(undefined);
    expect(transaction.type).to.equal(2);
  });

  it('Should error on populate tx for invalid Unshield', async () => {
    stubGasEstimateSuccess();
    await expect(
      populateProvedUnshield(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_TOKEN_AMOUNT_RECIPIENTS_DIFFERENT,
        MOCK_NFT_AMOUNT_RECIPIENTS_UNSHIELD,
        broadcasterFeeERC20AmountRecipient,
        false, // sendWithPublicWallet
        overallBatchMinGasPrice,
        gasDetails,
      ),
    ).rejectedWith('Invalid proof for this transaction');
  });

  it('Should error on populate unshield tx for unproved transaction', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    await expect(
      populateProvedUnshield(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_TOKEN_AMOUNT_RECIPIENTS,
        [], // nftAmountRecipients
        broadcasterFeeERC20AmountRecipient,
        false, // sendWithPublicWallet
        overallBatchMinGasPrice,
        gasDetails,
      ),
    ).rejectedWith('Invalid proof for this transaction');
  });

  it('Should error on populate unshield tx when params changed (invalid cached proof)', async () => {
    stubGasEstimateSuccess();
    await generateUnshieldProof(
      txidVersion,
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      [], // nftAmountRecipients
      broadcasterFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      () => {}, // progressCallback
    );
    await expect(
      populateProvedUnshield(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_TOKEN_AMOUNT_RECIPIENTS_DIFFERENT,
        [], // nftAmountRecipients
        broadcasterFeeERC20AmountRecipient,
        false, // sendWithPublicWallet
        overallBatchMinGasPrice,
        gasDetails,
      ),
    ).rejectedWith('Invalid proof for this transaction');
  });

  // UNSHIELD BASE TOKEN - PROVE AND SEND

  it('Should populate tx for valid Unshield Base Token', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    spyOnSetUnshield();
    await generateUnshieldBaseTokenProof(
      txidVersion,
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS[0],
      broadcasterFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
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
      ], // Dummy prove.
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockERC20TokenData0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // Actual prove
    ]);
    const populateResponse = await populateProvedUnshieldBaseToken(
      txidVersion,
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNTS[0],
      broadcasterFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      gasDetails,
    );

    const { transaction } = populateResponse;

    expect(transaction.nonce).to.equal(undefined);
    expect(transaction.gasPrice?.toString()).to.equal('4096');
    expect(transaction.gasLimit).to.equal(1200n);
    expect(transaction.value?.toString()).to.equal(undefined);
    expect(transaction.data).to.equal('0x0123');
    expect(transaction.to).to.equal(undefined);
    expect(transaction.chainId).to.equal(undefined);
    expect(transaction.type).to.equal(1);
  }).timeout(60_000);

  it('Should error on populate tx for invalid Unshield Base Token', async () => {
    stubGasEstimateSuccess();
    await expect(
      populateProvedUnshieldBaseToken(
        txidVersion,
        NetworkName.Polygon,
        MOCK_ETH_WALLET_ADDRESS,
        railgunWallet.id,
        MOCK_TOKEN_AMOUNTS_DIFFERENT[1],
        broadcasterFeeERC20AmountRecipient,
        false, // sendWithPublicWallet
        overallBatchMinGasPrice,
        gasDetails,
      ),
    ).rejectedWith('Invalid proof for this transaction');
  });

  it('Should error on populate Unshield Base Token tx for unproved transaction', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    await expect(
      populateProvedUnshieldBaseToken(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_ETH_WALLET_ADDRESS,
        MOCK_TOKEN_AMOUNTS[0],
        broadcasterFeeERC20AmountRecipient,
        false, // sendWithPublicWallet
        overallBatchMinGasPrice,
        gasDetails,
      ),
    ).rejectedWith('Invalid proof for this transaction');
  });

  it('Should error on populate Unshield Base Token tx when params changed (invalid cached proof)', async () => {
    stubGasEstimateSuccess();
    await generateUnshieldBaseTokenProof(
      txidVersion,
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS[1],
      broadcasterFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      () => {}, // progressCallback
    );
    await expect(
      populateProvedUnshieldBaseToken(
        txidVersion,
        NetworkName.Polygon,
        MOCK_ETH_WALLET_ADDRESS,
        railgunWallet.id,
        MOCK_TOKEN_AMOUNTS_DIFFERENT[1],
        broadcasterFeeERC20AmountRecipient,
        false, // sendWithPublicWallet
        overallBatchMinGasPrice,
        gasDetails,
      ),
    ).rejectedWith('Invalid proof for this transaction');
  });
});
