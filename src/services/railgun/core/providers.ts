import { BaseProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import {
  FallbackProviderJsonConfig,
  createFallbackProviderFromJsonConfig,
  NetworkName,
  NETWORK_CONFIG,
  LoadProviderResponse,
} from '@railgun-community/shared-models';
import { sendMessage } from '../../../utils/logger';
import { getEngine } from './engine';
import {
  Chain,
  RailgunSmartWalletContract,
  RelayAdaptContract,
} from '@railgun-community/engine';
import { reportAndSanitizeError } from '../../../utils/error';

const providerMap: MapType<BaseProvider> = {};
export const getProviderForNetwork = (
  networkName: NetworkName,
): BaseProvider => {
  const provider = providerMap[networkName];
  if (!provider) {
    throw new Error(`Provider not yet loaded for network ${networkName}`);
  }
  return provider;
};

export const setProviderForNetwork = (
  networkName: NetworkName,
  provider: BaseProvider,
): void => {
  providerMap[networkName] = provider;
};

export const getMerkleTreeForNetwork = (networkName: NetworkName) => {
  const network = NETWORK_CONFIG[networkName];
  const { chain } = network;
  const merkleTree = getEngine().merkletrees[chain.type][chain.id];
  if (!merkleTree) {
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
  if (!railgunSmartWalletContract) {
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
  if (!relayAdaptContract) {
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
  shouldDebug: boolean,
) => {
  sendMessage(`Load provider for network: ${networkName}`);
  const provider = createFallbackProviderFromJsonConfig(
    fallbackProviderJsonConfig,
    shouldDebug ? sendMessage : undefined,
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
    provider,
    deploymentBlock ?? 0,
  );

  setProviderForNetwork(networkName, provider);

  // NOTE: This is an async call, but we need not await.
  // Let Engine scan events in the background.
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  engine.scanHistory(chain);
};

export const loadProvider = async (
  fallbackProviderJsonConfig: FallbackProviderJsonConfig,
  networkName: NetworkName,
  shouldDebug: boolean,
): Promise<LoadProviderResponse> => {
  try {
    delete providerMap[networkName];

    const { chain } = NETWORK_CONFIG[networkName];
    await loadProviderForNetwork(
      chain,
      networkName,
      fallbackProviderJsonConfig,
      shouldDebug,
    );

    const railgunSmartWalletContract =
      getRailgunSmartWalletContractForNetwork(networkName);

    // Returned as Hex strings.
    const { shield, unshield, nft } = await railgunSmartWalletContract.fees();

    // Note: Shield and Unshield fees are in basis points.
    //  NFT fee is in wei.
    const feesSerialized = {
      shield: BigNumber.from(shield).toHexString(),
      unshield: BigNumber.from(unshield).toHexString(),
      nft: BigNumber.from(nft).toHexString(),
    };

    return { feesSerialized };
  } catch (err) {
    throw reportAndSanitizeError(loadProvider.name, err);
  }
};
