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
} from '@railgun-community/shared-models';
import axios, { AxiosError } from 'axios';
import { sendErrorMessage } from '../../utils';

export class POINodeRequest {
  private nodeURL: string;

  constructor(nodeURL: string) {
    this.nodeURL = nodeURL;
  }

  private getNodeRouteURL = (route: string): string => {
    return `${this.nodeURL}/${route}`;
  };

  private static async getRequest<ResponseData>(
    url: string,
  ): Promise<ResponseData> {
    try {
      const { data }: { data: ResponseData } = await axios.get(url);
      return data;
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        throw err;
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const errMessage = `${err.message}: ${err.response?.data}`;
      sendErrorMessage(`POI REQUEST ERROR ${url} - ${errMessage}`);
      throw new Error(errMessage);
    }
  }

  private static async postRequest<Params, ResponseData>(
    url: string,
    params: Params,
  ): Promise<ResponseData> {
    try {
      const { data }: { data: ResponseData } = await axios.post(url, params);
      return data;
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        throw err;
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const errMessage = `${err.message}: ${err.response?.data}`;
      sendErrorMessage(`POI REQUEST ERROR ${url} - ${errMessage}`);
      throw new Error(errMessage);
    }
  }

  validateRailgunTxidMerkleroot = async (
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
      tree,
      index,
      merkleroot,
    });
    return isValid;
  };

  getLatestValidatedRailgunTxid = async (
    chain: Chain,
  ): Promise<ValidatedRailgunTxidStatus> => {
    const route = `validated-txid/${chain.type}/${chain.id}`;
    const url = this.getNodeRouteURL(route);
    const status = await POINodeRequest.getRequest<ValidatedRailgunTxidStatus>(
      url,
    );
    return status;
  };

  getPOIsPerList = async (
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
      listKeys,
      blindedCommitmentDatas,
    });
    return poiStatusListMap;
  };

  getPOIMerkleProofs = async (
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
      listKey,
      blindedCommitments,
    });
    return merkleProofs;
  };

  submitPOI = async (
    chain: Chain,
    listKey: string,
    transactProofData: TransactProofData,
  ) => {
    const route = `submit-transact-proof/${chain.type}/${chain.id}`;
    const url = this.getNodeRouteURL(route);

    await POINodeRequest.postRequest<SubmitTransactProofParams, void>(url, {
      listKey,
      transactProofData,
    });
  };
}
