import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { BigNumber } from '@ethersproject/bignumber';
import {
  calculateGasLimit,
  calculateMaximumGas,
} from '@railgun-community/shared-models/dist/utils/gas';
import { TransactionGasDetails } from '@railgun-community/shared-models/dist/models/response-types';
import { EVMGasType } from '@railgun-community/shared-models/dist/models/network-config';
import { decimalStringToHexString } from '../format';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('gas', () => {
  it('Should calculate gas limit correctly', () => {
    const gasEstimate = BigNumber.from('100000');
    const gasLimitString = calculateGasLimit(gasEstimate).toHexString();
    expect(gasLimitString).to.equal(decimalStringToHexString('120000'));
  });

  it('Should calculate maximum gas correctly', () => {
    const gasDetails: TransactionGasDetails = {
      evmGasType: EVMGasType.Type2,
      gasEstimate: BigNumber.from('100000'),
      maxFeePerGas: BigNumber.from('20000'),
      maxPriorityFeePerGas: BigNumber.from('500'),
    };
    const gasLimitString = calculateMaximumGas(gasDetails).toHexString();
    expect(gasLimitString).to.equal(decimalStringToHexString('2460000000'));
  });
});
