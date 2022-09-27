import {
  RailgunProveTransactionResponse,
  RailgunWalletTokenAmount,
} from '@railgun-community/shared-models/dist/models/response-types';
import { NetworkName } from '@railgun-community/shared-models/dist/models/network-config';
import { ProofType } from '@railgun-community/shared-models/dist/models/proof';
import { sanitizeError } from '@railgun-community/shared-models/dist/utils/error';
import { generateProofTransactions, generateTransact } from './tx-generator';
import { sendErrorMessage } from '../../utils/logger';
import { assertValidRailgunAddress } from '../railgun/wallets/wallets';
import { setCachedProvedTransaction } from './proof-cache';
import { ProverProgressCallback } from '@railgun-community/engine/dist/prover';

export const generateTransferProof = async (
  networkName: NetworkName,
  toWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  memoText: Optional<string>,
  tokenAmounts: RailgunWalletTokenAmount[],
  relayerRailgunAddress: Optional<string>,
  relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>,
  sendWithPublicWallet: boolean,
  progressCallback: ProverProgressCallback,
): Promise<RailgunProveTransactionResponse> => {
  try {
    assertValidRailgunAddress(toWalletAddress, networkName);
    if (relayerRailgunAddress) {
      assertValidRailgunAddress(relayerRailgunAddress, networkName);
    }
    const railgunAddress = toWalletAddress;

    setCachedProvedTransaction(undefined);

    const txs = await generateProofTransactions(
      ProofType.Transfer,
      networkName,
      railgunWalletID,
      railgunAddress,
      encryptionKey,
      memoText,
      tokenAmounts,
      relayerRailgunAddress,
      relayerFeeTokenAmount,
      sendWithPublicWallet,
      progressCallback,
    );
    const populatedTransaction = await generateTransact(txs, networkName);

    setCachedProvedTransaction({
      proofType: ProofType.Transfer,
      toWalletAddress: railgunAddress,
      railgunWalletID,
      memoText,
      tokenAmounts,
      relayerRailgunAddress,
      relayerFeeTokenAmount,
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
