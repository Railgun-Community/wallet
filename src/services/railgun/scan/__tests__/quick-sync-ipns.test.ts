import { Chain, ChainType, CommitmentEvent } from '@railgun-community/engine';
import axios from 'axios';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { quickSyncIPNS } from '../quick-sync-ipns';
import { QuickSyncPageSize } from '../railgun-events-ipns';

chai.use(chaiAsPromised);
const { expect } = chai;

const POLYGON_CHAIN: Chain = { type: ChainType.EVM, id: 137 };

const EXPECTED_COMMITMENT_EVENTS = 2500;
const EXPECTED_NULLIFIER_EVENTS = 2600;

describe('quick-sync-ipns', () => {
  it('Should make sure IPNS Event Log has no data gaps in commitments', async () => {
    const eventLog = await quickSyncIPNS(POLYGON_CHAIN, 0);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(
      EXPECTED_COMMITMENT_EVENTS,
    );
    expect(eventLog.nullifierEvents.length).to.be.at.least(
      EXPECTED_NULLIFIER_EVENTS,
    );

    let nextTreeNumber = eventLog.commitmentEvents[0].treeNumber;
    let nextStartPosition = eventLog.commitmentEvents[0].startPosition;
    eventLog.commitmentEvents.forEach(event => {
      if (
        event.treeNumber !== nextTreeNumber &&
        event.startPosition !== nextStartPosition
      ) {
        throw new Error(
          `Could not find treeNumber ${nextTreeNumber}, startPosition ${nextStartPosition}`,
        );
      }
      nextStartPosition += event.commitments.length;
      if (nextStartPosition >= 65536) {
        // Roll over to next tree.
        nextTreeNumber += 1;
        nextStartPosition = 0;
      }
    });
  }).timeout(90000);

  it('Should run Railgun Event Log fetch on Polygon for corrupted block', async () => {
    const eventLog = await quickSyncIPNS(
      POLYGON_CHAIN,
      34833640,
      QuickSyncPageSize.Small,
    );
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.nullifierEvents).to.be.an('array');
    expect(eventLog.commitmentEvents[0].txid).to.equal(
      '93585e4ea3def1bb2e2a1d4da8ac7a74ca547f6cda72803151beb68d995aa53f',
    );
    expect(eventLog.commitmentEvents[1].txid).to.equal(
      '93585e4ea3def1bb2e2a1d4da8ac7a74ca547f6cda72803151beb68d995aa53f',
    );
    expect(eventLog.commitmentEvents[1].commitments[0]).to.deep.equal({
      blockNumber: 34833642,
      hash: '006b04380e0ff9c99bc0eecc09fe4dc2ed2e420ef60a27016c48de7d2821e1a9',
      txid: '0x93585e4ea3def1bb2e2a1d4da8ac7a74ca547f6cda72803151beb68d995aa53f',
      preImage: {
        npk: '244926644d24923cd5ec7a753001354a2d4201e0ee83c40ebe2dd1474314337d',
        token: {
          tokenAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
          tokenType: '0x0000000000000000000000000000000000000000',
          tokenSubID: '0x0000000000000000000000000000000000000000',
        },
        value: '00000000000000018231e1f8645ce6fc',
      },
      encryptedRandom: [
        '9e275292abf714516bb92dca5c34ccfe0db37ad142b56d0eaa8d0069f3dbfe4a',
        'f17d5b705d928de4a2fec6e9f3aa14ad',
      ],
    });
  }).timeout(90000);

  it('Should run live Railgun Event Log fetch for Polygon from block 0 - Small', async () => {
    const eventLog = await quickSyncIPNS(
      POLYGON_CHAIN,
      0,
      QuickSyncPageSize.Small,
    );
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
    const eventLog = await quickSyncIPNS(
      POLYGON_CHAIN,
      0,
      QuickSyncPageSize.Medium,
    );
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
    const eventLog = await quickSyncIPNS(
      POLYGON_CHAIN,
      0,
      QuickSyncPageSize.Large,
    );
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
    const eventLog = await quickSyncIPNS(
      POLYGON_CHAIN,
      0,
      QuickSyncPageSize.XLarge,
    );
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
