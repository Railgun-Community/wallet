import {
  Chain,
  FallbackProviderJsonConfig,
  LoadProviderResponse,
  NETWORK_CONFIG,
  NetworkName,
  TXIDVersion,
  createFallbackProviderFromJsonConfig,
  isDefined,
} from '@railgun-community/shared-models';
import { sendMessage } from '../../../utils';
import { reportAndSanitizeError } from '../../../utils/error';
import { WalletPOI } from '../../poi/wallet-poi';
import { getRailgunSmartWalletContractForNetwork } from './contracts';
import { getEngine } from './engine';
import {
  PollingJsonRpcProvider,
  createPollingJsonRpcProviderForListeners,
} from '@railgun-community/engine';
import { FallbackProvider } from 'ethers';
import {
  fallbackProviderMap,
  pollingProviderMap,
  setFallbackProviderForNetwork,
  setPollingProviderForNetwork,
} from './providers';

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
  const {
    proxyContract,
    relayAdaptContract,
    deploymentBlock,
    publicName,
    poi,
  } = network;
  if (!proxyContract) {
    throw new Error(`Could not find Proxy contract for network: ${publicName}`);
  }
  if (!relayAdaptContract) {
    throw new Error(
      `Could not find Relay Adapt contract for network: ${publicName}`,
    );
  }

  const engine = getEngine();
  if (!engine.isPOINode && isDefined(poi) && !WalletPOI.started) {
    throw new Error(
      'This network requires Proof Of Innocence. Pass "poiNodeURL" to startRailgunEngine to initialize POI before loading this provider.',
    );
  }

  const deploymentBlocks: Record<TXIDVersion, number> = {
    [TXIDVersion.V2_PoseidonMerkle]: deploymentBlock ?? 0,
  };

  // This function will set up the contracts for this chain.
  // Throws if provider does not respond.
  await engine.loadNetwork(
    chain,
    proxyContract,
    relayAdaptContract,
    fallbackProvider,
    pollingProvider,
    deploymentBlocks,
    poi?.launchBlock,
  );

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
