import {
  Chain,
  AbstractWallet,
  TokenType,
  TokenBalances,
  NFTTokenData,
  getTokenDataHash,
  getTokenDataNFT,
  getTokenDataERC20,
  POIProofEventStatus,
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
  RailgunWalletBalanceBucket,
  isDefined,
  networkForChain,
} from '@railgun-community/shared-models';
import { sendErrorMessage, sendMessage } from '../../../utils/logger';
import { parseRailgunTokenAddress } from '../util/bytes';
import { POIRequired } from '../../poi/poi-required';
import { getEngine } from '../core/engine';

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

export const getSerializedERC20Balances = (
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

export const getSerializedNFTBalances = (
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
  try {
    if (!onBalanceUpdateCallback) {
      return;
    }

    sendMessage(
      `Wallet balance SCANNED. Getting balances for chain ${chain.type}:${chain.id}.`,
    );

    const network = networkForChain(chain);
    if (!network) {
      return;
    }
    if (!(await POIRequired.isRequiredForNetwork(network.name))) {
      // POI not required for this network
      return getAllBalancesAsSpendable(txidVersion, wallet, chain);
    }

    // POI required for this network
    const tokenBalancesByBucket = await wallet.getTokenBalancesByBucket(
      txidVersion,
      chain,
    );

    const balanceBuckets = Object.values(RailgunWalletBalanceBucket);

    balanceBuckets.forEach(balanceBucket => {
      if (!onBalanceUpdateCallback) {
        return;
      }

      const tokenBalances = tokenBalancesByBucket[balanceBucket];
      if (!isDefined(tokenBalances)) {
        return;
      }

      const erc20Amounts = getSerializedERC20Balances(tokenBalances);
      const nftAmounts = getNFTBalances(tokenBalances);

      const balancesEvent: RailgunBalancesEvent = {
        txidVersion,
        chain,
        erc20Amounts,
        nftAmounts,
        railgunWalletID: wallet.id,
        balanceBucket,
      };

      onBalanceUpdateCallback(balancesEvent);
    });
  } catch (err) {
    if (!(err instanceof Error)) {
      return;
    }
    sendMessage(
      `Error getting balances for chain ${chain.type}:${chain.id}: ${err.message}`,
    );
    sendErrorMessage(err);
  }
};

const getAllBalancesAsSpendable = async (
  txidVersion: TXIDVersion,
  wallet: AbstractWallet,
  chain: Chain,
) => {
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
    balanceBucket: RailgunWalletBalanceBucket.Spendable,
  };

  onBalanceUpdateCallback(balancesEvent);
};

export const onWalletPOIProofProgress = (
  status: POIProofEventStatus,
  txidVersion: TXIDVersion,
  wallet: AbstractWallet,
  chain: Chain,
  progress: number,
  listKey: string,
  txid: string,
  railgunTxid: string,
  index: number,
  totalCount: number,
  errMessage: Optional<string>,
): void => {
  sendMessage(
    `[${listKey}, ${chain.type}:${chain.id}] Wallet POI proof progress: ${progress}.`,
  );
  if (!onWalletPOIProofProgressCallback) {
    return;
  }

  const poiProofEvent: POIProofProgressEvent = {
    status,
    txidVersion,
    chain,
    railgunWalletID: wallet.id,
    progress,
    listKey,
    txid,
    railgunTxid,
    index,
    totalCount,
    errMessage,
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

export {
  getTokenDataHash,
  getTokenDataNFT,
  getTokenDataERC20,
  TokenType,
  NFTTokenType,
  NFTTokenData,
};
