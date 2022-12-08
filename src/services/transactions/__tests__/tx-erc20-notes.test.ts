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
  RailgunWalletTokenAmount,
  RailgunWalletTokenAmountRecipient,
} from '@railgun-community/shared-models';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_MEMO,
  MOCK_MNEMONIC,
  MOCK_RAILGUN_WALLET_ADDRESS,
  TEST_WALLET_SOURCE,
} from '../../../test/mocks.test';
import {
  initTestEngine,
  initTestEngineNetwork,
} from '../../../test/setup.test';
import { fullWalletForID } from '../../railgun/core/engine';
import { createRailgunWallet } from '../../railgun/wallets/wallets';
import {
  compareTokenAmountRecipientArrays,
  erc20NoteFromTokenAmount,
} from '../tx-erc20-notes';

const MOCK_TOKEN = '0x236c614a38362644deb15c9789779faf508bc6fe';

chai.use(chaiAsPromised);
const { expect } = chai;

const padTo32BytesUnHex = (str: string) => {
  return padToLength(str.replace('0x', ''), ByteLength.UINT_256);
};

const formatAmountString = (tokenAmount: RailgunWalletTokenAmount) => {
  return BigInt(tokenAmount.amountString);
};

let railgunWalletID: string;

describe('tx-erc20-notes', () => {
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
    const tokenAmountRecipient: RailgunWalletTokenAmountRecipient = {
      tokenAddress: MOCK_TOKEN,
      amountString: '0x100',
      recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
    };
    const railgunWallet = fullWalletForID(railgunWalletID);
    const note = erc20NoteFromTokenAmount(
      tokenAmountRecipient,
      railgunWallet,
      OutputType.Transfer,
      true, // showSenderAddressToRecipient
      MOCK_MEMO,
    );
    const viewingPrivateKey = railgunWallet.getViewingKeyPair().privateKey;

    const addressData = RailgunEngine.decodeAddress(
      MOCK_RAILGUN_WALLET_ADDRESS,
    );

    expect(note.value).to.equal(formatAmountString(tokenAmountRecipient));
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
    const tokenAmountRecipients1: RailgunWalletTokenAmountRecipient[] = [
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
    const tokenAmountRecipients2: RailgunWalletTokenAmountRecipient[] = [
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
    const tokenAmountRecipients3: RailgunWalletTokenAmountRecipient[] = [
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
    const tokenAmountRecipients4: RailgunWalletTokenAmountRecipient[] = [
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
    const tokenAmountRecipients5: RailgunWalletTokenAmountRecipient[] = [
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
      compareTokenAmountRecipientArrays(
        tokenAmountRecipients1,
        tokenAmountRecipients2,
      ),
    ).to.be.true;
    expect(
      compareTokenAmountRecipientArrays(
        tokenAmountRecipients1,
        tokenAmountRecipients3,
      ),
    ).to.be.false;
    expect(
      compareTokenAmountRecipientArrays(
        tokenAmountRecipients1,
        tokenAmountRecipients4,
      ),
    ).to.be.false;
    expect(
      compareTokenAmountRecipientArrays(
        tokenAmountRecipients1,
        tokenAmountRecipients5,
      ),
    ).to.be.false;
  });
});
