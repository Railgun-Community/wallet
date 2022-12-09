import { BigNumber } from '@ethersproject/bignumber';
import {
  Chain,
  ByteLength,
  nToHex,
  AbstractWallet,
  TokenType,
  Balances,
} from '@railgun-community/engine';
import {
  RailgunBalancesEvent,
  RailgunNFT,
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

const getSerializedTokenBalances = (
  balances: Balances,
): RailgunShieldedTokenBalanceSerialized[] => {
  const tokenHashes = Object.keys(balances);

  return tokenHashes
    .filter(tokenHash => {
      return balances[tokenHash].tokenData.tokenType === TokenType.ERC20;
    })
    .map(railgunBalanceAddress => {
      const erc20Balance: RailgunShieldedTokenBalanceSerialized = {
        tokenAddress: parseRailgunBalanceAddress(
          balances[railgunBalanceAddress].tokenData.tokenAddress,
        ).toLowerCase(),
        balanceString: nToHex(
          balances[railgunBalanceAddress].balance,
          ByteLength.UINT_256,
          true,
        ),
      };
      return erc20Balance;
    });
};

const getNFTs = (balances: Balances): RailgunNFT[] => {
  const tokenHashes = Object.keys(balances);

  return tokenHashes
    .filter(tokenHash => {
      return (
        [TokenType.ERC721, TokenType.ERC1155].includes(
          balances[tokenHash].tokenData.tokenType,
        ) && balances[tokenHash].balance > BigInt(0)
      );
    })
    .map(tokenHash => {
      const tokenData = balances[tokenHash].tokenData;

      const nftBalance: RailgunNFT = {
        nftAddress: parseRailgunBalanceAddress(
          tokenData.tokenAddress,
        ).toLowerCase(),
        nftTokenType: tokenData.tokenType as 1 | 2,
        tokenSubID: tokenData.tokenSubID,
      };
      return nftBalance;
    });
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
  const tokenBalances = getSerializedTokenBalances(balances);
  const nfts = getNFTs(balances);

  const balancesEvent: RailgunBalancesEvent = {
    chain,
    tokenBalances,
    nfts,
    railgunWalletID: wallet.id,
  };

  onBalanceUpdateCallback(balancesEvent);
};

export const balanceForERC20Token = async (
  wallet: AbstractWallet,
  chain: Chain,
  tokenAddress: string,
): Promise<Optional<BigNumber>> => {
  const balances = await wallet.balances(chain);
  const tokenBalances = getSerializedTokenBalances(balances);

  const matchingTokenBalance: Optional<RailgunShieldedTokenBalanceSerialized> =
    tokenBalances.find(
      tokenBalance => tokenBalance.tokenAddress === tokenAddress,
    );

  if (!matchingTokenBalance) {
    return undefined;
  }

  return BigNumber.from(matchingTokenBalance.balanceString);
};
