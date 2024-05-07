import {
  OutputType,
  ByteLength,
  ByteUtils,
  RailgunEngine,
} from '@railgun-community/engine';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  RailgunERC20Amount,
  RailgunERC20AmountRecipient,
} from '@railgun-community/shared-models';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_MEMO,
  MOCK_MNEMONIC,
  MOCK_RAILGUN_WALLET_ADDRESS,
} from '../../../tests/mocks.test';
import {
  closeTestEngine,
  initTestEngine,
  initTestEngineNetworks,
} from '../../../tests/setup.test';
import {
  createRailgunWallet,
  fullWalletForID,
} from '../../railgun/wallets/wallets';
import {
  compareERC20AmountRecipientArrays,
  erc20NoteFromERC20AmountRecipient,
} from '../tx-notes';

const MOCK_TOKEN = '0x236c614a38362644deb15c9789779faf508bc6fe';

chai.use(chaiAsPromised);
const { expect } = chai;

const padTo32BytesUnHex = (str: string) => {
  return ByteUtils.padToLength(ByteUtils.strip0x(str), ByteLength.UINT_256);
};

const formatAmountString = (erc20Amount: RailgunERC20Amount) => {
  return BigInt(erc20Amount.amount);
};

let railgunWalletID: string;

describe('tx-notes', () => {
  before(async function run() {
    this.timeout(60_000);
    await initTestEngine();
    await initTestEngineNetworks();
    const railgunWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    railgunWalletID = railgunWalletInfo.id;
  });
  after(async () => {
    await closeTestEngine();
  });

  it('Should test erc20 note creation', () => {
    const erc20AmountRecipient: RailgunERC20AmountRecipient = {
      tokenAddress: MOCK_TOKEN,
      amount: BigInt(0x100),
      recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
    };
    const railgunWallet = fullWalletForID(railgunWalletID);
    const note = erc20NoteFromERC20AmountRecipient(
      erc20AmountRecipient,
      railgunWallet,
      OutputType.Transfer,
      true, // showSenderAddressToRecipient
      MOCK_MEMO,
    );

    const addressData = RailgunEngine.decodeAddress(
      MOCK_RAILGUN_WALLET_ADDRESS,
    );

    expect(note.value).to.equal(formatAmountString(erc20AmountRecipient));
    expect(note.receiverAddressData.masterPublicKey).to.equal(
      addressData.masterPublicKey,
    );
    expect(note.tokenHash).to.equal(padTo32BytesUnHex(MOCK_TOKEN));
  });

  it('Should test NFT note creation', () => {
    const erc20AmountRecipient: RailgunERC20AmountRecipient = {
      tokenAddress: MOCK_TOKEN,
      amount: BigInt(0x100),
      recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
    };
    const railgunWallet = fullWalletForID(railgunWalletID);
    const note = erc20NoteFromERC20AmountRecipient(
      erc20AmountRecipient,
      railgunWallet,
      OutputType.Transfer,
      true, // showSenderAddressToRecipient
      MOCK_MEMO,
    );

    const addressData = RailgunEngine.decodeAddress(
      MOCK_RAILGUN_WALLET_ADDRESS,
    );

    expect(note.value).to.equal(formatAmountString(erc20AmountRecipient));
    expect(note.receiverAddressData.masterPublicKey).to.equal(
      addressData.masterPublicKey,
    );
    expect(note.tokenHash).to.equal(padTo32BytesUnHex(MOCK_TOKEN));
  });

  it('Should test token array comparisons', () => {
    const erc20AmountRecipients1: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: '1',
        amount: 100n,
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '2',
        amount: BigInt(200),
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '3',
        amount: 300n,
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
    ];

    // Same same
    const erc20AmountRecipients2: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: '1',
        amount: 100n,
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '2',
        amount: BigInt(200),
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '3',
        amount: 300n,
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
    ];

    // Different addresses
    const erc20AmountRecipients3: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: '1',
        amount: 100n,
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '3',
        amount: BigInt(200),
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '5',
        amount: 300n,
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
    ];

    // Different amounts
    const erc20AmountRecipients4: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: '1',
        amount: 100n,
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '2',
        amount: 300n,
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '3',
        amount: BigInt(200),
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
    ];

    // Different recipients
    const erc20AmountRecipients5: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: '1',
        amount: 100n,
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '2',
        amount: BigInt(200),
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '3',
        amount: 300n,
        recipientAddress: MOCK_ETH_WALLET_ADDRESS,
      },
    ];

    expect(
      compareERC20AmountRecipientArrays(
        erc20AmountRecipients1,
        erc20AmountRecipients2,
      ),
    ).to.be.true;
    expect(
      compareERC20AmountRecipientArrays(
        erc20AmountRecipients1,
        erc20AmountRecipients3,
      ),
    ).to.be.false;
    expect(
      compareERC20AmountRecipientArrays(
        erc20AmountRecipients1,
        erc20AmountRecipients4,
      ),
    ).to.be.false;
    expect(
      compareERC20AmountRecipientArrays(
        erc20AmountRecipients1,
        erc20AmountRecipients5,
      ),
    ).to.be.false;
  });

  it('Should compare erc20 amount recipients', () => {
    const sameA: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: '0x1234',
        amount: 100n,
        recipientAddress: 'hello',
      },
      {
        tokenAddress: '0x1234',
        amount: BigInt(200),
        recipientAddress: 'hello2',
      },
    ];
    const sameB: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: '0x1234',
        amount: BigInt(200),
        recipientAddress: 'hello2',
      },
      {
        tokenAddress: '0x1234',
        amount: 100n,
        recipientAddress: 'hello',
      },
    ];
    const differentC: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: '0x1234',
        amount: 100n,
        recipientAddress: 'hello',
      },
    ];

    expect(compareERC20AmountRecipientArrays(sameA, sameB)).to.be.true;
    expect(compareERC20AmountRecipientArrays(sameA, differentC)).to.be.false;
  });
});
