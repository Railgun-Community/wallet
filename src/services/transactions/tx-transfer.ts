import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  RailgunWalletTokenAmount,
  TransactionGasDetailsSerialized,
  NetworkName,
  ProofType,
  FeeTokenDetails,
  sanitizeError,
  serializeUnsignedTransaction,
  RailgunWalletTokenAmountRecipient,
  RailgunNFTRecipient,
} from '@railgun-community/shared-models';
import {
  generateDummyProofTransactions,
  generateTransact,
} from './tx-generator';
import { sendErrorMessage } from '../../utils/logger';
import { populateProvedTransaction } from './proof-cache';
import { TransactionStruct } from '@railgun-community/engine';
import { gasEstimateResponseIterativeRelayerFee } from './tx-gas-relayer-fee-estimator';
import { BigNumber } from '@ethersproject/bignumber';

export const populateProvedTransfer = async (
  networkName: NetworkName,
  railgunWalletID: string,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[],
  nftRecipients: RailgunNFTRecipient[],
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<string>,
  gasDetailsSerialized: TransactionGasDetailsSerialized,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const populatedTransaction = await populateProvedTransaction(
      networkName,
      ProofType.Transfer,
      railgunWalletID,
      showSenderAddressToRecipient,
      memoText,
      tokenAmountRecipients,
      nftRecipients,
      undefined, // relayAdaptUnshieldTokenAmountRecipients
      undefined, // relayAdaptShieldTokenAddresses
      undefined, // crossContractCallsSerialized
      relayerFeeTokenAmountRecipient,
      sendWithPublicWallet,
      overallBatchMinGasPrice,
      gasDetailsSerialized,
    );
    return {
      serializedTransaction: serializeUnsignedTransaction(populatedTransaction),
    };
  } catch (err) {
    sendErrorMessage(err.message);
    sendErrorMessage(err.stack);
    const railResponse: RailgunPopulateTransactionResponse = {
      error: sanitizeError(err).message,
    };
    return railResponse;
  }
};

export const gasEstimateForUnprovenTransfer = async (
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  memoText: Optional<string>,
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[],
  nftRecipients: RailgunNFTRecipient[],
  originalGasDetailsSerialized: TransactionGasDetailsSerialized,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    const overallBatchMinGasPrice = BigNumber.from(0).toHexString();

    const response = await gasEstimateResponseIterativeRelayerFee(
      (relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>) =>
        generateDummyProofTransactions(
          ProofType.Transfer,
          networkName,
          railgunWalletID,
          encryptionKey,
          false, // showSenderAddressToRecipient - doesn't matter for gas estimate.
          memoText,
          tokenAmountRecipients,
          nftRecipients,
          relayerFeeTokenAmount,
          sendWithPublicWallet,
          overallBatchMinGasPrice,
        ),
      (txs: TransactionStruct[]) =>
        generateTransact(
          txs,
          networkName,
          true, // useDummyProof
        ),
      networkName,
      railgunWalletID,
      tokenAmountRecipients,
      originalGasDetailsSerialized,
      feeTokenDetails,
      sendWithPublicWallet,
      undefined, // multiplierBasisPoints
    );
    return response;
  } catch (err) {
    sendErrorMessage(err.message);
    sendErrorMessage(err.stack);
    const railResponse: RailgunTransactionGasEstimateResponse = {
      error: sanitizeError(err).message,
    };
    return railResponse;
  }
};
