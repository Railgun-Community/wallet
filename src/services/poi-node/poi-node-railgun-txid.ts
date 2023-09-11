import {
  Chain,
  GetLatestValidatedRailgunTxid,
} from '@railgun-community/engine';
import { POINodes } from './poi-nodes';

export const getLatestValidatedRailgunTxid: GetLatestValidatedRailgunTxid =
  async (chain: Chain) => {
    // TODO: Use better types
    const route = `/validated-txid/${chain.type}/${chain.id}`;
    const status: {
      validatedTxidIndex: Optional<number>;
      validatedMerkleroot: Optional<string>;
    } = await POINodes.get(route);

    return {
      txidIndex: status.validatedTxidIndex,
      merkleroot: status.validatedMerkleroot,
    };
  };
