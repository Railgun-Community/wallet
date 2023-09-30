import {
  Chain,
  BlindedCommitmentData,
  POIsPerList,
  TXOPOIListStatus,
  POIEngineProofInputs,
  POIEngineProofInputsWithListPOIData,
  createDummyMerkleProof,
  POINodeInterface,
  RailgunEngine,
} from '@railgun-community/engine';
import { POINodeRequest } from './poi-node-request';
import {
  MerkleProof,
  POIStatus,
  TXIDVersion,
  TransactProofData,
  networkForChain,
} from '@railgun-community/shared-models';
import { sendMessage } from '../../utils';

export class WalletPOINodeInterface extends POINodeInterface {
  private poiNodeRequest: POINodeRequest;

  // Prevents a circular dependency
  private engine: RailgunEngine;

  constructor(poiNodeURL: string, engine: RailgunEngine) {
    super();
    this.poiNodeRequest = new POINodeRequest(poiNodeURL);
    this.engine = engine;
  }

  private static poiStatusToTXOPOIStatus = (
    poiStatus: POIStatus,
  ): TXOPOIListStatus => {
    switch (poiStatus) {
      case POIStatus.Valid:
        return TXOPOIListStatus.Valid;
      case POIStatus.ShieldPending:
        return TXOPOIListStatus.ShieldPending;
      case POIStatus.ShieldBlocked:
        return TXOPOIListStatus.ShieldBlocked;
      case POIStatus.TransactProofSubmitted:
        return TXOPOIListStatus.TransactProofSubmitted;
      case POIStatus.Missing:
        return TXOPOIListStatus.Missing;
    }
  };

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
    return WalletPOINodeInterface.getPOISettings(chain) != null;
  }

  async getPOIsPerList(
    txidVersion: TXIDVersion,
    chain: Chain,
    listKeys: string[],
    blindedCommitmentDatas: BlindedCommitmentData[],
  ): Promise<{ [blindedCommitment: string]: POIsPerList }> {
    const poisPerList = await this.poiNodeRequest.getPOIsPerList(
      txidVersion,
      chain,
      listKeys,
      blindedCommitmentDatas,
    );

    const poisPerListConverted: { [blindedCommitment: string]: POIsPerList } =
      {};
    for (const blindedCommitment of Object.keys(poisPerList)) {
      poisPerListConverted[blindedCommitment] = {};
      for (const listKey of Object.keys(poisPerList[blindedCommitment])) {
        const poiStatus = poisPerList[blindedCommitment][listKey];
        poisPerListConverted[blindedCommitment][listKey] =
          WalletPOINodeInterface.poiStatusToTXOPOIStatus(poiStatus);
      }
    }
    return poisPerListConverted;
  }

  private async getPOIMerkleProofs(
    txidVersion: TXIDVersion,
    chain: Chain,
    listKey: string,
    proofInputs: POIEngineProofInputs,
    railgunTransactionBlockNumber: number,
  ): Promise<MerkleProof[]> {
    const { launchBlock } = WalletPOINodeInterface.getPOISettings(chain);

    if (railgunTransactionBlockNumber < launchBlock) {
      return proofInputs.blindedCommitmentsIn.map(createDummyMerkleProof);
    }

    return this.poiNodeRequest.getPOIMerkleProofs(
      txidVersion,
      chain,
      listKey,
      proofInputs.blindedCommitmentsIn,
    );
  }

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
      txidVersion,
      chain,
      listKey,
      proofInputs,
      railgunTransactionBlockNumber,
    );
    const poiMerkleroots = poiMerkleProofs.map(merkleProof => merkleProof.root);
    const finalProofInputs: POIEngineProofInputsWithListPOIData = {
      ...proofInputs,
      poiMerkleroots,
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

    const transactProofData: TransactProofData = {
      snarkProof: proof,
      poiMerkleroots,
      txidMerkleroot: proofInputs.anyRailgunTxidMerklerootAfterTransaction,
      txidMerklerootIndex,
      blindedCommitmentOutputs: blindedCommitmentsOut,
    };

    return this.poiNodeRequest.submitPOI(
      txidVersion,
      chain,
      listKey,
      transactProofData,
    );
  }
}
