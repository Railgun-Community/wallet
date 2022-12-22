import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { sanitizeError } from '@railgun-community/shared-models';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('error', () => {
  it('Should sanitize connection errors', () => {
    const expectedErrorMessage = 'Could not connect.';

    expect(sanitizeError(new Error('Could not meet quorum')).message).to.equal(
      expectedErrorMessage,
    );
    expect(sanitizeError(new Error('could not connect to')).message).to.equal(
      expectedErrorMessage,
    );
  });

  it('Should sanitize bad token errors', () => {
    const expectedErrorMessage = 'Failed to connect to RPC.';

    expect(
      sanitizeError(new Error('call revert exception 12345')).message,
    ).to.equal(expectedErrorMessage);
  });

  it('Should sanitize bad address errors', () => {
    const expectedErrorMessage = 'RPC connection error.';

    expect(sanitizeError(new Error('missing revert data')).message).to.equal(
      expectedErrorMessage,
    );
  });

  it('Should sanitize gas estimate errors', () => {
    const expectedErrorMessage = 'Unknown error. Transaction failed.';

    expect(
      sanitizeError(
        new Error('transaction may fail or may require manual gas limit'),
      ).message,
    ).to.equal(expectedErrorMessage);
  });

  it('Should sanitize bad address errors', () => {
    const expectedErrorMessage =
      'Nonce is used in a pending transaction, and replacement fee is too low. Please increase your network fee to replace the pending transaction.';

    expect(
      sanitizeError(new Error('replacement fee too low')).message,
    ).to.equal(expectedErrorMessage);
  });
});
