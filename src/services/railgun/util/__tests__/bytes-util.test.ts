import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { getRandomBytes, parseRailgunTokenAddress } from '../bytes';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('bytes-util', () => {
  it('Should parse rail balance addresses', () => {
    expect(parseRailgunTokenAddress('00')).to.equal(
      '0x0000000000000000000000000000000000000000',
    );
    expect(parseRailgunTokenAddress('123456789012345678901234567890')).to.equal(
      '0x0000000000123456789012345678901234567890',
    );
  });

  it('Should return random bytes of length', () => {
    expect(getRandomBytes(1).length).to.equal(2);
    expect(getRandomBytes(16).length).to.equal(32);
    expect(getRandomBytes(32).length).to.equal(64);
    expect(getRandomBytes(80).length).to.equal(160);
  });
});
