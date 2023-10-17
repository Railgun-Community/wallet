/* eslint-disable no-await-in-loop */
import {
  Chain,
  SnarkProof,
  TXIDVersion,
  TransactProofData,
} from '@railgun-community/shared-models';
import { POIProof } from './poi-proof';
import { POI, createDummyMerkleProof } from '@railgun-community/engine';

export type POIMerklerootsValidator = (
  txidVersion: TXIDVersion,
  chain: Chain,
  listKey: string,
  poiMerkleroots: string[],
) => Promise<boolean>;

type POIForList = {
  listKey: string;
  snarkProof: SnarkProof;
  poiMerkleroots: string[];
  blindedCommitmentsOut: string[];
  railgunTxidIfHasUnshield: string;
};

export class POIValidation {
  private static validatePOIMerkleroots: Optional<POIMerklerootsValidator>;

  static init(validatePOIMerkleroots: POIMerklerootsValidator) {
    this.validatePOIMerkleroots = validatePOIMerkleroots;
  }

  static async isValidSpendableTXID(
    txidVersion: TXIDVersion,
    chain: Chain,
    txidLeafHash: string,
    txidMerkleroot: string,
    pois: POIForList[],
  ): Promise<boolean> {
    try {
      if (!this.validatePOIMerkleroots) {
        throw new Error('No POI merkleroot validator found');
      }

      // 1. Validate txidLeafHash for transaction
      const expectedTxidLeafHash = '0xTODO';
      if (expectedTxidLeafHash !== txidLeafHash) {
        throw new Error('Invalid txid leaf hash');
      }

      // 2. Validate txidDummyMerkleProof and txid root
      const dummyMerkleProof = createDummyMerkleProof(txidLeafHash);
      if (dummyMerkleProof.root !== txidMerkleroot) {
        throw new Error('Invalid txid merkle proof');
      }

      // 3. Validate listKeys
      const listKeys = pois.map(poi => poi.listKey);
      const activeListKeys = POI.getActiveListKeys();
      activeListKeys.forEach(activeListKey => {
        if (!listKeys.includes(activeListKey)) {
          throw new Error(`Missing POI for list: ${activeListKey}`);
        }
      });

      for (const poi of pois) {
        const {
          listKey,
          snarkProof,
          poiMerkleroots,
          blindedCommitmentsOut,
          railgunTxidIfHasUnshield,
        } = poi;

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
        const validProof = await POIProof.verifyTransactProof(
          transactProofData,
        );
        if (!validProof) {
          throw new Error(`Invalid POI snark proof: list ${listKey}`);
        }
      }

      return true;
    } catch (err) {
      if (!(err instanceof Error)) {
        throw err;
      }
      throw new Error(`Could not validate spendable TXID: ${err.message}`);
    }
  }
}
