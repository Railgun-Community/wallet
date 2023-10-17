import {
  ABIRailgunSmartWallet,
  ABIRelayAdapt,
  formatToByteLength,
  ByteLength,
  TransactNote,
  hexStringToBytes,
  getSharedSymmetricKey,
  TokenDataGetter,
  formatCommitmentCiphertext,
  nToHex,
  TokenType,
  AddressData,
  CommitmentCiphertext,
  getRailgunTransactionIDHex,
  hashBoundParams,
} from '@railgun-community/engine';
// eslint-disable-next-line import/no-cycle
import { getEngine, walletForID } from '../core/engine';
import { getRailgunWalletAddressData } from '../wallets';
import {
  Chain,
  Network,
  RailgunERC20Amount,
  isDefined,
} from '@railgun-community/shared-models';
import { getFallbackProviderForNetwork } from '../core/providers';
import { sendMessage } from '../../../utils';
import { parseRailgunTokenAddress } from '../util';
import { reportAndSanitizeError } from '../../../utils/error';
import { Contract, ContractTransaction, Result } from 'ethers';
import { TransactionStructOutput } from '@railgun-community/engine/dist/abi/typechain/RailgunSmartWallet';

enum TransactionName {
  RailgunSmartWallet = 'transact',
  RelayAdapt = 'relay',
}

const getABIForTransaction = (transactionName: TransactionName): Array<any> => {
  switch (transactionName) {
    case TransactionName.RailgunSmartWallet:
      return ABIRailgunSmartWallet;
    case TransactionName.RelayAdapt:
      return ABIRelayAdapt;
  }
};

export const extractFirstNoteERC20AmountMapFromTransactionRequest = (
  railgunWalletID: string,
  network: Network,
  transactionRequest: ContractTransaction,
  useRelayAdapt: boolean,
): Promise<MapType<bigint>> => {
  const transactionName = useRelayAdapt
    ? TransactionName.RelayAdapt
    : TransactionName.RailgunSmartWallet;
  const contractAddress = useRelayAdapt
    ? network.relayAdaptContract
    : network.proxyContract;

  return extractFirstNoteERC20AmountMap(
    railgunWalletID,
    network,
    transactionRequest,
    transactionName,
    contractAddress,
  );
};

export const extractRailgunTransactionDataFromTransactionRequest = (
  network: Network,
  transactionRequest: ContractTransaction,
  useRelayAdapt: boolean,
): { railgunTxid: string; utxoTreeIn: bigint }[] => {
  const transactionName = useRelayAdapt
    ? TransactionName.RelayAdapt
    : TransactionName.RailgunSmartWallet;
  const contractAddress = useRelayAdapt
    ? network.relayAdaptContract
    : network.proxyContract;

  return extractRailgunTransactionData(
    network,
    transactionRequest,
    transactionName,
    contractAddress,
  );
};

const recursivelyDecodeResult = (result: Result): any => {
  if (typeof result !== 'object') {
    // End (primitive) value
    return result;
  }
  try {
    const obj = result.toObject();
    if ('_' in obj) {
      throw new Error('Decode as array, not object');
    }
    Object.keys(obj).forEach(key => {
      obj[key] = recursivelyDecodeResult(obj[key]);
    });
    return obj;
  } catch (err) {
    // Result is array.
    return result
      .toArray()
      .map(item => recursivelyDecodeResult(item as Result));
  }
};

const getRailgunTransactionRequests = (
  network: Network,
  transactionRequest: ContractTransaction,
  transactionName: TransactionName,
  contractAddress: string,
): TransactionStructOutput[] => {
  const abi = getABIForTransaction(transactionName);

  if (
    !transactionRequest.to ||
    transactionRequest.to.toLowerCase() !== contractAddress.toLowerCase()
  ) {
    throw new Error(
      `Invalid contract address: got ${transactionRequest.to}, expected ${contractAddress} for network ${network.name}`,
    );
  }

  const provider = getFallbackProviderForNetwork(network.name);
  const contract = new Contract(contractAddress, abi, provider);

  const parsedTransaction = contract.interface.parseTransaction({
    data: transactionRequest.data ?? '',
    value: transactionRequest.value,
  });
  if (!parsedTransaction) {
    throw new Error('No transaction parsable from request');
  }
  if (parsedTransaction.name !== transactionName) {
    throw new Error(`Contract method invalid: expected ${transactionName}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const args = recursivelyDecodeResult(parsedTransaction.args);

  // eslint-disable-next-line no-underscore-dangle
  const railgunTxs: TransactionStructOutput[] = args._transactions;
  return railgunTxs;
};

const extractFirstNoteERC20AmountMap = async (
  railgunWalletID: string,
  network: Network,
  transactionRequest: ContractTransaction,
  transactionName: TransactionName,
  contractAddress: string,
): Promise<MapType<bigint>> => {
  const railgunWallet = walletForID(railgunWalletID);
  const railgunWalletAddress = railgunWallet.getAddress();
  const receivingViewingPrivateKey = railgunWallet.viewingKeyPair.privateKey;
  const receivingRailgunAddressData =
    getRailgunWalletAddressData(railgunWalletAddress);

  const erc20PaymentAmounts: MapType<bigint> = {};

  const railgunTxs: TransactionStructOutput[] = getRailgunTransactionRequests(
    network,
    transactionRequest,
    transactionName,
    contractAddress,
  );

  await Promise.all(
    railgunTxs.map(async (railgunTx: TransactionStructOutput) => {
      const { commitments, boundParams } = railgunTx;

      // Extract first commitment (index 0)
      const index = 0;
      const commitmentCiphertextStructOutput =
        boundParams.commitmentCiphertext[index];
      const commitmentHash: string = commitments[index];
      if (!isDefined(commitmentCiphertextStructOutput)) {
        sendMessage('no ciphertext found for commitment at index 0');
        return;
      }

      const commitmentCiphertext = formatCommitmentCiphertext(
        commitmentCiphertextStructOutput,
      );

      const erc20PaymentAmount =
        await extractERC20AmountFromCommitmentCiphertext(
          network,
          commitmentCiphertext,
          commitmentHash,
          receivingViewingPrivateKey,
          receivingRailgunAddressData,
        );
      if (!erc20PaymentAmount) {
        return;
      }

      const { tokenAddress, amount } = erc20PaymentAmount;

      if (!isDefined(erc20PaymentAmounts[tokenAddress])) {
        erc20PaymentAmounts[tokenAddress] = 0n;
      }
      (erc20PaymentAmounts[tokenAddress] as bigint) += amount;
    }),
  );

  return erc20PaymentAmounts;
};

const extractRailgunTransactionData = (
  network: Network,
  transactionRequest: ContractTransaction,
  transactionName: TransactionName,
  contractAddress: string,
): { railgunTxid: string; utxoTreeIn: bigint }[] => {
  const railgunTxs: TransactionStructOutput[] = getRailgunTransactionRequests(
    network,
    transactionRequest,
    transactionName,
    contractAddress,
  );

  return railgunTxs.map((railgunTx: TransactionStructOutput) => {
    const { commitments, nullifiers, boundParams } = railgunTx;

    const boundParamsHash = nToHex(
      hashBoundParams(boundParams),
      ByteLength.UINT_256,
      true,
    );
    const railgunTxid = getRailgunTransactionIDHex({
      nullifiers,
      commitments,
      boundParamsHash,
    });
    return { railgunTxid, utxoTreeIn: boundParams.treeNumber };
  });
};

const decryptReceiverNoteSafe = async (
  commitmentCiphertext: CommitmentCiphertext,
  receivingViewingPrivateKey: Uint8Array,
  receivingRailgunAddressData: AddressData,
  chain: Chain,
): Promise<Optional<TransactNote>> => {
  try {
    const blindedSenderViewingKey = hexStringToBytes(
      commitmentCiphertext.blindedSenderViewingKey,
    );
    const blindedReceiverViewingKey = hexStringToBytes(
      commitmentCiphertext.blindedReceiverViewingKey,
    );
    const sharedKey = await getSharedSymmetricKey(
      receivingViewingPrivateKey,
      blindedSenderViewingKey,
    );
    if (!sharedKey) {
      sendMessage('invalid sharedKey');
      return undefined;
    }

    const { db } = getEngine();
    const tokenDataGetter = new TokenDataGetter(db, chain);

    const note = await TransactNote.decrypt(
      receivingRailgunAddressData,
      commitmentCiphertext.ciphertext,
      sharedKey,
      commitmentCiphertext.memo,
      commitmentCiphertext.annotationData,
      blindedReceiverViewingKey, // blindedReceiverViewingKey
      blindedSenderViewingKey, // blindedSenderViewingKey
      undefined, // senderRandom - not used
      false, // isSentNote
      false, // isLegacyDecryption
      tokenDataGetter,
      undefined, // blockNumber - not used
    );
    return note;
  } catch (err) {
    reportAndSanitizeError(decryptReceiverNoteSafe.name, err);
    return undefined;
  }
};

export const extractERC20AmountFromCommitmentCiphertext = async (
  network: Network,
  commitmentCiphertext: CommitmentCiphertext,
  commitmentHash: string,
  receivingViewingPrivateKey: Uint8Array,
  receivingRailgunAddressData: AddressData,
): Promise<Optional<RailgunERC20Amount>> => {
  const decryptedReceiverNote = await decryptReceiverNoteSafe(
    commitmentCiphertext,
    receivingViewingPrivateKey,
    receivingRailgunAddressData,
    network.chain,
  );
  if (!decryptedReceiverNote) {
    // Addressed to us, but different note than fee.
    sendMessage('invalid decryptedReceiverNote');
    return;
  }

  if (
    decryptedReceiverNote.receiverAddressData.masterPublicKey !==
    receivingRailgunAddressData.masterPublicKey
  ) {
    sendMessage('invalid masterPublicKey');
    return;
  }

  const noteHash = nToHex(decryptedReceiverNote.hash, ByteLength.UINT_256);
  const commitHash = formatToByteLength(commitmentHash, ByteLength.UINT_256);
  if (noteHash !== commitHash) {
    sendMessage('invalid commitHash');
    return;
  }

  const { tokenData } = decryptedReceiverNote;
  if (tokenData.tokenType !== TokenType.ERC20) {
    sendMessage('not an erc20');
    return;
  }

  const tokenAddress = parseRailgunTokenAddress(
    tokenData.tokenAddress,
  ).toLowerCase();

  const amount = decryptedReceiverNote.value;
  const erc20Amount: RailgunERC20Amount = {
    tokenAddress,
    amount,
  };
  return erc20Amount;
};

export { CommitmentCiphertext, TransactNote };
