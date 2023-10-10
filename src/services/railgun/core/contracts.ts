import {
  NetworkName,
  NETWORK_CONFIG,
  isDefined,
} from '@railgun-community/shared-models';
import { getEngine } from './engine';
import {
  RailgunSmartWalletContract,
  RelayAdaptContract,
} from '@railgun-community/engine';

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
