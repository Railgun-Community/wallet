import {
  RailgunProveTransactionResponse,
  NetworkName,
  ProofType,
  sanitizeError,
  RailgunWalletTokenAmountRecipient,
  RailgunNFTRecipient,
} from '@railgun-community/shared-models';
import { generateProofTransactions, generateTransact } from './tx-generator';
import { sendErrorMessage } from '../../utils/logger';
import { setCachedProvedTransaction } from './proof-cache';
import { ProverProgressCallback } from '@railgun-community/engine';

export const generateTransferProof = async (
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[],
  nftRecipients: RailgunNFTRecipient[],
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<string>,
  progressCallback: ProverProgressCallback,
): Promise<RailgunProveTransactionResponse> => {
  try {
    setCachedProvedTransaction(undefined);

    const txs = await generateProofTransactions(
      ProofType.Transfer,
      networkName,
      railgunWalletID,
      encryptionKey,
      showSenderAddressToRecipient,
      memoText,
      tokenAmountRecipients,
      nftRecipients,
      relayerFeeTokenAmountRecipient,
      sendWithPublicWallet,
      undefined, // relayAdaptID
      false, // useDummyProof
      overallBatchMinGasPrice,
      progressCallback,
    );
    const populatedTransaction = await generateTransact(txs, networkName);

    setCachedProvedTransaction({
      proofType: ProofType.Transfer,
      railgunWalletID,
      showSenderAddressToRecipient,
      memoText,
      tokenAmountRecipients,
      nftRecipients,
      relayAdaptUnshieldTokenAmounts: undefined,
      relayAdaptShieldTokenAddresses: undefined,
      crossContractCallsSerialized: undefined,
      relayerFeeTokenAmountRecipient,
      sendWithPublicWallet,
      populatedTransaction,
      overallBatchMinGasPrice,
    });
    return {};
  } catch (err) {
    sendErrorMessage(err.stack);
    const railResponse: RailgunProveTransactionResponse = {
      error: sanitizeError(err).message,
    };
    return railResponse;
  }
};
