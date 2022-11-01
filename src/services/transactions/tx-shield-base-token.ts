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
  getProviderForNetwork,
  getRelayAdaptContractForNetwork,
} from '../railgun/core/providers';
import {
  gasEstimateResponse,
  getGasEstimate,
  setGasDetailsForPopulatedTransaction,
} from './tx-gas-details';
import { sendErrorMessage } from '../../utils/logger';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import {
  randomHex,
  ShieldNote,
  RailgunEngine,
} from '@railgun-community/engine';
import { assertValidRailgunAddress, getRandomBytes } from '../railgun';

const generateShieldBaseTokenTransaction = async (
  networkName: NetworkName,
  railgunAddress: string,
  wrappedTokenAmount: RailgunWalletTokenAmount,
): Promise<PopulatedTransaction> => {
  try {
    const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);
    const { masterPublicKey } = RailgunEngine.decodeAddress(railgunAddress);
    const random = randomHex(16);

    const amount = BigInt(wrappedTokenAmount.amountString);
    const wrappedAddress = wrappedTokenAmount.tokenAddress;

    const receiverViewingPublicKey =
      RailgunEngine.decodeAddress(railgunAddress).viewingPublicKey;
    const shield = new ShieldNote(
      masterPublicKey,
      random,
      amount,
      wrappedAddress,
    );

    // Relay Adapt shieldPrivateKey is randomly generated.
    const shieldPrivateKey = getRandomBytes(32);

    const shieldRequest = await shield.serialize(
      Buffer.from(shieldPrivateKey),
      receiverViewingPublicKey,
    );

    const populatedTransaction =
      await relayAdaptContract.populateShieldBaseToken(shieldRequest);

    return populatedTransaction;
  } catch (err) {
    sendErrorMessage(err.message);
    sendErrorMessage(err.stack);
    throw sanitizeError(err);
  }
};

export const populateShieldBaseToken = async (
  networkName: NetworkName,
  railgunAddress: string,
  wrappedTokenAmount: RailgunWalletTokenAmount,
  gasDetailsSerialized: Optional<TransactionGasDetailsSerialized>,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    assertValidRailgunAddress(railgunAddress);

    const populatedTransaction = await generateShieldBaseTokenTransaction(
      networkName,
      railgunAddress,
      wrappedTokenAmount,
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

export const gasEstimateForShieldBaseToken = async (
  networkName: NetworkName,
  railgunAddress: string,
  wrappedTokenAmount: RailgunWalletTokenAmount,
  fromWalletAddress: string,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    assertValidRailgunAddress(railgunAddress);
    assertNotBlockedAddress(fromWalletAddress);

    const populatedTransaction = await generateShieldBaseTokenTransaction(
      networkName,
      railgunAddress,
      wrappedTokenAmount,
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
