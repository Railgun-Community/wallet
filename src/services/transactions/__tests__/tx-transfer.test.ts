import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon, { SinonStub, SinonSpy } from 'sinon';
import {
  RailgunWallet,
  TransactionStruct,
  TransactionBatch,
  RailgunSmartWalletContract,
  RelayAdaptContract,
} from '@railgun-community/engine';
import {
  RailgunERC20Amount,
  NetworkName,
  EVMGasType,
  RailgunERC20AmountRecipient,
  RailgunNFTAmountRecipient,
  TransactionGasDetails,
  isDefined,
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
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_FEE_TOKEN_DETAILS,
  MOCK_FORMATTED_RELAYER_FEE_COMMITMENT_CIPHERTEXT,
  MOCK_MEMO,
  MOCK_MNEMONIC,
  MOCK_NFT_AMOUNT_RECIPIENTS,
  MOCK_NULLIFIERS,
  MOCK_RAILGUN_WALLET_ADDRESS,
  MOCK_TOKEN_ADDRESS,
  MOCK_TOKEN_ADDRESS_2,
  MOCK_TOKEN_AMOUNTS,
  MOCK_TOKEN_FEE,
  MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
} from '../../../tests/mocks.test';
import {
  populateProvedTransfer,
  gasEstimateForUnprovenTransfer,
} from '../tx-transfer';
import { generateTransferProof } from '../tx-proof-transfer';
import { createRailgunWallet } from '../../railgun/wallets/wallets';
import { fullWalletForID } from '../../railgun/core/engine';
import { setCachedProvedTransaction } from '../proof-cache';
import * as txNotes from '../tx-notes';
import { ContractTransaction, FallbackProvider } from 'ethers';

let gasEstimateStub: SinonStub;
let railProveStub: SinonStub;
let railDummyProveStub: SinonStub;
let railTransactStub: SinonStub;
let relayAdaptPopulateUnshieldBaseToken: SinonStub;
let setUnshieldSpy: SinonSpy;
let erc20NoteSpy: SinonSpy;
let nftNoteSpy: SinonSpy;

let railgunWallet: RailgunWallet;
let relayerFeeERC20AmountRecipient: RailgunERC20AmountRecipient;

chai.use(chaiAsPromised);
const { expect } = chai;

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

const gasDetails: TransactionGasDetails = {
  evmGasType: EVMGasType.Type1,
  gasEstimate: 1000n,
  gasPrice: overallBatchMinGasPrice,
};

const MOCK_TOKEN_AMOUNT_RECIPIENTS_INVALID: RailgunERC20AmountRecipient[] =
  MOCK_TOKEN_AMOUNTS.map(erc20Amount => ({
    ...erc20Amount,
    recipientAddress: MOCK_ETH_WALLET_ADDRESS,
  }));

const MOCK_NFT_AMOUNT_RECIPIENTS_INVALID: RailgunNFTAmountRecipient[] =
  MOCK_NFT_AMOUNT_RECIPIENTS.map(nftAmountRecipient => ({
    ...nftAmountRecipient,
    recipientAddress: MOCK_ETH_WALLET_ADDRESS,
  }));

const MOCK_TOKEN_AMOUNT_RECIPIENTS: RailgunERC20AmountRecipient[] =
  MOCK_TOKEN_AMOUNTS.map(erc20Amount => ({
    ...erc20Amount,
    recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
  }));

const MOCK_TOKEN_AMOUNT_RECIPIENTS_DIFFERENT: RailgunERC20AmountRecipient[] =
  MOCK_TOKEN_AMOUNTS_DIFFERENT.map(erc20Amount => ({
    ...erc20Amount,
    recipientAddress: MOCK_ETH_WALLET_ADDRESS,
  }));

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

const spyOnERC20Note = () => {
  erc20NoteSpy = Sinon.spy(txNotes, 'erc20NoteFromERC20AmountRecipient');
};

const spyOnNFTNote = () => {
  nftNoteSpy = Sinon.spy(txNotes, 'nftNoteFromNFTAmountRecipient');
};

describe('tx-transfer', () => {
  before(async function run() {
    this.timeout(5000);
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
    railTransactStub = Sinon.stub(
      RailgunSmartWalletContract.prototype,
      'transact',
    ).resolves({ data: '0x0123' } as ContractTransaction);
    relayAdaptPopulateUnshieldBaseToken = Sinon.stub(
      RelayAdaptContract.prototype,
      'populateUnshieldBaseToken',
    ).resolves({ data: '0x0123' } as ContractTransaction);
  });
  afterEach(() => {
    gasEstimateStub?.restore();
    setUnshieldSpy?.restore();
    erc20NoteSpy?.restore();
    nftNoteSpy?.restore();
  });
  after(async () => {
    railProveStub.restore();
    railDummyProveStub.restore();
    railTransactStub.restore();
    relayAdaptPopulateUnshieldBaseToken.restore();
    await closeTestEngine();
  });

  // TRANSFER ERC20 - GAS ESTIMATE

  it('Should get gas estimates for valid erc20 transfer', async () => {
    stubGasEstimateSuccess();
    spyOnERC20Note();
    const rsp = await gasEstimateForUnprovenTransfer(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MEMO,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      [], // nftAmountRecipients
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(erc20NoteSpy.called).to.be.true;
    expect(erc20NoteSpy.args.length).to.equal(6); // Number of calls - 3 for each of 2 relayer fee iterations
    expect(erc20NoteSpy.args[0][0].amount).to.equal(BigInt('0x00')); // original relayer fee
    expect(erc20NoteSpy.args[1][0].amount).to.equal(BigInt('0x100')); // token1
    expect(erc20NoteSpy.args[2][0].amount).to.equal(BigInt('0x200')); // token2
    expect(erc20NoteSpy.args[3][0].amount).to.equal(
      BigInt('0x0275a61bf8737eb4'),
    ); // New estimated Relayer Fee
    expect(erc20NoteSpy.args[4][0].amount).to.equal(BigInt('0x100')); // token1
    expect(erc20NoteSpy.args[5][0].amount).to.equal(BigInt('0x200')); // token2
    expect(rsp.relayerFeeCommitment).to.not.be.undefined;
    expect(rsp.relayerFeeCommitment?.commitmentCiphertext).to.deep.equal(
      MOCK_FORMATTED_RELAYER_FEE_COMMITMENT_CIPHERTEXT,
    );
    // Add 7500 for the dummy tx variance
    expect(rsp.gasEstimate).to.equal(7500n + 200n);
  }).timeout(10000);

  it('Should get gas estimates for valid erc20 transfer: public wallet', async () => {
    stubGasEstimateSuccess();
    spyOnERC20Note();
    const rsp = await gasEstimateForUnprovenTransfer(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MEMO,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      [], // nftAmountRecipients
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      true, // sendWithPublicWallet
    );
    expect(erc20NoteSpy.called).to.be.true;
    expect(erc20NoteSpy.args.length).to.equal(2); // Number of calls (without relayer fees)
    expect(erc20NoteSpy.args[0][0].amount).to.equal(BigInt('0x100')); // token1
    expect(erc20NoteSpy.args[1][0].amount).to.equal(BigInt('0x200')); // token2
    expect(rsp.relayerFeeCommitment).to.be.undefined;
    // Add 7500 for the dummy tx variance
    expect(rsp.gasEstimate).to.equal(7500n + 200n);
  }).timeout(10000);

  it('Should error on gas estimates for invalid erc20 transfer', async () => {
    stubGasEstimateSuccess();
    await expect(
      gasEstimateForUnprovenTransfer(
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_DB_ENCRYPTION_KEY,
        MOCK_MEMO,
        MOCK_TOKEN_AMOUNT_RECIPIENTS_INVALID,
        [], // nftAmountRecipients
        MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
        MOCK_FEE_TOKEN_DETAILS,
        false, // sendWithPublicWallet
      ),
    ).rejectedWith('Invalid RAILGUN address.');
  });

  it('Should error on transfer gas estimate for ethers rejections', async () => {
    stubGasEstimateFailure();
    await expect(
      gasEstimateForUnprovenTransfer(
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_DB_ENCRYPTION_KEY,
        MOCK_MEMO,
        MOCK_TOKEN_AMOUNT_RECIPIENTS,
        [], // nftAmountRecipients
        MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
        MOCK_FEE_TOKEN_DETAILS,
        false, // sendWithPublicWallet
      ),
    ).rejectedWith('test rejection - gas estimate');
  });

  // TRANSFER NFT - GAS ESTIMATE

  it('Should get gas estimates for valid NFT transfer', async () => {
    stubGasEstimateSuccess();
    spyOnNFTNote();
    const rsp = await gasEstimateForUnprovenTransfer(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MEMO,
      [], // erc20AmountRecipients
      MOCK_NFT_AMOUNT_RECIPIENTS, // nftAmountRecipients
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(nftNoteSpy.called).to.be.true;
    expect(nftNoteSpy.args.length).to.equal(4); // Number of calls - 2 for each of 2 relayer fee iterations
    expect(nftNoteSpy.args[0][0].tokenSubID).to.equal('0x01'); // nft1
    expect(nftNoteSpy.args[1][0].tokenSubID).to.equal('0x02'); // nft2
    expect(nftNoteSpy.args[2][0].tokenSubID).to.equal('0x01'); // nft1
    expect(nftNoteSpy.args[3][0].tokenSubID).to.equal('0x02'); // nft2
    expect(rsp.relayerFeeCommitment).to.not.be.undefined;
    expect(rsp.relayerFeeCommitment?.commitmentCiphertext).to.deep.equal(
      MOCK_FORMATTED_RELAYER_FEE_COMMITMENT_CIPHERTEXT,
    );
    // Add 7500 for the dummy tx variance
    expect(rsp.gasEstimate).to.equal(7500n + 200n);
  }).timeout(10000);

  it('Should get gas estimates for valid NFT transfer: public wallet', async () => {
    stubGasEstimateSuccess();
    spyOnNFTNote();
    const rsp = await gasEstimateForUnprovenTransfer(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MEMO,
      [], // erc20AmountRecipients
      MOCK_NFT_AMOUNT_RECIPIENTS,
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      true, // sendWithPublicWallet
    );
    expect(nftNoteSpy.called).to.be.true;
    expect(nftNoteSpy.args.length).to.equal(2); // Number of calls (without relayer fees)
    expect(nftNoteSpy.args[0][0].tokenSubID).to.equal('0x01'); // nft1
    expect(nftNoteSpy.args[1][0].tokenSubID).to.equal('0x02'); // nft2
    expect(rsp.relayerFeeCommitment).to.be.undefined;
    // Add 7500 for the dummy tx variance
    expect(rsp.gasEstimate).to.equal(7500n + 200n);
  }).timeout(10000);

  it('Should error on gas estimates for invalid NFT transfer', async () => {
    stubGasEstimateSuccess();
    await expect(
      gasEstimateForUnprovenTransfer(
        NetworkName.Polygon,
        railgunWallet.id,
        MOCK_DB_ENCRYPTION_KEY,
        MOCK_MEMO,
        [], // erc20AmountRecipients
        MOCK_NFT_AMOUNT_RECIPIENTS_INVALID,
        MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
        MOCK_FEE_TOKEN_DETAILS,
        false, // sendWithPublicWallet
      ),
    ).rejectedWith('Invalid RAILGUN address.');
  });

  // TRANSFER ERC20 - PROVE AND SEND

  it('Should populate tx for valid transfer', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    spyOnERC20Note();
    spyOnNFTNote();
    await generateTransferProof(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      true, // showSenderAddressToRecipient
      MOCK_MEMO,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      MOCK_NFT_AMOUNT_RECIPIENTS,
      relayerFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      () => {}, // progressCallback
    );
    expect(erc20NoteSpy.called).to.be.true;
    expect(erc20NoteSpy.args[0][0].amount).to.equal(MOCK_TOKEN_FEE.amount);
    expect(nftNoteSpy.called).to.be.true;
    expect(nftNoteSpy.args[0][0].nftAddress).to.equal(
      MOCK_NFT_AMOUNT_RECIPIENTS[0].nftAddress,
    );
    const populateResponse = await populateProvedTransfer(
      NetworkName.Polygon,
      railgunWallet.id,
      true, // showSenderAddressToRecipient
      MOCK_MEMO,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      MOCK_NFT_AMOUNT_RECIPIENTS,
      relayerFeeERC20AmountRecipient,
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

  it('Should error on populate transfer tx for unproved transaction', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    await expect(
      populateProvedTransfer(
        NetworkName.Polygon,
        railgunWallet.id,
        false, // showSenderAddressToRecipient
        MOCK_MEMO,
        MOCK_TOKEN_AMOUNT_RECIPIENTS,
        MOCK_NFT_AMOUNT_RECIPIENTS,
        relayerFeeERC20AmountRecipient,
        false, // sendWithPublicWallet
        overallBatchMinGasPrice,
        gasDetails,
      ),
    ).rejectedWith('Invalid proof for this transaction. No proof found.');
  });

  it('Should error on populate transfer tx when params changed (invalid cached proof)', async () => {
    stubGasEstimateSuccess();
    await generateTransferProof(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      true, // showSenderAddressToRecipient
      MOCK_MEMO,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      MOCK_NFT_AMOUNT_RECIPIENTS,
      relayerFeeERC20AmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      () => {}, // progressCallback
    );
    await expect(
      populateProvedTransfer(
        NetworkName.Polygon,
        railgunWallet.id,
        true, // showSenderAddressToRecipient
        MOCK_MEMO,
        MOCK_TOKEN_AMOUNT_RECIPIENTS_DIFFERENT,
        MOCK_NFT_AMOUNT_RECIPIENTS,
        relayerFeeERC20AmountRecipient,
        false, // sendWithPublicWallet
        overallBatchMinGasPrice,
        gasDetails,
      ),
    ).rejectedWith(
      'Invalid proof for this transaction. Mismatch: erc20AmountRecipients.',
    );
  });
});
