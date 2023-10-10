import {
  NETWORK_CONFIG,
  NetworkName,
  isDefined,
} from '@railgun-community/shared-models';
import { getFallbackProviderForNetwork } from '../railgun/core/providers';

export class POIRequired {
  private static requiredForNetwork: Partial<Record<NetworkName, boolean>>;

  static async isRequiredForNetwork(
    networkName: NetworkName,
  ): Promise<boolean> {
    if (this.requiredForNetwork[networkName] === true) {
      return true;
    }

    const { poi } = NETWORK_CONFIG[networkName];
    if (!isDefined(poi)) {
      return false;
    }

    const provider = getFallbackProviderForNetwork(networkName);
    const blockNumber = await provider.getBlockNumber();

    const isRequired = poi.launchBlock < blockNumber;
    if (isRequired) {
      this.requiredForNetwork[networkName] = true;
    }
    return isRequired;
  }
}
