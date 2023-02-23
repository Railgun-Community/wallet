import {
  RailgunProveTransactionResponse,
  RailgunERC20Amount,
  NetworkName,
  ProofType,
  RailgunERC20AmountRecipient,
  RailgunNFTAmountRecipient,
} from '@railgun-community/shared-models';
import {
  generateDummyProofTransactions,
  generateProofTransactions,
  generateTransact,
  generateUnshieldBaseToken,
  nullifiersForTransactions,
} from './tx-generator';
import { assertValidEthAddress } from '../railgun/wallets/wallets';
import { setCachedProvedTransaction } from './proof-cache';
import { getRelayAdaptContractForNetwork } from '../railgun/core/providers';
import {
  AdaptID,
  ProverProgressCallback,
  randomHex,
} from '@railgun-community/engine';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import { createRelayAdaptUnshieldERC20AmountRecipients } from './tx-cross-contract-calls';
import { reportAndSanitizeError } from '../../utils/error';

export const generateUnshieldProof = async (
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<string>,
  progressCallback: ProverProgressCallback,
): Promise<RailgunProveTransactionResponse> => {
  try {
    setCachedProvedTransaction(undefined);

    const transactions = await generateProofTransactions(
      ProofType.Unshield,
      networkName,
      railgunWalletID,
      encryptionKey,
      false, // showSenderAddressToRecipient
      undefined, // memoText
      erc20AmountRecipients,
      nftAmountRecipients,
      relayerFeeERC20AmountRecipient,
      sendWithPublicWallet,
      undefined, // relayAdaptID
      false, // useDummyProof
      overallBatchMinGasPrice,
      progressCallback,
    );
    const populatedTransaction = await generateTransact(
      transactions,
      networkName,
    );

    const nullifiers = nullifiersForTransactions(transactions);

    setCachedProvedTransaction({
      proofType: ProofType.Unshield,
      railgunWalletID,
      showSenderAddressToRecipient: false,
      memoText: undefined,
      erc20AmountRecipients,
      nftAmountRecipients,
      relayAdaptUnshieldERC20Amounts: undefined,
      relayAdaptUnshieldNFTAmounts: undefined,
      relayAdaptShieldERC20Addresses: undefined,
      relayAdaptShieldNFTs: undefined,
      crossContractCallsSerialized: undefined,
      relayerFeeERC20AmountRecipient,
      populatedTransaction,
      sendWithPublicWallet,
      overallBatchMinGasPrice,
      nullifiers,
    });
    return {};
  } catch (err) {
    const sanitizedError = reportAndSanitizeError(
      generateUnshieldProof.name,
      err,
    );
    const railResponse: RailgunProveTransactionResponse = {
      error: sanitizedError.message,
    };
    return railResponse;
  }
};

export const generateUnshieldBaseTokenProof = async (
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  wrappedERC20Amount: RailgunERC20Amount,
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<string>,
  progressCallback: ProverProgressCallback,
): Promise<RailgunProveTransactionResponse> => {
  try {
    assertNotBlockedAddress(publicWalletAddress);
    assertValidEthAddress(publicWalletAddress);

    setCachedProvedTransaction(undefined);

    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      {
        ...wrappedERC20Amount,
        recipientAddress: publicWalletAddress,
      },
    ];

    const relayAdaptUnshieldERC20Amounts: RailgunERC20Amount[] = [
      wrappedERC20Amount,
    ];

    const relayAdaptUnshieldERC20AmountRecipients: RailgunERC20AmountRecipient[] =
      createRelayAdaptUnshieldERC20AmountRecipients(networkName, [
        wrappedERC20Amount,
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
      relayAdaptUnshieldERC20AmountRecipients,
      relayAdaptUnshieldNFTAmountRecipients,
      relayerFeeERC20AmountRecipient,
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
    const transactions = await generateProofTransactions(
      ProofType.UnshieldBaseToken,
      networkName,
      railgunWalletID,
      encryptionKey,
      showSenderAddressToRecipient,
      memoText,
      relayAdaptUnshieldERC20AmountRecipients,
      relayAdaptUnshieldNFTAmountRecipients,
      relayerFeeERC20AmountRecipient,
      sendWithPublicWallet,
      relayAdaptID,
      false, // useDummyProof
      overallBatchMinGasPrice,
      progressCallback,
    );

    const populatedTransaction = await generateUnshieldBaseToken(
      transactions,
      networkName,
      publicWalletAddress,
      relayAdaptParamsRandom,
      false, // useDummyProof
    );

    const nullifiers = nullifiersForTransactions(transactions);

    setCachedProvedTransaction({
      proofType: ProofType.UnshieldBaseToken,
      railgunWalletID,
      showSenderAddressToRecipient,
      memoText,
      erc20AmountRecipients,
      nftAmountRecipients,
      relayAdaptUnshieldERC20Amounts,
      relayAdaptUnshieldNFTAmounts: undefined,
      relayAdaptShieldERC20Addresses: undefined,
      relayAdaptShieldNFTs: undefined,
      crossContractCallsSerialized: undefined,
      relayerFeeERC20AmountRecipient,
      sendWithPublicWallet,
      populatedTransaction,
      overallBatchMinGasPrice,
      nullifiers,
    });
    return {};
  } catch (err) {
    const sanitizedError = reportAndSanitizeError(
      generateUnshieldBaseTokenProof.name,
      err,
    );
    const railResponse: RailgunProveTransactionResponse = {
      error: sanitizedError.message,
    };
    return railResponse;
  }
};
