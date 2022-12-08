import { PopulatedTransaction } from '@ethersproject/contracts';
import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  TransactionGasDetailsSerialized,
  NetworkName,
  sanitizeError,
  serializeUnsignedTransaction,
  RailgunWalletTokenAmountRecipient,
} from '@railgun-community/shared-models';
import {
  ShieldNote,
  RailgunEngine,
  ShieldRequestStruct,
  randomHex,
  hexToBytes,
  ShieldNoteERC20,
} from '@railgun-community/engine';
import { getProxyContractForNetwork } from '../railgun/core/providers';
import {
  gasEstimateResponse,
  getGasEstimate,
  setGasDetailsForPopulatedTransaction,
} from './tx-gas-details';
import { sendErrorMessage } from '../../utils/logger';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import { assertValidRailgunAddress } from '../railgun';

export const getShieldPrivateKeySignatureMessage = () => {
  return ShieldNote.getShieldPrivateKeySignatureMessage();
};

const generateShieldERC20Transaction = async (
  networkName: NetworkName,
  shieldPrivateKey: string,
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[],
): Promise<PopulatedTransaction> => {
  try {
    const railContract = getProxyContractForNetwork(networkName);
    const random = randomHex(16);

    const shieldInputs: ShieldRequestStruct[] = await Promise.all(
      tokenAmountRecipients.map(tokenAmountRecipient => {
        const railgunAddress = tokenAmountRecipient.recipientAddress;

        assertValidRailgunAddress(railgunAddress);

        const { masterPublicKey, viewingPublicKey } =
          RailgunEngine.decodeAddress(railgunAddress);

        const shield = new ShieldNoteERC20(
          masterPublicKey,
          random,
          BigInt(tokenAmountRecipient.amountString),
          tokenAmountRecipient.tokenAddress,
        );
        return shield.serialize(hexToBytes(shieldPrivateKey), viewingPublicKey);
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
  shieldPrivateKey: string,
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[],
  gasDetailsSerialized: TransactionGasDetailsSerialized,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const populatedTransaction = await generateShieldERC20Transaction(
      networkName,
      shieldPrivateKey,
      tokenAmountRecipients,
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

export const gasEstimateForShield = async (
  networkName: NetworkName,
  shieldPrivateKey: string,
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[],
  fromWalletAddress: string,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    assertNotBlockedAddress(fromWalletAddress);

    const populatedTransaction = await generateShieldERC20Transaction(
      networkName,
      shieldPrivateKey,
      tokenAmountRecipients,
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
