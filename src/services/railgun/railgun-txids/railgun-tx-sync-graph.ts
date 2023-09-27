import {
  Chain,
  RailgunTransaction,
  getRailgunTransactionIDHex,
  getBlindedCommitmentForUnshield,
} from '@railgun-community/engine';
import {
  NetworkName,
  isDefined,
  networkForChain,
} from '@railgun-community/shared-models';
import {
  getMeshOptions,
  getSdk,
  GetUnshieldRailgunTransactionsByTxidQuery,
} from './graphql';
import { MeshInstance, getMesh } from '@graphql-mesh/runtime';
import {
  GraphRailgunTransactions,
  formatRailgunTransactions,
} from './railgun-tx-graph-type-formatters';
import { removeDuplicatesByID } from '../util/graph-util';

const meshes: MapType<MeshInstance> = {};

// 1.5 full trees of commitments
// TODO: This will have to change when we have more than 100k commitments.
const MAX_QUERY_RESULTS = 100000;

const txsSubgraphSourceNameForNetwork = (networkName: NetworkName): string => {
  switch (networkName) {
    case NetworkName.Ethereum:
      return 'txs-ethereum';
    case NetworkName.EthereumGoerli:
      return 'txs-goerli';
    case NetworkName.BNBChain:
    case NetworkName.Polygon:
    case NetworkName.Arbitrum:
    case NetworkName.ArbitrumGoerli:
    case NetworkName.PolygonMumbai:
    case NetworkName.Railgun:
    case NetworkName.EthereumRopsten_DEPRECATED:
    case NetworkName.Hardhat:
      throw new Error('No railgun-transaction subgraph for this network');
  }
};

export const getUnshieldRailgunTransactionBlindedCommitmentGroups = async (
  chain: Chain,
  txid: string,
  toAddress: string,
): Promise<string[][]> => {
  const network = networkForChain(chain);
  if (!network) {
    return [];
  }

  const sdk = getBuiltGraphSDK(network.name);

  const transactions: GetUnshieldRailgunTransactionsByTxidQuery['transactionInterfaces'] =
    (await sdk.GetUnshieldRailgunTransactionsByTxid({ txid }))
      .transactionInterfaces;

  const unshieldRailgunTransactionBlindedCommitmentGroups: string[][] =
    transactions.map(transaction => {
      const railgunTxid = getRailgunTransactionIDHex(transaction);
      const blindedCommitments: string[] = transaction.commitments.map(
        commitment => {
          return getBlindedCommitmentForUnshield(
            commitment,
            toAddress,
            railgunTxid,
          );
        },
      );
      return blindedCommitments;
    });

  return unshieldRailgunTransactionBlindedCommitmentGroups;
};

export const quickSyncRailgunTransactions = async (
  chain: Chain,
  latestGraphID: Optional<string>,
): Promise<RailgunTransaction[]> => {
  const network = networkForChain(chain);
  if (!network || !isDefined(network.poi)) {
    return [];
  }

  const sdk = getBuiltGraphSDK(network.name);

  const railgunTransactions: GraphRailgunTransactions =
    await autoPaginatingQuery(
      async (id: string) =>
        (
          await sdk.GetRailgunTransactionsAfterGraphID({
            idLow: id,
          })
        ).transactionInterfaces,
      latestGraphID ?? '0x00',
    );

  const filteredRailgunTransactions: GraphRailgunTransactions =
    removeDuplicatesByID(railgunTransactions);

  const formattedRailgunTransactions: RailgunTransaction[] =
    formatRailgunTransactions(filteredRailgunTransactions);

  return formattedRailgunTransactions;
};

const autoPaginatingQuery = async <ReturnType extends { id: string }>(
  query: (id: string) => Promise<ReturnType[]>,
  id: string,
  prevResults: ReturnType[] = [],
): Promise<ReturnType[]> => {
  const newResults = await query(id);
  if (newResults.length === 0) {
    return prevResults;
  }

  const totalResults = prevResults.concat(newResults);

  const overLimit = totalResults.length >= MAX_QUERY_RESULTS;
  const lastResult = totalResults[totalResults.length - 1];

  const shouldQueryMore = newResults.length === 1000;
  if (!overLimit && shouldQueryMore) {
    return autoPaginatingQuery(query, lastResult.id, totalResults);
  }

  return totalResults;
};

const getBuiltGraphClient = async (
  networkName: NetworkName,
): Promise<MeshInstance> => {
  const meshForNetwork = meshes[networkName];
  if (isDefined(meshForNetwork)) {
    return meshForNetwork;
  }
  const sourceName = txsSubgraphSourceNameForNetwork(networkName);
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

  try {
    const mesh = await getMesh(meshOptions);
    meshes[networkName] = mesh;
    const id = mesh.pubsub.subscribe('destroy', () => {
      meshes[networkName] = undefined;
      mesh.pubsub.unsubscribe(id);
    });
    return mesh;
  } catch (err) {
    throw new Error(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `ERROR getting mesh - if error includes "can't generate schema," make sure to check the filepaths for source schema imports in the built index file: ${err.message}`,
    );
  }
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
