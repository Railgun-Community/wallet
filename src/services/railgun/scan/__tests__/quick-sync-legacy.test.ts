import {
  Chain,
  ChainType,
} from '@railgun-community/engine/dist/models/engine-types';
import axios from 'axios';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon, { SinonStub } from 'sinon';
import {
  quickSyncLegacy,
  quickSyncURLForEVMChain,
} from '../legacy/quick-sync-legacy';

chai.use(chaiAsPromised);
const { expect } = chai;

const POLYGON_CHAIN: Chain = { type: ChainType.EVM, id: 137 };

describe('quick-sync-legacy', () => {
  it('Should get ropsten quick sync URL', async () => {
    expect(quickSyncURLForEVMChain({ type: ChainType.EVM, id: 3 })).to.equal(
      'https://events.railgun.org/chain/3',
    );
    expect(quickSyncURLForEVMChain({ type: ChainType.EVM, id: 6 })).to.equal(
      undefined,
    );
  });

  it('Should run live Railgun Event Log fetch for Polygon', async () => {
    const eventLog = await quickSyncLegacy(POLYGON_CHAIN, 0);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.nullifierEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(10);
    expect(eventLog.nullifierEvents.length).to.be.at.least(2);
  }).timeout(10000);

  it('Should retry Railgun Event Log API fetch on error', async () => {
    const stubAxiosGet = sinon.stub(axios, 'get').throws();
    await expect(quickSyncLegacy(POLYGON_CHAIN, 0)).to.be.rejected;
    expect(stubAxiosGet.callCount).to.equal(3);
    stubAxiosGet.restore();
  });

  it('Should error if invalid type', async () => {
    let stubAxiosGet: SinonStub;
    stubAxiosGet = sinon.stub(axios, 'get').resolves({ data: null });
    await expect(quickSyncLegacy(POLYGON_CHAIN, 0)).to.be.rejectedWith(
      'Expected object `eventLog` response.',
    );
    stubAxiosGet.restore();

    stubAxiosGet = sinon
      .stub(axios, 'get')
      .resolves({ data: { nullifierEvents: [] } });
    await expect(quickSyncLegacy(POLYGON_CHAIN, 0)).to.be.rejectedWith(
      'Expected object `commitmentEvents` response.',
    );
    stubAxiosGet.restore();

    stubAxiosGet = sinon
      .stub(axios, 'get')
      .resolves({ data: { commitmentEvents: [] } });
    await expect(quickSyncLegacy(POLYGON_CHAIN, 0)).to.be.rejectedWith(
      'Expected object `nullifierEvents` response.',
    );
    stubAxiosGet.restore();
  });
});
