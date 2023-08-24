import {
  OFAC_SANCTIONS_LIST_ADDRESSES,
  isDefined,
} from '@railgun-community/shared-models';

export const isBlockedAddress = (address?: string): boolean => {
  if (!isDefined(address)) {
    return false;
  }
  if (OFAC_SANCTIONS_LIST_ADDRESSES.includes(address.toLowerCase())) {
    return true;
  }
  return false;
};

export const assertNotBlockedAddress = (address?: string) => {
  if (isBlockedAddress(address)) {
    throw new Error('Blocked address');
  }
};
