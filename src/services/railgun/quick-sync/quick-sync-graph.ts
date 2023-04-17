import { AccumulatedEvents, Chain } from '@railgun-community/engine';
import { NetworkName, networkForChain } from '@railgun-community/shared-models';
import { EMPTY_EVENTS } from './empty-events';
import { getMeshOptions, getSdk } from './graphql';
import { MeshInstance, getMesh } from '@graphql-mesh/runtime';
import {
  GraphCommitment,
  GraphCommitmentBatch,
  formatGraphCommitmentEvents,
  formatGraphNullifierEvents,
  formatGraphUnshieldEvents,
} from './graph-type-formatters';

const meshes: MapType<MeshInstance> = {};

// 1.5 full trees of commitments
// TODO: This will have to change when we have more than 100k commitments.
const MAX_QUERY_RESULTS = 100000;

const sourceNameForNetwork = (networkName: NetworkName): string => {
  switch (networkName) {
    case NetworkName.Ethereum:
      return 'ethereum';
    case NetworkName.EthereumGoerli:
      return 'goerli';
    case NetworkName.BNBChain:
      return 'bsc';
    case NetworkName.Polygon:
      return 'matic';
    case NetworkName.Arbitrum:
      return 'arbitrum-one';
    case NetworkName.ArbitrumGoerli:
      return 'arbitrum-goerli';
    case NetworkName.PolygonMumbai:
      return 'mumbai';
    case NetworkName.Railgun:
    case NetworkName.EthereumRopsten_DEPRECATED:
    case NetworkName.Hardhat:
      throw new Error('No Graph API hosted service for this network');
  }
};

export const quickSyncGraph = async (
  chain: Chain,
  startingBlock: number,
): Promise<AccumulatedEvents> => {
  const network = networkForChain(chain);
  if (!network || !network.shouldQuickSync) {
    // Return empty logs, Engine will default to full scan.
    return EMPTY_EVENTS;
  }

  const sdk = getBuiltGraphSDK(network.name);

  const [nullifiers, unshields, commitments] = await Promise.all([
    autoPaginatingQuery(
      async (blockNumber: string) =>
        (
          await sdk.Nullifiers({
            blockNumber,
          })
        ).nullifiers,
      startingBlock.toString(),
    ),
    autoPaginatingQuery(
      async (blockNumber: string) =>
        (
          await sdk.Unshields({
            blockNumber,
          })
        ).unshields,
      startingBlock.toString(),
    ),
    autoPaginatingQuery(
      async (blockNumber: string) =>
        (
          await sdk.Commitments({
            blockNumber,
          })
        ).commitments,
      startingBlock.toString(),
    ),
  ]);

  const filteredNullifiers = removeDuplicatesByID(nullifiers);
  const filteredUnshields = removeDuplicatesByID(unshields);
  const filteredCommitments = removeDuplicatesByID(commitments);
  const graphCommitmentBatches =
    createGraphCommitmentBatches(filteredCommitments);

  graphCommitmentBatches.sort(sortByTreeNumberAndStartPosition);

  const nullifierEvents = formatGraphNullifierEvents(filteredNullifiers);
  const unshieldEvents = formatGraphUnshieldEvents(filteredUnshields);
  const commitmentEvents = formatGraphCommitmentEvents(graphCommitmentBatches);

  return { nullifierEvents, unshieldEvents, commitmentEvents };
};

const createGraphCommitmentBatches = (
  flattenedCommitments: GraphCommitment[],
): GraphCommitmentBatch[] => {
  const graphCommitmentMap: MapType<GraphCommitmentBatch> = {};
  for (const commitment of flattenedCommitments) {
    const startPosition = commitment.batchStartTreePosition;
    if (graphCommitmentMap[startPosition]) {
      graphCommitmentMap[startPosition].commitments.push(commitment);
    } else {
      graphCommitmentMap[commitment.batchStartTreePosition] = {
        commitments: [commitment],
        transactionHash: commitment.transactionHash,
        treeNumber: commitment.treeNumber,
        startPosition: commitment.batchStartTreePosition,
        blockNumber: Number(commitment.blockNumber),
      };
    }
  }
  return Object.values(graphCommitmentMap);
};

const autoPaginatingQuery = async <ReturnType extends { blockNumber: string }>(
  query: (blockNumber: string) => Promise<ReturnType[]>,
  blockNumber: string,
  prevResults: ReturnType[] = [],
): Promise<ReturnType[]> => {
  const newResults = await query(blockNumber);
  if (newResults.length === 0) {
    return prevResults;
  }

  const totalResults = prevResults.concat(newResults);

  const overLimit = totalResults.length >= MAX_QUERY_RESULTS;
  const lastResult = totalResults[totalResults.length - 1];

  const shouldQueryMore = newResults.length === 1000;
  if (!overLimit && shouldQueryMore) {
    return autoPaginatingQuery(query, lastResult.blockNumber, totalResults);
  }

  return totalResults;
};

const removeDuplicatesByID = <T extends { id: string }>(array: T[]): T[] => {
  const seen = new Set();
  return array.filter((item: T) => {
    const duplicate = seen.has(item.id);
    seen.add(item.id);
    return !duplicate;
  });
};

const sortByTreeNumberAndStartPosition = (
  a: GraphCommitmentBatch,
  b: GraphCommitmentBatch,
) => {
  if (a.treeNumber < b.treeNumber) {
    return -1;
  }
  if (a.treeNumber > b.treeNumber) {
    return 1;
  }
  if (a.startPosition < b.startPosition) {
    return -1;
  }
  if (a.startPosition > b.startPosition) {
    return 1;
  }
  return 0;
};

const getBuiltGraphClient = async (
  networkName: NetworkName,
): Promise<MeshInstance> => {
  if (meshes[networkName]) {
    return meshes[networkName];
  }
  const sourceName = sourceNameForNetwork(networkName);
  const meshOptions = await getMeshOptions();
  const filteredSources = meshOptions.sources.filter(source => {
    return source.name === sourceName;
  });
  if (filteredSources.length !== 1) {
    throw new Error(
      `Expected exactly one source for network ${networkName}, found ${filteredSources.length}`,
    );
  }
  meshOptions.sources = [filteredSources[0]];
  const mesh = await getMesh(meshOptions);
  meshes[networkName] = mesh;
  const id = mesh.pubsub.subscribe('destroy', () => {
    mesh.pubsub.unsubscribe(id);
  });
  return mesh;
};

const getBuiltGraphSDK = <TGlobalContext, TOperationContext>(
  networkName: NetworkName,
  globalContext?: TGlobalContext,
) => {
  const sdkRequester$ = getBuiltGraphClient(networkName).then(
    ({ sdkRequesterFactory }) => sdkRequesterFactory(globalContext),
  );
  return getSdk<TOperationContext, TGlobalContext>((...args) =>
    sdkRequester$.then(sdkRequester => sdkRequester(...args)),
  );
};
