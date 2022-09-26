import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as ed from '@noble/ed25519';
import {
  decryptAESGCM256,
  encryptDataWithSharedKey,
  verifyRelayerSignature,
} from '../crypto-util';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('crypto-util', () => {
  it('Should verify signature', async () => {
    const privateKey = ed.utils.randomPrivateKey();
    const data = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
    const publicKey = await ed.getPublicKey(privateKey);
    const signature = await ed.sign(data, privateKey);
    const isValid = await verifyRelayerSignature(signature, data, publicKey);
    expect(isValid).to.be.true;
  });

  it('Should encrypt and decrypt data with shareable random pubkey', async () => {
    const privateKey = ed.utils.randomPrivateKey();
    const externalPubKey = await ed.getPublicKey(privateKey);
    const data = { test: '123', value: 678 };

    const { encryptedData, randomPubKey } = await encryptDataWithSharedKey(
      data,
      externalPubKey,
    );
    expect(randomPubKey.length).to.equal(64);

    const sharedKey = await ed.getSharedSecret(privateKey, randomPubKey);
    const decrypted = await decryptAESGCM256(encryptedData, sharedKey);

    expect(decrypted).to.deep.equal(data);
  });
});
