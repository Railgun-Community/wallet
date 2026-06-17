import { Mnemonic } from '@railgun-community/engine';

export const mnemonicTo0xPKey = (
  mnemonic: string,
  derivationIndex?: number,
  // Optional BIP39 mnemonic password. Must match the one the wallet was created
  // with, otherwise a different (unrelated) 0x private key is derived.
  mnemonicPassword?: string,
) => {
  return `0x${Mnemonic.to0xPrivateKey(
    mnemonic,
    derivationIndex,
    mnemonicPassword,
  )}`;
};
