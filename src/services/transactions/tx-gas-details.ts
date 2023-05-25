import { PopulatedTransaction } from '@ethersproject/contracts';
import { TransactionRequest } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import {
  RailgunTransactionGasEstimateResponse,
  TransactionGasDetailsSerialized,
  EVMGasType,
  calculateGasLimit,
  NetworkName,
  getEVMGasTypeForTransaction,
  CommitmentSummary,
} from '@railgun-community/shared-models';
import { getProviderForNetwork } from '../railgun';
import { reportAndSanitizeError } from '../../utils/error';
import {
  GAS_ESTIMATE_VARIANCE_DUMMY_TO_ACTUAL_TRANSACTION,
  RelayAdaptContract,
} from '@railgun-community/engine';

export const getGasEstimate = async (
  networkName: NetworkName,
  transaction: PopulatedTransaction | TransactionRequest,
  fromWalletAddress: string,
  sendWithPublicWallet: boolean,
  isCrossContractCall: boolean,
): Promise<BigNumber> => {
  const evmGasType = getEVMGasTypeForTransaction(
    networkName,
    sendWithPublicWallet,
  );

  // Add 'from' field, which is required, as a mock address.
  // Note that DEPOSIT needs a real address, as it checks the balance for transfer.
  const estimateGasTransactionRequest: TransactionRequest = {
    ...transaction,
    from: fromWalletAddress,
    type: evmGasType,
  };
  if (shouldRemoveGasLimitForL2GasEstimate(networkName)) {
    delete estimateGasTransactionRequest.gasLimit;
  }

  try {
    const gasEstimate = await estimateGas(
      networkName,
      estimateGasTransactionRequest,
      isCrossContractCall,
    );
    return gasEstimate;
  } catch (err) {
    throw reportAndSanitizeError(getGasEstimate.name, err);
  }
};

const estimateGas = (
  networkName: NetworkName,
  transaction: TransactionRequest,
  isCrossContractCall: boolean,
): Promise<BigNumber> => {
  const provider = getProviderForNetwork(networkName);
  if (isCrossContractCall) {
    // Includes custom error handler for relay-adapt transactions.
    return RelayAdaptContract.estimateGasWithErrorHandler(
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
    case NetworkName.ArbitrumGoerli:
      return true;
    case NetworkName.Railgun:
      throw new Error('Invalid network for transaction');
    case NetworkName.Ethereum:
    case NetworkName.BNBChain:
    case NetworkName.Polygon:
    case NetworkName.EthereumRopsten_DEPRECATED:
    case NetworkName.EthereumGoerli:
    case NetworkName.PolygonMumbai:
    case NetworkName.Hardhat:
      return false;
  }
};

export const gasEstimateResponse = (
  gasEstimate: BigNumber,
  relayerFeeCommitment: Optional<CommitmentSummary>,
  isGasEstimateWithDummyProof: boolean,
): RailgunTransactionGasEstimateResponse => {
  // TODO: This variance will be different on L2s.
  // However, it's small enough that it shouldn't matter very much.
  const gasEstimateWithDummyProofVariance = isGasEstimateWithDummyProof
    ? gasEstimate.add(GAS_ESTIMATE_VARIANCE_DUMMY_TO_ACTUAL_TRANSACTION)
    : gasEstimate;

  const response: RailgunTransactionGasEstimateResponse = {
    gasEstimateString: gasEstimateWithDummyProofVariance.toHexString(),
    relayerFeeCommitment,
  };
  return response;
};

export const gasEstimateResponseFromGasEstimate = (
  gasEstimate: BigNumber,
): RailgunTransactionGasEstimateResponse => {
  try {
    const response: RailgunTransactionGasEstimateResponse = {
      gasEstimateString: gasEstimate.toHexString(),
    };
    return response;
  } catch (err) {
    throw reportAndSanitizeError(gasEstimateResponseFromGasEstimate.name, err);
  }
};

export const setGasDetailsForPopulatedTransaction = (
  networkName: NetworkName,
  populatedTransaction: PopulatedTransaction,
  gasDetailsSerialized: TransactionGasDetailsSerialized,
  sendWithPublicWallet: boolean,
) => {
  const gasEstimate = BigNumber.from(gasDetailsSerialized.gasEstimateString);

  // eslint-disable-next-line no-param-reassign
  populatedTransaction.gasLimit = calculateGasLimit(gasEstimate);

  const evmGasType = getEVMGasTypeForTransaction(
    networkName,
    sendWithPublicWallet,
  );

  if (gasDetailsSerialized.evmGasType !== evmGasType) {
    const transactionType = sendWithPublicWallet ? 'self-signed' : 'Relayer';
    throw new Error(
      `Invalid evmGasType for ${networkName} (${transactionType}): expected Type${evmGasType}, received Type${gasDetailsSerialized.evmGasType} in gasDetailsSerialized. Retrieve appropriate gas type with getEVMGasTypeForTransaction (@railgun-community/shared-models).`,
    );
  }

  // eslint-disable-next-line no-param-reassign
  populatedTransaction.type = gasDetailsSerialized.evmGasType;

  switch (gasDetailsSerialized.evmGasType) {
    case EVMGasType.Type0: {
      const gasPrice = BigNumber.from(gasDetailsSerialized.gasPriceString);
      // eslint-disable-next-line no-param-reassign
      populatedTransaction.gasPrice = gasPrice;
      // eslint-disable-next-line no-param-reassign
      delete populatedTransaction.accessList;
      break;
    }
    case EVMGasType.Type1: {
      const gasPrice = BigNumber.from(gasDetailsSerialized.gasPriceString);
      // eslint-disable-next-line no-param-reassign
      populatedTransaction.gasPrice = gasPrice;
      break;
    }
    case EVMGasType.Type2: {
      const maxFeePerGas = BigNumber.from(
        gasDetailsSerialized.maxFeePerGasString,
      );
      const maxPriorityFeePerGas = BigNumber.from(
        gasDetailsSerialized.maxPriorityFeePerGasString,
      );
      // eslint-disable-next-line no-param-reassign
      populatedTransaction.maxFeePerGas = maxFeePerGas;
      // eslint-disable-next-line no-param-reassign
      populatedTransaction.maxPriorityFeePerGas = maxPriorityFeePerGas;
      break;
    }
  }
};
