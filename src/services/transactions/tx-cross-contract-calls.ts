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
} from '@railgun-community/shared-models';
import { getRelayAdaptContractForNetwork } from '../railgun/core/providers';
import {
  generateDummyProofTransactions,
  generateProofTransactions,
} from './tx-generator';
import { assertValidRailgunAddress } from '../railgun/wallets/wallets';
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
};

export const populateProvedCrossContractCalls = async (
  networkName: NetworkName,
  fromWalletAddress: string,
  railgunWalletID: string,
  withdrawTokenAmounts: RailgunWalletTokenAmount[],
  depositTokenAddresses: string[],
  crossContractCallsSerialized: string[],
  relayerRailgunAddress: Optional<string>,
  relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>,
  sendWithPublicWallet: boolean,
  gasDetailsSerialized: Optional<TransactionGasDetailsSerialized>,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    assertValidRailgunAddress(fromWalletAddress, networkName);
    if (relayerRailgunAddress) {
      assertValidRailgunAddress(relayerRailgunAddress, networkName);
    }

    const populatedTransaction = await populateProvedTransaction(
      ProofType.CrossContractCalls,
      fromWalletAddress,
      railgunWalletID,
      undefined, // memoText
      withdrawTokenAmounts,
      depositTokenAddresses,
      crossContractCallsSerialized,
      relayerRailgunAddress,
      relayerFeeTokenAmount,
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
  fromWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  withdrawTokenAmounts: RailgunWalletTokenAmount[],
  depositTokenAddresses: string[],
  crossContractCallsSerialized: string[],
  originalGasDetailsSerialized: TransactionGasDetailsSerialized,
  feeTokenDetails: FeeTokenDetails,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    assertValidRailgunAddress(fromWalletAddress, networkName);
    const wallet = fullWalletForID(railgunWalletID);

    setCachedProvedTransaction(undefined);

    const crossContractCalls = createPopulatedCrossContractCalls(
      crossContractCallsSerialized,
      networkName,
    );

    const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);

    const depositRandom = randomHex(16);
    const relayDepositInputs = RelayAdaptHelper.generateRelayDepositInputs(
      wallet,
      depositRandom,
      depositTokenAddresses,
    );

    // Add 40% to the gas fee to ensure that it's successful.
    // The final gas estimate changes depending on the Relayer Fee, which can impact the number of circuit inputs.
    // TODO: Replace this after Callback Upgrade made to Relay Adapt contract.
    const multiplierBasisPoints = 14000;

    const response = await gasEstimateResponseIterativeRelayerFee(
      (relayerFeeTokenAmount: RailgunWalletTokenAmount) =>
        generateDummyProofTransactions(
          ProofType.CrossContractCalls,
          networkName,
          railgunWalletID,
          relayAdaptContract.address,
          encryptionKey,
          undefined, // memoText
          withdrawTokenAmounts,
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
      withdrawTokenAmounts,
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
  fromWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  withdrawTokenAmounts: RailgunWalletTokenAmount[],
  depositTokenAddresses: string[],
  crossContractCallsSerialized: string[],
  relayerRailgunAddress: Optional<string>,
  relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>,
  sendWithPublicWallet: boolean,
  progressCallback: ProverProgressCallback,
): Promise<RailgunProveTransactionResponse> => {
  try {
    assertValidRailgunAddress(fromWalletAddress, networkName);
    if (relayerRailgunAddress) {
      assertValidRailgunAddress(relayerRailgunAddress, networkName);
    }
    const railgunWalletAddress = fromWalletAddress;
    const wallet = fullWalletForID(railgunWalletID);

    setCachedProvedTransaction(undefined);

    const crossContractCalls = createPopulatedCrossContractCalls(
      crossContractCallsSerialized,
      networkName,
    );

    const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);

    // Generate dummy txs for relay adapt params.
    const dummyWithdrawTxs = await generateDummyProofTransactions(
      ProofType.CrossContractCalls,
      networkName,
      railgunWalletID,
      relayAdaptContract.address,
      encryptionKey,
      undefined, // memoText
      withdrawTokenAmounts,
      relayerFeeTokenAmount,
      sendWithPublicWallet,
    );

    // Generate relay adapt params from dummy transactions.
    const depositRandom = randomHex(16);
    const relayDepositInputs = RelayAdaptHelper.generateRelayDepositInputs(
      wallet,
      depositRandom,
      depositTokenAddresses,
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
      relayAdaptContract.address, // Withdraw to relay contract.
      encryptionKey,
      undefined, // memoText
      withdrawTokenAmounts,
      relayerRailgunAddress,
      relayerFeeTokenAmount,
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
      toWalletAddress: railgunWalletAddress,
      railgunWalletID,
      memoText: undefined,
      tokenAmounts: withdrawTokenAmounts,
      relayAdaptDepositTokenAddresses: depositTokenAddresses,
      crossContractCallsSerialized,
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
