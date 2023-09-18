import {
  NETWORK_CONFIG,
  NetworkName,
  ShieldProofData,
  SubmitShieldProofParams,
  SubmitTransactProofParams,
  TransactProofData,
} from '@railgun-community/shared-models';
import axios, { AxiosError } from 'axios';
import { sendErrorMessage } from '../../../utils';

export class POINodeRequest {
  private static getNodeRouteURL = (url: string, route: string): string => {
    return `${url}/${route}`;
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
      const errMessage = err.message;
      sendErrorMessage(`ERROR ${url} - ${errMessage}`);
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
      sendErrorMessage(`ERROR ${url} - ${errMessage}`);
      throw new Error(errMessage);
    }
  }

  static submitShieldProof = async (
    nodeURL: string,
    networkName: NetworkName,
    shieldProofData: ShieldProofData,
  ): Promise<void> => {
    const chain = NETWORK_CONFIG[networkName].chain;
    const route = `submit-shield-proof/${chain.type}/${chain.id}`;
    const url = POINodeRequest.getNodeRouteURL(nodeURL, route);
    await POINodeRequest.postRequest<SubmitShieldProofParams, void>(url, {
      shieldProofData,
    });
  };

  static submitTransactProof = async (
    nodeURL: string,
    networkName: NetworkName,
    listKey: string,
    transactProofData: TransactProofData,
  ): Promise<void> => {
    const chain = NETWORK_CONFIG[networkName].chain;
    const route = `submit-transact-proof/${chain.type}/${chain.id}`;
    const url = POINodeRequest.getNodeRouteURL(nodeURL, route);
    await POINodeRequest.postRequest<SubmitTransactProofParams, void>(url, {
      listKey,
      transactProofData,
    });
  };
}
