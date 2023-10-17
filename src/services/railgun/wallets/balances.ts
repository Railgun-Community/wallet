import { Chain } from '@railgun-community/engine';
import {
  RailgunBalanceRefreshTrigger,
  TXIDVersion,
} from '@railgun-community/shared-models';
import { reportAndSanitizeError } from '../../../utils/error';
import { getEngine } from '../core/engine';
import { walletForID } from './wallets';

export const refreshRailgunBalances: RailgunBalanceRefreshTrigger = async (
  txidVersion: TXIDVersion,
  chain: Chain,
  railgunWalletID: string,
  fullRescan: boolean,
  progressCallback?: (progress: number) => void,
): Promise<void> => {
  try {
    const wallet = walletForID(railgunWalletID);
    if (fullRescan) {
      await wallet.fullRescanBalances(txidVersion, chain, progressCallback);
    } else {
      await wallet.scanBalances(txidVersion, chain, progressCallback);
    }

    // Wallet will trigger .emit('scanned', {chain}) event when finished,
    // which calls `onBalancesUpdate` (balance-update.ts).

    // Also kick off a background merkletree scan.
    // This will also call wallet.scanBalances when it's done, but may take longer.
    // So the user will see balances refresh from existing merkletree first.
    const engine = getEngine();
    await engine.scanHistory(chain);
  } catch (err) {
    throw reportAndSanitizeError(refreshRailgunBalances.name, err);
  }
};

export const scanUpdatesForMerkletreeAndWallets = async (
  chain: Chain,
): Promise<void> => {
  try {
    const engine = getEngine();
    await engine.scanHistory(chain);

    // Wallet will trigger .emit('scanned', {chain}) event when finished,
    // which calls `onBalancesUpdate` (balance-update.ts).
  } catch (err) {
    throw reportAndSanitizeError(scanUpdatesForMerkletreeAndWallets.name, err);
  }
};

export const rescanFullUTXOMerkletreesAndWallets = async (
  chain: Chain,
): Promise<void> => {
  try {
    const engine = getEngine();
    await engine.fullRescanUTXOMerkletreesAndWallets(chain);

    // Wallet will trigger .emit('scanned', {chain}) event when finished,
    // which calls `onBalancesUpdate` (balance-update.ts).
  } catch (err) {
    throw reportAndSanitizeError(rescanFullUTXOMerkletreesAndWallets.name, err);
  }
};

export const resetFullTXIDMerkletrees = async (chain: Chain): Promise<void> => {
  try {
    const engine = getEngine();
    await engine.fullResetTXIDMerkletrees(chain);
  } catch (err) {
    throw reportAndSanitizeError(resetFullTXIDMerkletrees.name, err);
  }
};

export const fullRescanBalancesAllWallets = async (
  txidVersion: TXIDVersion,
  chain: Chain,
  progressCallback?: (progress: number) => void,
): Promise<void> => {
  const engine = getEngine();
  await engine.scanAllWallets(txidVersion, chain, progressCallback);
};
