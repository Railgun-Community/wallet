import {
  TransactionHistoryTransferTokenAmount,
  TransactionHistoryTokenAmount,
  TransactionHistoryEntry,
  Chain,
  TransactionHistoryReceiveTokenAmount,
  TokenType,
} from '@railgun-community/engine';
import {
  LoadRailgunWalletResponse,
  TransactionHistorySerializedResponse,
  TransactionHistoryItem,
  RailgunWalletTokenAmount,
  RailgunWalletSendTokenAmount,
  RailgunWalletReceiveTokenAmount,
  RailgunWalletSendNFT,
  RailgunNFT,
  RailgunWalletReceiveNFT,
} from '@railgun-community/shared-models';
import { walletForID } from '../core/engine';
import { sendErrorMessage } from '../../../utils/logger';
import { BigNumber } from '@ethersproject/bignumber';
import { parseRailgunBalanceAddress } from '../util/bytes-util';

const transactionHistoryReceiveTokenAmountToRailgunTokenAmount = (
  transactionHistoryReceiveTokenAmount: TransactionHistoryReceiveTokenAmount,
): RailgunWalletReceiveTokenAmount => {
  return {
    ...transactionHistoryTokenAmountToRailgunTokenAmount(
      transactionHistoryReceiveTokenAmount,
    ),
    memoText: transactionHistoryReceiveTokenAmount.memoText,
    senderAddress: transactionHistoryReceiveTokenAmount.senderAddress,
  };
};

const transactionHistoryReceiveNFTToRailgunNFT = (
  transactionHistoryReceiveTokenAmount: TransactionHistoryReceiveTokenAmount,
): RailgunWalletReceiveNFT => {
  return {
    ...transactionHistoryNFTToRailgunNFT(transactionHistoryReceiveTokenAmount),
    memoText: transactionHistoryReceiveTokenAmount.memoText,
    senderAddress: transactionHistoryReceiveTokenAmount.senderAddress,
  };
};

const transactionHistoryTransferTokenAmountToRailgunTokenAmount = (
  transactionHistoryTokenAmount: TransactionHistoryTransferTokenAmount,
): RailgunWalletSendTokenAmount => {
  const walletSource =
    transactionHistoryTokenAmount.noteAnnotationData?.walletSource;
  return {
    ...transactionHistoryTokenAmountToRailgunTokenAmount(
      transactionHistoryTokenAmount,
    ),
    recipientAddress: transactionHistoryTokenAmount.recipientAddress,
    memoText: transactionHistoryTokenAmount.memoText,
    walletSource,
  };
};

const transactionHistoryTransferNFTToRailgunNFT = (
  transactionHistoryNFT: TransactionHistoryTransferTokenAmount,
): RailgunWalletSendNFT => {
  const walletSource = transactionHistoryNFT.noteAnnotationData?.walletSource;
  return {
    ...transactionHistoryNFTToRailgunNFT(transactionHistoryNFT),

    memoText: transactionHistoryNFT.memoText,
    walletSource,
  };
};

const transactionHistoryTokenAmountToRailgunTokenAmount = (
  transactionHistoryTokenAmount: TransactionHistoryTokenAmount,
): RailgunWalletTokenAmount => {
  return {
    tokenAddress: parseRailgunBalanceAddress(
      transactionHistoryTokenAmount.tokenData.tokenAddress,
    ).toLowerCase(),
    amountString: BigNumber.from(
      transactionHistoryTokenAmount.amount,
    ).toHexString(),
  };
};

const transactionHistoryNFTToRailgunNFT = (
  transactionHistoryNFT: TransactionHistoryTokenAmount,
): RailgunNFT => {
  return {
    nftAddress: parseRailgunBalanceAddress(
      transactionHistoryNFT.tokenData.tokenAddress,
    ).toLowerCase(),
    nftTokenType: transactionHistoryNFT.tokenData.tokenType as 1 | 2,
    tokenSubID: transactionHistoryNFT.tokenData.tokenSubID,
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

const serializeTransactionHistory = (
  transactionHistory: TransactionHistoryEntry[],
): TransactionHistoryItem[] => {
  return transactionHistory.map(historyItem => ({
    txid: historyItem.txid,
    transferTokenAmounts: historyItem.transferTokenAmounts
      .filter(filterERC20)
      .map(transactionHistoryTransferTokenAmountToRailgunTokenAmount),
    relayerFeeTokenAmount: historyItem.relayerFeeTokenAmount
      ? transactionHistoryTokenAmountToRailgunTokenAmount(
          historyItem.relayerFeeTokenAmount,
        )
      : undefined,
    changeTokenAmounts: historyItem.changeTokenAmounts
      .filter(filterERC20)
      .map(transactionHistoryTokenAmountToRailgunTokenAmount),
    receiveTokenAmounts: historyItem.receiveTokenAmounts
      .filter(filterERC20)
      .map(transactionHistoryReceiveTokenAmountToRailgunTokenAmount),
    unshieldTokenAmounts: historyItem.unshieldTokenAmounts
      .filter(filterERC20)
      .map(transactionHistoryTransferTokenAmountToRailgunTokenAmount),
    receiveNFTs: historyItem.receiveTokenAmounts
      .filter(filterNFT)
      .map(transactionHistoryReceiveNFTToRailgunNFT),
    transferNFTs: historyItem.transferTokenAmounts
      .filter(filterNFT)
      .map(transactionHistoryTransferNFTToRailgunNFT),
    unshieldNFTs: historyItem.unshieldTokenAmounts
      .filter(filterNFT)
      .map(transactionHistoryTransferNFTToRailgunNFT),
    version: historyItem.version,
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
    sendErrorMessage(err.stack);
    const response: LoadRailgunWalletResponse = {
      error: 'Could not load RAILGUN wallet transaction history.',
    };
    return response;
  }
};
