import { Provider } from '@ethersproject/providers';
import {
  AddressData,
  getPublicViewingKey,
  getTokenDataERC20,
  hexlify,
  OutputType,
  padToLength,
  RailgunEngine,
  RailgunSmartWalletContract,
  RailgunWallet,
  randomHex,
  RelayAdaptContract,
  TransactionBatch,
  TransactionStruct,
  TransactNote,
  ViewingKeyPair,
} from '@railgun-community/engine';
import { getProviderForNetwork, loadProvider } from '../../core/providers';
import { extractFirstNoteERC20AmountMapFromTransactionRequest } from '../extract-first-note';
import { BigNumber } from '@ethersproject/bignumber';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_FALLBACK_PROVIDER_JSON_CONFIG_GOERLI,
} from '../../../../tests/mocks.test';
// eslint-disable-next-line import/no-extraneous-dependencies
import { randomBytes } from '@ethersproject/random';
import {
  createEngineWalletBalancesStub,
  createEngineVerifyProofStub,
  restoreEngineStubs,
} from '../../../../tests/stubs/engine-stubs.test';
import {
  decimalToHexString,
  NetworkName,
  NETWORK_CONFIG,
} from '@railgun-community/shared-models';
import { createRailgunWallet } from '../../wallets';
import { fullWalletForID, getEngine } from '../../core/engine';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { initTestEngine } from '../../../../tests/setup.test';

chai.use(chaiAsPromised);
const { expect } = chai;

const mockViewingKeys = async () => {
  const privateViewingKey = randomBytes(32);
  const publicViewingKey = await getPublicViewingKey(privateViewingKey);
  const mockViewingKeys: ViewingKeyPair = {
    privateKey: privateViewingKey,
    pubkey: publicViewingKey,
  };
  return mockViewingKeys;
};

const getMockToken = () => {
  return {
    address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    symbol: 'SHIB',
    decimals: 18,
  };
};

let engine: RailgunEngine;
let proxyContract: RailgunSmartWalletContract;
let relayAdaptContract: RelayAdaptContract;
let railgunWallet: RailgunWallet;

const RANDOM_TRANSACT = randomHex(16);
const RANDOM_RELAY_ADAPT = randomHex(31);
const MOCK_TOKEN_ADDRESS = getMockToken().address;

const TREE = 0;
const GOERLI_NETWORK = NETWORK_CONFIG[NetworkName.EthereumGoerli];
const MOCK_MNEMONIC_1 =
  'test test test test test test test test test test test junk';

const createGoerliTransferTransactions = async (
  receiverAddressData: AddressData,
  senderAddressData: AddressData,
  fee: BigNumber,
  tokenAddress: string,
): Promise<TransactionStruct[]> => {
  const transaction = new TransactionBatch(GOERLI_NETWORK.chain);
  transaction.addOutput(
    TransactNote.createTransfer(
      receiverAddressData,
      senderAddressData,
      RANDOM_TRANSACT,
      BigInt(fee.toHexString()),
      getTokenDataERC20(tokenAddress),
      await mockViewingKeys(),
      false, // shouldShowSender
      OutputType.Transfer,
      undefined, // memoText
    ),
  );
  return transaction.generateDummyTransactions(
    engine.prover,
    railgunWallet,
    MOCK_DB_ENCRYPTION_KEY,
  );
};

const createGoerliRelayAdaptUnshieldTransactions = async (
  receiverAddressData: AddressData,
  senderAddressData: AddressData,
  fee: BigNumber,
  tokenAddress: string,
): Promise<TransactionStruct[]> => {
  const transaction = new TransactionBatch(GOERLI_NETWORK.chain);
  transaction.addOutput(
    TransactNote.createTransfer(
      receiverAddressData,
      senderAddressData,
      RANDOM_TRANSACT,
      BigInt(fee.toHexString()),
      getTokenDataERC20(tokenAddress),
      await mockViewingKeys(),
      false, // shouldShowSender
      OutputType.Transfer,
      undefined, // memoText
    ),
  );
  return transaction.generateDummyTransactions(
    engine.prover,
    railgunWallet,
    MOCK_DB_ENCRYPTION_KEY,
  );
};

describe('extract-first-note', () => {
  before(async function run() {
    this.timeout(10000);

    initTestEngine();
    engine = getEngine();

    const railgunWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC_1,
      undefined,
    );
    if (!railgunWalletInfo) {
      throw new Error('No railgun wallet created');
    }
    railgunWallet = fullWalletForID(railgunWalletInfo.id);

    await loadProvider(
      MOCK_FALLBACK_PROVIDER_JSON_CONFIG_GOERLI,
      GOERLI_NETWORK.name,
      false, // shouldDebug
    );

    const provider = getProviderForNetwork(GOERLI_NETWORK.name);

    const {
      proxyContract: ropstenProxyContractAddress,
      relayAdaptContract: ropstenRelayAdaptContractAddress,
    } = GOERLI_NETWORK;

    proxyContract = new RailgunSmartWalletContract(
      ropstenProxyContractAddress,
      provider as Provider,
      GOERLI_NETWORK.chain,
    );
    relayAdaptContract = new RelayAdaptContract(
      ropstenRelayAdaptContractAddress,
      provider as Provider,
    );

    const tokenAddressHexlify = hexlify(padToLength(MOCK_TOKEN_ADDRESS, 32));
    await createEngineWalletBalancesStub(
      railgunWallet.addressKeys,
      tokenAddressHexlify,
      TREE,
    );
    createEngineVerifyProofStub();
  });

  after(() => {
    restoreEngineStubs();
  });

  it('Should extract fee correctly - transfer', async () => {
    const fee = BigNumber.from('1000');
    const senderAddressData = RailgunEngine.decodeAddress(
      '0zk1qy00025qjn7vw0mvu4egcxlkjv3nkemeat92qdlh3lzl4rpzxv9f8rv7j6fe3z53ll2adx8kn0lj0ucjkz4xxyax8l9mpqjgrf9z3zjvlvqr4qxgznrpqugcjt8',
    );
    const transactions = await createGoerliTransferTransactions(
      railgunWallet.addressKeys,
      senderAddressData,
      fee,
      MOCK_TOKEN_ADDRESS,
    );
    const populatedTransaction = await proxyContract.transact(transactions);
    const firstNoteERC20AmountMap =
      await extractFirstNoteERC20AmountMapFromTransactionRequest(
        railgunWallet.id,
        NETWORK_CONFIG[NetworkName.EthereumGoerli],
        populatedTransaction,
        false, // useRelayAdapt
      );
    expect(Object.keys(firstNoteERC20AmountMap).length).to.equal(1);
    expect(
      firstNoteERC20AmountMap[MOCK_TOKEN_ADDRESS.toLowerCase()].toHexString(),
    ).to.equal(decimalToHexString(1000));
  }).timeout(60000);

  it('Should fail for incorrect receiver address - transfer', async () => {
    const fee = BigNumber.from('1000');
    const receiverAddressData = RailgunEngine.decodeAddress(
      '0zk1q8hxknrs97q8pjxaagwthzc0df99rzmhl2xnlxmgv9akv32sua0kfrv7j6fe3z53llhxknrs97q8pjxaagwthzc0df99rzmhl2xnlxmgv9akv32sua0kg0zpzts',
    );
    const senderAddressData = RailgunEngine.decodeAddress(
      '0zk1qy00025qjn7vw0mvu4egcxlkjv3nkemeat92qdlh3lzl4rpzxv9f8rv7j6fe3z53ll2adx8kn0lj0ucjkz4xxyax8l9mpqjgrf9z3zjvlvqr4qxgznrpqugcjt8',
    );
    const transactions = await createGoerliTransferTransactions(
      receiverAddressData,
      senderAddressData,
      fee,
      MOCK_TOKEN_ADDRESS,
    );
    const populatedTransaction = await proxyContract.transact(transactions);
    const firstNoteERC20AmountMap =
      await extractFirstNoteERC20AmountMapFromTransactionRequest(
        railgunWallet.id,
        NETWORK_CONFIG[NetworkName.EthereumGoerli],
        populatedTransaction,
        false, // useRelayAdapt
      );
    expect(Object.keys(firstNoteERC20AmountMap).length).to.equal(0);
  }).timeout(60000);

  it('Should extract fee correctly - relay adapt', async () => {
    const fee = BigNumber.from('1000');
    const senderAddressData = RailgunEngine.decodeAddress(
      '0zk1qy00025qjn7vw0mvu4egcxlkjv3nkemeat92qdlh3lzl4rpzxv9f8rv7j6fe3z53ll2adx8kn0lj0ucjkz4xxyax8l9mpqjgrf9z3zjvlvqr4qxgznrpqugcjt8',
    );
    const transactions = await createGoerliRelayAdaptUnshieldTransactions(
      railgunWallet.addressKeys,
      senderAddressData,
      fee,
      MOCK_TOKEN_ADDRESS,
    );
    const populatedTransaction =
      await relayAdaptContract.populateUnshieldBaseToken(
        transactions,
        MOCK_ETH_WALLET_ADDRESS,
        RANDOM_RELAY_ADAPT,
      );
    const firstNoteERC20AmountMap =
      await extractFirstNoteERC20AmountMapFromTransactionRequest(
        railgunWallet.id,
        GOERLI_NETWORK,
        populatedTransaction,
        true, // useRelayAdapt
      );
    expect(Object.keys(firstNoteERC20AmountMap).length).to.equal(1);
    expect(
      firstNoteERC20AmountMap[MOCK_TOKEN_ADDRESS.toLowerCase()].toHexString(),
    ).to.equal(decimalToHexString(1000));
  }).timeout(60000);

  it('Should fail for incorrect receiver address - relay adapt', async () => {
    const fee = BigNumber.from('1000');
    const receiverAddressData = RailgunEngine.decodeAddress(
      '0zk1q8hxknrs97q8pjxaagwthzc0df99rzmhl2xnlxmgv9akv32sua0kfrv7j6fe3z53llhxknrs97q8pjxaagwthzc0df99rzmhl2xnlxmgv9akv32sua0kg0zpzts',
    );
    const senderAddressData = RailgunEngine.decodeAddress(
      '0zk1qy00025qjn7vw0mvu4egcxlkjv3nkemeat92qdlh3lzl4rpzxv9f8rv7j6fe3z53ll2adx8kn0lj0ucjkz4xxyax8l9mpqjgrf9z3zjvlvqr4qxgznrpqugcjt8',
    );
    const transactions = await createGoerliRelayAdaptUnshieldTransactions(
      receiverAddressData,
      senderAddressData,
      fee,
      MOCK_TOKEN_ADDRESS,
    );
    const populatedTransaction =
      await relayAdaptContract.populateUnshieldBaseToken(
        transactions,
        MOCK_ETH_WALLET_ADDRESS,
        RANDOM_RELAY_ADAPT,
      );
    const firstNoteERC20AmountMap =
      await extractFirstNoteERC20AmountMapFromTransactionRequest(
        railgunWallet.id,
        NETWORK_CONFIG[NetworkName.EthereumGoerli],
        populatedTransaction,
        true, // useRelayAdapt
      );
    expect(Object.keys(firstNoteERC20AmountMap).length).to.equal(0);
  }).timeout(60000);
}).timeout(120000);
