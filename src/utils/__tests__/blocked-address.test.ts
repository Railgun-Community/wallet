import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { assertNotBlockedAddress, isBlockedAddress } from '../blocked-address';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('blocked-address', () => {
  it('Should recognize blocked addresses', async () => {
    expect(
      isBlockedAddress('0x1356c899d8c9467c7f71c195612f8a395abf2f0a'),
    ).to.equal(true);
    expect(
      isBlockedAddress(
        '0x1356c899d8c9467c7f71c195612f8a395abf2f0a'.toUpperCase(),
      ),
    ).to.equal(true);
    expect(
      isBlockedAddress('0x8356c899d8c9467c7f71c195612f8a395abf2f0a'),
    ).to.equal(false);
    expect(isBlockedAddress(undefined)).to.equal(false);
  });

  it('Assert should throw on blocked address', async () => {
    expect(() =>
      assertNotBlockedAddress('0x1356c899d8c9467c7f71c195612f8a395abf2f0a'),
    ).to.throw();
    expect(() =>
      assertNotBlockedAddress('0x8356c899d8c9467c7f71c195612f8a395abf2f0a'),
    ).to.not.throw();
  });
});
