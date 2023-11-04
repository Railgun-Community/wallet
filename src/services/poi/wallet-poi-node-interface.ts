import {
  Chain,
  BlindedCommitmentData,
  POIsPerList,
  TXOPOIListStatus,
  POINodeInterface,
  LegacyTransactProofData,
} from '@railgun-community/engine';
import { POINodeRequest } from './poi-node-request';
import {
  MerkleProof,
  POIStatus,
  SnarkProof,
  TXIDVersion,
  TransactProofData,
  networkForChain,
} from '@railgun-community/shared-models';
import { POIRequired } from './poi-required';

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
      case POIStatus.ShieldBlocked:
        return TXOPOIListStatus.ShieldBlocked;
      case POIStatus.ProofSubmitted:
        return TXOPOIListStatus.ProofSubmitted;
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

  // eslint-disable-next-line class-methods-use-this
  async isRequired(chain: Chain): Promise<boolean> {
    const network = networkForChain(chain);
    if (!network) {
      throw new Error(`No network for chain ${chain.type}:${chain.id}`);
    }
    return POIRequired.isRequiredForNetwork(network.name);
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

  async getPOIMerkleProofs(
    txidVersion: TXIDVersion,
    chain: Chain,
    listKey: string,
    blindedCommitments: string[],
  ): Promise<MerkleProof[]> {
    return this.poiNodeRequest.getPOIMerkleProofs(
      txidVersion,
      chain,
      listKey,
      blindedCommitments,
    );
  }

  async validatePOIMerkleroots(
    txidVersion: TXIDVersion,
    chain: Chain,
    listKey: string,
    poiMerkleroots: string[],
  ): Promise<boolean> {
    return this.poiNodeRequest.validatePOIMerkleroots(
      txidVersion,
      chain,
      listKey,
      poiMerkleroots,
    );
  }

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
    const transactProofData: TransactProofData = {
      snarkProof,
      poiMerkleroots,
      txidMerkleroot,
      txidMerklerootIndex,
      blindedCommitmentsOut,
      railgunTxidIfHasUnshield,
    };
    return this.poiNodeRequest.submitPOI(
      txidVersion,
      chain,
      listKey,
      transactProofData,
    );
  }

  async submitLegacyTransactProofs(
    txidVersion: TXIDVersion,
    chain: Chain,
    listKeys: string[],
    legacyTransactProofDatas: LegacyTransactProofData[],
  ): Promise<void> {
    return this.poiNodeRequest.submitLegacyTransactProofs(
      txidVersion,
      chain,
      listKeys,
      legacyTransactProofDatas,
    );
  }
}
