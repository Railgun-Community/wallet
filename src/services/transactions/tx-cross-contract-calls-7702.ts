import {
  RailgunTransactionGasEstimateResponse,
  RailgunERC20Amount,
  NetworkName,
  ProofType,
  FeeTokenDetails,
  RailgunERC20AmountRecipient,
  RailgunNFTAmountRecipient,
  RailgunNFTAmount,
  TransactionGasDetails,
  RailgunERC20Recipient,
  EVMGasType,
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
  setCachedProvedTransaction,
} from './proof-cache';
import {
  RelayAdaptHelper,
  AdaptID,
  ByteUtils,
  MINIMUM_RELAY_ADAPT_CROSS_CONTRACT_CALLS_GAS_LIMIT_V2,
  TransactionStructV2,
  TransactionStructV3,
  RelayAdapt7702Helper,
  RelayAdapt7702,
  RelayAdapt,
  RelayAdapt__factory as RelayAdaptFactory,
  RelayAdapt7702Request,
  ShieldRequestStruct,
} from '@railgun-community/engine';
import { assertNotBlockedAddress } from '../../utils/blocked-address';

import { gasEstimateResponseDummyProofIterativeBroadcasterFee } from './tx-gas-broadcaster-fee-estimator';
import { reportAndSanitizeError } from '../../utils/error';
import { ContractTransaction } from 'ethers';
import {
  createRelayAdaptShieldNFTRecipients,
} from './tx-cross-contract-calls';
import { getCurrentEphemeralAddress, sign7702Request } from '../railgun/wallets/wallets';
import { encodeRelayAdapt7702Execute } from '../railgun/wallets/relay-adapt-7702-execution';


const createActionData = async (
  validCrossContractCalls: ContractTransaction[],
  relayShieldRequests: ShieldRequestStruct[],
  ephemeralAddress: string,
  requireSuccess: boolean,
  minGasLimit: bigint,
): Promise<RelayAdapt7702.ActionDataStruct> => {
  const calls: ContractTransaction[] = [];

  // Add Cross Contract Calls
  for (const call of validCrossContractCalls) {
    calls.push({
      to: call.to,
      data: call.data,
      value: call.value ?? 0n,
    });
  }

  // Add Shield Call
  if (relayShieldRequests.length > 0) {
    const relayAdaptInterface = RelayAdaptFactory.createInterface();
    const shieldData = relayAdaptInterface.encodeFunctionData('shield', [relayShieldRequests]);
    calls.push({
      to: ephemeralAddress,
      data: shieldData,
      value: 0n,
    });
  }
  return RelayAdapt7702Helper.getActionData(
    requireSuccess,
    calls,
    minGasLimit,
  );
};

// 7702 refactor for cross-contract calls

// todo maybe import this from the og cross-contract call.
const createValidCrossContractCalls = (
  crossContractCalls: ContractTransaction[],
): ContractTransaction[] => {
  if (!crossContractCalls.length) {
    throw new Error('No cross contract calls in transaction.');
  }
  try {
    return crossContractCalls.map(transactionRequest => {
      if (!transactionRequest.to || !transactionRequest.data) {
        throw new Error(
          `Cross-contract calls require to and data fields (7702).`,
        );
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

export const createRelayAdapt7702UnshieldERC20AmountRecipients = (
  unshieldERC20Amounts: RailgunERC20Amount[],
  ephemeralAddress: string,
): RailgunERC20AmountRecipient[] => {
  return unshieldERC20Amounts.map(unshieldERC20Amount => ({
    ...unshieldERC20Amount,
    recipientAddress: ephemeralAddress,
  }));
};

export const createRelayAdapt7702UnshieldNFTAmountRecipients = (
  unshieldNFTAmounts: RailgunNFTAmount[],
  ephemeralAddress: string,
): RailgunNFTAmountRecipient[] => {
  return unshieldNFTAmounts.map(unshieldNFTAmount => ({
    ...unshieldNFTAmount,
    recipientAddress: ephemeralAddress,
  }));
};

export const gasEstimateForUnprovenCrossContractCalls7702 = async (
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
  mnemonicPassword?: string,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    setCachedProvedTransaction(undefined);

    // Broadcaster fee estimation for 7702 must use Type4 fee semantics (maxFeePerGas).
    // Coerce legacy inputs (eg. Type1 + gasPrice) to Type4 where possible.
    const originalGasDetailsType4 = coerceGasDetailsToType4(originalGasDetails);

    const overallBatchMinGasPrice = 0n;

    const validCrossContractCalls =
      createValidCrossContractCalls(crossContractCalls);

    const ephemeralAddress = await getCurrentEphemeralAddress(
      railgunWalletID,
      encryptionKey,
      networkName,
    );

    const relayAdaptUnshieldERC20AmountRecipients =
      createRelayAdapt7702UnshieldERC20AmountRecipients(
        relayAdaptUnshieldERC20Amounts,
        ephemeralAddress,
      );
    const relayAdaptUnshieldNFTAmountRecipients =
      createRelayAdapt7702UnshieldNFTAmountRecipients(
        relayAdaptUnshieldNFTAmounts,
        ephemeralAddress,
      );

    const shieldRandom = ByteUtils.randomHex(16);
    const relayShieldRequests =
      await RelayAdaptHelper.generateRelayShieldRequests(
        shieldRandom,
        relayAdaptShieldERC20Recipients,
        createRelayAdaptShieldNFTRecipients(relayAdaptShieldNFTRecipients),
      );

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
          undefined, // originShieldTxidForSpendabilityOverride
          mnemonicPassword,
        ),
      async (txs: (TransactionStructV2 | TransactionStructV3)[]) => {
        const actionData = await createActionData(
          validCrossContractCalls,
          relayShieldRequests,
          ephemeralAddress,
          false, // requireSuccess
          minimumGasLimit,
        );

        const chainId = NETWORK_CONFIG[networkName].chain.id;
        const { relayAdapt7702Contract } = NETWORK_CONFIG[networkName]
        const transactions = txs as TransactionStructV2[];
        const { authorization, signature, executionDetails } = await sign7702Request(
          railgunWalletID,
          encryptionKey,
          networkName,
          relayAdapt7702Contract,
          BigInt(chainId),
          transactions,
          actionData,
        );

        const data = encodeRelayAdapt7702Execute(
          transactions,
          actionData,
          signature,
          executionDetails,
        );

        const transaction: ContractTransaction = {
          to: ephemeralAddress, // Send to the ephemeral address (which will have code)
          data,
          value: 0n,
          type: 4, // EIP-7702 Transaction Type
          authorizationList: [authorization],
        };
        
        return transaction;
      },
      txidVersion,
      networkName,
      railgunWalletID,
      relayAdaptUnshieldERC20AmountRecipients,
      originalGasDetailsType4,
      feeTokenDetails,
      sendWithPublicWallet,
      true, // isCrossContractCall
    );

    if (response.gasEstimate) {
      if (response.gasEstimate < minimumGasLimit) {
        response.gasEstimate = minimumGasLimit;
      }
    }

    return response;
  } catch (err) {
    throw reportAndSanitizeError(
      gasEstimateForUnprovenCrossContractCalls7702.name,
      err,
    );
  }
};

function coerceGasDetailsToType4(
  gasDetails: TransactionGasDetails,
): TransactionGasDetails {
  if (gasDetails.evmGasType === EVMGasType.Type4) {
    return gasDetails;
  }
  if (gasDetails.evmGasType === EVMGasType.Type2) {
    return {
      ...gasDetails,
      evmGasType: EVMGasType.Type4,
    };
  }
  if ('gasPrice' in gasDetails && gasDetails.gasPrice != null) {
    return {
      evmGasType: EVMGasType.Type4,
      gasEstimate: gasDetails.gasEstimate,
      maxFeePerGas: gasDetails.gasPrice,
      maxPriorityFeePerGas: 0n,
    };
  }
  throw new Error(
    '7702 cross-contract call requires Type4 gas details (maxFeePerGas/maxPriorityFeePerGas).',
  );
}

export const generateCrossContractCallsProof7702 = async (
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
  mnemonicPassword?: string,
): Promise<RelayAdapt7702Request> => {
  try {
    setCachedProvedTransaction(undefined);

    const validCrossContractCalls =
      createValidCrossContractCalls(crossContractCalls);

    const ephemeralAddress = await getCurrentEphemeralAddress(
      railgunWalletID,
      encryptionKey,
      networkName,
    );

    const relayAdaptUnshieldERC20AmountRecipients =
      createRelayAdapt7702UnshieldERC20AmountRecipients(
        relayAdaptUnshieldERC20Amounts,
        ephemeralAddress,
      );
    const relayAdaptUnshieldNFTAmountRecipients =
      createRelayAdapt7702UnshieldNFTAmountRecipients(
        relayAdaptUnshieldNFTAmounts,
        ephemeralAddress,
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
      undefined, // originShieldTxidForSpendabilityOverride
      mnemonicPassword,
    );

    // Generate relay adapt params from dummy transactions.
    const shieldRandom = ByteUtils.randomHex(16);

    const relayShieldRequests =
      await RelayAdaptHelper.generateRelayShieldRequests(
        shieldRandom,
        relayAdaptShieldERC20Recipients,
        createRelayAdaptShieldNFTRecipients(relayAdaptShieldNFTRecipients),
      );

    const minimumGasLimit =
      minGasLimit ?? MINIMUM_RELAY_ADAPT_CROSS_CONTRACT_CALLS_GAS_LIMIT_V2;

    const actionData = await createActionData(
      validCrossContractCalls,
      relayShieldRequests,
      ephemeralAddress,
      false, // requireSuccess
      minimumGasLimit,
    );

    const relayAdaptID: AdaptID = {
      contract: ephemeralAddress,
      parameters: RelayAdapt7702Helper.getZeroAdaptParams(),
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
        undefined, // originShieldTxidForSpendabilityOverride
        mnemonicPassword,
      );

    // Signatures
    const chainId = NETWORK_CONFIG[networkName].chain.id;
    const { relayAdapt7702Contract } = NETWORK_CONFIG[networkName]
    const transactions = provedTransactions as TransactionStructV2[];
    const {
      authorization,
      signature: executionSignature,
      executionDetails,
    } = await sign7702Request(
      railgunWalletID,
      encryptionKey,
      networkName,
      relayAdapt7702Contract,
      BigInt(chainId),
      transactions,
      actionData,
    );

    // Construct the transaction data
    const data = encodeRelayAdapt7702Execute(
      transactions,
      actionData,
      executionSignature,
      executionDetails,
    );

    const transaction: ContractTransaction = {
      to: ephemeralAddress,
      data,
      value: 0n,
      type: 4,
      authorizationList: [authorization],
    };

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
      nullifiers: nullifiersForTransactions(provedTransactions),
    });

    return {
      transactions,
      actionData,
      authorization,
      executionSignature,
      ephemeralAddress,
      executionType: executionDetails.executionType,
      executeNonce: executionDetails.executeNonce,
    };

  } catch (err) {
    throw reportAndSanitizeError(generateCrossContractCallsProof7702.name, err);
  }
};
