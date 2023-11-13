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
  hexlify,
  randomHex,
  NFTTokenData,
  formatToByteLength,
  ByteLength,
  MINIMUM_RELAY_ADAPT_CROSS_CONTRACT_CALLS_GAS_LIMIT_V2,
  RelayAdaptShieldNFTRecipient,
  TransactionStructV2,
  TransactionStructV3,
  RailgunVersionedSmartContracts,
} from '@railgun-community/engine';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import { gasEstimateResponseDummyProofIterativeRelayerFee } from './tx-gas-relayer-fee-estimator';
import { reportAndSanitizeError } from '../../utils/error';
import { ContractTransaction } from 'ethers';

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
    RailgunVersionedSmartContracts.getRelayAdaptContract(txidVersion, chain);
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
    RailgunVersionedSmartContracts.getRelayAdaptContract(txidVersion, chain);
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
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
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
        relayerFeeERC20AmountRecipient,
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
    switch (txidVersion) {
      case TXIDVersion.V2_PoseidonMerkle:
        return gasEstimateForUnprovenCrossContractCallsV2(
          networkName,
          railgunWalletID,
          encryptionKey,
          relayAdaptUnshieldERC20Amounts,
          relayAdaptUnshieldNFTAmounts,
          relayAdaptShieldERC20Recipients,
          relayAdaptShieldNFTRecipients,
          crossContractCalls,
          originalGasDetails,
          feeTokenDetails,
          sendWithPublicWallet,
          minGasLimit,
        );
      case TXIDVersion.V3_PoseidonMerkle:
        return gasEstimateForUnprovenCrossContractCallsV3(
          networkName,
          railgunWalletID,
          encryptionKey,
          relayAdaptUnshieldERC20Amounts,
          relayAdaptUnshieldNFTAmounts,
          relayAdaptShieldERC20Recipients,
          relayAdaptShieldNFTRecipients,
          crossContractCalls,
          originalGasDetails,
          feeTokenDetails,
          sendWithPublicWallet,
          minGasLimit,
        );
    }
  } catch (err) {
    throw reportAndSanitizeError(
      gasEstimateForUnprovenCrossContractCalls.name,
      err,
    );
  }
};

const gasEstimateForUnprovenCrossContractCallsV2 = async (
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
  const txidVersion = TXIDVersion.V2_PoseidonMerkle;

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

  const shieldRandom = randomHex(16);
  const relayShieldRequests =
    await RelayAdaptHelper.generateRelayShieldRequests(
      shieldRandom,
      relayAdaptShieldERC20Recipients,
      createRelayAdaptShieldNFTRecipients(relayAdaptShieldNFTRecipients),
    );

  const minimumGasLimit =
    minGasLimit ?? MINIMUM_RELAY_ADAPT_CROSS_CONTRACT_CALLS_GAS_LIMIT_V2;

  const response = await gasEstimateResponseDummyProofIterativeRelayerFee(
    (relayerFeeERC20Amount: Optional<RailgunERC20Amount>) =>
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
        relayerFeeERC20Amount,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
        [], // crossContractCallsV3 - unused for V2
      ),
    async (txs: (TransactionStructV2 | TransactionStructV3)[]) => {
      const relayAdaptParamsRandom = randomHex(31);

      // TODO: We should add the relay adapt contract gas limit here.
      const transaction =
        await RailgunVersionedSmartContracts.populateV2CrossContractCalls(
          txidVersion,
          chain,
          txs,
          validCrossContractCalls,
          relayShieldRequests,
          relayAdaptParamsRandom,
          true, // isGasEstimate
          !sendWithPublicWallet, // isRelayerTransaction
          minimumGasLimit,
        );
      // Remove gasLimit, we'll set to the minimum below.
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

  // If gas estimate is under the cross-contract-minimum, replace it with the minimum.
  if (response.gasEstimate) {
    if (response.gasEstimate < minimumGasLimit) {
      response.gasEstimate = minimumGasLimit;
    }
  }

  return response;
};

const gasEstimateForUnprovenCrossContractCallsV3 = async (
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  relayAdaptUnshieldERC20Amounts: RailgunERC20Amount[],
  relayAdaptUnshieldNFTAmounts: RailgunNFTAmount[],
  relayAdaptShieldERC20Recipients: RailgunERC20Recipient[], // TODO-V3: Add the shield recipients for V3 after Relay Adapt contract is finished.
  relayAdaptShieldNFTRecipients: RailgunNFTAmountRecipient[],
  crossContractCalls: ContractTransaction[],
  originalGasDetails: TransactionGasDetails,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
  minGasLimit: Optional<bigint>, // Unused for V3?
): Promise<RailgunTransactionGasEstimateResponse> => {
  const txidVersion = TXIDVersion.V3_PoseidonMerkle;

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

  const response = await gasEstimateResponseDummyProofIterativeRelayerFee(
    (relayerFeeERC20Amount: Optional<RailgunERC20Amount>) =>
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
        relayerFeeERC20Amount,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
        validCrossContractCalls, // crossContractCallsV3
      ),
    async (txs: (TransactionStructV2 | TransactionStructV3)[]) => {
      const transaction = await RailgunVersionedSmartContracts.generateTransact(
        txidVersion,
        chain,
        txs,
      );
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

  return response;
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
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  minGasLimit: Optional<bigint>,
  progressCallback: GenerateTransactionsProgressCallback,
): Promise<void> => {
  try {
    setCachedProvedTransaction(undefined);

    switch (txidVersion) {
      case TXIDVersion.V2_PoseidonMerkle:
        return generateCrossContractCallsProofV2(
          networkName,
          railgunWalletID,
          encryptionKey,
          relayAdaptUnshieldERC20Amounts,
          relayAdaptUnshieldNFTAmounts,
          relayAdaptShieldERC20Recipients,
          relayAdaptShieldNFTRecipients,
          crossContractCalls,
          relayerFeeERC20AmountRecipient,
          sendWithPublicWallet,
          overallBatchMinGasPrice,
          minGasLimit,
          progressCallback,
        );
      case TXIDVersion.V3_PoseidonMerkle:
        return generateCrossContractCallsProofV3(
          networkName,
          railgunWalletID,
          encryptionKey,
          relayAdaptUnshieldERC20Amounts,
          relayAdaptUnshieldNFTAmounts,
          relayAdaptShieldERC20Recipients,
          relayAdaptShieldNFTRecipients,
          crossContractCalls,
          relayerFeeERC20AmountRecipient,
          sendWithPublicWallet,
          overallBatchMinGasPrice,
          minGasLimit,
          progressCallback,
        );
    }
  } catch (err) {
    throw reportAndSanitizeError(generateCrossContractCallsProof.name, err);
  }
};

const generateCrossContractCallsProofV2 = async (
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  relayAdaptUnshieldERC20Amounts: RailgunERC20Amount[],
  relayAdaptUnshieldNFTAmounts: RailgunNFTAmount[],
  relayAdaptShieldERC20Recipients: RailgunERC20Recipient[],
  relayAdaptShieldNFTRecipients: RailgunNFTAmountRecipient[],
  crossContractCalls: ContractTransaction[],
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  minGasLimit: Optional<bigint>,
  progressCallback: GenerateTransactionsProgressCallback,
) => {
  const txidVersion = TXIDVersion.V2_PoseidonMerkle;

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
    relayerFeeERC20AmountRecipient,
    sendWithPublicWallet,
    overallBatchMinGasPrice,
    [], // crossContractCallsV3 - unused for V2
  );

  // Generate relay adapt params from dummy transactions.
  const shieldRandom = randomHex(16);

  const relayShieldRequests =
    await RelayAdaptHelper.generateRelayShieldRequests(
      shieldRandom,
      relayAdaptShieldERC20Recipients,
      createRelayAdaptShieldNFTRecipients(relayAdaptShieldNFTRecipients),
    );

  const minimumGasLimit =
    minGasLimit ?? MINIMUM_RELAY_ADAPT_CROSS_CONTRACT_CALLS_GAS_LIMIT_V2;

  const { chain } = NETWORK_CONFIG[networkName];

  const isRelayerTransaction = !sendWithPublicWallet;
  const relayAdaptParamsRandom = randomHex(31);
  const relayAdaptParams =
    await RailgunVersionedSmartContracts.getRelayAdaptV2ParamsCrossContractCalls(
      txidVersion,
      chain,
      dummyUnshieldTxs,
      validCrossContractCalls,
      relayShieldRequests,
      relayAdaptParamsRandom,
      isRelayerTransaction,
      minimumGasLimit,
    );
  const relayAdaptContract =
    RailgunVersionedSmartContracts.getRelayAdaptContract(txidVersion, chain);
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
      relayerFeeERC20AmountRecipient,
      sendWithPublicWallet,
      relayAdaptID,
      false, // useDummyProof
      overallBatchMinGasPrice,
      progressCallback,
      [], // crossContractCallsV3
    );

  const nullifiers = nullifiersForTransactions(provedTransactions);

  const transaction =
    await RailgunVersionedSmartContracts.populateV2CrossContractCalls(
      txidVersion,
      chain,
      provedTransactions,
      validCrossContractCalls,
      relayShieldRequests,
      relayAdaptParamsRandom,
      false, // isGasEstimate
      isRelayerTransaction,
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
    relayerFeeERC20AmountRecipient,
    sendWithPublicWallet,
    transaction,
    preTransactionPOIsPerTxidLeafPerList,
    overallBatchMinGasPrice,
    nullifiers,
  });
};

const generateCrossContractCallsProofV3 = async (
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  relayAdaptUnshieldERC20Amounts: RailgunERC20Amount[],
  relayAdaptUnshieldNFTAmounts: RailgunNFTAmount[],
  relayAdaptShieldERC20Recipients: RailgunERC20Recipient[],
  relayAdaptShieldNFTRecipients: RailgunNFTAmountRecipient[],
  crossContractCalls: ContractTransaction[],
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  minGasLimit: Optional<bigint>, // Unused for V3?
  progressCallback: GenerateTransactionsProgressCallback,
) => {
  const txidVersion = TXIDVersion.V3_PoseidonMerkle;

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

  const { chain } = NETWORK_CONFIG[networkName];

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
      relayerFeeERC20AmountRecipient,
      sendWithPublicWallet,
      undefined, // relayAdaptID
      false, // useDummyProof
      overallBatchMinGasPrice,
      progressCallback,
      crossContractCalls,
    );

  const nullifiers = nullifiersForTransactions(provedTransactions);

  const transaction = await RailgunVersionedSmartContracts.generateTransact(
    txidVersion,
    chain,
    provedTransactions,
  );

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
    relayerFeeERC20AmountRecipient,
    sendWithPublicWallet,
    transaction,
    preTransactionPOIsPerTxidLeafPerList,
    overallBatchMinGasPrice,
    nullifiers,
  });
};

export const getRelayAdaptTransactionError = (
  txidVersion: TXIDVersion,
  receiptLogs: TransactionReceiptLog[],
  // receiptLogs: TransactionReceiptLog[] | readonly Log[],
): Optional<string> => {
  try {
    const relayAdaptError =
      RailgunVersionedSmartContracts.getRelayAdaptCallError(
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
      RailgunVersionedSmartContracts.parseRelayAdaptReturnValue(
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
