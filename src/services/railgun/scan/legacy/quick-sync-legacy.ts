import { Chain } from '@railgun-community/engine/dist/models/engine-types';
import { QuickSync } from '@railgun-community/engine/dist/models/event-types';
import { networkForChain } from '@railgun-community/shared-models';
import {
  getRailgunEventLogLegacy,
  QuickSyncEventLog,
} from './railgun-events-legacy';

export const quickSyncURLForEVMChain = (chain: Chain) => {
  const network = networkForChain(chain);
  if (!network || !network.isEVM) {
    return undefined;
  }
  return `https://events.railgun.org/chain/${chain.id}`;
};

export const quickSyncLegacy: QuickSync = async (
  chain: Chain,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _startingBlock: number,
): Promise<QuickSyncEventLog> => {
  const quickSyncURL = quickSyncURLForEVMChain(chain);
  if (!quickSyncURL) {
    // Return empty logs, Lepton will default to full scan.
    return {
      commitmentEvents: [],
      nullifierEvents: [],
    };
  }

  // TODO: Use startingBlock in Events API and only respond with events >= block.

  const log = await getRailgunEventLogLegacy(quickSyncURL);
  return log;
};
