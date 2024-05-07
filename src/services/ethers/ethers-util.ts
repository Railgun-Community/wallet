import { Mnemonic } from '@railgun-community/engine';

export const mnemonicTo0xPKey = (
  mnemonic: string,
  derivationIndex?: number,
) => {
  return `0x${Mnemonic.to0xPrivateKey(mnemonic, derivationIndex)}`;
};
