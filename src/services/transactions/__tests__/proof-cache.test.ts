import { PopulatedTransaction } from '@ethersproject/contracts';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  ProofType,
  RailgunWalletTokenAmount,
  RailgunWalletTokenAmountRecipient,
} from '@railgun-community/shared-models';
import {
  MOCK_RAILGUN_WALLET_ADDRESS,
  MOCK_TOKEN_AMOUNTS,
  MOCK_TOKEN_FEE,
} from '../../../test/mocks.test';
import {
  setCachedProvedTransaction,
  validateCachedProvedTransaction,
} from '../proof-cache';

chai.use(chaiAsPromised);
const { expect } = chai;

const proofType = ProofType.Transfer;
const railgunWalletID = '123';
const showSenderAddressToRecipient = true;
const memoText = 'Some memo';
const recipientAddress = '0x12345';
const tokenAmountRecipients: RailgunWalletTokenAmountRecipient[] =
  MOCK_TOKEN_AMOUNTS.map(tokenAmount => ({
    ...tokenAmount,
    recipientAddress,
  }));
const relayerFeeTokenAmountRecipient: RailgunWalletTokenAmountRecipient = {
  ...MOCK_TOKEN_FEE,
  recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
};
const crossContractCallsSerialized = ['0x4567'];
const relayAdaptShieldTokenAddresses = ['0x123'];
const relayAdaptUnshieldTokenAmounts: RailgunWalletTokenAmount[] = [
  MOCK_TOKEN_FEE,
];

const sendWithPublicWallet = false;
const overallBatchMinGasPrice = '0x1000';

describe('proof-cache', () => {
  it('Should validate cached transaction correctly', () => {
    setCachedProvedTransaction(undefined);
    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        tokenAmountRecipients,
        relayAdaptUnshieldTokenAmounts,
        relayAdaptShieldTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ).isValid,
    ).to.be.false;

    setCachedProvedTransaction({
      populatedTransaction: {} as PopulatedTransaction,
      proofType,
      showSenderAddressToRecipient,
      memoText,
      railgunWalletID,
      tokenAmountRecipients,
      relayAdaptUnshieldTokenAmounts,
      relayAdaptShieldTokenAddresses,
      crossContractCallsSerialized,
      relayerFeeTokenAmountRecipient,
      sendWithPublicWallet: false,
      overallBatchMinGasPrice,
    });

    // Same same
    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        tokenAmountRecipients,
        relayAdaptUnshieldTokenAmounts,
        relayAdaptShieldTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ).isValid,
    ).to.be.true;

    expect(
      validateCachedProvedTransaction(
        ProofType.Unshield,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        tokenAmountRecipients,
        relayAdaptUnshieldTokenAmounts,
        relayAdaptShieldTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        ProofType.CrossContractCalls,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        tokenAmountRecipients,
        relayAdaptUnshieldTokenAmounts,
        relayAdaptShieldTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        '987',
        showSenderAddressToRecipient,
        memoText,
        tokenAmountRecipients,
        relayAdaptUnshieldTokenAmounts,
        relayAdaptShieldTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        false,
        memoText,
        tokenAmountRecipients,
        relayAdaptUnshieldTokenAmounts,
        relayAdaptShieldTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        showSenderAddressToRecipient,
        'different memo',
        tokenAmountRecipients,
        relayAdaptUnshieldTokenAmounts,
        relayAdaptShieldTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        [
          {
            tokenAddress: '0x765',
            amountString: '100',
            recipientAddress: '0x123',
          },
        ],
        relayAdaptUnshieldTokenAmounts,
        relayAdaptShieldTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        tokenAmountRecipients,
        [
          {
            tokenAddress: '0x765',
            amountString: '100',
          },
        ],
        ['test'],
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        tokenAmountRecipients,
        relayAdaptUnshieldTokenAmounts,
        ['test'],
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        tokenAmountRecipients,
        relayAdaptUnshieldTokenAmounts,
        relayAdaptShieldTokenAddresses,
        ['test'],
        relayerFeeTokenAmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        tokenAmountRecipients,
        relayAdaptUnshieldTokenAmounts,
        relayAdaptShieldTokenAddresses,
        crossContractCallsSerialized,
        {
          tokenAddress: '0x765',
          amountString: '100',
          recipientAddress: '0x1233',
        },
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        tokenAmountRecipients,
        relayAdaptUnshieldTokenAmounts,
        relayAdaptShieldTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        true, // sendWithPublicWallet
        overallBatchMinGasPrice,
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        tokenAmountRecipients,
        relayAdaptUnshieldTokenAmounts,
        relayAdaptShieldTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        sendWithPublicWallet,
        '0x2000',
      ).isValid,
    ).to.be.false;
  });
});
