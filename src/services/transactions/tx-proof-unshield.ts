import {
  RailgunERC20Amount,
  NetworkName,
  ProofType,
  RailgunERC20AmountRecipient,
  RailgunNFTAmountRecipient,
  TXIDVersion,
} from '@railgun-community/shared-models';
import {
  generateDummyProofTransactions,
  generateProofTransactions,
  generateTransact,
  generateUnshieldBaseToken,
  nullifiersForTransactions,
} from './tx-generator';
import { assertValidEthAddress } from '../railgun/wallets/wallets';
import { setCachedProvedTransaction } from './proof-cache';
import {
  AdaptID,
  ProverProgressCallback,
  randomHex,
} from '@railgun-community/engine';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import { createRelayAdaptUnshieldERC20AmountRecipients } from './tx-cross-contract-calls';
import { reportAndSanitizeError } from '../../utils/error';
import { getRelayAdaptContractForNetwork } from '../railgun/core/contracts';

export const generateUnshieldProof = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  progressCallback: ProverProgressCallback,
): Promise<void> => {
  try {
    setCachedProvedTransaction(undefined);

    const { provedTransactions, preTransactionPOIsPerTxidLeafPerList } =
      await generateProofTransactions(
        ProofType.Unshield,
        networkName,
        railgunWalletID,
        txidVersion,
        encryptionKey,
        false, // showSenderAddressToRecipient
        undefined, // memoText
        erc20AmountRecipients,
        nftAmountRecipients,
        relayerFeeERC20AmountRecipient,
        sendWithPublicWallet,
        undefined, // relayAdaptID
        false, // useDummyProof
        overallBatchMinGasPrice,
        progressCallback,
      );
    const transaction = await generateTransact(provedTransactions, networkName);

    const nullifiers = nullifiersForTransactions(provedTransactions);

    setCachedProvedTransaction({
      proofType: ProofType.Unshield,
      txidVersion,
      railgunWalletID,
      showSenderAddressToRecipient: false,
      memoText: undefined,
      erc20AmountRecipients,
      nftAmountRecipients,
      relayAdaptUnshieldERC20Amounts: undefined,
      relayAdaptUnshieldNFTAmounts: undefined,
      relayAdaptShieldERC20Recipients: undefined,
      relayAdaptShieldNFTRecipients: undefined,
      crossContractCalls: undefined,
      relayerFeeERC20AmountRecipient,
      transaction,
      sendWithPublicWallet,
      preTransactionPOIsPerTxidLeafPerList,
      overallBatchMinGasPrice,
      nullifiers,
    });
  } catch (err) {
    throw reportAndSanitizeError(generateUnshieldProof.name, err);
  }
};

export const generateUnshieldToOriginProof = async (
  originalShieldTxid: string,
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  overallBatchMinGasPrice: Optional<bigint>,
  progressCallback: ProverProgressCallback,
): Promise<void> => {
  try {
    setCachedProvedTransaction(undefined);

    const { provedTransactions, preTransactionPOIsPerTxidLeafPerList } =
      await generateProofTransactions(
        ProofType.Unshield,
        networkName,
        railgunWalletID,
        txidVersion,
        encryptionKey,
        false, // showSenderAddressToRecipient
        undefined, // memoText
        erc20AmountRecipients,
        nftAmountRecipients,
        undefined, // relayerFeeERC20AmountRecipient
        true, // sendWithPublicWallet
        undefined, // relayAdaptID
        false, // useDummyProof
        overallBatchMinGasPrice,
        progressCallback,
        originalShieldTxid,
      );
    const transaction = await generateTransact(provedTransactions, networkName);

    const nullifiers = nullifiersForTransactions(provedTransactions);

    setCachedProvedTransaction({
      proofType: ProofType.Unshield,
      txidVersion,
      railgunWalletID,
      showSenderAddressToRecipient: false,
      memoText: undefined,
      erc20AmountRecipients,
      nftAmountRecipients,
      relayAdaptUnshieldERC20Amounts: undefined,
      relayAdaptUnshieldNFTAmounts: undefined,
      relayAdaptShieldERC20Recipients: undefined,
      relayAdaptShieldNFTRecipients: undefined,
      crossContractCalls: undefined,
      relayerFeeERC20AmountRecipient: undefined,
      transaction,
      sendWithPublicWallet: true,
      preTransactionPOIsPerTxidLeafPerList,
      overallBatchMinGasPrice,
      nullifiers,
    });
  } catch (err) {
    throw reportAndSanitizeError(generateUnshieldProof.name, err);
  }
};

export const generateUnshieldBaseTokenProof = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  wrappedERC20Amount: RailgunERC20Amount,
  relayerFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  progressCallback: ProverProgressCallback,
): Promise<void> => {
  try {
    assertNotBlockedAddress(publicWalletAddress);
    assertValidEthAddress(publicWalletAddress);

    setCachedProvedTransaction(undefined);

    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      {
        ...wrappedERC20Amount,
        recipientAddress: publicWalletAddress,
      },
    ];

    const relayAdaptUnshieldERC20Amounts: RailgunERC20Amount[] = [
      wrappedERC20Amount,
    ];

    const relayAdaptUnshieldERC20AmountRecipients: RailgunERC20AmountRecipient[] =
      createRelayAdaptUnshieldERC20AmountRecipients(networkName, [
        wrappedERC20Amount,
      ]);

    // Empty NFT recipients.
    const nftAmountRecipients: RailgunNFTAmountRecipient[] = [];
    const relayAdaptUnshieldNFTAmountRecipients: RailgunNFTAmountRecipient[] =
      [];

    const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);

    // Generate dummy txs for relay adapt params.
    const dummyTxs = await generateDummyProofTransactions(
      ProofType.UnshieldBaseToken,
      networkName,
      railgunWalletID,
      txidVersion,
      encryptionKey,
      false, // showSenderAddressToRecipient
      undefined, // memoText
      relayAdaptUnshieldERC20AmountRecipients,
      relayAdaptUnshieldNFTAmountRecipients,
      relayerFeeERC20AmountRecipient,
      sendWithPublicWallet,
      overallBatchMinGasPrice,
    );

    const relayAdaptParamsRandom = randomHex(31);
    const relayAdaptParams =
      await relayAdaptContract.getRelayAdaptParamsUnshieldBaseToken(
        dummyTxs,
        publicWalletAddress,
        relayAdaptParamsRandom,
      );
    const relayAdaptID: AdaptID = {
      contract: relayAdaptContract.address,
      parameters: relayAdaptParams,
    };

    const showSenderAddressToRecipient = false;
    const memoText: Optional<string> = undefined;

    // Generate final txs with relay adapt ID.
    const { provedTransactions, preTransactionPOIsPerTxidLeafPerList } =
      await generateProofTransactions(
        ProofType.UnshieldBaseToken,
        networkName,
        railgunWalletID,
        txidVersion,
        encryptionKey,
        showSenderAddressToRecipient,
        memoText,
        relayAdaptUnshieldERC20AmountRecipients,
        relayAdaptUnshieldNFTAmountRecipients,
        relayerFeeERC20AmountRecipient,
        sendWithPublicWallet,
        relayAdaptID,
        false, // useDummyProof
        overallBatchMinGasPrice,
        progressCallback,
      );

    const transaction = await generateUnshieldBaseToken(
      provedTransactions,
      networkName,
      publicWalletAddress,
      relayAdaptParamsRandom,
      false, // useDummyProof
    );

    const nullifiers = nullifiersForTransactions(provedTransactions);

    setCachedProvedTransaction({
      proofType: ProofType.UnshieldBaseToken,
      txidVersion,
      railgunWalletID,
      showSenderAddressToRecipient,
      memoText,
      erc20AmountRecipients,
      nftAmountRecipients,
      relayAdaptUnshieldERC20Amounts,
      relayAdaptUnshieldNFTAmounts: undefined,
      relayAdaptShieldERC20Recipients: undefined,
      relayAdaptShieldNFTRecipients: undefined,
      crossContractCalls: undefined,
      relayerFeeERC20AmountRecipient,
      sendWithPublicWallet,
      transaction,
      preTransactionPOIsPerTxidLeafPerList,
      overallBatchMinGasPrice,
      nullifiers,
    });
  } catch (err) {
    throw reportAndSanitizeError(generateUnshieldBaseTokenProof.name, err);
  }
};
