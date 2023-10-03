/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  BlindedCommitmentData,
  Chain,
  POINodeInterface,
  POIsPerList,
  RailgunEngine,
  TXOPOIListStatus,
} from '@railgun-community/engine';
import {
  MerkleProof,
  SnarkProof,
  TXIDVersion,
  networkForChain,
} from '@railgun-community/shared-models';

export const MOCK_LIST_KEY = 'test_list';

export class TestWalletPOINodeInterface extends POINodeInterface {
  // Prevents a circular dependency
  private engine: RailgunEngine;

  constructor(engine: RailgunEngine) {
    super();
    this.engine = engine;
  }

  private static getPOISettings(chain: Chain) {
    const network = networkForChain(chain);
    if (!network) {
      throw new Error(`No network found`);
    }
    const networkPOISettings = network.poi;
    if (!networkPOISettings) {
      throw new Error(`No POI settings found`);
    }
    return networkPOISettings;
  }

  // eslint-disable-next-line class-methods-use-this
  isActive(chain: Chain): boolean {
    return TestWalletPOINodeInterface.getPOISettings(chain) != null;
  }

  // eslint-disable-next-line class-methods-use-this
  async getPOIsPerList(
    txidVersion: TXIDVersion,
    _chain: Chain,
    listKeys: string[],
    blindedCommitmentDatas: BlindedCommitmentData[],
  ): Promise<{ [blindedCommitment: string]: POIsPerList }> {
    const allMissing: { [blindedCommitment: string]: POIsPerList } = {};
    blindedCommitmentDatas.forEach(blindedCommitmentData => {
      allMissing[blindedCommitmentData.blindedCommitment] ??= {};
      listKeys.forEach(listKey => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        allMissing[blindedCommitmentData.blindedCommitment][listKey] =
          TXOPOIListStatus.Missing;
      });
    });
    return allMissing;
  }

  // eslint-disable-next-line class-methods-use-this
  async getPOIMerkleProofs(
    txidVersion: TXIDVersion,
    chain: Chain,
    listKey: string,
    blindedCommitments: string[],
  ): Promise<MerkleProof[]> {
    throw new Error('Could not get merkle proofs - no POI node');
  }

  // eslint-disable-next-line class-methods-use-this
  async submitPOI(
    txidVersion: TXIDVersion,
    chain: Chain,
    listKey: string,
    snarkProof: SnarkProof,
    poiMerkleroots: string[],
    txidMerkleroot: string,
    txidMerklerootIndex: number,
    blindedCommitmentsOut: string[],
    railgunTxidIfHasUnshield: string,
  ): Promise<void> {
    throw new Error('Could not submit POI - no POI node');
  }
}
