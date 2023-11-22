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
  private nodeURL: string;

  constructor(nodeURL: string) {
    this.nodeURL = nodeURL;
  }

  private getNodeRouteURL = (route: string): string => {
    return `${this.nodeURL}/${route}`;
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

  validateRailgunTxidMerkleroot = async (
    txidVersion: TXIDVersion,
    chain: Chain,
    tree: number,
    index: number,
    merkleroot: string,
  ): Promise<boolean> => {
    const route = `validate-txid-merkleroot/${chain.type}/${chain.id}`;
    const url = this.getNodeRouteURL(route);
    const isValid = await POINodeRequest.postRequest<
      ValidateTxidMerklerootParams,
      boolean
    >(url, {
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
    const url = this.getNodeRouteURL(route);
    const status = await POINodeRequest.postRequest<
      GetLatestValidatedRailgunTxidParams,
      ValidatedRailgunTxidStatus
    >(url, { txidVersion });
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
      const url = this.getNodeRouteURL(route);
      const validated = await POINodeRequest.postRequest<
        ValidatePOIMerklerootsParams,
        boolean
      >(url, { txidVersion, listKey, poiMerkleroots });
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
    const url = this.getNodeRouteURL(route);

    const poiStatusListMap = await POINodeRequest.postRequest<
      GetPOIsPerListParams,
      POIsPerListMap
    >(url, {
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
    const url = this.getNodeRouteURL(route);

    const merkleProofs = await POINodeRequest.postRequest<
      GetMerkleProofsParams,
      MerkleProof[]
    >(url, {
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
    const url = this.getNodeRouteURL(route);

    await POINodeRequest.postRequest<SubmitTransactProofParams, void>(url, {
      txidVersion,
      listKey,
      transactProofData,
    });
  };

  submitLegacyTransactProofs = async (
    txidVersion: TXIDVersion,
    chain: Chain,
    listKeys: string[],
    legacyTransactProofDatas: LegacyTransactProofData[],
  ) => {
    const route = `submit-legacy-transact-proofs/${chain.type}/${chain.id}`;
    const url = this.getNodeRouteURL(route);

    await POINodeRequest.postRequest<SubmitLegacyTransactProofParams, void>(
      url,
      {
        txidVersion,
        listKeys,
        legacyTransactProofDatas,
      },
    );
  };

  submitSingleCommitmentProof = async (
    txidVersion: TXIDVersion,
    chain: Chain,
    singleCommitmentProofsData: SingleCommitmentProofsData,
  ) => {
    const route = `submit-single-commitment-proofs/${chain.type}/${chain.id}`;
    const url = this.getNodeRouteURL(route);

    await POINodeRequest.postRequest<SubmitSingleCommitmentProofsParams, void>(
      url,
      {
        txidVersion,
        singleCommitmentProofsData,
      },
    );
  };
}
