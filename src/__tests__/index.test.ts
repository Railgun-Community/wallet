import { expect } from 'chai';
import index from '../index';

describe('index', () => {
  it('Should load main for test', async () => {
    expect(index).to.deep.equal({});
  });
});
