import { POI, POIList } from '@railgun-community/engine';
import { POI_REQUIRED_LISTS } from './poi-constants';
import { WalletPOINodeInterface } from './wallet-poi-node-interface';

export class WalletPOI {
  static started = false;

  static init(poiNodeURL: string, customLists: POIList[]) {
    const poiNodeInterface = new WalletPOINodeInterface(poiNodeURL);
    const poiLists: POIList[] = [...POI_REQUIRED_LISTS, ...customLists];
    POI.init(poiLists, poiNodeInterface);
    this.started = true;
  }
}
