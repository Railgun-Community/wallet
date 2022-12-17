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
  NFTTokenType,
  RailgunNFTAmountRecipient,
  RailgunERC20Amount,
  RailgunERC20AmountRecipient,
} from '@railgun-community/shared-models';

export const erc20NoteFromERC20AmountRecipient = (
  erc20AmountRecipient: RailgunERC20AmountRecipient,
  railgunWallet: RailgunWallet,
  outputType: OutputType,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
): TransactNote => {
  const random = randomHex(16);
  const value = hexToBigInt(erc20AmountRecipient.amountString);

  const receiverAddressData = RailgunEngine.decodeAddress(
    erc20AmountRecipient.recipientAddress,
  );

  const tokenData = getTokenDataERC20(erc20AmountRecipient.tokenAddress);

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

export const nftNoteFromNFTAmountRecipient = (
  nftAmountRecipient: RailgunNFTAmountRecipient,
  railgunWallet: RailgunWallet,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
): TransactNote => {
  const {
    recipientAddress,
    nftAddress,
    nftTokenType,
    tokenSubID,
    amountString,
  } = nftAmountRecipient;

  const random = randomHex(16);

  const receiverAddressData = RailgunEngine.decodeAddress(recipientAddress);

  const tokenData = getTokenDataNFT(
    nftAddress,
    nftTokenType as 1 | 2,
    tokenSubID,
  );

  switch (nftTokenType) {
    case NFTTokenType.ERC721:
      return TransactNote.createERC721Transfer(
        receiverAddressData,
        railgunWallet.addressKeys,
        random,
        tokenData,
        railgunWallet.getViewingKeyPair(),
        showSenderAddressToRecipient,
        memoText,
      );
    case NFTTokenType.ERC1155:
      return TransactNote.createERC1155Transfer(
        receiverAddressData,
        railgunWallet.addressKeys,
        random,
        tokenData,
        BigInt(amountString),
        railgunWallet.getViewingKeyPair(),
        showSenderAddressToRecipient,
        memoText,
      );
  }
};

const compareERC20Amounts = (
  a: Optional<RailgunERC20Amount>,
  b: Optional<RailgunERC20Amount>,
) => {
  return (
    a?.tokenAddress === b?.tokenAddress && a?.amountString === b?.amountString
  );
};

export const compareERC20AmountRecipients = (
  a: Optional<RailgunERC20AmountRecipient>,
  b: Optional<RailgunERC20AmountRecipient>,
) => {
  return (
    compareERC20Amounts(a, b) && a?.recipientAddress === b?.recipientAddress
  );
};

export const compareERC20AmountArrays = (
  a: Optional<RailgunERC20Amount[]>,
  b: Optional<RailgunERC20Amount[]>,
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
  for (const erc20Amount of a) {
    const found = b.find(ta => ta.tokenAddress === erc20Amount.tokenAddress);
    if (!found) {
      return false;
    }
    if (found.amountString !== erc20Amount.amountString) {
      return false;
    }
  }
  return true;
};

export const compareERC20AmountRecipientArrays = (
  a: Optional<RailgunERC20AmountRecipient[]>,
  b: Optional<RailgunERC20AmountRecipient[]>,
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
  for (const erc20Amount of a) {
    const found = b.find(ta => ta.tokenAddress === erc20Amount.tokenAddress);
    if (!found) {
      return false;
    }
    if (found.amountString !== erc20Amount.amountString) {
      return false;
    }
    if (found.recipientAddress !== erc20Amount.recipientAddress) {
      return false;
    }
  }
  return true;
};

export const compareNFTAmountRecipientArrays = (
  a: Optional<RailgunNFTAmountRecipient[]>,
  b: Optional<RailgunNFTAmountRecipient[]>,
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
  for (const nftAmountRecipient of a) {
    const found = b.find(
      ta =>
        ta.nftAddress === nftAmountRecipient.nftAddress &&
        ta.tokenSubID === nftAmountRecipient.tokenSubID,
    );
    if (!found) {
      return false;
    }
    if (found.nftTokenType !== nftAmountRecipient.nftTokenType) {
      return false;
    }
    if (found.recipientAddress !== nftAmountRecipient.recipientAddress) {
      return false;
    }
    if (found.amountString !== nftAmountRecipient.amountString) {
      return false;
    }
  }
  return true;
};
