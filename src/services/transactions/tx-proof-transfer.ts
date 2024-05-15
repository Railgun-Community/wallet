import {
  NetworkName,
  ProofType,
  RailgunERC20AmountRecipient,
  RailgunNFTAmountRecipient,
  TXIDVersion,
} from '@railgun-community/shared-models';
import {
  GenerateTransactionsProgressCallback,
  generateProofTransactions,
  generateTransact,
  nullifiersForTransactions,
} from './tx-generator';
import { setCachedProvedTransaction } from './proof-cache';
import { reportAndSanitizeError } from '../../utils/error';

export const generateTransferProof = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  broadcasterFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  progressCallback: GenerateTransactionsProgressCallback,
): Promise<void> => {
  try {
    setCachedProvedTransaction(undefined);

    const { provedTransactions, preTransactionPOIsPerTxidLeafPerList } =
      await generateProofTransactions(
        ProofType.Transfer,
        networkName,
        railgunWalletID,
        txidVersion,
        encryptionKey,
        showSenderAddressToRecipient,
        memoText,
        erc20AmountRecipients,
        nftAmountRecipients,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        undefined, // relayAdaptID
        false, // useDummyProof
        overallBatchMinGasPrice,
        progressCallback,
      );
    const transaction = await generateTransact(
      txidVersion,
      provedTransactions,
      networkName,
    );

    const nullifiers = nullifiersForTransactions(provedTransactions);

    setCachedProvedTransaction({
      proofType: ProofType.Transfer,
      txidVersion,
      railgunWalletID,
      showSenderAddressToRecipient,
      memoText,
      erc20AmountRecipients,
      nftAmountRecipients,
      relayAdaptUnshieldERC20Amounts: undefined,
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
    throw reportAndSanitizeError(generateTransferProof.name, err);
  }
};
