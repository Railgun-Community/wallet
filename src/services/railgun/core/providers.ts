import {
  FallbackProviderJsonConfig,
  createFallbackProviderFromJsonConfig,
  NetworkName,
  NETWORK_CONFIG,
  LoadProviderResponse,
  isDefined,
} from '@railgun-community/shared-models';
import { sendMessage } from '../../../utils/logger';
import { getEngine } from './engine';
import {
  Chain,
  RailgunSmartWalletContract,
  RelayAdaptContract,
  PollingJsonRpcProvider,
  createPollingJsonRpcProviderForListeners,
} from '@railgun-community/engine';
import { reportAndSanitizeError } from '../../../utils/error';
import { FallbackProvider } from 'ethers';
import { WalletPOI } from '../../poi/wallet-poi';

const fallbackProviderMap: MapType<FallbackProvider> = {};
const pollingProviderMap: MapType<PollingJsonRpcProvider> = {};

export const getFallbackProviderForNetwork = (
  networkName: NetworkName,
): FallbackProvider => {
  const provider = fallbackProviderMap[networkName];
  if (!isDefined(provider)) {
    throw new Error(`Provider not yet loaded for network ${networkName}`);
  }
  return provider;
};

export const getPollingProviderForNetwork = (
  networkName: NetworkName,
): PollingJsonRpcProvider => {
  const provider = pollingProviderMap[networkName];
  if (!isDefined(provider)) {
    throw new Error(
      `Polling provider not yet loaded for network ${networkName}`,
    );
  }
  return provider;
};

export const setFallbackProviderForNetwork = (
  networkName: NetworkName,
  provider: FallbackProvider,
): void => {
  fallbackProviderMap[networkName] = provider;
};

export const setPollingProviderForNetwork = (
  networkName: NetworkName,
  provider: PollingJsonRpcProvider,
): void => {
  pollingProviderMap[networkName] = provider;
};

export const getUTXOMerkletreeForNetwork = (networkName: NetworkName) => {
  const network = NETWORK_CONFIG[networkName];
  const { chain } = network;
  const utxoMerkletree = getEngine().utxoMerkletrees[chain.type][chain.id];
  if (!isDefined(utxoMerkletree)) {
    throw new Error(
      `MerkleTree not yet loaded for network ${network.publicName}`,
    );
  }
  return utxoMerkletree;
};

export const getRailgunSmartWalletContractForNetwork = (
  networkName: NetworkName,
): RailgunSmartWalletContract => {
  const network = NETWORK_CONFIG[networkName];
  const { chain } = network;
  const railgunSmartWalletContract =
    getEngine().railgunSmartWalletContracts[chain.type][chain.id];
  if (!isDefined(railgunSmartWalletContract)) {
    throw new Error(
      `RailgunSmartWallet contract not yet loaded for network ${network.publicName}`,
    );
  }
  return railgunSmartWalletContract;
};

export const getRelayAdaptContractForNetwork = (
  networkName: NetworkName,
): RelayAdaptContract => {
  const network = NETWORK_CONFIG[networkName];
  const { chain } = network;
  const relayAdaptContract =
    getEngine().relayAdaptContracts[chain.type][chain.id];
  if (!isDefined(relayAdaptContract)) {
    throw new Error(
      `Relay Adapt contract not yet loaded for network ${network.publicName}`,
    );
  }
  return relayAdaptContract;
};

const createFallbackProviderForNetwork = async (
  networkName: NetworkName,
  fallbackProviderJsonConfig: FallbackProviderJsonConfig,
): Promise<FallbackProvider> => {
  const existingProvider = fallbackProviderMap[networkName];
  if (existingProvider) {
    return existingProvider;
  }
  const fallbackProvider = createFallbackProviderFromJsonConfig(
    fallbackProviderJsonConfig,
  );
  setFallbackProviderForNetwork(networkName, fallbackProvider);
  return fallbackProvider;
};

const createPollingProviderForNetwork = async (
  networkName: NetworkName,
  fallbackProvider: FallbackProvider,
  pollingInterval: number,
): Promise<PollingJsonRpcProvider> => {
  const existingProvider = pollingProviderMap[networkName];
  if (existingProvider) {
    return existingProvider;
  }
  const pollingProvider = await createPollingJsonRpcProviderForListeners(
    fallbackProvider,
    pollingInterval,
  );
  setPollingProviderForNetwork(networkName, pollingProvider);
  return pollingProvider;
};

const loadProviderForNetwork = async (
  chain: Chain,
  networkName: NetworkName,
  fallbackProviderJsonConfig: FallbackProviderJsonConfig,
  pollingInterval: number,
) => {
  sendMessage(`Load provider for network: ${networkName}`);

  const fallbackProvider = await createFallbackProviderForNetwork(
    networkName,
    fallbackProviderJsonConfig,
  );
  const pollingProvider = await createPollingProviderForNetwork(
    networkName,
    fallbackProvider,
    pollingInterval,
  );

  const network = NETWORK_CONFIG[networkName];
  const { proxyContract, relayAdaptContract, deploymentBlock, publicName } =
    network;
  if (!proxyContract) {
    throw new Error(`Could not find Proxy contract for network: ${publicName}`);
  }
  if (!relayAdaptContract) {
    throw new Error(
      `Could not find Relay Adapt contract for network: ${publicName}`,
    );
  }

  const engine = getEngine();

  // This function will set up the contracts for this chain.
  // Throws if provider does not respond.
  await engine.loadNetwork(
    chain,
    proxyContract,
    relayAdaptContract,
    fallbackProvider,
    pollingProvider,
    deploymentBlock ?? 0,
  );

  // NOTE: These are async calls, but we need not await.
  // Let Engine scan events in the background.
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  engine.scanHistory(chain);

  if (isDefined(NETWORK_CONFIG[networkName].poi)) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    engine.startSyncRailgunTransactionsPoller(chain);
  }
};

/**
 * Note: The first provider listed in your fallback provider config is used as a polling provider
 * for new RAILGUN events (balance updates).
 */
export const loadProvider = async (
  fallbackProviderJsonConfig: FallbackProviderJsonConfig,
  networkName: NetworkName,
  pollingInterval = 15000,
): Promise<LoadProviderResponse> => {
  try {
    delete fallbackProviderMap[networkName];

    const { chain, poi } = NETWORK_CONFIG[networkName];
    if (fallbackProviderJsonConfig.chainId !== chain.id) {
      throw new Error('Invalid chain ID');
    }
    const engine = getEngine();
    if (!engine.isPOINode && isDefined(poi) && !WalletPOI.started) {
      throw new Error(
        'This network requires Proof Of Innocence. Pass "poiNodeURL" to startRailgunEngine to initialize POI before loading this provider.',
      );
    }

    await loadProviderForNetwork(
      chain,
      networkName,
      fallbackProviderJsonConfig,
      pollingInterval,
    );

    const railgunSmartWalletContract =
      getRailgunSmartWalletContractForNetwork(networkName);

    const { shield, unshield, nft } = await railgunSmartWalletContract.fees();

    // Note: Shield and Unshield fees are in basis points.
    // NFT fee is in wei (though currently 0).
    const feesSerialized = {
      shield: shield.toString(),
      unshield: unshield.toString(),
      nft: nft.toString(),
    };

    return { feesSerialized };
  } catch (err) {
    throw reportAndSanitizeError(loadProvider.name, err);
  }
};

export const unloadProvider = async (
  networkName: NetworkName,
): Promise<void> => {
  await fallbackProviderMap[networkName]?.destroy();
  pollingProviderMap[networkName]?.destroy();
  delete fallbackProviderMap[networkName];
  delete pollingProviderMap[networkName];
};

export const pauseAllPollingProviders = (
  excludeNetworkName?: NetworkName,
): void => {
  Object.keys(pollingProviderMap).forEach(networkName => {
    if (networkName === excludeNetworkName) {
      return;
    }
    const pollingProvider = pollingProviderMap[networkName];
    if (isDefined(pollingProvider) && !pollingProvider.paused) {
      pollingProvider.pause();
    }
  });
};

export const resumeIsolatedPollingProviderForNetwork = (
  networkName: NetworkName,
): void => {
  pauseAllPollingProviders(
    networkName, // excludeNetworkName
  );
  const pollingProviderForNetwork = pollingProviderMap[networkName];
  if (
    isDefined(pollingProviderForNetwork) &&
    pollingProviderForNetwork.paused
  ) {
    pollingProviderForNetwork.resume();
  }
};
