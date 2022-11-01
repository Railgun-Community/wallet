import {
  hexToBigInt,
  randomHex,
  OutputType,
  TransactNote,
  RailgunWallet,
  RailgunEngine,
} from '@railgun-community/engine';
import {
  RailgunWalletTokenAmount,
  RailgunWalletTokenAmountRecipient,
} from '@railgun-community/shared-models';

export const erc20NoteFromTokenAmount = (
  tokenAmountRecipient: RailgunWalletTokenAmountRecipient,
  railgunWallet: RailgunWallet,
  outputType: OutputType,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
): TransactNote => {
  const random = randomHex(16);
  const value = hexToBigInt(tokenAmountRecipient.amountString);

  const receiverAddressData = RailgunEngine.decodeAddress(
    tokenAmountRecipient.recipientAddress,
  );

  return TransactNote.create(
    receiverAddressData,
    railgunWallet.addressKeys,
    random,
    value,
    tokenAmountRecipient.tokenAddress.replace('0x', ''),
    railgunWallet.getViewingKeyPair(),
    showSenderAddressToRecipient,
    outputType,
    memoText,
  );
};

const compareTokenAmounts = (
  a: Optional<RailgunWalletTokenAmount>,
  b: Optional<RailgunWalletTokenAmount>,
) => {
  return (
    a?.tokenAddress === b?.tokenAddress && a?.amountString === b?.amountString
  );
};

export const compareTokenAmountRecipients = (
  a: Optional<RailgunWalletTokenAmountRecipient>,
  b: Optional<RailgunWalletTokenAmountRecipient>,
) => {
  return (
    compareTokenAmounts(a, b) && a?.recipientAddress === b?.recipientAddress
  );
};

export const compareTokenAmountArrays = (
  a: Optional<RailgunWalletTokenAmount[]>,
  b: Optional<RailgunWalletTokenAmount[]>,
) => {
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (const tokenAmount of a) {
    const found = b.find(ta => ta.tokenAddress === tokenAmount.tokenAddress);
    if (!found) {
      return false;
    }
    if (found.amountString !== tokenAmount.amountString) {
      return false;
    }
  }
  return true;
};

export const compareTokenAmountRecipientArrays = (
  a: Optional<RailgunWalletTokenAmountRecipient[]>,
  b: Optional<RailgunWalletTokenAmountRecipient[]>,
) => {
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (const tokenAmount of a) {
    const found = b.find(ta => ta.tokenAddress === tokenAmount.tokenAddress);
    if (!found) {
      return false;
    }
    if (found.amountString !== tokenAmount.amountString) {
      return false;
    }
    if (found.recipientAddress !== tokenAmount.recipientAddress) {
      return false;
    }
  }
  return true;
};
