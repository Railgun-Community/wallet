import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  RailgunERC20Amount,
  TransactionGasDetailsSerialized,
  NetworkName,
  ProofType,
  FeeTokenDetails,
  serializeUnsignedTransaction,
  RailgunERC20AmountRecipient,
  RailgunNFTAmountRecipient,
} from '@railgun-community/shared-models';
import {
  generateDummyProofTransactions,
  generateTransact,
  generateUnshieldBaseToken,
} from './tx-generator';
import { populateProvedTransaction } from './proof-cache';
import { randomHex, TransactionStruct } from '@railgun-community/engine';
import { gasEstimateResponseDummyProofIterativeRelayerFee } from './tx-gas-relayer-fee-estimator';
import { createRelayAdaptUnshieldERC20AmountRecipients } from './tx-cross-contract-calls';
import { BigNumber } from '@ethersproject/bignumber';
import { reportAndSanitizeError } from '../../utils/error';

export const populateProvedUnshield = async (
  networkName: NetworkName,
  railgunWalletID: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<string>,
  gasDetailsSerialized: TransactionGasDetailsSerialized,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const { populatedTransaction, nullifiers } =
      await populateProvedTransaction(
        networkName,
        ProofType.Unshield,
        railgunWalletID,
        false, // showSenderAddressToRecipient
        undefined, // memoText
        erc20AmountRecipients,
        nftAmountRecipients,
        undefined, // relayAdaptUnshieldERC20AmountRecipients
        undefined, // relayAdaptUnshieldNFTAmounts
        undefined, // relayAdaptShieldERC20Addresses
        undefined, // relayAdaptShieldNFTs
        undefined, // crossContractCallsSerialized
        relayerFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
        gasDetailsSerialized,
      );
    return {
      nullifiers,
      serializedTransaction: serializeUnsignedTransaction(populatedTransaction),
    };
  } catch (err) {
    throw reportAndSanitizeError(populateProvedUnshield.name, err);
  }
};

export const populateProvedUnshieldBaseToken = async (
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  wrappedERC20Amount: RailgunERC20Amount,
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<string>,
  gasDetailsSerialized: TransactionGasDetailsSerialized,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      {
        ...wrappedERC20Amount,
        recipientAddress: publicWalletAddress,
      },
    ];
    const relayAdaptUnshieldERC20Amounts: RailgunERC20Amount[] = [
      wrappedERC20Amount,
    ];

    // Empty NFT Recipients.
    const nftAmountRecipients: RailgunNFTAmountRecipient[] = [];

    const { populatedTransaction, nullifiers } =
      await populateProvedTransaction(
        networkName,
        ProofType.UnshieldBaseToken,
        railgunWalletID,
        false, // showSenderAddressToRecipient
        undefined, // memoText
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        undefined, // relayAdaptUnshieldNFTAmounts
        undefined, // relayAdaptShieldERC20Addresses
        undefined, // relayAdaptShieldNFTs
        undefined, // crossContractCallsSerialized
        relayerFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
        gasDetailsSerialized,
      );
    return {
      nullifiers,
      serializedTransaction: serializeUnsignedTransaction(populatedTransaction),
    };
  } catch (err) {
    throw reportAndSanitizeError(populateProvedUnshieldBaseToken.name, err);
  }
};

export const gasEstimateForUnprovenUnshield = async (
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  originalGasDetailsSerialized: TransactionGasDetailsSerialized,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    const overallBatchMinGasPrice = BigNumber.from(0).toHexString();

    const response = await gasEstimateResponseDummyProofIterativeRelayerFee(
      (relayerFeeERC20Amount: Optional<RailgunERC20Amount>) =>
        generateDummyProofTransactions(
          ProofType.Unshield,
          networkName,
          railgunWalletID,
          encryptionKey,
          false, // showSenderAddressToRecipient
          undefined, // memoText
          erc20AmountRecipients,
          nftAmountRecipients,
          relayerFeeERC20Amount,
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
      erc20AmountRecipients,
      originalGasDetailsSerialized,
      feeTokenDetails,
      sendWithPublicWallet,
      false, // isCrossContractCall
    );
    return response;
  } catch (err) {
    throw reportAndSanitizeError(gasEstimateForUnprovenUnshield.name, err);
  }
};

export const gasEstimateForUnprovenUnshieldBaseToken = async (
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  wrappedERC20Amount: RailgunERC20Amount,
  originalGasDetailsSerialized: TransactionGasDetailsSerialized,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    const relayAdaptUnshieldERC20AmountRecipients: RailgunERC20AmountRecipient[] =
      createRelayAdaptUnshieldERC20AmountRecipients(networkName, [
        wrappedERC20Amount,
      ]);

    // Empty NFT Recipients.
    const nftAmountRecipients: RailgunNFTAmountRecipient[] = [];

    const overallBatchMinGasPrice = BigNumber.from(0).toHexString();

    const response = await gasEstimateResponseDummyProofIterativeRelayerFee(
      (relayerFeeERC20Amount: Optional<RailgunERC20Amount>) =>
        generateDummyProofTransactions(
          ProofType.UnshieldBaseToken,
          networkName,
          railgunWalletID,
          encryptionKey,
          false, // showSenderAddressToRecipient
          undefined, // memoText
          relayAdaptUnshieldERC20AmountRecipients,
          nftAmountRecipients,
          relayerFeeERC20Amount,
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
      relayAdaptUnshieldERC20AmountRecipients,
      originalGasDetailsSerialized,
      feeTokenDetails,
      sendWithPublicWallet,
      false, // isCrossContractCall
    );
    return response;
  } catch (err) {
    throw reportAndSanitizeError(
      gasEstimateForUnprovenUnshieldBaseToken.name,
      err,
    );
  }
};
