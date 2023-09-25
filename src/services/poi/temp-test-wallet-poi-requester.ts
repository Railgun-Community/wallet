import { Chain } from '@railgun-community/engine';

export class TempTestWalletPOIRequester {
  // eslint-disable-next-line class-methods-use-this
  async validateRailgunTxidMerkleroot(
    chain: Chain,
    tree: number,
    index: number,
    merkleroot: string,
  ): Promise<boolean> {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  async getLatestValidatedRailgunTxid(
    chain: Chain,
  ): Promise<{ txidIndex: Optional<number>; merkleroot: Optional<string> }> {
    return { txidIndex: 100000, merkleroot: undefined };
  }
}
