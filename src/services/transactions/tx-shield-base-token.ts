import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  RailgunERC20Amount,
  NetworkName,
  TransactionGasDetails,
} from '@railgun-community/shared-models';
import {
  gasEstimateResponse,
  getGasEstimate,
  setGasDetailsForTransaction,
} from './tx-gas-details';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import {
  randomHex,
  ShieldNoteERC20,
  RailgunEngine,
  hexToBytes,
} from '@railgun-community/engine';
import { getRelayAdaptContractForNetwork } from '../railgun/core/contracts';
import { reportAndSanitizeError } from '../../utils/error';
import { ContractTransaction } from 'ethers';
import { assertValidRailgunAddress } from '../railgun/wallets/wallets';

const generateShieldBaseTokenTransaction = async (
  networkName: NetworkName,
  railgunAddress: string,
  shieldPrivateKey: string,
  wrappedERC20Amount: RailgunERC20Amount,
): Promise<ContractTransaction> => {
  try {
    const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);
    const { masterPublicKey, viewingPublicKey } =
      RailgunEngine.decodeAddress(railgunAddress);
    const random = randomHex(16);

    const { amount, tokenAddress } = wrappedERC20Amount;

    const shield = new ShieldNoteERC20(
      masterPublicKey,
      random,
      amount,
      tokenAddress,
    );

    const shieldRequest = await shield.serialize(
      hexToBytes(shieldPrivateKey),
      viewingPublicKey,
    );

    const transaction = await relayAdaptContract.populateShieldBaseToken(
      shieldRequest,
    );

    return transaction;
  } catch (err) {
    const sanitizedError = reportAndSanitizeError(
      generateShieldBaseTokenTransaction.name,
      err,
    );
    throw sanitizedError;
  }
};

export const populateShieldBaseToken = async (
  networkName: NetworkName,
  railgunAddress: string,
  shieldPrivateKey: string,
  wrappedERC20Amount: RailgunERC20Amount,
  gasDetails?: TransactionGasDetails,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    assertValidRailgunAddress(railgunAddress);

    const transaction = await generateShieldBaseTokenTransaction(
      networkName,
      railgunAddress,
      shieldPrivateKey,
      wrappedERC20Amount,
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
    throw reportAndSanitizeError(populateShieldBaseToken.name, err);
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

    const transaction = await generateShieldBaseTokenTransaction(
      networkName,
      railgunAddress,
      shieldPrivateKey,
      wrappedERC20Amount,
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
    throw reportAndSanitizeError(gasEstimateForShieldBaseToken.name, err);
  }
};
