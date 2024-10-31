import {
  TransactionStructV2,
  TransactionStructV3,
  convertTransactionStructToCommitmentSummary,
} from '@railgun-community/engine';
import {
  NetworkName,
  TransactionGasDetails,
  RailgunERC20Amount,
  RailgunTransactionGasEstimateResponse,
  FeeTokenDetails,
  calculateMaximumGas,
  RailgunERC20AmountRecipient,
  CommitmentSummary,
  TXIDVersion,
} from '@railgun-community/shared-models';
import {
  DUMMY_FROM_ADDRESS,
  createDummyBroadcasterFeeERC20Amount,
} from './tx-generator';
import { getGasEstimate, gasEstimateResponse } from './tx-gas-details';
import { balanceForERC20Token } from '../railgun/wallets/balance-update';
import { ContractTransaction } from 'ethers';
import { walletForID } from '../railgun/wallets/wallets';

const MAX_ITERATIONS_BROADCASTER_FEE_REESTIMATION = 5;

export const calculateBroadcasterFeeERC20Amount = (
  feeTokenDetails: FeeTokenDetails,
  gasDetails: TransactionGasDetails,
): RailgunERC20Amount => {
  const tokenFeePerUnitGas = BigInt(feeTokenDetails.feePerUnitGas);
  const oneUnitGas = 10n ** 18n;
  const maximumGas = calculateMaximumGas(gasDetails);
  const tokenFee = (tokenFeePerUnitGas * maximumGas) / oneUnitGas;
  return {
    tokenAddress: feeTokenDetails.tokenAddress,
    amount: tokenFee,
  };
};

const getBroadcasterFeeCommitment = (
  transactionStructs: (TransactionStructV2 | TransactionStructV3)[],
): CommitmentSummary => {
  const transactionIndex = 0;
  const broadcasterFeeCommitment = transactionStructs[transactionIndex];
  const broadcasterFeeCommitmentIndex = 0;
  return convertTransactionStructToCommitmentSummary(
    broadcasterFeeCommitment,
    broadcasterFeeCommitmentIndex,
  );
};

export const gasEstimateResponseDummyProofIterativeBroadcasterFee = async (
  generateDummyTransactionStructsWithBroadcasterFee: (
    broadcasterFeeERC20Amount: Optional<RailgunERC20Amount>,
  ) => Promise<(TransactionStructV2 | TransactionStructV3)[]>,
  generateTransaction: (
    serializedTransactions: (TransactionStructV2 | TransactionStructV3)[],
  ) => Promise<ContractTransaction>,
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  originalGasDetails: TransactionGasDetails,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
  isCrossContractCall: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  const wallet = walletForID(railgunWalletID);

  // Use dead address for private transaction gas estimate
  const fromWalletAddress = DUMMY_FROM_ADDRESS;

  const isGasEstimateWithDummyProof = true;

  const dummyBroadcasterFee = feeTokenDetails
    ? createDummyBroadcasterFeeERC20Amount(feeTokenDetails.tokenAddress)
    : undefined;

  let serializedTransactions =
    await generateDummyTransactionStructsWithBroadcasterFee(
      dummyBroadcasterFee,
    );
  let transaction = await generateTransaction(serializedTransactions);

  let gasEstimate = await getGasEstimate(
    txidVersion,
    networkName,
    transaction,
    fromWalletAddress,
    sendWithPublicWallet,
    isCrossContractCall,
  );

  if (sendWithPublicWallet) {
    return gasEstimateResponse(
      gasEstimate,
      undefined, // broadcasterFeeCommitment
      isGasEstimateWithDummyProof,
    );
  }

  if (!feeTokenDetails) {
    throw new Error(
      'Must have Broadcaster Fee details or sendWithPublicWallet field.',
    );
  }

  // Find any erc20Amount in transfer that matches token of broadcaster fee, if exists.
  const broadcasterFeeMatchingSendingERC20Amount = erc20AmountRecipients.find(
    erc20AmountRecipient =>
      erc20AmountRecipient.tokenAddress.toLowerCase() ===
      feeTokenDetails.tokenAddress.toLowerCase(),
  );

  // Get private balance of matching token.
  const balanceForBroadcasterFeeERC20 = await balanceForERC20Token(
    txidVersion,
    wallet,
    networkName,
    feeTokenDetails.tokenAddress,
    true,
  );

  let broadcasterFeeCommitment = getBroadcasterFeeCommitment(
    serializedTransactions,
  );

  // Iteratively calculate new broadcaster fee and estimate new gas amount.
  // This change if the number of circuits changes because of the additional Broadcaster Fees.
  for (let i = 0; i < MAX_ITERATIONS_BROADCASTER_FEE_REESTIMATION; i += 1) {
    const updatedGasDetails: TransactionGasDetails = {
      ...originalGasDetails,
      gasEstimate,
    };
    const updatedBroadcasterFee: RailgunERC20Amount =
      calculateBroadcasterFeeERC20Amount(feeTokenDetails, updatedGasDetails);

    // If Broadcaster fee causes overflow with the token balance,
    // then use the MAX amount for Broadcaster Fee, which is BALANCE - SENDING AMOUNT.
    if (
      balanceForBroadcasterFeeERC20 > 0n &&
      broadcasterFeeMatchingSendingERC20Amount &&
      // eslint-disable-next-line no-await-in-loop
      (await broadcasterFeeWillOverflowBalance(
        balanceForBroadcasterFeeERC20,
        broadcasterFeeMatchingSendingERC20Amount,
        updatedBroadcasterFee,
      ))
    ) {
      updatedBroadcasterFee.amount =
        balanceForBroadcasterFeeERC20 -
        broadcasterFeeMatchingSendingERC20Amount.amount;
    }

    const newSerializedTransactions =
      // eslint-disable-next-line no-await-in-loop
      await generateDummyTransactionStructsWithBroadcasterFee(
        updatedBroadcasterFee,
      );

    broadcasterFeeCommitment = getBroadcasterFeeCommitment(
      newSerializedTransactions,
    );

    if (
      compareCircuitSizesTransactionStructs(
        newSerializedTransactions,
        serializedTransactions,
      )
    ) {
      // Same circuit sizes, no need to run further gas estimates.
      return gasEstimateResponse(
        gasEstimate,
        broadcasterFeeCommitment,
        isGasEstimateWithDummyProof,
      );
    }

    serializedTransactions = newSerializedTransactions;

    // eslint-disable-next-line no-await-in-loop
    transaction = await generateTransaction(serializedTransactions);

    // eslint-disable-next-line no-await-in-loop
    const newGasEstimate = await getGasEstimate(
      txidVersion,
      networkName,
      transaction,
      fromWalletAddress,
      sendWithPublicWallet,
      isCrossContractCall,
    );

    if (newGasEstimate === gasEstimate) {
      return gasEstimateResponse(
        newGasEstimate,
        broadcasterFeeCommitment,
        isGasEstimateWithDummyProof,
      );
    }
    gasEstimate = newGasEstimate;
  }

  return gasEstimateResponse(
    gasEstimate,
    broadcasterFeeCommitment,
    isGasEstimateWithDummyProof,
  );
};

const compareCircuitSizesTransactionStructs = (
  serializedA: (TransactionStructV2 | TransactionStructV3)[],
  serializedB: (TransactionStructV2 | TransactionStructV3)[],
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

const broadcasterFeeWillOverflowBalance = async (
  tokenBalance: bigint,
  sendingERC20Amount: RailgunERC20Amount,
  broadcasterFeeERC20Amount: RailgunERC20Amount,
) => {
  const sendingAmount = sendingERC20Amount.amount;
  const broadcasterFeeAmount = broadcasterFeeERC20Amount.amount;

  return sendingAmount + broadcasterFeeAmount > tokenBalance;
};
