import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  RailgunWalletTokenAmount,
  TransactionGasDetailsSerialized,
  NetworkName,
  ProofType,
  FeeTokenDetails,
} from '@railgun-community/shared-models';
import { sanitizeError } from '@railgun-community/shared-models';
import { serializeUnsignedTransaction } from '@railgun-community/shared-models';
import {
  generateDummyProofTransactions,
  generateTransact,
} from './tx-generator';
import { assertValidRailgunAddress } from '../railgun/wallets/wallets';
import { sendErrorMessage } from '../../utils/logger';
import { populateProvedTransaction } from './proof-cache';
import { SerializedTransaction } from '@railgun-community/engine/dist/models/formatted-types';
import { gasEstimateResponseIterativeRelayerFee } from './tx-gas-relayer-fee-estimator';

export const populateProvedTransfer = async (
  networkName: NetworkName,
  railgunAddress: string,
  railgunWalletID: string,
  memoText: Optional<string>,
  tokenAmounts: RailgunWalletTokenAmount[],
  relayerRailgunAddress: Optional<string>,
  relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>,
  sendWithPublicWallet: boolean,
  gasDetailsSerialized: Optional<TransactionGasDetailsSerialized>,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    assertValidRailgunAddress(railgunAddress, networkName);
    if (relayerRailgunAddress) {
      assertValidRailgunAddress(relayerRailgunAddress, networkName);
    }

    const populatedTransaction = await populateProvedTransaction(
      ProofType.Transfer,
      railgunAddress,
      railgunWalletID,
      memoText,
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

export const gasEstimateForUnprovenTransfer = async (
  networkName: NetworkName,
  railgunAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  memoText: Optional<string>,
  tokenAmounts: RailgunWalletTokenAmount[],
  originalGasDetailsSerialized: TransactionGasDetailsSerialized,
  feeTokenDetails: FeeTokenDetails,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    assertValidRailgunAddress(railgunAddress, networkName);

    const response = await gasEstimateResponseIterativeRelayerFee(
      (relayerFeeTokenAmount: RailgunWalletTokenAmount) =>
        generateDummyProofTransactions(
          ProofType.Transfer,
          networkName,
          railgunWalletID,
          railgunAddress,
          encryptionKey,
          memoText,
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
