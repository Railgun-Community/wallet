import { PopulatedTransaction } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import {
  RailgunWallet,
  TransactionBatch,
  AdaptID,
  OutputType,
  SerializedTransaction,
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

const DUMMY_AMOUNT = '0x00';
export const DUMMY_FROM_ADDRESS = '0x000000000000000000000000000000000000dEaD';

export const generateProofTransactions = async (
  proofType: ProofType,
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  memoText: Optional<string>,
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[],
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>,
  sendWithPublicWallet: boolean,
  progressCallback: ProverProgressCallback,
  relayAdaptID: Optional<AdaptID> = undefined,
  useDummyProof = false,
): Promise<SerializedTransaction[]> => {
  const railgunWallet = fullWalletForID(railgunWalletID);

  const txs: SerializedTransaction[] = await erc20TransactionsFromTokenAmounts(
    proofType,
    tokenAmountRecipients,
    railgunWallet,
    encryptionKey,
    memoText,
    networkName,
    relayerFeeTokenAmountRecipient,
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
  encryptionKey: string,
  memoText: Optional<string>,
  tokenAmountRecipients: RailgunWalletTokenAmountRecipient[],
  relayerFeeTokenAmount: Optional<RailgunWalletTokenAmount>,
  sendWithPublicWallet: boolean,
): Promise<SerializedTransaction[]> => {
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
    memoText,
    tokenAmountRecipients,
    relayerFeeTokenAmountRecipient,
    sendWithPublicWallet,
    () => {}, // progressCallback (not necessary for dummy txs)
    undefined, // relayAdaptID
    true, // useDummyProof
  );
};

export const generateTransact = async (
  txs: SerializedTransaction[],
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

export const generateWithdrawBaseToken = async (
  txs: SerializedTransaction[],
  networkName: NetworkName,
  toWalletAddress: string,
  relayAdaptParamsRandom: string,
  useDummyProof = false,
): Promise<PopulatedTransaction> => {
  assertValidEthAddress(toWalletAddress);
  assertNotBlockedAddress(toWalletAddress);

  const relayAdaptContract = getRelayAdaptContractForNetwork(networkName);

  const populatedTransaction =
    await relayAdaptContract.populateWithdrawBaseToken(
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
  memoText: Optional<string>,
  networkName: NetworkName,
  relayerFeeTokenAmountRecipient: Optional<RailgunWalletTokenAmountRecipient>,
  sendWithPublicWallet: boolean,
  progressCallback: ProverProgressCallback,
  relayAdaptID: Optional<AdaptID>,
  useDummyProof: boolean,
): Promise<SerializedTransaction[]> => {
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

  const txBatchPromises: Promise<SerializedTransaction[]>[] = [];

  if (relayerFeeTokenAmountRecipient && !sendWithPublicWallet) {
    assertValidRailgunAddress(relayerFeeTokenAmountRecipient.recipientAddress);

    const transactionBatchRelayerFee = new TransactionBatch(
      relayerFeeTokenAmountRecipient.tokenAddress,
      TokenType.ERC20,
      chain,
    );
    if (relayAdaptID) {
      transactionBatchRelayerFee.setAdaptID(relayAdaptID);
    }
    transactionBatchRelayerFee.addOutput(
      erc20NoteFromTokenAmount(
        relayerFeeTokenAmountRecipient,
        railgunWallet,
        OutputType.RelayerFee,
        undefined, // memoText
      ),
    );

    // TODO: If paying Relayer fee in the same token that is any output/withdraw in transaction.
    // Disabled for now until we have more circuits to support this.
    // Combine into same Transaction to save gas.
    // const matchingOutputTokenAmounts = tokenAmounts.filter(
    //   ta => ta.tokenAddress === relayerFeeTokenAmount.tokenAddress,
    // );
    // matchingOutputTokenAmounts.forEach(tokenAmount =>
    //   setTransactionOutputs(
    //     proofType,
    //     transactionBatchRelayerFee,
    //     toWalletAddress,
    //     tokenAmount,
    //     railgunWallet,
    //     memoText,
    //   ),
    // );

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
      // if (
      //   !sendWithPublicWallet &&
      //   tokenAmountRecipient.tokenAddress ===
      //     relayerFeeTokenAmountRecipient?.tokenAddress
      // ) {
      //   // Token already added.
      //   return;
      // }

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
  memoText: Optional<string>,
) => {
  switch (proofType) {
    case ProofType.Transfer: {
      setTransactionOutputsTransfer(
        transactionBatch,
        tokenAmountRecipient,
        railgunWallet,
        memoText,
      );
      break;
    }
    case ProofType.CrossContractCalls:
    case ProofType.WithdrawBaseToken:
    case ProofType.Withdraw: {
      setTransactionOutputsWithdraw(
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
  memoText: Optional<string>,
) => {
  assertValidRailgunAddress(tokenAmountRecipient.recipientAddress);

  transactionBatch.addOutput(
    erc20NoteFromTokenAmount(
      tokenAmountRecipient,
      railgunWallet,
      OutputType.Transfer,
      memoText,
    ),
  );
};

const setTransactionOutputsWithdraw = (
  transactionBatch: TransactionBatch,
  tokenAmountRecipient: RailgunWalletTokenAmountRecipient,
  allowOverride?: boolean,
) => {
  const withdrawAmount = BigNumber.from(tokenAmountRecipient.amountString);
  const value = withdrawAmount.toHexString();

  assertValidEthAddress(tokenAmountRecipient.recipientAddress);
  assertNotBlockedAddress(tokenAmountRecipient.recipientAddress);

  transactionBatch.setWithdraw(
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
): Promise<SerializedTransaction[]> => {
  const prover = getProver();
  return useDummyProof
    ? transactionBatch.generateDummySerializedTransactions(
        prover,
        railgunWallet,
        encryptionKey,
      )
    : transactionBatch.generateSerializedTransactions(
        prover,
        railgunWallet,
        encryptionKey,
        progressCallback,
      );
};
