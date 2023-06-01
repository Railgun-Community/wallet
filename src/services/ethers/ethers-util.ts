import { mnemonicToPrivateKey } from '@railgun-community/engine';

export const mnemonicToPKey = (mnemonic: string, derivationIndex?: number) => {
  return `0x${mnemonicToPrivateKey(mnemonic, derivationIndex)}`;
};
