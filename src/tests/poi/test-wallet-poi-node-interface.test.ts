/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  BlindedCommitmentData,
  Chain,
  POIEngineProofInputs,
  POIEngineProofInputsWithListPOIData,
  POINodeInterface,
  POIsPerList,
  RailgunEngine,
  TXOPOIListStatus,
  createDummyMerkleProof,
} from '@railgun-community/engine';
import {
  MerkleProof,
  TXIDVersion,
  networkForChain,
} from '@railgun-community/shared-models';
import { sendMessage } from '../../utils';

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
  private async getPOIMerkleProofs(
    chain: Chain,
    listKey: string,
    proofInputs: POIEngineProofInputs,
    railgunTransactionBlockNumber: number,
  ): Promise<MerkleProof[]> {
    const { launchBlock } = TestWalletPOINodeInterface.getPOISettings(chain);

    if (railgunTransactionBlockNumber < launchBlock) {
      return proofInputs.blindedCommitmentsIn.map(createDummyMerkleProof);
    }

    throw new Error('Could not get merkle proofs - no POI node');
  }

  // eslint-disable-next-line class-methods-use-this
  async generateAndSubmitPOI(
    txidVersion: TXIDVersion,
    chain: Chain,
    listKey: string,
    proofInputs: POIEngineProofInputs,
    blindedCommitmentsOut: string[],
    txidMerklerootIndex: number,
    railgunTransactionBlockNumber: number,
  ): Promise<void> {
    const poiMerkleProofs = await this.getPOIMerkleProofs(
      chain,
      listKey,
      proofInputs,
      railgunTransactionBlockNumber,
    );
    const finalProofInputs: POIEngineProofInputsWithListPOIData = {
      ...proofInputs,
      poiMerkleroots: poiMerkleProofs.map(merkleProof => merkleProof.root),
      poiInMerkleProofIndices: poiMerkleProofs.map(
        merkleProof => merkleProof.indices,
      ),
      poiInMerkleProofPathElements: poiMerkleProofs.map(
        merkleProof => merkleProof.elements,
      ),
    };

    const progressCallback = (progress: number) => {
      sendMessage(
        `Generating POI proof for ${listKey}... ${Math.round(progress * 100)}%`,
      );
    };

    const { proof } = await this.engine.prover.provePOI(
      finalProofInputs,
      blindedCommitmentsOut,
      progressCallback,
    );

    throw new Error('Could not submit POI - no POI node');
  }
}
