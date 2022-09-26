import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  RailgunWalletTokenAmount,
  TransactionGasDetailsSerialized,
} from '@railgun-community/shared-models/dist/models/response-types';
import { NetworkName } from '@railgun-community/shared-models/dist/models/network-config';
import { ProofType } from '@railgun-community/shared-models/dist/models/proof';
import { sanitizeError } from '@railgun-community/shared-models/dist/utils/error';
import { serializeUnsignedTransaction } from '@railgun-community/shared-models/dist/utils/serializer';
import { FeeTokenDetails } from '@railgun-community/shared-models/dist/models/fee-token';
import {
  generateDummyProofTransactions,
  generateTransact,
  generateWithdrawBaseToken,
} from './tx-generator';
import {
  assertValidEthAddress,
  assertValidRailgunAddress,
} from '../railgun/wallets/wallets';
import { sendErrorMessage } from '../../utils/logger';
import { populateProvedTransaction } from './proof-cache';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import { randomHex } from '@railgun-community/lepton/dist/utils/bytes';
import { SerializedTransaction } from '@railgun-community/lepton/dist/models/formatted-types';
import { gasEstimateResponseIterativeRelayerFee } from './tx-gas-relayer-fee-estimator';

export const populateProvedWithdraw = async (
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
      ProofType.Withdraw,
      publicWalletAddress,
      railgunWalletID,
      undefined, // memoText
      tokenAmounts,
      undefined, // relayAdaptDepositTokenAddresses
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

export const populateProvedWithdrawBaseToken = async (
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
      ProofType.WithdrawBaseToken,
      publicWalletAddress,
      railgunWalletID,
      undefined, // memoText
      tokenAmounts,
      undefined, // relayAdaptDepositTokenAddresses
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

export const gasEstimateForUnprovenWithdraw = async (
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  tokenAmounts: RailgunWalletTokenAmount[],
  originalGasDetailsSerialized: TransactionGasDetailsSerialized,
  feeTokenDetails: FeeTokenDetails,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    assertNotBlockedAddress(publicWalletAddress);
    assertValidEthAddress(publicWalletAddress);

    const response = await gasEstimateResponseIterativeRelayerFee(
      (relayerFeeTokenAmount: RailgunWalletTokenAmount) =>
        generateDummyProofTransactions(
          ProofType.Withdraw,
          networkName,
          railgunWalletID,
          publicWalletAddress,
          encryptionKey,
          undefined, // memoText
          tokenAmounts,
          relayerFeeTokenAmount,
          sendWithPublicWallet,
        ),
      (txs: SerializedTransaction[]) =>
        generateTransact(
          txs,
          networkName,
          true, // useDummyProof
        ),
      networkName,
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

export const gasEstimateForUnprovenWithdrawBaseToken = async (
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  wrappedTokenAmount: RailgunWalletTokenAmount,
  originalGasDetailsSerialized: TransactionGasDetailsSerialized,
  feeTokenDetails: FeeTokenDetails,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    assertNotBlockedAddress(publicWalletAddress);
    assertValidEthAddress(publicWalletAddress);

    const tokenAmounts = [wrappedTokenAmount];

    const response = await gasEstimateResponseIterativeRelayerFee(
      (relayerFeeTokenAmount: RailgunWalletTokenAmount) =>
        generateDummyProofTransactions(
          ProofType.WithdrawBaseToken,
          networkName,
          railgunWalletID,
          publicWalletAddress,
          encryptionKey,
          undefined, // memoText
          tokenAmounts,
          relayerFeeTokenAmount,
          sendWithPublicWallet,
        ),
      (txs: SerializedTransaction[]) => {
        const relayAdaptParamsRandom = randomHex(16);
        return generateWithdrawBaseToken(
          txs,
          networkName,
          publicWalletAddress,
          relayAdaptParamsRandom,
          true, // useDummyProof
        );
      },
      networkName,
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
