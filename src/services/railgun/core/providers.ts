import { NetworkName, isDefined } from '@railgun-community/shared-models';
import { FallbackProvider } from 'ethers';

export const fallbackProviderMap: MapType<FallbackProvider> = {};

export const getFallbackProviderForNetwork = (
  networkName: NetworkName,
): FallbackProvider => {
  const provider = fallbackProviderMap[networkName];
  if (!isDefined(provider)) {
    throw new Error(`Provider not yet loaded for network ${networkName}`);
  }
  return provider;
};

export const setFallbackProviderForNetwork = (
  networkName: NetworkName,
  provider: FallbackProvider,
): void => {
  fallbackProviderMap[networkName] = provider;
};
