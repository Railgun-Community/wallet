import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { compareStringArrays } from '../utils';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('utils', () => {
  it('Should test array comparisons', () => {
    expect(compareStringArrays(undefined, [])).to.be.false;
    expect(compareStringArrays([], undefined)).to.be.false;
    expect(compareStringArrays([], [])).to.be.true;
    expect(compareStringArrays([], ['1'])).to.be.false;
    expect(compareStringArrays(['1'], [])).to.be.false;
    expect(compareStringArrays(['1', '2'], ['2', '1'])).to.be.true;
  });
});
