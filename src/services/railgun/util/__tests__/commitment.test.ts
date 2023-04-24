import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { convertTransactionStructToCommitmentSummary } from '../commitment';
import { TransactionStruct } from '@railgun-community/engine';
import {
  MOCK_BOUND_PARAMS,
  MOCK_COMMITMENT_HASH,
  MOCK_FORMATTED_RELAYER_FEE_COMMITMENT_CIPHERTEXT,
} from '../../../../tests/mocks.test';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('commitment', () => {
  it('Should convert transaction struct into commitment summary', () => {
    const transactionStruct = {
      boundParams: MOCK_BOUND_PARAMS,
      commitments: [MOCK_COMMITMENT_HASH],
    } as TransactionStruct;

    const firstCommitmentIndex = 0;
    const firstCommitmentSummary = convertTransactionStructToCommitmentSummary(
      transactionStruct,
      firstCommitmentIndex,
    );

    expect(firstCommitmentSummary.commitmentCiphertext).to.deep.equal(
      MOCK_FORMATTED_RELAYER_FEE_COMMITMENT_CIPHERTEXT,
    );
    expect(firstCommitmentSummary.commitmentHash).equal(
      '0x2b13bccd4974c797df42a89221ed6e19e50c32055058cdcc5a8ea836233e4cab',
    );
  });
});
