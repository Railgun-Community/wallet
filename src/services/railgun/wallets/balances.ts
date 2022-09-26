import { Chain } from '@railgun-community/lepton/dist/models/lepton-types';
import { RailgunBalanceRefreshTrigger } from '@railgun-community/shared-models/dist/models/function-types';
import { RailgunBalanceResponse } from '@railgun-community/shared-models/dist/models/response-types';
import { getEngine, walletForID } from '../core/engine';

export const refreshRailgunBalances: RailgunBalanceRefreshTrigger = async (
  chain: Chain,
  railgunWalletID: string,
  fullRescan: boolean,
): Promise<RailgunBalanceResponse> => {
  try {
    const wallet = walletForID(railgunWalletID);
    if (fullRescan) {
      await wallet.fullRescanBalances(chain);
    } else {
      await wallet.scanBalances(chain);
    }

    // Wallet will trigger .emit('scanned', {chain}) event when finished,
    // which calls `onBalancesUpdate` (balance-update.ts).
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
): Promise<void> => {
  const lepton = getEngine();
  const wallets = Object.values(lepton.wallets);
  if (!wallets.length) {
    throw new Error(
      'Cannot rescan all wallet balances - no wallets loaded for Lepton.',
    );
  }
  await Promise.all(wallets.map(wallet => wallet.fullRescanBalances(chain)));
};
