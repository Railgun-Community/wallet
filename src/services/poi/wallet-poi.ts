import {
  GetLatestValidatedRailgunTxid,
  POI,
  POIList,
  POINodeInterface,
} from '@railgun-community/engine';
import { POI_REQUIRED_LISTS } from './poi-constants';
import { MerklerootValidator } from '@railgun-community/engine/dist/models/merkletree-types';
import { WalletPOIRequester } from './wallet-poi-requester';

export class WalletPOI {
  static started = false;

  static init(poiNodeInterface: POINodeInterface, customLists: POIList[]) {
    const poiLists: POIList[] = [...POI_REQUIRED_LISTS, ...customLists];
    POI.init(poiLists, poiNodeInterface);
    this.started = true;
  }

  static getPOITxidMerklerootValidator = (
    poiNodeURL?: string,
  ): MerklerootValidator => {
    const poiRequester = new WalletPOIRequester(poiNodeURL);
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
    poiNodeURL?: string,
  ): GetLatestValidatedRailgunTxid => {
    const poiRequester = new WalletPOIRequester(poiNodeURL);
    const getLatestValidatedRailgunTxid: GetLatestValidatedRailgunTxid = (
      txidVersion,
      chain,
    ) => poiRequester.getLatestValidatedRailgunTxid(txidVersion, chain);
    return getLatestValidatedRailgunTxid;
  };
}
