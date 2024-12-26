import {
  TransactionHistoryTransferTokenAmount,
  TransactionHistoryTokenAmount,
  TransactionHistoryEntry,
  Chain,
  TransactionHistoryReceiveTokenAmount,
  TokenType,
  ByteLength,
  ByteUtils,
  TransactionHistoryUnshieldTokenAmount,
  WalletBalanceBucket,
} from '@railgun-community/engine';
import {
  TransactionHistoryItem,
  RailgunHistoryERC20Amount,
  RailgunHistorySendERC20Amount,
  RailgunHistoryReceiveERC20Amount,
  RailgunHistorySendNFTAmount,
  RailgunHistoryNFTAmount,
  RailgunHistoryReceiveNFTAmount,
  RailgunHistoryUnshieldERC20Amount,
  RailgunHistoryUnshieldNFTAmount,
  TransactionHistoryItemCategory,
  RailgunWalletBalanceBucket,
} from '@railgun-community/shared-models';
import { parseRailgunTokenAddress } from '../util/bytes';
import { reportAndSanitizeError } from '../../../utils/error';
import { walletForID } from '../wallets/wallets';

const getRailgunBalanceBucketFromEngineBalanceBucket = (
  balanceBucket: WalletBalanceBucket,
): RailgunWalletBalanceBucket => {
  switch (balanceBucket) {
    case WalletBalanceBucket.Spendable:
      return RailgunWalletBalanceBucket.Spendable;
    case WalletBalanceBucket.ShieldBlocked:
      return RailgunWalletBalanceBucket.ShieldBlocked;
    case WalletBalanceBucket.ShieldPending:
      return RailgunWalletBalanceBucket.ShieldPending;
    case WalletBalanceBucket.ProofSubmitted:
      return RailgunWalletBalanceBucket.ProofSubmitted;
    case WalletBalanceBucket.MissingInternalPOI:
      return RailgunWalletBalanceBucket.MissingInternalPOI;
    case WalletBalanceBucket.MissingExternalPOI:
      return RailgunWalletBalanceBucket.MissingExternalPOI;
    case WalletBalanceBucket.Spent:
      return RailgunWalletBalanceBucket.Spent;
  }
  throw new Error('Unrecognized WalletBalanceBucket');
};

const transactionHistoryReceiveTokenAmountToRailgunERC20Amount = (
  transactionHistoryReceiveTokenAmount: TransactionHistoryReceiveTokenAmount,
): RailgunHistoryReceiveERC20Amount => {
  return {
    ...transactionHistoryTokenAmountToRailgunERC20Amount(
      transactionHistoryReceiveTokenAmount,
    ),
    memoText: transactionHistoryReceiveTokenAmount.memoText,
    senderAddress: transactionHistoryReceiveTokenAmount.senderAddress,
    shieldFee: transactionHistoryReceiveTokenAmount.shieldFee,
    hasValidPOIForActiveLists:
      transactionHistoryReceiveTokenAmount.hasValidPOIForActiveLists,
    balanceBucket: getRailgunBalanceBucketFromEngineBalanceBucket(
      transactionHistoryReceiveTokenAmount.balanceBucket,
    ),
  };
};

const transactionHistoryReceiveNFTToRailgunNFTAmount = (
  transactionHistoryReceiveTokenAmount: TransactionHistoryReceiveTokenAmount,
): RailgunHistoryReceiveNFTAmount => {
  return {
    ...transactionHistoryNFTToRailgunNFTAmount(
      transactionHistoryReceiveTokenAmount,
    ),
    memoText: transactionHistoryReceiveTokenAmount.memoText,
    senderAddress: transactionHistoryReceiveTokenAmount.senderAddress,
    shieldFee: transactionHistoryReceiveTokenAmount.shieldFee,
    hasValidPOIForActiveLists:
      transactionHistoryReceiveTokenAmount.hasValidPOIForActiveLists,
    balanceBucket: getRailgunBalanceBucketFromEngineBalanceBucket(
      transactionHistoryReceiveTokenAmount.balanceBucket,
    ),
  };
};

const transactionHistoryTransferTokenAmountToRailgunERC20Amount = (
  transactionHistoryTokenAmount: TransactionHistoryTransferTokenAmount,
): RailgunHistorySendERC20Amount => {
  return {
    ...transactionHistoryTokenAmountToRailgunERC20Amount(
      transactionHistoryTokenAmount,
    ),
    recipientAddress: transactionHistoryTokenAmount.recipientAddress,
    memoText: transactionHistoryTokenAmount.memoText,
    walletSource: transactionHistoryTokenAmount.walletSource,
    hasValidPOIForActiveLists:
      transactionHistoryTokenAmount.hasValidPOIForActiveLists,
  };
};

const transactionHistoryUnshieldTokenAmountToRailgunERC20Amount = (
  transactionHistoryUnshieldTokenAmount: TransactionHistoryUnshieldTokenAmount,
): RailgunHistoryUnshieldERC20Amount => {
  return {
    ...transactionHistoryTransferTokenAmountToRailgunERC20Amount(
      transactionHistoryUnshieldTokenAmount,
    ),
    unshieldFee: transactionHistoryUnshieldTokenAmount.unshieldFee,
    hasValidPOIForActiveLists:
      transactionHistoryUnshieldTokenAmount.hasValidPOIForActiveLists,
  };
};

const transactionHistoryTransferNFTToRailgunNFTAmount = (
  transactionHistoryNFT: TransactionHistoryTransferTokenAmount,
): RailgunHistorySendNFTAmount => {
  return {
    ...transactionHistoryNFTToRailgunNFTAmount(transactionHistoryNFT),
    memoText: transactionHistoryNFT.memoText,
    walletSource: transactionHistoryNFT.walletSource,
    recipientAddress: transactionHistoryNFT.recipientAddress,
    hasValidPOIForActiveLists: transactionHistoryNFT.hasValidPOIForActiveLists,
  };
};

const transactionHistoryUnshieldNFTToRailgunNFTAmount = (
  transactionHistoryNFT: TransactionHistoryUnshieldTokenAmount,
): RailgunHistoryUnshieldNFTAmount => {
  return {
    ...transactionHistoryTransferNFTToRailgunNFTAmount(transactionHistoryNFT),
    unshieldFee: transactionHistoryNFT.unshieldFee,
    hasValidPOIForActiveLists: transactionHistoryNFT.hasValidPOIForActiveLists,
  };
};

const transactionHistoryTokenAmountToRailgunERC20Amount = (
  transactionHistoryTokenAmount: TransactionHistoryTokenAmount,
): RailgunHistoryERC20Amount => {
  return {
    tokenAddress: parseRailgunTokenAddress(
      transactionHistoryTokenAmount.tokenData.tokenAddress,
    ).toLowerCase(),
    amount: transactionHistoryTokenAmount.amount,
    hasValidPOIForActiveLists:
      transactionHistoryTokenAmount.hasValidPOIForActiveLists,
  };
};

const transactionHistoryNFTToRailgunNFTAmount = (
  transactionHistoryNFT: TransactionHistoryTokenAmount,
): RailgunHistoryNFTAmount => {
  return {
    nftAddress: parseRailgunTokenAddress(
      transactionHistoryNFT.tokenData.tokenAddress,
    ).toLowerCase(),
    nftTokenType: transactionHistoryNFT.tokenData.tokenType as 1 | 2,
    tokenSubID: transactionHistoryNFT.tokenData.tokenSubID,
    amount: transactionHistoryNFT.amount,
    hasValidPOIForActiveLists: transactionHistoryNFT.hasValidPOIForActiveLists,
  };
};

const filterERC20 = (tokenAmount: TransactionHistoryTokenAmount) => {
  return tokenAmount.tokenData.tokenType === TokenType.ERC20;
};

const filterNFT = (tokenAmount: TransactionHistoryTokenAmount) => {
  switch (tokenAmount.tokenData.tokenType) {
    case TokenType.ERC20:
      return false;
    case TokenType.ERC721:
    case TokenType.ERC1155:
      return tokenAmount.amount > BigInt(0);
  }
};

const receiveERC20AmountsHaveShieldFee = (
  receiveERC20Amounts: RailgunHistoryReceiveERC20Amount[],
): boolean => {
  return receiveERC20Amounts.find(amount => amount.shieldFee) != null;
};

export const categoryForTransactionHistoryItem = (
  historyItem: TransactionHistoryItem,
): TransactionHistoryItemCategory => {
  const hasTransferNFTs = historyItem.transferNFTAmounts.length > 0;
  const hasReceiveNFTs = historyItem.receiveNFTAmounts.length > 0;
  const hasUnshieldNFTs = historyItem.unshieldNFTAmounts.length > 0;
  if (hasTransferNFTs || hasReceiveNFTs || hasUnshieldNFTs) {
    // Some kind of NFT Transfer. Unhandled case.
    return TransactionHistoryItemCategory.Unknown;
  }

  const hasTransferERC20s = historyItem.transferERC20Amounts.length > 0;
  const hasReceiveERC20s = historyItem.receiveERC20Amounts.length > 0;
  const hasUnshieldERC20s = historyItem.unshieldERC20Amounts.length > 0;

  if (hasTransferERC20s && !hasReceiveERC20s && !hasUnshieldERC20s) {
    // Only transfer erc20s.
    return TransactionHistoryItemCategory.TransferSendERC20s;
  }

  if (!hasTransferERC20s && hasReceiveERC20s && !hasUnshieldERC20s) {
    // Only receive erc20s.
    const hasShieldFee = receiveERC20AmountsHaveShieldFee(
      historyItem.receiveERC20Amounts,
    );
    if (hasShieldFee) {
      // Note: Shield fees were added to contract events in Mar 2023.
      // Prior shields will show as TransferReceiveERC20s without fees.
      return TransactionHistoryItemCategory.ShieldERC20s;
    }
    return TransactionHistoryItemCategory.TransferReceiveERC20s;
  }

  if (!hasTransferERC20s && !hasReceiveERC20s && hasUnshieldERC20s) {
    // Only unshield erc20s.
    return TransactionHistoryItemCategory.UnshieldERC20s;
  }

  return TransactionHistoryItemCategory.Unknown;
};

const serializeTransactionHistory = (
  transactionHistory: TransactionHistoryEntry[],
): TransactionHistoryItem[] => {
  const historyItemsUncategorized: TransactionHistoryItem[] =
    transactionHistory.map(historyEntry => ({
      txidVersion: historyEntry.txidVersion,
      txid: ByteUtils.formatToByteLength(historyEntry.txid, ByteLength.UINT_256, true),
      blockNumber: historyEntry.blockNumber,
      timestamp: historyEntry.timestamp,
      transferERC20Amounts: historyEntry.transferTokenAmounts
        .filter(filterERC20)
        .map(transactionHistoryTransferTokenAmountToRailgunERC20Amount),
      broadcasterFeeERC20Amount: historyEntry.broadcasterFeeTokenAmount
        ? transactionHistoryTokenAmountToRailgunERC20Amount(
            historyEntry.broadcasterFeeTokenAmount,
          )
        : undefined,
      changeERC20Amounts: historyEntry.changeTokenAmounts
        .filter(filterERC20)
        .map(transactionHistoryTokenAmountToRailgunERC20Amount),
      receiveERC20Amounts: historyEntry.receiveTokenAmounts
        .filter(filterERC20)
        .map(transactionHistoryReceiveTokenAmountToRailgunERC20Amount),
      unshieldERC20Amounts: historyEntry.unshieldTokenAmounts
        .filter(filterERC20)
        .map(transactionHistoryUnshieldTokenAmountToRailgunERC20Amount),
      receiveNFTAmounts: historyEntry.receiveTokenAmounts
        .filter(filterNFT)
        .map(transactionHistoryReceiveNFTToRailgunNFTAmount),
      transferNFTAmounts: historyEntry.transferTokenAmounts
        .filter(filterNFT)
        .map(transactionHistoryTransferNFTToRailgunNFTAmount),
      unshieldNFTAmounts: historyEntry.unshieldTokenAmounts
        .filter(filterNFT)
        .map(transactionHistoryUnshieldNFTToRailgunNFTAmount),
      version: historyEntry.version,
      category: TransactionHistoryItemCategory.Unknown,
    }));

  // Add category for items based on token types.
  return historyItemsUncategorized.map(historyItem => ({
    ...historyItem,
    category: categoryForTransactionHistoryItem(historyItem),
  }));
};

export const getWalletTransactionHistory = async (
  chain: Chain,
  railgunWalletID: string,
  startingBlock: Optional<number>,
): Promise<TransactionHistoryItem[]> => {
  try {
    const wallet = walletForID(railgunWalletID);
    const transactionHistory = await wallet.getTransactionHistory(
      chain,
      startingBlock,
    );
    return serializeTransactionHistory(transactionHistory);
  } catch (err) {
    reportAndSanitizeError(getWalletTransactionHistory.name, err);
    throw new Error('Could not load RAILGUN wallet transaction history.', {
      cause: err,
    });
  }
};