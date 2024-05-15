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
  RailgunERC20Recipient,
  TXIDVersion,
  NETWORK_CONFIG,
} from '@railgun-community/shared-models';
import {
  GenerateTransactionsProgressCallback,
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
  NFTTokenData,
  ByteUtils,
  ByteLength,
  MINIMUM_RELAY_ADAPT_CROSS_CONTRACT_CALLS_GAS_LIMIT_V2,
  RelayAdaptShieldNFTRecipient,
  TransactionStructV2,
  TransactionStructV3,
  RelayAdaptVersionedSmartContracts,
} from '@railgun-community/engine';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import { gasEstimateResponseDummyProofIterativeBroadcasterFee } from './tx-gas-broadcaster-fee-estimator';
import { reportAndSanitizeError } from '../../utils/error';
import { ContractTransaction } from 'ethers';
import { isDecimalStr } from '../../utils';
import { bigIntStringToHex } from '../railgun/quick-sync/shared-formatters';

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
        data: ByteUtils.hexlify(transactionRequest.data, true),
      };
      assertNotBlockedAddress(transaction.to);
      return transaction;
    });
  } catch (cause) {
    if (!(cause instanceof Error)) {
      throw new Error('Non-error thrown from createValidCrossContractCalls', {
        cause,
      });
    }
    throw reportAndSanitizeError(createValidCrossContractCalls.name, cause);
  }
};

export const createRelayAdaptUnshieldERC20AmountRecipients = (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  unshieldERC20Amounts: RailgunERC20Amount[],
): RailgunERC20AmountRecipient[] => {
  const chain = NETWORK_CONFIG[networkName].chain;
  const relayAdaptContract =
    RelayAdaptVersionedSmartContracts.getRelayAdaptContract(txidVersion, chain);
  const unshieldERC20AmountRecipients: RailgunERC20AmountRecipient[] =
    unshieldERC20Amounts.map(unshieldERC20Amount => ({
      ...unshieldERC20Amount,
      recipientAddress: relayAdaptContract.address,
    }));
  return unshieldERC20AmountRecipients;
};

export const createRelayAdaptUnshieldNFTAmountRecipients = (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  unshieldNFTAmounts: RailgunNFTAmount[],
): RailgunNFTAmountRecipient[] => {
  const chain = NETWORK_CONFIG[networkName].chain;
  const relayAdaptContract =
    RelayAdaptVersionedSmartContracts.getRelayAdaptContract(txidVersion, chain);
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
  const tokenSubIDHex = isDecimalStr(nftAmount.tokenSubID)
    ? bigIntStringToHex(nftAmount.tokenSubID)
    : nftAmount.tokenSubID;

  return {
    tokenAddress: ByteUtils.formatToByteLength(
      nftAmount.nftAddress,
      ByteLength.Address,
      true,
    ),
    tokenType: nftAmount.nftTokenType as 1 | 2,
    tokenSubID: ByteUtils.formatToByteLength(
      tokenSubIDHex,
      ByteLength.UINT_256,
      true,
    ),
  };
};

const createRelayAdaptShieldNFTRecipients = (
  relayAdaptShieldNFTRecipients: RailgunNFTAmountRecipient[],
): RelayAdaptShieldNFTRecipient[] => {
  return relayAdaptShieldNFTRecipients.map(
    (nftRecipient: RailgunNFTAmountRecipient) => ({
      nftTokenData: createNFTTokenDataFromRailgunNFTAmount(nftRecipient),
      recipientAddress: nftRecipient.recipientAddress,
    }),
  );
};

export const populateProvedCrossContractCalls = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  relayAdaptUnshieldERC20Amounts: RailgunERC20Amount[],
  relayAdaptUnshieldNFTAmounts: RailgunNFTAmount[],
  relayAdaptShieldERC20Recipients: RailgunERC20Recipient[],
  relayAdaptShieldNFTRecipients: RailgunNFTAmountRecipient[],
  crossContractCalls: ContractTransaction[],
  broadcasterFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  gasDetails: TransactionGasDetails,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const { transaction, nullifiers, preTransactionPOIsPerTxidLeafPerList } =
      await populateProvedTransaction(
        txidVersion,
        networkName,
        ProofType.CrossContractCalls,
        railgunWalletID,
        false, // showSenderAddressToRecipient
        undefined, // memoText
        [], // erc20AmountRecipients
        [], // nftAmountRecipients
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        relayAdaptShieldERC20Recipients,
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
        gasDetails,
      );
    delete transaction.from;

    return {
      nullifiers,
      transaction,
      preTransactionPOIsPerTxidLeafPerList,
    };
  } catch (err) {
    throw reportAndSanitizeError(populateProvedCrossContractCalls.name, err);
  }
};

export const gasEstimateForUnprovenCrossContractCalls = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  relayAdaptUnshieldERC20Amounts: RailgunERC20Amount[],
  relayAdaptUnshieldNFTAmounts: RailgunNFTAmount[],
  relayAdaptShieldERC20Recipients: RailgunERC20Recipient[],
  relayAdaptShieldNFTRecipients: RailgunNFTAmountRecipient[],
  crossContractCalls: ContractTransaction[],
  originalGasDetails: TransactionGasDetails,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
  minGasLimit: Optional<bigint>,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    setCachedProvedTransaction(undefined);

    const overallBatchMinGasPrice = 0n;

    const validCrossContractCalls =
      createValidCrossContractCalls(crossContractCalls);

    const chain = NETWORK_CONFIG[networkName].chain;

    const relayAdaptUnshieldERC20AmountRecipients: RailgunERC20AmountRecipient[] =
      createRelayAdaptUnshieldERC20AmountRecipients(
        txidVersion,
        networkName,
        relayAdaptUnshieldERC20Amounts,
      );
    const relayAdaptUnshieldNFTAmountRecipients: RailgunNFTAmountRecipient[] =
      createRelayAdaptUnshieldNFTAmountRecipients(
        txidVersion,
        networkName,
        relayAdaptUnshieldNFTAmounts,
      );

    const shieldRandom = ByteUtils.randomHex(16);
    const relayShieldRequests =
      await RelayAdaptHelper.generateRelayShieldRequests(
        shieldRandom,
        relayAdaptShieldERC20Recipients,
        createRelayAdaptShieldNFTRecipients(relayAdaptShieldNFTRecipients),
      );

    // TODO-V3: Needs modification
    const minimumGasLimit =
      minGasLimit ?? MINIMUM_RELAY_ADAPT_CROSS_CONTRACT_CALLS_GAS_LIMIT_V2;

    const response = await gasEstimateResponseDummyProofIterativeBroadcasterFee(
      (broadcasterFeeERC20Amount: Optional<RailgunERC20Amount>) =>
        generateDummyProofTransactions(
          ProofType.CrossContractCalls,
          networkName,
          railgunWalletID,
          txidVersion,
          encryptionKey,
          false, // showSenderAddressToRecipient
          undefined, // memoText
          relayAdaptUnshieldERC20AmountRecipients,
          relayAdaptUnshieldNFTAmountRecipients,
          broadcasterFeeERC20Amount,
          sendWithPublicWallet,
          overallBatchMinGasPrice,
        ),
      async (txs: (TransactionStructV2 | TransactionStructV3)[]) => {
        const relayAdaptParamsRandom = ByteUtils.randomHex(31);

        // TODO: We should add the relay adapt contract gas limit here.
        const transaction =
          await RelayAdaptVersionedSmartContracts.populateCrossContractCalls(
            txidVersion,
            chain,
            txs,
            validCrossContractCalls,
            relayShieldRequests,
            relayAdaptParamsRandom,
            true, // isGasEstimate
            !sendWithPublicWallet, // isBroadcasterTransaction
            minimumGasLimit,
          );
        // Remove gasLimit, we'll set to the minimum below.
        // TODO: Remove after callbacks upgrade.
        delete transaction.gasLimit;
        return transaction;
      },
      txidVersion,
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
      if (response.gasEstimate < minimumGasLimit) {
        response.gasEstimate = minimumGasLimit;
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
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  relayAdaptUnshieldERC20Amounts: RailgunERC20Amount[],
  relayAdaptUnshieldNFTAmounts: RailgunNFTAmount[],
  relayAdaptShieldERC20Recipients: RailgunERC20Recipient[],
  relayAdaptShieldNFTRecipients: RailgunNFTAmountRecipient[],
  crossContractCalls: ContractTransaction[],
  broadcasterFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  minGasLimit: Optional<bigint>,
  progressCallback: GenerateTransactionsProgressCallback,
): Promise<void> => {
  try {
    setCachedProvedTransaction(undefined);

    const validCrossContractCalls =
      createValidCrossContractCalls(crossContractCalls);

    const relayAdaptUnshieldERC20AmountRecipients: RailgunERC20AmountRecipient[] =
      createRelayAdaptUnshieldERC20AmountRecipients(
        txidVersion,
        networkName,
        relayAdaptUnshieldERC20Amounts,
      );
    const relayAdaptUnshieldNFTAmountRecipients: RailgunNFTAmountRecipient[] =
      createRelayAdaptUnshieldNFTAmountRecipients(
        txidVersion,
        networkName,
        relayAdaptUnshieldNFTAmounts,
      );

    // Generate dummy txs for relay adapt params.
    const dummyUnshieldTxs = await generateDummyProofTransactions(
      ProofType.CrossContractCalls,
      networkName,
      railgunWalletID,
      txidVersion,
      encryptionKey,
      false, // showSenderAddressToRecipient
      undefined, // memoText
      relayAdaptUnshieldERC20AmountRecipients,
      relayAdaptUnshieldNFTAmountRecipients,
      broadcasterFeeERC20AmountRecipient,
      sendWithPublicWallet,
      overallBatchMinGasPrice,
    );

    // Generate relay adapt params from dummy transactions.
    const shieldRandom = ByteUtils.randomHex(16);

    const relayShieldRequests =
      await RelayAdaptHelper.generateRelayShieldRequests(
        shieldRandom,
        relayAdaptShieldERC20Recipients,
        createRelayAdaptShieldNFTRecipients(relayAdaptShieldNFTRecipients),
      );

    // TODO-V3: Needs modification
    const minimumGasLimit =
      minGasLimit ?? MINIMUM_RELAY_ADAPT_CROSS_CONTRACT_CALLS_GAS_LIMIT_V2;

    const { chain } = NETWORK_CONFIG[networkName];

    const isBroadcasterTransaction = !sendWithPublicWallet;
    const relayAdaptParamsRandom = ByteUtils.randomHex(31);
    const relayAdaptParams =
      await RelayAdaptVersionedSmartContracts.getRelayAdaptParamsCrossContractCalls(
        txidVersion,
        chain,
        dummyUnshieldTxs,
        validCrossContractCalls,
        relayShieldRequests,
        relayAdaptParamsRandom,
        isBroadcasterTransaction,
        minimumGasLimit,
      );
    const relayAdaptContract =
      RelayAdaptVersionedSmartContracts.getRelayAdaptContract(
        txidVersion,
        chain,
      );
    const relayAdaptID: AdaptID = {
      contract: relayAdaptContract.address,
      parameters: relayAdaptParams,
    };

    // Create real transactions with relay adapt params.
    const { provedTransactions, preTransactionPOIsPerTxidLeafPerList } =
      await generateProofTransactions(
        ProofType.CrossContractCalls,
        networkName,
        railgunWalletID,
        txidVersion,
        encryptionKey,
        false, // showSenderAddressToRecipient
        undefined, // memoText
        relayAdaptUnshieldERC20AmountRecipients,
        relayAdaptUnshieldNFTAmountRecipients,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        relayAdaptID,
        false, // useDummyProof
        overallBatchMinGasPrice,
        progressCallback,
      );

    const nullifiers = nullifiersForTransactions(provedTransactions);

    const transaction =
      await RelayAdaptVersionedSmartContracts.populateCrossContractCalls(
        txidVersion,
        chain,
        provedTransactions,
        validCrossContractCalls,
        relayShieldRequests,
        relayAdaptParamsRandom,
        false, // isGasEstimate
        isBroadcasterTransaction,
        minimumGasLimit,
      );
    delete transaction.from;

    setCachedProvedTransaction({
      proofType: ProofType.CrossContractCalls,
      txidVersion,
      railgunWalletID,
      showSenderAddressToRecipient: false,
      memoText: undefined,
      erc20AmountRecipients: [],
      nftAmountRecipients: [],
      relayAdaptUnshieldERC20Amounts,
      relayAdaptUnshieldNFTAmounts,
      relayAdaptShieldERC20Recipients,
      relayAdaptShieldNFTRecipients,
      crossContractCalls: validCrossContractCalls,
      broadcasterFeeERC20AmountRecipient,
      sendWithPublicWallet,
      transaction,
      preTransactionPOIsPerTxidLeafPerList,
      overallBatchMinGasPrice,
      nullifiers,
    });
  } catch (err) {
    throw reportAndSanitizeError(generateCrossContractCallsProof.name, err);
  }
};

export const getRelayAdaptTransactionError = (
  txidVersion: TXIDVersion,
  receiptLogs: TransactionReceiptLog[],
  // receiptLogs: TransactionReceiptLog[] | readonly Log[],
): Optional<string> => {
  try {
    const relayAdaptError =
      RelayAdaptVersionedSmartContracts.getRelayAdaptCallError(
        txidVersion,
        receiptLogs,
      );
    if (isDefined(relayAdaptError)) {
      sendErrorMessage(relayAdaptError);
      return relayAdaptError;
    }
    return undefined;
  } catch (err) {
    throw reportAndSanitizeError(getRelayAdaptTransactionError.name, err);
  }
};

export const parseRelayAdaptReturnValue = (
  txidVersion: TXIDVersion,
  data: string,
): Optional<string> => {
  try {
    const relayAdaptErrorParsed =
      RelayAdaptVersionedSmartContracts.parseRelayAdaptReturnValue(
        txidVersion,
        data,
      );
    if (isDefined(relayAdaptErrorParsed)) {
      sendErrorMessage(relayAdaptErrorParsed.error);
      return relayAdaptErrorParsed.error;
    }
    return undefined;
  } catch (err) {
    throw reportAndSanitizeError(getRelayAdaptTransactionError.name, err);
  }
};
