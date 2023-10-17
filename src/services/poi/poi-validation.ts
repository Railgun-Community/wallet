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
// eslint-disable-next-line import/no-cycle
import { extractRailgunTransactionDataFromTransactionRequest } from '../railgun/process/extract-transaction-data';
import { ContractTransaction } from 'ethers';

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

  static async isValidSpendableTXID(
    txidVersion: TXIDVersion,
    chain: Chain,
    transactionRequest: ContractTransaction,
    useRelayAdapt: boolean,
    pois: PreTransactionPOIsPerTxidLeafPerList,
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      if (!this.validatePOIMerkleroots) {
        throw new Error('No POI merkleroot validator found');
      }
      const network = networkForChain(chain);
      if (!network) {
        throw new Error('Invalid network');
      }

      const extractedRailgunTransactionData =
        extractRailgunTransactionDataFromTransactionRequest(
          network,
          transactionRequest,
          useRelayAdapt,
        );
      const expectedTxidLeafHashes: string[] =
        extractedRailgunTransactionData.map(({ railgunTxid, utxoTreeIn }) =>
          getRailgunTxidLeafHash(
            hexToBigInt(railgunTxid),
            utxoTreeIn,
            getGlobalTreePositionPreTransactionPOIProof(),
            txidVersion,
          ),
        );

      const activeListKeys = POI.getActiveListKeys();

      for (const activeListKey of activeListKeys) {
        // 1. Validate all active lists are present
        if (!isDefined(pois[activeListKey])) {
          throw new Error(`Missing POIs for list: ${activeListKey}`);
        }

        const poisForList = pois[activeListKey];

        for (const txidLeafHash of expectedTxidLeafHashes) {
          // 2. Validate txid leaf hash
          if (!isDefined(poisForList[txidLeafHash])) {
            throw new Error(
              `Missing POI for txidLeafHash ${txidLeafHash} for list ${activeListKey}`,
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
            activeListKey,
            poiMerkleroots,
          );
          if (!validPOIMerkleroots) {
            throw new Error(`Invalid POI merkleroots: list ${activeListKey}`);
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
          const validProof = await POIProof.verifyTransactProof(
            transactProofData,
          );
          if (!validProof) {
            throw new Error(`Invalid POI snark proof: list ${activeListKey}`);
          }
        }
      }

      return { isValid: true };
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
}
