import { Chain, Nullifier } from '@railgun-community/engine';
import { NetworkName, NETWORK_CONFIG } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { quickSyncGraph } from '../quick-sync-graph';
import { quickSyncIPNS } from '../quick-sync-ipns';

chai.use(chaiAsPromised);
const { expect } = chai;

const ARBITRUM_GOERLI_CHAIN: Chain =
  NETWORK_CONFIG[NetworkName.ArbitrumGoerli].chain;
const EXPECTED_COMMITMENT_GROUP_EVENTS_ARBITRUM_GOERLI = 186;
const EXPECTED_NULLIFIER_EVENTS_ARBITRUM_GOERLI = 80;
const EXPECTED_UNSHIELD_EVENTS_ARBITRUM_GOERLI = 32;

describe('quick-sync-graph-ipns-compare', () => {
  it('Should make sure Graph Protocol returns the same data as IPNS - Arbitrum Goerli', async () => {
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
