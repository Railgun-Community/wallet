import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  RailgunERC20Amount,
  NetworkName,
  TransactionGasDetails,
  NETWORK_CONFIG,
  TXIDVersion,
} from '@railgun-community/shared-models';
import {
  gasEstimateResponse,
  getGasEstimate,
  setGasDetailsForTransaction,
} from './tx-gas-details';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import {
  ShieldNoteERC20,
  RailgunEngine,
  ByteUtils,
  RelayAdaptVersionedSmartContracts,
} from '@railgun-community/engine';
import { reportAndSanitizeError } from '../../utils/error';
import { ContractTransaction } from 'ethers';
import { assertValidRailgunAddress } from '../railgun/wallets/wallets';

const generateShieldBaseTokenTransaction = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunAddress: string,
  shieldPrivateKey: string,
  wrappedERC20Amount: RailgunERC20Amount,
): Promise<ContractTransaction> => {
  try {
    const { masterPublicKey, viewingPublicKey } =
      RailgunEngine.decodeAddress(railgunAddress);
    const random = ByteUtils.randomHex(16);

    const { amount, tokenAddress } = wrappedERC20Amount;

    const shield = new ShieldNoteERC20(
      masterPublicKey,
      random,
      amount,
      tokenAddress,
    );

    const shieldRequest = await shield.serialize(
      ByteUtils.hexToBytes(shieldPrivateKey),
      viewingPublicKey,
    );

    const { chain } = NETWORK_CONFIG[networkName];
    const transaction =
      await RelayAdaptVersionedSmartContracts.populateShieldBaseToken(
        txidVersion,
        chain,
        shieldRequest,
      );

    return transaction;
  } catch (err) {
    throw reportAndSanitizeError(generateShieldBaseTokenTransaction.name, err);
  }
};

export const populateShieldBaseToken = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunAddress: string,
  shieldPrivateKey: string,
  wrappedERC20Amount: RailgunERC20Amount,
  gasDetails?: TransactionGasDetails,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    assertValidRailgunAddress(railgunAddress);

    const transaction = await generateShieldBaseTokenTransaction(
      txidVersion,
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
      preTransactionPOIsPerTxidLeafPerList: {},
    };
  } catch (err) {
    throw reportAndSanitizeError(populateShieldBaseToken.name, err);
  }
};

export const gasEstimateForShieldBaseToken = async (
  txidVersion: TXIDVersion,
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
      txidVersion,
      networkName,
      railgunAddress,
      shieldPrivateKey,
      wrappedERC20Amount,
    );

    const sendWithPublicWallet = true;
    const isGasEstimateWithDummyProof = false;
    return gasEstimateResponse(
      await getGasEstimate(
        txidVersion,
        networkName,
        transaction,
        fromWalletAddress,
        sendWithPublicWallet,
        false, // isCrossContractCall
      ),
      undefined, // broadcasterFeeCommitment
      isGasEstimateWithDummyProof,
    );
  } catch (err) {
    throw reportAndSanitizeError(gasEstimateForShieldBaseToken.name, err);
  }
};
