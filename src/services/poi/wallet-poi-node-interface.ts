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
  delay,
  isDefined,
  networkForChain,
  type POIsPerListMap,
} from '@railgun-community/shared-models';
import { POIRequired } from './poi-required';

export type BatchListUpdateEvent = {
  current: number;
  total: number;
  percent: number;
  status: string;
};

export class WalletPOINodeInterface extends POINodeInterface {
  private poiNodeRequest: POINodeRequest;
  private batchSize = 20;

  private static isPaused = false;

  private static isPausedMap: { [type: number]: { [id: number]: boolean } } =
    {};

  static isPausedForChain(chain: Chain): boolean {
    return WalletPOINodeInterface.isPausedMap[chain.type]?.[chain.id] ?? false;
  }

  static listBatchCallback:
    | ((batchData: BatchListUpdateEvent) => void)
    | undefined;

  constructor(poiNodeURLs: string[]) {
    super();
    this.poiNodeRequest = new POINodeRequest(poiNodeURLs);
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

  static pause(chain: Chain): void {
    WalletPOINodeInterface.isPausedMap[chain.type] ??= {};
    WalletPOINodeInterface.isPausedMap[chain.type][chain.id] = true;
  }

  static unpause(chain: Chain): void {
    // would be good practice to unpause when loading providers, or resuming polling providers.
    WalletPOINodeInterface.isPausedMap[chain.type] ??= {};
    WalletPOINodeInterface.isPausedMap[chain.type][chain.id] = false;
  }

  // eslint-disable-next-line class-methods-use-this
  async isRequired(chain: Chain): Promise<boolean> {
    const network = networkForChain(chain);
    if (!network) {
      throw new Error(`No network for chain ${chain.type}:${chain.id}`);
    }
    return POIRequired.isRequiredForNetwork(network.name);
  }

  static setListBatchCallback = (
    callback: (batchData: BatchListUpdateEvent) => void,
  ): void => {
    WalletPOINodeInterface.listBatchCallback = callback;
  };

  static clearListBatchStatus = (): void => {
    if (isDefined(WalletPOINodeInterface.listBatchCallback)) {
      WalletPOINodeInterface.listBatchCallback({
        current: 0,
        total: 0,
        percent: 0,
        status: '',
      });
    }
  };

  static emitListBatchCallback = (
    current: number,
    total: number,
    message: string,
  ) => {
    if (isDefined(WalletPOINodeInterface.listBatchCallback)) {
      const percent = (current / total) * 100;
      const status = `${message} PPOI Batch (${current} of ${total}) ${percent.toFixed(
        2,
      )}%`;
      WalletPOINodeInterface.listBatchCallback({
        current,
        total,
        percent,
        status,
      });
    }
  };

  async getPOIsPerList(
    txidVersion: TXIDVersion,
    chain: Chain,
    listKeys: string[],
    blindedCommitmentDatas: BlindedCommitmentData[],
  ): Promise<{ [blindedCommitment: string]: POIsPerList }> {
    const poisPerList: POIsPerListMap = {};
    for (let i = 0; i < blindedCommitmentDatas.length; i += this.batchSize) {
      if (WalletPOINodeInterface.isPausedForChain(chain)) {
        WalletPOINodeInterface.clearListBatchStatus();
        continue;
      }
      const batch = blindedCommitmentDatas.slice(i, i + this.batchSize);
      const type = batch[0].type;
      WalletPOINodeInterface.emitListBatchCallback(
        i,
        blindedCommitmentDatas.length,
        `Verifying ${type}'s`,
      );
      const batchPoisPerList: POIsPerListMap =
        // eslint-disable-next-line no-await-in-loop
        await this.poiNodeRequest
          .getPOIsPerList(txidVersion, chain, listKeys, batch)
          .catch(() => {
            return {};
          });
      WalletPOINodeInterface.emitListBatchCallback(
        i + batch.length,
        blindedCommitmentDatas.length,
        `Received results for ${type}'s now Analyzing`,
      );
      // eslint-disable-next-line no-await-in-loop
      await delay(100);
      for (const blindedCommitment of Object.keys(batchPoisPerList)) {
        poisPerList[blindedCommitment] = batchPoisPerList[blindedCommitment];
      }
    }

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
    for (let i = 0; i < legacyTransactProofDatas.length; i += this.batchSize) {
      if (WalletPOINodeInterface.isPausedForChain(chain)) {
        continue;
      }
      const batch = legacyTransactProofDatas.slice(i, i + this.batchSize);
      WalletPOINodeInterface.emitListBatchCallback(
        i,
        legacyTransactProofDatas.length,
        'Submitting Legacy Transact Proofs',
      );
      // eslint-disable-next-line no-await-in-loop
      await this.poiNodeRequest
        .submitLegacyTransactProofs(txidVersion, chain, listKeys, batch)
        .catch(() => {
          return undefined;
        });
      WalletPOINodeInterface.emitListBatchCallback(
        i + batch.length,
        legacyTransactProofDatas.length,
        'Submitted Legacy Transact Proofs',
      );
      // eslint-disable-next-line no-await-in-loop
      await delay(100);
    }
  }
}
