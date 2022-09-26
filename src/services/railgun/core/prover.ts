import { Prover, Groth16 } from '@railgun-community/lepton/dist/prover';
import {
  FormattedCircuitInputs,
  Proof,
} from '@railgun-community/lepton/dist/prover/types';
import { getEngine } from './engine';

export const getProver = (): Prover => {
  const engine = getEngine();
  if (!engine) {
    throw new Error(
      'RAILGUN Engine not yet init. Please reload your app or try again.',
    );
  }
  return engine.prover;
};

export const setProverGroth16 = (groth16: Groth16): void => {
  getProver().setGroth16(groth16);
};

export { FormattedCircuitInputs, Proof, Groth16 };
