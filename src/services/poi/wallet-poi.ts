import {
  GetLatestValidatedRailgunTxid,
  POI,
  POIList,
  POINodeInterface,
  MerklerootValidator,
} from '@railgun-community/engine';
import { WalletPOIRequester } from './wallet-poi-requester';
import { POI_REQUIRED_LISTS } from '@railgun-community/shared-models';

export class WalletPOI {
  static started = false;

  static init(poiNodeInterface: POINodeInterface, customLists: POIList[]) {
    const poiLists: POIList[] = [...POI_REQUIRED_LISTS, ...customLists];
    POI.init(poiLists, poiNodeInterface);
    this.started = true;
  }

  static getPOITxidMerklerootValidator = (
    poiNodeURLs?: string[],
  ): MerklerootValidator => {
    const poiRequester = new WalletPOIRequester(poiNodeURLs);
    const txidMerklerootValidator: MerklerootValidator = (
      txidVersion,
      chain,
      tree,
      index,
      merkleroot,
    ) =>
      poiRequester.validateRailgunTxidMerkleroot(
        txidVersion,
        chain,
        tree,
        index,
        merkleroot,
      );
    return txidMerklerootValidator;
  };

  static getPOILatestValidatedRailgunTxid = (
    poiNodeURLs?: string[],
  ): GetLatestValidatedRailgunTxid => {
    const poiRequester = new WalletPOIRequester(poiNodeURLs);
    const getLatestValidatedRailgunTxid: GetLatestValidatedRailgunTxid = (
      txidVersion,
      chain,
    ) => poiRequester.getLatestValidatedRailgunTxid(txidVersion, chain);
    return getLatestValidatedRailgunTxid;
  };
}
