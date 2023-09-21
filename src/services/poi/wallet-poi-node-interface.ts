import {
  Chain,
  BlindedCommitmentData,
  POIsPerList,
  TXOPOIListStatus,
  POIEngineProofInputs,
  POIEngineProofInputsWithListPOIData,
  createDummyMerkleProof,
  POINodeInterface,
} from '@railgun-community/engine';
import { POINodeRequest } from './poi-node-request';
import {
  MerkleProof,
  POIStatus,
  TransactProofData,
  networkForChain,
} from '@railgun-community/shared-models';
import { sendMessage } from '../../utils';
// eslint-disable-next-line import/no-cycle
import { getEngine } from '../railgun/core/engine';

export class WalletPOINodeInterface extends POINodeInterface {
  private poiNodeRequest: POINodeRequest;

  constructor(poiNodeURL: string) {
    super();
    this.poiNodeRequest = new POINodeRequest(poiNodeURL);
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

  async getPOIsPerList(
    chain: Chain,
    listKeys: string[],
    blindedCommitmentDatas: BlindedCommitmentData[],
  ): Promise<{ [blindedCommitment: string]: POIsPerList }> {
    const poisPerList = await this.poiNodeRequest.getPOIsPerList(
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
    chain: Chain,
    listKey: string,
    proofInputs: POIEngineProofInputs,
    railgunTransactionBlockNumber: number,
  ): Promise<MerkleProof[]> {
    const network = networkForChain(chain);
    if (!network) {
      throw new Error(`No network found`);
    }
    const networkPOISettings = network.poi;
    if (!networkPOISettings) {
      throw new Error(`No POI settings found`);
    }
    const { launchBlock } = networkPOISettings;

    if (railgunTransactionBlockNumber < launchBlock) {
      return proofInputs.blindedCommitmentsIn.map(createDummyMerkleProof);
    }

    return this.poiNodeRequest.getPOIMerkleProofs(
      chain,
      listKey,
      proofInputs.blindedCommitmentsIn,
    );
  }

  async generateAndSubmitPOI(
    chain: Chain,
    listKey: string,
    proofInputs: POIEngineProofInputs,
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

    const { proof } = await getEngine().prover.provePOI(
      finalProofInputs,
      progressCallback,
    );

    const transactProofData: TransactProofData = {
      snarkProof: proof,
      poiMerkleroots: poiMerkleProofs.map(merkleProof => merkleProof.root),
      txidMerkleroot: proofInputs.anyRailgunTxidMerklerootAfterTransaction,
      txidMerklerootIndex,
      blindedCommitmentOutputs: proofInputs.blindedCommitmentsOut,
    };

    return this.poiNodeRequest.submitPOI(chain, listKey, transactProofData);
  }
}
