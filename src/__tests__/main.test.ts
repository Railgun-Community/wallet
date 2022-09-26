import { expect } from 'chai';
import main from '../main';

describe('main', () => {
  it('Should load main for test', async () => {
    expect(main).to.deep.equal({});
  });
});
