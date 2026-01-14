import {
  RailgunTransactionGasEstimateResponse,
  EVMGasType,
  calculateGasLimit,
  NetworkName,
  getEVMGasTypeForTransaction,
  CommitmentSummary,
  TransactionGasDetails,
  TXIDVersion,
} from '@railgun-community/shared-models';
import { getFallbackProviderForNetwork } from '../railgun';
import { reportAndSanitizeError } from '../../utils/error';
import {
  GAS_ESTIMATE_VARIANCE_DUMMY_TO_ACTUAL_TRANSACTION,
  RelayAdaptVersionedSmartContracts,
} from '@railgun-community/engine';
import { ContractTransaction } from 'ethers';

export const getGasEstimate = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  transaction: ContractTransaction,
  fromWalletAddress: string,
  sendWithPublicWallet: boolean,
  isCrossContractCall: boolean,
): Promise<bigint> => {
  const evmGasType = getEVMGasTypeForTransaction(
    networkName,
    sendWithPublicWallet,
  );

  // Add 'from' field, which is required, as a mock address.
  // Note that DEPOSIT needs a real address, as it checks the balance for transfer.
  const estimateGasTransactionRequest: ContractTransaction = {
    ...transaction,
    from: fromWalletAddress,
    type: transaction.type === 4 ? 4 : evmGasType,
  };
  if (shouldRemoveGasLimitForL2GasEstimate(networkName)) {
    delete estimateGasTransactionRequest.gasLimit;
  }

  try {
    return estimateGas(
      txidVersion,
      networkName,
      estimateGasTransactionRequest,
      isCrossContractCall,
    );
  } catch (err) {
    throw reportAndSanitizeError(getGasEstimate.name, err);
  }
};

const estimateGas = (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  transaction: ContractTransaction,
  isCrossContractCall: boolean,
): Promise<bigint> => {
  const provider = getFallbackProviderForNetwork(networkName);
  if (isCrossContractCall) {
    // Includes custom error handler for relay-adapt transactions.
    return RelayAdaptVersionedSmartContracts.estimateGasWithErrorHandler(
      txidVersion,
      provider,
      transaction,
    );
  }
  return provider.estimateGas(transaction);
};

/**
 * Gas estimates can fail for relay-adapt transactions on L2s like Arbitrum.
 * This occurs on cross-contract calls (relay-adapt) which have a manual minimum gas limit set by Railgun Engine.
 */
const shouldRemoveGasLimitForL2GasEstimate = (networkName: NetworkName) => {
  switch (networkName) {
    case NetworkName.Arbitrum:
      return true;
    case NetworkName.Ethereum:
    case NetworkName.BNBChain:
    case NetworkName.Polygon:
    case NetworkName.PolygonAmoy:
    case NetworkName.EthereumRopsten_DEPRECATED:
    case NetworkName.EthereumGoerli_DEPRECATED:
    case NetworkName.ArbitrumGoerli_DEPRECATED:
    case NetworkName.PolygonMumbai_DEPRECATED:
    case NetworkName.EthereumSepolia:
    case NetworkName.Hardhat:
    default:
      return false;
  }
};

export const gasEstimateResponse = (
  gasEstimate: bigint,
  broadcasterFeeCommitment: Optional<CommitmentSummary>,
  isGasEstimateWithDummyProof: boolean,
): RailgunTransactionGasEstimateResponse => {
  // TODO: This variance will be different on L2s.
  // However, it's small enough that it shouldn't matter very much.
  const gasEstimateWithDummyProofVariance = isGasEstimateWithDummyProof
    ? gasEstimate + BigInt(GAS_ESTIMATE_VARIANCE_DUMMY_TO_ACTUAL_TRANSACTION)
    : gasEstimate;

  const response: RailgunTransactionGasEstimateResponse = {
    gasEstimate: gasEstimateWithDummyProofVariance,
    broadcasterFeeCommitment,
  };
  return response;
};

export const setGasDetailsForTransaction = (
  networkName: NetworkName,
  transaction: ContractTransaction,
  gasDetails: TransactionGasDetails,
  sendWithPublicWallet: boolean,
) => {
  const { gasEstimate } = gasDetails;

  // eslint-disable-next-line no-param-reassign
  transaction.gasLimit = calculateGasLimit(gasEstimate);

  const evmGasType = getEVMGasTypeForTransaction(
    networkName,
    sendWithPublicWallet,
  );

  const isEIP7702Type4Transaction = transaction.type === 4;

  // EIP-7702 transactions (type 4) must remain type 4 and use EIP-1559-style fee fields.
  // Some callers may still provide legacy gas details; coerce safely where possible.
  const resolvedGasDetails: TransactionGasDetails = isEIP7702Type4Transaction
    ? coerceGasDetailsToType4(gasDetails)
    : gasDetails;

  if (
    resolvedGasDetails.evmGasType !== evmGasType &&
    resolvedGasDetails.evmGasType !== EVMGasType.Type4
  ) {
    const transactionType = sendWithPublicWallet
      ? 'self-signed'
      : 'Broadcaster';
    throw new Error(
      `Invalid evmGasType for ${networkName} (${transactionType}): expected Type${evmGasType}, received Type${gasDetails.evmGasType} in gasDetails. Retrieve appropriate gas type with getEVMGasTypeForTransaction (@railgun-community/shared-models).`,
    );
  }

  // eslint-disable-next-line no-param-reassign
  transaction.type = isEIP7702Type4Transaction
    ? EVMGasType.Type4
    : resolvedGasDetails.evmGasType;

  switch (resolvedGasDetails.evmGasType) {
    case EVMGasType.Type0: {
      // eslint-disable-next-line no-param-reassign
      transaction.gasPrice = resolvedGasDetails.gasPrice;
      // eslint-disable-next-line no-param-reassign
      delete transaction.accessList;
      break;
    }
    case EVMGasType.Type1: {
      // eslint-disable-next-line no-param-reassign
      transaction.gasPrice = resolvedGasDetails.gasPrice;
      break;
    }
    case EVMGasType.Type2:
    case EVMGasType.Type4: {
      // eslint-disable-next-line no-param-reassign
      transaction.maxFeePerGas = resolvedGasDetails.maxFeePerGas;
      // eslint-disable-next-line no-param-reassign
      transaction.maxPriorityFeePerGas = resolvedGasDetails.maxPriorityFeePerGas;
      // eslint-disable-next-line no-param-reassign
      delete transaction.gasPrice;
      break;
    }
  }
};

function coerceGasDetailsToType4(
  gasDetails: TransactionGasDetails,
): TransactionGasDetails {
  if (gasDetails.evmGasType === EVMGasType.Type4) {
    return gasDetails;
  }
  if (gasDetails.evmGasType === EVMGasType.Type2) {
    // Type2 and Type4 share EIP-1559 fee fields.
    return {
      ...gasDetails,
      evmGasType: EVMGasType.Type4,
    };
  }

  // Coerce legacy fee field into EIP-1559 maxFeePerGas.
  // If the caller wants a separate maxPriorityFeePerGas, they must provide it.
  if ('gasPrice' in gasDetails && gasDetails.gasPrice != null) {
    return {
      evmGasType: EVMGasType.Type4,
      gasEstimate: gasDetails.gasEstimate,
      maxFeePerGas: gasDetails.gasPrice,
      maxPriorityFeePerGas: 0n,
    };
  }

  throw new Error(
    'EIP-7702 transaction requires Type4 gas details (maxFeePerGas/maxPriorityFeePerGas).',
  );
}
