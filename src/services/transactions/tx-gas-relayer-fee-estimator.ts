import { TransactionStruct } from '@railgun-community/engine';
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
  createDummyRelayerFeeERC20Amount,
} from './tx-generator';
import { getGasEstimate, gasEstimateResponse } from './tx-gas-details';
import { balanceForERC20Token } from '../railgun/wallets/balance-update';
import { convertTransactionStructToCommitmentSummary } from '../railgun/util/commitment';
import { ContractTransaction } from 'ethers';
import { walletForID } from '../railgun/wallets/wallets';

const MAX_ITERATIONS_RELAYER_FEE_REESTIMATION = 5;

export const calculateRelayerFeeERC20Amount = (
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

const getRelayerFeeCommitment = (
  transactionStructs: TransactionStruct[],
): CommitmentSummary => {
  const transactionIndex = 0;
  const relayerFeeCommitment = transactionStructs[transactionIndex];
  const relayerFeeCommitmentIndex = 0;
  return convertTransactionStructToCommitmentSummary(
    relayerFeeCommitment,
    relayerFeeCommitmentIndex,
  );
};

export const gasEstimateResponseDummyProofIterativeRelayerFee = async (
  generateDummyTransactionStructsWithRelayerFee: (
    relayerFeeERC20Amount: Optional<RailgunERC20Amount>,
  ) => Promise<TransactionStruct[]>,
  generateTransaction: (
    serializedTransactions: TransactionStruct[],
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

  const dummyRelayerFee = feeTokenDetails
    ? createDummyRelayerFeeERC20Amount(feeTokenDetails.tokenAddress)
    : undefined;

  let serializedTransactions =
    await generateDummyTransactionStructsWithRelayerFee(dummyRelayerFee);
  let transaction = await generateTransaction(serializedTransactions);

  let gasEstimate = await getGasEstimate(
    networkName,
    transaction,
    fromWalletAddress,
    sendWithPublicWallet,
    isCrossContractCall,
  );

  if (sendWithPublicWallet) {
    return gasEstimateResponse(
      gasEstimate,
      undefined, // relayerFeeCommitment
      isGasEstimateWithDummyProof,
    );
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
  const balanceForRelayerFeeERC20 = await balanceForERC20Token(
    txidVersion,
    wallet,
    networkName,
    feeTokenDetails.tokenAddress,
    true,
  );

  let relayerFeeCommitment = getRelayerFeeCommitment(serializedTransactions);

  // Iteratively calculate new relayer fee and estimate new gas amount.
  // This change if the number of circuits changes because of the additional Relayer Fees.
  for (let i = 0; i < MAX_ITERATIONS_RELAYER_FEE_REESTIMATION; i += 1) {
    const updatedGasDetails: TransactionGasDetails = {
      ...originalGasDetails,
      gasEstimate,
    };
    const updatedRelayerFee: RailgunERC20Amount =
      calculateRelayerFeeERC20Amount(feeTokenDetails, updatedGasDetails);

    // If Relayer fee causes overflow with the token balance,
    // then use the MAX amount for Relayer Fee, which is BALANCE - SENDING AMOUNT.
    if (
      balanceForRelayerFeeERC20 > 0n &&
      relayerFeeMatchingSendingERC20Amount &&
      // eslint-disable-next-line no-await-in-loop
      (await relayerFeeWillOverflowBalance(
        balanceForRelayerFeeERC20,
        relayerFeeMatchingSendingERC20Amount,
        updatedRelayerFee,
      ))
    ) {
      updatedRelayerFee.amount =
        balanceForRelayerFeeERC20 - relayerFeeMatchingSendingERC20Amount.amount;
    }

    const newSerializedTransactions =
      // eslint-disable-next-line no-await-in-loop
      await generateDummyTransactionStructsWithRelayerFee(updatedRelayerFee);

    relayerFeeCommitment = getRelayerFeeCommitment(newSerializedTransactions);

    if (
      compareCircuitSizesTransactionStructs(
        newSerializedTransactions,
        serializedTransactions,
      )
    ) {
      // Same circuit sizes, no need to run further gas estimates.
      return gasEstimateResponse(
        gasEstimate,
        relayerFeeCommitment,
        isGasEstimateWithDummyProof,
      );
    }

    serializedTransactions = newSerializedTransactions;

    // eslint-disable-next-line no-await-in-loop
    transaction = await generateTransaction(serializedTransactions);

    // eslint-disable-next-line no-await-in-loop
    const newGasEstimate = await getGasEstimate(
      networkName,
      transaction,
      fromWalletAddress,
      sendWithPublicWallet,
      isCrossContractCall,
    );

    if (newGasEstimate === gasEstimate) {
      return gasEstimateResponse(
        newGasEstimate,
        relayerFeeCommitment,
        isGasEstimateWithDummyProof,
      );
    }
    gasEstimate = newGasEstimate;
  }

  return gasEstimateResponse(
    gasEstimate,
    relayerFeeCommitment,
    isGasEstimateWithDummyProof,
  );
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
  tokenBalance: bigint,
  sendingERC20Amount: RailgunERC20Amount,
  relayerFeeERC20Amount: RailgunERC20Amount,
) => {
  const sendingAmount = sendingERC20Amount.amount;
  const relayerFeeAmount = relayerFeeERC20Amount.amount;

  return sendingAmount + relayerFeeAmount > tokenBalance;
};
