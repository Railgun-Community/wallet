import {
  hexToBigInt,
  randomHex,
  OutputType,
  AddressData,
  TransactNote,
  RailgunWallet,
} from '@railgun-community/engine';
import { RailgunWalletTokenAmount } from '@railgun-community/shared-models';

export const erc20NoteFromTokenAmount = (
  tokenAmount: RailgunWalletTokenAmount,
  receiverAddressData: AddressData,
  railgunWallet: RailgunWallet,
  outputType: OutputType,
  memoText: Optional<string>,
): TransactNote => {
  const random = randomHex(16);
  const value = hexToBigInt(tokenAmount.amountString);
  const senderRandom = randomHex(15);

  return TransactNote.create(
    receiverAddressData,
    railgunWallet.addressKeys,
    random,
    value,
    tokenAmount.tokenAddress.replace('0x', ''),
    railgunWallet.getViewingKeyPair(),
    senderRandom,
    outputType,
    memoText,
  );
};

export const compareTokenAmounts = (
  a?: RailgunWalletTokenAmount,
  b?: RailgunWalletTokenAmount,
) => {
  return (
    a?.tokenAddress === b?.tokenAddress && a?.amountString === b?.amountString
  );
};

export const compareTokenAmountArrays = (
  a: RailgunWalletTokenAmount[],
  b: RailgunWalletTokenAmount[],
) => {
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
