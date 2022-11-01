import {
  RailgunProveTransactionResponse,
  RailgunWalletTokenAmount,
  NetworkName,
  ProofType,
  sanitizeError,
} from '@railgun-community/shared-models';
import {
  generateDummyProofTransactions,
  generateProofTransactions,
  generateTransact,
  generateUnshieldBaseToken,
} from './tx-generator';
import { sendErrorMessage } from '../../utils/logger';
import {
  assertValidEthAddress,
  assertValidRailgunAddress,
} from '../railgun/wallets/wallets';
import { setCachedProvedTransaction } from './proof-cache';
import { getRelayAdaptContractForNetwork } from '../railgun/core/providers';
import {
  AdaptID,
  ProverProgressCallback,
  randomHex,
} from '@railgun-community/engine';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import { BigNumber } from '@ethersproject/bignumber';

export const generateUnshieldProof = async (
  networkName: NetworkName,
  toWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  tokenAmounts: RailgunWalletTokenAmount[],
  relayerRailgunAddress: Optional<string>,
  relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>,
  sendWithPublicWallet: boolean,
  progressCallback: ProverProgressCallback,
): Promise<RailgunProveTransactionResponse> => {
  try {
    assertNotBlockedAddress(toWalletAddress);
    assertValidEthAddress(toWalletAddress);
    if (relayerRailgunAddress) {
      assertValidRailgunAddress(relayerRailgunAddress);
    }
    const publicWalletAddress = toWalletAddress;

    setCachedProvedTransaction(undefined);

    const txs = await generateProofTransactions(
      ProofType.Unshield,
      networkName,
      railgunWalletID,
      publicWalletAddress,
      encryptionKey,
      undefined, // memoText
      tokenAmounts,
      relayerRailgunAddress,
      relayerFeeTokenAmount,
      sendWithPublicWallet,
      progressCallback,
    );
    const populatedTransaction = await generateTransact(txs, networkName);

    setCachedProvedTransaction({
      proofType: ProofType.Unshield,
      toWalletAddress: publicWalletAddress,
      railgunWalletID,
      memoText: undefined,
      tokenAmounts,
      relayerRailgunAddress,
      relayerFeeTokenAmount,
      populatedTransaction,
      sendWithPublicWallet,
    });
    return {};
  } catch (err) {
    sendErrorMessage(err.stack);
    const railResponse: RailgunProveTransactionResponse = {
      error: sanitizeError(err).message,
    };
    return railResponse;
  }
};

export const generateUnshieldBaseTokenProof = async (
  networkName: NetworkName,
  toWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  wrappedTokenAmount: RailgunWalletTokenAmount,
  relayerRailgunAddress: Optional<string>,
  relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>,
  sendWithPublicWallet: boolean,
  progressCallback: ProverProgressCallback,
): Promise<RailgunProveTransactionResponse> => {
  // try {
  assertNotBlockedAddress(toWalletAddress);
  assertValidEthAddress(toWalletAddress);
  if (relayerRailgunAddress) {
    assertValidRailgunAddress(relayerRailgunAddress);
  }
  const publicWalletAddress = toWalletAddress;

  setCachedProvedTransaction(undefined);

  const tokenAmounts = [wrappedTokenAmount];

  const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);

  // Generate dummy txs for relay adapt params.
  const dummyTxs = await generateDummyProofTransactions(
    ProofType.UnshieldBaseToken,
    networkName,
    railgunWalletID,
    relayAdaptContract.address,
    encryptionKey,
    undefined, // memoText
    tokenAmounts,
    relayerFeeTokenAmount,
    sendWithPublicWallet,
  );

  const relayAdaptParamsRandom = randomHex(16);
  const value = BigNumber.from(wrappedTokenAmount.amountString).toHexString();
  const relayAdaptParams =
    await relayAdaptContract.getRelayAdaptParamsUnshieldBaseToken(
      dummyTxs,
      toWalletAddress,
      relayAdaptParamsRandom,
      value,
    );
  const relayAdaptID: AdaptID = {
    contract: relayAdaptContract.address,
    parameters: relayAdaptParams,
  };

  // Generate final txs with relay adapt ID.
  const txs = await generateProofTransactions(
    ProofType.UnshieldBaseToken,
    networkName,
    railgunWalletID,
    relayAdaptContract.address, // Unshield to relay contract.
    encryptionKey,
    undefined, // memoText
    tokenAmounts,
    relayerRailgunAddress,
    relayerFeeTokenAmount,
    sendWithPublicWallet,
    progressCallback,
    relayAdaptID,
    false, // useDummyProof
  );

  const populatedTransaction = await generateUnshieldBaseToken(
    txs,
    networkName,
    publicWalletAddress,
    relayAdaptParamsRandom,
    value,
    false, // useDummyProof
  );

  setCachedProvedTransaction({
    proofType: ProofType.UnshieldBaseToken,
    toWalletAddress: publicWalletAddress,
    railgunWalletID,
    memoText: undefined,
    tokenAmounts,
    relayerRailgunAddress,
    relayerFeeTokenAmount,
    sendWithPublicWallet,
    populatedTransaction,
  });
  return {};
  // } catch (err) {
  //   sendErrorMessage(err.stack);
  //   const railResponse: RailgunProveTransactionResponse = {
  //     error: sanitizeError(err).message,
  //   };
  //   return railResponse;
  // }
};
