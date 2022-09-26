import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { sanitizeError } from '@railgun-community/shared-models/dist/utils/error';

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
    const expectedErrorMessage = 'Possible bad token address.';

    expect(
      sanitizeError(new Error('call revert exception 12345')).message,
    ).to.equal(expectedErrorMessage);
  });

  it('Should sanitize bad address errors', () => {
    const expectedErrorMessage = 'Possible bad address.';

    expect(sanitizeError(new Error('missing revert data')).message).to.equal(
      expectedErrorMessage,
    );
  });

  it('Should sanitize gas estimate errors', () => {
    const expectedErrorMessage =
      'Something went wrong. Please make sure you have a valid balance for this transaction.';

    expect(
      sanitizeError(
        new Error('transaction may fail or may require manual gas limit'),
      ).message,
    ).to.equal(expectedErrorMessage);
  });

  it('Should sanitize bad address errors', () => {
    const expectedErrorMessage =
      'Cancellation fee too low. Please increase your network fee to replace the current pending transaction.';

    expect(
      sanitizeError(new Error('replacement fee too low')).message,
    ).to.equal(expectedErrorMessage);
  });
});
