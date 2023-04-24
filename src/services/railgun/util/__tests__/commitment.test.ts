import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { convertTransactionStructToCommitmentSummary } from '../commitment';
import { TransactionStruct } from '@railgun-community/engine';
import {
  MOCK_BOUND_PARAMS,
  MOCK_FORMATTED_RELAYER_FEE_COMMITMENT_CIPHERTEXT,
} from '../../../../tests/mocks.test';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Utils/Commitment', () => {
  it('Should convert transaction struct into commitment summary', () => {
    const transactionStruct = {
      commitments: [
        '0x10f1c4ac23f7d0b0e0a6ba3fa23efaf736a44d3e92f6dd37b5d2044cb5c081dd',
      ],
      boundParams: MOCK_BOUND_PARAMS,
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
      '0x10f1c4ac23f7d0b0e0a6ba3fa23efaf736a44d3e92f6dd37b5d2044cb5c081dd',
    );
  });
});
