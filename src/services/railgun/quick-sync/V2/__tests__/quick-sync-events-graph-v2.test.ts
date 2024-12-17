/* eslint-disable no-bitwise */
import { Chain, CommitmentEvent, TXIDVersion } from '@railgun-community/engine';
import { NetworkName, NETWORK_CONFIG } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { quickSyncEventsGraph } from '../../quick-sync-events';
import { isV2Test } from '../../../../../tests/helper.test';

chai.use(chaiAsPromised);
const { expect } = chai;

const txidVersion = TXIDVersion.V2_PoseidonMerkle;

const ETH_CHAIN: Chain = NETWORK_CONFIG[NetworkName.Ethereum].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_ETH = 20_000;
const EXPECTED_NULLIFIER_EVENTS_ETH = 27_000;
const EXPECTED_UNSHIELD_EVENTS_ETH = 10_000;

const POLYGON_CHAIN: Chain = NETWORK_CONFIG[NetworkName.Polygon].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_POLYGON = 20_000;
const EXPECTED_NULLIFIER_EVENTS_POLYGON = 30_000;
const EXPECTED_UNSHIELD_EVENTS_POLYGON = 10_000;

const BNB_CHAIN: Chain = NETWORK_CONFIG[NetworkName.BNBChain].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_BNB = 9_000;
const EXPECTED_NULLIFIER_EVENTS_BNB = 12_000;
const EXPECTED_UNSHIELD_EVENTS_BNB = 4_000;

const ARBITRUM_CHAIN: Chain = NETWORK_CONFIG[NetworkName.Arbitrum].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_ARBITRUM = 17_000;
const EXPECTED_NULLIFIER_EVENTS_ARBITRUM = 22_000;
const EXPECTED_UNSHIELD_EVENTS_ARBITRUM = 9_000;

const SEPOLIA_CHAIN: Chain = NETWORK_CONFIG[NetworkName.EthereumSepolia].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_SEPOLIA = 1;
const EXPECTED_NULLIFIER_EVENTS_SEPOLIA = 1;
const EXPECTED_UNSHIELD_EVENTS_SEPOLIA = 1;

const assertContiguousCommitmentEvents = (
  commitmentEvents: CommitmentEvent[],
  shouldThrow: boolean,
) => {
  // Track unique events by their actual start positions
  const positionMap = new Map<number, Set<number>>();

  // Build map of positions to their commitment indices
  for (const event of commitmentEvents) {
    const uniqueIndices = new Set(event.commitments.map(c => c.utxoIndex));
    positionMap.set(event.startPosition, uniqueIndices);
  }

  // Get sorted positions
  const positions = Array.from(positionMap.keys()).sort((a, b) => a - b);

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < positions.length - 1; i++) {
    const currentPos = positions[i];
    const nextPos = positions[i + 1];
    
    const currentIndices = positionMap.get(currentPos);

    // Check if current position's indices bridge the gap
    const maxIndexInCurrent = Math.max(...Array.from(currentIndices || []));
    const bridgesGap = maxIndexInCurrent >= nextPos - 1;

    // Only throw if there's a gap AND the current indices don't bridge it
    if (nextPos !== currentPos + 1 && !bridgesGap) {
      if (shouldThrow) {
        throw new Error(`Gap in sequence: found ${nextPos} after ${currentPos} (max index: ${maxIndexInCurrent})`);
      }
    }
  }
};

describe('quick-sync-events-graph-v2', () => {
  it('[V2] Should make sure Graph V2 query has no data gaps in commitments - Ethereum', async function run() {
    if (!isV2Test()) {
      this.skip();
      return;
    }
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
  }).timeout(200_000);

  it('[V2] Should make sure Graph V2 query has no data gaps in commitments - Polygon', async function run() {
    if (!isV2Test()) {
      this.skip();
      return;
    }

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
  }).timeout(200_000);

  it('[V2] Should make sure Graph V2 query has no data gaps in commitments - BNB Smart Chain', async function run() {
    if (!isV2Test()) {
      this.skip();
      return;
    }

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
  }).timeout(200_000);

  it('[V2] Should make sure Graph V2 query has no data gaps in commitments - Arbitrum', async function run() {
    if (!isV2Test()) {
      this.skip();
      return;
    }

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
  }).timeout(200_000);

  it('[V2] Should make sure Graph V2 query has no data gaps in commitments - Sepolia', async function run() {
    if (!isV2Test()) {
      this.skip();
      return;
    }

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

    const shouldThrow = true;
    assertContiguousCommitmentEvents(eventLog.commitmentEvents, shouldThrow);
  }).timeout(90_000);

  it('[V2] Should run live Railgun Event Log fetch for Polygon with high starting block', async function run() {
    if (!isV2Test()) {
      this.skip();
      return;
    }

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
  }).timeout(200_000);
});
