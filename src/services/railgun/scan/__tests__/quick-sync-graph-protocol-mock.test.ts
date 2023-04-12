import { Chain, CommitmentEvent, Nullifier } from '@railgun-community/engine';
import { NetworkName, NETWORK_CONFIG } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { quickSyncGraphProtocol } from '../quick-sync-graph-protocol';
import { quickSyncIPNS } from '../quick-sync-ipns';

chai.use(chaiAsPromised);
const { expect } = chai;

const ETH_CHAIN: Chain = NETWORK_CONFIG[NetworkName.Ethereum].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_ETH = 4400;
const EXPECTED_NULLIFIER_EVENTS_ETH = 3000;
const EXPECTED_UNSHIELD_EVENTS_ETH = 1;

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

describe.only('quick-sync-graph-protocol-mock', () => {
  it.skip(
    'Should make sure Graph Protocol has no data gaps in commitments - Ethereum',
    async () => {
      const eventLog = await quickSyncGraphProtocol(ETH_CHAIN, 0);
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
    },
  ).timeout(20000);

  it('Should make sure Graph Protocol has no data gaps in commitments - Arbitrum Goerli', async () => {
    const eventLog = await quickSyncGraphProtocol(ARBITRUM_GOERLI_CHAIN, 0);
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

    const eventLogIPNS = await quickSyncIPNS(ARBITRUM_GOERLI_CHAIN, 0);

    expect(
      eventLog.nullifierEvents.slice(0, 150).sort(sortNullifiers),
    ).to.deep.equal(
      eventLogIPNS.nullifierEvents.slice(0, 150).sort(sortNullifiers),
    );

    expect(eventLog.unshieldEvents.slice(0, 150)).to.deep.equal(
      eventLogIPNS.unshieldEvents.slice(0, 150),
    );

    const commitmentEventsIPNSFlattened = eventLog.commitmentEvents
      .map(commitmentEvent =>
        commitmentEvent.commitments.map(commitment => ({
          ...commitmentEvent,
          commitments: [commitment],
        })),
      )
      .flat();
    expect(eventLog.commitmentEvents.slice(0, 150)).to.deep.equal(
      commitmentEventsIPNSFlattened.slice(0, 150),
    );
  }).timeout(20000);
});

const sortNullifiers = (a: Nullifier, b: Nullifier) => {
  if (a.nullifier < b.nullifier) {
    return -1;
  }
  if (a.nullifier > b.nullifier) {
    return 1;
  }
  return 0;
};
