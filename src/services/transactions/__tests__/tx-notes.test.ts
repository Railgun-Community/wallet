import {
  OutputType,
  Memo,
  ByteLength,
  padToLength,
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
  TEST_WALLET_SOURCE,
} from '../../../tests/mocks.test';
import {
  initTestEngine,
  initTestEngineNetwork,
} from '../../../tests/setup.test';
import { fullWalletForID } from '../../railgun/core/engine';
import { createRailgunWallet } from '../../railgun/wallets/wallets';
import {
  compareERC20AmountRecipientArrays,
  compareERC20AmountRecipients,
  erc20NoteFromERC20AmountRecipient,
} from '../tx-notes';

const MOCK_TOKEN = '0x236c614a38362644deb15c9789779faf508bc6fe';

chai.use(chaiAsPromised);
const { expect } = chai;

const padTo32BytesUnHex = (str: string) => {
  return padToLength(str.replace('0x', ''), ByteLength.UINT_256);
};

const formatAmountString = (erc20Amount: RailgunERC20Amount) => {
  return BigInt(erc20Amount.amountString);
};

let railgunWalletID: string;

describe('tx-notes', () => {
  before(async function run() {
    this.timeout(10000);
    initTestEngine();
    await initTestEngineNetwork();
    const railgunWalletResponse = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!railgunWalletResponse.railgunWalletInfo) {
      throw new Error('No railgun wallet created.');
    }
    railgunWalletID = railgunWalletResponse.railgunWalletInfo.id;
  });

  it('Should test erc20 note creation', () => {
    const erc20AmountRecipient: RailgunERC20AmountRecipient = {
      tokenAddress: MOCK_TOKEN,
      amountString: '0x100',
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
    const viewingPrivateKey = railgunWallet.getViewingKeyPair().privateKey;

    const addressData = RailgunEngine.decodeAddress(
      MOCK_RAILGUN_WALLET_ADDRESS,
    );

    expect(note.value).to.equal(formatAmountString(erc20AmountRecipient));
    expect(note.receiverAddressData.masterPublicKey).to.equal(
      addressData.masterPublicKey,
    );
    expect(note.tokenHash).to.equal(padTo32BytesUnHex(MOCK_TOKEN));

    const decrypted = Memo.decryptNoteAnnotationData(
      note.annotationData,
      viewingPrivateKey,
    );

    expect(decrypted?.outputType).to.equal(OutputType.Transfer);
    expect(decrypted?.senderRandom).to.be.a('string');
    expect(decrypted?.walletSource).to.equal(TEST_WALLET_SOURCE);
  });

  it('Should test NFT note creation', () => {
    const erc20AmountRecipient: RailgunERC20AmountRecipient = {
      tokenAddress: MOCK_TOKEN,
      amountString: '0x100',
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
    const viewingPrivateKey = railgunWallet.getViewingKeyPair().privateKey;

    const addressData = RailgunEngine.decodeAddress(
      MOCK_RAILGUN_WALLET_ADDRESS,
    );

    expect(note.value).to.equal(formatAmountString(erc20AmountRecipient));
    expect(note.receiverAddressData.masterPublicKey).to.equal(
      addressData.masterPublicKey,
    );
    expect(note.tokenHash).to.equal(padTo32BytesUnHex(MOCK_TOKEN));

    const decrypted = Memo.decryptNoteAnnotationData(
      note.annotationData,
      viewingPrivateKey,
    );

    expect(decrypted?.outputType).to.equal(OutputType.Transfer);
    expect(decrypted?.senderRandom).to.be.a('string');
    expect(decrypted?.walletSource).to.equal(TEST_WALLET_SOURCE);
  });

  it('Should test token array comparisons', () => {
    const erc20AmountRecipients1: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: '1',
        amountString: '100',
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '2',
        amountString: '200',
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '3',
        amountString: '300',
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
    ];

    // Same same
    const erc20AmountRecipients2: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: '1',
        amountString: '100',
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '2',
        amountString: '200',
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '3',
        amountString: '300',
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
    ];

    // Different addresses
    const erc20AmountRecipients3: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: '1',
        amountString: '100',
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '3',
        amountString: '200',
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '5',
        amountString: '300',
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
    ];

    // Different amounts
    const erc20AmountRecipients4: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: '1',
        amountString: '100',
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '2',
        amountString: '300',
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '3',
        amountString: '200',
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
    ];

    // Different recipients
    const erc20AmountRecipients5: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: '1',
        amountString: '100',
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '2',
        amountString: '200',
        recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
      },
      {
        tokenAddress: '3',
        amountString: '300',
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
        amountString: '100',
        recipientAddress: 'hello',
      },
      {
        tokenAddress: '0x1234',
        amountString: '200',
        recipientAddress: 'hello2',
      },
    ];
    const sameB: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: '0x1234',
        amountString: '200',
        recipientAddress: 'hello2',
      },
      {
        tokenAddress: '0x1234',
        amountString: '100',
        recipientAddress: 'hello',
      },
    ];
    const differentC: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: '0x1234',
        amountString: '100',
        recipientAddress: 'hello',
      },
    ];

    expect(compareERC20AmountRecipientArrays(sameA, sameB)).to.be.true;
    expect(compareERC20AmountRecipientArrays(sameA, differentC)).to.be.false;
  });
});
