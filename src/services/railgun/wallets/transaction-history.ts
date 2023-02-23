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
} from '@railgun-community/shared-models';
import { walletForID } from '../core/engine';
import { BigNumber } from '@ethersproject/bignumber';
import { parseRailgunTokenAddress } from '../util/bytes-util';
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

const serializeTransactionHistory = (
  transactionHistory: TransactionHistoryEntry[],
): TransactionHistoryItem[] => {
  return transactionHistory.map(historyItem => ({
    txid: formatToByteLength(historyItem.txid, ByteLength.UINT_256, true),
    transferERC20Amounts: historyItem.transferTokenAmounts
      .filter(filterERC20)
      .map(transactionHistoryTransferTokenAmountToRailgunERC20Amount),
    relayerFeeERC20Amount: historyItem.relayerFeeTokenAmount
      ? transactionHistoryTokenAmountToRailgunERC20Amount(
          historyItem.relayerFeeTokenAmount,
        )
      : undefined,
    changeERC20Amounts: historyItem.changeTokenAmounts
      .filter(filterERC20)
      .map(transactionHistoryTokenAmountToRailgunERC20Amount),
    receiveERC20Amounts: historyItem.receiveTokenAmounts
      .filter(filterERC20)
      .map(transactionHistoryReceiveTokenAmountToRailgunERC20Amount),
    unshieldERC20Amounts: historyItem.unshieldTokenAmounts
      .filter(filterERC20)
      .map(transactionHistoryUnshieldTokenAmountToRailgunERC20Amount),
    receiveNFTAmounts: historyItem.receiveTokenAmounts
      .filter(filterNFT)
      .map(transactionHistoryReceiveNFTToRailgunNFTAmount),
    transferNFTAmounts: historyItem.transferTokenAmounts
      .filter(filterNFT)
      .map(transactionHistoryTransferNFTToRailgunNFTAmount),
    unshieldNFTAmounts: historyItem.unshieldTokenAmounts
      .filter(filterNFT)
      .map(transactionHistoryUnshieldNFTToRailgunNFTAmount),
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
    reportAndSanitizeError(getWalletTransactionHistory.name, err);
    const response: LoadRailgunWalletResponse = {
      error: 'Could not load RAILGUN wallet transaction history.',
    };
    return response;
  }
};
