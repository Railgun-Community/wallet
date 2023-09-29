/* eslint-disable @typescript-eslint/no-unused-vars */
import { Chain } from '@railgun-community/engine';
import { TXIDVersion } from '@railgun-community/shared-models';

export class TestWalletPOIRequester {
  // eslint-disable-next-line class-methods-use-this
  async validateRailgunTxidMerkleroot(
    txidVersion: TXIDVersion,
    chain: Chain,
    tree: number,
    index: number,
    merkleroot: string,
  ): Promise<boolean> {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  async getLatestValidatedRailgunTxid(
    txidVersion: TXIDVersion,
    chain: Chain,
  ): Promise<{ txidIndex: Optional<number>; merkleroot: Optional<string> }> {
    return { txidIndex: 100000, merkleroot: undefined };
  }
}
