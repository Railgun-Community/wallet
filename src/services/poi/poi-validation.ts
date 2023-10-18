/* eslint-disable no-await-in-loop */
import {
  Chain,
  TXIDVersion,
  TransactProofData,
  isDefined,
  networkForChain,
} from '@railgun-community/shared-models';
import { POIProof } from './poi-proof';
import {
  POI,
  createDummyMerkleProof,
  getGlobalTreePositionPreTransactionPOIProof,
  getRailgunTxidLeafHash,
  PreTransactionPOIsPerTxidLeafPerList,
  hexToBigInt,
} from '@railgun-community/engine';
import {
  ExtractedRailgunTransactionData,
  extractRailgunTransactionDataFromTransactionRequest,
} from '../railgun/process/extract-transaction-data';
import { ContractTransaction } from 'ethers';
import { walletForID } from '../railgun/wallets/wallets';

export type POIMerklerootsValidator = (
  txidVersion: TXIDVersion,
  chain: Chain,
  listKey: string,
  poiMerkleroots: string[],
) => Promise<boolean>;

export class POIValidation {
  private static validatePOIMerkleroots: Optional<POIMerklerootsValidator>;

  static init(validatePOIMerkleroots: POIMerklerootsValidator) {
    this.validatePOIMerkleroots = validatePOIMerkleroots;
  }

  static async hasValidPOIsForReceiveCommitment(
    railgunWalletID: string,
    txidVersion: TXIDVersion,
    chain: Chain,
    commitment: string,
  ): Promise<boolean> {
    const wallet = walletForID(railgunWalletID);
    const hasValidPOIs = await wallet.receiveCommitmentHasValidPOI(
      txidVersion,
      chain,
      commitment,
    );
    return hasValidPOIs;
  }

  static async isValidSpendableTransaction(
    railgunWalletID: string,
    txidVersion: TXIDVersion,
    chain: Chain,
    transactionRequest: ContractTransaction,
    useRelayAdapt: boolean,
    pois: PreTransactionPOIsPerTxidLeafPerList,
  ): Promise<{
    isValid: boolean;
    error?: string;
    extractedRailgunTransactionData?: ExtractedRailgunTransactionData;
  }> {
    try {
      const network = networkForChain(chain);
      if (!network) {
        throw new Error('Invalid network');
      }

      const extractedRailgunTransactionData: ExtractedRailgunTransactionData =
        await extractRailgunTransactionDataFromTransactionRequest(
          railgunWalletID,
          network,
          transactionRequest,
          useRelayAdapt,
        );

      const activeListKeys = POI.getActiveListKeys();

      for (const listKey of activeListKeys) {
        await this.assertIsValidSpendableTXID(
          listKey,
          txidVersion,
          chain,
          pois,
          extractedRailgunTransactionData.map(data => data.railgunTxid),
          extractedRailgunTransactionData.map(data => data.utxoTreeIn),
        );
      }

      return { isValid: true, extractedRailgunTransactionData };
    } catch (err) {
      if (!(err instanceof Error)) {
        throw err;
      }
      return {
        isValid: false,
        error: `Could not validate spendable TXID: ${err.message}`,
      };
    }
  }

  static async assertIsValidSpendableTXID(
    listKey: string,
    txidVersion: TXIDVersion,
    chain: Chain,
    pois: PreTransactionPOIsPerTxidLeafPerList,
    railgunTxids: string[],
    utxoTreesIn: bigint[],
  ): Promise<boolean> {
    if (!this.validatePOIMerkleroots) {
      throw new Error('No POI merkleroot validator found');
    }

    const txidLeafHashes: string[] = railgunTxids.map((railgunTxid, index) =>
      getRailgunTxidLeafHash(
        hexToBigInt(railgunTxid),
        utxoTreesIn[index],
        getGlobalTreePositionPreTransactionPOIProof(),
        txidVersion,
      ),
    );

    // 1. Validate list key is present
    if (!isDefined(pois[listKey])) {
      throw new Error(`Missing POIs for list: ${listKey}`);
    }

    const poisForList = pois[listKey];

    for (const txidLeafHash of txidLeafHashes) {
      // 2. Validate txid leaf hash
      if (!isDefined(poisForList[txidLeafHash])) {
        throw new Error(
          `Missing POI for txidLeafHash ${txidLeafHash} for list ${listKey}`,
        );
      }

      const {
        snarkProof,
        txidMerkleroot,
        poiMerkleroots,
        blindedCommitmentsOut,
        railgunTxidIfHasUnshield,
      } = poisForList[txidLeafHash];

      // 3. Validate txidDummyMerkleProof and txid root
      const dummyMerkleProof = createDummyMerkleProof(txidLeafHash);
      if (dummyMerkleProof.root !== txidMerkleroot) {
        throw new Error('Invalid txid merkle proof');
      }

      // 4. Validate POI merkleroots for each list
      const validPOIMerkleroots = await this.validatePOIMerkleroots(
        txidVersion,
        chain,
        listKey,
        poiMerkleroots,
      );
      if (!validPOIMerkleroots) {
        throw new Error(`Invalid POI merkleroots: list ${listKey}`);
      }

      // 5. Verify snark proof for each list
      const transactProofData: TransactProofData = {
        snarkProof,
        txidMerkleroot,
        poiMerkleroots,
        blindedCommitmentsOut,
        railgunTxidIfHasUnshield,
        txidMerklerootIndex: 0, // Unused
      };
      const validProof = await POIProof.verifyTransactProof(transactProofData);
      if (!validProof) {
        throw new Error(`Could not verify POI snark proof: list ${listKey}`);
      }
    }

    return true;
  }
}
