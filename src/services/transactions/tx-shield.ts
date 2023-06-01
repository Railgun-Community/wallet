import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  NetworkName,
  RailgunERC20AmountRecipient,
  RailgunNFTAmountRecipient,
  NFTTokenType,
  TransactionGasDetails,
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
  setGasDetailsForTransaction,
} from './tx-gas-details';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import {
  assertValidRailgunAddress,
  getRailgunSmartWalletContractForNetwork,
} from '../railgun';
import { createNFTTokenDataFromRailgunNFTAmount } from './tx-cross-contract-calls';
import { reportAndSanitizeError } from '../../utils/error';
import { ContractTransaction } from 'ethers';

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
    erc20AmountRecipient.amount,
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
      : nftAmountRecipient.amount;

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
): Promise<ContractTransaction> => {
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

    const transaction = await railgunSmartWalletContract.generateShield(
      shieldInputs,
    );
    return transaction;
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
  gasDetails?: TransactionGasDetails,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const transaction = await generateShieldTransactions(
      networkName,
      shieldPrivateKey,
      erc20AmountRecipients,
      nftAmountRecipients,
    );

    if (gasDetails) {
      const sendWithPublicWallet = true;
      setGasDetailsForTransaction(
        networkName,
        transaction,
        gasDetails,
        sendWithPublicWallet,
      );
    }

    return {
      transaction,
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

    const transaction = await generateShieldTransactions(
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
        transaction,
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
