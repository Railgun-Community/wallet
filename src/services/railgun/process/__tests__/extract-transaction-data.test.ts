import {
  AddressData,
  AES,
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
  TXOPOIListStatus,
  ViewingKeyPair,
} from '@railgun-community/engine';
import {
  getPollingProviderForNetwork,
  getFallbackProviderForNetwork,
} from '../../core/providers';
import {
  extractFirstNoteERC20AmountMapFromTransactionRequest,
  extractRailgunTxidsFromTransactionRequest,
} from '../extract-transaction-data';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_FALLBACK_PROVIDER_JSON_CONFIG_GOERLI,
} from '../../../../tests/mocks.test';
import {
  createEngineWalletBalancesStub,
  createEngineVerifyProofStub,
  restoreEngineStubs,
} from '../../../../tests/stubs/engine-stubs.test';
import {
  NetworkName,
  NETWORK_CONFIG,
  isDefined,
  TXIDVersion,
} from '@railgun-community/shared-models';
import { createRailgunWallet } from '../../wallets';
import { fullWalletForID, getEngine } from '../../core/engine';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { closeTestEngine, initTestEngine } from '../../../../tests/setup.test';
import { randomBytes } from 'ethers';
import { loadProvider } from '../../core/load-provider';
import { TestWalletPOINodeInterface } from '../../../../tests/poi/test-wallet-poi-node-interface.test';
import Sinon from 'sinon';

chai.use(chaiAsPromised);
const { expect } = chai;

const txidVersion = TXIDVersion.V2_PoseidonMerkle;

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

const RANDOM_RELAY_ADAPT = randomHex(31);
const MOCK_TOKEN_ADDRESS = getMockToken().address;

const TREE = 0;
const GOERLI_NETWORK = NETWORK_CONFIG[NetworkName.EthereumGoerli];
const MOCK_MNEMONIC_1 =
  'test test test test test test test test test test test junk';

const createGoerliTransferTransactions = async (
  receiverAddressData: AddressData,
  senderAddressData: AddressData,
  fee: bigint,
  tokenAddress: string,
): Promise<TransactionStruct[]> => {
  // Force refresh POIs to be Valid, so balance is Spendable (see beforeEach)
  await railgunWallet.refreshPOIsForAllTXIDVersions(GOERLI_NETWORK.chain, true);

  const transaction = new TransactionBatch(GOERLI_NETWORK.chain);
  transaction.addOutput(
    TransactNote.createTransfer(
      receiverAddressData,
      senderAddressData,
      fee,
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
    txidVersion,
    MOCK_DB_ENCRYPTION_KEY,
  );
};

const createGoerliRelayAdaptUnshieldTransactions = async (
  receiverAddressData: AddressData,
  senderAddressData: AddressData,
  fee: bigint,
  tokenAddress: string,
): Promise<TransactionStruct[]> => {
  const transaction = new TransactionBatch(GOERLI_NETWORK.chain);
  transaction.addOutput(
    TransactNote.createTransfer(
      receiverAddressData,
      senderAddressData,
      fee,
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
    txidVersion,
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
    if (!isDefined(railgunWalletInfo)) {
      throw new Error('No railgun wallet created');
    }
    railgunWallet = fullWalletForID(railgunWalletInfo.id);

    await loadProvider(
      MOCK_FALLBACK_PROVIDER_JSON_CONFIG_GOERLI,
      GOERLI_NETWORK.name,
      10000, // pollingInterval
    );

    const fallbackProvider = getFallbackProviderForNetwork(GOERLI_NETWORK.name);
    const pollingProvider = getPollingProviderForNetwork(GOERLI_NETWORK.name);

    const {
      proxyContract: ropstenProxyContractAddress,
      relayAdaptContract: ropstenRelayAdaptContractAddress,
    } = GOERLI_NETWORK;

    proxyContract = new RailgunSmartWalletContract(
      ropstenProxyContractAddress,
      fallbackProvider,
      pollingProvider,
      GOERLI_NETWORK.chain,
    );
    relayAdaptContract = new RelayAdaptContract(
      ropstenRelayAdaptContractAddress,
      fallbackProvider,
    );

    const tokenAddressHexlify = hexlify(padToLength(MOCK_TOKEN_ADDRESS, 32));
    await createEngineWalletBalancesStub(
      railgunWallet.addressKeys,
      tokenAddressHexlify,
      TREE,
    );
    createEngineVerifyProofStub();
  });

  after(async () => {
    restoreEngineStubs();
    await closeTestEngine();
  });

  beforeEach(() => {
    TestWalletPOINodeInterface.overridePOIsListStatus = TXOPOIListStatus.Valid;
  });

  afterEach(() => {
    TestWalletPOINodeInterface.overridePOIsListStatus =
      TXOPOIListStatus.Missing;
  });

  it('Should extract railgun txids', async () => {
    const transaction = {
      to: '0xe8bEa99BB438C2f3D533604D33258d74d5eE4824',
      data: '0xd8ae136a0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014fceeac99eb8419a2796d1958fc2050d489bf5a3eb170ef16a667060344ba900000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000026000000000000000000000000000000000000000000000000000000000000002c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000105802951a46d9e999151eb0eb9e4c7c1260b7ee88539011c207dc169c4dd17ee00000000000000000000000000000000000000000000000000000000000000022d19ecebdbe7eaf95d5e36841de3df4fa84f4d978f00aea308f0edb3deb1958600b6efe9fcfa0057732d69ea826bb0b4249ed1f921e139eaa3aa6ea2ff0196fa00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001c0f5c40b3a54da7510b4d04c25c3995ed107543dfa63c7e69f544b7a7f83e39cd9a1fc243639f8d9fbac6ac7f7744dc2b1fc49c9fce02cb93ce60536668e905bdd47813f3b05b8b5f29c4c7dfaf0bd2a3d9f143442dfed60bd8d63705031f12c68acd866af2b2f986a6468fd46b76730faebed97a29e654a96f2d1d18c964553150d1f957d2d57c0410a8d34c12433b67453c04d0edf89a437366ecee156e2da290d1f957d2d57c0410a8d34c12433b67453c04d0edf89a437366ecee156e2da2900000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000003ef2b9485d38127f76d7955f4c216bf8acf0c54ca8b05c6a90d051fa782a677d719a5cdb5269b184d038d3c6b238575efc42253c5b360b8e361f08b0b08798000000000000000000000000000000000000000000000000000000000000000000000744f5b8a005f417a594cdd783852c1e0979cc5010704f13c52de3377d0cad242957f9331392b03a10ec6354e1bb7f952b6056a0d071c839acf6c845bd8e248908c4cbe7c0d1884f0d5a7a5cad42a7fcdbddb25acbc5f9d444c625d2b0c63cc48945739b05749ef8c430e0c5bbd0c02056b0e2f106c9fcba307a291e4ba41a907bc910387ac5698108ef609bb441f44e25dcfcf2def6c174ae4c7108441cae9d7bc910387ac5698108ef609bb441f44e25dcfcf2def6c174ae4c7108441cae9d00000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000003e7f6aaaa49235ea17f5f90c73e2a0cf615bc392a8a52a29d262923059c165cd528f922b2b00c33a1e667a5ecee2086cf014a40705578552ab55413a9d4cc500000000000000000000000000000000000000000000000000000000000000000000',
    };
    const railgunTxids = extractRailgunTxidsFromTransactionRequest(
      NETWORK_CONFIG[NetworkName.EthereumGoerli],
      transaction,
      false, // useRelayAdapt
    );
    expect(railgunTxids).to.deep.equal([
      '18759632f78e7ce85cbd04769b98c8a5436d5144ff9f96f9743eeab43864f98a',
    ]);
  });

  it('Should extract fee correctly - transfer', async () => {
    const fee = BigInt('1000');
    const senderAddressData = RailgunEngine.decodeAddress(
      '0zk1qy00025qjn7vw0mvu4egcxlkjv3nkemeat92qdlh3lzl4rpzxv9f8rv7j6fe3z53ll2adx8kn0lj0ucjkz4xxyax8l9mpqjgrf9z3zjvlvqr4qxgznrpqugcjt8',
    );
    const transactions = await createGoerliTransferTransactions(
      railgunWallet.addressKeys,
      senderAddressData,
      fee,
      MOCK_TOKEN_ADDRESS,
    );
    const transaction = await proxyContract.transact(transactions);
    const firstNoteERC20AmountMap =
      await extractFirstNoteERC20AmountMapFromTransactionRequest(
        railgunWallet.id,
        NETWORK_CONFIG[NetworkName.EthereumGoerli],
        transaction,
        false, // useRelayAdapt
      );
    expect(Object.keys(firstNoteERC20AmountMap).length).to.equal(1);
    expect(firstNoteERC20AmountMap[MOCK_TOKEN_ADDRESS.toLowerCase()]).to.equal(
      1000n,
    );
  }).timeout(60000);

  it('Should fail for incorrect receiver address - transfer', async () => {
    const fee = BigInt('1000');
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
    const transaction = await proxyContract.transact(transactions);
    const firstNoteERC20AmountMap =
      await extractFirstNoteERC20AmountMapFromTransactionRequest(
        railgunWallet.id,
        NETWORK_CONFIG[NetworkName.EthereumGoerli],
        transaction,
        false, // useRelayAdapt
      );
    expect(Object.keys(firstNoteERC20AmountMap).length).to.equal(0);
  }).timeout(60000);

  it('Should extract fee correctly - relay adapt', async () => {
    const fee = BigInt('1000');
    const senderAddressData = RailgunEngine.decodeAddress(
      '0zk1qy00025qjn7vw0mvu4egcxlkjv3nkemeat92qdlh3lzl4rpzxv9f8rv7j6fe3z53ll2adx8kn0lj0ucjkz4xxyax8l9mpqjgrf9z3zjvlvqr4qxgznrpqugcjt8',
    );
    const transactions = await createGoerliRelayAdaptUnshieldTransactions(
      railgunWallet.addressKeys,
      senderAddressData,
      fee,
      MOCK_TOKEN_ADDRESS,
    );
    const transaction = await relayAdaptContract.populateUnshieldBaseToken(
      transactions,
      MOCK_ETH_WALLET_ADDRESS,
      RANDOM_RELAY_ADAPT,
    );
    const firstNoteERC20AmountMap =
      await extractFirstNoteERC20AmountMapFromTransactionRequest(
        railgunWallet.id,
        GOERLI_NETWORK,
        transaction,
        true, // useRelayAdapt
      );
    expect(Object.keys(firstNoteERC20AmountMap).length).to.equal(1);
    expect(firstNoteERC20AmountMap[MOCK_TOKEN_ADDRESS.toLowerCase()]).to.equal(
      1000n,
    );
  }).timeout(60000);

  it('Should fail for incorrect receiver address - relay adapt', async () => {
    const fee = BigInt('1000');
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
    const transaction = await relayAdaptContract.populateUnshieldBaseToken(
      transactions,
      MOCK_ETH_WALLET_ADDRESS,
      RANDOM_RELAY_ADAPT,
    );
    const firstNoteERC20AmountMap =
      await extractFirstNoteERC20AmountMapFromTransactionRequest(
        railgunWallet.id,
        NETWORK_CONFIG[NetworkName.EthereumGoerli],
        transaction,
        true, // useRelayAdapt
      );
    expect(Object.keys(firstNoteERC20AmountMap).length).to.equal(0);
  }).timeout(60000);
}).timeout(120000);
