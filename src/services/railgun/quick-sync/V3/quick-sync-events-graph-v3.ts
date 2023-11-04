import { AccumulatedEvents, Chain } from '@railgun-community/engine';
import { EMPTY_EVENTS } from '../graph-query';

export const quickSyncEventsGraphV3 = async (
  chain: Chain,
  startingBlock: number,
): Promise<AccumulatedEvents> => {
  return EMPTY_EVENTS;
};
