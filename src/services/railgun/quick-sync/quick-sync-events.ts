import { Chain, TXIDVersion } from '@railgun-community/engine';
import { quickSyncEventsGraphV2 } from './V2/quick-sync-events-graph-v2';
import { quickSyncEventsGraphV3 } from './V3/quick-sync-events-graph-v3';

export const quickSyncEventsGraph = async (
  txidVersion: TXIDVersion,
  chain: Chain,
  startingBlock: number,
) => {
  switch (txidVersion) {
    case TXIDVersion.V2_PoseidonMerkle:
      return quickSyncEventsGraphV2(chain, startingBlock);
    case TXIDVersion.V3_PoseidonMerkle:
      return quickSyncEventsGraphV3(chain, startingBlock);
  }
};
