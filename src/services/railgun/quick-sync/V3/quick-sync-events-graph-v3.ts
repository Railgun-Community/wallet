import {
  AccumulatedEvents,
  Chain,
  getRailgunTransactionIDHex,
} from '@railgun-community/engine';
import { EMPTY_EVENTS, autoPaginatingQuery } from '../graph-query';
import {
  NetworkName,
  isDefined,
  networkForChain,
} from '@railgun-community/shared-models';
import { MeshInstance, getMesh } from '@graphql-mesh/runtime';
import { removeDuplicatesByID } from '../../util/graph-util';
import { getMeshOptions, getSdk } from './graphql';
import {
  RailgunTxidMapV3,
  formatGraphCommitmentEventsV3,
  formatGraphNullifierEventsV3,
  formatGraphRailgunTransactionEventsV3,
  formatGraphUnshieldEventsV3,
} from './graph-type-formatters-v3';

const meshes: MapType<MeshInstance> = {};

// 1.5 full trees of commitments
// TODO: This will have to change when we have more than 100k commitments.
const MAX_QUERY_RESULTS = 100000;

const sourceNameForNetwork = (networkName: NetworkName): string => {
  switch (networkName) {
    case NetworkName.Ethereum:
    case NetworkName.EthereumSepolia:
    case NetworkName.BNBChain:
    case NetworkName.Polygon:
    case NetworkName.Arbitrum:
    case NetworkName.PolygonAmoy:
    case NetworkName.ArbitrumGoerli_DEPRECATED:
    case NetworkName.EthereumGoerli_DEPRECATED:
    case NetworkName.EthereumRopsten_DEPRECATED:
    case NetworkName.PolygonMumbai_DEPRECATED:
    case NetworkName.Hardhat:
    default:
      throw new Error(
        'No Graph API hosted service for this network on RAILGUN V3',
      );
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

export const quickSyncEventsGraphV3 = async (
  chain: Chain,
  startingBlock: number,
): Promise<AccumulatedEvents> => {
  const network = networkForChain(chain);
  if (!network || !isSupportedByNetwork(network.name)) {
    // Return empty logs, Engine will default to full scan.
    return EMPTY_EVENTS;
  }

  const sdk = getBuiltGraphSDK(network.name);

  const [nullifiers, unshields, commitments, railgunTransactions] =
    await Promise.all([
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
      autoPaginatingQuery(
        async (blockNumber: string) =>
          (
            await sdk.RailgunTransactions({
              blockNumber,
            })
          ).railgunTransactions,
        startingBlock.toString(),
        MAX_QUERY_RESULTS,
      ),
    ]);

  const filteredRailgunTransactions = removeDuplicatesByID(railgunTransactions);
  const filteredNullifiers = removeDuplicatesByID(nullifiers);
  const filteredUnshields = removeDuplicatesByID(unshields);
  const filteredCommitments = removeDuplicatesByID(commitments);

  const railgunTransactionEvents = formatGraphRailgunTransactionEventsV3(
    filteredRailgunTransactions,
  );

  const railgunTxidMap: RailgunTxidMapV3 = {};
  for (const railgunTransaction of filteredRailgunTransactions) {
    const railgunTxid = getRailgunTransactionIDHex(railgunTransaction);
    railgunTxidMap[railgunTxid] = railgunTransaction.commitments;
  }

  const nullifierEvents = formatGraphNullifierEventsV3(filteredNullifiers);
  const unshieldEvents = formatGraphUnshieldEventsV3(
    filteredUnshields,
    railgunTxidMap,
  );
  const commitmentEvents = formatGraphCommitmentEventsV3(
    filteredCommitments,
    railgunTxidMap,
  );

  return {
    nullifierEvents,
    unshieldEvents,
    commitmentEvents,
    railgunTransactionEvents,
  };
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
