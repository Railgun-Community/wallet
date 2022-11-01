import { PopulatedTransaction } from '@ethersproject/contracts';
import {
  RailgunWallet,
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
  RailgunWalletTokenAmountRecipient,
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
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>,
  sendWithPublicWallet: boolean,
  relayAdaptID: Optional<AdaptID>,
  useDummyProof: boolean,
  overallBatchMinGasPrice: Optional<string>,
  progressCallback: ProverProgressCallback,
): Promise<TransactionStruct[]> => {
  const railgunWallet = fullWalletForID(railgunWalletID);

  const txs: TransactionStruct[] = await erc20TransactionsFromTokenAmounts(
    proofType,
    tokenAmountRecipients,
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

const erc20TransactionsFromTokenAmounts = async (
  proofType: ProofType,
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[],
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

  if (relayerFeeTokenAmountRecipient && !sendWithPublicWallet) {
    assertValidRailgunAddress(relayerFeeTokenAmountRecipient.recipientAddress);

    const transactionBatchRelayerFee = new TransactionBatch(
      relayerFeeTokenAmountRecipient.tokenAddress,
      TokenType.ERC20,
      chain,
      BigInt(overallBatchMinGasPrice ?? 0),
    );
    if (relayAdaptID) {
      transactionBatchRelayerFee.setAdaptID(relayAdaptID);
    }
    transactionBatchRelayerFee.addOutput(
      erc20NoteFromTokenAmount(
        relayerFeeTokenAmountRecipient,
        railgunWallet,
        OutputType.RelayerFee,
        false, // showSenderAddressToRecipient - never show sender for Relayer fees
        undefined, // memoText
      ),
    );

    // Required in order to stop the repeating of nullifiers.
    // Also combines into same transaction to save gas.
    const matchingOutputTokenAmountRecipients = tokenAmountRecipients.filter(
      ta => ta.tokenAddress === relayerFeeTokenAmountRecipient?.tokenAddress,
    );
    matchingOutputTokenAmountRecipients.forEach(tokenAmountRecipient =>
      setTransactionOutputs(
        proofType,
        transactionBatchRelayerFee,
        tokenAmountRecipient,
        railgunWallet,
        showSenderAddressToRecipient,
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

  tokenAmountRecipients.forEach(
    (tokenAmountRecipient: RailgunWalletTokenAmountRecipient) => {
      if (
        !sendWithPublicWallet &&
        tokenAmountRecipient.tokenAddress ===
          relayerFeeTokenAmountRecipient?.tokenAddress
      ) {
        // Token already added.
        return;
      }

      const transactionBatch = new TransactionBatch(
        tokenAmountRecipient.tokenAddress,
        TokenType.ERC20,
        chain,
      );
      if (relayAdaptID) {
        transactionBatch.setAdaptID(relayAdaptID);
      }

      setTransactionOutputs(
        proofType,
        transactionBatch,
        tokenAmountRecipient,
        railgunWallet,
        showSenderAddressToRecipient,
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
    },
  );

  const txBatches = await Promise.all(txBatchPromises);
  return txBatches.flat();
};

const setTransactionOutputs = (
  proofType: ProofType,
  transactionBatch: TransactionBatch,
  tokenAmountRecipient: RailgunWalletTokenAmountRecipient,
  railgunWallet: RailgunWallet,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
) => {
  switch (proofType) {
    case ProofType.Transfer: {
      setTransactionOutputsTransfer(
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
      setTransactionOutputsUnshield(
        transactionBatch,
        tokenAmountRecipient,
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
  tokenAmountRecipient: RailgunWalletTokenAmountRecipient,
  railgunWallet: RailgunWallet,
  showSenderAddressToRecipient: boolean,
  memoText: Optional<string>,
) => {
  assertValidRailgunAddress(tokenAmountRecipient.recipientAddress);

  transactionBatch.addOutput(
    erc20NoteFromTokenAmount(
      tokenAmountRecipient,
      railgunWallet,
      OutputType.Transfer,
      showSenderAddressToRecipient,
      memoText,
    ),
  );
};

const setTransactionOutputsUnshield = (
  transactionBatch: TransactionBatch,
  tokenAmountRecipient: RailgunWalletTokenAmountRecipient,
  allowOverride?: boolean,
) => {
  const { recipientAddress, amountString } = tokenAmountRecipient;

  assertValidEthAddress(recipientAddress);
  assertNotBlockedAddress(recipientAddress);

  const withdrawAmount = BigNumber.from(amountString);
  const value = withdrawAmount.toHexString();

  transactionBatch.setUnshield(
    tokenAmountRecipient.recipientAddress,
    value,
    allowOverride,
  );
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
