import { FallbackProvider } from '@ethersproject/providers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon, { SinonStub, SinonSpy } from 'sinon';
import {
  RailgunWallet,
  TransactionStruct,
  TransactionBatch,
  RailgunProxyContract,
  RelayAdaptContract,
  getTokenDataERC20,
  getTokenDataHash,
} from '@railgun-community/engine';
import {
  RailgunWalletTokenAmount,
  NetworkName,
  NETWORK_CONFIG,
  deserializeTransaction,
  EVMGasType,
  TransactionGasDetailsSerialized,
  RailgunWalletTokenAmountRecipient,
} from '@railgun-community/shared-models';
import { BigNumber } from '@ethersproject/bignumber';
import { PopulatedTransaction } from '@ethersproject/contracts';
import {
  initTestEngine,
  initTestEngineNetwork,
} from '../../../test/setup.test';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_FEE_TOKEN_DETAILS,
  MOCK_MNEMONIC,
  MOCK_RAILGUN_WALLET_ADDRESS,
  MOCK_TOKEN_ADDRESS,
  MOCK_TOKEN_ADDRESS_2,
  MOCK_TOKEN_AMOUNTS,
  MOCK_TOKEN_FEE,
  MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
} from '../../../test/mocks.test';
import {
  populateProvedUnshield,
  gasEstimateForUnprovenUnshield,
  populateProvedUnshieldBaseToken,
  gasEstimateForUnprovenUnshieldBaseToken,
} from '../tx-unshield';
import {
  generateUnshieldBaseTokenProof,
  generateUnshieldProof,
} from '../tx-proof-unshield';
import { createRailgunWallet } from '../../railgun/wallets/wallets';
import { fullWalletForID } from '../../railgun/core/engine';
import { setCachedProvedTransaction } from '../proof-cache';
import { decimalToHexString } from '../../../utils/format';

let gasEstimateStub: SinonStub;
let railProveStub: SinonStub;
let railDummyProveStub: SinonStub;
let railTransactStub: SinonStub;
let relayAdaptPopulateUnshieldBaseToken: SinonStub;
let addUnshieldDataSpy: SinonSpy;
let erc20NoteSpy: SinonSpy;

let railgunWallet: RailgunWallet;
let relayerFeeTokenAmountRecipient: RailgunWalletTokenAmountRecipient;

const polygonRelayAdaptContract =
  NETWORK_CONFIG[NetworkName.Polygon].relayAdaptContract;

chai.use(chaiAsPromised);
const { expect } = chai;

const mockTokenData0 = getTokenDataERC20(MOCK_TOKEN_AMOUNTS[0].tokenAddress);
const mockTokenHash0 = getTokenDataHash(mockTokenData0);
const mockTokenData1 = getTokenDataERC20(MOCK_TOKEN_AMOUNTS[1].tokenAddress);
const mockTokenHash1 = getTokenDataHash(mockTokenData1);

const MOCK_TOKEN_AMOUNTS_DIFFERENT: RailgunWalletTokenAmount[] = [
  {
    tokenAddress: MOCK_TOKEN_ADDRESS,
    amountString: '0x0100',
  },
  {
    tokenAddress: MOCK_TOKEN_ADDRESS_2,
    amountString: '0x0300',
  },
];

const overallBatchMinGasPrice = '0x1000';

const gasDetailsSerialized: TransactionGasDetailsSerialized = {
  evmGasType: EVMGasType.Type1,
  gasEstimateString: '0x00',
  gasPriceString: overallBatchMinGasPrice,
};

const MOCK_TOKEN_AMOUNT_RECIPIENTS_INVALID: RailgunWalletTokenAmountRecipient[] =
  MOCK_TOKEN_AMOUNTS.map(tokenAmount => ({
    ...tokenAmount,
    recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
  }));

const MOCK_TOKEN_AMOUNT_RECIPIENTS: RailgunWalletTokenAmountRecipient[] =
  MOCK_TOKEN_AMOUNTS.map(tokenAmount => ({
    ...tokenAmount,
    recipientAddress: MOCK_ETH_WALLET_ADDRESS,
  }));

const MOCK_TOKEN_AMOUNT_RECIPIENTS_DIFFERENT: RailgunWalletTokenAmountRecipient[] =
  MOCK_TOKEN_AMOUNTS_DIFFERENT.map(tokenAmount => ({
    ...tokenAmount,
    recipientAddress: MOCK_ETH_WALLET_ADDRESS,
  }));

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

describe('tx-unshield', () => {
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

    relayerFeeTokenAmountRecipient = {
      ...MOCK_TOKEN_FEE,
      recipientAddress: relayerRailgunAddress,
    };

    railProveStub = Sinon.stub(
      TransactionBatch.prototype,
      'generateTransactions',
    ).resolves([{}] as TransactionStruct[]);
    railDummyProveStub = Sinon.stub(
      TransactionBatch.prototype,
      'generateDummyTransactions',
    ).resolves([
      {
        commitments: [
          '0x0000000000000000000000000000000000000000000000000000000000000003',
        ],
        nullifiers: [
          '0x0000000000000000000000000000000000000000000000000000000000000001',
          '0x0000000000000000000000000000000000000000000000000000000000000002',
        ],
      },
    ] as unknown as TransactionStruct[]);
    railTransactStub = Sinon.stub(
      RailgunProxyContract.prototype,
      'transact',
    ).resolves({ data: '0x0123' } as PopulatedTransaction);
    relayAdaptPopulateUnshieldBaseToken = Sinon.stub(
      RelayAdaptContract.prototype,
      'populateUnshieldBaseToken',
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
    railTransactStub.restore();
    relayAdaptPopulateUnshieldBaseToken.restore();
  });

  // WITHDRAW - GAS ESTIMATE

  it('Should get gas estimates for valid Unshield', async () => {
    stubGasEstimateSuccess();
    spyOnSetUnshield();
    const rsp = await gasEstimateForUnprovenUnshield(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      [], // nftRecipients
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.error).to.be.undefined;
    expect(addUnshieldDataSpy.called).to.be.true;
    expect(addUnshieldDataSpy.args).to.deep.equal([
      [
        {
          toAddress: MOCK_ETH_WALLET_ADDRESS,
          tokenData: mockTokenData0,
          tokenHash: mockTokenHash0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // run 1 - token 1
      [
        {
          toAddress: MOCK_ETH_WALLET_ADDRESS,
          tokenData: mockTokenData1,
          tokenHash: mockTokenHash1,
          value: BigInt('0x0200'),
          allowOverride: false,
        },
      ], // run 1 - token 2
      [
        {
          toAddress: MOCK_ETH_WALLET_ADDRESS,
          tokenData: mockTokenData0,
          tokenHash: mockTokenHash0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // run 2 - token 1
      [
        {
          toAddress: MOCK_ETH_WALLET_ADDRESS,
          tokenData: mockTokenData1,
          tokenHash: mockTokenHash1,
          value: BigInt('0x0200'),
          allowOverride: false,
        },
      ], // run 2 - token 2
    ]);
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(200));
  });

  it('Should error on gas estimates for invalid Unshield', async () => {
    stubGasEstimateSuccess();
    const rsp = await gasEstimateForUnprovenUnshield(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNT_RECIPIENTS_INVALID,
      [], // nftRecipients
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.error).to.equal('Invalid wallet address.');
  });

  it('Should error on unshield gas estimate for ethers rejections', async () => {
    stubGasEstimateFailure();
    const rsp = await gasEstimateForUnprovenUnshield(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      [], // nftRecipients
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.error).to.equal('test rejection - gas estimate');
  });

  // WITHDRAW BASE TOKEN - GAS ESTIMATE

  it('Should get gas estimates for valid Unshield base token', async () => {
    stubGasEstimateSuccess();
    spyOnSetUnshield();
    const rsp = await gasEstimateForUnprovenUnshieldBaseToken(
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS[0],
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.error).to.be.undefined;
    expect(addUnshieldDataSpy.called).to.be.true;
    expect(addUnshieldDataSpy.args).to.deep.equal([
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockTokenData0,
          tokenHash: mockTokenHash0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ],
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockTokenData0,
          tokenHash: mockTokenHash0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ],
    ]);
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(200));
  });

  it('Should get gas estimates for valid Unshield base token: public wallet', async () => {
    stubGasEstimateSuccess();
    spyOnSetUnshield();
    const rsp = await gasEstimateForUnprovenUnshieldBaseToken(
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS[0],
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      true, // sendWithPublicWallet
    );
    expect(rsp.error).to.be.undefined;
    expect(addUnshieldDataSpy.called).to.be.true;
    expect(addUnshieldDataSpy.args).to.deep.equal([
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockTokenData0,
          tokenHash: mockTokenHash0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ],
    ]);
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(200));
  });

  it('Should error on gas estimates for invalid Unshield base token', async () => {
    stubGasEstimateSuccess();
    const rsp = await gasEstimateForUnprovenUnshieldBaseToken(
      NetworkName.Polygon,
      MOCK_RAILGUN_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS[0],
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.error).to.equal('Invalid wallet address.');
  });

  it('Should error on unshield base token gas estimate for ethers rejections', async () => {
    stubGasEstimateFailure();
    const rsp = await gasEstimateForUnprovenUnshieldBaseToken(
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS[0],
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.error).to.equal('test rejection - gas estimate');
  });

  // WITHDRAW - PROVE AND SEND

  it('Should populate tx for valid Unshield', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    spyOnSetUnshield();
    const proofResponse = await generateUnshieldProof(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      [], // nftRecipients
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      () => {}, // progressCallback
    );
    expect(proofResponse.error).to.be.undefined;
    expect(addUnshieldDataSpy.called).to.be.true;
    expect(addUnshieldDataSpy.args).to.deep.equal([
      [
        {
          toAddress: MOCK_ETH_WALLET_ADDRESS,
          tokenData: mockTokenData0,
          tokenHash: mockTokenHash0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // run 1 - token 1
      [
        {
          toAddress: MOCK_ETH_WALLET_ADDRESS,
          tokenData: mockTokenData1,
          tokenHash: mockTokenHash1,
          value: BigInt('0x0200'),
          allowOverride: false,
        },
      ], // run 1 - token 2
    ]);
    const populateResponse = await populateProvedUnshield(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      [], // nftRecipients
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      gasDetailsSerialized,
    );
    expect(populateResponse.error).to.be.undefined;
    expect(populateResponse.serializedTransaction).to.equal(
      '0x01cc8080821000808080820123c0',
    );

    const deserialized = deserializeTransaction(
      populateResponse.serializedTransaction as string,
      2,
      1,
    );

    expect(deserialized.nonce).to.equal(2);
    expect(deserialized.gasPrice?.toString()).to.equal('4096');
    expect(deserialized.gasLimit?.toString()).to.equal('0');
    expect(deserialized.value?.toString()).to.equal('0');
    expect(deserialized.data).to.equal('0x0123');
    expect(deserialized.to).to.equal(null);
    expect(deserialized.chainId).to.equal(1);
    expect(deserialized.type).to.equal(1);
    expect(Object.keys(deserialized).length).to.equal(9);
  });

  it('Should error on populate tx for invalid Unshield', async () => {
    stubGasEstimateSuccess();
    const rsp = await populateProvedUnshield(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNT_RECIPIENTS_INVALID,
      [], // nftRecipients
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      gasDetailsSerialized,
    );
    expect(rsp.error).to.equal(
      'Invalid proof for this transaction. Mismatch: tokenAmountRecipients.',
    );
  });

  it('Should error on populate unshield tx for unproved transaction', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    const rsp = await populateProvedUnshield(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      [], // nftRecipients
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      gasDetailsSerialized,
    );
    expect(rsp.error).to.equal(
      'Invalid proof for this transaction. No proof found.',
    );
  });

  it('Should error on populate unshield tx when params changed (invalid cached proof)', async () => {
    stubGasEstimateSuccess();
    const proofResponse = await generateUnshieldProof(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      [], // nftRecipients
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      () => {}, // progressCallback
    );
    expect(proofResponse.error).to.be.undefined;
    const rsp = await populateProvedUnshield(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNT_RECIPIENTS_DIFFERENT,
      [], // nftRecipients
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      gasDetailsSerialized,
    );
    expect(rsp.error).to.equal(
      'Invalid proof for this transaction. Mismatch: tokenAmountRecipients.',
    );
  });

  // WITHDRAW BASE TOKEN - PROVE AND SEND

  it('Should populate tx for valid Unshield Base Token', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    spyOnSetUnshield();
    const proofResponse = await generateUnshieldBaseTokenProof(
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS[0],
      relayerFeeTokenAmountRecipient,
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
          tokenData: mockTokenData0,
          tokenHash: mockTokenHash0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // Dummy prove.
      [
        {
          toAddress: polygonRelayAdaptContract,
          tokenData: mockTokenData0,
          tokenHash: mockTokenHash0,
          value: BigInt('0x0100'),
          allowOverride: false,
        },
      ], // Actual prove
    ]);
    const populateResponse = await populateProvedUnshieldBaseToken(
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNTS[0],
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      gasDetailsSerialized,
    );
    expect(populateResponse.error).to.be.undefined;
    expect(populateResponse.serializedTransaction).to.equal(
      '0x01cc8080821000808080820123c0',
    );

    const deserialized = deserializeTransaction(
      populateResponse.serializedTransaction as string,
      2,
      1,
    );

    expect(deserialized.nonce).to.equal(2);
    expect(deserialized.gasPrice?.toString()).to.equal('4096');
    expect(deserialized.gasLimit?.toString()).to.equal('0');
    expect(deserialized.value?.toString()).to.equal('0');
    expect(deserialized.data).to.equal('0x0123');
    expect(deserialized.to).to.equal(null);
    expect(deserialized.chainId).to.equal(1);
    expect(deserialized.type).to.equal(1);
    expect(Object.keys(deserialized).length).to.equal(9);
  }).timeout(60000);

  it('Should error on populate tx for invalid Unshield Base Token', async () => {
    stubGasEstimateSuccess();
    const rsp = await populateProvedUnshieldBaseToken(
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNTS_DIFFERENT[0],
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      gasDetailsSerialized,
    );
    expect(rsp.error).to.equal(
      'Invalid proof for this transaction. Mismatch: tokenAmountRecipients.',
    );
  });

  it('Should error on populate Unshield Base Token tx for unproved transaction', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    const rsp = await populateProvedUnshieldBaseToken(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_ETH_WALLET_ADDRESS,
      MOCK_TOKEN_AMOUNTS[0],
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      gasDetailsSerialized,
    );
    expect(rsp.error).to.equal(
      'Invalid proof for this transaction. No proof found.',
    );
  });

  it('Should error on populate Unshield Base Token tx when params changed (invalid cached proof)', async () => {
    stubGasEstimateSuccess();
    const proofResponse = await generateUnshieldBaseTokenProof(
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS[0],
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      () => {}, // progressCallback
    );
    expect(proofResponse.error).to.be.undefined;
    const rsp = await populateProvedUnshieldBaseToken(
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNTS_DIFFERENT[0],
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      gasDetailsSerialized,
    );
    expect(rsp.error).to.equal(
      'Invalid proof for this transaction. Mismatch: tokenAmountRecipients.',
    );
  });
});
