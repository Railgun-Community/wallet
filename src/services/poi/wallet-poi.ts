import { POI, POIList, RailgunEngine } from '@railgun-community/engine';
import { POI_REQUIRED_LISTS } from './poi-constants';
import { WalletPOINodeInterface } from './wallet-poi-node-interface';

export class WalletPOI {
  static started = false;

  static init(
    poiNodeURL: string,
    customLists: POIList[],
    engine: RailgunEngine,
  ) {
    const poiNodeInterface = new WalletPOINodeInterface(poiNodeURL, engine);
    const poiLists: POIList[] = [...POI_REQUIRED_LISTS, ...customLists];
    POI.init(poiLists, poiNodeInterface);
    this.started = true;
  }
}
