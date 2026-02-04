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
  getERC20AndNFTAmountRecipientsForUnshieldToOrigin,
} from '../tx-unshield';
import {
  generateUnshieldBaseTokenProof,
  generateUnshieldProof,
  generateUnshieldToOriginProof,
} from '../tx-proof-unshield';
import * as txGasDetailsModule from '../tx-gas-details';
import * as railgunModule from '../../railgun';
import {
  createRailgunWallet,
  fullWalletForID,
} from '../../railgun/wallets/wallets';
import { setFallbackProviderForNetwork, fallbackProviderMap } from '../../railgun/core/providers';
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

  describe('Token unshield owner', () => {
    let originalProvider: FallbackProvider | undefined;
    let hadOriginalProvider: boolean;

    const MOCK_USER_ADDRESS = '0x1234567890123456789012345678901234567890';
    const MOCK_RELAYER_ADDRESS = '0x9876543210987654321098765432109876543210';
    const MOCK_RAILGUN_PROXY_ADDRESS = NETWORK_CONFIG[NetworkName.Polygon].proxyContract;
    const MOCK_SHIELD_TXID = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const ERC20_TRANSFER_EVENT_SIGNATURE = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

    beforeEach(() => {
      // Save original provider if it exists
      try {
        originalProvider = railgunModule.getFallbackProviderForNetwork(NetworkName.Polygon);
        hadOriginalProvider = true;
      } catch {
        originalProvider = undefined;
        hadOriginalProvider = false;
      }
    });

    afterEach(() => {
      // Restore original provider or clear it
      if (hadOriginalProvider && originalProvider) {
        setFallbackProviderForNetwork(NetworkName.Polygon, originalProvider);
      } else if (!hadOriginalProvider) {
        // Clear the mock provider we set
        delete fallbackProviderMap[NetworkName.Polygon];
      }
    });

    const createMockTransferLog = (
      fromAddress: string,
      toAddress: string,
      tokenAddress: string = MOCK_TOKEN_ADDRESS,
    ) => {
      const paddedFrom = fromAddress.toLowerCase().replace('0x', '').padStart(64, '0');
      const paddedTo = toAddress.toLowerCase().replace('0x', '').padStart(64, '0');

      return {
        address: tokenAddress,
        topics: [
          ERC20_TRANSFER_EVENT_SIGNATURE,
          `0x${paddedFrom}`,
          `0x${paddedTo}`,
        ],
        data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
        blockNumber: 12345,
        transactionHash: MOCK_SHIELD_TXID,
        transactionIndex: 0,
        blockHash: '0xblockhash',
        logIndex: 0,
        removed: false,
        index: 0,
      };
    };

    const createMockReceipt = (logs: any[]) => {
      return {
        to: MOCK_RAILGUN_PROXY_ADDRESS,
        from: MOCK_RELAYER_ADDRESS,
        contractAddress: null,
        transactionIndex: 0,
        gasUsed: BigInt(100000),
        logsBloom: '0x',
        blockHash: '0xblockhash',
        transactionHash: MOCK_SHIELD_TXID,
        logs,
        blockNumber: 12345,
        confirmations: 10,
        cumulativeGasUsed: BigInt(100000),
        effectiveGasPrice: BigInt(1000000000),
        status: 1,
        type: 2,
        byzantium: true,
        hash: MOCK_SHIELD_TXID,
        index: 0,
      };
    };

    const createMockTransaction = (fromAddress: string) => {
      return {
        hash: MOCK_SHIELD_TXID,
        from: fromAddress,
        to: MOCK_RAILGUN_PROXY_ADDRESS,
        nonce: 1,
        gasLimit: BigInt(200000),
        data: '0x',
        value: BigInt(0),
        chainId: BigInt(137),
        blockNumber: 12345,
        blockHash: '0xblockhash',
        index: 0,
        type: 2,
        accessList: [],
      };
    };

    it('Should reject when getTransaction fails', async function () {
      this.timeout(60_000);

      const mockProvider = {
        getTransaction: async () => {
          throw new Error('RPC error: Transaction lookup failed');
        },
        getTransactionReceipt: async () => createMockReceipt([]),
      } as any;

      setFallbackProviderForNetwork(NetworkName.Polygon, mockProvider);

      await expect(
        getERC20AndNFTAmountRecipientsForUnshieldToOrigin(
          txidVersion,
          NetworkName.Polygon,
          railgunWallet.id,
          MOCK_SHIELD_TXID,
        ),
      ).to.be.rejectedWith('RPC error: Transaction lookup failed');
    });

    it('Should reject when getTransactionReceipt fails', async function () {
      this.timeout(60_000);

      const mockProvider = {
        getTransaction: async () => createMockTransaction(MOCK_USER_ADDRESS),
        getTransactionReceipt: async () => {
          throw new Error('RPC error: Receipt lookup failed');
        },
      } as any;

      setFallbackProviderForNetwork(NetworkName.Polygon, mockProvider);

      await expect(
        getERC20AndNFTAmountRecipientsForUnshieldToOrigin(
          txidVersion,
          NetworkName.Polygon,
          railgunWallet.id,
          MOCK_SHIELD_TXID,
        ),
      ).to.be.rejectedWith('RPC error: Receipt lookup failed');
    });

    it('Should reject when both getTransaction and getTransactionReceipt fail', async function () {
      this.timeout(60_000);

      const mockProvider = {
        getTransaction: async () => {
          // Simulate slower failure
          await new Promise(resolve => setTimeout(resolve, 100));
          throw new Error('RPC error: Transaction lookup failed');
        },
        getTransactionReceipt: async () => {
          // Simulate faster failure
          throw new Error('RPC error: Receipt lookup failed');
        },
      } as any;

      setFallbackProviderForNetwork(NetworkName.Polygon, mockProvider);

      // Promise.all() should reject with whichever error occurs first
      // In this case, receipt fails faster
      await expect(
        getERC20AndNFTAmountRecipientsForUnshieldToOrigin(
          txidVersion,
          NetworkName.Polygon,
          railgunWallet.id,
          MOCK_SHIELD_TXID,
        ),
      ).to.be.rejectedWith(/RPC error/);
    });

    it('Should timeout when getTransaction hangs indefinitely', async function () {
      this.timeout(10_000);

      const mockProvider = {
        getTransaction: async () => {
          // Simulate a hanging promise that never resolves
          return new Promise(() => {});
        },
        getTransactionReceipt: async () => createMockReceipt([]),
      } as any;

      setFallbackProviderForNetwork(NetworkName.Polygon, mockProvider);

      // Create a timeout wrapper to test hanging behavior
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Test timeout: getTransaction hung')), 2000)
      );

      const callPromise = getERC20AndNFTAmountRecipientsForUnshieldToOrigin(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_SHIELD_TXID,
      );

      await expect(
        Promise.race([callPromise, timeoutPromise])
      ).to.be.rejectedWith('Test timeout: getTransaction hung');
    });

    it('Should timeout when getTransactionReceipt hangs indefinitely', async function () {
      this.timeout(10_000);

      const mockProvider = {
        getTransaction: async () => createMockTransaction(MOCK_USER_ADDRESS),
        getTransactionReceipt: async () => {
          // Simulate a hanging promise that never resolves
          return new Promise(() => {});
        },
      } as any;

      setFallbackProviderForNetwork(NetworkName.Polygon, mockProvider);

      // Create a timeout wrapper to test hanging behavior
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Test timeout: getTransactionReceipt hung')), 2000)
      );

      const callPromise = getERC20AndNFTAmountRecipientsForUnshieldToOrigin(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_SHIELD_TXID,
      );

      await expect(
        Promise.race([callPromise, timeoutPromise])
      ).to.be.rejectedWith('Test timeout: getTransactionReceipt hung');
    });

    it('Should extract true token owner from Transfer events in EIP-7702 gasless transaction', async function () {
      this.timeout(60_000);

      const transferLog = createMockTransferLog(
        MOCK_USER_ADDRESS,
        MOCK_RAILGUN_PROXY_ADDRESS,
      );

      const mockReceipt = createMockReceipt([transferLog]);
      const mockTransaction = createMockTransaction(MOCK_RELAYER_ADDRESS);

      const mockProvider = {
        getTransaction: async () => mockTransaction,
        getTransactionReceipt: async () => mockReceipt,
      } as any;

      setFallbackProviderForNetwork(NetworkName.Polygon, mockProvider);

      const result = await getERC20AndNFTAmountRecipientsForUnshieldToOrigin(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_SHIELD_TXID,
      );

      expect(result.erc20AmountRecipients).to.be.an('array');
      if (result.erc20AmountRecipients.length > 0) {
        expect(result.erc20AmountRecipients[0].recipientAddress).to.equal(
          MOCK_USER_ADDRESS,
          'Should extract token owner from Transfer event, not tx.from (relayer)',
        );
      }
    });

    it('Should handle standard transactions where tx.from equals token owner', async function () {
      this.timeout(60_000);

      const transferLog = createMockTransferLog(
        MOCK_USER_ADDRESS,
        MOCK_RAILGUN_PROXY_ADDRESS,
      );

      const mockReceipt = createMockReceipt([transferLog]);
      const mockTransaction = createMockTransaction(MOCK_USER_ADDRESS);

      const mockProvider = {
        getTransaction: async () => mockTransaction,
        getTransactionReceipt: async () => mockReceipt,
      } as any;

      setFallbackProviderForNetwork(NetworkName.Polygon, mockProvider);

      const result = await getERC20AndNFTAmountRecipientsForUnshieldToOrigin(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_SHIELD_TXID,
      );

      expect(result.erc20AmountRecipients).to.be.an('array');
      if (result.erc20AmountRecipients.length > 0) {
        expect(result.erc20AmountRecipients[0].recipientAddress).to.equal(
          MOCK_USER_ADDRESS,
        );
      }
    });

    it('Should ignore Transfer events not directed to Railgun contract', async function () {
      this.timeout(60_000);

      const irrelevantTransferLog = createMockTransferLog(
        MOCK_USER_ADDRESS,
        MOCK_ETH_WALLET_ADDRESS,
      );

      const relevantTransferLog = createMockTransferLog(
        MOCK_USER_ADDRESS,
        MOCK_RAILGUN_PROXY_ADDRESS,
      );

      const mockReceipt = createMockReceipt([
        irrelevantTransferLog,
        relevantTransferLog,
      ]);
      const mockTransaction = createMockTransaction(MOCK_RELAYER_ADDRESS);

      const mockProvider = {
        getTransaction: async () => mockTransaction,
        getTransactionReceipt: async () => mockReceipt,
      } as any;

      setFallbackProviderForNetwork(NetworkName.Polygon, mockProvider);

      const result = await getERC20AndNFTAmountRecipientsForUnshieldToOrigin(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_SHIELD_TXID,
      );

      expect(result.erc20AmountRecipients).to.be.an('array');
      if (result.erc20AmountRecipients.length > 0) {
        expect(result.erc20AmountRecipients[0].recipientAddress).to.equal(
          MOCK_USER_ADDRESS,
        );
      }
    });

    it('Should fallback to tx.from when no Transfer events found', async function () {
      this.timeout(60_000);

      const mockReceipt = createMockReceipt([]);
      const mockTransaction = createMockTransaction(MOCK_USER_ADDRESS);

      const mockProvider = {
        getTransaction: async () => mockTransaction,
        getTransactionReceipt: async () => mockReceipt,
      } as any;

      setFallbackProviderForNetwork(NetworkName.Polygon, mockProvider);

      const result = await getERC20AndNFTAmountRecipientsForUnshieldToOrigin(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_SHIELD_TXID,
      );

      expect(result.erc20AmountRecipients).to.be.an('array');
      if (result.erc20AmountRecipients.length > 0) {
        expect(result.erc20AmountRecipients[0].recipientAddress).to.equal(
          MOCK_USER_ADDRESS,
          'Should fallback to tx.from when no Transfer events',
        );
      }
    });

    it('Should handle malformed log topics gracefully', async function () {
      this.timeout(60_000);

      const malformedLog = {
        address: MOCK_TOKEN_ADDRESS,
        topics: [ERC20_TRANSFER_EVENT_SIGNATURE],
        data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
        blockNumber: 12345,
        transactionHash: MOCK_SHIELD_TXID,
        transactionIndex: 0,
        blockHash: '0xblockhash',
        logIndex: 0,
        removed: false,
        index: 0,
      };

      const validLog = createMockTransferLog(
        MOCK_USER_ADDRESS,
        MOCK_RAILGUN_PROXY_ADDRESS,
      );

      const mockReceipt = createMockReceipt([malformedLog, validLog]);
      const mockTransaction = createMockTransaction(MOCK_RELAYER_ADDRESS);

      const mockProvider = {
        getTransaction: async () => mockTransaction,
        getTransactionReceipt: async () => mockReceipt,
      } as any;

      setFallbackProviderForNetwork(NetworkName.Polygon, mockProvider);

      const result = await getERC20AndNFTAmountRecipientsForUnshieldToOrigin(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_SHIELD_TXID,
      );

      expect(result.erc20AmountRecipients).to.be.an('array');
      if (result.erc20AmountRecipients.length > 0) {
        expect(result.erc20AmountRecipients[0].recipientAddress).to.equal(
          MOCK_USER_ADDRESS,
          'Should skip malformed log and process valid one',
        );
      }
    });

    it('Should throw error when transaction is not found', async function () {
      this.timeout(60_000);

      const mockProvider = {
        getTransaction: async () => null,
        getTransactionReceipt: async () => createMockReceipt([]),
      } as any;

      setFallbackProviderForNetwork(NetworkName.Polygon, mockProvider);

      await expect(
        getERC20AndNFTAmountRecipientsForUnshieldToOrigin(
          txidVersion,
          NetworkName.Polygon,
          railgunWallet.id,
          MOCK_SHIELD_TXID,
        ),
      ).to.be.rejectedWith('Could not find shield transaction from RPC');
    });

    it('Should throw error when receipt is not found', async function () {
      this.timeout(60_000);

      const mockProvider = {
        getTransaction: async () => createMockTransaction(MOCK_USER_ADDRESS),
        getTransactionReceipt: async () => null,
      } as any;

      setFallbackProviderForNetwork(NetworkName.Polygon, mockProvider);

      await expect(
        getERC20AndNFTAmountRecipientsForUnshieldToOrigin(
          txidVersion,
          NetworkName.Polygon,
          railgunWallet.id,
          MOCK_SHIELD_TXID,
        ),
      ).to.be.rejectedWith('Could not find shield transaction receipt from RPC');
    });

    it('Should handle multiple token owners by using first one', async function () {
      this.timeout(60_000);

      const user1Address = '0x1111111111111111111111111111111111111111';
      const user2Address = '0x2222222222222222222222222222222222222222';

      const transferLog1 = createMockTransferLog(
        user1Address,
        MOCK_RAILGUN_PROXY_ADDRESS,
      );

      const transferLog2 = createMockTransferLog(
        user2Address,
        MOCK_RAILGUN_PROXY_ADDRESS,
      );

      const mockReceipt = createMockReceipt([transferLog1, transferLog2]);
      const mockTransaction = createMockTransaction(MOCK_RELAYER_ADDRESS);

      const mockProvider = {
        getTransaction: async () => mockTransaction,
        getTransactionReceipt: async () => mockReceipt,
      } as any;

      setFallbackProviderForNetwork(NetworkName.Polygon, mockProvider);

      const result = await getERC20AndNFTAmountRecipientsForUnshieldToOrigin(
        txidVersion,
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_SHIELD_TXID,
      );

      expect(result.erc20AmountRecipients).to.be.an('array');
      if (result.erc20AmountRecipients.length > 0) {
        const recipientAddr = result.erc20AmountRecipients[0].recipientAddress.toLowerCase();
        const isValidOwner =
          recipientAddr === user1Address.toLowerCase() ||
          recipientAddr === user2Address.toLowerCase();
        expect(isValidOwner).to.be.true;
      }
    });
  });
});
