import {
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
  RailgunNFTAmount,
  RailgunERC20Recipient,
} from '@railgun-community/shared-models';

export const erc20NoteFromERC20AmountRecipient = (
  erc20AmountRecipient: RailgunERC20AmountRecipient,
  railgunWallet: RailgunWallet,
  outputType: OutputType,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
): TransactNote => {
  const { amount, recipientAddress } = erc20AmountRecipient;

  const receiverAddressData = RailgunEngine.decodeAddress(recipientAddress);

  const tokenData = getTokenDataERC20(erc20AmountRecipient.tokenAddress);

  return TransactNote.createTransfer(
    receiverAddressData,
    railgunWallet.addressKeys,
    amount,
    tokenData,
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
  const { recipientAddress, nftAddress, nftTokenType, tokenSubID, amount } =
    nftAmountRecipient;

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
        tokenData,
        showSenderAddressToRecipient,
        memoText,
      );
    case NFTTokenType.ERC1155:
      return TransactNote.createERC1155Transfer(
        receiverAddressData,
        railgunWallet.addressKeys,
        tokenData,
        BigInt(amount),
        showSenderAddressToRecipient,
        memoText,
      );
  }
};

const compareERC20Amounts = (
  a: Optional<RailgunERC20Amount>,
  b: Optional<RailgunERC20Amount>,
) => {
  return a?.tokenAddress === b?.tokenAddress && a?.amount === b?.amount;
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
    if (found.amount !== erc20Amount.amount) {
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
    const found = b.find(
      ta =>
        ta.tokenAddress === erc20Amount.tokenAddress &&
        ta.recipientAddress === erc20Amount.recipientAddress,
    );
    if (!found) {
      return false;
    }
    if (found.amount !== erc20Amount.amount) {
      return false;
    }
  }
  return true;
};

export const compareERC20RecipientArrays = (
  a: Optional<RailgunERC20Recipient[]>,
  b: Optional<RailgunERC20Recipient[]>,
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
  for (const erc20Recipient of a) {
    const found =
      b.find(
        ta =>
          ta.tokenAddress === erc20Recipient.tokenAddress &&
          ta.recipientAddress === erc20Recipient.recipientAddress,
      ) != null;
    if (!found) {
      return false;
    }
  }
  return true;
};

export const compareNFTAmountArrays = (
  a: Optional<RailgunNFTAmount[]>,
  b: Optional<RailgunNFTAmount[]>,
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
    if (found.amount !== nftAmountRecipient.amount) {
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
    if (found.amount !== nftAmountRecipient.amount) {
      return false;
    }
  }
  return true;
};

export { TransactNote };
