import { NetworkName, isDefined } from '@railgun-community/shared-models';
import { Provider } from 'ethers';

export const providerMap: MapType<Provider> = {};

export const getProviderForNetwork = (
  networkName: NetworkName,
): Provider => {
  const provider = providerMap[networkName];
  if (!isDefined(provider)) {
    throw new Error(`Provider not yet loaded for network ${networkName}`);
  }
  return provider;
};

export const setProviderForNetwork = (
  networkName: NetworkName,
  provider: Provider,
): void => {
  providerMap[networkName] = provider;
};
