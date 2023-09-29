import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  RailgunERC20Amount,
  NetworkName,
  ProofType,
  FeeTokenDetails,
  RailgunERC20AmountRecipient,
  RailgunNFTAmountRecipient,
  TransactionGasDetails,
  TXIDVersion,
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
import { reportAndSanitizeError } from '../../utils/error';

export const populateProvedUnshield = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  gasDetails: TransactionGasDetails,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const { transaction, nullifiers } = await populateProvedTransaction(
      txidVersion,
      networkName,
      ProofType.Unshield,
      railgunWalletID,
      false, // showSenderAddressToRecipient
      undefined, // memoText
      erc20AmountRecipients,
      nftAmountRecipients,
      undefined, // relayAdaptUnshieldERC20AmountRecipients
      undefined, // relayAdaptUnshieldNFTAmounts
      undefined, // relayAdaptShieldERC20Recipients
      undefined, // relayAdaptShieldNFTRecipients
      undefined, // crossContractCalls
      relayerFeeERC20AmountRecipient,
      sendWithPublicWallet,
      overallBatchMinGasPrice,
      gasDetails,
    );
    return {
      nullifiers,
      transaction,
    };
  } catch (err) {
    throw reportAndSanitizeError(populateProvedUnshield.name, err);
  }
};

export const populateProvedUnshieldBaseToken = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  wrappedERC20Amount: RailgunERC20Amount,
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  gasDetails: TransactionGasDetails,
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

    const { transaction, nullifiers } = await populateProvedTransaction(
      txidVersion,
      networkName,
      ProofType.UnshieldBaseToken,
      railgunWalletID,
      false, // showSenderAddressToRecipient
      undefined, // memoText
      erc20AmountRecipients,
      nftAmountRecipients,
      relayAdaptUnshieldERC20Amounts,
      undefined, // relayAdaptUnshieldNFTAmounts
      undefined, // relayAdaptShieldERC20Recipients
      undefined, // relayAdaptShieldNFTRecipients
      undefined, // crossContractCalls
      relayerFeeERC20AmountRecipient,
      sendWithPublicWallet,
      overallBatchMinGasPrice,
      gasDetails,
    );
    return {
      nullifiers,
      transaction,
    };
  } catch (err) {
    throw reportAndSanitizeError(populateProvedUnshieldBaseToken.name, err);
  }
};

export const gasEstimateForUnprovenUnshield = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  originalGasDetails: TransactionGasDetails,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    const overallBatchMinGasPrice = 0n;

    const response = await gasEstimateResponseDummyProofIterativeRelayerFee(
      (relayerFeeERC20Amount: Optional<RailgunERC20Amount>) =>
        generateDummyProofTransactions(
          ProofType.Unshield,
          networkName,
          railgunWalletID,
          txidVersion,
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
      txidVersion,
      networkName,
      railgunWalletID,
      erc20AmountRecipients,
      originalGasDetails,
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
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  wrappedERC20Amount: RailgunERC20Amount,
  originalGasDetails: TransactionGasDetails,
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

    const overallBatchMinGasPrice = 0n;

    const response = await gasEstimateResponseDummyProofIterativeRelayerFee(
      (relayerFeeERC20Amount: Optional<RailgunERC20Amount>) =>
        generateDummyProofTransactions(
          ProofType.UnshieldBaseToken,
          networkName,
          railgunWalletID,
          txidVersion,
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
      txidVersion,
      networkName,
      railgunWalletID,
      relayAdaptUnshieldERC20AmountRecipients,
      originalGasDetails,
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
