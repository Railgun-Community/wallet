import { BigNumber } from '@ethersproject/bignumber';
import {
  Chain,
  ByteLength,
  nToHex,
  AbstractWallet,
} from '@railgun-community/engine';
import {
  RailgunBalancesEvent,
  RailgunShieldedTokenBalanceSerialized,
} from '@railgun-community/shared-models';
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

const getSerializedBalances = async (wallet: AbstractWallet, chain: Chain) => {
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

  return tokenBalancesSerialized;
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

  const tokenBalancesSerialized: RailgunShieldedTokenBalanceSerialized[] =
    await getSerializedBalances(wallet, chain);

  const balancesEvent: RailgunBalancesEvent = {
    chain,
    tokenBalancesSerialized,
    railgunWalletID: wallet.id,
  };

  onBalanceUpdateCallback(balancesEvent);
};

export const balanceForToken = async (
  wallet: AbstractWallet,
  chain: Chain,
  tokenAddress: string,
): Promise<Optional<BigNumber>> => {
  const tokenBalancesSerialized: RailgunShieldedTokenBalanceSerialized[] =
    await getSerializedBalances(wallet, chain);

  const matchingTokenBalance: Optional<RailgunShieldedTokenBalanceSerialized> =
    tokenBalancesSerialized.find(
      tokenBalance => tokenBalance.tokenAddress.toLowerCase() === tokenAddress,
    );

  if (!matchingTokenBalance) {
    return undefined;
  }

  return BigNumber.from(matchingTokenBalance.balanceString);
};
