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
} from '@railgun-community/shared-models';
import {
  generateDummyProofTransactions,
  generateTransact,
} from './tx-generator';
import { populateProvedTransaction } from './proof-cache';
import { TransactionStruct } from '@railgun-community/engine';
import { gasEstimateResponseDummyProofIterativeRelayerFee } from './tx-gas-relayer-fee-estimator';
import { reportAndSanitizeError } from '../../utils/error';

export const populateProvedTransfer = async (
  networkName: NetworkName,
  railgunWalletID: string,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  gasDetails: TransactionGasDetails,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const { transaction, nullifiers } = await populateProvedTransaction(
      networkName,
      ProofType.Transfer,
      railgunWalletID,
      showSenderAddressToRecipient,
      memoText,
      erc20AmountRecipients,
      nftAmountRecipients,
      undefined, // relayAdaptUnshieldERC20AmountRecipients
      undefined, // relayAdaptUnshieldNFTAmounts
      undefined, // relayAdaptShieldERC20Addresses
      undefined, // relayAdaptShieldNFTs
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
    throw reportAndSanitizeError(populateProvedTransfer.name, err);
  }
};

export const gasEstimateForUnprovenTransfer = async (
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  memoText: Optional<string>,
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
          ProofType.Transfer,
          networkName,
          railgunWalletID,
          encryptionKey,
          false, // showSenderAddressToRecipient - doesn't matter for gas estimate.
          memoText,
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
      originalGasDetails,
      feeTokenDetails,
      sendWithPublicWallet,
      false, // isCrossContractCall
    );
    return response;
  } catch (err) {
    throw reportAndSanitizeError(gasEstimateForUnprovenTransfer.name, err);
  }
};
