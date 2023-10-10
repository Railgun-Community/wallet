import {
  Chain,
  AbstractWallet,
  TokenType,
  EngineEvent,
  WalletScannedEventData,
  TokenBalances,
  NFTTokenData,
  getTokenDataHash,
  getTokenDataNFT,
  getTokenDataERC20,
} from '@railgun-community/engine';
import {
  RailgunBalancesEvent,
  POIProofProgressEvent,
  RailgunNFTAmount,
  RailgunERC20Amount,
  NetworkName,
  NETWORK_CONFIG,
  TXIDVersion,
  NFTTokenType,
} from '@railgun-community/shared-models';
import { sendMessage } from '../../../utils/logger';
import { parseRailgunTokenAddress } from '../util/bytes';
import { walletForID } from '../core';

export type BalancesUpdatedCallback = (
  balancesEvent: RailgunBalancesEvent,
) => void;

let onBalanceUpdateCallback: Optional<BalancesUpdatedCallback>;

export const setOnBalanceUpdateCallback = (
  callback?: BalancesUpdatedCallback,
) => {
  onBalanceUpdateCallback = callback;
};

export type POIProofProgressCallback = (
  poiProofProgressEvent: POIProofProgressEvent,
) => void;

let onWalletPOIProofProgressCallback: Optional<POIProofProgressCallback>;

export const setOnWalletPOIProofProgressCallback = (
  callback?: POIProofProgressCallback,
) => {
  onWalletPOIProofProgressCallback = callback;
};

const getSerializedERC20Balances = (
  balances: TokenBalances,
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
        amount: balances[railgunBalanceAddress].balance,
      };
      return erc20Balance;
    });
};

const getSerializedNFTBalances = (
  balances: TokenBalances,
): RailgunNFTAmount[] => {
  const tokenHashes = Object.keys(balances);

  return tokenHashes
    .filter(tokenHash => {
      return [TokenType.ERC721, TokenType.ERC1155].includes(
        balances[tokenHash].tokenData.tokenType,
      );
    })
    .map(railgunBalanceAddress => {
      const balanceForToken = balances[railgunBalanceAddress];
      const tokenData = balanceForToken.tokenData;
      const nftBalance: RailgunNFTAmount = {
        nftAddress: parseRailgunTokenAddress(
          tokenData.tokenAddress,
        ).toLowerCase(),
        tokenSubID: tokenData.tokenSubID,
        nftTokenType: tokenData.tokenType as 1 | 2,
        amount: balanceForToken.balance,
      };
      return nftBalance;
    });
};

const getNFTBalances = (balances: TokenBalances): RailgunNFTAmount[] => {
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
        amount: balances[tokenHash].balance,
      };
      return nftBalance;
    });
};

export const onBalancesUpdate = async (
  txidVersion: TXIDVersion,
  wallet: AbstractWallet,
  chain: Chain,
): Promise<void> => {
  sendMessage(
    `Wallet balance SCANNED. Getting balances for chain ${chain.type}:${chain.id}.`,
  );
  if (!onBalanceUpdateCallback) {
    return;
  }

  const tokenBalances = await wallet.getTokenBalances(
    txidVersion,
    chain,
    false, // onlySpendable
  );
  const erc20Amounts = getSerializedERC20Balances(tokenBalances);
  const nftAmounts = getNFTBalances(tokenBalances);

  const balancesEvent: RailgunBalancesEvent = {
    txidVersion,
    chain,
    erc20Amounts,
    nftAmounts,
    railgunWalletID: wallet.id,
  };

  onBalanceUpdateCallback(balancesEvent);
};

export const onWalletPOIProofProgress = (
  txidVersion: TXIDVersion,
  wallet: AbstractWallet,
  chain: Chain,
  progress: number,
  listKey: string,
  txid: string,
  railgunTxid: string,
  index: number,
  totalCount: number,
): void => {
  sendMessage(`Wallet POI proof progress. Chain ${chain.type}:${chain.id}.`);
  if (!onWalletPOIProofProgressCallback) {
    return;
  }

  const poiProofEvent: POIProofProgressEvent = {
    txidVersion,
    chain,
    railgunWalletID: wallet.id,
    progress,
    listKey,
    txid,
    railgunTxid,
    index,
    totalCount,
  };

  onWalletPOIProofProgressCallback(poiProofEvent);
};

export const balanceForERC20Token = async (
  txidVersion: TXIDVersion,
  wallet: AbstractWallet,
  networkName: NetworkName,
  tokenAddress: string,
  onlySpendable: boolean,
): Promise<bigint> => {
  const { chain } = NETWORK_CONFIG[networkName];
  const balances = await wallet.getTokenBalances(
    txidVersion,
    chain,
    onlySpendable,
  );
  const tokenBalances = getSerializedERC20Balances(balances);

  const matchingTokenBalance: Optional<RailgunERC20Amount> = tokenBalances.find(
    tokenBalance =>
      tokenBalance.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
  );
  if (!matchingTokenBalance) {
    return 0n;
  }
  return matchingTokenBalance.amount;
};

export const balanceForNFT = async (
  txidVersion: TXIDVersion,
  wallet: AbstractWallet,
  networkName: NetworkName,
  nftTokenData: NFTTokenData,
  onlySpendable: boolean,
): Promise<bigint> => {
  const { chain } = NETWORK_CONFIG[networkName];
  const balances = await wallet.getTokenBalances(
    txidVersion,
    chain,
    onlySpendable,
  );
  const nftBalances = getSerializedNFTBalances(balances);

  const matchingNFTBalance: Optional<RailgunNFTAmount> = nftBalances.find(
    nftBalance =>
      nftBalance.nftAddress.toLowerCase() ===
        nftTokenData.tokenAddress.toLowerCase() &&
      BigInt(nftBalance.tokenSubID) === BigInt(nftTokenData.tokenSubID),
  );
  if (!matchingNFTBalance) {
    return 0n;
  }
  return matchingNFTBalance.amount;
};

export const awaitWalletScan = (walletID: string, chain: Chain) => {
  const wallet = walletForID(walletID);
  return new Promise((resolve, reject) =>
    wallet.once(
      EngineEvent.WalletScanComplete,
      ({ chain: returnedChain }: WalletScannedEventData) =>
        returnedChain.type === chain.type && returnedChain.id === chain.id
          ? resolve(returnedChain)
          : reject(),
    ),
  );
};

export const awaitMultipleWalletScans = async (
  walletID: string,
  chain: Chain,
  numScans: number,
) => {
  let i = 0;
  while (i < numScans) {
    // eslint-disable-next-line no-await-in-loop
    await awaitWalletScan(walletID, chain);
    i += 1;
  }
  return Promise.resolve();
};

export {
  getTokenDataHash,
  getTokenDataNFT,
  getTokenDataERC20,
  TokenType,
  NFTTokenType,
  NFTTokenData,
};
