import { Chain } from '@railgun-community/engine';
import { POINodes } from '../../poi-node/poi-nodes';

export const validateRailgunTxidMerkleroot = async (
  chain: Chain,
  tree: number,
  index: number,
  merkleroot: string,
): Promise<boolean> => {
  // TODO: Better types
  const route = `/validate-txid-merkleroot/${chain.type}/${chain.id}`;
  const isValid: boolean = await POINodes.get(route, {
    tree,
    index,
    merkleroot,
  });
  return isValid;
};
