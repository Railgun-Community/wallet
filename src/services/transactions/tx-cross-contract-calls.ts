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
  SerializedTransaction,
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

export const createRelayAdaptWithdrawTokenAmountRecipients = (
  networkName: NetworkName,
  withdrawTokenAmounts: RailgunWalletTokenAmount[],
): RailgunWalletTokenAmountRecipient[] => {
  const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);
  const withdrawTokenAmountRecipients: RailgunWalletTokenAmountRecipient[] =
    withdrawTokenAmounts.map(withdrawTokenAmount => ({
      ...withdrawTokenAmount,
      recipientAddress: relayAdaptContract.address,
    }));
  return withdrawTokenAmountRecipients;
};

export const populateProvedCrossContractCalls = async (
  networkName: NetworkName,
  railgunWalletID: string,
  relayAdaptWithdrawTokenAmounts: RailgunWalletTokenAmount[],
  relayAdaptDepositTokenAddresses: string[],
  crossContractCallsSerialized: string[],
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>,
  sendWithPublicWallet: boolean,
  gasDetailsSerialized: Optional<TransactionGasDetailsSerialized>,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const relayAdaptWithdrawTokenAmountRecipients: RailgunWalletTokenAmountRecipient[] =
      createRelayAdaptWithdrawTokenAmountRecipients(
        networkName,
        relayAdaptWithdrawTokenAmounts,
      );

    const populatedTransaction = await populateProvedTransaction(
      ProofType.CrossContractCalls,
      railgunWalletID,
      undefined, // memoText
      [], // tokenAmountRecipients
      relayAdaptWithdrawTokenAmountRecipients,
      relayAdaptDepositTokenAddresses,
      crossContractCallsSerialized,
      relayerFeeTokenAmountRecipient,
      sendWithPublicWallet,
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
  relayAdaptWithdrawTokenAmounts: RailgunWalletTokenAmount[],
  relayAdaptDepositTokenAddresses: string[],
  crossContractCallsSerialized: string[],
  originalGasDetailsSerialized: TransactionGasDetailsSerialized,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    const wallet = fullWalletForID(railgunWalletID);

    setCachedProvedTransaction(undefined);

    const crossContractCalls = createPopulatedCrossContractCalls(
      crossContractCallsSerialized,
      networkName,
    );

    const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);

    const relayAdaptWithdrawTokenAmountRecipients: RailgunWalletTokenAmountRecipient[] =
      createRelayAdaptWithdrawTokenAmountRecipients(
        networkName,
        relayAdaptWithdrawTokenAmounts,
      );

    const depositRandom = randomHex(16);
    const relayDepositInputs = RelayAdaptHelper.generateRelayDepositInputs(
      wallet,
      depositRandom,
      relayAdaptDepositTokenAddresses,
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
          undefined, // memoText
          relayAdaptWithdrawTokenAmountRecipients,
          relayerFeeTokenAmount,
          sendWithPublicWallet,
        ),
      (txs: SerializedTransaction[]) => {
        const relayAdaptParamsRandom = randomHex(16);
        return relayAdaptContract.populateCrossContractCalls(
          txs,
          crossContractCalls,
          relayDepositInputs,
          relayAdaptParamsRandom,
        );
      },
      networkName,
      railgunWalletID,
      relayAdaptWithdrawTokenAmountRecipients,
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
  relayAdaptWithdrawTokenAmounts: RailgunWalletTokenAmount[],
  relayAdaptDepositTokenAddresses: string[],
  crossContractCallsSerialized: string[],
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>,
  sendWithPublicWallet: boolean,
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

    const relayAdaptWithdrawTokenAmountRecipients: RailgunWalletTokenAmountRecipient[] =
      createRelayAdaptWithdrawTokenAmountRecipients(
        networkName,
        relayAdaptWithdrawTokenAmounts,
      );

    // Generate dummy txs for relay adapt params.
    const dummyWithdrawTxs = await generateDummyProofTransactions(
      ProofType.CrossContractCalls,
      networkName,
      railgunWalletID,
      encryptionKey,
      undefined, // memoText
      relayAdaptWithdrawTokenAmountRecipients,
      relayerFeeTokenAmountRecipient,
      sendWithPublicWallet,
    );

    // Generate relay adapt params from dummy transactions.
    const depositRandom = randomHex(16);
    const relayDepositInputs = RelayAdaptHelper.generateRelayDepositInputs(
      wallet,
      depositRandom,
      relayAdaptDepositTokenAddresses,
    );

    const relayAdaptParamsRandom = randomHex(16);
    const relayAdaptParams =
      await relayAdaptContract.getRelayAdaptParamsCrossContractCalls(
        dummyWithdrawTxs,
        crossContractCalls,
        relayDepositInputs,
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
      undefined, // memoText
      relayAdaptWithdrawTokenAmountRecipients,
      relayerFeeTokenAmountRecipient,
      sendWithPublicWallet,
      progressCallback,
      relayAdaptID,
      false, // useDummyProof
    );

    const populatedTransaction =
      await relayAdaptContract.populateCrossContractCalls(
        transactions,
        crossContractCalls,
        relayDepositInputs,
        relayAdaptParamsRandom,
      );
    delete populatedTransaction.from;

    setCachedProvedTransaction({
      proofType: ProofType.CrossContractCalls,
      railgunWalletID,
      memoText: undefined,
      tokenAmountRecipients: [],
      relayAdaptWithdrawTokenAmountRecipients,
      relayAdaptDepositTokenAddresses,
      crossContractCallsSerialized,
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

export const getRelayAdaptTransactionError = (
  receiptLogs: TransactionReceiptLog[],
): Optional<string> => {
  try {
    const relayAdaptError = RelayAdaptContract.getCallResultError(receiptLogs);
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
