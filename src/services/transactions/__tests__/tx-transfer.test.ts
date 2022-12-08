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
} from '@railgun-community/engine';
import {
  RailgunWalletTokenAmount,
  NetworkName,
  deserializeTransaction,
  EVMGasType,
  TransactionGasDetailsSerialized,
  RailgunWalletTokenAmountRecipient,
  RailgunNFTRecipient,
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
  MOCK_MEMO,
  MOCK_MNEMONIC,
  MOCK_NFT_RECIPIENTS,
  MOCK_RAILGUN_WALLET_ADDRESS,
  MOCK_TOKEN_ADDRESS,
  MOCK_TOKEN_ADDRESS_2,
  MOCK_TOKEN_AMOUNTS,
  MOCK_TOKEN_FEE,
  MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
} from '../../../test/mocks.test';
import {
  populateProvedTransfer,
  gasEstimateForUnprovenTransfer,
} from '../tx-transfer';
import { generateTransferProof } from '../tx-proof-transfer';
import { createRailgunWallet } from '../../railgun/wallets/wallets';
import { fullWalletForID } from '../../railgun/core/engine';
import { setCachedProvedTransaction } from '../proof-cache';
import { decimalToHexString } from '../../../utils/format';
import * as txNotes from '../tx-notes';

let gasEstimateStub: SinonStub;
let railProveStub: SinonStub;
let railDummyProveStub: SinonStub;
let railTransactStub: SinonStub;
let relayAdaptPopulateUnshieldBaseToken: SinonStub;
let setUnshieldSpy: SinonSpy;
let erc20NoteSpy: SinonSpy;
let nftNoteSpy: SinonSpy;

let railgunWallet: RailgunWallet;
let relayerFeeTokenAmountRecipient: RailgunWalletTokenAmountRecipient;

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

const overallBatchMinGasPrice = '0x1000';

const gasDetailsSerialized: TransactionGasDetailsSerialized = {
  evmGasType: EVMGasType.Type1,
  gasEstimateString: '0x00',
  gasPriceString: overallBatchMinGasPrice,
};

const MOCK_TOKEN_AMOUNT_RECIPIENTS_INVALID: RailgunWalletTokenAmountRecipient[] =
  MOCK_TOKEN_AMOUNTS.map(tokenAmount => ({
    ...tokenAmount,
    recipientAddress: MOCK_ETH_WALLET_ADDRESS,
  }));

const MOCK_NFT_RECIPIENTS_INVALID: RailgunNFTRecipient[] =
  MOCK_NFT_RECIPIENTS.map(nftRecipient => ({
    ...nftRecipient,
    recipientAddress: MOCK_ETH_WALLET_ADDRESS,
  }));

const MOCK_TOKEN_AMOUNT_RECIPIENTS: RailgunWalletTokenAmountRecipient[] =
  MOCK_TOKEN_AMOUNTS.map(tokenAmount => ({
    ...tokenAmount,
    recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
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

const spyOnERC20Note = () => {
  erc20NoteSpy = Sinon.spy(txNotes, 'erc20NoteFromTokenAmountRecipient');
};

const spyOnNFTNote = () => {
  nftNoteSpy = Sinon.spy(txNotes, 'nftNoteFromNFTRecipient');
};

describe('tx-transfer', () => {
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
    setUnshieldSpy?.restore();
    erc20NoteSpy?.restore();
    nftNoteSpy?.restore();
  });
  after(() => {
    railProveStub.restore();
    railDummyProveStub.restore();
    railTransactStub.restore();
    relayAdaptPopulateUnshieldBaseToken.restore();
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
      [], // nftRecipients
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(erc20NoteSpy.called).to.be.true;
    expect(erc20NoteSpy.args.length).to.equal(6); // Number of calls - 3 for each of 2 relayer fee iterations
    expect(erc20NoteSpy.args[0][0].amountString).to.equal('0x00'); // original relayer fee
    expect(erc20NoteSpy.args[1][0].amountString).to.equal('0x100'); // token1
    expect(erc20NoteSpy.args[2][0].amountString).to.equal('0x200'); // token2
    expect(erc20NoteSpy.args[3][0].amountString).to.equal('0x0275a61bf8737eb4'); // New estimated Relayer Fee
    expect(erc20NoteSpy.args[4][0].amountString).to.equal('0x100'); // token1
    expect(erc20NoteSpy.args[5][0].amountString).to.equal('0x200'); // token2
    expect(rsp.error).to.be.undefined;
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(200));
  });

  it('Should get gas estimates for valid erc20 transfer: public wallet', async () => {
    stubGasEstimateSuccess();
    spyOnERC20Note();
    const rsp = await gasEstimateForUnprovenTransfer(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MEMO,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      [], // nftRecipients
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      true, // sendWithPublicWallet
    );
    expect(erc20NoteSpy.called).to.be.true;
    expect(erc20NoteSpy.args.length).to.equal(2); // Number of calls (without relayer fees)
    expect(erc20NoteSpy.args[0][0].amountString).to.equal('0x100'); // token1
    expect(erc20NoteSpy.args[1][0].amountString).to.equal('0x200'); // token2
    expect(rsp.error).to.be.undefined;
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(200));
  });

  it('Should error on gas estimates for invalid erc20 transfer', async () => {
    stubGasEstimateSuccess();
    const rsp = await gasEstimateForUnprovenTransfer(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MEMO,
      MOCK_TOKEN_AMOUNT_RECIPIENTS_INVALID,
      [], // nftRecipients
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.error).to.equal('Invalid RAILGUN address.');
  });

  it('Should error on transfer gas estimate for ethers rejections', async () => {
    stubGasEstimateFailure();
    const rsp = await gasEstimateForUnprovenTransfer(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MEMO,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      [], // nftRecipients
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.error).to.equal('test rejection - gas estimate');
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
      [], // tokenAmountRecipients
      MOCK_NFT_RECIPIENTS, // nftRecipients
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
    expect(rsp.error).to.be.undefined;
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(200));
  });

  it('Should get gas estimates for valid NFT transfer: public wallet', async () => {
    stubGasEstimateSuccess();
    spyOnNFTNote();
    const rsp = await gasEstimateForUnprovenTransfer(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MEMO,
      [], // tokenAmountRecipients
      MOCK_NFT_RECIPIENTS,
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      true, // sendWithPublicWallet
    );
    expect(nftNoteSpy.called).to.be.true;
    expect(nftNoteSpy.args.length).to.equal(2); // Number of calls (without relayer fees)
    expect(nftNoteSpy.args[0][0].tokenSubID).to.equal('0x01'); // nft1
    expect(nftNoteSpy.args[1][0].tokenSubID).to.equal('0x02'); // nft2
    expect(rsp.error).to.be.undefined;
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(200));
  });

  it('Should error on gas estimates for invalid NFT transfer', async () => {
    stubGasEstimateSuccess();
    const rsp = await gasEstimateForUnprovenTransfer(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MEMO,
      [], // tokenAmountRecipients
      MOCK_NFT_RECIPIENTS_INVALID,
      MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2,
      MOCK_FEE_TOKEN_DETAILS,
      false, // sendWithPublicWallet
    );
    expect(rsp.error).to.equal('Invalid RAILGUN address.');
  });

  // TRANSFER ERC20 - PROVE AND SEND

  it('Should populate tx for valid transfer', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    spyOnERC20Note();
    spyOnNFTNote();
    const proofResponse = await generateTransferProof(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      true, // showSenderAddressToRecipient
      MOCK_MEMO,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      MOCK_NFT_RECIPIENTS,
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      () => {}, // progressCallback
    );
    expect(erc20NoteSpy.called).to.be.true;
    expect(erc20NoteSpy.args[0][0].amountString).to.equal(
      MOCK_TOKEN_FEE.amountString,
    );
    expect(nftNoteSpy.called).to.be.true;
    expect(nftNoteSpy.args[0][0].nftAddress).to.equal(
      MOCK_NFT_RECIPIENTS[0].nftAddress,
    );
    expect(proofResponse.error).to.be.undefined;
    const populateResponse = await populateProvedTransfer(
      NetworkName.Polygon,
      railgunWallet.id,
      true, // showSenderAddressToRecipient
      MOCK_MEMO,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      MOCK_NFT_RECIPIENTS,
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

  it('Should error on populate transfer tx for unproved transaction', async () => {
    stubGasEstimateSuccess();
    setCachedProvedTransaction(undefined);
    const rsp = await populateProvedTransfer(
      NetworkName.Polygon,
      railgunWallet.id,
      false, // showSenderAddressToRecipient
      MOCK_MEMO,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      MOCK_NFT_RECIPIENTS,
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      gasDetailsSerialized,
    );
    expect(rsp.error).to.equal(
      'Invalid proof for this transaction. No proof found.',
    );
  });

  it('Should error on populate transfer tx when params changed (invalid cached proof)', async () => {
    stubGasEstimateSuccess();
    const proofResponse = await generateTransferProof(
      NetworkName.Polygon,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      true, // showSenderAddressToRecipient
      MOCK_MEMO,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      MOCK_NFT_RECIPIENTS,
      relayerFeeTokenAmountRecipient,
      false, // sendWithPublicWallet
      overallBatchMinGasPrice,
      () => {}, // progressCallback
    );
    expect(proofResponse.error).to.be.undefined;
    const rsp = await populateProvedTransfer(
      NetworkName.Polygon,
      railgunWallet.id,
      true, // showSenderAddressToRecipient
      MOCK_MEMO,
      MOCK_TOKEN_AMOUNT_RECIPIENTS_DIFFERENT,
      MOCK_NFT_RECIPIENTS,
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
