import {
  RailgunProveTransactionResponse,
  RailgunERC20Amount,
  NetworkName,
  ProofType,
  sanitizeError,
  RailgunERC20AmountRecipient,
  RailgunNFTAmountRecipient,
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
  tokenAmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  relayerFeeTokenAmountRecipient: Optional<RailgunERC20AmountRecipient>,
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
      nftAmountRecipients,
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
      nftAmountRecipients,
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
  wrappedTokenAmount: RailgunERC20Amount,
  relayerFeeTokenAmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<string>,
  progressCallback: ProverProgressCallback,
): Promise<RailgunProveTransactionResponse> => {
  try {
    assertNotBlockedAddress(publicWalletAddress);
    assertValidEthAddress(publicWalletAddress);

    setCachedProvedTransaction(undefined);

    const tokenAmountRecipients: RailgunERC20AmountRecipient[] = [
      {
        ...wrappedTokenAmount,
        recipientAddress: publicWalletAddress,
      },
    ];

    const relayAdaptUnshieldTokenAmounts: RailgunERC20Amount[] = [
      wrappedTokenAmount,
    ];

    const relayAdaptUnshieldTokenAmountRecipients: RailgunERC20AmountRecipient[] =
      createRelayAdaptUnshieldTokenAmountRecipients(networkName, [
        wrappedTokenAmount,
      ]);

    // Empty NFT recipients.
    const nftAmountRecipients: RailgunNFTAmountRecipient[] = [];
    const relayAdaptUnshieldNFTAmountRecipients: RailgunNFTAmountRecipient[] =
      [];

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
      relayAdaptUnshieldNFTAmountRecipients,
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
      relayAdaptUnshieldNFTAmountRecipients,
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
      nftAmountRecipients,
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
