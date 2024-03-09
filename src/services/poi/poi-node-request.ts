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
  POIJSONRPCMethod,
} from '@railgun-community/shared-models';
import axios, { AxiosError } from 'axios';
import { sendErrorMessage } from '../../utils';
import { LegacyTransactProofData } from '@railgun-community/engine';
import { JsonRpcError, JsonRpcPayload, JsonRpcResult } from 'ethers';

export class POINodeRequest {
  private nodeURLs: string[];

  constructor(nodeURLs: string[]) {
    this.nodeURLs = nodeURLs;
  }

  private getNodeURL = (nodeUrlAttemptIndex: number): string => {
    return `${this.nodeURLs[nodeUrlAttemptIndex]}`;
  };

  private static async jsonRpcRequest<
    Params extends any[] | Record<string, any>,
    ResponseData,
  >(
    url: string,
    method: POIJSONRPCMethod,
    params: Params,
  ): Promise<ResponseData> {
    const payload: JsonRpcPayload = {
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now(),
    };

    try {
      const { data }: { data: JsonRpcResult | JsonRpcError } = await axios.post(
        url,
        payload,
      );

      // Check if the response contains an error
      if ('error' in data) {
        throw new Error(data.error.message);
      }

      // Assume the result will always be in the expected ResponseData format
      return data.result as ResponseData;
    } catch (cause) {
      if (!(cause instanceof AxiosError)) {
        throw new Error('Non-error thrown in axios post request.', { cause });
      }
      const err = new Error(`POI request error ${url}`, { cause });
      sendErrorMessage(err);
      throw err;
    }
  }

  private async attemptRequestWithFallbacks<
    Params extends any[] | Record<string, any>,
    ResponseData,
  >(
    method: POIJSONRPCMethod,
    params: Params,
    nodeUrlAttemptIndex = 0,
    finalAttempt = false,
  ): Promise<ResponseData> {
    try {
      const url = this.getNodeURL(nodeUrlAttemptIndex);
      const res = await POINodeRequest.jsonRpcRequest<Params, ResponseData>(
        url,
        method,
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
          method,
          params,
          0, // nodeUrlAttemptIndex
          true, // finalAttempt
        );
      }

      // Retry with next priority node URL.
      return this.attemptRequestWithFallbacks(
        method,
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
    const method = POIJSONRPCMethod.ValidateTXIDMerkleroot;
    const isValid = await this.attemptRequestWithFallbacks<
      ValidateTxidMerklerootParams,
      boolean
    >(method, {
      chainType: chain.type.toString(),
      chainID: chain.id.toString(),
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
    const method = POIJSONRPCMethod.ValidatedTXID;
    const status = await this.attemptRequestWithFallbacks<
      GetLatestValidatedRailgunTxidParams,
      ValidatedRailgunTxidStatus
    >(method, {
      chainType: chain.type.toString(),
      chainID: chain.id.toString(),
      txidVersion,
    });
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
      const method = POIJSONRPCMethod.ValidatePOIMerkleroots;
      const validated = await this.attemptRequestWithFallbacks<
        ValidatePOIMerklerootsParams,
        boolean
      >(method, {
        chainType: chain.type.toString(),
        chainID: chain.id.toString(),
        txidVersion,
        listKey,
        poiMerkleroots,
      });
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
    const method = POIJSONRPCMethod.POIsPerList;
    const poiStatusListMap = await this.attemptRequestWithFallbacks<
      GetPOIsPerListParams,
      POIsPerListMap
    >(method, {
      chainType: chain.type.toString(),
      chainID: chain.id.toString(),
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
    const method = POIJSONRPCMethod.MerkleProofs;

    const merkleProofs = await this.attemptRequestWithFallbacks<
      GetMerkleProofsParams,
      MerkleProof[]
    >(method, {
      chainType: chain.type.toString(),
      chainID: chain.id.toString(),
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
    const method = POIJSONRPCMethod.SubmitTransactProof;

    await this.attemptRequestWithFallbacks<SubmitTransactProofParams, void>(
      method,
      {
        chainType: chain.type.toString(),
        chainID: chain.id.toString(),
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
    const method = POIJSONRPCMethod.SubmitLegacyTransactProofs;

    await this.attemptRequestWithFallbacks<
      SubmitLegacyTransactProofParams,
      void
    >(method, {
      chainType: chain.type.toString(),
      chainID: chain.id.toString(),
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
    const method = POIJSONRPCMethod.SubmitSingleCommitmentProofs;

    await this.attemptRequestWithFallbacks<
      SubmitSingleCommitmentProofsParams,
      void
    >(method, {
      chainType: chain.type.toString(),
      chainID: chain.id.toString(),
      txidVersion,
      singleCommitmentProofsData,
    });
  };
}
