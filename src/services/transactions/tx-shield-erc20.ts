import { PopulatedTransaction } from '@ethersproject/contracts';
import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  RailgunWalletTokenAmount,
  TransactionGasDetailsSerialized,
  NetworkName,
  sanitizeError,
  serializeUnsignedTransaction,
} from '@railgun-community/shared-models';
import {
  ShieldNote,
  RailgunEngine,
  ShieldRequestStruct,
  randomHex,
  hexToBytes,
} from '@railgun-community/engine';
import {
  getProxyContractForNetwork,
  getProviderForNetwork,
} from '../railgun/core/providers';
import {
  gasEstimateResponse,
  getGasEstimate,
  setGasDetailsForPopulatedTransaction,
} from './tx-gas-details';
import { sendErrorMessage } from '../../utils/logger';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import { assertValidRailgunAddress } from '../railgun';

const generateShieldTransaction = async (
  networkName: NetworkName,
  railgunAddress: string,
  shieldPrivateKey: string,
  tokenAmounts: RailgunWalletTokenAmount[],
): Promise<PopulatedTransaction> => {
  try {
    const railContract = getProxyContractForNetwork(networkName);
    const { masterPublicKey } = RailgunEngine.decodeAddress(railgunAddress);
    const random = randomHex(16);

    const receiverViewingPublicKey =
      RailgunEngine.decodeAddress(railgunAddress).viewingPublicKey;

    const shieldInputs: ShieldRequestStruct[] = await Promise.all(
      tokenAmounts.map(tokenAmount => {
        const shield = new ShieldNote(
          masterPublicKey,
          random,
          BigInt(tokenAmount.amountString),
          tokenAmount.tokenAddress,
        );
        return shield.serialize(
          hexToBytes(shieldPrivateKey),
          receiverViewingPublicKey,
        );
      }),
    );

    const populatedTransaction = await railContract.generateShield(
      shieldInputs,
    );
    return populatedTransaction;
  } catch (err) {
    sendErrorMessage(err.message);
    sendErrorMessage(err.stack);
    throw sanitizeError(err);
  }
};

export const populateShield = async (
  networkName: NetworkName,
  railgunAddress: string,
  shieldPrivateKey: string,
  tokenAmounts: RailgunWalletTokenAmount[],
  gasDetailsSerialized: Optional<TransactionGasDetailsSerialized>,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    assertValidRailgunAddress(railgunAddress);

    const populatedTransaction = await generateShieldTransaction(
      networkName,
      railgunAddress,
      shieldPrivateKey,
      tokenAmounts,
    );

    setGasDetailsForPopulatedTransaction(
      populatedTransaction,
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

export const gasEstimateForShield = async (
  networkName: NetworkName,
  railgunAddress: string,
  shieldPrivateKey: string,
  tokenAmounts: RailgunWalletTokenAmount[],
  fromWalletAddress: string,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    assertValidRailgunAddress(railgunAddress);
    assertNotBlockedAddress(fromWalletAddress);

    const populatedTransaction = await generateShieldTransaction(
      networkName,
      railgunAddress,
      shieldPrivateKey,
      tokenAmounts,
    );

    const provider = getProviderForNetwork(networkName);
    return gasEstimateResponse(
      await getGasEstimate(populatedTransaction, provider, fromWalletAddress),
    );
  } catch (err) {
    sendErrorMessage(err.message);
    sendErrorMessage(err.stack);
    const railResponse: RailgunTransactionGasEstimateResponse = {
      error: sanitizeError(err).message,
    };
    return railResponse;
  }
};
