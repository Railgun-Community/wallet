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
} from './tx-generator';
import { assertValidRailgunAddress } from '../railgun/wallets/wallets';
import { sendErrorMessage } from '../../utils/logger';
import { populateProvedTransaction } from './proof-cache';
import { SerializedTransaction } from '@railgun-community/lepton/dist/models/formatted-types';
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
