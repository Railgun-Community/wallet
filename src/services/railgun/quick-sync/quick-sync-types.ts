import { QuickSync } from '@railgun-community/engine';
import { quickSyncGraph } from './quick-sync-graph';
import { quickSyncIPNS } from './quick-sync-ipns';

export enum QuickSyncType {
  IPNS = 'IPNS',
  Graph = 'Graph',
}

export const QUICK_SYNC_TYPE_DEFAULT: QuickSyncType = QuickSyncType.IPNS;

export const getQuickSyncImplementation = (
  quickSyncType: QuickSyncType,
): QuickSync => {
  switch (quickSyncType) {
    case QuickSyncType.IPNS:
      return quickSyncIPNS;
    case QuickSyncType.Graph:
      return quickSyncGraph;
  }
};
