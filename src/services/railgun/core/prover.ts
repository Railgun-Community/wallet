import {
  FormattedCircuitInputs,
  Groth16,
  Proof,
  Prover,
} from '@railgun-community/engine';
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
