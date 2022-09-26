import { BaseProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import {
  FallbackProviderJsonConfig,
  createFallbackProviderFromJsonConfig,
} from '@railgun-community/shared-models/dist/models/fallback-provider';
import {
  NetworkName,
  NETWORK_CONFIG,
} from '@railgun-community/shared-models/dist/models/network-config';
import { LoadProviderResponse } from '@railgun-community/shared-models/dist/models/response-types';
import { sanitizeError } from '@railgun-community/shared-models/dist/utils/error';
import { sendMessage, sendErrorMessage } from '../../../utils/logger';
import { getEngine } from './engine';
import { RailgunProxyContract } from '@railgun-community/lepton/dist/contracts/railgun-proxy';
import { RelayAdaptContract } from '@railgun-community/lepton/dist/contracts/relay-adapt';
import { Chain } from '@railgun-community/lepton/dist/models/lepton-types';

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

export const getProxyContractForNetwork = (
  networkName: NetworkName,
): RailgunProxyContract => {
  const network = NETWORK_CONFIG[networkName];
  const { chain } = network;
  const proxyContract = getEngine().proxyContracts[chain.type][chain.id];
  if (!proxyContract) {
    throw new Error(
      `Proxy contract not yet loaded for network ${network.publicName}`,
    );
  }
  return proxyContract;
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

  // NOTE: This is an async call, but we need not await.
  // Let Lepton load network and scan events in the background.
  // The synchronous start of this function will set `lepton.contracts` for this chain.
  getEngine().loadNetwork(
    chain,
    proxyContract,
    relayAdaptContract,
    provider,
    deploymentBlock ?? 0,
  );
  providerMap[networkName] = provider;
};

export const loadProvider = async (
  fallbackProviderJsonConfig: FallbackProviderJsonConfig,
  networkName: NetworkName,
  shouldDebug: boolean,
) => {
  try {
    if (!providerMap[networkName]) {
      // NOTE: This is an async call, but we need not await.
      // Let the Engine load in the background.
      const { chain } = NETWORK_CONFIG[networkName];
      loadProviderForNetwork(
        chain,
        networkName,
        fallbackProviderJsonConfig,
        shouldDebug,
      );
    }

    const contract = getProxyContractForNetwork(networkName);

    // Returned as Hex strings.
    const { deposit, withdraw, nft } = await contract.fees();

    // Note: Deposit and Withdraw fees are in basis points.
    //  NFT fee is in wei.
    const feesSerialized = {
      deposit: BigNumber.from(deposit).toHexString(),
      withdraw: BigNumber.from(withdraw).toHexString(),
      nft: BigNumber.from(nft).toHexString(),
    };

    const response: LoadProviderResponse = {
      feesSerialized,
    };
    return response;
  } catch (err) {
    sendErrorMessage(err.stack);
    const sanitizedError = sanitizeError(err);
    const response: LoadProviderResponse = { error: sanitizedError.message };
    return response;
  }
};
