import {
  TransactionHistoryTransferTokenAmount,
  TransactionHistoryTokenAmount,
  TransactionHistoryEntry,
  Chain,
  TransactionHistoryReceiveTokenAmount,
  TokenType,
  formatToByteLength,
  ByteLength,
  nToHex,
  TransactionHistoryUnshieldTokenAmount,
} from '@railgun-community/engine';
import {
  LoadRailgunWalletResponse,
  TransactionHistorySerializedResponse,
  TransactionHistoryItem,
  RailgunERC20Amount,
  RailgunSendERC20Amount,
  RailgunReceiveERC20Amount,
  RailgunSendNFTAmount,
  RailgunNFTAmount,
  RailgunReceiveNFTAmount,
  RailgunUnshieldERC20Amount,
  RailgunUnshieldNFTAmount,
  TransactionHistoryItemCategory,
} from '@railgun-community/shared-models';
import { walletForID } from '../core/engine';
import { BigNumber } from '@ethersproject/bignumber';
import { parseRailgunTokenAddress } from '../util/bytes';
import { reportAndSanitizeError } from '../../../utils/error';

const transactionHistoryReceiveTokenAmountToRailgunERC20Amount = (
  transactionHistoryReceiveTokenAmount: TransactionHistoryReceiveTokenAmount,
): RailgunReceiveERC20Amount => {
  return {
    ...transactionHistoryTokenAmountToRailgunERC20Amount(
      transactionHistoryReceiveTokenAmount,
    ),
    memoText: transactionHistoryReceiveTokenAmount.memoText,
    senderAddress: transactionHistoryReceiveTokenAmount.senderAddress,
    shieldFee: transactionHistoryReceiveTokenAmount.shieldFee,
  };
};

const transactionHistoryReceiveNFTToRailgunNFTAmount = (
  transactionHistoryReceiveTokenAmount: TransactionHistoryReceiveTokenAmount,
): RailgunReceiveNFTAmount => {
  return {
    ...transactionHistoryNFTToRailgunNFTAmount(
      transactionHistoryReceiveTokenAmount,
    ),
    memoText: transactionHistoryReceiveTokenAmount.memoText,
    senderAddress: transactionHistoryReceiveTokenAmount.senderAddress,
    shieldFee: transactionHistoryReceiveTokenAmount.shieldFee,
  };
};

const transactionHistoryTransferTokenAmountToRailgunERC20Amount = (
  transactionHistoryTokenAmount: TransactionHistoryTransferTokenAmount,
): RailgunSendERC20Amount => {
  const walletSource =
    transactionHistoryTokenAmount.noteAnnotationData?.walletSource;
  return {
    ...transactionHistoryTokenAmountToRailgunERC20Amount(
      transactionHistoryTokenAmount,
    ),
    recipientAddress: transactionHistoryTokenAmount.recipientAddress,
    memoText: transactionHistoryTokenAmount.memoText,
    walletSource,
  };
};

const transactionHistoryUnshieldTokenAmountToRailgunERC20Amount = (
  transactionHistoryUnshieldTokenAmount: TransactionHistoryUnshieldTokenAmount,
): RailgunUnshieldERC20Amount => {
  return {
    ...transactionHistoryTransferTokenAmountToRailgunERC20Amount(
      transactionHistoryUnshieldTokenAmount,
    ),
    unshieldFee: transactionHistoryUnshieldTokenAmount.unshieldFee,
  };
};

const transactionHistoryTransferNFTToRailgunNFTAmount = (
  transactionHistoryNFT: TransactionHistoryTransferTokenAmount,
): RailgunSendNFTAmount => {
  const walletSource = transactionHistoryNFT.noteAnnotationData?.walletSource;
  return {
    ...transactionHistoryNFTToRailgunNFTAmount(transactionHistoryNFT),
    memoText: transactionHistoryNFT.memoText,
    walletSource,
    recipientAddress: transactionHistoryNFT.recipientAddress,
  };
};

const transactionHistoryUnshieldNFTToRailgunNFTAmount = (
  transactionHistoryNFT: TransactionHistoryUnshieldTokenAmount,
): RailgunUnshieldNFTAmount => {
  return {
    ...transactionHistoryTransferNFTToRailgunNFTAmount(transactionHistoryNFT),
    unshieldFee: transactionHistoryNFT.unshieldFee,
  };
};

const transactionHistoryTokenAmountToRailgunERC20Amount = (
  transactionHistoryTokenAmount: TransactionHistoryTokenAmount,
): RailgunERC20Amount => {
  return {
    tokenAddress: parseRailgunTokenAddress(
      transactionHistoryTokenAmount.tokenData.tokenAddress,
    ).toLowerCase(),
    amountString: BigNumber.from(
      transactionHistoryTokenAmount.amount,
    ).toHexString(),
  };
};

const transactionHistoryNFTToRailgunNFTAmount = (
  transactionHistoryNFT: TransactionHistoryTokenAmount,
): RailgunNFTAmount => {
  return {
    nftAddress: parseRailgunTokenAddress(
      transactionHistoryNFT.tokenData.tokenAddress,
    ).toLowerCase(),
    nftTokenType: transactionHistoryNFT.tokenData.tokenType as 1 | 2,
    tokenSubID: transactionHistoryNFT.tokenData.tokenSubID,
    amountString: nToHex(
      transactionHistoryNFT.amount,
      ByteLength.UINT_256,
      true,
    ),
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
  receiveERC20Amounts: RailgunReceiveERC20Amount[],
): boolean => {
  return receiveERC20Amounts.find(amount => amount.shieldFee) != null;
};

const categoryForTransactionHistoryItem = (
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
      txid: formatToByteLength(historyEntry.txid, ByteLength.UINT_256, true),
      transferERC20Amounts: historyEntry.transferTokenAmounts
        .filter(filterERC20)
        .map(transactionHistoryTransferTokenAmountToRailgunERC20Amount),
      relayerFeeERC20Amount: historyEntry.relayerFeeTokenAmount
        ? transactionHistoryTokenAmountToRailgunERC20Amount(
            historyEntry.relayerFeeTokenAmount,
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
): Promise<TransactionHistorySerializedResponse> => {
  try {
    const wallet = walletForID(railgunWalletID);
    const transactionHistory = await wallet.getTransactionHistory(chain);
    return {
      items: serializeTransactionHistory(transactionHistory),
    };
  } catch (err) {
    reportAndSanitizeError(getWalletTransactionHistory.name, err);
    const response: LoadRailgunWalletResponse = {
      error: 'Could not load RAILGUN wallet transaction history.',
    };
    return response;
  }
};
