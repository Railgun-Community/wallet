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
  RelayAdapt,
  RelayAdapt__factory as RelayAdaptFactory,
  RelayAdapt7702__factory as RelayAdapt7702Factory,
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


const createActionData = async (
  validCrossContractCalls: ContractTransaction[],
  relayShieldRequests: ShieldRequestStruct[],
  ephemeralAddress: string,
  random: string,
  requireSuccess: boolean,
  minGasLimit: bigint,
): Promise<RelayAdapt.ActionDataStruct> => {
  const calls: RelayAdapt.CallStruct[] = [];

  // Add Cross Contract Calls
  for (const call of validCrossContractCalls) {
    calls.push({
      to: call.to ,
      data: call.data ,
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

  return {
    random,
    requireSuccess,
    minGasLimit,
    calls,
  };
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
  relayerContractAddress: string,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    setCachedProvedTransaction(undefined);

    const overallBatchMinGasPrice = 0n;

    const validCrossContractCalls =
      createValidCrossContractCalls(crossContractCalls);

    const ephemeralAddress = await getCurrentEphemeralAddress(
      railgunWalletID,
      encryptionKey,
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
        ),
      async (txs: (TransactionStructV2 | TransactionStructV3)[]) => {
        const relayAdaptParamsRandom = ByteUtils.prefix0x(
          ByteUtils.randomHex(31),
        );

        const actionData = await createActionData(
          validCrossContractCalls,
          relayShieldRequests,
          ephemeralAddress,
          relayAdaptParamsRandom,
          true, // requireSuccess
          minimumGasLimit,
        );

        const chainId = NETWORK_CONFIG[networkName].chain.id;
        const { authorization, signature } = await sign7702Request(
          railgunWalletID,
          encryptionKey,
          relayerContractAddress,
          BigInt(chainId),
          txs as TransactionStructV2[],
          actionData,
        );

        const relayAdapt7702Interface = RelayAdapt7702Factory.createInterface();
        const data = relayAdapt7702Interface.encodeFunctionData(
          'execute((((uint256,uint256),(uint256[2],uint256[2]),(uint256,uint256)),bytes32,bytes32[],bytes32[],(uint16,uint72,uint8,uint64,address,bytes32,(bytes32[4],bytes32,bytes32,bytes,bytes)[]),(bytes32,(uint8,address,uint256),uint120))[],(bytes31,bool,uint256,(address,bytes,uint256)[]),bytes)',
          [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            txs as any, // TransactionStruct[]
            actionData,
            signature,
          ],
        );

        const transaction: ContractTransaction = {
          to: ephemeralAddress, // Send to the ephemeral address (which will have code)
          data,
          value: 0n,
          type: 4, // EIP-7702 Transaction Type
          // @ts-expect-error - Ethers v6 might not have authorizationList in type definition yet
          authorizationList: [authorization],
        };
        
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
  relayerContractAddress: string,
  progressCallback: GenerateTransactionsProgressCallback,
): Promise<RelayAdapt7702Request> => {
  try {
    setCachedProvedTransaction(undefined);

    const validCrossContractCalls =
      createValidCrossContractCalls(crossContractCalls);

    const ephemeralAddress = await getCurrentEphemeralAddress(
      railgunWalletID,
      encryptionKey,
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

    const relayAdaptParamsRandom = ByteUtils.prefix0x(ByteUtils.randomHex(31));

    const actionData = await createActionData(
      validCrossContractCalls,
      relayShieldRequests,
      ephemeralAddress,
      relayAdaptParamsRandom,
      true, // requireSuccess
      minimumGasLimit,
    );

    const relayAdaptParams = RelayAdapt7702Helper.getAdaptParams(
      dummyUnshieldTxs as TransactionStructV2[],
      actionData,
    );

    const relayAdaptID: AdaptID = {
      contract: ephemeralAddress,
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

    // Signatures
    const chainId = NETWORK_CONFIG[networkName].chain.id;
    const { authorization, signature: executionSignature } = await sign7702Request(
      railgunWalletID,
      encryptionKey,
      relayerContractAddress,
      BigInt(chainId),
      provedTransactions as TransactionStructV2[],
      actionData,
    );

    // Construct the transaction data
    const relayAdapt7702Interface = RelayAdapt7702Factory.createInterface();
    const data = relayAdapt7702Interface.encodeFunctionData(
      'execute((((uint256,uint256),(uint256[2],uint256[2]),(uint256,uint256)),bytes32,bytes32[],bytes32[],(uint16,uint72,uint8,uint64,address,bytes32,(bytes32[4],bytes32,bytes32,bytes,bytes)[]),(bytes32,(uint8,address,uint256),uint120))[],(bytes31,bool,uint256,(address,bytes,uint256)[]),bytes)',
      [
        provedTransactions as any,
        actionData,
        executionSignature,
      ],
    );

    const transaction: ContractTransaction = {
      to: ephemeralAddress,
      data,
      value: 0n,
      type: 4,
      // @ts-expect-error - Ethers v6 might not have authorizationList in type definition yet
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
      transactions: provedTransactions as TransactionStructV2[],
      actionData,
      authorization,
      executionSignature,
      ephemeralAddress,
    };

  } catch (err) {
    throw reportAndSanitizeError(generateCrossContractCallsProof7702.name, err);
  }
};
