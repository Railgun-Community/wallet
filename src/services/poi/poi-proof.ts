import { TransactProofData } from '@railgun-community/shared-models';
import { sendErrorMessage } from '../../utils';
import { RailgunEngine } from '@railgun-community/engine';

export class POIProof {
  // Prevents a circular dependency
  private static engine: Optional<RailgunEngine>;

  static init(engine: RailgunEngine) {
    this.engine = engine;
  }

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
    if (!this.engine) {
      throw new Error('No RAILGUN engine found');
    }
    const prover = this.engine.prover;
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
      if (!this.engine) {
        throw new Error('No RAILGUN engine found');
      }
      const prover = this.engine.prover;
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
