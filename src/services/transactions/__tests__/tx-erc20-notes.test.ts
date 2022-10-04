import { OutputType } from '@railgun-community/engine/dist/models/formatted-types';
import { Memo } from '@railgun-community/engine/dist/note/memo';
import {
  ByteLength,
  padToLength,
} from '@railgun-community/engine/dist/utils/bytes';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { RailgunWalletTokenAmount } from '@railgun-community/shared-models';
import {
  MOCK_DB_ENCRYPTION_KEY,
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
  compareTokenAmountArrays,
  erc20NoteFromTokenAmount,
} from '../tx-erc20-notes';
import { RailgunEngine } from '@railgun-community/engine/dist/railgun-engine';

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
    );
    if (!railgunWalletResponse.railgunWalletInfo) {
      throw new Error('No railgun wallet created.');
    }
    railgunWalletID = railgunWalletResponse.railgunWalletInfo.id;
  });

  it('Should test erc20 note creation', () => {
    const tokenAmount: RailgunWalletTokenAmount = {
      tokenAddress: MOCK_TOKEN,
      amountString: '0x100',
    };
    const addressData = RailgunEngine.decodeAddress(
      MOCK_RAILGUN_WALLET_ADDRESS,
    );
    const railgunWallet = fullWalletForID(railgunWalletID);
    const note = erc20NoteFromTokenAmount(
      tokenAmount,
      addressData,
      railgunWallet,
      OutputType.Transfer,
      MOCK_MEMO,
    );
    const viewingPrivateKey = railgunWallet.getViewingKeyPair().privateKey;

    expect(note.value).to.equal(formatAmountString(tokenAmount));
    expect(note.masterPublicKey).to.equal(addressData.masterPublicKey);
    expect(note.token).to.equal(padTo32BytesUnHex(MOCK_TOKEN));

    const decrypted = Memo.decryptNoteExtraData(
      note.memoField,
      viewingPrivateKey,
    );

    expect(decrypted?.outputType).to.equal(OutputType.Transfer);
    expect(decrypted?.senderBlindingKey).to.be.a('string');
    expect(decrypted?.walletSource).to.equal(TEST_WALLET_SOURCE);
  });

  it('Should test token array comparisons', () => {
    const tokenAmounts1: RailgunWalletTokenAmount[] = [
      {
        tokenAddress: '1',
        amountString: '100',
      },
      {
        tokenAddress: '2',
        amountString: '200',
      },
      {
        tokenAddress: '3',
        amountString: '300',
      },
    ];

    // Same same
    const tokenAmounts2: RailgunWalletTokenAmount[] = [
      {
        tokenAddress: '1',
        amountString: '100',
      },
      {
        tokenAddress: '2',
        amountString: '200',
      },
      {
        tokenAddress: '3',
        amountString: '300',
      },
    ];

    // Different addresses
    const tokenAmounts3: RailgunWalletTokenAmount[] = [
      {
        tokenAddress: '1',
        amountString: '100',
      },
      {
        tokenAddress: '3',
        amountString: '200',
      },
      {
        tokenAddress: '5',
        amountString: '300',
      },
    ];

    // Different amounts
    const tokenAmounts4: RailgunWalletTokenAmount[] = [
      {
        tokenAddress: '1',
        amountString: '100',
      },
      {
        tokenAddress: '2',
        amountString: '300',
      },
      {
        tokenAddress: '3',
        amountString: '200',
      },
    ];

    expect(compareTokenAmountArrays(tokenAmounts1, tokenAmounts2)).to.be.true;
    expect(compareTokenAmountArrays(tokenAmounts1, tokenAmounts3)).to.be.false;
    expect(compareTokenAmountArrays(tokenAmounts1, tokenAmounts4)).to.be.false;
  });
});
