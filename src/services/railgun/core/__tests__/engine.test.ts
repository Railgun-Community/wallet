import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { initTestEngine } from '../../../../tests/setup.test';
import { stopRailgunEngine, getEngine } from '../engine';
import { getProver } from '../prover';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('engine', () => {
  beforeEach(() => {
    initTestEngine();
  });

  it('Should get active engine instance', () => {
    expect(getEngine()).to.not.be.undefined;
  });

  it('Should fail without active engine instance', () => {
    stopRailgunEngine();
    expect(() => getEngine()).to.throw('RAILGUN Engine not yet initialized.');
    expect(() => getProver()).to.throw('RAILGUN Engine not yet initialized.');
  });
});
