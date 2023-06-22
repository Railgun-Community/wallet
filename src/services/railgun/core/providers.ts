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

const fallbackProviderMap: MapType<FallbackProvider> = {};
const pollingProviderMap: MapType<PollingJsonRpcProvider> = {};

export const getProviderForNetwork = (
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

export const setProviderForNetwork = (
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

export const getMerkleTreeForNetwork = (networkName: NetworkName) => {
  const network = NETWORK_CONFIG[networkName];
  const { chain } = network;
  const merkleTree = getEngine().merkletrees[chain.type][chain.id];
  if (!isDefined(merkleTree)) {
    throw new Error(
      `MerkleTree not yet loaded for network ${network.publicName}`,
    );
  }
  return merkleTree;
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

const loadProviderForNetwork = async (
  chain: Chain,
  networkName: NetworkName,
  fallbackProviderJsonConfig: FallbackProviderJsonConfig,
  pollingInterval: number,
) => {
  sendMessage(`Load provider for network: ${networkName}`);
  const fallbackProvider = createFallbackProviderFromJsonConfig(
    fallbackProviderJsonConfig,
  );
  const pollingProvider = await createPollingJsonRpcProviderForListeners(
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

  setProviderForNetwork(networkName, fallbackProvider);
  setPollingProviderForNetwork(networkName, pollingProvider);

  // NOTE: This is an async call, but we need not await.
  // Let Engine scan events in the background.
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  engine.scanHistory(chain);
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

    const { chain } = NETWORK_CONFIG[networkName];
    if (fallbackProviderJsonConfig.chainId !== chain.id) {
      throw new Error('Invalid chain ID');
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

export const pauseAllProviders = (excludeNetworkName?: NetworkName): void => {
  Object.keys(fallbackProviderMap).forEach(networkName => {
    if (networkName === excludeNetworkName) {
      return;
    }
    const provider = fallbackProviderMap[networkName];
    if (!provider?.paused) {
      provider.pause();
    }
    const pollingProvider = pollingProviderMap[networkName];
    if (!pollingProvider?.paused) {
      pollingProvider.pause();
    }
  });
};

export const resumeIsolatedProviderForNetwork = (
  networkName: NetworkName,
): void => {
  pauseAllProviders(
    networkName, // excludeNetworkName
  );
  if (fallbackProviderMap[networkName]?.paused) {
    fallbackProviderMap[networkName].resume();
  }
  if (pollingProviderMap[networkName]?.paused) {
    pollingProviderMap[networkName].resume();
  }
};
