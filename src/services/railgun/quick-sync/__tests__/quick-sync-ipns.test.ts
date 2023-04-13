import { Chain, CommitmentEvent } from '@railgun-community/engine';
import { NetworkName, NETWORK_CONFIG } from '@railgun-community/shared-models';
import axios from 'axios';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { quickSyncIPNS } from '../quick-sync-ipns';
import { QuickSyncPageSize } from '../railgun-events-ipns';

chai.use(chaiAsPromised);
const { expect } = chai;

const ETH_CHAIN: Chain = NETWORK_CONFIG[NetworkName.Ethereum].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_ETH = 4400;
const EXPECTED_NULLIFIER_EVENTS_ETH = 3000;
const EXPECTED_UNSHIELD_EVENTS_ETH = 1;

const POLYGON_CHAIN: Chain = NETWORK_CONFIG[NetworkName.Polygon].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_POLYGON = 5290;
const EXPECTED_NULLIFIER_EVENTS_POLYGON = 4000;
const EXPECTED_UNSHIELD_EVENTS_POLYGON = 1;

const BNB_CHAIN: Chain = NETWORK_CONFIG[NetworkName.BNBChain].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_BNB = 1850;
const EXPECTED_NULLIFIER_EVENTS_BNB = 1200;
const EXPECTED_UNSHIELD_EVENTS_BNB = 1;

const POLYGON_MUMBAI_CHAIN: Chain =
  NETWORK_CONFIG[NetworkName.PolygonMumbai].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_POLYGON_MUMBAI = 1000;
const EXPECTED_NULLIFIER_EVENTS_POLYGON_MUMBAI = 100;
const EXPECTED_UNSHIELD_EVENTS_POLYGON_MUMBAI = 1;

const ARBITRUM_CHAIN: Chain = NETWORK_CONFIG[NetworkName.Arbitrum].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_ARBITRUM = 150;
const EXPECTED_NULLIFIER_EVENTS_ARBITRUM = 40;
const EXPECTED_UNSHIELD_EVENTS_ARBITRUM = 1;

const GOERLI_CHAIN: Chain = NETWORK_CONFIG[NetworkName.EthereumGoerli].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_GOERLI = 80;
const EXPECTED_NULLIFIER_EVENTS_GOERLI = 40;
const EXPECTED_UNSHIELD_EVENTS_GOERLI = 1;

const ARBITRUM_GOERLI_CHAIN: Chain =
  NETWORK_CONFIG[NetworkName.ArbitrumGoerli].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_ARBITRUM_GOERLI = 80;
const EXPECTED_NULLIFIER_EVENTS_ARBITRUM_GOERLI = 40;
const EXPECTED_UNSHIELD_EVENTS_ARBITRUM_GOERLI = 1;

const assertContiguousCommitmentEvents = (
  commitmentEvents: CommitmentEvent[],
  shouldThrow: boolean,
) => {
  let nextTreeNumber = commitmentEvents[0].treeNumber;
  let nextStartPosition = commitmentEvents[0].startPosition;
  for (const event of commitmentEvents) {
    if (
      event.treeNumber !== nextTreeNumber ||
      event.startPosition !== nextStartPosition
    ) {
      if (shouldThrow) {
        throw new Error(
          `Could not find treeNumber ${nextTreeNumber}, startPosition ${nextStartPosition}`,
        );
      } else {
        // eslint-disable-next-line no-console
        console.log(
          `Could not find treeNumber ${nextTreeNumber}, startPosition ${nextStartPosition}`,
        );
        nextStartPosition = event.startPosition + event.commitments.length;
      }
    } else {
      nextStartPosition += event.commitments.length;
    }

    if (nextStartPosition >= 65536) {
      // Roll over to next tree.
      nextTreeNumber += 1;
      nextStartPosition = 0;
    }
  }
};

describe('quick-sync-ipns', () => {
  it('Should make sure IPNS Event Log has no data gaps in commitments - Ethereum', async () => {
    const eventLog = await quickSyncIPNS(ETH_CHAIN, 0);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(
      EXPECTED_COMMITMENT_GROUP_EVENTS_ETH,
    );
    expect(eventLog.nullifierEvents.length).to.be.at.least(
      EXPECTED_NULLIFIER_EVENTS_ETH,
    );
    expect(eventLog.unshieldEvents.length).to.be.at.least(
      EXPECTED_UNSHIELD_EVENTS_ETH,
    );

    const shouldThrow = true;
    assertContiguousCommitmentEvents(eventLog.commitmentEvents, shouldThrow);
  }).timeout(20000);

  it('Should make sure IPNS Event Log has no data gaps in commitments - Polygon', async () => {
    const eventLog = await quickSyncIPNS(POLYGON_CHAIN, 0);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(
      EXPECTED_COMMITMENT_GROUP_EVENTS_POLYGON,
    );
    expect(eventLog.nullifierEvents.length).to.be.at.least(
      EXPECTED_NULLIFIER_EVENTS_POLYGON,
    );
    expect(eventLog.unshieldEvents.length).to.be.at.least(
      EXPECTED_UNSHIELD_EVENTS_POLYGON,
    );
    expect(eventLog.unshieldEvents.length).to.be.at.least(
      EXPECTED_UNSHIELD_EVENTS_POLYGON,
    );

    const shouldThrow = true;
    assertContiguousCommitmentEvents(eventLog.commitmentEvents, shouldThrow);
  }).timeout(20000);

  it('Should make sure IPNS Event Log has no data gaps in commitments - BNB Smart Chain', async () => {
    const eventLog = await quickSyncIPNS(BNB_CHAIN, 0);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(
      EXPECTED_COMMITMENT_GROUP_EVENTS_BNB,
    );
    expect(eventLog.nullifierEvents.length).to.be.at.least(
      EXPECTED_NULLIFIER_EVENTS_BNB,
    );
    expect(eventLog.unshieldEvents.length).to.be.at.least(
      EXPECTED_UNSHIELD_EVENTS_BNB,
    );

    const shouldThrow = true;
    assertContiguousCommitmentEvents(eventLog.commitmentEvents, shouldThrow);
  }).timeout(20000);

  it('Should make sure IPNS Event Log has no data gaps in commitments - Polygon Mumbai', async () => {
    const eventLog = await quickSyncIPNS(POLYGON_MUMBAI_CHAIN, 0);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(
      EXPECTED_COMMITMENT_GROUP_EVENTS_POLYGON_MUMBAI,
    );
    expect(eventLog.nullifierEvents.length).to.be.at.least(
      EXPECTED_NULLIFIER_EVENTS_POLYGON_MUMBAI,
    );
    expect(eventLog.unshieldEvents.length).to.be.at.least(
      EXPECTED_UNSHIELD_EVENTS_POLYGON_MUMBAI,
    );

    const shouldThrow = true;
    assertContiguousCommitmentEvents(eventLog.commitmentEvents, shouldThrow);
  }).timeout(20000);

  it('Should make sure IPNS Event Log has no data gaps in commitments - Arbitrum', async () => {
    const eventLog = await quickSyncIPNS(ARBITRUM_CHAIN, 0);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(
      EXPECTED_COMMITMENT_GROUP_EVENTS_ARBITRUM,
    );
    expect(eventLog.nullifierEvents.length).to.be.at.least(
      EXPECTED_NULLIFIER_EVENTS_ARBITRUM,
    );
    expect(eventLog.unshieldEvents.length).to.be.at.least(
      EXPECTED_UNSHIELD_EVENTS_ARBITRUM,
    );

    const shouldThrow = true;
    assertContiguousCommitmentEvents(eventLog.commitmentEvents, shouldThrow);
  }).timeout(20000);

  it('Should make sure IPNS Event Log has no data gaps in commitments - Goerli', async () => {
    const eventLog = await quickSyncIPNS(GOERLI_CHAIN, 0);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(
      EXPECTED_COMMITMENT_GROUP_EVENTS_GOERLI,
    );
    expect(eventLog.nullifierEvents.length).to.be.at.least(
      EXPECTED_NULLIFIER_EVENTS_GOERLI,
    );
    expect(eventLog.unshieldEvents.length).to.be.at.least(
      EXPECTED_UNSHIELD_EVENTS_GOERLI,
    );

    const shouldThrow = true;
    assertContiguousCommitmentEvents(eventLog.commitmentEvents, shouldThrow);
  }).timeout(20000);

  it('Should make sure IPNS Event Log has no data gaps in commitments - Arbitrum Goerli', async () => {
    const eventLog = await quickSyncIPNS(ARBITRUM_GOERLI_CHAIN, 0);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(
      EXPECTED_COMMITMENT_GROUP_EVENTS_ARBITRUM_GOERLI,
    );
    expect(eventLog.nullifierEvents.length).to.be.at.least(
      EXPECTED_NULLIFIER_EVENTS_ARBITRUM_GOERLI,
    );
    expect(eventLog.unshieldEvents.length).to.be.at.least(
      EXPECTED_UNSHIELD_EVENTS_ARBITRUM_GOERLI,
    );

    const shouldThrow = true;
    assertContiguousCommitmentEvents(eventLog.commitmentEvents, shouldThrow);
  }).timeout(20000);

  // Skipped because block seems to be too old to query.
  // Keep code around for posterity - it WILL be used again.
  it.skip(
    'Should run Railgun Event Log fetch on Polygon for corrupted block',
    async () => {
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
    },
  ).timeout(20000);

  it('Should run live Railgun Event Log fetch for Polygon from block 0 - Large size', async () => {
    const eventLog = await quickSyncIPNS(
      POLYGON_CHAIN,
      0,
      QuickSyncPageSize.Large,
    );
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.nullifierEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(
      EXPECTED_COMMITMENT_GROUP_EVENTS_POLYGON,
    );
    expect(eventLog.nullifierEvents.length).to.be.at.least(
      EXPECTED_NULLIFIER_EVENTS_POLYGON,
    );
    expect(eventLog.unshieldEvents.length).to.be.at.least(
      EXPECTED_UNSHIELD_EVENTS_POLYGON,
    );
  }).timeout(20000);

  it('Should run live Railgun Event Log fetch for Polygon with starting block', async () => {
    const eventLog = await quickSyncIPNS(POLYGON_CHAIN, 30000000);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.nullifierEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(1300);
    expect(eventLog.nullifierEvents.length).to.be.at.least(1400);
    expect(eventLog.unshieldEvents.length).to.be.at.least(1);
  }).timeout(20000);

  it('Should run live Railgun Event Log fetch for Polygon with high starting block', async () => {
    const eventLog = await quickSyncIPNS(POLYGON_CHAIN, 100000000);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.nullifierEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.equal(0);
    expect(eventLog.nullifierEvents.length).to.equal(0);
    expect(eventLog.unshieldEvents.length).to.equal(0);
  }).timeout(20000);

  it('Should retry Railgun Event Log API fetch on error', async () => {
    const stubAxiosGet = sinon.stub(axios, 'get').throws();
    await expect(quickSyncIPNS(POLYGON_CHAIN, 0)).to.be.rejected;
    expect(stubAxiosGet.callCount).to.equal(6);
    stubAxiosGet.restore();
  });
});
