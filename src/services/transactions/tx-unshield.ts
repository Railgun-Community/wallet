import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  RailgunERC20Amount,
  TransactionGasDetailsSerialized,
  NetworkName,
  ProofType,
  FeeTokenDetails,
  sanitizeError,
  serializeUnsignedTransaction,
  RailgunERC20AmountRecipient,
  RailgunNFTAmountRecipient,
} from '@railgun-community/shared-models';
import {
  generateDummyProofTransactions,
  generateTransact,
  generateUnshieldBaseToken,
} from './tx-generator';
import { sendErrorMessage } from '../../utils/logger';
import { populateProvedTransaction } from './proof-cache';
import { randomHex, TransactionStruct } from '@railgun-community/engine';
import { gasEstimateResponseIterativeRelayerFee } from './tx-gas-relayer-fee-estimator';
import { createRelayAdaptUnshieldTokenAmountRecipients } from './tx-cross-contract-calls';
import { BigNumber } from '@ethersproject/bignumber';

export const populateProvedUnshield = async (
  networkName: NetworkName,
  railgunWalletID: string,
  tokenAmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  relayerFeeTokenAmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<string>,
  gasDetailsSerialized: TransactionGasDetailsSerialized,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const populatedTransaction = await populateProvedTransaction(
      networkName,
      ProofType.Unshield,
      railgunWalletID,
      false, // showSenderAddressToRecipient
      undefined, // memoText
      tokenAmountRecipients,
      nftAmountRecipients,
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

export const populateProvedUnshieldBaseToken = async (
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  wrappedTokenAmount: RailgunERC20Amount,
  relayerFeeTokenAmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<string>,
  gasDetailsSerialized: TransactionGasDetailsSerialized,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const tokenAmountRecipients: RailgunERC20AmountRecipient[] = [
      {
        ...wrappedTokenAmount,
        recipientAddress: publicWalletAddress,
      },
    ];
    const relayAdaptUnshieldTokenAmounts: RailgunERC20Amount[] = [
      wrappedTokenAmount,
    ];

    // Empty NFT Recipients.
    const nftAmountRecipients: RailgunNFTAmountRecipient[] = [];

    const populatedTransaction = await populateProvedTransaction(
      networkName,
      ProofType.UnshieldBaseToken,
      railgunWalletID,
      false, // showSenderAddressToRecipient
      undefined, // memoText
      tokenAmountRecipients,
      nftAmountRecipients,
      relayAdaptUnshieldTokenAmounts,
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

export const gasEstimateForUnprovenUnshield = async (
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  tokenAmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  originalGasDetailsSerialized: TransactionGasDetailsSerialized,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    const overallBatchMinGasPrice = BigNumber.from(0).toHexString();

    const response = await gasEstimateResponseIterativeRelayerFee(
      (relayerFeeTokenAmount: Optional<RailgunERC20Amount>) =>
        generateDummyProofTransactions(
          ProofType.Unshield,
          networkName,
          railgunWalletID,
          encryptionKey,
          false, // showSenderAddressToRecipient
          undefined, // memoText
          tokenAmountRecipients,
          nftAmountRecipients,
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

export const gasEstimateForUnprovenUnshieldBaseToken = async (
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  wrappedTokenAmount: RailgunERC20Amount,
  originalGasDetailsSerialized: TransactionGasDetailsSerialized,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    const relayAdaptUnshieldTokenAmountRecipients: RailgunERC20AmountRecipient[] =
      createRelayAdaptUnshieldTokenAmountRecipients(networkName, [
        wrappedTokenAmount,
      ]);

    // Empty NFT Recipients.
    const nftAmountRecipients: RailgunNFTAmountRecipient[] = [];

    const overallBatchMinGasPrice = BigNumber.from(0).toHexString();

    const response = await gasEstimateResponseIterativeRelayerFee(
      (relayerFeeTokenAmount: Optional<RailgunERC20Amount>) =>
        generateDummyProofTransactions(
          ProofType.UnshieldBaseToken,
          networkName,
          railgunWalletID,
          encryptionKey,
          false, // showSenderAddressToRecipient
          undefined, // memoText
          relayAdaptUnshieldTokenAmountRecipients,
          nftAmountRecipients,
          relayerFeeTokenAmount,
          sendWithPublicWallet,
          overallBatchMinGasPrice,
        ),
      (txs: TransactionStruct[]) => {
        const relayAdaptParamsRandom = randomHex(31);
        return generateUnshieldBaseToken(
          txs,
          networkName,
          publicWalletAddress,
          relayAdaptParamsRandom,
          true, // useDummyProof
        );
      },
      networkName,
      railgunWalletID,
      relayAdaptUnshieldTokenAmountRecipients,
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
