import {
  Chain,
  Nullifier,
  UnshieldStoredEvent,
} from '@railgun-community/engine';
import { NetworkName, NETWORK_CONFIG } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { quickSyncGraph } from '../quick-sync-graph';
import { quickSyncIPNS } from '../quick-sync-ipns';

chai.use(chaiAsPromised);
const { expect } = chai;

const ETHEREUM_CHAIN: Chain = NETWORK_CONFIG[NetworkName.Ethereum].chain;
const GOERLI_CHAIN: Chain = NETWORK_CONFIG[NetworkName.EthereumGoerli].chain;
const ARBITRUM_GOERLI_CHAIN: Chain =
  NETWORK_CONFIG[NetworkName.ArbitrumGoerli].chain;
const POLYGON_CHAIN: Chain = NETWORK_CONFIG[NetworkName.Polygon].chain;
const BNB_CHAIN: Chain = NETWORK_CONFIG[NetworkName.BNBChain].chain;
const POLYGON_MUMBAI_CHAIN: Chain =
  NETWORK_CONFIG[NetworkName.PolygonMumbai].chain;
const ARBITRUM_CHAIN: Chain = NETWORK_CONFIG[NetworkName.Arbitrum].chain;

const compareFieldsGraphToIPNS = async (chain: Chain) => {
  const eventLog = await quickSyncGraph(chain, 30144284);
  expect(eventLog).to.be.an('object');
  expect(eventLog.commitmentEvents).to.be.an('array');

  const eventLogIPNS = await quickSyncIPNS(chain, 30144284);

  // Debugging polygon merkletree...
  // // @ts-ignore
  // delete eventLog.commitmentEvents[0].commitments[0].commitmentType;
  // expect(eventLog.commitmentEvents[0].commitments[0]).to.deep.equal(
  //   eventLogIPNS.commitmentEvents[0].commitments[0],
  // );
  // // @ts-ignore
  // delete eventLog.commitmentEvents[5].commitments[0].commitmentType;
  // expect(eventLog.commitmentEvents[5].commitments[0]).to.deep.equal(
  //   eventLogIPNS.commitmentEvents[1].commitments[0],
  // );
  // // @ts-ignore
  // delete eventLog.commitmentEvents[7].commitments[0].commitmentType;
  // expect(eventLog.commitmentEvents[7].commitments[0]).to.deep.equal(
  //   eventLogIPNS.commitmentEvents[2].commitments[0],
  // );

  const maxNullifiers = Math.min(
    eventLog.nullifierEvents.length,
    eventLogIPNS.nullifierEvents.length,
  );
  const maxUnshields = Math.min(
    eventLog.unshieldEvents.length,
    eventLogIPNS.unshieldEvents.length,
  );

  eventLog.nullifierEvents.sort(sortNullifiers);
  eventLogIPNS.nullifierEvents.sort(sortNullifiers);
  eventLog.nullifierEvents
    .slice(0, maxNullifiers)
    .forEach((nullifierEvent, index) => {
      expect(nullifierEvent).to.deep.equal(
        eventLogIPNS.nullifierEvents[index],
        `Nullifier event ${index} does not match`,
      );
    });

  // TODO: Add these back when events are correctly synced up.
  eventLog.unshieldEvents.sort(sortUnshields);
  eventLogIPNS.unshieldEvents.sort(sortUnshields);
  eventLog.unshieldEvents
    .slice(0, maxUnshields)
    .forEach((unshieldEvent, index) => {
      expect(unshieldEvent).to.deep.equal(
        eventLogIPNS.unshieldEvents[index],
        `Unshield event ${index} does not match`,
      );
    });

  const commitmentEventsIPNSFlattened = eventLogIPNS.commitmentEvents
    .map(commitmentEvent =>
      commitmentEvent.commitments.map(commitment => ({
        ...commitmentEvent,
        commitments: [commitment],
      })),
    )
    .flat();
  const maxCommitments = Math.min(
    eventLog.commitmentEvents.length,
    commitmentEventsIPNSFlattened.length,
  );
  expect(eventLog.commitmentEvents.slice(0, maxCommitments)).to.deep.equal(
    commitmentEventsIPNSFlattened.slice(0, maxCommitments),
  );

  // Check commitment fields
  const ipnsIndividualCommitments = commitmentEventsIPNSFlattened
    .slice(0, maxCommitments)
    .map(commitmentEvent => commitmentEvent.commitments[0]);

  eventLog.commitmentEvents
    .slice(0, maxCommitments)
    .map(commitmentEvent => {
      // @ts-ignore
      // eslint-disable-next-line no-param-reassign
      delete commitmentEvent.commitments[0].commitmentType;
      return commitmentEvent.commitments[0];
    })
    .forEach((commitment, index) => {
      expect(commitment).to.deep.equal(ipnsIndividualCommitments[index]);
    });
};

describe.skip('quick-sync-graph-ipns-compare', () => {
  it('Should make sure Graph Protocol returns the same data as IPNS - Ethereum', async () => {
    await compareFieldsGraphToIPNS(ETHEREUM_CHAIN);
  }).timeout(30000);

  it('Should make sure Graph Protocol returns the same data as IPNS - Goerli', async () => {
    await compareFieldsGraphToIPNS(GOERLI_CHAIN);
  }).timeout(30000);

  it('Should make sure Graph Protocol returns the same data as IPNS - BSC', async () => {
    await compareFieldsGraphToIPNS(BNB_CHAIN);
  }).timeout(30000);

  it('Should make sure Graph Protocol returns the same data as IPNS - Polygon', async () => {
    await compareFieldsGraphToIPNS(POLYGON_CHAIN);
  }).timeout(30000);

  it('Should make sure Graph Protocol returns the same data as IPNS - Arbitrum', async () => {
    await compareFieldsGraphToIPNS(ARBITRUM_CHAIN);
  }).timeout(30000);

  it('Should make sure Graph Protocol returns the same data as IPNS - Arbitrum Goerli', async () => {
    await compareFieldsGraphToIPNS(ARBITRUM_GOERLI_CHAIN);
  }).timeout(30000);

  it('Should make sure Graph Protocol returns the same data as IPNS - Mumbai', async () => {
    await compareFieldsGraphToIPNS(POLYGON_MUMBAI_CHAIN);
  }).timeout(30000);
});

const sortNullifiers = (a: Nullifier, b: Nullifier) => {
  if (a.blockNumber < b.blockNumber) {
    return -1;
  }
  if (a.blockNumber > b.blockNumber) {
    return 1;
  }
  if (a.nullifier < b.nullifier) {
    return -1;
  }
  if (a.nullifier > b.nullifier) {
    return 1;
  }
  return 0;
};

const sortUnshields = (a: UnshieldStoredEvent, b: UnshieldStoredEvent) => {
  if (a.blockNumber < b.blockNumber) {
    return -1;
  }
  if (a.blockNumber > b.blockNumber) {
    return 1;
  }
  if (a.tokenAddress < b.tokenAddress) {
    return -1;
  }
  if (a.tokenAddress > b.tokenAddress) {
    return 1;
  }

  // Reverse order for these..
  if (a.amount < b.amount) {
    return 1;
  }
  if (a.amount > b.amount) {
    return -1;
  }
  return 0;
};
