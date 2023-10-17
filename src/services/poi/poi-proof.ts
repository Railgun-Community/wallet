import { TransactProofData } from '@railgun-community/shared-models';
import { sendErrorMessage } from '../../utils';
import { getEngine } from '../railgun/core/engine';

export class POIProof {
  static verifyTransactProof = async (
    transactProofData: TransactProofData,
  ): Promise<boolean> => {
    // Mini
    if (await this.tryVerifyProof(transactProofData, 3, 3)) {
      return true;
    }
    // Full
    return this.tryVerifyProof(transactProofData, 13, 13);
  };

  private static getPublicInputsPOI = (
    transactProofData: TransactProofData,
    maxInputs: number,
    maxOutputs: number,
  ) => {
    const prover = getEngine().prover;
    return prover.getPublicInputsPOI(
      transactProofData.txidMerkleroot,
      transactProofData.blindedCommitmentsOut,
      transactProofData.poiMerkleroots,
      transactProofData.railgunTxidIfHasUnshield,
      maxInputs,
      maxOutputs,
    );
  };

  private static tryVerifyProof = async (
    transactProofData: TransactProofData,
    maxInputs: number,
    maxOutputs: number,
  ) => {
    try {
      const prover = getEngine().prover;
      const publicInputs = this.getPublicInputsPOI(
        transactProofData,
        maxInputs,
        maxOutputs,
      );
      return await prover.verifyPOIProof(
        publicInputs,
        transactProofData.snarkProof,
        maxInputs,
        maxOutputs,
      );
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      sendErrorMessage(err);
      return false;
    }
  };
}
