import { Prover, Groth16 } from '@railgun-community/engine/dist/prover/prover';
import {
  FormattedCircuitInputs,
  Proof,
} from '@railgun-community/engine/dist/prover/types';
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

export { FormattedCircuitInputs, Proof, Groth16 };
