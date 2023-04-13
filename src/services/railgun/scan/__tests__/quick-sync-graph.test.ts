import { Chain, CommitmentEvent } from '@railgun-community/engine';
import { NetworkName, NETWORK_CONFIG } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { quickSyncGraph } from '../quick-sync-graph';

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

describe('quick-sync-graph-protocol', () => {
  it.only(
    'Should make sure Graph Protocol has no data gaps in commitments - Ethereum',
    async () => {
      // const eventLog = await quickSyncGraph(ETH_CHAIN, 0);
      const eventLog = await quickSyncGraph(ETH_CHAIN, 14858124);
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

      console.log(eventLog.commitmentEvents.slice(0, 5));

      const shouldThrow = true;
      assertContiguousCommitmentEvents(eventLog.commitmentEvents, shouldThrow);
    },
  ).timeout(20000);

  it('Should make sure Graph Protocol has no data gaps in commitments - Polygon', async () => {
    const eventLog = await quickSyncGraph(POLYGON_CHAIN, 0);
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

  it('Should make sure Graph Protocol has no data gaps in commitments - BNB Smart Chain', async () => {
    const eventLog = await quickSyncGraph(BNB_CHAIN, 0);
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

  it('Should make sure Graph Protocol has no data gaps in commitments - Polygon Mumbai', async () => {
    const eventLog = await quickSyncGraph(POLYGON_MUMBAI_CHAIN, 0);
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

  it('Should make sure Graph Protocol has no data gaps in commitments - Arbitrum', async () => {
    const eventLog = await quickSyncGraph(ARBITRUM_CHAIN, 0);
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

  it('Should make sure Graph Protocol has no data gaps in commitments - Goerli', async () => {
    const eventLog = await quickSyncGraph(GOERLI_CHAIN, 0);
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

  it('Should make sure Graph Protocol has no data gaps in commitments - Arbitrum Goerli', async () => {
    const eventLog = await quickSyncGraph(ARBITRUM_GOERLI_CHAIN, 0);
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

  it('Should run live Railgun Event Log fetch for Polygon with starting block', async () => {
    const eventLog = await quickSyncGraph(POLYGON_CHAIN, 30000000);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.nullifierEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(1300);
    expect(eventLog.nullifierEvents.length).to.be.at.least(1400);
    expect(eventLog.unshieldEvents.length).to.be.at.least(1);
  }).timeout(20000);

  it('Should run live Railgun Event Log fetch for Polygon with high starting block', async () => {
    const eventLog = await quickSyncGraph(POLYGON_CHAIN, 100000000);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.nullifierEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.equal(0);
    expect(eventLog.nullifierEvents.length).to.equal(0);
    expect(eventLog.unshieldEvents.length).to.equal(0);
  }).timeout(20000);
});
