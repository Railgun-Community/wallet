import {
  hexToBigInt,
  randomHex,
  OutputType,
  TransactNote,
  RailgunWallet,
  RailgunEngine,
  getTokenDataERC20,
  getTokenDataNFT,
} from '@railgun-community/engine';
import {
  RailgunNFTRecipient,
  RailgunWalletTokenAmount,
  RailgunWalletTokenAmountRecipient,
} from '@railgun-community/shared-models';

export const erc20NoteFromTokenAmountRecipient = (
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

  const tokenData = getTokenDataERC20(tokenAmountRecipient.tokenAddress);

  return TransactNote.createTransfer(
    receiverAddressData,
    railgunWallet.addressKeys,
    random,
    value,
    tokenData,
    railgunWallet.getViewingKeyPair(),
    showSenderAddressToRecipient,
    outputType,
    memoText,
  );
};

export const nftNoteFromNFTRecipient = (
  nftRecipient: RailgunNFTRecipient,
  railgunWallet: RailgunWallet,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
): TransactNote => {
  const { recipientAddress, nftAddress, nftTokenType, tokenSubID } =
    nftRecipient;

  const random = randomHex(16);

  const receiverAddressData = RailgunEngine.decodeAddress(recipientAddress);

  const tokenData = getTokenDataNFT(
    nftAddress,
    nftTokenType as 1 | 2,
    tokenSubID,
  );

  return TransactNote.createNFTTransfer(
    receiverAddressData,
    railgunWallet.addressKeys,
    random,
    tokenData,
    railgunWallet.getViewingKeyPair(),
    showSenderAddressToRecipient,
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

export const compareNFTRecipientArrays = (
  a: Optional<RailgunNFTRecipient[]>,
  b: Optional<RailgunNFTRecipient[]>,
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
  for (const nftRecipient of a) {
    const found = b.find(
      ta =>
        ta.nftAddress === nftRecipient.nftAddress &&
        ta.tokenSubID === nftRecipient.tokenSubID,
    );
    if (!found) {
      return false;
    }
    if (found.nftTokenType !== nftRecipient.nftTokenType) {
      return false;
    }
    if (found.recipientAddress !== nftRecipient.recipientAddress) {
      return false;
    }
  }
  return true;
};
