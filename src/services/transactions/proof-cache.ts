import { PopulatedTransaction } from '@ethersproject/contracts';
import { ProofType ,
  RailgunWalletTokenAmount,
  TransactionGasDetailsSerialized,
  ValidateCachedProvedTransactionResponse,
} from '@railgun-community/shared-models';
import { sendErrorMessage } from '../../utils/logger';
import { compareStringArrays } from '../../utils/utils';
import { setGasDetailsForPopulatedTransaction } from './tx-gas-details';
import {
  compareTokenAmounts,
  compareTokenAmountArrays,
} from './tx-erc20-notes';

export type ProvedTransaction = {
  proofType: ProofType;
  populatedTransaction: PopulatedTransaction;
  railgunWalletID: string;
  toWalletAddress: string;
  memoText: Optional<string>;
  tokenAmounts: RailgunWalletTokenAmount[];
  relayAdaptDepositTokenAddresses?: string[];
  crossContractCallsSerialized?: string[];
  relayerRailgunAddress?: string;
  relayerFeeTokenAmount?: RailgunWalletTokenAmount;
  sendWithPublicWallet: boolean;
};

let cachedProvedTransaction: Optional<ProvedTransaction>;

export const populateProvedTransaction = async (
  proofType: ProofType,
  toWalletAddress: string,
  railgunWalletID: string,
  memoText: Optional<string>,
  tokenAmounts: RailgunWalletTokenAmount[],
  relayAdaptDepositTokenAddresses: Optional<string[]>,
  crossContractCallsSerialized: Optional<string[]>,
  relayerRailgunAddress: Optional<string>,
  relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>,
  sendWithPublicWallet: boolean,
  gasDetailsSerialized: Optional<TransactionGasDetailsSerialized>,
): Promise<PopulatedTransaction> => {
  if (
    !validateCachedProvedTransaction(
      proofType,
      toWalletAddress,
      railgunWalletID,
      memoText,
      tokenAmounts,
      relayAdaptDepositTokenAddresses,
      crossContractCallsSerialized,
      relayerRailgunAddress,
      relayerFeeTokenAmount,
      sendWithPublicWallet,
    ).isValid
  ) {
    throw new Error('Transaction has not been proven.');
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
    throw new Error(`We cannot cache a transaction with 'from' address.`);
  }
  cachedProvedTransaction = tx;
};

export const getCachedProvedTransaction = (): ProvedTransaction => {
  return cachedProvedTransaction as ProvedTransaction;
};

export const validateCachedProvedTransaction = (
  proofType: ProofType,
  toWalletAddress: string,
  railgunWalletID: string,
  memoText: Optional<string>,
  tokenAmounts: RailgunWalletTokenAmount[],
  relayAdaptDepositTokenAddresses: Optional<string[]>,
  crossContractCallsSerialized: Optional<string[]>,
  relayerRailgunAddress: Optional<string>,
  relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>,
  sendWithPublicWallet: boolean,
): ValidateCachedProvedTransactionResponse => {
  let error: Optional<string>;
  if (!cachedProvedTransaction) {
    error = 'no cachedProvedTransaction';
  } else if (cachedProvedTransaction.proofType !== proofType) {
    error = 'mismatch: proofType';
  } else if (cachedProvedTransaction.toWalletAddress !== toWalletAddress) {
    error = 'mismatch: toWalletAddress';
  } else if (cachedProvedTransaction.railgunWalletID !== railgunWalletID) {
    error = 'mismatch: railgunWalletID';
  } else if (cachedProvedTransaction.memoText !== memoText) {
    error = 'mismatch: memoText';
  } else if (
    cachedProvedTransaction.relayerRailgunAddress !== relayerRailgunAddress
  ) {
    error = 'mismatch: relayerRailgunAddress';
  } else if (
    !compareTokenAmounts(
      cachedProvedTransaction.relayerFeeTokenAmount,
      relayerFeeTokenAmount,
    )
  ) {
    error = 'mismatch: relayerFeeTokenAmount';
  } else if (
    !compareTokenAmountArrays(
      tokenAmounts,
      cachedProvedTransaction.tokenAmounts,
    )
  ) {
    error = 'mismatch: tokenAmounts';
  } else if (
    relayAdaptDepositTokenAddresses &&
    !compareStringArrays(
      relayAdaptDepositTokenAddresses,
      cachedProvedTransaction.relayAdaptDepositTokenAddresses,
    )
  ) {
    error = 'mismatch: relayAdaptDepositTokenAddresses';
  } else if (
    crossContractCallsSerialized &&
    !compareStringArrays(
      crossContractCallsSerialized,
      cachedProvedTransaction.crossContractCallsSerialized,
    )
  ) {
    error = 'mismatch: crossContractCallsSerialized';
  } else if (
    sendWithPublicWallet !== cachedProvedTransaction.sendWithPublicWallet
  ) {
    error = 'mismatch: sendWithPublicWallet';
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
