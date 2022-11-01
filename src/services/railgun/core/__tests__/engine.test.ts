import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { initTestEngine } from '../../../../test/setup.test';
import {
  closeRailgunEngine,
  formatTempEngineV3StartBlockNumbersEVM,
  getEngine,
} from '../engine';
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
    closeRailgunEngine();
    expect(() => getEngine()).to.throw('RAILGUN Engine not yet initialized.');
    expect(() => getProver()).to.throw('RAILGUN Engine not yet initialized.');
  });

  it('Should format temp engine v3 start block number', () => {
    expect(
      formatTempEngineV3StartBlockNumbersEVM({ '1': 10, '3': 30 }),
    ).to.deep.equal([[undefined, 10, undefined, 30]]);
  });
});
