import {
  Chain,
  GetLatestValidatedRailgunTxid,
} from '@railgun-community/engine';
import { POINodes } from './poi-nodes';
import { isDefined } from '@railgun-community/shared-models';

export const getLatestValidatedRailgunTxid: GetLatestValidatedRailgunTxid =
  async (chain: Chain): Promise<{ txidIndex: number; merkleroot: string }> => {
    // TODO: Use better types
    const route = `/validated-txid/${chain.type}/${chain.id}`;
    const status: {
      validatedTxidIndex: Optional<number>;
      validatedMerkleroot: Optional<string>;
    } = await POINodes.get(route);

    if (
      !isDefined(status.validatedTxidIndex) ||
      !isDefined(status.validatedMerkleroot)
    ) {
      // Not found
      return { txidIndex: -1, merkleroot: '' };
    }

    return {
      txidIndex: status.validatedTxidIndex,
      merkleroot: status.validatedMerkleroot,
    };
  };
