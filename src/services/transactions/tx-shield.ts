import { PopulatedTransaction } from '@ethersproject/contracts';
import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  TransactionGasDetailsSerialized,
  NetworkName,
  sanitizeError,
  serializeUnsignedTransaction,
  RailgunWalletTokenAmountRecipient,
  RailgunNFTRecipient,
} from '@railgun-community/shared-models';
import {
  ShieldNote,
  RailgunEngine,
  ShieldRequestStruct,
  randomHex,
  hexToBytes,
  ShieldNoteERC20,
  ShieldNoteNFT,
} from '@railgun-community/engine';
import {
  gasEstimateResponse,
  getGasEstimate,
  setGasDetailsForPopulatedTransaction,
} from './tx-gas-details';
import { sendErrorMessage } from '../../utils/logger';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import {
  assertValidRailgunAddress,
  getRailgunSmartWalletContractForNetwork,
} from '../railgun';

export const getShieldPrivateKeySignatureMessage = () => {
  return ShieldNote.getShieldPrivateKeySignatureMessage();
};

const generateERC20Shield = async (
  tokenAmountRecipient: RailgunWalletTokenAmountRecipient,
  random: string,
  shieldPrivateKey: string,
) => {
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
};

const generateNFTShield = async (
  nftRecipient: RailgunNFTRecipient,
  random: string,
  shieldPrivateKey: string,
) => {
  const railgunAddress = nftRecipient.recipientAddress;

  assertValidRailgunAddress(railgunAddress);

  const { masterPublicKey, viewingPublicKey } =
    RailgunEngine.decodeAddress(railgunAddress);

  const shield = new ShieldNoteNFT(
    masterPublicKey,
    random,
    nftRecipient.nftAddress,
    nftRecipient.nftTokenType as 1 | 2,
    nftRecipient.tokenSubID,
  );
  return shield.serialize(hexToBytes(shieldPrivateKey), viewingPublicKey);
};

const generateShieldTransactions = async (
  networkName: NetworkName,
  shieldPrivateKey: string,
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[],
  nftRecipients: RailgunNFTRecipient[],
): Promise<PopulatedTransaction> => {
  try {
    const railgunSmartWalletContract =
      getRailgunSmartWalletContractForNetwork(networkName);
    const random = randomHex(16);

    const shieldInputs: ShieldRequestStruct[] = await Promise.all([
      ...tokenAmountRecipients.map(tokenAmountRecipient =>
        generateERC20Shield(tokenAmountRecipient, random, shieldPrivateKey),
      ),
      ...nftRecipients.map(nftRecipient =>
        generateNFTShield(nftRecipient, random, shieldPrivateKey),
      ),
    ]);

    const populatedTransaction =
      await railgunSmartWalletContract.generateShield(shieldInputs);
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
  nftRecipients: RailgunNFTRecipient[],
  gasDetailsSerialized: TransactionGasDetailsSerialized,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const populatedTransaction = await generateShieldTransactions(
      networkName,
      shieldPrivateKey,
      tokenAmountRecipients,
      nftRecipients,
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
  nftRecipients: RailgunNFTRecipient[],
  fromWalletAddress: string,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    assertNotBlockedAddress(fromWalletAddress);

    const populatedTransaction = await generateShieldTransactions(
      networkName,
      shieldPrivateKey,
      tokenAmountRecipients,
      nftRecipients,
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
