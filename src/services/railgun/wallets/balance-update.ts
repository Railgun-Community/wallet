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
  RailgunNFTAmount,
  RailgunERC20Amount,
  NetworkName,
  NETWORK_CONFIG,
} from '@railgun-community/shared-models';
import { sendMessage } from '../../../utils/logger';
import { parseRailgunTokenAddress } from '../util/bytes';

export type BalancesUpdatedCallback = (
  balancesEvent: RailgunBalancesEvent,
) => void;

let onBalanceUpdateCallback: Optional<BalancesUpdatedCallback>;

export const setOnBalanceUpdateCallback = (
  callback?: BalancesUpdatedCallback,
) => {
  onBalanceUpdateCallback = callback;
};

const getSerializedERC20Balances = (
  balances: Balances,
): RailgunERC20Amount[] => {
  const tokenHashes = Object.keys(balances);

  return tokenHashes
    .filter(tokenHash => {
      return balances[tokenHash].tokenData.tokenType === TokenType.ERC20;
    })
    .map(railgunBalanceAddress => {
      const erc20Balance: RailgunERC20Amount = {
        tokenAddress: parseRailgunTokenAddress(
          balances[railgunBalanceAddress].tokenData.tokenAddress,
        ).toLowerCase(),
        amountString: nToHex(
          balances[railgunBalanceAddress].balance,
          ByteLength.UINT_256,
          true,
        ),
      };
      return erc20Balance;
    });
};

const getNFTBalances = (balances: Balances): RailgunNFTAmount[] => {
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

      const nftBalance: RailgunNFTAmount = {
        nftAddress: parseRailgunTokenAddress(
          tokenData.tokenAddress,
        ).toLowerCase(),
        nftTokenType: tokenData.tokenType as 1 | 2,
        tokenSubID: tokenData.tokenSubID,
        amountString: nToHex(
          balances[tokenHash].balance,
          ByteLength.UINT_256,
          true,
        ),
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
  const erc20Amounts = getSerializedERC20Balances(balances);
  const nftAmounts = getNFTBalances(balances);

  const balancesEvent: RailgunBalancesEvent = {
    chain,
    erc20Amounts,
    nftAmounts,
    railgunWalletID: wallet.id,
  };

  onBalanceUpdateCallback(balancesEvent);
};

export const balanceForERC20Token = async (
  wallet: AbstractWallet,
  networkName: NetworkName,
  tokenAddress: string,
): Promise<BigNumber> => {
  const { chain } = NETWORK_CONFIG[networkName];
  const balances = await wallet.balances(chain);
  const tokenBalances = getSerializedERC20Balances(balances);

  const matchingTokenBalance: Optional<RailgunERC20Amount> = tokenBalances.find(
    tokenBalance =>
      tokenBalance.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
  );
  if (!matchingTokenBalance) {
    return BigNumber.from(0);
  }

  return BigNumber.from(matchingTokenBalance.amountString);
};
