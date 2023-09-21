import { Chain } from '@railgun-community/engine';
import { POINodeRequest } from './poi-node-request';
import { isDefined } from '@railgun-community/shared-models';

export class WalletPOIRequester {
  private poiNodeRequest: Optional<POINodeRequest>;

  constructor(poiNodeURL?: string) {
    this.poiNodeRequest = isDefined(poiNodeURL)
      ? new POINodeRequest(poiNodeURL)
      : undefined;
  }

  async validateRailgunTxidMerkleroot(
    chain: Chain,
    tree: number,
    index: number,
    merkleroot: string,
  ): Promise<boolean> {
    if (!this.poiNodeRequest) {
      return false;
    }
    return this.poiNodeRequest.validateRailgunTxidMerkleroot(
      chain,
      tree,
      index,
      merkleroot,
    );
  }

  async getLatestValidatedRailgunTxid(
    chain: Chain,
  ): Promise<{ txidIndex: Optional<number>; merkleroot: Optional<string> }> {
    if (!this.poiNodeRequest) {
      return { txidIndex: undefined, merkleroot: undefined };
    }
    const txidStatus = await this.poiNodeRequest.getLatestValidatedRailgunTxid(
      chain,
    );
    return {
      txidIndex: txidStatus.validatedTxidIndex,
      merkleroot: txidStatus.validatedMerkleroot,
    };
  }
}
