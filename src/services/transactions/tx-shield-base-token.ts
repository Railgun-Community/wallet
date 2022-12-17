import { PopulatedTransaction } from '@ethersproject/contracts';
import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  RailgunERC20Amount,
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
  ShieldNoteERC20,
  RailgunEngine,
  hexToBytes,
} from '@railgun-community/engine';
import { assertValidRailgunAddress } from '../railgun';

const generateShieldBaseTokenTransaction = async (
  networkName: NetworkName,
  railgunAddress: string,
  shieldPrivateKey: string,
  wrappedERC20Amount: RailgunERC20Amount,
): Promise<PopulatedTransaction> => {
  try {
    const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);
    const { masterPublicKey, viewingPublicKey } =
      RailgunEngine.decodeAddress(railgunAddress);
    const random = randomHex(16);

    const amount = BigInt(wrappedERC20Amount.amountString);
    const wrappedAddress = wrappedERC20Amount.tokenAddress;

    const shield = new ShieldNoteERC20(
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
  wrappedERC20Amount: RailgunERC20Amount,
  gasDetailsSerialized: TransactionGasDetailsSerialized,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    assertValidRailgunAddress(railgunAddress);

    const populatedTransaction = await generateShieldBaseTokenTransaction(
      networkName,
      railgunAddress,
      shieldPrivateKey,
      wrappedERC20Amount,
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
  wrappedERC20Amount: RailgunERC20Amount,
  fromWalletAddress: string,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    assertValidRailgunAddress(railgunAddress);
    assertNotBlockedAddress(fromWalletAddress);

    const populatedTransaction = await generateShieldBaseTokenTransaction(
      networkName,
      railgunAddress,
      shieldPrivateKey,
      wrappedERC20Amount,
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
