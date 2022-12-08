import {
  RailgunProveTransactionResponse,
  RailgunWalletTokenAmount,
  NetworkName,
  ProofType,
  sanitizeError,
  RailgunWalletTokenAmountRecipient,
  RailgunNFTRecipient,
} from '@railgun-community/shared-models';
import {
  generateDummyProofTransactions,
  generateProofTransactions,
  generateTransact,
  generateUnshieldBaseToken,
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
import { createRelayAdaptUnshieldTokenAmountRecipients } from './tx-cross-contract-calls';

export const generateUnshieldProof = async (
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
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
      ProofType.Unshield,
      networkName,
      railgunWalletID,
      encryptionKey,
      false, // showSenderAddressToRecipient
      undefined, // memoText
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
      proofType: ProofType.Unshield,
      railgunWalletID,
      showSenderAddressToRecipient: false,
      memoText: undefined,
      tokenAmountRecipients,
      nftRecipients,
      relayAdaptUnshieldTokenAmounts: undefined,
      relayAdaptShieldTokenAddresses: undefined,
      crossContractCallsSerialized: undefined,
      relayerFeeTokenAmountRecipient,
      populatedTransaction,
      sendWithPublicWallet,
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

export const generateUnshieldBaseTokenProof = async (
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  wrappedTokenAmount: RailgunWalletTokenAmount,
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<string>,
  progressCallback: ProverProgressCallback,
): Promise<RailgunProveTransactionResponse> => {
  try {
    assertNotBlockedAddress(publicWalletAddress);
    assertValidEthAddress(publicWalletAddress);

    setCachedProvedTransaction(undefined);

    const tokenAmountRecipients: RailgunWalletTokenAmountRecipient[] = [
      {
        ...wrappedTokenAmount,
        recipientAddress: publicWalletAddress,
      },
    ];

    const relayAdaptUnshieldTokenAmounts: RailgunWalletTokenAmount[] = [
      wrappedTokenAmount,
    ];

    const relayAdaptUnshieldTokenAmountRecipients: RailgunWalletTokenAmountRecipient[] =
      createRelayAdaptUnshieldTokenAmountRecipients(networkName, [
        wrappedTokenAmount,
      ]);

    // Empty NFT recipients.
    const nftRecipients: RailgunNFTRecipient[] = [];
    const relayAdaptUnshieldNFTRecipients: RailgunNFTRecipient[] = [];

    const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);

    // Generate dummy txs for relay adapt params.
    const dummyTxs = await generateDummyProofTransactions(
      ProofType.UnshieldBaseToken,
      networkName,
      railgunWalletID,
      encryptionKey,
      false, // showSenderAddressToRecipient
      undefined, // memoText
      relayAdaptUnshieldTokenAmountRecipients,
      relayAdaptUnshieldNFTRecipients,
      relayerFeeTokenAmountRecipient,
      sendWithPublicWallet,
      overallBatchMinGasPrice,
    );

    const relayAdaptParamsRandom = randomHex(31);
    const relayAdaptParams =
      await relayAdaptContract.getRelayAdaptParamsUnshieldBaseToken(
        dummyTxs,
        publicWalletAddress,
        relayAdaptParamsRandom,
      );
    const relayAdaptID: AdaptID = {
      contract: relayAdaptContract.address,
      parameters: relayAdaptParams,
    };

    const showSenderAddressToRecipient = false;
    const memoText: Optional<string> = undefined;

    // Generate final txs with relay adapt ID.
    const txs = await generateProofTransactions(
      ProofType.UnshieldBaseToken,
      networkName,
      railgunWalletID,
      encryptionKey,
      showSenderAddressToRecipient,
      memoText,
      relayAdaptUnshieldTokenAmountRecipients,
      relayAdaptUnshieldNFTRecipients,
      relayerFeeTokenAmountRecipient,
      sendWithPublicWallet,
      relayAdaptID,
      false, // useDummyProof
      overallBatchMinGasPrice,
      progressCallback,
    );

    const populatedTransaction = await generateUnshieldBaseToken(
      txs,
      networkName,
      publicWalletAddress,
      relayAdaptParamsRandom,
      false, // useDummyProof
    );

    setCachedProvedTransaction({
      proofType: ProofType.UnshieldBaseToken,
      railgunWalletID,
      showSenderAddressToRecipient,
      memoText,
      tokenAmountRecipients,
      nftRecipients,
      relayAdaptUnshieldTokenAmounts,
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
