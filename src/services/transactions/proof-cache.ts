import { PopulatedTransaction } from '@ethersproject/contracts';
import {
  ProofType,
  RailgunWalletTokenAmountRecipient,
  TransactionGasDetailsSerialized,
  ValidateCachedProvedTransactionResponse,
} from '@railgun-community/shared-models';
import { sendErrorMessage } from '../../utils/logger';
import { compareStringArrays } from '../../utils/utils';
import { setGasDetailsForPopulatedTransaction } from './tx-gas-details';
import {
  compareTokenAmountRecipients,
  compareTokenAmountRecipientArrays,
} from './tx-erc20-notes';

export type ProvedTransaction = {
  proofType: ProofType;
  populatedTransaction: PopulatedTransaction;
  railgunWalletID: string;
  memoText: Optional<string>;
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[];
  relayAdaptWithdrawTokenAmountRecipients: Optional<
    RailgunWalletTokenAmountRecipient[]
  >;
  relayAdaptDepositTokenAddresses: Optional<string[]>;
  crossContractCallsSerialized: Optional<string[]>;
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>;
  sendWithPublicWallet: boolean;
};

let cachedProvedTransaction: Optional<ProvedTransaction>;

export const populateProvedTransaction = async (
  proofType: ProofType,
  railgunWalletID: string,
  memoText: Optional<string>,
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[],
  relayAdaptWithdrawTokenAmountRecipients: Optional<
    RailgunWalletTokenAmountRecipient[]
  >,
  relayAdaptDepositTokenAddresses: Optional<string[]>,
  crossContractCallsSerialized: Optional<string[]>,
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>,
  sendWithPublicWallet: boolean,
  gasDetailsSerialized: Optional<TransactionGasDetailsSerialized>,
): Promise<PopulatedTransaction> => {
  const validation = validateCachedProvedTransaction(
    proofType,
    railgunWalletID,
    memoText,
    tokenAmountRecipients,
    relayAdaptWithdrawTokenAmountRecipients,
    relayAdaptDepositTokenAddresses,
    crossContractCallsSerialized,
    relayerFeeTokenAmountRecipient,
    sendWithPublicWallet,
  );
  if (!validation.isValid) {
    throw new Error(`Invalid proof for this transaction. ${validation.error}`);
  }

  const { populatedTransaction } = getCachedProvedTransaction();

  setGasDetailsForPopulatedTransaction(
    populatedTransaction,
    gasDetailsSerialized,
  );

  return populatedTransaction;
};

export const setCachedProvedTransaction = (tx?: ProvedTransaction) => {
  if (tx?.populatedTransaction?.from) {
    throw new Error(`Cannot cache a transaction with a 'from' address.`);
  }
  cachedProvedTransaction = tx;
};

export const getCachedProvedTransaction = (): ProvedTransaction => {
  return cachedProvedTransaction as ProvedTransaction;
};

export const validateCachedProvedTransaction = (
  proofType: ProofType,
  railgunWalletID: string,
  memoText: Optional<string>,
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[],
  relayAdaptWithdrawTokenAmountRecipients: Optional<
    RailgunWalletTokenAmountRecipient[]
  >,
  relayAdaptDepositTokenAddresses: Optional<string[]>,
  crossContractCallsSerialized: Optional<string[]>,
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>,
  sendWithPublicWallet: boolean,
): ValidateCachedProvedTransactionResponse => {
  let error: Optional<string>;
  if (!cachedProvedTransaction) {
    error = 'No proof found.';
  } else if (cachedProvedTransaction.proofType !== proofType) {
    error = 'Mismatch: proofType.';
  } else if (cachedProvedTransaction.railgunWalletID !== railgunWalletID) {
    error = 'Mismatch: railgunWalletID.';
  } else if (cachedProvedTransaction.memoText !== memoText) {
    error = 'Mismatch: memoText.';
  } else if (
    !compareTokenAmountRecipients(
      cachedProvedTransaction.relayerFeeTokenAmountRecipient,
      relayerFeeTokenAmountRecipient,
    )
  ) {
    error = 'Mismatch: relayerFeeTokenAmountRecipient.';
  } else if (
    !compareTokenAmountRecipientArrays(
      tokenAmountRecipients,
      cachedProvedTransaction.tokenAmountRecipients,
    )
  ) {
    error = 'Mismatch: tokenAmountRecipients.';
  } else if (
    !compareTokenAmountRecipientArrays(
      relayAdaptWithdrawTokenAmountRecipients,
      cachedProvedTransaction.relayAdaptWithdrawTokenAmountRecipients,
    )
  ) {
    error = 'Mismatch: relayAdaptWithdrawTokenAmountRecipients.';
  } else if (
    !compareStringArrays(
      relayAdaptDepositTokenAddresses,
      cachedProvedTransaction.relayAdaptDepositTokenAddresses,
    )
  ) {
    error = 'Mismatch: relayAdaptDepositTokenAddresses.';
  } else if (
    !compareStringArrays(
      crossContractCallsSerialized,
      cachedProvedTransaction.crossContractCallsSerialized,
    )
  ) {
    error = 'Mismatch: crossContractCallsSerialized.';
  } else if (
    sendWithPublicWallet !== cachedProvedTransaction.sendWithPublicWallet
  ) {
    error = 'Mismatch: sendWithPublicWallet.';
  }

  if (error) {
    sendErrorMessage(error);
    return {
      error,
      isValid: false,
    };
  }

  return {
    isValid: true,
  };
};
