import { mnemonicTo0xPrivateKey } from '@railgun-community/engine';

export const mnemonicTo0xPKey = (
  mnemonic: string,
  derivationIndex?: number,
) => {
  return `0x${mnemonicTo0xPrivateKey(mnemonic, derivationIndex)}`;
};
