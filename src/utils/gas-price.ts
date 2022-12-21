import { NetworkName } from '@railgun-community/shared-models';

/**
 * L2s don't manage gas prices in the same way. tx.gasprice (contract) is not necessarily the same value as transactionRequest.gasPrice (ethers).
 * Since overallBatchMinGasPrice is an optional parameter, we simply remove it for L2s. This will skip validation on the contract side.
 */
export const shouldSetOverallBatchMinGasPriceForNetwork = (
  networkName: NetworkName,
) => {
  switch (networkName) {
    case NetworkName.ArbitrumGoerli:
      return false;
    case NetworkName.Railgun:
      throw new Error('Invalid network for transaction');
    case NetworkName.Ethereum:
    case NetworkName.BNBChain:
    case NetworkName.Polygon:
    case NetworkName.EthereumRopsten_DEPRECATED:
    case NetworkName.EthereumGoerli:
    case NetworkName.PolygonMumbai:
    case NetworkName.Hardhat:
      return true;
  }
};
