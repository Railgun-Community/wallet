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
    // Only Broadcaster transactions require overallBatchMinGasPrice.
    return false;
  }
  switch (networkName) {
    case NetworkName.Arbitrum:
      // L2s should not set overallBatchMinGasPrice.
      return false;
    case NetworkName.Ethereum:
    case NetworkName.BNBChain:
    case NetworkName.Polygon:
    case NetworkName.PolygonAmoy:
    case NetworkName.ArbitrumGoerli_DEPRECATED:
    case NetworkName.EthereumRopsten_DEPRECATED:
    case NetworkName.EthereumGoerli_DEPRECATED:
    case NetworkName.PolygonMumbai_DEPRECATED:
    case NetworkName.EthereumSepolia:
    case NetworkName.Hardhat:
      return true;
  }
};
