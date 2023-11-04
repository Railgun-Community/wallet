import { TXIDVersion } from '@railgun-community/engine';

export const isV2Test = (): boolean => {
  return process.env.V2_TEST === '1';
};

export const getTestTXIDVersion = () => {
  if (isV2Test()) {
    return TXIDVersion.V2_PoseidonMerkle;
  }
  return TXIDVersion.V3_PoseidonMerkle;
};
