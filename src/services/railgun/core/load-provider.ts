import {
  Chain,
  FallbackProviderJsonConfig,
  LoadProviderResponse,
  NETWORK_CONFIG,
  NetworkName,
  ProviderJson,
  TXIDVersion,
  createProviderFromJsonConfig,
  isDefined,
} from '@railgun-community/shared-models';
import { sendMessage } from '../../../utils';
import { reportAndSanitizeError } from '../../../utils/error';
import { WalletPOI } from '../../poi/wallet-poi';
import { getEngine } from './engine';
import {
  RailgunVersionedSmartContracts,
} from '@railgun-community/engine';
import { type Provider} from 'ethers'
import {
  providerMap,
  setProviderForNetwork,
} from './providers';
import { WalletPOINodeInterface } from '../../poi/wallet-poi-node-interface';

const createProviderForNetwork = async (
  networkName: NetworkName,
  providerJsonConfig: FallbackProviderJsonConfig | ProviderJson,
  pollingInterval?: number,
): Promise<Provider> => {
  const existingProvider = providerMap[networkName];
  if (existingProvider) {
    return existingProvider;
  }
  const provider = createProviderFromJsonConfig(
    providerJsonConfig,
    pollingInterval
  );
  setProviderForNetwork(networkName, provider);
  return provider;
};

/**
 * 
 * @param chain 
 * @param networkName 
 * @param fallbackProviderJsonConfig 
 * @param pollingInterval
 */
const loadProviderForNetwork = async (
  chain: Chain,
  networkName: NetworkName,
  providerJsonConfig: FallbackProviderJsonConfig | ProviderJson,
  pollingInterval: number,
) => {
  sendMessage(`Load provider for network: ${networkName}`);

  // Create the provider from the JSON config
  const provider = await createProviderForNetwork(
      networkName,
      providerJsonConfig,
      pollingInterval,
    );

  const network = NETWORK_CONFIG[networkName];
  const {
    proxyContract,
    relayAdaptContract,
    poseidonMerkleAccumulatorV3Contract,
    poseidonMerkleVerifierV3Contract,
    tokenVaultV3Contract,
    deploymentBlockPoseidonMerkleAccumulatorV3,
    deploymentBlock,
    publicName,
    poi,
    supportsV3,
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
    [TXIDVersion.V3_PoseidonMerkle]:
      deploymentBlockPoseidonMerkleAccumulatorV3 ?? 0,
  };

  // This function will set up the contracts for this chain.
  // Throws if provider does not respond.
  await engine.loadNetwork(
    chain,
    proxyContract,
    relayAdaptContract,
    poseidonMerkleAccumulatorV3Contract,
    poseidonMerkleVerifierV3Contract,
    tokenVaultV3Contract,
    provider, // Can be of type FallbackProvider, WebSocketProvider, or JsonRpcProvider
    undefined, // pollingProvider is being deprecated
    deploymentBlocks,
    poi?.launchBlock,
    supportsV3,
  );
};

/**
 * Note: The first provider listed in your fallback provider config is used as a polling provider
 * for new RAILGUN events (balance updates).
 */
export const loadProvider = async (
  providerJsonConfig: FallbackProviderJsonConfig | ProviderJson,
  networkName: NetworkName,
  /**
   * @deprecated pollingInterval - Default ethers polling interval is used
   */
  pollingInterval = 15000,
): Promise<LoadProviderResponse> => {
  try {
    delete providerMap[networkName];

    const { chain, supportsV3 } = NETWORK_CONFIG[networkName];
    if ('chainId' in providerJsonConfig && providerJsonConfig.chainId !== chain.id) {
      throw new Error('Invalid chain ID');
    }

    await loadProviderForNetwork(
      chain,
      networkName,
      providerJsonConfig,
      pollingInterval,
    );
    WalletPOINodeInterface.unpause(chain);
    const { shield: shieldFeeV2, unshield: unshieldFeeV2 } =
      await RailgunVersionedSmartContracts.fees(
        TXIDVersion.V2_PoseidonMerkle,
        chain,
      );

    if (supportsV3) {
      const { shield: shieldFeeV3, unshield: unshieldFeeV3 } =
        await RailgunVersionedSmartContracts.fees(
          TXIDVersion.V3_PoseidonMerkle,
          chain,
        );

      const feesSerialized = {
        shieldFeeV2: shieldFeeV2.toString(),
        unshieldFeeV2: unshieldFeeV2.toString(),
        shieldFeeV3: shieldFeeV3?.toString(),
        unshieldFeeV3: unshieldFeeV3?.toString(),
      };
      return { feesSerialized };
    }

    // Note: Shield and Unshield fees are in basis points.
    // NFT fee is in wei (though currently 0).
    const feesSerialized = {
      shieldFeeV2: shieldFeeV2.toString(),
      unshieldFeeV2: unshieldFeeV2.toString(),
      shieldFeeV3: undefined,
      unshieldFeeV3: undefined,
    };
    return { feesSerialized };
  } catch (err) {
    throw reportAndSanitizeError(loadProvider.name, err);
  }
};

export const unloadProvider = async (
  networkName: NetworkName,
): Promise<void> => {
  WalletPOINodeInterface.pause(NETWORK_CONFIG[networkName].chain);
  providerMap[networkName]?.destroy();
  delete providerMap[networkName];
};

export const pauseAllPollingProviders = (
  excludeNetworkName?: NetworkName,
): void => {
  Object.keys(providerMap).forEach(networkName => {
    if (networkName === excludeNetworkName) {
      return;
    }
    const provider = providerMap[networkName];

    // Check if provider exists
    if (!isDefined(provider)) {
      throw new Error(`No provider found for network: ${networkName}`);
    }

    // Ensure provider is a pausable provider
    if (!('paused' in provider && 'pause' in provider)) {
      throw new Error(
        `Provider for network ${networkName} is not a pausable provider`,
      );
    }

    // Safe to call pause() after type check
    (provider as { pause(): void }).pause();
  });
};

export const resumeIsolatedPollingProviderForNetwork = (
  networkName: NetworkName,
): void => {
  pauseAllPollingProviders(
    networkName, // excludeNetworkName
  );
  const provider = providerMap[networkName];

  // Check if provider exists
  if (!isDefined(provider)) {
    throw new Error(`No provider found for network: ${networkName}`);
  }

  // Ensure provider has resume functionality 
  if (!('paused' in provider && 'resume' in provider)) {
    throw new Error(
      `Provider for network ${networkName} is not a pausable provider`,
    );
  }

  // Safe to call resume() after type check
  (provider as { resume(): void }).resume();
};
