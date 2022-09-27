import { Chain } from '@railgun-community/engine/dist/models/engine-types';
import { ByteLength, nToHex } from '@railgun-community/engine/dist/utils/bytes';
import { AbstractWallet } from '@railgun-community/engine/dist/wallet/abstract-wallet';
import {
  RailgunBalancesEvent,
  RailgunShieldedTokenBalanceSerialized,
} from '@railgun-community/shared-models/dist/models/response-types';
import { sendMessage } from '../../../utils/logger';
import { parseRailgunBalanceAddress } from '../util/bytes-util';

export type BalancesUpdatedCallback = (
  balancesEvent: RailgunBalancesEvent,
) => void;

let onBalanceUpdateCallback: Optional<BalancesUpdatedCallback>;

export const setOnBalanceUpdateCallback = (
  callback?: BalancesUpdatedCallback,
) => {
  onBalanceUpdateCallback = callback;
};

export const onBalancesUpdate = async (
  wallet: AbstractWallet,
  chain: Chain,
): Promise<void> => {
  sendMessage(
    `Wallet balance SCANNED. Getting balances for chain ${chain.type}:${chain.id}.`,
  );
  if (!onBalanceUpdateCallback) {
    return;
  }

  const balances = await wallet.balances(chain);

  const tokenAddresses = Object.keys(balances);
  const tokenBalancesSerialized: RailgunShieldedTokenBalanceSerialized[] =
    tokenAddresses.map(railgunBalanceAddress => {
      return {
        tokenAddress: parseRailgunBalanceAddress(
          railgunBalanceAddress,
        ).toLowerCase(),
        balanceString: nToHex(
          balances[railgunBalanceAddress].balance,
          ByteLength.UINT_256,
          true,
        ),
      };
    });

  const balancesFormatted: RailgunBalancesEvent = {
    chain,
    tokenBalancesSerialized,
    railgunWalletID: wallet.id,
  };

  onBalanceUpdateCallback(balancesFormatted);
};
