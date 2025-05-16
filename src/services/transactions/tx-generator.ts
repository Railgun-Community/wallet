import {
  RailgunWallet,
  TransactionBatch,
  AdaptID,
  OutputType,
  getTokenDataERC20,
  getTokenDataNFT,
  ERC721_NOTE_VALUE,
  NFTTokenData,
  PreTransactionPOIsPerTxidLeafPerList,
  RailgunVersionedSmartContracts,
  TransactionStructV2,
  TransactionStructV3,
  RelayAdaptVersionedSmartContracts,
} from '@railgun-community/engine';
import {
  RailgunERC20Amount,
  RailgunERC20AmountRecipient,
  NetworkName,
  NETWORK_CONFIG,
  ProofType,
  RailgunNFTAmountRecipient,
  NFTTokenType,
  TXIDVersion,
} from '@railgun-community/shared-models';
import {
  erc20NoteFromERC20AmountRecipient,
  nftNoteFromNFTAmountRecipient,
} from './tx-notes';
import { getProver } from '../railgun/core/prover';
import {
  assertValidEthAddress,
  assertValidRailgunAddress,
  fullWalletForID,
  walletForID,
} from '../railgun/wallets/wallets';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import { shouldSetOverallBatchMinGasPriceForNetwork } from '../../utils/gas-price';
import { ContractTransaction } from 'ethers';
import { POIRequired } from '../poi/poi-required';

const DUMMY_AMOUNT = 0n;
export const DUMMY_FROM_ADDRESS = '0x000000000000000000000000000000000000dEaD';

export type GenerateTransactionsProgressCallback = (
  progress: number,
  status: string,
) => void;

export const generateProofTransactions = async (
  proofType: ProofType,
  networkName: NetworkName,
  railgunWalletID: string,
  txidVersion: TXIDVersion,
  encryptionKey: string,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  broadcasterFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  relayAdaptID: Optional<AdaptID>,
  useDummyProof: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  progressCallback: GenerateTransactionsProgressCallback,
  originShieldTxidForSpendabilityOverride?: string,
): Promise<{
  provedTransactions: (TransactionStructV2 | TransactionStructV3)[];
  preTransactionPOIsPerTxidLeafPerList: PreTransactionPOIsPerTxidLeafPerList;
}> => {
  const railgunWallet = fullWalletForID(railgunWalletID);

  const txs = await transactionsFromERC20Amounts(
    proofType,
    erc20AmountRecipients,
    nftAmountRecipients,
    railgunWallet,
    txidVersion,
    encryptionKey,
    showSenderAddressToRecipient,
    memoText,
    networkName,
    broadcasterFeeERC20AmountRecipient,
    sendWithPublicWallet,
    relayAdaptID,
    useDummyProof,
    overallBatchMinGasPrice,
    progressCallback,
    originShieldTxidForSpendabilityOverride,
  );
  return txs;
};

export const nullifiersForTransactions = (
  transactions: (TransactionStructV2 | TransactionStructV3)[],
): string[] => {
  return transactions
    .map(transaction => transaction.nullifiers)
    .flat() as string[];
};

export const createDummyBroadcasterFeeERC20Amount = (feeTokenAddress: string) => {
  const broadcasterFeeERC20Amount: RailgunERC20Amount = {
    tokenAddress: feeTokenAddress,
    amount: DUMMY_AMOUNT,
  };
  return broadcasterFeeERC20Amount;
};

export const generateDummyProofTransactions = async (
  proofType: ProofType,
  networkName: NetworkName,
  railgunWalletID: string,
  txidVersion: TXIDVersion,
  encryptionKey: string,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  broadcasterFeeERC20Amount: Optional<RailgunERC20Amount>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  originShieldTxidForSpendabilityOverride?: string,
): Promise<(TransactionStructV2 | TransactionStructV3)[]> => {
  if (!broadcasterFeeERC20Amount && !sendWithPublicWallet) {
    throw new Error('Must send with broadcaster or public wallet.');
  }

  const railgunWallet = walletForID(railgunWalletID);

  // Use self-wallet as dummy broadcaster address.
  const broadcasterRailgunAddress = railgunWallet.getAddress(undefined);

  const broadcasterFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient> =
    broadcasterFeeERC20Amount
      ? {
        ...broadcasterFeeERC20Amount,
        recipientAddress: broadcasterRailgunAddress,
      }
      : undefined;

  return (
    await generateProofTransactions(
      proofType,
      networkName,
      railgunWalletID,
      txidVersion,
      encryptionKey,
      showSenderAddressToRecipient,
      memoText,
      erc20AmountRecipients,
      nftAmountRecipients,
      broadcasterFeeERC20AmountRecipient,
      sendWithPublicWallet,
      undefined, // relayAdaptID
      true, // useDummyProof
      overallBatchMinGasPrice,
      () => {}, // progressCallback (not necessary for dummy txs)
      originShieldTxidForSpendabilityOverride,
    )
  ).provedTransactions;
};

export const generateTransact = async (
  txidVersion: TXIDVersion,
  txs: (TransactionStructV2 | TransactionStructV3)[],
  networkName: NetworkName,
  useDummyProof = false,
): Promise<ContractTransaction> => {
  const chain = NETWORK_CONFIG[networkName].chain;
  const transaction = await RailgunVersionedSmartContracts.generateTransact(
    txidVersion,
    chain,
    txs,
  );
  if (useDummyProof) {
    return {
      ...transaction,
      from: DUMMY_FROM_ADDRESS,
    };
  }
  return transaction;
};

export const generateUnshieldBaseToken = async (
  txidVersion: TXIDVersion,
  txs: (TransactionStructV2 | TransactionStructV3)[],
  networkName: NetworkName,
  toWalletAddress: string,
  relayAdaptParamsRandom: string,
  useDummyProof = false,
): Promise<ContractTransaction> => {
  assertValidEthAddress(toWalletAddress);
  assertNotBlockedAddress(toWalletAddress);

  const chain = NETWORK_CONFIG[networkName].chain;

  const transaction =
    await RelayAdaptVersionedSmartContracts.populateUnshieldBaseToken(
      txidVersion,
      chain,
      txs,
      toWalletAddress,
      relayAdaptParamsRandom,
      useDummyProof,
    );
  if (useDummyProof) {
    return {
      ...transaction,
      from: DUMMY_FROM_ADDRESS,
    };
  }
  return transaction;
};

const transactionsFromERC20Amounts = async (
  proofType: ProofType,
  erc20AmountRecipients: RailgunERC20AmountRecipient[],
  nftAmountRecipients: RailgunNFTAmountRecipient[],
  railgunWallet: RailgunWallet,
  txidVersion: TXIDVersion,
  encryptionKey: string,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
  networkName: NetworkName,
  broadcasterFeeERC20AmountRecipient: Optional<RailgunERC20AmountRecipient>,
  sendWithPublicWallet: boolean,
  relayAdaptID: Optional<AdaptID>,
  useDummyProof: boolean,
  overallBatchMinGasPrice: Optional<bigint>,
  progressCallback: GenerateTransactionsProgressCallback,
  originShieldTxidForSpendabilityOverride?: string,
): Promise<{
  provedTransactions: (TransactionStructV2 | TransactionStructV3)[];
  preTransactionPOIsPerTxidLeafPerList: PreTransactionPOIsPerTxidLeafPerList;
}> => {
  const network = NETWORK_CONFIG[networkName];
  const { chain } = network;

  // Removes overallBatchMinGasPrice for L2 networks and non-Broadcaster transactions.
  const validatedOverallBatchMinGasPrice =
    shouldSetOverallBatchMinGasPriceForNetwork(
      sendWithPublicWallet,
      networkName,
    )
      ? BigInt(overallBatchMinGasPrice ?? 0)
      : BigInt(0);

  const transactionBatch = new TransactionBatch(
    chain,
    validatedOverallBatchMinGasPrice,
  );
  if (relayAdaptID) {
    transactionBatch.setAdaptID(relayAdaptID);
  }

  if (broadcasterFeeERC20AmountRecipient && !sendWithPublicWallet) {
    assertValidRailgunAddress(broadcasterFeeERC20AmountRecipient.recipientAddress);

    // Add Broadcaster Fee - must be first transaction in the batch, and first output for the transaction.
    transactionBatch.addOutput(
      erc20NoteFromERC20AmountRecipient(
        broadcasterFeeERC20AmountRecipient,
        railgunWallet,
        OutputType.BroadcasterFee,
        false, // showSenderAddressToRecipient - never show sender for Broadcaster fees
        undefined, // memoText
      ),
    );
  }

  erc20AmountRecipients.forEach(
    (erc20AmountRecipient: RailgunERC20AmountRecipient) => {
      addTransactionOutputsERC20(
        proofType,
        transactionBatch,
        erc20AmountRecipient,
        railgunWallet,
        showSenderAddressToRecipient,
        memoText,
      );
    },
  );

  nftAmountRecipients.forEach(
    (nftAmountRecipient: RailgunNFTAmountRecipient) => {
      addTransactionOutputsNFT(
        proofType,
        transactionBatch,
        nftAmountRecipient,
        railgunWallet,
        showSenderAddressToRecipient,
        memoText,
      );
    },
  );

  const shouldGeneratePreTransactionPOIs =
    !sendWithPublicWallet &&
    (await POIRequired.isRequiredForNetwork(networkName));

  const txBatches = await generateAllProofs(
    transactionBatch,
    railgunWallet,
    txidVersion,
    encryptionKey,
    useDummyProof,
    progressCallback,
    shouldGeneratePreTransactionPOIs,
    originShieldTxidForSpendabilityOverride,
  );
  return txBatches;
};

const addTransactionOutputsERC20 = (
  proofType: ProofType,
  transactionBatch: TransactionBatch,
  erc20AmountRecipient: RailgunERC20AmountRecipient,
  railgunWallet: RailgunWallet,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
) => {
  switch (proofType) {
    case ProofType.Transfer: {
      addTransactionOutputsTransferERC20(
        transactionBatch,
        erc20AmountRecipient,
        railgunWallet,
        showSenderAddressToRecipient,
        memoText,
      );
      break;
    }
    case ProofType.CrossContractCalls:
    case ProofType.UnshieldBaseToken:
    case ProofType.Unshield: {
      addTransactionOutputsUnshieldERC20(
        transactionBatch,
        erc20AmountRecipient,
        false, // allowOverride
      );
      break;
    }
  }
};

const addTransactionOutputsNFT = (
  proofType: ProofType,
  transactionBatch: TransactionBatch,
  nftAmountRecipient: RailgunNFTAmountRecipient,
  railgunWallet: RailgunWallet,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
) => {
  switch (proofType) {
    case ProofType.Transfer: {
      addTransactionOutputsTransferNFT(
        transactionBatch,
        nftAmountRecipient,
        railgunWallet,
        showSenderAddressToRecipient,
        memoText,
      );
      break;
    }
    case ProofType.CrossContractCalls:
    case ProofType.UnshieldBaseToken:
    case ProofType.Unshield: {
      addTransactionOutputsUnshieldNFT(
        transactionBatch,
        nftAmountRecipient,
        false, // allowOverride
      );
      break;
    }
  }
};

const addTransactionOutputsTransferERC20 = (
  transactionBatch: TransactionBatch,
  erc20AmountRecipient: RailgunERC20AmountRecipient,
  railgunWallet: RailgunWallet,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
) => {
  assertValidRailgunAddress(erc20AmountRecipient.recipientAddress);

  transactionBatch.addOutput(
    erc20NoteFromERC20AmountRecipient(
      erc20AmountRecipient,
      railgunWallet,
      OutputType.Transfer,
      showSenderAddressToRecipient,
      memoText,
    ),
  );
};

const addTransactionOutputsUnshieldERC20 = (
  transactionBatch: TransactionBatch,
  erc20AmountRecipient: RailgunERC20AmountRecipient,
  allowOverride?: boolean,
) => {
  const { recipientAddress, amount } = erc20AmountRecipient;

  assertValidEthAddress(recipientAddress);
  assertNotBlockedAddress(recipientAddress);

  const tokenData = getTokenDataERC20(erc20AmountRecipient.tokenAddress);

  transactionBatch.addUnshieldData({
    toAddress: erc20AmountRecipient.recipientAddress,
    value: amount,
    tokenData,
    allowOverride,
  });
};

const addTransactionOutputsTransferNFT = (
  transactionBatch: TransactionBatch,
  nftAmountRecipient: RailgunNFTAmountRecipient,
  railgunWallet: RailgunWallet,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
) => {
  assertValidRailgunAddress(nftAmountRecipient.recipientAddress);

  transactionBatch.addOutput(
    nftNoteFromNFTAmountRecipient(
      nftAmountRecipient,
      railgunWallet,
      showSenderAddressToRecipient,
      memoText,
    ),
  );
};

const addTransactionOutputsUnshieldNFT = (
  transactionBatch: TransactionBatch,
  nftAmountRecipient: RailgunNFTAmountRecipient,
  allowOverride?: boolean,
) => {
  const { recipientAddress, nftAddress, tokenSubID, nftTokenType, amount } =
    nftAmountRecipient;

  assertValidEthAddress(recipientAddress);
  assertNotBlockedAddress(recipientAddress);

  const tokenData: NFTTokenData = getTokenDataNFT(
    nftAddress,
    nftTokenType as 1 | 2,
    tokenSubID,
  );

  const value: bigint =
    nftTokenType === NFTTokenType.ERC721 ? ERC721_NOTE_VALUE : amount;

  transactionBatch.addUnshieldData({
    toAddress: recipientAddress,
    value,
    tokenData,
    allowOverride,
  });
};

const generateAllProofs = async (
  transactionBatch: TransactionBatch,
  railgunWallet: RailgunWallet,
  txidVersion: TXIDVersion,
  encryptionKey: string,
  useDummyProof: boolean,
  progressCallback: GenerateTransactionsProgressCallback,
  shouldGeneratePreTransactionPOIs: boolean,
  originShieldTxidForSpendabilityOverride?: string,
): Promise<{
  provedTransactions: (TransactionStructV2 | TransactionStructV3)[];
  preTransactionPOIsPerTxidLeafPerList: PreTransactionPOIsPerTxidLeafPerList;
}> => {
  const prover = getProver();
  if (useDummyProof) {
    return {
      provedTransactions: await transactionBatch.generateDummyTransactions(
        prover,
        railgunWallet,
        txidVersion,
        encryptionKey,
        originShieldTxidForSpendabilityOverride,
      ),
      preTransactionPOIsPerTxidLeafPerList: {},
    };
  }
  return transactionBatch.generateTransactions(
    prover,
    railgunWallet,
    txidVersion,
    encryptionKey,
    progressCallback,
    shouldGeneratePreTransactionPOIs,
    originShieldTxidForSpendabilityOverride,
  );
};
