import { FallbackProvider } from '@ethersproject/providers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon, { SinonStub, SinonSpy } from 'sinon';
import {
  RailgunWallet,
  SerializedTransaction,
  TransactionBatch,
  RailgunProxyContract,
  RelayAdaptContract,
} from '@railgun-community/engine';
import {
  RailgunWalletTokenAmount,
  NetworkName,
  NETWORK_CONFIG,
  deserializeTransaction,
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
  populateProvedWithdraw,
  gasEstimateForUnprovenWithdraw,
  populateProvedWithdrawBaseToken,
  gasEstimateForUnprovenWithdrawBaseToken,
} from '../tx-withdraw';
import {
  generateWithdrawBaseTokenProof,
  generateWithdrawProof,
} from '../tx-proof-withdraw';
import { createRailgunWallet } from '../../railgun/wallets/wallets';
import { fullWalletForID } from '../../railgun/core/engine';
import { setCachedProvedTransaction } from '../proof-cache';
import { decimalToHexString } from '../../../utils/format';

let gasEstimateStub: SinonStub;
let railProveStub: SinonStub;
let railDummyProveStub: SinonStub;
let railTransactStub: SinonStub;
let relayAdaptPopulateWithdrawBaseToken: SinonStub;
let setWithdrawSpy: SinonSpy;
let erc20NoteSpy: SinonSpy;

let railgunWallet: RailgunWallet;
let relayerFeeTokenAmountRecipient: RailgunWalletTokenAmountRecipient;

const polygonRelayAdaptContract =
  NETWORK_CONFIG[NetworkName.Polygon].relayAdaptContract;

chai.use(chaiAsPromised);
const { expect } = chai;

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

const spyOnSetWithdraw = () => {
  setWithdrawSpy = Sinon.spy(TransactionBatch.prototype, 'setWithdraw');
};

describe('tx-withdraw-transfer', () => {
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
    railTransactStub = Sinon.stub(
      RailgunProxyContract.prototype,
      'transact',
    ).resolves({ data: '0x0123' } as PopulatedTransaction);
    relayAdaptPopulateWithdrawBaseToken = Sinon.stub(
      RelayAdaptContract.prototype,
      'populateWithdrawBaseToken',
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
    railTransactStub.restore();
    relayAdaptPopulateWithdrawBaseToken.restore();
  });

  // WITHDRAW - GAS ESTIMATE

  it('Should get gas estimates for valid Withdraw', async () => {
    stubGasEstimateSuccess();
    spyOnSetWithdraw();
    const rsp = await gasEstimateForUnprovenWithdraw(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.error).to.be.undefined;
    expect(setWithdrawSpy.called).to.be.true;
    expect(setWithdrawSpy.args).to.deep.equal([
      [MOCK_ETH_WALLET_ADDRESS, '0x0100', false], // 1st iteration - token1
      [MOCK_ETH_WALLET_ADDRESS, '0x0200', false], // 1st iteration - token2
      [MOCK_ETH_WALLET_ADDRESS, '0x0100', false], // 2nd iteration - token1
      [MOCK_ETH_WALLET_ADDRESS, '0x0200', false], // 2nd iteration - token2
    ]);
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(200));
  });

  it('Should error on gas estimates for invalid Withdraw', async () => {
    stubGasEstimateSuccess();
    const rsp = await gasEstimateForUnprovenWithdraw(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNT_RECIPIENTS_INVALID,
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.error).to.equal('Invalid wallet address.');
  });

  it('Should error on withdraw gas estimate for ethers rejections', async () => {
    stubGasEstimateFailure();
    const rsp = await gasEstimateForUnprovenWithdraw(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.error).to.equal('test rejection - gas estimate');
  });

  // WITHDRAW BASE TOKEN - GAS ESTIMATE

  it('Should get gas estimates for valid Withdraw base token', async () => {
    stubGasEstimateSuccess();
    spyOnSetWithdraw();
    const rsp = await gasEstimateForUnprovenWithdrawBaseToken(
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
    expect(setWithdrawSpy.called).to.be.true;
    expect(setWithdrawSpy.args).to.deep.equal([
      [polygonRelayAdaptContract, '0x0100', false],
      [polygonRelayAdaptContract, '0x0100', false],
    ]);
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(200));
  });

  it('Should get gas estimates for valid Withdraw base token: public wallet', async () => {
    stubGasEstimateSuccess();
    spyOnSetWithdraw();
    const rsp = await gasEstimateForUnprovenWithdrawBaseToken(
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
    expect(setWithdrawSpy.called).to.be.true;
    expect(setWithdrawSpy.args).to.deep.equal([
      [polygonRelayAdaptContract, '0x0100', false],
    ]);
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(200));
  });

  it('Should error on gas estimates for invalid Withdraw base token', async () => {
    stubGasEstimateSuccess();
    const rsp = await gasEstimateForUnprovenWithdrawBaseToken(
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

  it('Should error on withdraw base token gas estimate for ethers rejections', async () => {
    stubGasEstimateFailure();
    const rsp = await gasEstimateForUnprovenWithdrawBaseToken(
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

  it('Should populate tx for valid Withdraw', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    spyOnSetWithdraw();
    const proofResponse = await generateWithdrawProof(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      () => {}, // progressCallback
    );
    expect(proofResponse.error).to.be.undefined;
    expect(setWithdrawSpy.called).to.be.true;
    expect(setWithdrawSpy.args).to.deep.equal([
      [MOCK_ETH_WALLET_ADDRESS, '0x0100', false], // 1st iteration - token1
      [MOCK_ETH_WALLET_ADDRESS, '0x0200', false], // 1st iteration - token2
    ]);
    const populateResponse = await populateProvedWithdraw(
      railgunWallet.id,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
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

  it('Should error on populate tx for invalid Withdraw', async () => {
    stubGasEstimateSuccess();
    const rsp = await populateProvedWithdraw(
      railgunWallet.id,
      MOCK_TOKEN_AMOUNT_RECIPIENTS_INVALID,
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      undefined, // gasDetailsSerialized
    );
    expect(rsp.error).to.equal(
      'Invalid proof for this transaction. Mismatch: tokenAmountRecipients.',
    );
  });

  it('Should error on populate withdraw tx for unproved transaction', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    const rsp = await populateProvedWithdraw(
      railgunWallet.id,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      undefined, // gasDetailsSerialized
    );
    expect(rsp.error).to.equal(
      'Invalid proof for this transaction. No proof found.',
    );
  });

  it('Should error on populate withdraw tx when params changed (invalid cached proof)', async () => {
    stubGasEstimateSuccess();
    const proofResponse = await generateWithdrawProof(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      () => {}, // progressCallback
    );
    expect(proofResponse.error).to.be.undefined;
    const rsp = await populateProvedWithdraw(
      railgunWallet.id,
      MOCK_TOKEN_AMOUNT_RECIPIENTS_DIFFERENT,
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      undefined, // gasDetailsSerialized
    );
    expect(rsp.error).to.equal(
      'Invalid proof for this transaction. Mismatch: tokenAmountRecipients.',
    );
  });

  // WITHDRAW BASE TOKEN - PROVE AND SEND

  it('Should populate tx for valid Withdraw Base Token', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    spyOnSetWithdraw();
    const proofResponse = await generateWithdrawBaseTokenProof(
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS[0],
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      () => {}, // progressCallback
    );
    expect(proofResponse.error).to.be.undefined;
    expect(setWithdrawSpy.called).to.be.true;
    expect(setWithdrawSpy.args).to.deep.equal([
      [polygonRelayAdaptContract, '0x0100', false], // Dummy prove.
      [polygonRelayAdaptContract, '0x0100', false], // Actual prove.
    ]);
    const populateResponse = await populateProvedWithdrawBaseToken(
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNTS[0],
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
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
  }).timeout(60000);

  it('Should error on populate tx for invalid Withdraw Base Token', async () => {
    stubGasEstimateSuccess();
    const rsp = await populateProvedWithdrawBaseToken(
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNTS_DIFFERENT[0],
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      undefined, // gasDetailsSerialized
    );
    expect(rsp.error).to.equal(
      'Invalid proof for this transaction. Mismatch: tokenAmountRecipients.',
    );
  });

  it('Should error on populate Withdraw Base Token tx for unproved transaction', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    const rsp = await populateProvedWithdrawBaseToken(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_ETH_WALLET_ADDRESS,
      MOCK_TOKEN_AMOUNTS[0],
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      undefined, // gasDetailsSerialized
    );
    expect(rsp.error).to.equal(
      'Invalid proof for this transaction. No proof found.',
    );
  });

  it('Should error on populate Withdraw Base Token tx when params changed (invalid cached proof)', async () => {
    stubGasEstimateSuccess();
    const proofResponse = await generateWithdrawBaseTokenProof(
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_TOKEN_AMOUNTS[0],
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      () => {}, // progressCallback
    );
    expect(proofResponse.error).to.be.undefined;
    const rsp = await populateProvedWithdrawBaseToken(
      NetworkName.Polygon,
      MOCK_ETH_WALLET_ADDRESS,
      railgunWallet.id,
      MOCK_TOKEN_AMOUNTS_DIFFERENT[0],
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      undefined, // gasDetailsSerialized
    );
    expect(rsp.error).to.equal(
      'Invalid proof for this transaction. Mismatch: tokenAmountRecipients.',
    );
  });
});
