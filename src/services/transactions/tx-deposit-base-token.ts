import { PopulatedTransaction } from '@ethersproject/contracts';
import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  RailgunWalletTokenAmount,
  TransactionGasDetailsSerialized,
  NetworkName,
  NETWORK_CONFIG,
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
import { walletForID } from '../railgun/core/engine';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import { randomHex , ERC20Deposit , RailgunEngine } from '@railgun-community/engine';

const generateDepositBaseTokenTransaction = async (
  networkName: NetworkName,
  railgunWalletID: string,
  wrappedTokenAmount: RailgunWalletTokenAmount,
): Promise<PopulatedTransaction> => {
  try {
    const railgunWallet = walletForID(railgunWalletID);
    const { chain } = NETWORK_CONFIG[networkName];
    const railgunAddress = railgunWallet.getAddress(chain);
    const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);
    const { masterPublicKey } = RailgunEngine.decodeAddress(railgunAddress);
    const vpk = railgunWallet.getViewingKeyPair().privateKey;
    const random = randomHex(16);

    const amount = BigInt(wrappedTokenAmount.amountString);
    const wrappedAddress = wrappedTokenAmount.tokenAddress;

    const deposit = new ERC20Deposit(
      masterPublicKey,
      random,
      amount,
      wrappedAddress,
    );
    const depositInput = deposit.serialize(vpk);

    const populatedTransaction =
      await relayAdaptContract.populateDepositBaseToken(depositInput);

    return populatedTransaction;
  } catch (err) {
    sendErrorMessage(err.message);
    sendErrorMessage(err.stack);
    throw sanitizeError(err);
  }
};

export const populateDepositBaseToken = async (
  networkName: NetworkName,
  railgunWalletID: string,
  wrappedTokenAmount: RailgunWalletTokenAmount,
  gasDetailsSerialized: Optional<TransactionGasDetailsSerialized>,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const populatedTransaction = await generateDepositBaseTokenTransaction(
      networkName,
      railgunWalletID,
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

export const gasEstimateForDepositBaseToken = async (
  networkName: NetworkName,
  railgunWalletID: string,
  wrappedTokenAmount: RailgunWalletTokenAmount,
  fromWalletAddress: string,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    assertNotBlockedAddress(fromWalletAddress);

    const populatedTransaction = await generateDepositBaseTokenTransaction(
      networkName,
      railgunWalletID,
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