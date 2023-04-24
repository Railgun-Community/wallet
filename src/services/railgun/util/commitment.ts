import {
  TransactionStruct,
  formatCommitmentCiphertext,
} from '@railgun-community/engine';
import { CommitmentCiphertextStructOutput } from '@railgun-community/engine/dist/typechain-types/contracts/logic/RailgunSmartWallet';
import {
  CommitmentCiphertext,
  CommitmentSummary,
} from '@railgun-community/shared-models';

export const convertTransactionStructToCommitmentSummary = (
  transactionStruct: TransactionStruct,
  commitmentIndex: number,
): CommitmentSummary => {
  const commitmentCiphertextStruct = transactionStruct.boundParams
    .commitmentCiphertext[commitmentIndex] as CommitmentCiphertextStructOutput;

  const commitmentCiphertext: CommitmentCiphertext = formatCommitmentCiphertext(
    commitmentCiphertextStruct,
  );
  const commitmentHash = transactionStruct.commitments[
    commitmentIndex
  ] as string;

  return {
    commitmentCiphertext,
    commitmentHash,
  };
};
