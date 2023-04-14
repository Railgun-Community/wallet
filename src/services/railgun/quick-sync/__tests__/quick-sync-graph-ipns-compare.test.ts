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
      39374687: 39374700,
      39600066: 39600892,
      39600073: 39600988,
      41442609: 41442607,
    },
  };

  // Add these back when nullifier events are correctly synced up.
  // eventLog.nullifierEvents.sort(sortNullifiers);
  // eventLogIPNS.nullifierEvents.sort(sortNullifiers);
  // const maxNullifiers = Math.min(
  //   eventLog.nullifierEvents.length,
  //   eventLogIPNS.nullifierEvents.length,
  // );
  // eventLog.nullifierEvents
  //   .slice(0, maxNullifiers)
  //   .forEach((nullifierEvent, index) => {
  //     expect(nullifierEvent).to.deep.equal(
  //       eventLogIPNS.nullifierEvents[index],
  //       `Nullifier event ${index} does not match`,
  //     );
  //   });
  eventLogIPNS.nullifierEvents.forEach((nullifierEvent, index) => {
    const matchingGraphEvent = eventLog.nullifierEvents.find(
      graphUnshieldEvent => {
        return (
          graphUnshieldEvent.txid === nullifierEvent.txid &&
          graphUnshieldEvent.nullifier === nullifierEvent.nullifier
        );
      },
    );
    if (!matchingGraphEvent) {
      // eslint-disable-next-line no-console
      console.log(nullifierEvent);
      throw new Error('No matching NULLIFIER found');
    }
    if (
      IPNSBlockReassigns[chain.id] &&
      IPNSBlockReassigns[chain.id][nullifierEvent.blockNumber]
    ) {
      const newBlockNumber =
        IPNSBlockReassigns[chain.id][nullifierEvent.blockNumber];
      // eslint-disable-next-line no-param-reassign
      nullifierEvent.blockNumber = newBlockNumber;
    }
    expect(matchingGraphEvent).to.deep.equal(
      nullifierEvent,
      `Nullifier ${index} does not match`,
    );
  });

  // Add these back when unshield events are correctly synced up.
  // eventLog.unshieldEvents.sort(sortUnshields);
  // eventLogIPNS.unshieldEvents.sort(sortUnshields);
  // const maxUnshields = Math.min(
  //   eventLog.unshieldEvents.length,
  //   eventLogIPNS.unshieldEvents.length,
  // );
  // eventLog.unshieldEvents
  //   .slice(0, maxUnshields)
  //   .forEach((unshieldEvent, index) => {
  //     expect(unshieldEvent).to.deep.equal(
  //       eventLogIPNS.unshieldEvents[index],
  //       `Unshield event ${index} does not match`,
  //     );
  //   });
  eventLogIPNS.unshieldEvents.forEach((unshieldEvent, index) => {
    const matchingGraphEvent = eventLog.unshieldEvents.find(
      graphUnshieldEvent => {
        return (
          graphUnshieldEvent.txid === unshieldEvent.txid &&
          graphUnshieldEvent.amount === unshieldEvent.amount &&
          graphUnshieldEvent.tokenAddress === unshieldEvent.tokenAddress &&
          graphUnshieldEvent.tokenSubID === unshieldEvent.tokenSubID
        );
      },
    );
    if (!matchingGraphEvent) {
      // eslint-disable-next-line no-console
      console.log(unshieldEvent);
      throw new Error('No matching UNSHIELD found');
    }
    if (
      IPNSBlockReassigns[chain.id] &&
      IPNSBlockReassigns[chain.id][unshieldEvent.blockNumber]
    ) {
      const newBlockNumber =
        IPNSBlockReassigns[chain.id][unshieldEvent.blockNumber];
      // eslint-disable-next-line no-param-reassign
      unshieldEvent.blockNumber = newBlockNumber;
    }
    expect(matchingGraphEvent).to.deep.equal(
      unshieldEvent,
      `Unshield ${index} does not match`,
    );
  });

  // Standardize fields which have changed over time, and have previous values cached in IPNS DB.
  const commitmentEventsIPNSFlattened = eventLogIPNS.commitmentEvents
    .map(commitmentEvent => {
      // Fix IPNS wrong blocks
      if (
        IPNSBlockReassigns[chain.id] &&
        IPNSBlockReassigns[chain.id][commitmentEvent.blockNumber]
      ) {
        const newBlockNumber =
          IPNSBlockReassigns[chain.id][commitmentEvent.blockNumber];
        // eslint-disable-next-line no-param-reassign
        commitmentEvent.blockNumber = newBlockNumber;
        commitmentEvent.commitments.forEach(commitment => {
          // eslint-disable-next-line no-param-reassign
          commitment.blockNumber = newBlockNumber;
        });
      }
      if (
        chain.id === POLYGON_CHAIN.id &&
        commitmentEvent.blockNumber === 36236716
      ) {
        // eslint-disable-next-line no-param-reassign
        commitmentEvent.blockNumber = 36236726;
        commitmentEvent.commitments.forEach(commitment => {
          // eslint-disable-next-line no-param-reassign
          commitment.blockNumber = 36236726;
        });
      }

      return commitmentEvent.commitments.map((commitment, index) => {
        if ('fee' in commitment) {
          if (commitment.fee == null) {
            // eslint-disable-next-line no-param-reassign
            delete commitment.fee;
          } else {
            // eslint-disable-next-line no-param-reassign
            commitment.fee = BigNumber.from(commitment.fee).toHexString();
          }
        }
        // eslint-disable-next-line no-param-reassign
        commitment.txid = formatToByteLength(
          commitment.txid,
          ByteLength.UINT_256,
          true,
        );

        if ('preImage' in commitment) {
          // eslint-disable-next-line no-param-reassign
          commitment.preImage.token = {
            ...commitment.preImage.token,
            tokenType: BigNumber.from(
              commitment.preImage.token.tokenType,
            ).toNumber(),
            tokenSubID: formatToByteLength(
              commitment.preImage.token.tokenSubID,
              ByteLength.UINT_256,
              true,
            ),
          };
        }

        // @ts-ignore
        // eslint-disable-next-line no-param-reassign
        delete commitment.commitmentType;

        return {
          ...commitmentEvent,
          commitments: [commitment],
          startPosition: commitmentEvent.startPosition + index,
        };
      });
    })
    .flat();

  const maxCommitments = Math.min(
    eventLog.commitmentEvents.length,
    commitmentEventsIPNSFlattened.length,
  );
  const filteredGraphCommitmentEvents = eventLog.commitmentEvents
    .slice(0, maxCommitments)
    .map(commitmentEvent => {
      const commitment = commitmentEvent.commitments[0];

      // @ts-ignore
      // eslint-disable-next-line no-param-reassign
      delete commitment.commitmentType;
      return commitment;
    });

  // Check commitment fields
  const ipnsIndividualCommitments = commitmentEventsIPNSFlattened
    .slice(0, maxCommitments)
    .map(commitmentEvent => commitmentEvent.commitments[0]);

  let hasError = false;
  filteredGraphCommitmentEvents.forEach((commitment, index) => {
    // if (index === 960) {
    //   console.log(commitment);
    //   console.log(ipnsIndividualCommitments[index]);
    // }
    try {
      expect(commitment).to.deep.equal(
        ipnsIndividualCommitments[index],
        `Commitment ${index} does not match`,
      );
    } catch (e) {
      hasError = true;
      // eslint-disable-next-line no-console
      console.warn(e.message);
      // eslint-disable-next-line no-console
      console.log(commitment);
      // eslint-disable-next-line no-console
      console.log(ipnsIndividualCommitments[index]);
      // eslint-disable-next-line no-console
      console.log(
        `${ipnsIndividualCommitments[index].blockNumber}: ${commitment.blockNumber},`,
      );
    }
  });
  if (hasError) {
    throw new Error('Error in commitment comparison');
  }

  // Check full commitment arrays
  expect(eventLog.commitmentEvents.slice(0, maxCommitments)).to.deep.equal(
    commitmentEventsIPNSFlattened.slice(0, maxCommitments),
  );
};

describe('quick-sync-graph-ipns-compare', () => {
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