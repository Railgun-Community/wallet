import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  RailgunERC20Amount,
  NetworkName,
  ProofType,
  FeeTokenDetails,
  RailgunERC20AmountRecipient,
  RailgunNFTAmountRecipient,
  TransactionGasDetails,
  TXIDVersion,
  NETWORK_CONFIG,
} from '@railgun-community/shared-models';
import {
  DUMMY_FROM_ADDRESS,
  generateDummyProofTransactions,
  generateTransact,
  generateUnshieldBaseToken,
} from './tx-generator';
import { populateProvedTransaction } from './proof-cache';
import {
  ByteUtils,
  TransactionStructV2,
  TransactionStructV3,
} from '@railgun-community/engine';
import { gasEstimateResponseDummyProofIterativeBroadcasterFee } from './tx-gas-broadcaster-fee-estimator';
import { createRelayAdaptUnshieldERC20AmountRecipients } from './tx-cross-contract-calls';
import { reportAndSanitizeError } from '../../utils/error';
import { gasEstimateResponse, getGasEstimate } from './tx-gas-details';
import {
  walletForID,
  getFallbackProviderForNetwork,
  getSerializedERC20Balances,
  getSerializedNFTBalances,
} from '../railgun';

export const populateProvedUnshield = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  broadcasterFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  gasDetails: TransactionGasDetails,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const { transaction, nullifiers, preTransactionPOIsPerTxidLeafPerList } =
      await populateProvedTransaction(
        txidVersion,
        networkName,
        ProofType.Unshield,
        railgunWalletID,
        false, // showSenderAddressToRecipient
        undefined, // memoText
        erc20AmountRecipients,
        nftAmountRecipients,
        undefined, // relayAdaptUnshieldERC20AmountRecipients
        undefined, // relayAdaptUnshieldNFTAmounts
        undefined, // relayAdaptShieldERC20Recipients
        undefined, // relayAdaptShieldNFTRecipients
        undefined, // crossContractCalls
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
        gasDetails,
      );
    return {
      nullifiers,
      transaction,
      preTransactionPOIsPerTxidLeafPerList,
    };
  } catch (err) {
    throw reportAndSanitizeError(populateProvedUnshield.name, err);
  }
};

export const populateProvedUnshieldBaseToken = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  wrappedERC20Amount: RailgunERC20Amount,
  broadcasterFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  gasDetails: TransactionGasDetails,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      {
        ...wrappedERC20Amount,
        recipientAddress: publicWalletAddress,
      },
    ];
    const relayAdaptUnshieldERC20Amounts: RailgunERC20Amount[] = [
      wrappedERC20Amount,
    ];

    // Empty NFT Recipients.
    const nftAmountRecipients: RailgunNFTAmountRecipient[] = [];

    const { transaction, nullifiers, preTransactionPOIsPerTxidLeafPerList } =
      await populateProvedTransaction(
        txidVersion,
        networkName,
        ProofType.UnshieldBaseToken,
        railgunWalletID,
        false, // showSenderAddressToRecipient
        undefined, // memoText
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        undefined, // relayAdaptUnshieldNFTAmounts
        undefined, // relayAdaptShieldERC20Recipients
        undefined, // relayAdaptShieldNFTRecipients
        undefined, // crossContractCalls
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
        gasDetails,
      );
    return {
      nullifiers,
      transaction,
      preTransactionPOIsPerTxidLeafPerList,
    };
  } catch (err) {
    throw reportAndSanitizeError(populateProvedUnshieldBaseToken.name, err);
  }
};

export const gasEstimateForUnprovenUnshield = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  originalGasDetails: TransactionGasDetails,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    const overallBatchMinGasPrice = 0n;

    const response = await gasEstimateResponseDummyProofIterativeBroadcasterFee(
      (broadcasterFeeERC20Amount: Optional<RailgunERC20Amount>) =>
        generateDummyProofTransactions(
          ProofType.Unshield,
          networkName,
          railgunWalletID,
          txidVersion,
          encryptionKey,
          false, // showSenderAddressToRecipient
          undefined, // memoText
          erc20AmountRecipients,
          nftAmountRecipients,
          broadcasterFeeERC20Amount,
          sendWithPublicWallet,
          overallBatchMinGasPrice,
        ),
      (txs: (TransactionStructV2 | TransactionStructV3)[]) =>
        generateTransact(
          txidVersion,
          txs,
          networkName,
          true, // useDummyProof
        ),
      txidVersion,
      networkName,
      railgunWalletID,
      erc20AmountRecipients,
      originalGasDetails,
      feeTokenDetails,
      sendWithPublicWallet,
      false, // isCrossContractCall
    );
    return response;
  } catch (err) {
    throw reportAndSanitizeError(gasEstimateForUnprovenUnshield.name, err);
  }
};

export const gasEstimateForUnprovenUnshieldBaseToken = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  wrappedERC20Amount: RailgunERC20Amount,
  originalGasDetails: TransactionGasDetails,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    const relayAdaptUnshieldERC20AmountRecipients: RailgunERC20AmountRecipient[] =
      createRelayAdaptUnshieldERC20AmountRecipients(txidVersion, networkName, [
        wrappedERC20Amount,
      ]);

    // Empty NFT Recipients.
    const nftAmountRecipients: RailgunNFTAmountRecipient[] = [];

    const overallBatchMinGasPrice = 0n;

    const response = await gasEstimateResponseDummyProofIterativeBroadcasterFee(
      (broadcasterFeeERC20Amount: Optional<RailgunERC20Amount>) =>
        generateDummyProofTransactions(
          ProofType.UnshieldBaseToken,
          networkName,
          railgunWalletID,
          txidVersion,
          encryptionKey,
          false, // showSenderAddressToRecipient
          undefined, // memoText
          relayAdaptUnshieldERC20AmountRecipients,
          nftAmountRecipients,
          broadcasterFeeERC20Amount,
          sendWithPublicWallet,
          overallBatchMinGasPrice,
        ),
      (txs: (TransactionStructV2 | TransactionStructV3)[]) => {
        const relayAdaptParamsRandom = ByteUtils.randomHex(31);
        return generateUnshieldBaseToken(
          txidVersion,
          txs,
          networkName,
          publicWalletAddress,
          relayAdaptParamsRandom,
          true, // useDummyProof
        );
      },
      txidVersion,
      networkName,
      railgunWalletID,
      relayAdaptUnshieldERC20AmountRecipients,
      originalGasDetails,
      feeTokenDetails,
      sendWithPublicWallet,
      false, // isCrossContractCall
    );
    return response;
  } catch (err) {
    throw reportAndSanitizeError(
      gasEstimateForUnprovenUnshieldBaseToken.name,
      err,
    );
  }
};

export const getERC20AndNFTAmountRecipientsForUnshieldToOrigin = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  originalShieldTxid: string,
): Promise<{
  erc20AmountRecipients: RailgunERC20AmountRecipient[];
  nftAmountRecipients: RailgunNFTAmountRecipient[];
}> => {
  const wallet = walletForID(railgunWalletID);
  const chain = NETWORK_CONFIG[networkName].chain;

  const balances = await wallet.getTokenBalancesForUnshieldToOrigin(
    txidVersion,
    chain,
    originalShieldTxid,
  );

  const provider = getFallbackProviderForNetwork(networkName);
  const transaction = await provider.getTransaction(originalShieldTxid);
  if (!transaction) {
    throw new Error('Could not find shield transaction from RPC');
  }

  const recipientAddress = transaction.from;
  const erc20Amounts = getSerializedERC20Balances(balances);
  const nftAmounts = getSerializedNFTBalances(balances);
  const erc20AmountRecipients: RailgunERC20AmountRecipient[] = erc20Amounts
    .filter(({ amount }) => amount > 0n)
    .map(erc20Amount => ({
      ...erc20Amount,
      recipientAddress,
    }));
  const nftAmountRecipients: RailgunNFTAmountRecipient[] = nftAmounts
    .filter(({ amount }) => amount > 0n)
    .map(nftAmount => ({
      ...nftAmount,
      recipientAddress,
    }));
  return { erc20AmountRecipients, nftAmountRecipients };
};

export const populateProvedUnshieldToOrigin = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  gasDetails: TransactionGasDetails,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const { transaction, nullifiers, preTransactionPOIsPerTxidLeafPerList } =
      await populateProvedTransaction(
        txidVersion,
        networkName,
        ProofType.Unshield,
        railgunWalletID,
        false, // showSenderAddressToRecipient
        undefined, // memoText
        erc20AmountRecipients,
        nftAmountRecipients,
        undefined, // relayAdaptUnshieldERC20AmountRecipients
        undefined, // relayAdaptUnshieldNFTAmounts
        undefined, // relayAdaptShieldERC20Recipients
        undefined, // relayAdaptShieldNFTRecipients
        undefined, // crossContractCalls
        undefined, // broadcasterFeeERC20AmountRecipient
        true, // sendWithPublicWallet
        undefined, // overallBatchMinGasPrice
        gasDetails,
      );
    return {
      nullifiers,
      transaction,
      preTransactionPOIsPerTxidLeafPerList,
    };
  } catch (err) {
    throw reportAndSanitizeError(populateProvedUnshieldToOrigin.name, err);
  }
};

export const gasEstimateForUnprovenUnshieldToOrigin = async (
  originalShieldTxid: string,
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    // Use dead address for private transaction gas estimate
    const fromWalletAddress = DUMMY_FROM_ADDRESS;

    const overallBatchMinGasPrice = 0n;

    const serializedTransactions = await generateDummyProofTransactions(
      ProofType.Unshield,
      networkName,
      railgunWalletID,
      txidVersion,
      encryptionKey,
      false, // showSenderAddressToRecipient
      undefined, // memoText
      erc20AmountRecipients,
      nftAmountRecipients,
      undefined, // broadcasterFeeERC20Amount
      true, // sendWithPublicWallet
      overallBatchMinGasPrice,
      originalShieldTxid, // originShieldTxidForSpendabilityOverride
    );
    const transaction = await generateTransact(
      txidVersion,
      serializedTransactions,
      networkName,
      true, // useDummyProof
    );

    const gasEstimate = await getGasEstimate(
      txidVersion,
      networkName,
      transaction,
      fromWalletAddress,
      true, // sendWithPublicWallet
      false, // isCrossContractCall
    );

    return gasEstimateResponse(
      gasEstimate,
      undefined, // broadcasterFeeCommitment
      true, // isGasEstimateWithDummyProof
    );
  } catch (err) {
    throw reportAndSanitizeError(
      gasEstimateForUnprovenUnshieldToOrigin.name,
      err,
    );
  }
};
