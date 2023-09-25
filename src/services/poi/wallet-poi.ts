import {
  POI,
  POIList,
  RailgunEngine,
  isDefined,
} from '@railgun-community/engine';
import { POI_REQUIRED_LISTS } from './poi-constants';
import { TempTestPOINodeInterface } from './temp-test-poi-node-interface';
import { WalletPOINodeInterface } from './wallet-poi-node-interface';

export class WalletPOI {
  static started = false;

  static init(
    poiNodeURL: Optional<string>,
    customLists: POIList[],
    engine: RailgunEngine,
  ) {
    const poiNodeInterface = isDefined(poiNodeURL)
      ? new WalletPOINodeInterface(poiNodeURL, engine)
      : // TODO: remove temp tester
        new TempTestPOINodeInterface(engine);
    const poiLists: POIList[] = [...POI_REQUIRED_LISTS, ...customLists];
    POI.init(poiLists, poiNodeInterface);
    this.started = true;
  }
}
