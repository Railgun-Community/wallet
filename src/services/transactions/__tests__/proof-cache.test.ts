import { PopulatedTransaction } from '@ethersproject/contracts';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ProofType } from '@railgun-community/shared-models/dist/models/proof';
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
const toWalletAddress = '0x12345';
const railgunWalletID = '123';
const memoText = 'Some memo';
const tokenAmounts = MOCK_TOKEN_AMOUNTS;
const relayerRailgunAddress = MOCK_RAILGUN_WALLET_ADDRESS;
const relayerFeeTokenAmount = MOCK_TOKEN_FEE;

describe('proof-cache', () => {
  it('Should validate cached transaction correctly', () => {
    setCachedProvedTransaction(undefined);
    expect(
      validateCachedProvedTransaction(
        proofType,
        toWalletAddress,
        railgunWalletID,
        memoText,
        tokenAmounts,
        undefined, // relayAdaptDepositTokenAddresses
        undefined, // crossContractCallsSerialized
        relayerRailgunAddress,
        relayerFeeTokenAmount,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    setCachedProvedTransaction({
      populatedTransaction: {} as PopulatedTransaction,
      proofType,
      toWalletAddress,
      memoText,
      railgunWalletID,
      tokenAmounts,
      relayAdaptDepositTokenAddresses: undefined,
      relayerRailgunAddress,
      relayerFeeTokenAmount,
      sendWithPublicWallet: false,
    });

    // Same same
    expect(
      validateCachedProvedTransaction(
        proofType,
        toWalletAddress,
        railgunWalletID,
        memoText,
        tokenAmounts,
        undefined, // relayAdaptDepositTokenAddresses
        undefined, // crossContractCallsSerialized
        relayerRailgunAddress,
        relayerFeeTokenAmount,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.true;

    expect(
      validateCachedProvedTransaction(
        ProofType.Withdraw,
        toWalletAddress,
        railgunWalletID,
        memoText,
        tokenAmounts,
        undefined, // relayAdaptDepositTokenAddresses
        undefined, // crossContractCallsSerialized
        relayerRailgunAddress,
        relayerFeeTokenAmount,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        '0x0987654',
        railgunWalletID,
        memoText,
        tokenAmounts,
        undefined, // relayAdaptDepositTokenAddresses
        undefined, // crossContractCallsSerialized
        relayerRailgunAddress,
        relayerFeeTokenAmount,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        toWalletAddress,
        '987',
        memoText,
        tokenAmounts,
        undefined, // relayAdaptDepositTokenAddresses
        undefined, // crossContractCallsSerialized
        relayerRailgunAddress,
        relayerFeeTokenAmount,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        toWalletAddress,
        railgunWalletID,
        'different memo',
        tokenAmounts,
        undefined, // relayAdaptDepositTokenAddresses
        undefined, // crossContractCallsSerialized
        relayerRailgunAddress,
        relayerFeeTokenAmount,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        toWalletAddress,
        railgunWalletID,
        memoText,
        [{ tokenAddress: '0x765', amountString: '100' }],
        undefined, // relayAdaptDepositTokenAddresses
        undefined, // crossContractCallsSerialized
        relayerRailgunAddress,
        relayerFeeTokenAmount,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        toWalletAddress,
        railgunWalletID,
        memoText,
        tokenAmounts,
        ['test'],
        undefined, // crossContractCallsSerialized
        relayerRailgunAddress,
        relayerFeeTokenAmount,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        toWalletAddress,
        railgunWalletID,
        memoText,
        tokenAmounts,
        undefined, // relayAdaptDepositTokenAddresses
        ['test'],
        relayerRailgunAddress,
        relayerFeeTokenAmount,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        toWalletAddress,
        railgunWalletID,
        memoText,
        tokenAmounts,
        undefined, // relayAdaptDepositTokenAddresses
        undefined, // crossContractCallsSerialized
        '87654',
        relayerFeeTokenAmount,
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        toWalletAddress,
        railgunWalletID,
        memoText,
        tokenAmounts,
        undefined, // relayAdaptDepositTokenAddresses
        undefined, // crossContractCallsSerialized
        relayerRailgunAddress,
        { tokenAddress: '0x765', amountString: '100' },
        false, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;

    expect(
      validateCachedProvedTransaction(
        proofType,
        toWalletAddress,
        railgunWalletID,
        memoText,
        tokenAmounts,
        undefined, // relayAdaptDepositTokenAddresses
        undefined, // crossContractCallsSerialized
        relayerRailgunAddress,
        { tokenAddress: '0x765', amountString: '100' },
        true, // sendWithPublicAddress
      ).isValid,
    ).to.be.false;
  });
});
