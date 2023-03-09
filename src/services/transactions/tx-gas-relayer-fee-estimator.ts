import { BigNumber } from '@ethersproject/bignumber';
import { PopulatedTransaction } from '@ethersproject/contracts';
import { TransactionStruct } from '@railgun-community/engine';
import {
  NetworkName,
  TransactionGasDetails,
  RailgunERC20Amount,
  TransactionGasDetailsSerialized,
  RailgunTransactionGasEstimateResponse,
  FeeTokenDetails,
  calculateMaximumGas,
  RailgunERC20AmountRecipient,
  deserializeTransactionGasDetails,
} from '@railgun-community/shared-models';
import {
  DUMMY_FROM_ADDRESS,
  createDummyRelayerFeeERC20Amount,
} from './tx-generator';
import { getGasEstimate, gasEstimateResponse } from './tx-gas-details';
import { balanceForERC20Token } from '../railgun/wallets/balance-update';
import { walletForID } from '../railgun';

const MAX_ITERATIONS_RELAYER_FEE_REESTIMATION = 5;

export const calculateRelayerFeeERC20Amount = (
  feeTokenDetails: FeeTokenDetails,
  gasDetails: TransactionGasDetails,
): RailgunERC20Amount => {
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
  networkName: NetworkName,
  populatedTransaction: PopulatedTransaction,
  fromWalletAddress: string,
  originalGasDetails: TransactionGasDetails,
  feeTokenDetails: FeeTokenDetails,
  sendWithPublicWallet: boolean,
): Promise<RailgunERC20Amount> => {
  const gasEstimate = await getGasEstimate(
    networkName,
    populatedTransaction,
    fromWalletAddress,
    sendWithPublicWallet,
  );

  const updatedGasDetails: TransactionGasDetails = {
    ...originalGasDetails,
    gasEstimate,
  };

  const relayerFeeERC20Amount: RailgunERC20Amount =
    calculateRelayerFeeERC20Amount(feeTokenDetails, updatedGasDetails);

  return relayerFeeERC20Amount;
};

export const gasEstimateResponseDummyProofIterativeRelayerFee = async (
  generateDummyTransactionStructsWithRelayerFee: (
    relayerFeeERC20Amount: Optional<RailgunERC20Amount>,
  ) => Promise<TransactionStruct[]>,
  generatePopulatedTransaction: (
    serializedTransactions: TransactionStruct[],
  ) => Promise<PopulatedTransaction>,
  networkName: NetworkName,
  railgunWalletID: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  originalGasDetailsSerialized: TransactionGasDetailsSerialized,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  const wallet = walletForID(railgunWalletID);
  const originalGasDetails = deserializeTransactionGasDetails(
    originalGasDetailsSerialized,
  );
  if (!originalGasDetails) {
    throw new Error('Requires originalGasDetails parameter.');
  }

  // Use dead address for private transaction gas estimate
  const fromWalletAddress = DUMMY_FROM_ADDRESS;

  const isGasEstimateWithDummyProof = true;

  const dummyRelayerFee = feeTokenDetails
    ? createDummyRelayerFeeERC20Amount(feeTokenDetails.tokenAddress)
    : undefined;

  let serializedTransactions =
    await generateDummyTransactionStructsWithRelayerFee(dummyRelayerFee);
  let populatedTransaction = await generatePopulatedTransaction(
    serializedTransactions,
  );

  let gasEstimate = await getGasEstimate(
    networkName,
    populatedTransaction,
    fromWalletAddress,
    sendWithPublicWallet,
  );

  if (sendWithPublicWallet) {
    return gasEstimateResponse(gasEstimate, isGasEstimateWithDummyProof);
  }

  if (!feeTokenDetails) {
    throw new Error(
      'Must have Relayer Fee details or sendWithPublicWallet field.',
    );
  }

  // Find any erc20Amount in transfer that matches token of relayer fee, if exists.
  const relayerFeeMatchingSendingERC20Amount = erc20AmountRecipients.find(
    erc20AmountRecipient =>
      erc20AmountRecipient.tokenAddress.toLowerCase() ===
      feeTokenDetails.tokenAddress.toLowerCase(),
  );

  // Get private balance of matching token.
  const balanceForRelayerFeeERC20: Optional<BigNumber> =
    await balanceForERC20Token(
      wallet,
      networkName,
      feeTokenDetails.tokenAddress,
    );

  // Iteratively calculate new relayer fee and estimate new gas amount.
  // This change if the number of circuits changes because of the additional Relayer Fees.
  for (let i = 0; i < MAX_ITERATIONS_RELAYER_FEE_REESTIMATION; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const updatedRelayerFee = await getUpdatedRelayerFeeForGasEstimation(
      networkName,
      populatedTransaction,
      fromWalletAddress,
      originalGasDetails,
      feeTokenDetails,
      sendWithPublicWallet,
    );

    // If Relayer fee causes overflow with the token balance,
    // then use the MAX amount for Relayer Fee, which is BALANCE - SENDING AMOUNT.
    if (
      balanceForRelayerFeeERC20 &&
      relayerFeeMatchingSendingERC20Amount &&
      // eslint-disable-next-line no-await-in-loop
      (await relayerFeeWillOverflowBalance(
        balanceForRelayerFeeERC20,
        relayerFeeMatchingSendingERC20Amount,
        updatedRelayerFee,
      ))
    ) {
      updatedRelayerFee.amountString = balanceForRelayerFeeERC20
        .sub(relayerFeeMatchingSendingERC20Amount.amountString)
        .toHexString();
    }

    const newTransactionStructs =
      // eslint-disable-next-line no-await-in-loop
      await generateDummyTransactionStructsWithRelayerFee(updatedRelayerFee);

    if (
      compareCircuitSizesTransactionStructs(
        newTransactionStructs,
        serializedTransactions,
      )
    ) {
      // Same circuit sizes, no need to run further gas estimates.
      return gasEstimateResponse(gasEstimate, isGasEstimateWithDummyProof);
    }

    serializedTransactions = newTransactionStructs;

    // eslint-disable-next-line no-await-in-loop
    populatedTransaction = await generatePopulatedTransaction(
      serializedTransactions,
    );

    // eslint-disable-next-line no-await-in-loop
    const newGasEstimate = await getGasEstimate(
      networkName,
      populatedTransaction,
      fromWalletAddress,
      sendWithPublicWallet,
    );

    if (newGasEstimate.toHexString() === gasEstimate.toHexString()) {
      return gasEstimateResponse(newGasEstimate, isGasEstimateWithDummyProof);
    }
    gasEstimate = newGasEstimate;
  }

  return gasEstimateResponse(gasEstimate, isGasEstimateWithDummyProof);
};

const compareCircuitSizesTransactionStructs = (
  serializedA: TransactionStruct[],
  serializedB: TransactionStruct[],
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

const relayerFeeWillOverflowBalance = async (
  tokenBalance: BigNumber,
  sendingERC20Amount: RailgunERC20Amount,
  relayerFeeERC20Amount: RailgunERC20Amount,
) => {
  const sendingAmount = BigNumber.from(sendingERC20Amount.amountString);
  const relayerFeeAmount = BigNumber.from(relayerFeeERC20Amount.amountString);

  return sendingAmount.add(relayerFeeAmount).gt(tokenBalance);
};
