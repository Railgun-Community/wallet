import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon from 'sinon';
import { sendErrorMessage, sendMessage, setLoggerFuncs } from '../logger';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('logger', () => {
  after(() => {
    setLoggerFuncs(undefined, undefined);
  });

  it('Should test out logger setters', () => {
    const messageSpy = Sinon.spy();
    const errorSpy = Sinon.spy();
    setLoggerFuncs(messageSpy, errorSpy);

    expect(messageSpy.notCalled).to.be.true;
    expect(errorSpy.notCalled).to.be.true;

    sendMessage('sup');
    expect(messageSpy.calledOnce).to.be.true;
    sendErrorMessage('err');
    expect(errorSpy.calledOnce).to.be.true;
  });
});
