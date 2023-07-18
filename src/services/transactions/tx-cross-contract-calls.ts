import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  RailgunERC20Amount,
  NetworkName,
  ProofType,
  TransactionReceiptLog,
  FeeTokenDetails,
  RailgunERC20AmountRecipient,
  RailgunNFTAmountRecipient,
  RailgunNFTAmount,
  TransactionGasDetails,
  isDefined,
} from '@railgun-community/shared-models';
import { getRelayAdaptContractForNetwork } from '../railgun/core/providers';
import {
  generateDummyProofTransactions,
  generateProofTransactions,
  nullifiersForTransactions,
} from './tx-generator';
import {
  populateProvedTransaction,
  setCachedProvedTransaction,
} from './proof-cache';
import { sendErrorMessage } from '../../utils/logger';
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
  MINIMUM_RELAY_ADAPT_CROSS_CONTRACT_CALLS_GAS_LIMIT,
} from '@railgun-community/engine';
import { fullWalletForID } from '../railgun/core/engine';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import { gasEstimateResponseDummyProofIterativeRelayerFee } from './tx-gas-relayer-fee-estimator';
import { reportAndSanitizeError } from '../../utils/error';
import { ContractTransaction, Log } from 'ethers';

const createValidCrossContractCalls = (
  crossContractCalls: ContractTransaction[],
): ContractTransaction[] => {
  if (!crossContractCalls.length) {
    throw new Error('No cross contract calls in transaction.');
  }
  try {
    return crossContractCalls.map(transactionRequest => {
      if (!transactionRequest.to || !transactionRequest.data) {
        throw new Error(`Cross-contract calls require 'to' and 'data' fields.`);
      }
      const transaction: ContractTransaction = {
        to: transactionRequest.to,
        value: transactionRequest.value,
        data: hexlify(transactionRequest.data, true),
      };
      assertNotBlockedAddress(transaction.to);
      return transaction;
    });
  } catch (err) {
    if (!(err instanceof Error)) {
      throw err;
    }
    throw reportAndSanitizeError(createValidCrossContractCalls.name, err);
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
  crossContractCalls: ContractTransaction[],
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  gasDetails: TransactionGasDetails,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const { transaction, nullifiers } = await populateProvedTransaction(
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
      crossContractCalls,
      relayerFeeERC20AmountRecipient,
      sendWithPublicWallet,
      overallBatchMinGasPrice,
      gasDetails,
    );
    delete transaction.from;

    return {
      nullifiers,
      transaction,
    };
  } catch (err) {
    throw reportAndSanitizeError(populateProvedCrossContractCalls.name, err);
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
  crossContractCalls: ContractTransaction[],
  originalGasDetails: TransactionGasDetails,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    const wallet = fullWalletForID(railgunWalletID);

    setCachedProvedTransaction(undefined);

    const overallBatchMinGasPrice = 0n;

    const validCrossContractCalls =
      createValidCrossContractCalls(crossContractCalls);

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

    const response = await gasEstimateResponseDummyProofIterativeRelayerFee(
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
      async (txs: TransactionStruct[]) => {
        const relayAdaptParamsRandom = randomHex(31);

        // TODO: We should add the relay adapt contract gas limit here.
        const transaction = await relayAdaptContract.populateCrossContractCalls(
          txs,
          validCrossContractCalls,
          relayShieldRequests,
          relayAdaptParamsRandom,
          true, // isGasEstimate
          !sendWithPublicWallet, // isRelayerTransaction
        );
        // Remove gasLimit, we'll set to the minimum below.
        // TODO: Remove after callbacks upgrade.
        delete transaction.gasLimit;
        return transaction;
      },
      networkName,
      railgunWalletID,
      relayAdaptUnshieldERC20AmountRecipients,
      originalGasDetails,
      feeTokenDetails,
      sendWithPublicWallet,
      true, // isCrossContractCall
    );

    // TODO: Remove this after callbacks upgrade.
    // If gas estimate is under the cross-contract-minimum, replace it with the minimum.
    if (response.gasEstimate) {
      const minimum = MINIMUM_RELAY_ADAPT_CROSS_CONTRACT_CALLS_GAS_LIMIT;
      if (response.gasEstimate < minimum) {
        response.gasEstimate = minimum;
      }
    }

    return response;
  } catch (err) {
    throw reportAndSanitizeError(
      gasEstimateForUnprovenCrossContractCalls.name,
      err,
    );
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
  crossContractCalls: ContractTransaction[],
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  progressCallback: ProverProgressCallback,
): Promise<void> => {
  try {
    const wallet = fullWalletForID(railgunWalletID);

    setCachedProvedTransaction(undefined);

    const validCrossContractCalls =
      createValidCrossContractCalls(crossContractCalls);

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

    const isRelayerTransaction = !sendWithPublicWallet;
    const relayAdaptParamsRandom = randomHex(31);
    const relayAdaptParams =
      await relayAdaptContract.getRelayAdaptParamsCrossContractCalls(
        dummyUnshieldTxs,
        validCrossContractCalls,
        relayShieldRequests,
        relayAdaptParamsRandom,
        isRelayerTransaction,
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

    const nullifiers = nullifiersForTransactions(transactions);

    const transaction = await relayAdaptContract.populateCrossContractCalls(
      transactions,
      validCrossContractCalls,
      relayShieldRequests,
      relayAdaptParamsRandom,
      false, // isGasEstimate
      isRelayerTransaction,
    );
    delete transaction.from;

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
      crossContractCalls: validCrossContractCalls,
      relayerFeeERC20AmountRecipient,
      sendWithPublicWallet,
      transaction,
      overallBatchMinGasPrice,
      nullifiers,
    });
  } catch (err) {
    throw reportAndSanitizeError(generateCrossContractCallsProof.name, err);
  }
};

export const getRelayAdaptTransactionError = (
  receiptLogs: TransactionReceiptLog[] | readonly Log[],
): Optional<string> => {
  try {
    const relayAdaptError =
      RelayAdaptContract.getRelayAdaptCallError(receiptLogs);
    if (isDefined(relayAdaptError)) {
      sendErrorMessage(relayAdaptError);
      return relayAdaptError;
    }
    return undefined;
  } catch (err) {
    throw reportAndSanitizeError(getRelayAdaptTransactionError.name, err);
  }
};

export const parseRelayAdaptReturnValue = (data: string): Optional<string> => {
  try {
    const relayAdaptErrorParsed =
      RelayAdaptContract.parseRelayAdaptReturnValue(data);
    if (relayAdaptErrorParsed) {
      sendErrorMessage(relayAdaptErrorParsed.error);
      return relayAdaptErrorParsed.error;
    }
    return undefined;
  } catch (err) {
    throw reportAndSanitizeError(getRelayAdaptTransactionError.name, err);
  }
};
