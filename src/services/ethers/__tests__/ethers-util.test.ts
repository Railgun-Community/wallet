import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { mnemonicTo0xPKey } from '../ethers-util';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('ethers-util', () => {
  it('Should convert mnemonic to pkey', () => {
    const pKey = mnemonicTo0xPKey(
      'test test test test test test test test test test test junk',
    );
    expect(pKey).to.equal(
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    );
    const pKeyIndex1 = mnemonicTo0xPKey(
      'test test test test test test test test test test test junk',
      1,
    );
    expect(pKeyIndex1).to.equal(
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    );
  });
});
