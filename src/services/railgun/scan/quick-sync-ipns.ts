import { AccumulatedEvents, Chain } from '@railgun-community/engine';
import { networkForChain } from '@railgun-community/shared-models';
import {
  DEFAULT_QUICK_SYNC_PAGE_SIZE,
  getRailgunEventLogIPNS,
  QuickSyncPageSize,
} from './railgun-events-ipns';

export const quickSyncIPNS = async (
  chain: Chain,
  startingBlock: number,
  pageSize: QuickSyncPageSize = DEFAULT_QUICK_SYNC_PAGE_SIZE,
): Promise<AccumulatedEvents> => {
  const network = networkForChain(chain);
  if (!network || !network.shouldQuickSync) {
    // Return empty logs, Engine will default to full scan.
    return {
      commitmentEvents: [],
      unshieldEvents: [],
      nullifierEvents: [],
    };
  }

  return getRailgunEventLogIPNS(chain, pageSize, startingBlock);
};
