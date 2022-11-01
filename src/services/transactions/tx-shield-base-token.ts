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
import { getRelayAdaptContractForNetwork } from '../railgun/core/providers';
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
  hexToBytes,
} from '@railgun-community/engine';
import { assertValidRailgunAddress } from '../railgun';

const generateShieldBaseTokenTransaction = async (
  networkName: NetworkName,
  railgunAddress: string,
  shieldPrivateKey: string,
  wrappedTokenAmount: RailgunWalletTokenAmount,
): Promise<PopulatedTransaction> => {
  try {
    const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);
    const { masterPublicKey, viewingPublicKey } =
      RailgunEngine.decodeAddress(railgunAddress);
    const random = randomHex(16);

    const amount = BigInt(wrappedTokenAmount.amountString);
    const wrappedAddress = wrappedTokenAmount.tokenAddress;

    const shield = new ShieldNote(
      masterPublicKey,
      random,
      amount,
      wrappedAddress,
    );

    const shieldRequest = await shield.serialize(
      hexToBytes(shieldPrivateKey),
      viewingPublicKey,
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
  shieldPrivateKey: string,
  wrappedTokenAmount: RailgunWalletTokenAmount,
  gasDetailsSerialized: TransactionGasDetailsSerialized,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    assertValidRailgunAddress(railgunAddress);

    const populatedTransaction = await generateShieldBaseTokenTransaction(
      networkName,
      railgunAddress,
      shieldPrivateKey,
      wrappedTokenAmount,
    );

    const sendWithPublicWallet = true;

    setGasDetailsForPopulatedTransaction(
      networkName,
      populatedTransaction,
      gasDetailsSerialized,
      sendWithPublicWallet,
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
  shieldPrivateKey: string,
  wrappedTokenAmount: RailgunWalletTokenAmount,
  fromWalletAddress: string,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    assertValidRailgunAddress(railgunAddress);
    assertNotBlockedAddress(fromWalletAddress);

    const populatedTransaction = await generateShieldBaseTokenTransaction(
      networkName,
      railgunAddress,
      shieldPrivateKey,
      wrappedTokenAmount,
    );

    const sendWithPublicWallet = true;
    return gasEstimateResponse(
      await getGasEstimate(
        networkName,
        populatedTransaction,
        fromWalletAddress,
        sendWithPublicWallet,
      ),
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
