import { OFAC_TORNADO_CASH_SANCTIONS_LIST_ETH_ADDRESS } from '@railgun-community/shared-models';

export const isBlockedAddress = (address?: string): boolean => {
  if (!address) {
    return false;
  }
  if (
    OFAC_TORNADO_CASH_SANCTIONS_LIST_ETH_ADDRESS.includes(address.toLowerCase())
  ) {
    return true;
  }
  return false;
};

export const assertNotBlockedAddress = (address?: string) => {
  if (isBlockedAddress(address)) {
    throw new Error('Blocked address');
  }
};
