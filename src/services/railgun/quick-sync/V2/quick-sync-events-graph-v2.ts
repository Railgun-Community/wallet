import { AccumulatedEvents, Chain } from '@railgun-community/engine';
import {
  NetworkName,
  isDefined,
  networkForChain,
  removeUndefineds,
} from '@railgun-community/shared-models';
import { getMeshOptions, getSdk } from './graphql';
import { MeshInstance, getMesh } from '@graphql-mesh/runtime';
import {
  GraphCommitmentV2,
  GraphCommitmentBatchV2,
  formatGraphCommitmentEventsV2,
  formatGraphNullifierEventsV2,
  formatGraphUnshieldEventsV2,
} from './graph-type-formatters-v2';
import { removeDuplicatesByID } from '../../util/graph-util';
import { EMPTY_EVENTS, autoPaginatingQuery } from '../graph-query';

const meshes: MapType<MeshInstance> = {};

// 1.5 full trees of commitments
// TODO: This will have to change when we have more than 100k commitments.
const MAX_QUERY_RESULTS = 100000;

const sourceNameForNetwork = (networkName: NetworkName): string => {
  switch (networkName) {
    case NetworkName.Ethereum:
      return 'ethereum';
    case NetworkName.EthereumSepolia:
      // return 'sepolia';
      throw new Error('No Graph API hosted service for Sepolia');
    case NetworkName.BNBChain:
      return 'bsc';
    case NetworkName.Polygon:
      return 'matic';
    case NetworkName.Arbitrum:
      return 'arbitrum-one';
    case NetworkName.PolygonAmoy:
    case NetworkName.ArbitrumGoerli_DEPRECATED:
    case NetworkName.EthereumGoerli_DEPRECATED:
    case NetworkName.EthereumRopsten_DEPRECATED:
    case NetworkName.PolygonMumbai_DEPRECATED:
    case NetworkName.Hardhat:
    default:
      throw new Error('No Graph API hosted service for this network');
  }
};

const isSupportedByNetwork = (networkName: NetworkName) => {
  try {
    sourceNameForNetwork(networkName);
    return true;
  } catch {
    return false;
  }
};

export const quickSyncEventsGraphV2 = async (
  chain: Chain,
  startingBlock: number,
): Promise<AccumulatedEvents> => {
  const network = networkForChain(chain);
  if (!network || !isSupportedByNetwork(network.name)) {
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
      MAX_QUERY_RESULTS,
    ),
    autoPaginatingQuery(
      async (blockNumber: string) =>
        (
          await sdk.Unshields({
            blockNumber,
          })
        ).unshields,
      startingBlock.toString(),
      MAX_QUERY_RESULTS,
    ),
    autoPaginatingQuery(
      async (blockNumber: string) =>
        (
          await sdk.Commitments({
            blockNumber,
          })
        ).commitments,
      startingBlock.toString(),
      MAX_QUERY_RESULTS,
    ),
  ]);

  const filteredNullifiers = removeDuplicatesByID(nullifiers);
  const filteredUnshields = removeDuplicatesByID(unshields);
  const filteredCommitments = removeDuplicatesByID(commitments);
  const graphCommitmentBatches =
    createGraphCommitmentBatches(filteredCommitments);

  graphCommitmentBatches.sort(sortByTreeNumberAndStartPosition);

  const nullifierEvents = formatGraphNullifierEventsV2(filteredNullifiers);
  const unshieldEvents = formatGraphUnshieldEventsV2(filteredUnshields);
  const commitmentEvents = formatGraphCommitmentEventsV2(
    graphCommitmentBatches,
  );

  return { nullifierEvents, unshieldEvents, commitmentEvents };
};

const createGraphCommitmentBatches = (
  flattenedCommitments: GraphCommitmentV2[],
): GraphCommitmentBatchV2[] => {
  const graphCommitmentMap: MapType<GraphCommitmentBatchV2> = {};
  for (const commitment of flattenedCommitments) {
    const startPosition = commitment.batchStartTreePosition;
    const existingBatch = graphCommitmentMap[startPosition];
    if (isDefined(existingBatch)) {
      existingBatch.commitments.push(commitment);
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
  return removeUndefineds(Object.values(graphCommitmentMap));
};

const sortByTreeNumberAndStartPosition = (
  a: GraphCommitmentBatchV2,
  b: GraphCommitmentBatchV2,
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
  const meshForNetwork = meshes[networkName];
  if (isDefined(meshForNetwork)) {
    return meshForNetwork;
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
    meshes[networkName] = undefined;
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
