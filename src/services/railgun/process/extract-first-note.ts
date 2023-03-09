import { CommitmentCiphertextStructOutput } from '@railgun-community/engine/dist/typechain-types/contracts/logic/RailgunLogic';
import { TransactionRequest } from '@ethersproject/providers';
import {
  ABIRailgunSmartWallet,
  ABIRelayAdapt,
  formatToByteLength,
  ByteLength,
  Ciphertext,
  TransactNote,
  hexStringToBytes,
  getSharedSymmetricKey,
  TokenDataGetter,
  formatCommitmentCiphertext,
  nToHex,
  TokenType,
  AddressData,
} from '@railgun-community/engine';
import { getEngine, walletForID } from '../core/engine';
import { getRailgunWalletAddressData } from '../wallets';
import { Network } from '@railgun-community/shared-models';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { getProviderForNetwork } from '../core/providers';
import { sendErrorMessage, sendMessage } from '../../../utils';
import { parseRailgunTokenAddress } from '../util';

type CommitmentCiphertext = {
  ciphertext: Ciphertext;
  blindedSenderViewingKey: string;
  blindedReceiverViewingKey: string;
  annotationData: string;
  memo: string;
};

type BoundParams = {
  // ...
  commitmentCiphertext: CommitmentCiphertextStructOutput[];
};

type TransactionData = {
  // ...
  commitments: string[];
  boundParams: BoundParams;
};

enum TransactionName {
  RailgunSmartWallet = 'transact',
  RelayAdapt = 'relay',
}

type ERC20AmountMap = MapType<BigNumber>;

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
  transactionRequest: TransactionRequest,
  useRelayAdapt: boolean,
): Promise<ERC20AmountMap> => {
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

const extractFirstNoteERC20AmountMap = async (
  railgunWalletID: string,
  network: Network,
  transactionRequest: TransactionRequest,
  transactionName: TransactionName,
  contractAddress: string,
): Promise<ERC20AmountMap> => {
  const abi = getABIForTransaction(transactionName);

  if (
    !transactionRequest.to ||
    transactionRequest.to.toLowerCase() !== contractAddress.toLowerCase()
  ) {
    throw new Error(
      `Invalid contract address: got ${transactionRequest.to}, expected ${contractAddress} for network ${network.name}`,
    );
  }

  const provider = getProviderForNetwork(network.name);
  const contract = new Contract(contractAddress, abi, provider);

  const parsedTransaction = contract.interface.parseTransaction({
    data: (transactionRequest.data as string) ?? '',
    value: transactionRequest.value,
  });
  if (parsedTransaction.name !== transactionName) {
    throw new Error(`Contract method invalid: expected ${transactionName}`);
  }

  const railgunWallet = walletForID(railgunWalletID);
  const railgunWalletAddress = railgunWallet.getAddress();
  const viewingPrivateKey = railgunWallet.viewingKeyPair.privateKey;
  const railgunWalletAddressData =
    getRailgunWalletAddressData(railgunWalletAddress);

  const tokenPaymentAmounts: MapType<BigNumber> = {};

  // eslint-disable-next-line no-underscore-dangle
  const railgunTxs: TransactionData[] = parsedTransaction.args._transactions;

  await Promise.all(
    railgunTxs.map((railgunTx: TransactionData) =>
      extractFirstNoteERC20AmountMapFromTransaction(
        railgunTx,
        tokenPaymentAmounts,
        viewingPrivateKey,
        railgunWalletAddressData,
        network,
      ),
    ),
  );

  return tokenPaymentAmounts;
};

const decryptReceiverNoteSafe = async (
  commitmentCiphertext: CommitmentCiphertext,
  viewingPrivateKey: Uint8Array,
  railgunWalletAddressData: AddressData,
  network: Network,
): Promise<Optional<TransactNote>> => {
  try {
    const blindedSenderViewingKey = hexStringToBytes(
      commitmentCiphertext.blindedSenderViewingKey,
    );
    const blindedReceiverViewingKey = hexStringToBytes(
      commitmentCiphertext.blindedReceiverViewingKey,
    );
    const sharedKey = await getSharedSymmetricKey(
      viewingPrivateKey,
      blindedSenderViewingKey,
    );
    if (!sharedKey) {
      sendMessage('invalid sharedKey');
      return undefined;
    }

    const { db } = getEngine();
    const tokenDataGetter = new TokenDataGetter(db, network.chain);

    const note = await TransactNote.decrypt(
      railgunWalletAddressData,
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
    );
    return note;
  } catch (err) {
    if (!(err instanceof Error)) {
      throw err;
    }
    sendErrorMessage(`Decryption error: ${err.message}`);
    return undefined;
  }
};

const extractFirstNoteERC20AmountMapFromTransaction = async (
  railgunTx: TransactionData,
  tokenPaymentAmounts: MapType<BigNumber>,
  viewingPrivateKey: Uint8Array,
  railgunWalletAddressData: AddressData,
  network: Network,
) => {
  const { commitments } = railgunTx;

  // First commitment should always be the fee.
  const index = 0;
  const hash: string = commitments[index];
  const ciphertext = railgunTx.boundParams.commitmentCiphertext[index];

  const decryptedReceiverNote = await decryptReceiverNoteSafe(
    formatCommitmentCiphertext(ciphertext),
    viewingPrivateKey,
    railgunWalletAddressData,
    network,
  );
  if (!decryptedReceiverNote) {
    // Addressed to us, but different note than fee.
    sendMessage('invalid decryptedReceiverNote');
    return;
  }

  if (
    decryptedReceiverNote.receiverAddressData.masterPublicKey !==
    railgunWalletAddressData.masterPublicKey
  ) {
    sendMessage('invalid masterPublicKey');
    return;
  }

  const noteHash = nToHex(decryptedReceiverNote.hash, ByteLength.UINT_256);
  const commitHash = formatToByteLength(hash, ByteLength.UINT_256);
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

  if (!tokenPaymentAmounts[tokenAddress]) {
    // eslint-disable-next-line no-param-reassign
    tokenPaymentAmounts[tokenAddress] = BigNumber.from(0);
  }
  // eslint-disable-next-line no-param-reassign
  tokenPaymentAmounts[tokenAddress] = tokenPaymentAmounts[tokenAddress].add(
    decryptedReceiverNote.value.toString(),
  );
};
