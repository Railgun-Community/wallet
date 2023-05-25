import { CommitmentCiphertextStructOutput } from '@railgun-community/engine/dist/typechain-types/contracts/logic/RailgunLogic';
import { TransactionRequest } from '@ethersproject/providers';
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
} from '@railgun-community/engine';
import { getEngine, walletForID } from '../core/engine';
import { getRailgunWalletAddressData } from '../wallets';
import {
  Chain,
  Network,
  RailgunERC20Amount,
} from '@railgun-community/shared-models';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { getProviderForNetwork } from '../core/providers';
import { sendErrorMessage, sendMessage } from '../../../utils';
import { parseRailgunTokenAddress } from '../util';
import { reportAndSanitizeError } from '../../../utils/error';

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
  const receivingViewingPrivateKey = railgunWallet.viewingKeyPair.privateKey;
  const receivingRailgunAddressData =
    getRailgunWalletAddressData(railgunWalletAddress);

  const erc20PaymentAmounts: MapType<BigNumber> = {};

  // eslint-disable-next-line no-underscore-dangle
  const railgunTxs: TransactionData[] = parsedTransaction.args._transactions;

  await Promise.all(
    railgunTxs.map(async (railgunTx: TransactionData) => {
      const { commitments, boundParams } = railgunTx;

      // Extract first commitment (index 0)
      const index = 0;
      const commitmentCiphertextStructOutput =
        boundParams.commitmentCiphertext[index];
      const commitmentHash: string = commitments[index];
      if (!commitmentCiphertextStructOutput) {
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

      const { tokenAddress, amountString } = erc20PaymentAmount;

      if (!erc20PaymentAmounts[tokenAddress]) {
        erc20PaymentAmounts[tokenAddress] = BigNumber.from(0);
      }
      erc20PaymentAmounts[tokenAddress] =
        erc20PaymentAmounts[tokenAddress].add(amountString);
    }),
  );

  return erc20PaymentAmounts;
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

  const amountString = BigNumber.from(
    decryptedReceiverNote.value.toString(),
  ).toHexString();

  const erc20Amount: RailgunERC20Amount = {
    tokenAddress,
    amountString,
  };
  return erc20Amount;
};

export { CommitmentCiphertext };
