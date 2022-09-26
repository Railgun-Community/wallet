import { BigNumber } from '@ethersproject/bignumber';

export const decimalStringToHexString = (dec: string) => {
  return BigNumber.from(dec).toHexString();
};

export const decimalToHexString = (dec: number) => {
  return BigNumber.from(dec).toHexString();
};
