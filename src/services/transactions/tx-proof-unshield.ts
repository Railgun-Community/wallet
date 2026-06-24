import {
  RailgunERC20Amount,
  NetworkName,
  ProofType,
  RailgunERC20AmountRecipient,
  RailgunNFTAmountRecipient,
  TXIDVersion,
} from '@railgun-community/shared-models';
import {
  GenerateTransactionsProgressCallback,
  generateDummyProofTransactions,
  generateProofTransactions,
  generateTransact,
  nullifiersForTransactions,
} from './tx-generator';
import {
  assertValidEthAddress,
  getCurrentEphemeralAddress,
} from '../railgun/wallets/wallets';
import { setCachedProvedTransaction } from './proof-cache';
import {
  AdaptID,
  ByteUtils,
  RelayAdapt7702Helper,
  TransactionStructV2,
} from '@railgun-community/engine';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import { reportAndSanitizeError } from '../../utils/error';
import {
  createRelayAdapt7702UnshieldBaseTokenERC20AmountRecipients,
  createUnshieldBaseTokenActionData7702,
  createUnshieldBaseTokenTransaction7702,
} from './tx-unshield-base-token-7702';

export const generateUnshieldProof = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  broadcasterFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  progressCallback: GenerateTransactionsProgressCallback,
  mnemonicPassword?: string,
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
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        undefined, // relayAdaptID
        false, // useDummyProof
        overallBatchMinGasPrice,
        progressCallback,
        undefined, // originShieldTxidForSpendabilityOverride
        mnemonicPassword,
      );
    const transaction = await generateTransact(
      txidVersion,
      provedTransactions,
      networkName,
    );

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
      broadcasterFeeERC20AmountRecipient,
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
  progressCallback: GenerateTransactionsProgressCallback,
  mnemonicPassword?: string,
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
        undefined, // broadcasterFeeERC20AmountRecipient
        true, // sendWithPublicWallet
        undefined, // relayAdaptID
        false, // useDummyProof
        undefined, // overallBatchMinGasPrice
        progressCallback,
        originalShieldTxid,
        mnemonicPassword,
      );
    const transaction = await generateTransact(
      txidVersion,
      provedTransactions,
      networkName,
    );

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
      broadcasterFeeERC20AmountRecipient: undefined,
      transaction,
      sendWithPublicWallet: true,
      preTransactionPOIsPerTxidLeafPerList,
      overallBatchMinGasPrice: undefined,
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
  broadcasterFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  progressCallback: GenerateTransactionsProgressCallback,
  mnemonicPassword?: string,
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

    const ephemeralAddress = await getCurrentEphemeralAddress(
      railgunWalletID,
      encryptionKey,
      networkName,
      mnemonicPassword,
    );

    const relayAdaptUnshieldERC20AmountRecipients: RailgunERC20AmountRecipient[] =
      createRelayAdapt7702UnshieldBaseTokenERC20AmountRecipients(
        [wrappedERC20Amount],
        ephemeralAddress,
      );

    // Empty NFT recipients.
    const nftAmountRecipients: RailgunNFTAmountRecipient[] = [];
    const relayAdaptUnshieldNFTAmountRecipients: RailgunNFTAmountRecipient[] =
      [];

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
      broadcasterFeeERC20AmountRecipient,
      sendWithPublicWallet,
      overallBatchMinGasPrice,
      undefined, // originShieldTxidForSpendabilityOverride
      mnemonicPassword,
    );

    const actionData = await createUnshieldBaseTokenActionData7702(
      txidVersion,
      networkName,
      publicWalletAddress,
      ephemeralAddress,
      sendWithPublicWallet,
    );

    const relayAdaptID: AdaptID = {
      contract: ephemeralAddress,
      parameters: RelayAdapt7702Helper.getZeroAdaptParams(),
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
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        relayAdaptID,
        false, // useDummyProof
        overallBatchMinGasPrice,
        progressCallback,
        undefined, // originShieldTxidForSpendabilityOverride
        mnemonicPassword,
      );

    const transaction = await createUnshieldBaseTokenTransaction7702(
      txidVersion,
      networkName,
      railgunWalletID,
      encryptionKey,
      provedTransactions,
      actionData,
      ephemeralAddress,
      mnemonicPassword,
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
      broadcasterFeeERC20AmountRecipient,
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
