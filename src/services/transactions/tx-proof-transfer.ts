import {
  RailgunProveTransactionResponse,
  NetworkName,
  ProofType,
  sanitizeError,
  RailgunWalletTokenAmountRecipient,
} from '@railgun-community/shared-models';
import { generateProofTransactions, generateTransact } from './tx-generator';
import { sendErrorMessage } from '../../utils/logger';
import { setCachedProvedTransaction } from './proof-cache';
import { ProverProgressCallback } from '@railgun-community/engine';

export const generateTransferProof = async (
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  memoText: Optional<string>,
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[],
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>,
  sendWithPublicWallet: boolean,
  progressCallback: ProverProgressCallback,
): Promise<RailgunProveTransactionResponse> => {
  try {
    setCachedProvedTransaction(undefined);

    const txs = await generateProofTransactions(
      ProofType.Transfer,
      networkName,
      railgunWalletID,
      encryptionKey,
      memoText,
      tokenAmountRecipients,
      relayerFeeTokenAmountRecipient,
      sendWithPublicWallet,
      progressCallback,
    );
    const populatedTransaction = await generateTransact(txs, networkName);

    setCachedProvedTransaction({
      proofType: ProofType.Transfer,
      railgunWalletID,
      memoText,
      tokenAmountRecipients,
      relayAdaptWithdrawTokenAmountRecipients: undefined,
      relayAdaptDepositTokenAddresses: undefined,
      crossContractCallsSerialized: undefined,
      relayerFeeTokenAmountRecipient,
      sendWithPublicWallet,
      populatedTransaction,
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
