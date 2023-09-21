import {
  FormattedCircuitInputsRailgun,
  SnarkJSGroth16,
  Proof,
  Prover,
} from '@railgun-community/engine';
import { getEngine } from './engine';
import { isDefined } from '@railgun-community/shared-models';

export const getProver = (): Prover => {
  const engine = getEngine();
  if (!isDefined(engine)) {
    throw new Error(
      'RAILGUN Engine not yet init. Please reload your app or try again.',
    );
  }
  return engine.prover;
};

export { FormattedCircuitInputsRailgun, Proof, SnarkJSGroth16 };
