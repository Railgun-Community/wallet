import { PopulatedTransaction } from '@ethersproject/contracts';
import { Provider, TransactionRequest } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import {
  RailgunTransactionGasEstimateResponse,
  TransactionGasDetails,
  TransactionGasDetailsSerialized,
  EVMGasType,
 sanitizeError , calculateGasLimit } from '@railgun-community/shared-models';
import { sendErrorMessage } from '../../utils/logger';

export const getGasEstimate = async (
  transaction: PopulatedTransaction | TransactionRequest,
  provider: Provider,
  fromWalletAddress: string,
  multiplierBasisPoints = 10000,
): Promise<BigNumber> => {
  // Add 'from' field, which is required, as a mock address.
  // Note that DEPOSIT needs a real address, as it checks the balance for transfer.
  // eslint-disable-next-line no-param-reassign
  const transactionWithFrom: TransactionRequest = {
    ...transaction,
    from: fromWalletAddress,
  };

  try {
    const gasEstimate = await provider.estimateGas(transactionWithFrom);
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
  populatedTransaction: PopulatedTransaction,
  gasDetailsSerialized?: TransactionGasDetailsSerialized,
) => {
  if (!gasDetailsSerialized) {
    return;
  }
  const gasEstimate = BigNumber.from(gasDetailsSerialized.gasEstimateString);

  // eslint-disable-next-line no-param-reassign
  populatedTransaction.gasLimit = calculateGasLimit(gasEstimate);

  switch (gasDetailsSerialized.evmGasType) {
    case EVMGasType.Type0: {
      const gasPrice = BigNumber.from(gasDetailsSerialized.gasPriceString);
      // eslint-disable-next-line no-param-reassign
      populatedTransaction.type = 0;
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
      populatedTransaction.type = 2;
      // eslint-disable-next-line no-param-reassign
      populatedTransaction.maxFeePerGas = maxFeePerGas;
      // eslint-disable-next-line no-param-reassign
      populatedTransaction.maxPriorityFeePerGas = maxPriorityFeePerGas;
      break;
    }
  }
};
