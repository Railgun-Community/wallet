import {
  NETWORK_CONFIG,
  NetworkName,
  TXIDVersion,
  isDefined,
} from '@railgun-community/shared-models';
import {
  NFTTokenData,
  TXO,
  TokenData,
  getTokenDataHash,
} from '@railgun-community/engine';
import { getEngine } from './engine';
import { walletForID } from '../wallets/wallets';

export const getUTXOMerkletreeForNetwork = (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
) => {
  const network = NETWORK_CONFIG[networkName];
  const { chain } = network;
  const utxoMerkletree = getEngine().getUTXOMerkletree(txidVersion, chain);
  if (!isDefined(utxoMerkletree)) {
    throw new Error(
      `MerkleTree not yet loaded for network ${network.publicName}`,
    );
  }
  return utxoMerkletree;
};

export const getTXIDMerkletreeForNetwork = (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
) => {
  const network = NETWORK_CONFIG[networkName];
  const { chain } = network;
  const txidMerkletree = getEngine().getTXIDMerkletree(txidVersion, chain);
  if (!isDefined(txidMerkletree)) {
    throw new Error(
      `MerkleTree not yet loaded for network ${network.publicName}`,
    );
  }
  return txidMerkletree;
};

export const getSpendableUTXOsForToken = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  walletID: string,
  tokenData: TokenData,
): Promise<Optional<TXO[]>> => {
  const wallet = walletForID(walletID);
  const chain = NETWORK_CONFIG[networkName].chain;
  const onlySpendable = true;
  const balances = await wallet.getTokenBalances(
    txidVersion,
    chain,
    onlySpendable,
  );
  const tokenHash = getTokenDataHash(tokenData);
  return balances[tokenHash]?.utxos;
};

export const getMerkleProofForERC721 = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  walletID: string,
  nftTokenData: NFTTokenData,
) => {
  const utxos = await getSpendableUTXOsForToken(
    txidVersion,
    networkName,
    walletID,
    nftTokenData,
  );
  if (!utxos || !utxos.length) {
    throw new Error('No spendable UTXOs found for NFT');
  }
  if (utxos.length !== 1) {
    throw new Error('Expected 1 UTXO for NFT');
  }

  const { tree, position } = utxos[0];
  const utxoMerkletree = getUTXOMerkletreeForNetwork(txidVersion, networkName);
  return utxoMerkletree.getMerkleProof(tree, position);
};
