import { Chain, ChainType } from '@railgun-community/engine';
import axios from 'axios';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { quickSyncIPNS } from '../quick-sync-ipns';

chai.use(chaiAsPromised);
const { expect } = chai;

const POLYGON_CHAIN: Chain = { type: ChainType.EVM, id: 137 };

const EXPECTED_COMMITMENT_EVENTS = 2500;
const EXPECTED_NULLIFIER_EVENTS = 2600;

describe('quick-sync-ipns', () => {
  it('Should run live Railgun Event Log fetch for Polygon from block 0 - Small', async () => {
    const eventLog = await quickSyncIPNS(POLYGON_CHAIN, 0);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.nullifierEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(
      EXPECTED_COMMITMENT_EVENTS,
    );
    expect(eventLog.nullifierEvents.length).to.be.at.least(
      EXPECTED_NULLIFIER_EVENTS,
    );
  }).timeout(90000);

  it('Should run live Railgun Event Log fetch for Polygon from block 0 - Medium', async () => {
    const eventLog = await quickSyncIPNS(POLYGON_CHAIN, 0);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.nullifierEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(
      EXPECTED_COMMITMENT_EVENTS,
    );
    expect(eventLog.nullifierEvents.length).to.be.at.least(
      EXPECTED_NULLIFIER_EVENTS,
    );
  }).timeout(90000);

  it('Should run live Railgun Event Log fetch for Polygon from block 0 - Large', async () => {
    const eventLog = await quickSyncIPNS(POLYGON_CHAIN, 0);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.nullifierEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(
      EXPECTED_COMMITMENT_EVENTS,
    );
    expect(eventLog.nullifierEvents.length).to.be.at.least(
      EXPECTED_NULLIFIER_EVENTS,
    );
  }).timeout(90000);

  it('Should run live Railgun Event Log fetch for Polygon from block 0 - XLarge', async () => {
    const eventLog = await quickSyncIPNS(POLYGON_CHAIN, 0);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.nullifierEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(
      EXPECTED_COMMITMENT_EVENTS,
    );
    expect(eventLog.nullifierEvents.length).to.be.at.least(
      EXPECTED_NULLIFIER_EVENTS,
    );
  }).timeout(90000);

  it('Should run live Railgun Event Log fetch for Polygon with starting block', async () => {
    const eventLog = await quickSyncIPNS(POLYGON_CHAIN, 30000000);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.nullifierEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(1300);
    expect(eventLog.nullifierEvents.length).to.be.at.least(1400);
  }).timeout(90000);

  it('Should run live Railgun Event Log fetch for Polygon with high starting block', async () => {
    const eventLog = await quickSyncIPNS(POLYGON_CHAIN, 100000000);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.nullifierEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.equal(0);
    expect(eventLog.nullifierEvents.length).to.equal(0);
  }).timeout(90000);

  it('Should retry Railgun Event Log API fetch on error', async () => {
    const stubAxiosGet = sinon.stub(axios, 'get').throws();
    await expect(quickSyncIPNS(POLYGON_CHAIN, 0)).to.be.rejected;
    expect(stubAxiosGet.callCount).to.equal(9);
    stubAxiosGet.restore();
  });
});
