import {
  ByteLength,
  Chain,
  formatToByteLength,
} from '@railgun-community/engine';
import { NetworkName, NETWORK_CONFIG } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { quickSyncGraph } from '../quick-sync-graph';
import { quickSyncIPNS } from '../quick-sync-ipns';
import { BigNumber } from '@ethersproject/bignumber';
import {
  DEFAULT_QUICK_SYNC_PAGE_SIZE,
  IPFS_GATEWAY_URLS,
} from '../railgun-events-ipns';

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
  const eventLog = await quickSyncGraph(chain, 0);
  expect(eventLog).to.be.an('object');
  expect(eventLog.commitmentEvents).to.be.an('array');

  const eventLogIPNS = await quickSyncIPNS(
    chain,
    0,
    DEFAULT_QUICK_SYNC_PAGE_SIZE,
    IPFS_GATEWAY_URLS[0],
  );

  // Incorrect block numbers stored on IPNS
  const IPNSBlockReassigns: Record<number, Record<number, number>> = {
    [ETHEREUM_CHAIN.id]: {
      16683581: 16683582,
    },
    [POLYGON_CHAIN.id]: {
      35203887: 35203912,
      36236716: 36236726,
      36300594: 36300600,
      36663679: 36663681,
      37875801: 37875805,
      39219067: 39219069,
      39374687: 39374700,
      39600066: 39600892,
      39600073: 39600988,
      40001868: 40001874,
      41442609: 41442607,
      41669011: 41669012,
      41695360: 41695362,
    },
  };

  eventLogIPNS.nullifierEvents.forEach((nullifierEventIPNS, index) => {
    const matchingGraphEvent = eventLog.nullifierEvents.find(
      graphNullifierEvent => {
        return (
          graphNullifierEvent.txid === nullifierEventIPNS.txid &&
          graphNullifierEvent.nullifier === nullifierEventIPNS.nullifier
        );
      },
    );
    if (!matchingGraphEvent) {
      // eslint-disable-next-line no-console
      console.log(nullifierEventIPNS);
      throw new Error('No matching NULLIFIER found');
    }
    if (
      IPNSBlockReassigns[chain.id] &&
      IPNSBlockReassigns[chain.id][nullifierEventIPNS.blockNumber]
    ) {
      const newBlockNumber =
        IPNSBlockReassigns[chain.id][nullifierEventIPNS.blockNumber];
      // eslint-disable-next-line no-param-reassign
      nullifierEventIPNS.blockNumber = newBlockNumber;
    }
    expect(matchingGraphEvent).to.deep.equal(
      nullifierEventIPNS,
      `Nullifier ${index} does not match`,
    );
  });

  eventLogIPNS.unshieldEvents.forEach((unshieldEventIPNS, index) => {
    const matchingGraphEvent = eventLog.unshieldEvents.find(
      graphUnshieldEvent => {
        return (
          graphUnshieldEvent.txid === unshieldEventIPNS.txid &&
          graphUnshieldEvent.amount === unshieldEventIPNS.amount &&
          graphUnshieldEvent.tokenAddress === unshieldEventIPNS.tokenAddress &&
          graphUnshieldEvent.tokenSubID === unshieldEventIPNS.tokenSubID
        );
      },
    );
    if (!matchingGraphEvent) {
      // eslint-disable-next-line no-console
      console.log(unshieldEventIPNS);
      throw new Error('No matching UNSHIELD found');
    }
    if (
      IPNSBlockReassigns[chain.id] &&
      IPNSBlockReassigns[chain.id][unshieldEventIPNS.blockNumber]
    ) {
      const newBlockNumber =
        IPNSBlockReassigns[chain.id][unshieldEventIPNS.blockNumber];
      // eslint-disable-next-line no-param-reassign
      unshieldEventIPNS.blockNumber = newBlockNumber;
    }

    expect(matchingGraphEvent.eventLogIndex).to.be.a('number');
    expect(matchingGraphEvent.timestamp).to.be.a('number');

    // @ts-ignore
    delete matchingGraphEvent.eventLogIndex;
    delete matchingGraphEvent.timestamp;

    expect(matchingGraphEvent).to.deep.equal(
      unshieldEventIPNS,
      `Unshield ${index} does not match`,
    );
  });

  // Standardize fields which have changed over time, and have previous values cached in IPNS DB.
  const commitmentEventsIPNSFlattened = eventLogIPNS.commitmentEvents
    .map(commitmentEventIPNS => {
      if (
        IPNSBlockReassigns[chain.id] &&
        IPNSBlockReassigns[chain.id][commitmentEventIPNS.blockNumber]
      ) {
        const newBlockNumber =
          IPNSBlockReassigns[chain.id][commitmentEventIPNS.blockNumber];
        // eslint-disable-next-line no-param-reassign
        commitmentEventIPNS.blockNumber = newBlockNumber;
        commitmentEventIPNS.commitments.forEach(commitment => {
          // eslint-disable-next-line no-param-reassign
          commitment.blockNumber = newBlockNumber;
        });
      }
      if (
        chain.id === POLYGON_CHAIN.id &&
        commitmentEventIPNS.blockNumber === 36236716
      ) {
        // eslint-disable-next-line no-param-reassign
        commitmentEventIPNS.blockNumber = 36236726;
        commitmentEventIPNS.commitments.forEach(commitment => {
          // eslint-disable-next-line no-param-reassign
          commitment.blockNumber = 36236726;
        });
      }

      return commitmentEventIPNS.commitments.map(commitmentIPNS => {
        if ('fee' in commitmentIPNS) {
          if (commitmentIPNS.fee == null) {
            // eslint-disable-next-line no-param-reassign
            delete commitmentIPNS.fee;
          } else {
            // eslint-disable-next-line no-param-reassign
            commitmentIPNS.fee = BigNumber.from(
              commitmentIPNS.fee,
            ).toHexString();
          }
        }
        // eslint-disable-next-line no-param-reassign
        commitmentIPNS.txid = formatToByteLength(
          commitmentIPNS.txid,
          ByteLength.UINT_256,
          false,
        );

        if ('preImage' in commitmentIPNS) {
          // eslint-disable-next-line no-param-reassign
          commitmentIPNS.preImage.token = {
            ...commitmentIPNS.preImage.token,
            tokenType: BigNumber.from(
              commitmentIPNS.preImage.token.tokenType,
            ).toNumber(),
            tokenSubID: formatToByteLength(
              commitmentIPNS.preImage.token.tokenSubID,
              ByteLength.UINT_256,
              true,
            ),
          };
        }

        // @ts-ignore
        // eslint-disable-next-line no-param-reassign
        delete commitmentIPNS.commitmentType;

        return {
          ...commitmentEventIPNS,
          commitments: [commitmentIPNS],
          startPosition: commitmentEventIPNS.startPosition,
        };
      });
    })
    .flat();

  const filteredFlattenedGraphCommitmentEvents = eventLog.commitmentEvents
    .map(commitmentEventGraph => {
      const commitments = commitmentEventGraph.commitments;
      commitments.forEach(commitmentGraph => {
        expect(commitmentGraph.commitmentType).to.be.a('string');
        expect(commitmentGraph.timestamp).to.be.a('number');

        // @ts-ignore
        // eslint-disable-next-line no-param-reassign
        delete commitmentGraph.commitmentType;
        // eslint-disable-next-line no-param-reassign
        delete commitmentGraph.timestamp;
        return commitmentGraph;
      });
      return commitments;
    })
    .flat();

  const maxCommitments = Math.min(
    filteredFlattenedGraphCommitmentEvents.length,
    commitmentEventsIPNSFlattened.length,
  );

  // Check commitment fields
  const ipnsIndividualCommitments = commitmentEventsIPNSFlattened
    .slice(0, maxCommitments)
    .map(commitmentEvent => commitmentEvent.commitments[0]);

  let hasError = false;
  filteredFlattenedGraphCommitmentEvents
    .slice(maxCommitments)
    .forEach((commitmentGraph, index) => {
      try {
        expect(commitmentGraph).to.deep.equal(
          ipnsIndividualCommitments[index],
          `Commitment ${index} does not match`,
        );
      } catch (e) {
        hasError = true;
        // eslint-disable-next-line no-console
        console.warn(e.message);
        // eslint-disable-next-line no-console
        console.log(commitmentGraph);
        // eslint-disable-next-line no-console
        console.log(ipnsIndividualCommitments[index]);
      }
    });
  if (hasError) {
    throw new Error('Error in commitment comparison');
  }

  // Check full commitment batch arrays
  const maxCommitmentBatches = Math.min(
    eventLog.commitmentEvents.length,
    eventLogIPNS.commitmentEvents.length,
  );
  eventLog.commitmentEvents
    .slice(0, maxCommitmentBatches)
    .forEach((commitmentBatch, index) => {
      expect(commitmentBatch).to.deep.equal(
        eventLogIPNS.commitmentEvents[index],
      );
    });
};

describe.skip('quick-sync-graph-ipns-compare', () => {
  it('Should make sure Graph Protocol returns the same data as IPNS - Ethereum', async () => {
    await compareFieldsGraphToIPNS(ETHEREUM_CHAIN);
  }).timeout(60000);

  it('Should make sure Graph Protocol returns the same data as IPNS - Goerli', async () => {
    await compareFieldsGraphToIPNS(GOERLI_CHAIN);
  }).timeout(60000);

  it('Should make sure Graph Protocol returns the same data as IPNS - BSC', async () => {
    await compareFieldsGraphToIPNS(BNB_CHAIN);
  }).timeout(60000);

  it('Should make sure Graph Protocol returns the same data as IPNS - Polygon', async () => {
    await compareFieldsGraphToIPNS(POLYGON_CHAIN);
  }).timeout(60000);

  it('Should make sure Graph Protocol returns the same data as IPNS - Arbitrum', async () => {
    await compareFieldsGraphToIPNS(ARBITRUM_CHAIN);
  }).timeout(60000);

  it('Should make sure Graph Protocol returns the same data as IPNS - Arbitrum Goerli', async () => {
    await compareFieldsGraphToIPNS(ARBITRUM_GOERLI_CHAIN);
  }).timeout(60000);

  it('Should make sure Graph Protocol returns the same data as IPNS - Mumbai', async () => {
    await compareFieldsGraphToIPNS(POLYGON_MUMBAI_CHAIN);
  }).timeout(60000);
});

// const sortNullifiers = (a: Nullifier, b: Nullifier) => {
//   if (a.blockNumber < b.blockNumber) {
//     return -1;
//   }
//   if (a.blockNumber > b.blockNumber) {
//     return 1;
//   }
//   if (a.nullifier < b.nullifier) {
//     return -1;
//   }
//   if (a.nullifier > b.nullifier) {
//     return 1;
//   }
//   return 0;
// };

// const sortUnshields = (a: UnshieldStoredEvent, b: UnshieldStoredEvent) => {
//   if (a.blockNumber < b.blockNumber) {
//     return -1;
//   }
//   if (a.blockNumber > b.blockNumber) {
//     return 1;
//   }
//   if (a.tokenAddress < b.tokenAddress) {
//     return -1;
//   }
//   if (a.tokenAddress > b.tokenAddress) {
//     return 1;
//   }

//   // Reverse order for these..
//   if (a.amount < b.amount) {
//     return 1;
//   }
//   if (a.amount > b.amount) {
//     return -1;
//   }
//   return 0;
// };
