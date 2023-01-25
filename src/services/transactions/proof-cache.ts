import { PopulatedTransaction } from '@ethersproject/contracts';
import {
  NetworkName,
  ProofType,
  RailgunNFTAmountRecipient,
  RailgunERC20Amount,
  RailgunERC20AmountRecipient,
  TransactionGasDetailsSerialized,
  ValidateCachedProvedTransactionResponse,
  RailgunNFTAmount,
} from '@railgun-community/shared-models';
import { shouldSetOverallBatchMinGasPriceForNetwork } from '../../utils/gas-price';
import { sendErrorMessage } from '../../utils/logger';
import { compareStringArrays } from '../../utils/utils';
import { setGasDetailsForPopulatedTransaction } from './tx-gas-details';
import {
  compareERC20AmountRecipients,
  compareERC20AmountRecipientArrays,
  compareERC20AmountArrays,
  compareNFTAmountRecipientArrays,
  compareNFTAmountArrays,
} from './tx-notes';

export type ProvedTransaction = {
  proofType: ProofType;
  populatedTransaction: PopulatedTransaction;
  railgunWalletID: string;
  showSenderAddressToRecipient: boolean;
  memoText: Optional<string>;
  erc20AmountRecipients: RailgunERC20AmountRecipient[];
  nftAmountRecipients: RailgunNFTAmountRecipient[];
  relayAdaptUnshieldERC20Amounts: Optional<RailgunERC20Amount[]>;
  relayAdaptUnshieldNFTAmounts: Optional<RailgunNFTAmount[]>;
  relayAdaptShieldERC20Addresses: Optional<string[]>;
  relayAdaptShieldNFTs: Optional<RailgunNFTAmount[]>;
  crossContractCallsSerialized: Optional<string[]>;
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>;
  sendWithPublicWallet: boolean;
  overallBatchMinGasPrice: Optional<string>;
  nullifiers: string[];
};

let cachedProvedTransaction: Optional<ProvedTransaction>;

export const populateProvedTransaction = async (
  networkName: NetworkName,
  proofType: ProofType,
  railgunWalletID: string,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  relayAdaptUnshieldERC20Amounts: Optional<RailgunERC20Amount[]>,
  relayAdaptUnshieldNFTAmounts: Optional<RailgunNFTAmount[]>,
  relayAdaptShieldERC20Addresses: Optional<string[]>,
  relayAdaptShieldNFTs: Optional<RailgunNFTAmount[]>,
  crossContractCallsSerialized: Optional<string[]>,
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<string>,
  gasDetailsSerialized: TransactionGasDetailsSerialized,
): Promise<{
  populatedTransaction: PopulatedTransaction;
  nullifiers: string[];
}> => {
  const validation = validateCachedProvedTransaction(
    networkName,
    proofType,
    railgunWalletID,
    showSenderAddressToRecipient,
    memoText,
    erc20AmountRecipients,
    nftAmountRecipients,
    relayAdaptUnshieldERC20Amounts,
    relayAdaptUnshieldNFTAmounts,
    relayAdaptShieldERC20Addresses,
    relayAdaptShieldNFTs,
    crossContractCallsSerialized,
    relayerFeeERC20AmountRecipient,
    sendWithPublicWallet,
    overallBatchMinGasPrice,
  );
  if (!validation.isValid) {
    throw new Error(`Invalid proof for this transaction. ${validation.error}`);
  }

  const { populatedTransaction, nullifiers } = getCachedProvedTransaction();

  setGasDetailsForPopulatedTransaction(
    networkName,
    populatedTransaction,
    gasDetailsSerialized,
    sendWithPublicWallet,
  );

  return { populatedTransaction, nullifiers };
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

const shouldValidateERC20AmountRecipients = (proofType: ProofType) => {
  switch (proofType) {
    case ProofType.CrossContractCalls:
      // Skip validation for erc20AmountRecipients, which is not used
      // in this transaction type.
      return false;
    case ProofType.Transfer:
    case ProofType.Unshield:
    case ProofType.UnshieldBaseToken:
      return true;
  }
};

const shouldValidateRelayAdaptAmounts = (proofType: ProofType) => {
  switch (proofType) {
    case ProofType.CrossContractCalls:
    case ProofType.UnshieldBaseToken:
      // Only validate for Cross Contract and Unshield Base Token proofs.
      return true;
    case ProofType.Transfer:
    case ProofType.Unshield:
      return false;
  }
};

const shouldValidateCrossContractCalls = (proofType: ProofType) => {
  switch (proofType) {
    case ProofType.CrossContractCalls:
      // Only validate for Cross Contract proofs.
      return true;
    case ProofType.Transfer:
    case ProofType.Unshield:
    case ProofType.UnshieldBaseToken:
      return false;
  }
};

export const validateCachedProvedTransaction = (
  networkName: NetworkName,
  proofType: ProofType,
  railgunWalletID: string,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  relayAdaptUnshieldERC20Amounts: Optional<RailgunERC20Amount[]>,
  relayAdaptUnshieldNFTAmounts: Optional<RailgunNFTAmount[]>,
  relayAdaptShieldERC20Addresses: Optional<string[]>,
  relayAdaptShieldNFTs: Optional<RailgunNFTAmount[]>,
  crossContractCallsSerialized: Optional<string[]>,
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<string>,
): ValidateCachedProvedTransactionResponse => {
  let error: Optional<string>;
  if (!cachedProvedTransaction) {
    error = 'No proof found.';
  } else if (cachedProvedTransaction.proofType !== proofType) {
    error = 'Mismatch: proofType.';
  } else if (cachedProvedTransaction.railgunWalletID !== railgunWalletID) {
    error = 'Mismatch: railgunWalletID.';
  } else if (
    proofType === ProofType.Transfer &&
    cachedProvedTransaction.showSenderAddressToRecipient !==
      showSenderAddressToRecipient
  ) {
    error = 'Mismatch: showSenderAddressToRecipient.';
  } else if (
    proofType === ProofType.Transfer &&
    cachedProvedTransaction.memoText !== memoText
  ) {
    error = 'Mismatch: memoText.';
  } else if (
    shouldValidateERC20AmountRecipients(proofType) &&
    !compareERC20AmountRecipientArrays(
      erc20AmountRecipients,
      cachedProvedTransaction.erc20AmountRecipients,
    )
  ) {
    error = 'Mismatch: erc20AmountRecipients.';
  } else if (
    !compareNFTAmountRecipientArrays(
      nftAmountRecipients,
      cachedProvedTransaction.nftAmountRecipients,
    )
  ) {
    error = 'Mismatch: nftAmountRecipients.';
  } else if (
    shouldValidateRelayAdaptAmounts(proofType) &&
    !compareERC20AmountArrays(
      relayAdaptUnshieldERC20Amounts,
      cachedProvedTransaction.relayAdaptUnshieldERC20Amounts,
    )
  ) {
    error = 'Mismatch: relayAdaptUnshieldERC20Amounts.';
  } else if (
    shouldValidateRelayAdaptAmounts(proofType) &&
    !compareNFTAmountArrays(
      relayAdaptUnshieldNFTAmounts,
      cachedProvedTransaction.relayAdaptUnshieldNFTAmounts,
    )
  ) {
    error = 'Mismatch: relayAdaptUnshieldNFTAmounts.';
  } else if (
    shouldValidateRelayAdaptAmounts(proofType) &&
    !compareStringArrays(
      relayAdaptShieldERC20Addresses,
      cachedProvedTransaction.relayAdaptShieldERC20Addresses,
    )
  ) {
    error = 'Mismatch: relayAdaptShieldERC20Addresses.';
  } else if (
    shouldValidateRelayAdaptAmounts(proofType) &&
    !compareNFTAmountArrays(
      relayAdaptShieldNFTs,
      cachedProvedTransaction.relayAdaptShieldNFTs,
    )
  ) {
    error = 'Mismatch: relayAdaptShieldNFTs.';
  } else if (
    shouldValidateCrossContractCalls(proofType) &&
    !compareStringArrays(
      crossContractCallsSerialized,
      cachedProvedTransaction.crossContractCallsSerialized,
    )
  ) {
    error = 'Mismatch: crossContractCallsSerialized.';
  } else if (
    !compareERC20AmountRecipients(
      cachedProvedTransaction.relayerFeeERC20AmountRecipient,
      relayerFeeERC20AmountRecipient,
    )
  ) {
    error = 'Mismatch: relayerFeeERC20AmountRecipient.';
  } else if (
    sendWithPublicWallet !== cachedProvedTransaction.sendWithPublicWallet
  ) {
    error = 'Mismatch: sendWithPublicWallet.';
  } else if (
    shouldSetOverallBatchMinGasPriceForNetwork(networkName) &&
    overallBatchMinGasPrice !== cachedProvedTransaction.overallBatchMinGasPrice
  ) {
    error = 'Mismatch: overallBatchMinGasPrice.';
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
