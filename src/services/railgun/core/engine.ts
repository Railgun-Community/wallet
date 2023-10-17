import { RailgunEngine } from '@railgun-community/engine';
import { isDefined } from '@railgun-community/shared-models';

let savedEngine: Optional<RailgunEngine>;

export const getEngine = (): RailgunEngine => {
  if (!savedEngine) {
    throw new Error('RAILGUN Engine not yet initialized.');
  }
  return savedEngine;
};

export const hasEngine = (): boolean => {
  return isDefined(savedEngine);
};

export const setEngine = (engine: Optional<RailgunEngine>) => {
  savedEngine = engine;
};
