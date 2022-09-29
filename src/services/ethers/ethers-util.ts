import { HDNode } from '@ethersproject/hdnode';
import { mnemonicToSeed } from '@railgun-community/engine/dist/key-derivation/bip39';

const getPath = (index = 0) => {
  return `m/44'/60'/0'/0/${index}`;
};

export const mnemonicToPKey = (mnemonic: string, derivationIndex?: number) => {
  try {
    //
    // NOTE: the HDNode.fromMnemonic call does not function correctly,
    //  so we're forced to generate the seed through the Railgun implementation.
    const seed = mnemonicToSeed(mnemonic);
    const derivationPath = getPath(derivationIndex);

    // eslint-disable-next-line no-underscore-dangle
    const node = HDNode._fromSeed(`0x${seed}`, {
      phrase: mnemonic,
      path: 'm',
      locale: 'en',
    }).derivePath(derivationPath);

    return node.privateKey;
  } catch (_err) {
    return '';
  }
};
