import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { closeTestEngine, initTestEngine } from '../../../../tests/setup.test';
import { getEngine } from '../engine';
import { getProver } from '../prover';
import { stopRailgunEngine } from '../init';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('engine', () => {
  beforeEach(async () => {
    await initTestEngine();
  });
  afterEach(async () => {
    await closeTestEngine();
  });

  it('Should get active engine instance', () => {
    expect(getEngine()).to.not.be.undefined;
  });

  it('Should fail without active engine instance', async () => {
    await stopRailgunEngine();
    expect(() => getEngine()).to.throw('RAILGUN Engine not yet initialized.');
    expect(() => getProver()).to.throw('RAILGUN Engine not yet initialized.');
  });
});
