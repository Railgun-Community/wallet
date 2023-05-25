import { PopulatedTransaction } from '@ethersproject/contracts';
import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  TransactionGasDetailsSerialized,
  NetworkName,
  serializeUnsignedTransaction,
  RailgunERC20AmountRecipient,
  RailgunNFTAmountRecipient,
  NFTTokenType,
} from '@railgun-community/shared-models';
import {
  ShieldNote,
  RailgunEngine,
  ShieldRequestStruct,
  randomHex,
  hexToBytes,
  ShieldNoteERC20,
  ShieldNoteNFT,
  ERC721_NOTE_VALUE,
} from '@railgun-community/engine';
import {
  gasEstimateResponse,
  getGasEstimate,
  setGasDetailsForPopulatedTransaction,
} from './tx-gas-details';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import {
  assertValidRailgunAddress,
  getRailgunSmartWalletContractForNetwork,
} from '../railgun';
import { createNFTTokenDataFromRailgunNFTAmount } from './tx-cross-contract-calls';
import { reportAndSanitizeError } from '../../utils/error';

export const getShieldPrivateKeySignatureMessage = () => {
  return ShieldNote.getShieldPrivateKeySignatureMessage();
};

const generateERC20Shield = async (
  erc20AmountRecipient: RailgunERC20AmountRecipient,
  random: string,
  shieldPrivateKey: string,
) => {
  const railgunAddress = erc20AmountRecipient.recipientAddress;

  assertValidRailgunAddress(railgunAddress);

  const { masterPublicKey, viewingPublicKey } =
    RailgunEngine.decodeAddress(railgunAddress);

  const shield = new ShieldNoteERC20(
    masterPublicKey,
    random,
    BigInt(erc20AmountRecipient.amountString),
    erc20AmountRecipient.tokenAddress,
  );
  return shield.serialize(hexToBytes(shieldPrivateKey), viewingPublicKey);
};

const generateNFTShield = async (
  nftAmountRecipient: RailgunNFTAmountRecipient,
  random: string,
  shieldPrivateKey: string,
) => {
  const railgunAddress = nftAmountRecipient.recipientAddress;

  assertValidRailgunAddress(railgunAddress);

  const { masterPublicKey, viewingPublicKey } =
    RailgunEngine.decodeAddress(railgunAddress);

  const value =
    nftAmountRecipient.nftTokenType === NFTTokenType.ERC721
      ? ERC721_NOTE_VALUE
      : BigInt(nftAmountRecipient.amountString);

  const nftTokenData =
    createNFTTokenDataFromRailgunNFTAmount(nftAmountRecipient);

  const shield = new ShieldNoteNFT(
    masterPublicKey,
    random,
    value,
    nftTokenData,
  );
  return shield.serialize(hexToBytes(shieldPrivateKey), viewingPublicKey);
};

const generateShieldTransactions = async (
  networkName: NetworkName,
  shieldPrivateKey: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
): Promise<PopulatedTransaction> => {
  try {
    const railgunSmartWalletContract =
      getRailgunSmartWalletContractForNetwork(networkName);
    const random = randomHex(16);

    const shieldInputs: ShieldRequestStruct[] = await Promise.all([
      ...erc20AmountRecipients.map(erc20AmountRecipient =>
        generateERC20Shield(erc20AmountRecipient, random, shieldPrivateKey),
      ),
      ...nftAmountRecipients.map(nftAmountRecipient =>
        generateNFTShield(nftAmountRecipient, random, shieldPrivateKey),
      ),
    ]);

    const populatedTransaction =
      await railgunSmartWalletContract.generateShield(shieldInputs);
    return populatedTransaction;
  } catch (err) {
    const sanitizedError = reportAndSanitizeError(
      generateShieldTransactions.name,
      err,
    );
    throw sanitizedError;
  }
};

export const populateShield = async (
  networkName: NetworkName,
  shieldPrivateKey: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  gasDetailsSerialized?: TransactionGasDetailsSerialized,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const populatedTransaction = await generateShieldTransactions(
      networkName,
      shieldPrivateKey,
      erc20AmountRecipients,
      nftAmountRecipients,
    );

    if (gasDetailsSerialized) {
      const sendWithPublicWallet = true;
      setGasDetailsForPopulatedTransaction(
        networkName,
        populatedTransaction,
        gasDetailsSerialized,
        sendWithPublicWallet,
      );
    }

    return {
      serializedTransaction: serializeUnsignedTransaction(populatedTransaction),
    };
  } catch (err) {
    throw reportAndSanitizeError(populateShield.name, err);
  }
};

export const gasEstimateForShield = async (
  networkName: NetworkName,
  shieldPrivateKey: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  fromWalletAddress: string,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    assertNotBlockedAddress(fromWalletAddress);

    const populatedTransaction = await generateShieldTransactions(
      networkName,
      shieldPrivateKey,
      erc20AmountRecipients,
      nftAmountRecipients,
    );

    const sendWithPublicWallet = true;
    const isGasEstimateWithDummyProof = false;
    return gasEstimateResponse(
      await getGasEstimate(
        networkName,
        populatedTransaction,
        fromWalletAddress,
        sendWithPublicWallet,
        false, // isCrossContractCall
      ),
      undefined, // relayerFeeCommitment
      isGasEstimateWithDummyProof,
    );
  } catch (err) {
    throw reportAndSanitizeError(gasEstimateForShield.name, err);
  }
};
