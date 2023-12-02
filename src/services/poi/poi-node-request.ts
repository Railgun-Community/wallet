import {
  TransactProofData,
  ValidateTxidMerklerootParams,
  SubmitTransactProofParams,
  GetMerkleProofsParams,
  MerkleProof,
  Chain,
  GetPOIsPerListParams,
  BlindedCommitmentData,
  POIsPerListMap,
  ValidatedRailgunTxidStatus,
  TXIDVersion,
  GetLatestValidatedRailgunTxidParams,
  SubmitLegacyTransactProofParams,
  ValidatePOIMerklerootsParams,
  SingleCommitmentProofsData,
  SubmitSingleCommitmentProofsParams,
  delay,
} from '@railgun-community/shared-models';
import axios, { AxiosError } from 'axios';
import { sendErrorMessage } from '../../utils';
import { LegacyTransactProofData } from '@railgun-community/engine';

export class POINodeRequest {
  private nodeURLs: string[];

  constructor(nodeURLs: string[]) {
    this.nodeURLs = nodeURLs;
  }

  private getNodeRouteURL = (
    route: string,
    nodeUrlAttemptIndex: number,
  ): string => {
    return `${this.nodeURLs[nodeUrlAttemptIndex]}/${route}`;
  };

  // private static async getRequest<ResponseData>(
  //   url: string,
  // ): Promise<ResponseData> {
  //   try {
  //     const { data }: { data: ResponseData } = await axios.get(url);
  //     return data;
  //   } catch (err) {
  //     if (!(err instanceof AxiosError)) {
  //       throw err;
  //     }
  //     // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  //     const errMessage = `${err.message}: ${err.response?.data}`;
  //     sendErrorMessage(`POI REQUEST ERROR ${url} - ${errMessage}`);
  //     throw new Error(errMessage);
  //   }
  // }

  private static async postRequest<Params, ResponseData>(
    url: string,
    params: Params,
  ): Promise<ResponseData> {
    try {
      const { data }: { data: ResponseData } = await axios.post(url, params);
      return data;
    } catch (cause) {
      if (!(cause instanceof AxiosError)) {
        throw new Error('Non-error thrown in axios post request.', { cause });
      }
      const err = new Error(`POI request error ${url}`, { cause });
      sendErrorMessage(err);
      throw err;
    }
  }

  private async attemptRequestWithFallbacks<Params, ResponseData>(
    route: string,
    params: Params,
    nodeUrlAttemptIndex = 0,
    finalAttempt = false,
  ): Promise<ResponseData> {
    try {
      const url = this.getNodeRouteURL(route, nodeUrlAttemptIndex);
      const res = await POINodeRequest.postRequest<Params, ResponseData>(
        url,
        params,
      );
      return res;
    } catch (err) {
      if (finalAttempt) {
        throw err;
      }

      // If nodeUrlAttemptIndex is already at the last index, try one final time with the priority 0 nodeUrl
      if (nodeUrlAttemptIndex === this.nodeURLs.length - 1) {
        return this.attemptRequestWithFallbacks(
          route,
          params,
          0, // nodeUrlAttemptIndex
          true, // finalAttempt
        );
      }

      // Retry with next priority node URL.
      return this.attemptRequestWithFallbacks(
        route,
        params,
        nodeUrlAttemptIndex + 1, // nodeUrlAttemptIndex
        false, // finalAttempt
      );
    }
  }

  validateRailgunTxidMerkleroot = async (
    txidVersion: TXIDVersion,
    chain: Chain,
    tree: number,
    index: number,
    merkleroot: string,
  ): Promise<boolean> => {
    const route = `validate-txid-merkleroot/${chain.type}/${chain.id}`;
    const isValid = await this.attemptRequestWithFallbacks<
      ValidateTxidMerklerootParams,
      boolean
    >(route, {
      txidVersion,
      tree,
      index,
      merkleroot,
    });
    return isValid;
  };

  getLatestValidatedRailgunTxid = async (
    txidVersion: TXIDVersion,
    chain: Chain,
  ): Promise<ValidatedRailgunTxidStatus> => {
    const route = `validated-txid/${chain.type}/${chain.id}`;
    const status = await this.attemptRequestWithFallbacks<
      GetLatestValidatedRailgunTxidParams,
      ValidatedRailgunTxidStatus
    >(route, { txidVersion });
    return status;
  };

  validatePOIMerkleroots = async (
    txidVersion: TXIDVersion,
    chain: Chain,
    listKey: string,
    poiMerkleroots: string[],
    retryCount = 0,
  ): Promise<boolean> => {
    try {
      const route = `validate-poi-merkleroots/${chain.type}/${chain.id}`;
      const validated = await this.attemptRequestWithFallbacks<
        ValidatePOIMerklerootsParams,
        boolean
      >(route, { txidVersion, listKey, poiMerkleroots });
      return validated;
    } catch (cause) {
      if (retryCount < 3) {
        // Delay 2.5s and try again.
        await delay(2500);
        return this.validatePOIMerkleroots(
          txidVersion,
          chain,
          listKey,
          poiMerkleroots,
          retryCount + 1,
        );
      }
      throw new Error('Failed to validate POI merkleroots.', { cause });
    }
  };

  getPOIsPerList = async (
    txidVersion: TXIDVersion,
    chain: Chain,
    listKeys: string[],
    blindedCommitmentDatas: BlindedCommitmentData[],
  ): Promise<POIsPerListMap> => {
    const route = `pois-per-list/${chain.type}/${chain.id}`;

    const poiStatusListMap = await this.attemptRequestWithFallbacks<
      GetPOIsPerListParams,
      POIsPerListMap
    >(route, {
      txidVersion,
      listKeys,
      blindedCommitmentDatas,
    });
    return poiStatusListMap;
  };

  getPOIMerkleProofs = async (
    txidVersion: TXIDVersion,
    chain: Chain,
    listKey: string,
    blindedCommitments: string[],
  ): Promise<MerkleProof[]> => {
    const route = `merkle-proofs/${chain.type}/${chain.id}`;

    const merkleProofs = await this.attemptRequestWithFallbacks<
      GetMerkleProofsParams,
      MerkleProof[]
    >(route, {
      txidVersion,
      listKey,
      blindedCommitments,
    });
    return merkleProofs;
  };

  submitPOI = async (
    txidVersion: TXIDVersion,
    chain: Chain,
    listKey: string,
    transactProofData: TransactProofData,
  ) => {
    const route = `submit-transact-proof/${chain.type}/${chain.id}`;

    await this.attemptRequestWithFallbacks<SubmitTransactProofParams, void>(
      route,
      {
        txidVersion,
        listKey,
        transactProofData,
      },
    );
  };

  submitLegacyTransactProofs = async (
    txidVersion: TXIDVersion,
    chain: Chain,
    listKeys: string[],
    legacyTransactProofDatas: LegacyTransactProofData[],
  ) => {
    const route = `submit-legacy-transact-proofs/${chain.type}/${chain.id}`;

    await this.attemptRequestWithFallbacks<
      SubmitLegacyTransactProofParams,
      void
    >(route, {
      txidVersion,
      listKeys,
      legacyTransactProofDatas,
    });
  };

  submitSingleCommitmentProof = async (
    txidVersion: TXIDVersion,
    chain: Chain,
    singleCommitmentProofsData: SingleCommitmentProofsData,
  ) => {
    const route = `submit-single-commitment-proofs/${chain.type}/${chain.id}`;

    await this.attemptRequestWithFallbacks<
      SubmitSingleCommitmentProofsParams,
      void
    >(route, {
      txidVersion,
      singleCommitmentProofsData,
    });
  };
}
