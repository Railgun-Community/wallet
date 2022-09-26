import { BigNumber } from '@ethersproject/bignumber';
import { PopulatedTransaction } from '@ethersproject/contracts';
import { BaseProvider } from '@ethersproject/providers';
import { SerializedTransaction } from '@railgun-community/lepton/dist/models/formatted-types';
import { NetworkName } from '@railgun-community/shared-models/dist/models/network-config';
import {
  TransactionGasDetails,
  RailgunWalletTokenAmount,
  TransactionGasDetailsSerialized,
  RailgunTransactionGasEstimateResponse,
} from '@railgun-community/shared-models/dist/models/response-types';
import { calculateMaximumGas } from '@railgun-community/shared-models/dist/utils/gas';
import { getProviderForNetwork } from '../railgun/core/providers';
import { FeeTokenDetails } from '@railgun-community/shared-models/dist/models/fee-token';
import {
  DUMMY_FROM_ADDRESS,
  createDummyRelayerFeeTokenAmount,
} from './tx-generator';
import {
  getGasEstimate,
  deserializeTransactionGasDetails,
  gasEstimateResponse,
} from './tx-gas-details';

const MAX_ITERATIONS_RELAYER_FEE_REESTIMATION = 5;

export const calculateRelayerFeeTokenAmount = (
  feeTokenDetails: FeeTokenDetails,
  gasDetails: TransactionGasDetails,
): RailgunWalletTokenAmount => {
  const tokenFeePerUnitGas = BigNumber.from(feeTokenDetails.feePerUnitGas);
  const oneUnitGas = BigNumber.from(10).pow(18);
  const maximumGas = calculateMaximumGas(gasDetails);
  const tokenFee = tokenFeePerUnitGas.mul(maximumGas).div(oneUnitGas);

  return {
    tokenAddress: feeTokenDetails.tokenAddress,
    amountString: tokenFee.toHexString(),
  };
};

const getUpdatedRelayerFeeForGasEstimation = async (
  provider: BaseProvider,
  populatedTransaction: PopulatedTransaction,
  fromWalletAddress: string,
  originalGasDetails: TransactionGasDetails,
  feeTokenDetails: FeeTokenDetails,
  multiplierBasisPoints?: number,
): Promise<RailgunWalletTokenAmount> => {
  const gasEstimate = await getGasEstimate(
    populatedTransaction,
    provider,
    fromWalletAddress,
    multiplierBasisPoints,
  );

  const updatedGasDetails: TransactionGasDetails = {
    ...originalGasDetails,
    gasEstimate,
  };

  const relayerFeeTokenAmount: RailgunWalletTokenAmount =
    calculateRelayerFeeTokenAmount(feeTokenDetails, updatedGasDetails);

  return relayerFeeTokenAmount;
};

export const gasEstimateResponseIterativeRelayerFee = async (
  generateSerializedTransactions: (
    relayerFeeTokenAmount: RailgunWalletTokenAmount,
  ) => Promise<SerializedTransaction[]>,
  generatePopulatedTransaction: (
    serializedTransactions: SerializedTransaction[],
  ) => Promise<PopulatedTransaction>,
  networkName: NetworkName,
  originalGasDetailsSerialized: TransactionGasDetailsSerialized,
  feeTokenDetails: FeeTokenDetails,
  sendWithPublicWallet: boolean,
  multiplierBasisPoints: Optional<number>,
): Promise<RailgunTransactionGasEstimateResponse> => {
  const provider = getProviderForNetwork(networkName);
  const originalGasDetails = deserializeTransactionGasDetails(
    originalGasDetailsSerialized,
  );

  // Use dead address for private transaction gas estimate
  const fromWalletAddress = DUMMY_FROM_ADDRESS;

  const dummyRelayerFee = createDummyRelayerFeeTokenAmount(
    feeTokenDetails.tokenAddress,
  );

  let serializedTransactions = await generateSerializedTransactions(
    dummyRelayerFee,
  );
  let populatedTransaction = await generatePopulatedTransaction(
    serializedTransactions,
  );

  let gasEstimate = await getGasEstimate(
    populatedTransaction,
    provider,
    fromWalletAddress,
    multiplierBasisPoints,
  );

  if (sendWithPublicWallet) {
    return gasEstimateResponse(gasEstimate);
  }

  // Iteratively calculate new relayer fee and estimate new gas amount.
  // This change if the number of circuits changes because of the additional Relayer Fees.
  for (let i = 0; i < MAX_ITERATIONS_RELAYER_FEE_REESTIMATION; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const updatedRelayerFee = await getUpdatedRelayerFeeForGasEstimation(
      provider,
      populatedTransaction,
      fromWalletAddress,
      originalGasDetails,
      feeTokenDetails,
      multiplierBasisPoints,
    );

    // eslint-disable-next-line no-await-in-loop
    const newSerializedTransactions = await generateSerializedTransactions(
      updatedRelayerFee,
    );

    if (
      compareCircuitSizesSerializedTransactions(
        newSerializedTransactions,
        serializedTransactions,
      )
    ) {
      // Same circuit sizes, no need to run gas estimates.
      return gasEstimateResponse(gasEstimate);
    }

    serializedTransactions = newSerializedTransactions;

    // eslint-disable-next-line no-await-in-loop
    populatedTransaction = await generatePopulatedTransaction(
      serializedTransactions,
    );

    // eslint-disable-next-line no-await-in-loop
    const newGasEstimate = await getGasEstimate(
      populatedTransaction,
      provider,
      fromWalletAddress,
      multiplierBasisPoints,
    );

    if (newGasEstimate.toHexString() === gasEstimate.toHexString()) {
      return gasEstimateResponse(newGasEstimate);
    }
    gasEstimate = newGasEstimate;
  }

  return gasEstimateResponse(gasEstimate);
};

const compareCircuitSizesSerializedTransactions = (
  serializedA: SerializedTransaction[],
  serializedB: SerializedTransaction[],
) => {
  if (serializedA.length !== serializedB.length) {
    return false;
  }
  for (let i = 0; i < serializedA.length; i += 1) {
    if (
      serializedA[i].commitments.length !== serializedB[i].commitments.length
    ) {
      return false;
    }
    if (serializedA[i].nullifiers.length !== serializedB[i].nullifiers.length) {
      return false;
    }
  }
  return true;
};
