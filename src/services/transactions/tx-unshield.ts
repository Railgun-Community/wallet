import {
  RailgunPopulateTransactionResponse,
  RailgunTransactionGasEstimateResponse,
  RailgunERC20Amount,
  NetworkName,
  ProofType,
  FeeTokenDetails,
  RailgunERC20AmountRecipient,
  RailgunNFTAmountRecipient,
  TransactionGasDetails,
  TXIDVersion,
  NETWORK_CONFIG,
} from '@railgun-community/shared-models';
import {
  DUMMY_FROM_ADDRESS,
  generateDummyProofTransactions,
  generateTransact,
  generateUnshieldBaseToken,
} from './tx-generator';
import { populateProvedTransaction } from './proof-cache';
import {
  ByteUtils,
  TransactionStructV2,
  TransactionStructV3,
} from '@railgun-community/engine';
import { gasEstimateResponseDummyProofIterativeBroadcasterFee } from './tx-gas-broadcaster-fee-estimator';
import { createRelayAdaptUnshieldERC20AmountRecipients } from './tx-cross-contract-calls';
import { reportAndSanitizeError } from '../../utils/error';
import { gasEstimateResponse, getGasEstimate } from './tx-gas-details';
import {
  walletForID,
  getFallbackProviderForNetwork,
  getSerializedERC20Balances,
  getSerializedNFTBalances,
} from '../railgun';
import { TransactionReceipt, TransactionResponse } from 'ethers';

const ERC20_TRANSFER_EVENT_SIGNATURE = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export const populateProvedUnshield = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  broadcasterFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  gasDetails: TransactionGasDetails,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const { transaction, nullifiers, preTransactionPOIsPerTxidLeafPerList } =
      await populateProvedTransaction(
        txidVersion,
        networkName,
        ProofType.Unshield,
        railgunWalletID,
        false, // showSenderAddressToRecipient
        undefined, // memoText
        erc20AmountRecipients,
        nftAmountRecipients,
        undefined, // relayAdaptUnshieldERC20AmountRecipients
        undefined, // relayAdaptUnshieldNFTAmounts
        undefined, // relayAdaptShieldERC20Recipients
        undefined, // relayAdaptShieldNFTRecipients
        undefined, // crossContractCalls
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
        gasDetails,
      );
    return {
      nullifiers,
      transaction,
      preTransactionPOIsPerTxidLeafPerList,
    };
  } catch (err) {
    throw reportAndSanitizeError(populateProvedUnshield.name, err);
  }
};

export const populateProvedUnshieldBaseToken = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  wrappedERC20Amount: RailgunERC20Amount,
  broadcasterFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  gasDetails: TransactionGasDetails,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      {
        ...wrappedERC20Amount,
        recipientAddress: publicWalletAddress,
      },
    ];
    const relayAdaptUnshieldERC20Amounts: RailgunERC20Amount[] = [
      wrappedERC20Amount,
    ];

    // Empty NFT Recipients.
    const nftAmountRecipients: RailgunNFTAmountRecipient[] = [];

    const { transaction, nullifiers, preTransactionPOIsPerTxidLeafPerList } =
      await populateProvedTransaction(
        txidVersion,
        networkName,
        ProofType.UnshieldBaseToken,
        railgunWalletID,
        false, // showSenderAddressToRecipient
        undefined, // memoText
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        undefined, // relayAdaptUnshieldNFTAmounts
        undefined, // relayAdaptShieldERC20Recipients
        undefined, // relayAdaptShieldNFTRecipients
        undefined, // crossContractCalls
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
        gasDetails,
      );
    return {
      nullifiers,
      transaction,
      preTransactionPOIsPerTxidLeafPerList,
    };
  } catch (err) {
    throw reportAndSanitizeError(populateProvedUnshieldBaseToken.name, err);
  }
};

export const gasEstimateForUnprovenUnshield = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  originalGasDetails: TransactionGasDetails,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    const overallBatchMinGasPrice = 0n;

    const response = await gasEstimateResponseDummyProofIterativeBroadcasterFee(
      (broadcasterFeeERC20Amount: Optional<RailgunERC20Amount>) =>
        generateDummyProofTransactions(
          ProofType.Unshield,
          networkName,
          railgunWalletID,
          txidVersion,
          encryptionKey,
          false, // showSenderAddressToRecipient
          undefined, // memoText
          erc20AmountRecipients,
          nftAmountRecipients,
          broadcasterFeeERC20Amount,
          sendWithPublicWallet,
          overallBatchMinGasPrice,
        ),
      (txs: (TransactionStructV2 | TransactionStructV3)[]) =>
        generateTransact(
          txidVersion,
          txs,
          networkName,
          true, // useDummyProof
        ),
      txidVersion,
      networkName,
      railgunWalletID,
      erc20AmountRecipients,
      originalGasDetails,
      feeTokenDetails,
      sendWithPublicWallet,
      false, // isCrossContractCall
    );
    return response;
  } catch (err) {
    throw reportAndSanitizeError(gasEstimateForUnprovenUnshield.name, err);
  }
};

export const gasEstimateForUnprovenUnshieldBaseToken = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  publicWalletAddress: string,
  railgunWalletID: string,
  encryptionKey: string,
  wrappedERC20Amount: RailgunERC20Amount,
  originalGasDetails: TransactionGasDetails,
  feeTokenDetails: Optional<FeeTokenDetails>,
  sendWithPublicWallet: boolean,
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    const relayAdaptUnshieldERC20AmountRecipients: RailgunERC20AmountRecipient[] =
      createRelayAdaptUnshieldERC20AmountRecipients(txidVersion, networkName, [
        wrappedERC20Amount,
      ]);

    // Empty NFT Recipients.
    const nftAmountRecipients: RailgunNFTAmountRecipient[] = [];

    const overallBatchMinGasPrice = 0n;

    const response = await gasEstimateResponseDummyProofIterativeBroadcasterFee(
      (broadcasterFeeERC20Amount: Optional<RailgunERC20Amount>) =>
        generateDummyProofTransactions(
          ProofType.UnshieldBaseToken,
          networkName,
          railgunWalletID,
          txidVersion,
          encryptionKey,
          false, // showSenderAddressToRecipient
          undefined, // memoText
          relayAdaptUnshieldERC20AmountRecipients,
          nftAmountRecipients,
          broadcasterFeeERC20Amount,
          sendWithPublicWallet,
          overallBatchMinGasPrice,
        ),
      (txs: (TransactionStructV2 | TransactionStructV3)[]) => {
        const relayAdaptParamsRandom = ByteUtils.randomHex(31);
        return generateUnshieldBaseToken(
          txidVersion,
          txs,
          networkName,
          publicWalletAddress,
          relayAdaptParamsRandom,
          true, // useDummyProof (for gas estimation)
          sendWithPublicWallet,
        );
      },
      txidVersion,
      networkName,
      railgunWalletID,
      relayAdaptUnshieldERC20AmountRecipients,
      originalGasDetails,
      feeTokenDetails,
      sendWithPublicWallet,
      false, // isCrossContractCall
    );
    return response;
  } catch (err) {
    throw reportAndSanitizeError(
      gasEstimateForUnprovenUnshieldBaseToken.name,
      err,
    );
  }
};

async function extractTokenOwnerFromTransferEvents(
  receipt: TransactionReceipt,
  railgunContractAddress: string
): Promise<string> {
  const railgunAddressLower = railgunContractAddress.toLowerCase();

  const potentialOwners: Set<string> = new Set();

  for (const log of receipt.logs) {
    try {
      // look for transfer signature
      if (log.topics.length < 3) {
        continue;
      }

      if (log.topics[0] !== ERC20_TRANSFER_EVENT_SIGNATURE) {
        continue;
      }

      // topics[0] = event signature hash
      // topics[1] = from address
      // topics[2] = to address
      // data = amount (non-indexed)

      const toAddress = `0x${  log.topics[2].slice(-40).toLowerCase()}`;

      // check if transfer is to the contract
      if (toAddress === railgunAddressLower) {
        const fromAddress = `0x${  log.topics[1].slice(-40)}`;
        potentialOwners.add(fromAddress);
      }
    } catch (error) {
      console.warn('Error parsing log for token owner extraction:', error);
      continue;
    }
  }

  // got the owner ?
  if (potentialOwners.size === 1) {
    const [owner] = Array.from(potentialOwners);
    return owner;
  }

  // multiple owners scenario
  // we should take the first one (first transfer)
  // this handles cases where there are multiple deposits in one transaction
  if (potentialOwners.size > 1) {
    console.warn(
      `Multiple token owners found in transaction. Using first owner. ` +
      `Owners: ${Array.from(potentialOwners).join(', ')}`
    );

    // return the first owner found
    const [firstOwner] = Array.from(potentialOwners);
    return firstOwner;
  }

  // No Transfer events to Railgun contract found
  throw new Error(
    'Could not find token owner: No Transfer event to Railgun contract detected in transaction'
  );
}

async function getTokenOwnerWithFallback(
  receipt: TransactionReceipt,
  transaction: TransactionResponse,
  railgunContractAddress: string
): Promise<string> {
  try {
    // first attempt is try to extract from Transfer events
    const tokenOwner = await extractTokenOwnerFromTransferEvents(
      receipt,
      railgunContractAddress
    );

    // Check if the token owner differs from tx.from (indicates gasless/delegated tx)
    if (tokenOwner.toLowerCase() !== transaction.from.toLowerCase()) {
      console.log(
        `✓ Gasless/delegated transaction detected:\n` +
        `  Transaction sender: ${transaction.from}\n` +
        `  True token owner:   ${tokenOwner}`
      );
    }

    return tokenOwner;
  } catch (error) {
    // fall back to transaction.from with warning
    console.warn(
      'Failed to extract token owner from Transfer events, ' +
      'falling back to transaction.from. This may be incorrect for gasless transactions.',
      error
    );

    return transaction.from;
  }
}

export const getERC20AndNFTAmountRecipientsForUnshieldToOrigin = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  originalShieldTxid: string,
): Promise<{
  erc20AmountRecipients: RailgunERC20AmountRecipient[];
  nftAmountRecipients: RailgunNFTAmountRecipient[];
}> => {
  const wallet = walletForID(railgunWalletID);
  const chain = NETWORK_CONFIG[networkName].chain;

  const balances = await wallet.getTokenBalancesForUnshieldToOrigin(
    txidVersion,
    chain,
    originalShieldTxid,
  );

  const provider = getFallbackProviderForNetwork(networkName);

  // fetch both transaction AND receipt
  const [transaction, receipt] = await Promise.all([
    provider.getTransaction(originalShieldTxid),
    provider.getTransactionReceipt(originalShieldTxid),
  ]);

  if (!transaction) {
    throw new Error('Could not find shield transaction from RPC');
  }

  if (!receipt) {
    throw new Error('Could not find shield transaction receipt from RPC');
  }

  // get contract address for this network
  const network = NETWORK_CONFIG[networkName];
  const railgunContractAddress = network.proxyContract;

  if (!railgunContractAddress) {
    throw new Error(`Could not find Railgun proxy contract for network: ${networkName}`);
  }

  // extract TRUE token owner from Transfer events
  const recipientAddress = await getTokenOwnerWithFallback(
    receipt,
    transaction,
    railgunContractAddress
  );
  const erc20Amounts = getSerializedERC20Balances(balances);
  const nftAmounts = getSerializedNFTBalances(balances);
  const erc20AmountRecipients: RailgunERC20AmountRecipient[] = erc20Amounts
    .filter(({ amount }) => amount > 0n)
    .map(erc20Amount => ({
      ...erc20Amount,
      recipientAddress,
    }));
  const nftAmountRecipients: RailgunNFTAmountRecipient[] = nftAmounts
    .filter(({ amount }) => amount > 0n)
    .map(nftAmount => ({
      ...nftAmount,
      recipientAddress,
    }));
  return { erc20AmountRecipients, nftAmountRecipients };
};

export const populateProvedUnshieldToOrigin = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  gasDetails: TransactionGasDetails,
): Promise<RailgunPopulateTransactionResponse> => {
  try {
    const { transaction, nullifiers, preTransactionPOIsPerTxidLeafPerList } =
      await populateProvedTransaction(
        txidVersion,
        networkName,
        ProofType.Unshield,
        railgunWalletID,
        false, // showSenderAddressToRecipient
        undefined, // memoText
        erc20AmountRecipients,
        nftAmountRecipients,
        undefined, // relayAdaptUnshieldERC20AmountRecipients
        undefined, // relayAdaptUnshieldNFTAmounts
        undefined, // relayAdaptShieldERC20Recipients
        undefined, // relayAdaptShieldNFTRecipients
        undefined, // crossContractCalls
        undefined, // broadcasterFeeERC20AmountRecipient
        true, // sendWithPublicWallet
        undefined, // overallBatchMinGasPrice
        gasDetails,
      );
    return {
      nullifiers,
      transaction,
      preTransactionPOIsPerTxidLeafPerList,
    };
  } catch (err) {
    throw reportAndSanitizeError(populateProvedUnshieldToOrigin.name, err);
  }
};

export const gasEstimateForUnprovenUnshieldToOrigin = async (
  originalShieldTxid: string,
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
): Promise<RailgunTransactionGasEstimateResponse> => {
  try {
    // Use dead address for private transaction gas estimate
    const fromWalletAddress = DUMMY_FROM_ADDRESS;

    const overallBatchMinGasPrice = 0n;

    const serializedTransactions = await generateDummyProofTransactions(
      ProofType.Unshield,
      networkName,
      railgunWalletID,
      txidVersion,
      encryptionKey,
      false, // showSenderAddressToRecipient
      undefined, // memoText
      erc20AmountRecipients,
      nftAmountRecipients,
      undefined, // broadcasterFeeERC20Amount
      true, // sendWithPublicWallet
      overallBatchMinGasPrice,
      originalShieldTxid, // originShieldTxidForSpendabilityOverride
    );
    const transaction = await generateTransact(
      txidVersion,
      serializedTransactions,
      networkName,
      true, // useDummyProof
    );

    const gasEstimate = await getGasEstimate(
      txidVersion,
      networkName,
      transaction,
      fromWalletAddress,
      true, // sendWithPublicWallet
      false, // isCrossContractCall
    );

    return gasEstimateResponse(
      gasEstimate,
      undefined, // broadcasterFeeCommitment
      true, // isGasEstimateWithDummyProof
    );
  } catch (err) {
    throw reportAndSanitizeError(
      gasEstimateForUnprovenUnshieldToOrigin.name,
      err,
    );
  }
};
