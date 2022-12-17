import {
  RailgunPopulateTransactionResponse,
  RailgunProveTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  RailgunWalletTokenAmount,
  TransactionGasDetailsSerialized,
  NetworkName,
  NETWORK_CONFIG,
  ProofType,
  TransactionReceiptLog,
  FeeTokenDetails,
  sanitizeError,
  deserializeTransaction,
  serializeUnsignedTransaction,
  RailgunWalletTokenAmountRecipient,
  RailgunNFTAmountRecipient,
} from '@railgun-community/shared-models';
import { getRelayAdaptContractForNetwork } from '../railgun/core/providers';
import {
  generateDummyProofTransactions,
  generateProofTransactions,
} from './tx-generator';
import {
  populateProvedTransaction,
  setCachedProvedTransaction,
} from './proof-cache';
import { sendErrorMessage } from '../../utils/logger';
import { BigNumber } from '@ethersproject/bignumber';
import { PopulatedTransaction } from '@ethersproject/contracts';
import {
  RelayAdaptHelper,
  AdaptID,
  TransactionStruct,
  hexlify,
  randomHex,
  RelayAdaptContract,
  ProverProgressCallback,
} from '@railgun-community/engine';
import { fullWalletForID } from '../railgun/core/engine';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import { gasEstimateResponseIterativeRelayerFee } from './tx-gas-relayer-fee-estimator';

const createPopulatedCrossContractCalls = (
  crossContractCallsSerialized: string[],
  networkName: NetworkName,
): PopulatedTransaction[] => {
  try {
    return crossContractCallsSerialized
      .map(serialized =>
        deserializeTransaction(
          serialized,
          undefined, // nonce
          NETWORK_CONFIG[networkName].chain.id,
        ),
      )
      .map(transactionRequest => {
        const populatedTransaction: PopulatedTransaction = {
          to: transactionRequest.to,
          value: transactionRequest.value
            ? BigNumber.from(transactionRequest.value)
            : undefined,
          data: transactionRequest.data
            ? hexlify(transactionRequest.data, true)
            : undefined,
        };
        assertNotBlockedAddress(populatedTransaction.to);
        return populatedTransaction;
      });
  } catch (err) {
    sendErrorMessage(err);
    throw new Error('Invalid serialized cross contract calls.');
  }
};

export const createRelayAdaptUnshieldTokenAmountRecipients = (
  networkName: NetworkName,
  unshieldTokenAmounts: RailgunWalletTokenAmount[],
): RailgunWalletTokenAmountRecipient[] => {
  const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);
  const unshieldTokenAmountRecipients: RailgunWalletTokenAmountRecipient[] =
    unshieldTokenAmounts.map(unshieldTokenAmount => ({
      ...unshieldTokenAmount,
      recipientAddress: relayAdaptContract.address,
    }));
  return unshieldTokenAmountRecipients;
};

export const populateProvedCrossContractCalls = async (
  networkName: NetworkName,
  railgunWalletID: string,
  relayAdaptUnshieldTokenAmounts: RailgunWalletTokenAmount[],
  relayAdaptShieldTokenAddresses: string[],
  crossContractCallsSerialized: string[],
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<string>,
  gasDetailsSerialized: TransactionGasDetailsSerialized,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const populatedTransaction = await populateProvedTransaction(
      networkName,
      ProofType.CrossContractCalls,
      railgunWalletID,
      false, // showSenderAddressToRecipient
      undefined, // memoText
      [], // tokenAmountRecipients
      [], // nftAmountRecipients
      relayAdaptUnshieldTokenAmounts,
      relayAdaptShieldTokenAddresses,
      crossContractCallsSerialized,
      relayerFeeTokenAmountRecipient,
      sendWithPublicWallet,
      overallBatchMinGasPrice,
      gasDetailsSerialized,
    );
    delete populatedTransaction.from;

    return {
      serializedTransaction: serializeUnsignedTransaction(populatedTransaction),
    };
  } catch (err) {
    sendErrorMessage(err.message);
    sendErrorMessage(err.stack);
    const railResponse: RailgunPopulateTransactionResponse = {
      error: sanitizeError(err).message,
    };
    return railResponse;
  }
};

export const gasEstimateForUnprovenCrossContractCalls = async (
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  relayAdaptUnshieldTokenAmounts: RailgunWalletTokenAmount[],
  relayAdaptShieldTokenAddresses: string[],
  crossContractCallsSerialized: string[],
  originalGasDetailsSerialized: TransactionGasDetailsSerialized,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    const wallet = fullWalletForID(railgunWalletID);

    setCachedProvedTransaction(undefined);

    const overallBatchMinGasPrice = BigNumber.from(0).toHexString();

    const crossContractCalls = createPopulatedCrossContractCalls(
      crossContractCallsSerialized,
      networkName,
    );

    const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);

    const relayAdaptUnshieldTokenAmountRecipients: RailgunWalletTokenAmountRecipient[] =
      createRelayAdaptUnshieldTokenAmountRecipients(
        networkName,
        relayAdaptUnshieldTokenAmounts,
      );

    // Empty unshield NFT recipients.
    const relayAdaptUnshieldNFTAmountRecipients: RailgunNFTAmountRecipient[] =
      [];

    const shieldRandom = randomHex(16);
    const relayShieldRequests =
      await RelayAdaptHelper.generateRelayShieldRequests(
        wallet,
        shieldRandom,
        relayAdaptShieldTokenAddresses,
      );

    // Add 40% to the gas fee to ensure that it's successful.
    // The final gas estimate changes depending on the Relayer Fee, which can impact the number of circuit inputs.
    // TODO: Replace this after Callback Upgrade made to Relay Adapt contract.
    const multiplierBasisPoints = 14000;

    const response = await gasEstimateResponseIterativeRelayerFee(
      (relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>) =>
        generateDummyProofTransactions(
          ProofType.CrossContractCalls,
          networkName,
          railgunWalletID,
          encryptionKey,
          false, // showSenderAddressToRecipient
          undefined, // memoText
          relayAdaptUnshieldTokenAmountRecipients,
          relayAdaptUnshieldNFTAmountRecipients,
          relayerFeeTokenAmount,
          sendWithPublicWallet,
          overallBatchMinGasPrice,
        ),
      (txs: TransactionStruct[]) => {
        const relayAdaptParamsRandom = randomHex(31);
        return relayAdaptContract.populateCrossContractCalls(
          txs,
          crossContractCalls,
          relayShieldRequests,
          relayAdaptParamsRandom,
        );
      },
      networkName,
      railgunWalletID,
      relayAdaptUnshieldTokenAmountRecipients,
      originalGasDetailsSerialized,
      feeTokenDetails,
      sendWithPublicWallet,
      multiplierBasisPoints,
    );
    return response;
  } catch (err) {
    sendErrorMessage(err.message);
    sendErrorMessage(err.stack);
    const railResponse: RailgunTransactionGasEstimateResponse = {
      error: sanitizeError(err).message,
    };
    return railResponse;
  }
};

export const generateCrossContractCallsProof = async (
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  relayAdaptUnshieldTokenAmounts: RailgunWalletTokenAmount[],
  relayAdaptShieldTokenAddresses: string[],
  crossContractCallsSerialized: string[],
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<string>,
  progressCallback: ProverProgressCallback,
): Promise<RailgunProveTransactionResponse> => {
  try {
    const wallet = fullWalletForID(railgunWalletID);

    setCachedProvedTransaction(undefined);

    const crossContractCalls = createPopulatedCrossContractCalls(
      crossContractCallsSerialized,
      networkName,
    );

    const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);

    const relayAdaptUnshieldTokenAmountRecipients: RailgunWalletTokenAmountRecipient[] =
      createRelayAdaptUnshieldTokenAmountRecipients(
        networkName,
        relayAdaptUnshieldTokenAmounts,
      );

    // Empty unshield NFT recipients.
    const relayAdaptUnshieldNFTAmountRecipients: RailgunNFTAmountRecipient[] =
      [];

    // Generate dummy txs for relay adapt params.
    const dummyUnshieldTxs = await generateDummyProofTransactions(
      ProofType.CrossContractCalls,
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

    // Generate relay adapt params from dummy transactions.
    const shieldRandom = randomHex(16);
    const relayShieldRequests =
      await RelayAdaptHelper.generateRelayShieldRequests(
        wallet,
        shieldRandom,
        relayAdaptShieldTokenAddresses,
      );

    const relayAdaptParamsRandom = randomHex(31);
    const relayAdaptParams =
      await relayAdaptContract.getRelayAdaptParamsCrossContractCalls(
        dummyUnshieldTxs,
        crossContractCalls,
        relayShieldRequests,
        relayAdaptParamsRandom,
      );
    const relayAdaptID: AdaptID = {
      contract: relayAdaptContract.address,
      parameters: relayAdaptParams,
    };

    // Create real transactions with relay adapt params.
    const transactions = await generateProofTransactions(
      ProofType.CrossContractCalls,
      networkName,
      railgunWalletID,
      encryptionKey,
      false, // showSenderAddressToRecipient
      undefined, // memoText
      relayAdaptUnshieldTokenAmountRecipients,
      relayAdaptUnshieldNFTAmountRecipients,
      relayerFeeTokenAmountRecipient,
      sendWithPublicWallet,
      relayAdaptID,
      false, // useDummyProof
      overallBatchMinGasPrice,
      progressCallback,
    );

    const populatedTransaction =
      await relayAdaptContract.populateCrossContractCalls(
        transactions,
        crossContractCalls,
        relayShieldRequests,
        relayAdaptParamsRandom,
      );
    delete populatedTransaction.from;

    setCachedProvedTransaction({
      proofType: ProofType.CrossContractCalls,
      railgunWalletID,
      showSenderAddressToRecipient: false,
      memoText: undefined,
      tokenAmountRecipients: [],
      nftAmountRecipients: [],
      relayAdaptUnshieldTokenAmounts,
      relayAdaptShieldTokenAddresses,
      crossContractCallsSerialized,
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

export const getRelayAdaptTransactionError = (
  receiptLogs: TransactionReceiptLog[],
): Optional<string> => {
  try {
    const relayAdaptError =
      RelayAdaptContract.getRelayAdaptCallError(receiptLogs);
    if (relayAdaptError) {
      sendErrorMessage(relayAdaptError);
      return relayAdaptError;
    }
    return undefined;
  } catch (err) {
    sendErrorMessage(err.stack);
    throw err;
  }
};
