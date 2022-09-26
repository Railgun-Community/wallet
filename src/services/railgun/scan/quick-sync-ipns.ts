import { QuickSync } from '@railgun-community/lepton/dist/models/event-types';
import { Chain } from '@railgun-community/lepton/dist/models/lepton-types';
import { networkForChain } from '@railgun-community/shared-models/dist/models/network-config';
import {
  DEFAULT_QUICK_SYNC_PAGE_SIZE,
  getRailgunEventLogIPNS,
  QuickSyncEventLog,
  QuickSyncPageSize,
} from './railgun-events-ipns';

export const quickSyncIPNS: QuickSync = async (
  chain: Chain,
  startingBlock: number,
  pageSize: QuickSyncPageSize = DEFAULT_QUICK_SYNC_PAGE_SIZE,
): Promise<QuickSyncEventLog> => {
  const network = networkForChain(chain);
  if (!network || !network.shouldQuickSync) {
    // Return empty logs, Lepton will default to full scan.
    return {
      commitmentEvents: [],
      nullifierEvents: [],
    };
  }

  return getRailgunEventLogIPNS(chain, pageSize, startingBlock);
};
