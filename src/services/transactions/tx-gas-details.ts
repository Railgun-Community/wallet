import { PopulatedTransaction } from '@ethersproject/contracts';
import { TransactionRequest } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import {
  RailgunTransactionGasEstimateResponse,
  TransactionGasDetails,
  TransactionGasDetailsSerialized,
  EVMGasType,
  sanitizeError,
  calculateGasLimit,
  NetworkName,
  getEVMGasTypeForTransaction,
} from '@railgun-community/shared-models';
import { sendErrorMessage } from '../../utils/logger';
import { getProviderForNetwork } from '../railgun';

export const getGasEstimate = async (
  networkName: NetworkName,
  transaction: PopulatedTransaction | TransactionRequest,
  fromWalletAddress: string,
  sendWithPublicWallet: boolean,
  multiplierBasisPoints = 10000,
): Promise<BigNumber> => {
  const evmGasType = getEVMGasTypeForTransaction(
    networkName,
    sendWithPublicWallet,
  );

  // Add 'from' field, which is required, as a mock address.
  // Note that DEPOSIT needs a real address, as it checks the balance for transfer.
  const estimateGasTransaction: TransactionRequest = {
    ...transaction,
    from: fromWalletAddress,
    type: evmGasType,
  };

  try {
    const provider = getProviderForNetwork(networkName);
    const gasEstimate = await provider.estimateGas(estimateGasTransaction);
    return gasEstimate.mul(multiplierBasisPoints).div(10000);
  } catch (err) {
    sendErrorMessage(err.message);
    sendErrorMessage(err.stack);
    throw err;
  }
};

export const gasEstimateResponse = (
  gasEstimate: BigNumber,
): RailgunTransactionGasEstimateResponse => {
  const railResponse: RailgunTransactionGasEstimateResponse = {
    gasEstimateString: gasEstimate.toHexString(),
  };
  return railResponse;
};

export const gasEstimateResponseFromGasEstimate = (
  gasEstimate: BigNumber,
): RailgunTransactionGasEstimateResponse => {
  try {
    const railResponse: RailgunTransactionGasEstimateResponse = {
      gasEstimateString: gasEstimate.toHexString(),
    };
    return railResponse;
  } catch (err) {
    sendErrorMessage(err.message);
    sendErrorMessage(err.stack);
    const railResponse: RailgunTransactionGasEstimateResponse = {
      error: sanitizeError(err).message,
    };
    return railResponse;
  }
};

export const deserializeTransactionGasDetails = (
  gasDetailsSerialized: TransactionGasDetailsSerialized,
): TransactionGasDetails => {
  switch (gasDetailsSerialized.evmGasType) {
    case EVMGasType.Type0:
    case EVMGasType.Type1:
      return {
        evmGasType: gasDetailsSerialized.evmGasType,
        gasEstimate: BigNumber.from(gasDetailsSerialized.gasEstimateString),
        gasPrice: BigNumber.from(gasDetailsSerialized.gasPriceString),
      };
    case EVMGasType.Type2:
      return {
        evmGasType: gasDetailsSerialized.evmGasType,
        gasEstimate: BigNumber.from(gasDetailsSerialized.gasEstimateString),
        maxFeePerGas: BigNumber.from(gasDetailsSerialized.maxFeePerGasString),
        maxPriorityFeePerGas: BigNumber.from(
          gasDetailsSerialized.maxPriorityFeePerGasString,
        ),
      };
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
      populatedTransaction.accessList = undefined;
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
