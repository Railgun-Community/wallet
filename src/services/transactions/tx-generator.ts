import { PopulatedTransaction } from '@ethersproject/contracts';
import {
  RailgunWallet,
  RailgunEngine,
  TransactionBatch,
  AdaptID,
  OutputType,
  TransactionStruct,
  TokenType,
  ProverProgressCallback,
  averageNumber,
} from '@railgun-community/engine';
import {
  RailgunWalletTokenAmount,
  NetworkName,
  NETWORK_CONFIG,
  ProofType,
} from '@railgun-community/shared-models';
import { fullWalletForID, walletForID } from '../railgun/core/engine';
import {
  getProxyContractForNetwork,
  getRelayAdaptContractForNetwork,
} from '../railgun/core/providers';
import { erc20NoteFromTokenAmount } from './tx-erc20-notes';
import { getProver } from '../railgun/core/prover';
import { BigNumber } from '@ethersproject/bignumber';

const DUMMY_AMOUNT = '0x00';
export const DUMMY_FROM_ADDRESS = '0x000000000000000000000000000000000000dEaD';

export const generateProofTransactions = async (
  proofType: ProofType,
  networkName: NetworkName,
  railgunWalletID: string,
  toWalletAddress: string,
  encryptionKey: string,
  memoText: Optional<string>,
  tokenAmounts: RailgunWalletTokenAmount[],
  relayerRailgunAddress: Optional<string>,
  relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>,
  sendWithPublicWallet: boolean,
  progressCallback: ProverProgressCallback,
  relayAdaptID: Optional<AdaptID> = undefined,
  useDummyProof = false,
): Promise<TransactionStruct[]> => {
  const railgunWallet = fullWalletForID(railgunWalletID);

  const txs: TransactionStruct[] = await erc20TransactionsFromTokenAmounts(
    proofType,
    tokenAmounts,
    railgunWallet,
    toWalletAddress,
    encryptionKey,
    memoText,
    networkName,
    relayerRailgunAddress,
    relayerFeeTokenAmount,
    sendWithPublicWallet,
    progressCallback,
    relayAdaptID,
    useDummyProof,
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
  toWalletAddress: string,
  encryptionKey: string,
  memoText: Optional<string>,
  tokenAmounts: RailgunWalletTokenAmount[],
  relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>,
  sendWithPublicWallet: boolean,
): Promise<TransactionStruct[]> => {
  if (!relayerFeeTokenAmount && !sendWithPublicWallet) {
    throw new Error('Must send with relayer or public wallet.');
  }

  const railgunWallet = walletForID(railgunWalletID);

  // Use self-wallet as dummy relayer address.
  const relayerRailgunAddress = railgunWallet.getAddress(undefined);

  return generateProofTransactions(
    proofType,
    networkName,
    railgunWalletID,
    toWalletAddress,
    encryptionKey,
    memoText,
    tokenAmounts,
    relayerRailgunAddress,
    relayerFeeTokenAmount,
    sendWithPublicWallet,
    () => {}, // progressCallback (not necessary for dummy txs)
    undefined, // relayAdaptID
    true, // useDummyProof
  );
};

export const generateTransact = async (
  txs: TransactionStruct[],
  networkName: NetworkName,
  useDummyProof = false,
): Promise<PopulatedTransaction> => {
  const railContract = getProxyContractForNetwork(networkName);
  const populatedTransaction = await railContract.transact(txs);
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
  value: string,
  useDummyProof = false,
): Promise<PopulatedTransaction> => {
  const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);

  const populatedTransaction =
    await relayAdaptContract.populateUnshieldBaseToken(
      txs,
      toWalletAddress,
      relayAdaptParamsRandom,
      value,
    );
  if (useDummyProof) {
    return {
      ...populatedTransaction,
      from: DUMMY_FROM_ADDRESS,
    };
  }
  return populatedTransaction;
};

const erc20TransactionsFromTokenAmounts = async (
  proofType: ProofType,
  tokenAmounts: RailgunWalletTokenAmount[],
  railgunWallet: RailgunWallet,
  toWalletAddress: string,
  encryptionKey: string,
  memoText: Optional<string>,
  networkName: NetworkName,
  relayerRailgunAddress: Optional<string>,
  relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>,
  sendWithPublicWallet: boolean,
  progressCallback: ProverProgressCallback,
  relayAdaptID: Optional<AdaptID>,
  useDummyProof: boolean,
): Promise<TransactionStruct[]> => {
  const network = NETWORK_CONFIG[networkName];
  const { chain } = network;

  /**
   * Each transaction batch returns its own progressCallback, from 0 -> 100.
   * Gather each batch's progress, and average them to come up with the overall progress.
   */
  const individualProgressAmounts: number[] = [];
  const updateOverallProgress = () => {
    const averageProgress = averageNumber(individualProgressAmounts);
    progressCallback(averageProgress);
  };
  const individualProgressCallback = (index: number, progress: number) => {
    individualProgressAmounts[index] = progress;
    updateOverallProgress();
  };

  const txBatchPromises: Promise<TransactionStruct[]>[] = [];

  if (relayerRailgunAddress && relayerFeeTokenAmount && !sendWithPublicWallet) {
    const transactionBatchRelayerFee = new TransactionBatch(
      relayerFeeTokenAmount.tokenAddress,
      TokenType.ERC20,
      chain,
    );
    if (relayAdaptID) {
      transactionBatchRelayerFee.setAdaptID(relayAdaptID);
    }
    const addressData = RailgunEngine.decodeAddress(relayerRailgunAddress);
    transactionBatchRelayerFee.addOutput(
      erc20NoteFromTokenAmount(
        relayerFeeTokenAmount,
        addressData,
        railgunWallet,
        OutputType.RelayerFee,
        undefined, // memoText
      ),
    );

    // If paying Relayer fee in the same token that is any output/unshield in transaction.
    // Combine into same Transaction to save gas.
    const matchingOutputTokenAmounts = tokenAmounts.filter(
      ta => ta.tokenAddress === relayerFeeTokenAmount.tokenAddress,
    );
    matchingOutputTokenAmounts.forEach(tokenAmount =>
      setTransactionOutputs(
        proofType,
        transactionBatchRelayerFee,
        toWalletAddress,
        tokenAmount,
        railgunWallet,
        memoText,
      ),
    );

    individualProgressAmounts.push(0);
    txBatchPromises.push(
      generateAllProofs(
        transactionBatchRelayerFee,
        railgunWallet,
        encryptionKey,
        useDummyProof,
        (progress: number) => individualProgressCallback(0, progress),
      ),
    );
  }

  tokenAmounts.forEach((tokenAmount: RailgunWalletTokenAmount) => {
    if (
      !sendWithPublicWallet &&
      tokenAmount.tokenAddress === relayerFeeTokenAmount?.tokenAddress
    ) {
      // Token already added.
      return;
    }

    const transactionBatch = new TransactionBatch(
      tokenAmount.tokenAddress,
      TokenType.ERC20,
      chain,
    );
    if (relayAdaptID) {
      transactionBatch.setAdaptID(relayAdaptID);
    }

    setTransactionOutputs(
      proofType,
      transactionBatch,
      toWalletAddress,
      tokenAmount,
      railgunWallet,
      memoText,
    );

    const progressIndex = individualProgressAmounts.length;
    individualProgressAmounts.push(0);
    txBatchPromises.push(
      generateAllProofs(
        transactionBatch,
        railgunWallet,
        encryptionKey,
        useDummyProof,
        (progress: number) =>
          individualProgressCallback(progressIndex, progress),
      ),
    );
  });

  const txBatches = await Promise.all(txBatchPromises);
  return txBatches.flat();
};

const setTransactionOutputs = (
  proofType: ProofType,
  transactionBatch: TransactionBatch,
  toWalletAddress: string,
  tokenAmount: RailgunWalletTokenAmount,
  railgunWallet: RailgunWallet,
  memoText: Optional<string>,
) => {
  switch (proofType) {
    case ProofType.Transfer: {
      setTransactionOutputsTransfer(
        transactionBatch,
        toWalletAddress,
        tokenAmount,
        railgunWallet,
        memoText,
      );
      break;
    }
    case ProofType.CrossContractCalls:
    case ProofType.UnshieldBaseToken:
    case ProofType.Unshield: {
      setTransactionOutputsUnshield(
        transactionBatch,
        toWalletAddress,
        tokenAmount,
        false, // allowOverride
      );
      break;
    }
    default:
      throw new Error(`Unhandled proof type ${proofType} for Transaction`);
  }
};

const setTransactionOutputsTransfer = (
  transactionBatch: TransactionBatch,
  toWalletAddress: string,
  tokenAmount: RailgunWalletTokenAmount,
  railgunWallet: RailgunWallet,
  memoText: Optional<string>,
) => {
  const addressData = RailgunEngine.decodeAddress(toWalletAddress);
  transactionBatch.addOutput(
    erc20NoteFromTokenAmount(
      tokenAmount,
      addressData,
      railgunWallet,
      OutputType.Transfer,
      memoText,
    ),
  );
};

const setTransactionOutputsUnshield = (
  transactionBatch: TransactionBatch,
  toWalletAddress: string,
  tokenAmount: RailgunWalletTokenAmount,
  allowOverride?: boolean,
) => {
  const value = BigNumber.from(tokenAmount.amountString).toHexString();

  transactionBatch.setUnshield(toWalletAddress, value, allowOverride);
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
