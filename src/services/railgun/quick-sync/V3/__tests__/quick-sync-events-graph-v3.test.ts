import { Chain, CommitmentEvent, TXIDVersion } from '@railgun-community/engine';
import { NetworkName, NETWORK_CONFIG } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { quickSyncEventsGraph } from '../../quick-sync-events';
import { isV2Test } from '../../../../../tests/helper.test';

chai.use(chaiAsPromised);
const { expect } = chai;

const txidVersion = TXIDVersion.V3_PoseidonMerkle;

const POLYGON_MUMBAI_CHAIN: Chain =
  NETWORK_CONFIG[NetworkName.PolygonMumbai_DEPRECATED].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_POLYGON_MUMBAI = 1;
const EXPECTED_NULLIFIER_EVENTS_POLYGON_MUMBAI = 1;
const EXPECTED_UNSHIELD_EVENTS_POLYGON_MUMBAI = 1;
const EXPECTED_RAILGUN_TRANSACTION_EVENTS_POLYGON_MUMBAI = 1;

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

    // TODO: This logic may need an update if the tree is less than 65536 commitments.
    if (nextStartPosition >= 65536) {
      // Roll over to next tree.
      nextTreeNumber += 1;
      nextStartPosition = 0;
    }
  }
};

describe('quick-sync-events-graph-v3', () => {
  it('[V3] Should make sure Graph V3 query has no data gaps in commitments - Polygon Mumbai', async function run() {
    if (isV2Test()) {
      this.skip();
      return;
    }

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
    expect(eventLog.railgunTransactionEvents?.length).to.be.at.least(
      EXPECTED_UNSHIELD_EVENTS_POLYGON_MUMBAI,
    );

    const shouldThrow = true;
    assertContiguousCommitmentEvents(eventLog.commitmentEvents, shouldThrow);
  }).timeout(45_000);
});
