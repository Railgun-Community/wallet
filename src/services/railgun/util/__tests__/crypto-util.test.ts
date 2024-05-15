import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as ed from '@noble/ed25519';
import {
  decryptAESGCM256,
  encryptDataWithSharedKey,
  pbkdf2,
  verifyBroadcasterSignature,
} from '../crypto';
import { bytesToHex } from '../bytes';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('crypto-util', () => {
  it('Should verify signature', async () => {
    const privateKey = ed.utils.randomPrivateKey();
    const data = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
    const publicKey = await ed.getPublicKey(privateKey);
    const signature = await ed.sign(data, privateKey);

    const isValidBytes = await verifyBroadcasterSignature(
      signature,
      data,
      publicKey,
    );
    expect(isValidBytes).to.be.true;

    const isValidHex = await verifyBroadcasterSignature(
      bytesToHex(signature),
      bytesToHex(data),
      publicKey,
    );
    expect(isValidHex).to.be.true;
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
    const decrypted = decryptAESGCM256(encryptedData, sharedKey);

    expect(decrypted).to.deep.equal(data);
  });

  it('Should calculate PBKDF2 hash', async () => {
    const hash = await pbkdf2('secret', '0c6c732c2b03dfb6cf5f5893', 1000000);
    expect(hash).to.equal(
      'ac0323bc154cc4b7ac0440eee6414356801faa198bb635d0b60441e3a043a706',
    );
  });
});
