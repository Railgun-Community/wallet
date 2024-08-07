import {
  Chain,
  RailgunTransaction,
  RailgunTransactionV2,
  getRailgunTransactionIDHex,
} from '@railgun-community/engine';
import {
  NetworkName,
  delay,
  isDefined,
  networkForChain,
  promiseTimeout,
} from '@railgun-community/shared-models';
import { getMeshOptions, getSdk } from './graphql';
import { MeshInstance, getMesh } from '@graphql-mesh/runtime';
import {
  GraphRailgunTransactions,
  formatRailgunTransactions,
} from './railgun-txid-graph-type-formatters';
import { removeDuplicatesByID } from '../util/graph-util';

const meshes: MapType<MeshInstance> = {};

const MAX_QUERY_RESULTS = 5000;

const txsSubgraphSourceNameForNetwork = (networkName: NetworkName): string => {
  switch (networkName) {
    case NetworkName.Ethereum:
      return 'txs-ethereum';
    case NetworkName.EthereumSepolia:
      return 'txs-sepolia';
    case NetworkName.BNBChain:
      return 'txs-bsc';
    case NetworkName.Arbitrum:
      return 'txs-arbitrum';
    case NetworkName.Polygon:
      return 'txs-matic';
    case NetworkName.PolygonAmoy:
    case NetworkName.PolygonMumbai_DEPRECATED:
    case NetworkName.ArbitrumGoerli_DEPRECATED:
    case NetworkName.EthereumGoerli_DEPRECATED:
    case NetworkName.EthereumRopsten_DEPRECATED:
    case NetworkName.Hardhat:
    default:
      throw new Error('No railgun-transaction subsquid for this network');
  }
};

export const getRailgunTxDataForUnshields = async (
  chain: Chain,
  txid: string,
): Promise<
  {
    railgunTransaction: RailgunTransactionV2;
    railgunTxid: string;
  }[]
> => {
  const network = networkForChain(chain);
  if (!network) {
    return [];
  }

  const sdk = getBuiltGraphSDK(network.name);

  const transactions: GraphRailgunTransactions = (
    await sdk.GetRailgunTransactionsByTxid({ txid })
  ).transactions;

  const railgunTxidsForUnshields: {
    railgunTransaction: RailgunTransactionV2;
    railgunTxid: string;
  }[] = transactions
    .filter(transaction => transaction.hasUnshield)
    .map(transaction => {
      const railgunTransaction = formatRailgunTransactions([transaction])[0];
      const railgunTxid = getRailgunTransactionIDHex(transaction);
      return { railgunTxid, railgunTransaction };
    });

  return railgunTxidsForUnshields;
};

export const getRailgunTxidsForUnshields = async (
  chain: Chain,
  txid: string,
): Promise<string[]> => {
  const network = networkForChain(chain);
  if (!network) {
    return [];
  }

  const sdk = getBuiltGraphSDK(network.name);

  const transactions: GraphRailgunTransactions = (
    await sdk.GetRailgunTransactionsByTxid({ txid })
  ).transactions;

  const railgunTxidsForUnshields: string[] = transactions
    .filter(transaction => transaction.hasUnshield)
    .map(transaction => {
      const railgunTxid = getRailgunTransactionIDHex(transaction);
      return railgunTxid;
    });

  return railgunTxidsForUnshields;
};

export const getRailgunTransactionDataForUnshieldToAddress = async (
  chain: Chain,
  unshieldToAddress: string,
): Promise<
  {
    txid: string;
    transactionDatas: {
      railgunTransaction: RailgunTransactionV2;
      railgunTxid: string;
    }[];
  }[]
> => {
  const network = networkForChain(chain);
  if (!network) {
    return [];
  }

  const sdk = getBuiltGraphSDK(network.name);

  const transactions: GraphRailgunTransactions = (
    await sdk.GetRailgunTransactionsByUnshieldToAddress({
      address: unshieldToAddress,
    })
  ).transactions;
  const uniqueTxidMap = new Map<string, string[]>();
  const railgunTxidToTransactionMap = new Map<string, RailgunTransactionV2>();

  transactions
    .filter(transaction => transaction.hasUnshield)
    .forEach(transaction => {
      const railgunTxid = getRailgunTransactionIDHex(transaction);
      railgunTxidToTransactionMap.set(
        railgunTxid,
        formatRailgunTransactions([transaction])[0],
      );
      if (uniqueTxidMap.has(transaction.transactionHash)) {
        const railgunTxids = uniqueTxidMap.get(
          transaction.transactionHash,
        ) as string[];
        railgunTxids.push(railgunTxid);
        uniqueTxidMap.set(transaction.transactionHash, railgunTxids);
      } else {
        uniqueTxidMap.set(transaction.transactionHash, [railgunTxid]);
      }
    });
  const railgunTxidsForUnshields: {
    txid: string;
    transactionDatas: {
      railgunTransaction: RailgunTransactionV2;
      railgunTxid: string;
    }[];
  }[] = [];
  uniqueTxidMap.forEach((railgunTxids, txid) => {
    railgunTxidsForUnshields.push({
      txid,
      transactionDatas: railgunTxids.map(railgunTxid => {
        const railgunTransaction = railgunTxidToTransactionMap.get(railgunTxid);
        if (!railgunTransaction) {
          throw new Error(
            `Could not find railgun transaction for txid ${txid}`,
          );
        }
        return { railgunTransaction, railgunTxid };
      }),
    });
  });

  return railgunTxidsForUnshields;
};

export const getRailgunTransactionsForTxid = async (
  chain: Chain,
  txid: string,
): Promise<RailgunTransaction[]> => {
  const network = networkForChain(chain);
  if (!network) {
    return [];
  }

  const sdk = getBuiltGraphSDK(network.name);

  const railgunTransactions: GraphRailgunTransactions = (
    await sdk.GetRailgunTransactionsByTxid({ txid })
  ).transactions;

  const filteredRailgunTransactions: GraphRailgunTransactions =
    removeDuplicatesByID(railgunTransactions);

  const formattedRailgunTransactions: RailgunTransaction[] =
    formatRailgunTransactions(filteredRailgunTransactions);

  return formattedRailgunTransactions;
};

export const quickSyncRailgunTransactionsV2 = async (
  chain: Chain,
  latestGraphID: Optional<string>,
): Promise<RailgunTransactionV2[]> => {
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
        ).transactions,
      latestGraphID ?? '0x00',
    );

  const filteredRailgunTransactions: GraphRailgunTransactions =
    removeDuplicatesByID(railgunTransactions);

  const formattedRailgunTransactions: RailgunTransactionV2[] =
    formatRailgunTransactions(filteredRailgunTransactions);

  return formattedRailgunTransactions;
};

const autoPaginatingQuery = async <ReturnType extends { id: string }>(
  query: (id: string) => Promise<ReturnType[]>,
  id: string,
  prevResults: ReturnType[] = [],
): Promise<ReturnType[]> => {
  const newResults = await promiseTimeout(
    query(id),
    20000,
    new Error('Timeout querying Graph for QuickSync of RAILGUN-TXID Events'),
  );
  if (newResults.length === 0) {
    return prevResults;
  }

  const totalResults = prevResults.concat(newResults);

  const overLimit = totalResults.length >= MAX_QUERY_RESULTS;
  const lastResult = totalResults[totalResults.length - 1];

  const shouldQueryMore = newResults.length === 5000;
  // console.log("SHOULD QUERY MORE", shouldQueryMore, "OVER LIMIT", overLimit, "TOTAL RESULTS", totalResults.length)
  if (!overLimit && shouldQueryMore) {
    await delay(250);
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
  } catch (cause) {
    throw new Error(
      `ERROR getting mesh - if error includes "can't generate schema," make sure to check the filepaths for source schema imports in the built index file`,
      { cause },
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
