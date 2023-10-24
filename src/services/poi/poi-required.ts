import {
  NETWORK_CONFIG,
  NetworkName,
  isDefined,
} from '@railgun-community/shared-models';
import { getFallbackProviderForNetwork } from '../railgun/core/providers';
import { POI } from '@railgun-community/engine';

export class POIRequired {
  private static requiredForNetwork: Partial<Record<NetworkName, boolean>> = {};

  static async isRequiredForNetwork(
    networkName: NetworkName,
  ): Promise<boolean> {
    if (isDefined(this.requiredForNetwork[networkName])) {
      return this.requiredForNetwork[networkName] as boolean;
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
    if (blockNumber + 10000 < poi.launchBlock) {
      // Launches in at least 10k blocks.
      this.requiredForNetwork[networkName] = false;
    }
    return isRequired;
  }

  static async getRequiredListKeys(networkName: NetworkName) {
    if (!(await this.isRequiredForNetwork(networkName))) {
      return [];
    }
    return POI.getActiveListKeys();
  }
}
