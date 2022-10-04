import { hexToBigInt, randomHex , OutputType , AddressData , Note , RailgunWallet } from '@railgun-community/engine';
import { RailgunWalletTokenAmount } from '@railgun-community/shared-models';

export const erc20NoteFromTokenAmount = (
  tokenAmount: RailgunWalletTokenAmount,
  addressData: AddressData,
  railgunWallet: RailgunWallet,
  outputType: OutputType,
  memoText: Optional<string>,
): Note => {
  const random = randomHex(16);
  const value = hexToBigInt(tokenAmount.amountString);
  const senderBlindingKey = randomHex(15);

  return Note.create(
    addressData,
    random,
    value,
    tokenAmount.tokenAddress.replace('0x', ''),
    railgunWallet.getViewingKeyPair(),
    senderBlindingKey,
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
