import {
  RailgunPopulateTransactionResponse,
  RailgunProveTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  RailgunERC20Amount,
  TransactionGasDetailsSerialized,
  NetworkName,
  NETWORK_CONFIG,
  ProofType,
  TransactionReceiptLog,
  FeeTokenDetails,
  deserializeTransaction,
  serializeUnsignedTransaction,
  RailgunERC20AmountRecipient,
  RailgunNFTAmountRecipient,
  RailgunNFTAmount,
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
  NFTTokenData,
  formatToByteLength,
  ByteLength,
} from '@railgun-community/engine';
import { fullWalletForID } from '../railgun/core/engine';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import { gasEstimateResponseIterativeRelayerFee } from './tx-gas-relayer-fee-estimator';
import { reportAndSanitizeError } from '../../utils/error';

const createPopulatedCrossContractCalls = (
  crossContractCallsSerialized: string[],
  networkName: NetworkName,
): PopulatedTransaction[] => {
  if (!crossContractCallsSerialized.length) {
    throw new Error('No cross contract calls in transaction.');
  }
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
    reportAndSanitizeError(err);
    throw new Error('Invalid cross contract calls.');
  }
};

export const createRelayAdaptUnshieldERC20AmountRecipients = (
  networkName: NetworkName,
  unshieldERC20Amounts: RailgunERC20Amount[],
): RailgunERC20AmountRecipient[] => {
  const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);
  const unshieldERC20AmountRecipients: RailgunERC20AmountRecipient[] =
    unshieldERC20Amounts.map(unshieldERC20Amount => ({
      ...unshieldERC20Amount,
      recipientAddress: relayAdaptContract.address,
    }));
  return unshieldERC20AmountRecipients;
};

export const createRelayAdaptUnshieldNFTAmountRecipients = (
  networkName: NetworkName,
  unshieldNFTAmounts: RailgunNFTAmount[],
): RailgunNFTAmountRecipient[] => {
  const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);
  const unshieldNFTAmountRecipients: RailgunNFTAmountRecipient[] =
    unshieldNFTAmounts.map(unshieldNFTAmount => ({
      ...unshieldNFTAmount,
      recipientAddress: relayAdaptContract.address,
    }));
  return unshieldNFTAmountRecipients;
};

export const createNFTTokenDataFromRailgunNFTAmount = (
  nftAmount: RailgunNFTAmount,
): NFTTokenData => {
  return {
    tokenAddress: formatToByteLength(
      nftAmount.nftAddress,
      ByteLength.Address,
      true,
    ),
    tokenType: nftAmount.nftTokenType as 1 | 2,
    tokenSubID: formatToByteLength(
      nftAmount.tokenSubID,
      ByteLength.UINT_256,
      true,
    ),
  };
};

const createRelayAdaptShieldNFTsTokenData = (
  relayAdaptShieldNFTs: RailgunNFTAmount[],
): NFTTokenData[] => {
  return relayAdaptShieldNFTs.map(createNFTTokenDataFromRailgunNFTAmount);
};

export const populateProvedCrossContractCalls = async (
  networkName: NetworkName,
  railgunWalletID: string,
  relayAdaptUnshieldERC20Amounts: RailgunERC20Amount[],
  relayAdaptUnshieldNFTAmounts: RailgunNFTAmount[],
  relayAdaptShieldERC20Addresses: string[],
  relayAdaptShieldNFTs: RailgunNFTAmount[],
  crossContractCallsSerialized: string[],
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
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
      [], // erc20AmountRecipients
      [], // nftAmountRecipients
      relayAdaptUnshieldERC20Amounts,
      relayAdaptUnshieldNFTAmounts,
      relayAdaptShieldERC20Addresses,
      relayAdaptShieldNFTs,
      crossContractCallsSerialized,
      relayerFeeERC20AmountRecipient,
      sendWithPublicWallet,
      overallBatchMinGasPrice,
      gasDetailsSerialized,
    );
    delete populatedTransaction.from;

    return {
      serializedTransaction: serializeUnsignedTransaction(populatedTransaction),
    };
  } catch (err) {
    const sanitizedError = reportAndSanitizeError(err);
    const railResponse: RailgunPopulateTransactionResponse = {
      error: sanitizedError.message,
    };
    return railResponse;
  }
};

export const gasEstimateForUnprovenCrossContractCalls = async (
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  relayAdaptUnshieldERC20Amounts: RailgunERC20Amount[],
  relayAdaptUnshieldNFTAmounts: RailgunNFTAmount[],
  relayAdaptShieldERC20Addresses: string[],
  relayAdaptShieldNFTs: RailgunNFTAmount[],
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

    const relayAdaptUnshieldERC20AmountRecipients: RailgunERC20AmountRecipient[] =
      createRelayAdaptUnshieldERC20AmountRecipients(
        networkName,
        relayAdaptUnshieldERC20Amounts,
      );
    const relayAdaptUnshieldNFTAmountRecipients: RailgunNFTAmountRecipient[] =
      createRelayAdaptUnshieldNFTAmountRecipients(
        networkName,
        relayAdaptUnshieldNFTAmounts,
      );

    const relayAdaptShieldNFTsTokenData: NFTTokenData[] =
      createRelayAdaptShieldNFTsTokenData(relayAdaptShieldNFTs);

    const shieldRandom = randomHex(16);
    const relayShieldRequests =
      await RelayAdaptHelper.generateRelayShieldRequests(
        wallet,
        shieldRandom,
        relayAdaptShieldERC20Addresses,
        relayAdaptShieldNFTsTokenData,
      );

    // Add 40% to the gas fee to ensure that it's successful.
    // The final gas estimate changes depending on the Relayer Fee, which can impact the number of circuit inputs.
    // TODO: Replace this after Callback Upgrade made to Relay Adapt contract.
    const multiplierBasisPoints = 14000;

    const response = await gasEstimateResponseIterativeRelayerFee(
      (relayerFeeERC20Amount: Optional<RailgunERC20Amount>) =>
        generateDummyProofTransactions(
          ProofType.CrossContractCalls,
          networkName,
          railgunWalletID,
          encryptionKey,
          false, // showSenderAddressToRecipient
          undefined, // memoText
          relayAdaptUnshieldERC20AmountRecipients,
          relayAdaptUnshieldNFTAmountRecipients,
          relayerFeeERC20Amount,
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
      relayAdaptUnshieldERC20AmountRecipients,
      originalGasDetailsSerialized,
      feeTokenDetails,
      sendWithPublicWallet,
      multiplierBasisPoints,
    );
    return response;
  } catch (err) {
    const sanitizedError = reportAndSanitizeError(err);
    const railResponse: RailgunTransactionGasEstimateResponse = {
      error: sanitizedError.message,
    };
    return railResponse;
  }
};

export const generateCrossContractCallsProof = async (
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  relayAdaptUnshieldERC20Amounts: RailgunERC20Amount[],
  relayAdaptUnshieldNFTAmounts: RailgunNFTAmount[],
  relayAdaptShieldERC20Addresses: string[],
  relayAdaptShieldNFTs: RailgunNFTAmount[],
  crossContractCallsSerialized: string[],
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
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

    const relayAdaptUnshieldERC20AmountRecipients: RailgunERC20AmountRecipient[] =
      createRelayAdaptUnshieldERC20AmountRecipients(
        networkName,
        relayAdaptUnshieldERC20Amounts,
      );
    const relayAdaptUnshieldNFTAmountRecipients: RailgunNFTAmountRecipient[] =
      createRelayAdaptUnshieldNFTAmountRecipients(
        networkName,
        relayAdaptUnshieldNFTAmounts,
      );

    // Generate dummy txs for relay adapt params.
    const dummyUnshieldTxs = await generateDummyProofTransactions(
      ProofType.CrossContractCalls,
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

    // Generate relay adapt params from dummy transactions.
    const shieldRandom = randomHex(16);

    const relayAdaptShieldNFTsTokenData: NFTTokenData[] =
      createRelayAdaptShieldNFTsTokenData(relayAdaptShieldNFTs);

    const relayShieldRequests =
      await RelayAdaptHelper.generateRelayShieldRequests(
        wallet,
        shieldRandom,
        relayAdaptShieldERC20Addresses,
        relayAdaptShieldNFTsTokenData,
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
      relayAdaptUnshieldERC20AmountRecipients,
      relayAdaptUnshieldNFTAmountRecipients,
      relayerFeeERC20AmountRecipient,
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
      erc20AmountRecipients: [],
      nftAmountRecipients: [],
      relayAdaptUnshieldERC20Amounts,
      relayAdaptUnshieldNFTAmounts,
      relayAdaptShieldERC20Addresses,
      relayAdaptShieldNFTs,
      crossContractCallsSerialized,
      relayerFeeERC20AmountRecipient,
      sendWithPublicWallet,
      populatedTransaction,
      overallBatchMinGasPrice,
    });
    return {};
  } catch (err) {
    const sanitizedError = reportAndSanitizeError(err);
    const railResponse: RailgunProveTransactionResponse = {
      error: sanitizedError.message,
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
    reportAndSanitizeError(err);
    throw err;
  }
};
