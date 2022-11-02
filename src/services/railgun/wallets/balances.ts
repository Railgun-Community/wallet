import { Chain } from '@railgun-community/engine';
import {
  RailgunBalanceRefreshTrigger,
  RailgunBalanceResponse,
} from '@railgun-community/shared-models';
import { getEngine, walletForID } from '../core/engine';

export const refreshRailgunBalances: RailgunBalanceRefreshTrigger = async (
  chain: Chain,
  railgunWalletID: string,
  fullRescan: boolean,
  progressCallback?: (progress: number) => void,
): Promise<RailgunBalanceResponse> => {
  try {
    const wallet = walletForID(railgunWalletID);
    if (fullRescan) {
      await wallet.fullRescanBalances(chain, progressCallback);
    } else {
      await wallet.scanBalances(chain, progressCallback);
    }

    // Wallet will trigger .emit('scanned', {chain}) event when finished,
    // which calls `onBalancesUpdate` (balance-update.ts).

    // Also kick off a background merkletree scan.
    // This will also call wallet.scanBalances when it's done, but may take longer.
    // So the user will see balances refresh from existing merkletree first.
    const engine = getEngine();
    await engine.scanHistory(chain);

    return {};
  } catch (err: any) {
    const response: RailgunBalanceResponse = { error: err.message };
    return response;
  }
};

export const scanUpdatesForMerkletreeAndWallets = async (
  chain: Chain,
): Promise<RailgunBalanceResponse> => {
  try {
    const engine = getEngine();
    await engine.scanHistory(chain);

    // Wallet will trigger .emit('scanned', {chain}) event when finished,
    // which calls `onBalancesUpdate` (balance-update.ts).
    return {};
  } catch (err: any) {
    const response: RailgunBalanceResponse = { error: err.message };
    return response;
  }
};

export const rescanFullMerkletreesAndWallets = async (
  chain: Chain,
): Promise<RailgunBalanceResponse> => {
  try {
    const engine = getEngine();
    await engine.fullRescanMerkletreesAndWallets(chain);

    // Wallet will trigger .emit('scanned', {chain}) event when finished,
    // which calls `onBalancesUpdate` (balance-update.ts).
    return {};
  } catch (err: any) {
    const response: RailgunBalanceResponse = { error: err.message };
    return response;
  }
};

export const fullRescanBalancesAllWallets = async (
  chain: Chain,
  progressCallback?: (progress: number) => void,
): Promise<void> => {
  const engine = getEngine();
  await engine.scanAllWallets(chain, progressCallback);
};
