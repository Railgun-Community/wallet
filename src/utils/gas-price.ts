import { NetworkName } from '@railgun-community/shared-models';

/**
 * L2s don't manage gas prices in the same way. tx.gasprice (contract) is not necessarily the same value as transactionRequest.gasPrice (ethers).
 * Since overallBatchMinGasPrice is an optional parameter, we simply remove it for L2s. This will skip validation on the contract side.
 */
export const shouldSetOverallBatchMinGasPriceForNetwork = (
  sendWithPublicWallet: boolean,
  networkName: NetworkName,
) => {
  if (sendWithPublicWallet) {
    // Only Relayer transactions require overallBatchMinGasPrice.
    return false;
  }
  switch (networkName) {
    case NetworkName.Arbitrum:
    case NetworkName.ArbitrumGoerli:
      // L2s should not set overallBatchMinGasPrice.
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
