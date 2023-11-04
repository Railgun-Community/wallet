import { Chain, CommitmentEvent } from '@railgun-community/engine';
import { NetworkName, NETWORK_CONFIG } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { getTestTXIDVersion, isV2Test } from '../../../../tests/helper.test';
import { quickSyncEventsGraph } from '../quick-sync-events';

chai.use(chaiAsPromised);
const { expect } = chai;

const txidVersion = getTestTXIDVersion();

// TODO-V3: When graph is ready on V3, we should change the "0s" below to match the appropriate number of events.

const ETH_CHAIN: Chain = NETWORK_CONFIG[NetworkName.Ethereum].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_ETH = isV2Test() ? 4400 : 0;
const EXPECTED_NULLIFIER_EVENTS_ETH = isV2Test() ? 3000 : 0;
const EXPECTED_UNSHIELD_EVENTS_ETH = isV2Test() ? 1 : 0;

const POLYGON_CHAIN: Chain = NETWORK_CONFIG[NetworkName.Polygon].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_POLYGON = isV2Test() ? 5290 : 0;
const EXPECTED_NULLIFIER_EVENTS_POLYGON = isV2Test() ? 4000 : 0;
const EXPECTED_UNSHIELD_EVENTS_POLYGON = isV2Test() ? 1 : 0;

const BNB_CHAIN: Chain = NETWORK_CONFIG[NetworkName.BNBChain].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_BNB = isV2Test() ? 1850 : 0;
const EXPECTED_NULLIFIER_EVENTS_BNB = isV2Test() ? 1200 : 0;
const EXPECTED_UNSHIELD_EVENTS_BNB = isV2Test() ? 1 : 0;

const POLYGON_MUMBAI_CHAIN: Chain =
  NETWORK_CONFIG[NetworkName.PolygonMumbai].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_POLYGON_MUMBAI = isV2Test() ? 1000 : 0;
const EXPECTED_NULLIFIER_EVENTS_POLYGON_MUMBAI = isV2Test() ? 100 : 0;
const EXPECTED_UNSHIELD_EVENTS_POLYGON_MUMBAI = isV2Test() ? 1 : 0;

const ARBITRUM_CHAIN: Chain = NETWORK_CONFIG[NetworkName.Arbitrum].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_ARBITRUM = isV2Test() ? 150 : 0;
const EXPECTED_NULLIFIER_EVENTS_ARBITRUM = isV2Test() ? 40 : 0;
const EXPECTED_UNSHIELD_EVENTS_ARBITRUM = isV2Test() ? 1 : 0;

const GOERLI_CHAIN: Chain = NETWORK_CONFIG[NetworkName.EthereumGoerli].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_GOERLI = isV2Test() ? 80 : 0;
const EXPECTED_NULLIFIER_EVENTS_GOERLI = isV2Test() ? 40 : 0;
const EXPECTED_UNSHIELD_EVENTS_GOERLI = isV2Test() ? 1 : 0;

const SEPOLIA_CHAIN: Chain = NETWORK_CONFIG[NetworkName.EthereumSepolia].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_SEPOLIA = isV2Test() ? 0 : 0; // TODO: Add some here
const EXPECTED_NULLIFIER_EVENTS_SEPOLIA = isV2Test() ? 0 : 0; // TODO: Add some here
const EXPECTED_UNSHIELD_EVENTS_SEPOLIA = isV2Test() ? 0 : 0; // TODO: Add some here

const ARBITRUM_GOERLI_CHAIN: Chain =
  NETWORK_CONFIG[NetworkName.ArbitrumGoerli].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_ARBITRUM_GOERLI = isV2Test() ? 80 : 0;
const EXPECTED_NULLIFIER_EVENTS_ARBITRUM_GOERLI = isV2Test() ? 40 : 0;
const EXPECTED_UNSHIELD_EVENTS_ARBITRUM_GOERLI = isV2Test() ? 1 : 0;

const assertContiguousCommitmentEvents = (
  commitmentEvents: CommitmentEvent[],
  shouldThrow: boolean,
) => {
  if (!isV2Test()) {
    // TODO-V3: Remove this when V3 is ready.
    return;
  }
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

    // TODO: This logic may need an update if the tree is less than 65536 commitments.
    if (nextStartPosition >= 65536) {
      // Roll over to next tree.
      nextTreeNumber += 1;
      nextStartPosition = 0;
    }
  }
};

describe('quick-sync-events-graph', () => {
  it('Should make sure Graph query has no data gaps in commitments - Ethereum', async () => {
    // const eventLog = await quickSyncEventsGraph(txidVersion, ETH_CHAIN, 0);
    const eventLog = await quickSyncEventsGraph(
      txidVersion,
      ETH_CHAIN,
      14858124,
    );
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
  }).timeout(45000);

  it('Should make sure Graph query has no data gaps in commitments - Polygon', async () => {
    const eventLog = await quickSyncEventsGraph(txidVersion, POLYGON_CHAIN, 0);
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
  }).timeout(45000);

  it('Should make sure Graph query has no data gaps in commitments - BNB Smart Chain', async () => {
    const eventLog = await quickSyncEventsGraph(txidVersion, BNB_CHAIN, 0);
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
  }).timeout(45000);

  it('Should make sure Graph query has no data gaps in commitments - Polygon Mumbai', async () => {
    const eventLog = await quickSyncEventsGraph(
      txidVersion,
      POLYGON_MUMBAI_CHAIN,
      0,
    );
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
  }).timeout(45000);

  it('Should make sure Graph query has no data gaps in commitments - Arbitrum', async () => {
    const eventLog = await quickSyncEventsGraph(txidVersion, ARBITRUM_CHAIN, 0);
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
  }).timeout(45000);

  it('Should make sure Graph query has no data gaps in commitments - Goerli', async () => {
    const eventLog = await quickSyncEventsGraph(txidVersion, GOERLI_CHAIN, 0);
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
  }).timeout(45000);

  it('Should make sure Graph query has no data gaps in commitments - Sepolia', async () => {
    const eventLog = await quickSyncEventsGraph(txidVersion, SEPOLIA_CHAIN, 0);
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.be.at.least(
      EXPECTED_COMMITMENT_GROUP_EVENTS_SEPOLIA,
    );
    expect(eventLog.nullifierEvents.length).to.be.at.least(
      EXPECTED_NULLIFIER_EVENTS_SEPOLIA,
    );
    expect(eventLog.unshieldEvents.length).to.be.at.least(
      EXPECTED_UNSHIELD_EVENTS_SEPOLIA,
    );

    // TODO: Add when there are events
    // const shouldThrow = true;
    // assertContiguousCommitmentEvents(eventLog.commitmentEvents, shouldThrow);
  }).timeout(45000);

  it('Should make sure Graph query has no data gaps in commitments - Arbitrum Goerli', async () => {
    const eventLog = await quickSyncEventsGraph(
      txidVersion,
      ARBITRUM_GOERLI_CHAIN,
      0,
    );
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
  }).timeout(45000);

  it('Should run live Railgun Event Log fetch for Polygon with high starting block', async () => {
    const eventLog = await quickSyncEventsGraph(
      txidVersion,
      POLYGON_CHAIN,
      100000000,
    );
    expect(eventLog).to.be.an('object');
    expect(eventLog.commitmentEvents).to.be.an('array');
    expect(eventLog.nullifierEvents).to.be.an('array');
    expect(eventLog.commitmentEvents.length).to.equal(0);
    expect(eventLog.nullifierEvents.length).to.equal(0);
    expect(eventLog.unshieldEvents.length).to.equal(0);
  }).timeout(45000);
});
