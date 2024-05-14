import { Chain } from '@railgun-community/engine';
import { TXIDVersion } from '@railgun-community/shared-models';
import { reportAndSanitizeError } from '../../../utils/error';
import { getEngine } from '../core/engine';

export const refreshBalances = async (
  chain: Chain,
  walletIdFilter: Optional<string[]>,
): Promise<void> => {
  try {
    // Wallet will trigger .emit('scanned', {chain}) event when finished,
    // which calls `onBalancesUpdate` (balance-update.ts).

    // Kick off a background merkletree scan.
    // This will call wallet.scanBalances when it's done, but may take some time.

    const engine = getEngine();
    await engine.scanContractHistory(chain, walletIdFilter);
  } catch (err) {
    throw reportAndSanitizeError(refreshBalances.name, err);
  }
};

export const rescanFullUTXOMerkletreesAndWallets = async (
  chain: Chain,
  walletIdFilter: Optional<string[]>,
): Promise<void> => {
  try {
    const engine = getEngine();
    await engine.fullRescanUTXOMerkletreesAndWallets(chain, walletIdFilter);

    // Wallet will trigger .emit('scanned', {chain}) event when finished,
    // which calls `onBalancesUpdate` (balance-update.ts).
  } catch (err) {
    throw reportAndSanitizeError(rescanFullUTXOMerkletreesAndWallets.name, err);
  }
};

export const resetFullTXIDMerkletreesV2 = async (
  chain: Chain,
): Promise<void> => {
  try {
    const engine = getEngine();
    await engine.fullResetTXIDMerkletreesV2(chain);
  } catch (err) {
    throw reportAndSanitizeError(resetFullTXIDMerkletreesV2.name, err);
  }
};
