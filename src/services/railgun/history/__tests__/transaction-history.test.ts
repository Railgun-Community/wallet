import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { fullWalletForID } from '../../core/engine';
import { createRailgunWallet } from '../../wallets/wallets';
import {
  categoryForTransactionHistoryItem,
  getWalletTransactionHistory,
} from '../transaction-history';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_MNEMONIC_2,
} from '../../../../tests/mocks.test';
import {
  initTestEngine,
  initTestEngineNetwork,
} from '../../../../tests/setup.test';
import { RailgunWallet } from '@railgun-community/engine';
import {
  Chain,
  ChainType,
  NetworkName,
  RailgunReceiveERC20Amount,
  RailgunSendERC20Amount,
  RailgunUnshieldERC20Amount,
  TransactionHistoryItem,
  TransactionHistoryItemCategory,
} from '@railgun-community/shared-models';

chai.use(chaiAsPromised);
const { expect } = chai;

const POLYGON_CHAIN: Chain = { type: ChainType.EVM, id: 137 };
let wallet: RailgunWallet;

const transferERC20AmountsSend: RailgunSendERC20Amount[] = [
  {
    tokenAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    amountString: '0x435532c61b0800',
    recipientAddress:
      '0zk1qygxrr7l92f6wltkpqlqcqstftfn0cn0x5ckyl5tjz6a4kyxnwy9arv7j6fe3z53llg8qt4s7axfdazyrrps78np9pylk4055gkz9e2gd8ulmk0urqt55y3m07t',
    walletSource: 'railway web',
    memoText: '',
  },
  {
    tokenAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    amountString: '0x01626218b4586000',
    recipientAddress:
      '0zk1qygxrr7l92f6wltkpqlqcqstftfn0cn0x5ckyl5tjz6a4kyxnwy9arv7j6fe3z53llg8qt4s7axfdazyrrps78np9pylk4055gkz9e2gd8ulmk0urqt55y3m07t',
    walletSource: 'railway web',
    memoText: '',
  },
  {
    tokenAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    amountString: '0x0120d3a540a09800',
    recipientAddress:
      '0zk1qygxrr7l92f6wltkpqlqcqstftfn0cn0x5ckyl5tjz6a4kyxnwy9arv7j6fe3z53llg8qt4s7axfdazyrrps78np9pylk4055gkz9e2gd8ulmk0urqt55y3m07t',
    walletSource: 'railway web',
    memoText: '',
  },
];
const MOCKED_TRANSFER_SEND_TRX: TransactionHistoryItem = {
  txid: '0x2cedf31ad89e317dab2bc522333c58e9d644e4977c9c7249ca99e3846eb5d652',
  blockNumber: 100,
  transferERC20Amounts: transferERC20AmountsSend,
  changeERC20Amounts: [
    {
      tokenAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      amountString: '0xabdf14769f1800',
    },
  ],
  receiveERC20Amounts: [],
  unshieldERC20Amounts: [],
  receiveNFTAmounts: [],
  transferNFTAmounts: [],
  unshieldNFTAmounts: [],
  version: 3,
  category: TransactionHistoryItemCategory.TransferSendERC20s,
  timestamp: 1678801493,
};

const receiveERC20AmountsReceive: RailgunReceiveERC20Amount[] = [
  {
    tokenAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    amountString: '0x0b470553066cd0f8',
    memoText: 'este va a ser un memo corto',
    senderAddress:
      '0zk1qyy0deg6tdmfum0dcxj8j69p9ue9emvyyuv46ltdrxcmfr06wafh8rv7j6fe3z53lalv6k0cvxsap0xqpcgjnplrkrz5nsykud3u5nstfclh96k4uwwcq8un6tm',
    shieldFee: '',
  },
];
const MOCKED_TRANSFER_RECEIVE_TRX: TransactionHistoryItem = {
  txid: '0x3245173576d6fdd6032915e9d742498e08b327cd4fbdeb0d7bb1858455698fa4',
  blockNumber: 100,
  transferERC20Amounts: [],
  changeERC20Amounts: [],
  receiveERC20Amounts: receiveERC20AmountsReceive,
  unshieldERC20Amounts: [],
  receiveNFTAmounts: [],
  transferNFTAmounts: [],
  unshieldNFTAmounts: [],
  version: 0,
  category: TransactionHistoryItemCategory.TransferReceiveERC20s,
  timestamp: 1681132187.844,
};

const receiveERC20AmountsShield: RailgunReceiveERC20Amount[] = [
  {
    tokenAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    amountString: '0x1bafa9ee16e78000',
    shieldFee: '0x11c37937e08000',
    senderAddress: '',
    memoText: '',
  },
];
const MOCKED_SHIELD_TRX: TransactionHistoryItem = {
  txid: '0x19a6a73d658c7517625ce16ab554ccb6dc3dbed85dfae8e7ced42b42ad71692c',
  blockNumber: 100,
  transferERC20Amounts: [],
  changeERC20Amounts: [],
  receiveERC20Amounts: receiveERC20AmountsShield,
  unshieldERC20Amounts: [],
  receiveNFTAmounts: [],
  transferNFTAmounts: [],
  unshieldNFTAmounts: [],
  version: 0,
  category: TransactionHistoryItemCategory.ShieldERC20s,
  timestamp: 1680269703,
};

const unshieldERC20AmountsUnshield: RailgunUnshieldERC20Amount[] = [
  {
    tokenAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    amountString: '0x06316e3f4d951280',
    recipientAddress: '0xc7FfA542736321A3dd69246d73987566a5486968',
    unshieldFee: '0x03f937fa6b8580',
    walletSource: 'railway web',
    memoText: '',
  },
];
const MOCKED_UNSHIELD_TRX: TransactionHistoryItem = {
  txid: '0xefcff65175d3dc33b7d384951fbeeb7698f8b86a29c635704e3ee78a9d947b66',
  blockNumber: 100,
  transferERC20Amounts: [],
  changeERC20Amounts: [],
  receiveERC20Amounts: [],
  unshieldERC20Amounts: unshieldERC20AmountsUnshield,
  receiveNFTAmounts: [],
  transferNFTAmounts: [],
  unshieldNFTAmounts: [],
  version: 3,
  category: TransactionHistoryItemCategory.UnshieldERC20s,
  timestamp: 1678821969,
};

const receiveERC20AmountsUnknow: RailgunReceiveERC20Amount[] = [
  {
    tokenAddress: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
    amountString: '0x0f3603f585000c34',
    shieldFee: '0x09c26a7ae13400',
    senderAddress: '',
    memoText: '',
  },
];
const unshieldERC20AmountsUnknow: RailgunUnshieldERC20Amount[] = [
  {
    tokenAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    amountString: '0x0dd7d4f70b73c000',
    recipientAddress: '0xc7FfA542736321A3dd69246d73987566a5486968',
    unshieldFee: '0x08e1bc9bf04000',
    memoText: '',
    walletSource: 'railway web',
  },
];
const MOCKED_UNKNOWN_SWAP_TRX: TransactionHistoryItem = {
  txid: '0xf12496efa5966edb39308b424038a2fec0235a01a2cb469908bc0b4bda7e1cbe',
  blockNumber: 100,
  transferERC20Amounts: [],
  relayerFeeERC20Amount: {
    tokenAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    amountString: '0x14b8daefd04c0000',
  },
  changeERC20Amounts: [
    {
      tokenAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      amountString: '0x012d2a0caec49380',
    },
  ],
  receiveERC20Amounts: receiveERC20AmountsUnknow,
  unshieldERC20Amounts: unshieldERC20AmountsUnknow,
  receiveNFTAmounts: [],
  transferNFTAmounts: [],
  unshieldNFTAmounts: [],
  version: 3,
  category: TransactionHistoryItemCategory.Unknown,
  timestamp: 1680269870,
};

describe('transaction-history', () => {
  before(async () => {
    initTestEngine();
    await initTestEngineNetwork();
    const { railgunWalletInfo, error } = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC_2,
      { [NetworkName.Ethereum]: 0, [NetworkName.Polygon]: 2 }, // creationBlockNumbers
    );
    if (!railgunWalletInfo) {
      throw new Error(`Could not create wallet: ${error}`);
    }
    wallet = fullWalletForID(railgunWalletInfo.id);
  });

  // TODO: This should ensure merkletree is scanned first.
  it.skip('Should get wallet transaction history', async () => {
    const resp = await getWalletTransactionHistory(
      POLYGON_CHAIN,
      wallet.id,
      undefined,
    );
    if (resp.items == null) {
      throw new Error('items is null');
    }
    expect(resp.items.length).to.be.greaterThanOrEqual(6);
    resp.items.forEach(item => {
      expect(item.txid.length === 66); // '0x' + 32 bytes
    });
  });

  it('Should get Unknown category for transaction history item', () => {
    const category = categoryForTransactionHistoryItem(MOCKED_UNKNOWN_SWAP_TRX);
    expect(category).to.equal(TransactionHistoryItemCategory.Unknown);
  });
  it('Should get TransferSendERC20s category for transaction history item', () => {
    const category = categoryForTransactionHistoryItem(
      MOCKED_TRANSFER_SEND_TRX,
    );
    expect(category).to.equal(
      TransactionHistoryItemCategory.TransferSendERC20s,
    );
  });
  it('Should get ShieldERC20s category for transaction history item', () => {
    const category = categoryForTransactionHistoryItem(MOCKED_SHIELD_TRX);
    expect(category).to.equal(TransactionHistoryItemCategory.ShieldERC20s);
  });
  it('Should get TransferReceiveERC20s category for transaction history item', () => {
    const category = categoryForTransactionHistoryItem(
      MOCKED_TRANSFER_RECEIVE_TRX,
    );
    expect(category).to.equal(
      TransactionHistoryItemCategory.TransferReceiveERC20s,
    );
  });
  it('Should get UnshieldERC20s category for transaction history item', () => {
    const category = categoryForTransactionHistoryItem(MOCKED_UNSHIELD_TRX);
    expect(category).to.equal(TransactionHistoryItemCategory.UnshieldERC20s);
  });
});
