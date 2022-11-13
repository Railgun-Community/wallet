import { PopulatedTransaction } from '@ethersproject/contracts';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  ProofType,
  RailgunWalletTokenAmountRecipient,
} from '@railgun-community/shared-models';
import {
  MOCK_ETH_WALLET_ADDRESS,
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
const relayAdaptDepositTokenAddresses = ['0x123'];
const relayAdaptWithdrawTokenAmountRecipients: RailgunWalletTokenAmountRecipient[] =
  [
    {
      ...MOCK_TOKEN_FEE,
      recipientAddress: MOCK_ETH_WALLET_ADDRESS,
    },
  ];

describe('proof-cache', () => {
  it('Should validate cached transaction correctly', () => {
    setCachedProvedTransaction(undefined);
    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        memoText,
        tokenAmountRecipients,
        relayAdaptWithdrawTokenAmountRecipients,
        relayAdaptDepositTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    setCachedProvedTransaction({
      populatedTransaction: {} as PopulatedTransaction,
      proofType,
      memoText,
      railgunWalletID,
      tokenAmountRecipients,
      relayAdaptWithdrawTokenAmountRecipients,
      relayAdaptDepositTokenAddresses,
      relayerFeeTokenAmountRecipient,
      crossContractCallsSerialized,
      sendWithPublicWallet: false,
    });

    // Same same
    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        memoText,
        tokenAmountRecipients,
        relayAdaptWithdrawTokenAmountRecipients,
        relayAdaptDepositTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.true;

    expect(
      validateCachedProvedTransaction(
        ProofType.Withdraw,
        railgunWalletID,
        memoText,
        tokenAmountRecipients,
        relayAdaptWithdrawTokenAmountRecipients,
        relayAdaptDepositTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        '987',
        memoText,
        tokenAmountRecipients,
        relayAdaptWithdrawTokenAmountRecipients,
        relayAdaptDepositTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        'different memo',
        tokenAmountRecipients,
        relayAdaptWithdrawTokenAmountRecipients,
        relayAdaptDepositTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        memoText,
        [
          {
            tokenAddress: '0x765',
            amountString: '100',
            recipientAddress: '0x345',
          },
        ],
        relayAdaptWithdrawTokenAmountRecipients,
        relayAdaptDepositTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        memoText,
        tokenAmountRecipients,
        [], // relayAdaptWithdrawTokenAmountRecipients
        relayAdaptDepositTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        memoText,
        tokenAmountRecipients,
        relayAdaptWithdrawTokenAmountRecipients,
        ['test'],
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        memoText,
        tokenAmountRecipients,
        relayAdaptWithdrawTokenAmountRecipients,
        relayAdaptDepositTokenAddresses,
        ['test'],
        relayerFeeTokenAmountRecipient,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        memoText,
        tokenAmountRecipients,
        relayAdaptWithdrawTokenAmountRecipients,
        relayAdaptDepositTokenAddresses,
        crossContractCallsSerialized,
        {
          tokenAddress: '0x765',
          amountString: '100',
          recipientAddress: '0x123',
        },
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        railgunWalletID,
        memoText,
        tokenAmountRecipients,
        relayAdaptWithdrawTokenAmountRecipients,
        relayAdaptDepositTokenAddresses,
        crossContractCallsSerialized,
        relayerFeeTokenAmountRecipient,
        true, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;
  });
});
