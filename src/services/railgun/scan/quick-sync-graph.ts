import { AccumulatedEvents, Chain } from '@railgun-community/engine';
import { NetworkName, networkForChain } from '@railgun-community/shared-models';
import { EMPTY_EVENTS } from './empty-events';
import { getMeshOptions, getSdk } from './graphql';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MeshInstance, getMesh } from '@graphql-mesh/runtime';
import {
  GraphCommitment,
  formatGraphCommitmentEvents,
  formatGraphNullifierEvents,
  formatGraphUnshieldEvents,
} from './graph-type-formatters';

const meshes: MapType<MeshInstance> = {};

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

  const [{ nullifiers }, { unshields }, { commitments }] = await Promise.all([
    sdk.Nullifiers({
      blockNumber: startingBlock.toString(),
    }),
    sdk.Unshields({
      blockNumber: startingBlock.toString(),
    }),
    sdk.Commitments({
      blockNumber: startingBlock.toString(),
    }),
  ]);

  console.log(commitments.slice(135, 140));

  commitments.sort(sortByTreeNumberAndPosition);

  console.log(commitments.slice(135, 140));

  const nullifierEvents = formatGraphNullifierEvents(nullifiers);
  const unshieldEvents = formatGraphUnshieldEvents(unshields);
  const commitmentEvents = formatGraphCommitmentEvents(commitments);

  return { nullifierEvents, unshieldEvents, commitmentEvents };
};

const sortByTreeNumberAndPosition = (
  a: GraphCommitment,
  b: GraphCommitment,
) => {
  if (a.treeNumber < b.treeNumber) {
    return -1;
  }
  if (a.treeNumber > b.treeNumber) {
    return 1;
  }
  if (a.treePosition < b.treePosition) {
    return -1;
  }
  if (a.treePosition > b.treePosition) {
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
