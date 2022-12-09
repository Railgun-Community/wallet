import { PopulatedTransaction } from '@ethersproject/contracts';
import {
  RailgunWallet,
  TransactionBatch,
  AdaptID,
  OutputType,
  TransactionStruct,
  ProverProgressCallback,
  getTokenDataERC20,
  TokenData,
  getTokenDataNFT,
  NFT_NOTE_VALUE,
} from '@railgun-community/engine';
import {
  RailgunWalletTokenAmount,
  RailgunWalletTokenAmountRecipient,
  NetworkName,
  NETWORK_CONFIG,
  ProofType,
  RailgunNFTRecipient,
} from '@railgun-community/shared-models';
import { fullWalletForID, walletForID } from '../railgun/core/engine';
import {
  getRailgunSmartWalletContractForNetwork,
  getRelayAdaptContractForNetwork,
} from '../railgun/core/providers';
import {
  erc20NoteFromTokenAmountRecipient,
  nftNoteFromNFTRecipient,
} from './tx-notes';
import { getProver } from '../railgun/core/prover';
import { assertValidEthAddress, assertValidRailgunAddress } from '../railgun';
import { assertNotBlockedAddress } from '../../utils/blocked-address';
import { BigNumber } from '@ethersproject/bignumber';

const DUMMY_AMOUNT = '0x00';
export const DUMMY_FROM_ADDRESS = '0x000000000000000000000000000000000000dEaD';

export const generateProofTransactions = async (
  proofType: ProofType,
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[],
  nftRecipients: RailgunNFTRecipient[],
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>,
  sendWithPublicWallet: boolean,
  relayAdaptID: Optional<AdaptID>,
  useDummyProof: boolean,
  overallBatchMinGasPrice: Optional<string>,
  progressCallback: ProverProgressCallback,
): Promise<TransactionStruct[]> => {
  const railgunWallet = fullWalletForID(railgunWalletID);

  const txs: TransactionStruct[] = await transactionsFromTokenAmounts(
    proofType,
    tokenAmountRecipients,
    nftRecipients,
    railgunWallet,
    encryptionKey,
    showSenderAddressToRecipient,
    memoText,
    networkName,
    relayerFeeTokenAmountRecipient,
    sendWithPublicWallet,
    relayAdaptID,
    useDummyProof,
    overallBatchMinGasPrice,
    progressCallback,
  );
  return txs;
};

export const createDummyRelayerFeeTokenAmount = (feeTokenAddress: string) => {
  const relayerFeeTokenAmount: RailgunWalletTokenAmount = {
    tokenAddress: feeTokenAddress,
    amountString: DUMMY_AMOUNT,
  };
  return relayerFeeTokenAmount;
};

export const generateDummyProofTransactions = async (
  proofType: ProofType,
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[],
  nftRecipients: RailgunNFTRecipient[],
  relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>,
  sendWithPublicWallet: boolean,
  overallBatchMinGasPrice: Optional<string>,
): Promise<TransactionStruct[]> => {
  if (!relayerFeeTokenAmount && !sendWithPublicWallet) {
    throw new Error('Must send with relayer or public wallet.');
  }

  const railgunWallet = walletForID(railgunWalletID);

  // Use self-wallet as dummy relayer address.
  const relayerRailgunAddress = railgunWallet.getAddress(undefined);

  const relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient> =
    relayerFeeTokenAmount
      ? {
          ...relayerFeeTokenAmount,
          recipientAddress: relayerRailgunAddress,
        }
      : undefined;

  return generateProofTransactions(
    proofType,
    networkName,
    railgunWalletID,
    encryptionKey,
    showSenderAddressToRecipient,
    memoText,
    tokenAmountRecipients,
    nftRecipients,
    relayerFeeTokenAmountRecipient,
    sendWithPublicWallet,
    undefined, // relayAdaptID
    true, // useDummyProof
    overallBatchMinGasPrice,
    () => {}, // progressCallback (not necessary for dummy txs)
  );
};

export const generateTransact = async (
  txs: TransactionStruct[],
  networkName: NetworkName,
  useDummyProof = false,
): Promise<PopulatedTransaction> => {
  const railgunSmartWalletContract =
    getRailgunSmartWalletContractForNetwork(networkName);
  const populatedTransaction = await railgunSmartWalletContract.transact(txs);
  if (useDummyProof) {
    return {
      ...populatedTransaction,
      from: DUMMY_FROM_ADDRESS,
    };
  }
  return populatedTransaction;
};

export const generateUnshieldBaseToken = async (
  txs: TransactionStruct[],
  networkName: NetworkName,
  toWalletAddress: string,
  relayAdaptParamsRandom: string,
  useDummyProof = false,
): Promise<PopulatedTransaction> => {
  assertValidEthAddress(toWalletAddress);
  assertNotBlockedAddress(toWalletAddress);

  const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);

  const populatedTransaction =
    await relayAdaptContract.populateUnshieldBaseToken(
      txs,
      toWalletAddress,
      relayAdaptParamsRandom,
    );
  if (useDummyProof) {
    return {
      ...populatedTransaction,
      from: DUMMY_FROM_ADDRESS,
    };
  }
  return populatedTransaction;
};

const transactionsFromTokenAmounts = async (
  proofType: ProofType,
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[],
  nftRecipients: RailgunNFTRecipient[],
  railgunWallet: RailgunWallet,
  encryptionKey: string,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
  networkName: NetworkName,
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>,
  sendWithPublicWallet: boolean,
  relayAdaptID: Optional<AdaptID>,
  useDummyProof: boolean,
  overallBatchMinGasPrice: Optional<string>,
  progressCallback: ProverProgressCallback,
): Promise<TransactionStruct[]> => {
  const network = NETWORK_CONFIG[networkName];
  const { chain } = network;

  const transactionBatch = new TransactionBatch(
    chain,
    BigInt(overallBatchMinGasPrice ?? 0),
  );
  if (relayAdaptID) {
    transactionBatch.setAdaptID(relayAdaptID);
  }

  if (relayerFeeTokenAmountRecipient && !sendWithPublicWallet) {
    assertValidRailgunAddress(relayerFeeTokenAmountRecipient.recipientAddress);

    // Add Relayer Fee
    transactionBatch.addOutput(
      erc20NoteFromTokenAmountRecipient(
        relayerFeeTokenAmountRecipient,
        railgunWallet,
        OutputType.RelayerFee,
        false, // showSenderAddressToRecipient - never show sender for Relayer fees
        undefined, // memoText
      ),
    );
  }

  tokenAmountRecipients.forEach(
    (tokenAmountRecipient: RailgunWalletTokenAmountRecipient) => {
      addTransactionOutputsERC20(
        proofType,
        transactionBatch,
        tokenAmountRecipient,
        railgunWallet,
        showSenderAddressToRecipient,
        memoText,
      );
    },
  );

  nftRecipients.forEach((nftRecipient: RailgunNFTRecipient) => {
    addTransactionOutputsNFT(
      proofType,
      transactionBatch,
      nftRecipient,
      railgunWallet,
      showSenderAddressToRecipient,
      memoText,
    );
  });

  const txBatches = await generateAllProofs(
    transactionBatch,
    railgunWallet,
    encryptionKey,
    useDummyProof,
    progressCallback,
  );
  return txBatches;
};

const addTransactionOutputsERC20 = (
  proofType: ProofType,
  transactionBatch: TransactionBatch,
  tokenAmountRecipient: RailgunWalletTokenAmountRecipient,
  railgunWallet: RailgunWallet,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
) => {
  switch (proofType) {
    case ProofType.Transfer: {
      addTransactionOutputsTransferERC20(
        transactionBatch,
        tokenAmountRecipient,
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
        tokenAmountRecipient,
        false, // allowOverride
      );
      break;
    }
  }
};

const addTransactionOutputsNFT = (
  proofType: ProofType,
  transactionBatch: TransactionBatch,
  nftRecipient: RailgunNFTRecipient,
  railgunWallet: RailgunWallet,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
) => {
  switch (proofType) {
    case ProofType.Transfer: {
      addTransactionOutputsTransferNFT(
        transactionBatch,
        nftRecipient,
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
        nftRecipient,
        false, // allowOverride
      );
      break;
    }
  }
};

const addTransactionOutputsTransferERC20 = (
  transactionBatch: TransactionBatch,
  tokenAmountRecipient: RailgunWalletTokenAmountRecipient,
  railgunWallet: RailgunWallet,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
) => {
  assertValidRailgunAddress(tokenAmountRecipient.recipientAddress);

  transactionBatch.addOutput(
    erc20NoteFromTokenAmountRecipient(
      tokenAmountRecipient,
      railgunWallet,
      OutputType.Transfer,
      showSenderAddressToRecipient,
      memoText,
    ),
  );
};

const addTransactionOutputsUnshieldERC20 = (
  transactionBatch: TransactionBatch,
  tokenAmountRecipient: RailgunWalletTokenAmountRecipient,
  allowOverride?: boolean,
) => {
  const { recipientAddress, amountString } = tokenAmountRecipient;

  assertValidEthAddress(recipientAddress);
  assertNotBlockedAddress(recipientAddress);

  const unshieldAmount = BigNumber.from(amountString);

  const tokenData = getTokenDataERC20(tokenAmountRecipient.tokenAddress);

  transactionBatch.addUnshieldData({
    toAddress: tokenAmountRecipient.recipientAddress,
    value: unshieldAmount.toBigInt(),
    tokenData,
    allowOverride,
  });
};

const addTransactionOutputsTransferNFT = (
  transactionBatch: TransactionBatch,
  nftRecipient: RailgunNFTRecipient,
  railgunWallet: RailgunWallet,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
) => {
  assertValidRailgunAddress(nftRecipient.recipientAddress);

  transactionBatch.addOutput(
    nftNoteFromNFTRecipient(
      nftRecipient,
      railgunWallet,
      showSenderAddressToRecipient,
      memoText,
    ),
  );
};

const addTransactionOutputsUnshieldNFT = (
  transactionBatch: TransactionBatch,
  nftRecipient: RailgunNFTRecipient,
  allowOverride?: boolean,
) => {
  const { recipientAddress, nftAddress, tokenSubID, nftTokenType } =
    nftRecipient;

  assertValidEthAddress(recipientAddress);
  assertNotBlockedAddress(recipientAddress);

  const tokenData: TokenData = getTokenDataNFT(
    nftAddress,
    nftTokenType as 1 | 2,
    tokenSubID,
  );

  transactionBatch.addUnshieldData({
    toAddress: recipientAddress,
    value: NFT_NOTE_VALUE,
    tokenData,
    allowOverride,
  });
};

const generateAllProofs = (
  transactionBatch: TransactionBatch,
  railgunWallet: RailgunWallet,
  encryptionKey: string,
  useDummyProof: boolean,
  progressCallback: ProverProgressCallback,
): Promise<TransactionStruct[]> => {
  const prover = getProver();
  return useDummyProof
    ? transactionBatch.generateDummyTransactions(
        prover,
        railgunWallet,
        encryptionKey,
      )
    : transactionBatch.generateTransactions(
        prover,
        railgunWallet,
        encryptionKey,
        progressCallback,
      );
};
