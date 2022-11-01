import {
  TransactionHistoryTransferTokenAmount,
  TransactionHistoryTokenAmount,
  TransactionHistoryEntry,
  Chain,
  TransactionHistoryReceiveTokenAmount,
} from '@railgun-community/engine';
import {
  LoadRailgunWalletResponse,
  TransactionHistorySerializedResponse,
  TransactionHistoryItem,
  RailgunWalletTokenAmount,
  RailgunWalletSendTokenAmount,
  RailgunWalletReceiveTokenAmount,
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

const transactionHistoryTokenAmountToRailgunTokenAmount = (
  transactionHistoryTokenAmount: TransactionHistoryTokenAmount,
): RailgunWalletTokenAmount => {
  return {
    tokenAddress: parseRailgunBalanceAddress(
      transactionHistoryTokenAmount.token,
    ).toLowerCase(),
    amountString: BigNumber.from(
      transactionHistoryTokenAmount.amount,
    ).toHexString(),
  };
};

const serializeTransactionHistory = (
  transactionHistory: TransactionHistoryEntry[],
): TransactionHistoryItem[] => {
  return transactionHistory.map(historyItem => ({
    txid: `0x${historyItem.txid}`,
    transferTokenAmounts: historyItem.transferTokenAmounts.map(
      transactionHistoryTransferTokenAmountToRailgunTokenAmount,
    ),
    relayerFeeTokenAmount: historyItem.relayerFeeTokenAmount
      ? transactionHistoryTokenAmountToRailgunTokenAmount(
          historyItem.relayerFeeTokenAmount,
        )
      : undefined,
    changeTokenAmounts: historyItem.changeTokenAmounts.map(
      transactionHistoryTokenAmountToRailgunTokenAmount,
    ),
    receiveTokenAmounts: historyItem.receiveTokenAmounts.map(
      transactionHistoryReceiveTokenAmountToRailgunTokenAmount,
    ),
    unshieldTokenAmounts: historyItem.unshieldTokenAmounts.map(
      transactionHistoryTransferTokenAmountToRailgunTokenAmount,
    ),
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
