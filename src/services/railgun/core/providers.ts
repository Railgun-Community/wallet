import { NetworkName, isDefined } from '@railgun-community/shared-models';
import { PollingJsonRpcProvider } from '@railgun-community/engine';
import { FallbackProvider } from 'ethers';

export const fallbackProviderMap: MapType<FallbackProvider> = {};
export const pollingProviderMap: MapType<PollingJsonRpcProvider> = {};

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
