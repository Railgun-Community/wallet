import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  RailgunWalletTokenAmount,
  TransactionGasDetailsSerialized,
  NetworkName,
  ProofType,
  FeeTokenDetails,
  sanitizeError,
  serializeUnsignedTransaction,
} from '@railgun-community/shared-models';
import {
  generateDummyProofTransactions,
  generateTransact,
  generateUnshieldBaseToken,
} from './tx-generator';
import {
  assertValidEthAddress,
  assertValidRailgunAddress,
} from '../railgun/wallets/wallets';
import { sendErrorMessage } from '../../utils/logger';
import { populateProvedTransaction } from './proof-cache';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import { randomHex, TransactionStruct } from '@railgun-community/engine';
import { gasEstimateResponseIterativeRelayerFee } from './tx-gas-relayer-fee-estimator';
import { BigNumber } from '@ethersproject/bignumber';

export const populateProvedUnshield = async (
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  tokenAmounts: RailgunWalletTokenAmount[],
  relayerRailgunAddress: Optional<string>,
  relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>,
  sendWithPublicWallet: boolean,
  gasDetailsSerialized: Optional<TransactionGasDetailsSerialized>,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    assertNotBlockedAddress(publicWalletAddress);
    assertValidEthAddress(publicWalletAddress);
    if (relayerRailgunAddress) {
      assertValidRailgunAddress(relayerRailgunAddress, networkName);
    }

    const populatedTransaction = await populateProvedTransaction(
      ProofType.Unshield,
      publicWalletAddress,
      railgunWalletID,
      undefined, // memoText
      tokenAmounts,
      undefined, // relayAdaptShieldTokenAddresses
      undefined, // crossContractCallsSerialized
      relayerRailgunAddress,
      relayerFeeTokenAmount,
      sendWithPublicWallet,
      gasDetailsSerialized,
    );
    return {
      serializedTransaction: serializeUnsignedTransaction(populatedTransaction),
    };
  } catch (err) {
    sendErrorMessage(err.message);
    sendErrorMessage(err.stack);
    const railResponse: RailgunPopulateTransactionResponse = {
      error: sanitizeError(err).message,
    };
    return railResponse;
  }
};

export const populateProvedUnshieldBaseToken = async (
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  wrappedTokenAmount: RailgunWalletTokenAmount,
  relayerRailgunAddress: Optional<string>,
  relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>,
  sendWithPublicWallet: boolean,
  gasDetailsSerialized: Optional<TransactionGasDetailsSerialized>,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    assertNotBlockedAddress(publicWalletAddress);
    assertValidEthAddress(publicWalletAddress);
    if (relayerRailgunAddress) {
      assertValidRailgunAddress(relayerRailgunAddress, networkName);
    }

    const tokenAmounts = [wrappedTokenAmount];
    const populatedTransaction = await populateProvedTransaction(
      ProofType.UnshieldBaseToken,
      publicWalletAddress,
      railgunWalletID,
      undefined, // memoText
      tokenAmounts,
      undefined, // relayAdaptShieldTokenAddresses
      undefined, // crossContractCallsSerialized
      relayerRailgunAddress,
      relayerFeeTokenAmount,
      sendWithPublicWallet,
      gasDetailsSerialized,
    );
    return {
      serializedTransaction: serializeUnsignedTransaction(populatedTransaction),
    };
  } catch (err) {
    sendErrorMessage(err.message);
    sendErrorMessage(err.stack);
    const railResponse: RailgunPopulateTransactionResponse = {
      error: sanitizeError(err).message,
    };
    return railResponse;
  }
};

export const gasEstimateForUnprovenUnshield = async (
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  tokenAmounts: RailgunWalletTokenAmount[],
  originalGasDetailsSerialized: TransactionGasDetailsSerialized,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    assertNotBlockedAddress(publicWalletAddress);
    assertValidEthAddress(publicWalletAddress);

    const response = await gasEstimateResponseIterativeRelayerFee(
      (relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>) =>
        generateDummyProofTransactions(
          ProofType.Unshield,
          networkName,
          railgunWalletID,
          publicWalletAddress,
          encryptionKey,
          undefined, // memoText
          tokenAmounts,
          relayerFeeTokenAmount,
          sendWithPublicWallet,
        ),
      (txs: TransactionStruct[]) =>
        generateTransact(
          txs,
          networkName,
          true, // useDummyProof
        ),
      networkName,
      railgunWalletID,
      tokenAmounts,
      originalGasDetailsSerialized,
      feeTokenDetails,
      sendWithPublicWallet,
      undefined, // multiplierBasisPoints
    );
    return response;
  } catch (err) {
    sendErrorMessage(err.message);
    sendErrorMessage(err.stack);
    const railResponse: RailgunTransactionGasEstimateResponse = {
      error: sanitizeError(err).message,
    };
    return railResponse;
  }
};

export const gasEstimateForUnprovenUnshieldBaseToken = async (
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  wrappedTokenAmount: RailgunWalletTokenAmount,
  originalGasDetailsSerialized: TransactionGasDetailsSerialized,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    assertNotBlockedAddress(publicWalletAddress);
    assertValidEthAddress(publicWalletAddress);

    const tokenAmounts = [wrappedTokenAmount];

    const response = await gasEstimateResponseIterativeRelayerFee(
      (relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>) =>
        generateDummyProofTransactions(
          ProofType.UnshieldBaseToken,
          networkName,
          railgunWalletID,
          publicWalletAddress,
          encryptionKey,
          undefined, // memoText
          tokenAmounts,
          relayerFeeTokenAmount,
          sendWithPublicWallet,
        ),
      (txs: TransactionStruct[]) => {
        const relayAdaptParamsRandom = randomHex(31);
        const value = BigNumber.from(
          wrappedTokenAmount.amountString,
        ).toHexString();
        return generateUnshieldBaseToken(
          txs,
          networkName,
          publicWalletAddress,
          relayAdaptParamsRandom,
          value,
          true, // useDummyProof
        );
      },
      networkName,
      railgunWalletID,
      [wrappedTokenAmount],
      originalGasDetailsSerialized,
      feeTokenDetails,
      sendWithPublicWallet,
      undefined, // multiplierBasisPoints
    );
    return response;
  } catch (err) {
    sendErrorMessage(err.message);
    sendErrorMessage(err.stack);
    const railResponse: RailgunTransactionGasEstimateResponse = {
      error: sanitizeError(err).message,
    };
    return railResponse;
  }
};
