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
    type: evmGasType,
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

  if (gasDetails.evmGasType !== evmGasType) {
    const transactionType = sendWithPublicWallet
      ? 'self-signed'
      : 'Broadcaster';
    throw new Error(
      `Invalid evmGasType for ${networkName} (${transactionType}): expected Type${evmGasType}, received Type${gasDetails.evmGasType} in gasDetails. Retrieve appropriate gas type with getEVMGasTypeForTransaction (@railgun-community/shared-models).`,
    );
  }

  // eslint-disable-next-line no-param-reassign
  transaction.type = gasDetails.evmGasType;

  switch (gasDetails.evmGasType) {
    case EVMGasType.Type0: {
      // eslint-disable-next-line no-param-reassign
      transaction.gasPrice = gasDetails.gasPrice;
      // eslint-disable-next-line no-param-reassign
      delete transaction.accessList;
      break;
    }
    case EVMGasType.Type1: {
      // eslint-disable-next-line no-param-reassign
      transaction.gasPrice = gasDetails.gasPrice;
      break;
    }
    case EVMGasType.Type2: {
      // eslint-disable-next-line no-param-reassign
      transaction.maxFeePerGas = gasDetails.maxFeePerGas;
      // eslint-disable-next-line no-param-reassign
      transaction.maxPriorityFeePerGas = gasDetails.maxPriorityFeePerGas;
      break;
    }
  }
};
