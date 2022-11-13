import {
  RailgunProveTransactionResponse,
  NetworkName,
  ProofType,
  sanitizeError,
  RailgunWalletTokenAmountRecipient,
  RailgunWalletTokenAmount,
} from '@railgun-community/shared-models';
import {
  generateDummyProofTransactions,
  generateProofTransactions,
  generateTransact,
  generateWithdrawBaseToken,
} from './tx-generator';
import { sendErrorMessage } from '../../utils/logger';
import { assertValidEthAddress } from '../railgun/wallets/wallets';
import { setCachedProvedTransaction } from './proof-cache';
import { getRelayAdaptContractForNetwork } from '../railgun/core/providers';
import {
  AdaptID,
  ProverProgressCallback,
  randomHex,
} from '@railgun-community/engine';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import { createRelayAdaptWithdrawTokenAmountRecipients } from './tx-cross-contract-calls';

export const generateWithdrawProof = async (
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[],
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>,
  sendWithPublicWallet: boolean,
  progressCallback: ProverProgressCallback,
): Promise<RailgunProveTransactionResponse> => {
  try {
    setCachedProvedTransaction(undefined);

    const txs = await generateProofTransactions(
      ProofType.Withdraw,
      networkName,
      railgunWalletID,
      encryptionKey,
      undefined, // memoText
      tokenAmountRecipients,
      relayerFeeTokenAmountRecipient,
      sendWithPublicWallet,
      progressCallback,
    );
    const populatedTransaction = await generateTransact(txs, networkName);

    setCachedProvedTransaction({
      proofType: ProofType.Withdraw,
      railgunWalletID,
      memoText: undefined,
      tokenAmountRecipients,
      relayAdaptWithdrawTokenAmountRecipients: undefined,
      relayAdaptDepositTokenAddresses: undefined,
      crossContractCallsSerialized: undefined,
      relayerFeeTokenAmountRecipient,
      populatedTransaction,
      sendWithPublicWallet,
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

export const generateWithdrawBaseTokenProof = async (
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  wrappedTokenAmount: RailgunWalletTokenAmount,
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>,
  sendWithPublicWallet: boolean,
  progressCallback: ProverProgressCallback,
): Promise<RailgunProveTransactionResponse> => {
  try {
    assertValidEthAddress(publicWalletAddress);
    assertNotBlockedAddress(publicWalletAddress);

    setCachedProvedTransaction(undefined);

    const tokenAmountRecipients: RailgunWalletTokenAmountRecipient[] = [
      {
        ...wrappedTokenAmount,
        recipientAddress: publicWalletAddress,
      },
    ];

    const relayAdaptWithdrawTokenAmountRecipients: RailgunWalletTokenAmountRecipient[] =
      createRelayAdaptWithdrawTokenAmountRecipients(networkName, [
        wrappedTokenAmount,
      ]);

    const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);

    // Generate dummy txs for relay adapt params.
    const dummyTxs = await generateDummyProofTransactions(
      ProofType.WithdrawBaseToken,
      networkName,
      railgunWalletID,
      encryptionKey,
      undefined, // memoText
      relayAdaptWithdrawTokenAmountRecipients,
      relayerFeeTokenAmountRecipient,
      sendWithPublicWallet,
    );

    const relayAdaptParamsRandom = randomHex(16);
    const relayAdaptParams =
      await relayAdaptContract.getRelayAdaptParamsWithdrawBaseToken(
        dummyTxs,
        publicWalletAddress,
        relayAdaptParamsRandom,
      );
    const relayAdaptID: AdaptID = {
      contract: relayAdaptContract.address,
      parameters: relayAdaptParams,
    };

    // Generate final txs with relay adapt ID.
    const txs = await generateProofTransactions(
      ProofType.WithdrawBaseToken,
      networkName,
      railgunWalletID,
      encryptionKey,
      undefined, // memoText
      relayAdaptWithdrawTokenAmountRecipients,
      relayerFeeTokenAmountRecipient,
      sendWithPublicWallet,
      progressCallback,
      relayAdaptID,
      false, // useDummyProof
    );

    const populatedTransaction = await generateWithdrawBaseToken(
      txs,
      networkName,
      publicWalletAddress,
      relayAdaptParamsRandom,
      false, // useDummyProof
    );

    setCachedProvedTransaction({
      proofType: ProofType.WithdrawBaseToken,
      railgunWalletID,
      memoText: undefined,
      tokenAmountRecipients,
      relayAdaptWithdrawTokenAmountRecipients,
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
