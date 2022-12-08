import { FallbackProvider } from '@ethersproject/providers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { BigNumber } from '@ethersproject/bignumber';
import Sinon, { SinonStub } from 'sinon';
import {
  NetworkName,
  deserializeTransaction,
  EVMGasType,
  TransactionGasDetailsSerialized,
  RailgunWalletTokenAmountRecipient,
} from '@railgun-community/shared-models';
import {
  initTestEngine,
  initTestEngineNetwork,
} from '../../../test/setup.test';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_MNEMONIC,
  MOCK_NFT_RECIPIENTS,
  MOCK_RAILGUN_WALLET_ADDRESS,
  MOCK_TOKEN_ADDRESS,
  MOCK_TOKEN_ADDRESS_2,
} from '../../../test/mocks.test';
import {
  populateShield,
  gasEstimateForShield,
  getShieldPrivateKeySignatureMessage,
} from '../tx-shield';
import { decimalToHexString } from '../../../utils/format';
import { createRailgunWallet } from '../../railgun/wallets/wallets';
import { getRandomBytes } from '../../railgun';

let gasEstimateStub: SinonStub;
let sendTxStub: SinonStub;

const shieldPrivateKey = getRandomBytes(32);

chai.use(chaiAsPromised);
const { expect } = chai;

const gasDetailsSerialized: TransactionGasDetailsSerialized = {
  evmGasType: EVMGasType.Type2,
  gasEstimateString: '0x00',
  maxFeePerGasString: '0x1000',
  maxPriorityFeePerGasString: '0x100',
};

const MOCK_TOKEN_AMOUNT_RECIPIENTS: RailgunWalletTokenAmountRecipient[] = [
  {
    tokenAddress: MOCK_TOKEN_ADDRESS,
    amountString: '0x100',
    recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
  },
  {
    tokenAddress: MOCK_TOKEN_ADDRESS_2,
    amountString: '0x200',
    recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
  },
];

const MOCK_TOKEN_AMOUNT_RECIPIENTS_INVALID: RailgunWalletTokenAmountRecipient[] =
  [
    {
      tokenAddress: MOCK_TOKEN_ADDRESS,
      amountString: '0x100',
      recipientAddress: '0x1234',
    },
    {
      tokenAddress: MOCK_TOKEN_ADDRESS_2,
      amountString: '0x200',
      recipientAddress: '0x1234',
    },
  ];

const stubSuccess = () => {
  gasEstimateStub = Sinon.stub(
    FallbackProvider.prototype,
    'estimateGas',
  ).resolves(BigNumber.from(decimalToHexString(200)));
};

const stubFailure = () => {
  gasEstimateStub = Sinon.stub(
    FallbackProvider.prototype,
    'estimateGas',
  ).rejects(new Error('test rejection - gas estimate'));
};

describe('tx-shield', () => {
  before(async () => {
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
  });
  afterEach(() => {
    gasEstimateStub?.restore();
    sendTxStub?.restore();
  });

  it('Should get expected signature message for shieldPrivateKey', () => {
    expect(getShieldPrivateKeySignatureMessage()).to.equal('RAILGUN_SHIELD');
  });

  it('Should get gas estimate for valid shield', async () => {
    stubSuccess();
    const rsp = await gasEstimateForShield(
      NetworkName.Polygon,
      shieldPrivateKey,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      MOCK_NFT_RECIPIENTS,
      MOCK_ETH_WALLET_ADDRESS,
    );
    expect(rsp.error).to.be.undefined;
    expect(rsp.gasEstimateString).to.equal(decimalToHexString(200));
  });

  it('Should error on gas estimates for invalid shield', async () => {
    stubSuccess();
    const rsp = await gasEstimateForShield(
      NetworkName.Polygon,
      shieldPrivateKey,
      MOCK_TOKEN_AMOUNT_RECIPIENTS_INVALID,
      MOCK_NFT_RECIPIENTS,
      MOCK_ETH_WALLET_ADDRESS,
    );
    expect(rsp.error).to.equal('Invalid RAILGUN address.');
  });

  it('Should error for ethers rejections', async () => {
    stubFailure();
    const rsp = await gasEstimateForShield(
      NetworkName.Polygon,
      shieldPrivateKey,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      MOCK_NFT_RECIPIENTS,
      MOCK_ETH_WALLET_ADDRESS,
    );
    expect(rsp.error).to.equal('test rejection - gas estimate');
  });

  it('Should send tx for valid shield', async () => {
    stubSuccess();
    const rsp = await populateShield(
      NetworkName.Polygon,
      shieldPrivateKey,
      MOCK_TOKEN_AMOUNT_RECIPIENTS,
      MOCK_NFT_RECIPIENTS,
      gasDetailsSerialized,
    );
    expect(rsp.error).to.be.undefined;
    const parsedTx = deserializeTransaction(
      rsp.serializedTransaction ?? '',
      2,
      1,
    );
    expect(parsedTx).to.be.an('object');
    expect(parsedTx.data).to.be.a('string');
    expect(parsedTx.to).to.be.a('string');
  });

  it('Should error on send tx for invalid shield', async () => {
    stubSuccess();
    const rsp = await populateShield(
      NetworkName.Polygon,
      shieldPrivateKey,
      MOCK_TOKEN_AMOUNT_RECIPIENTS_INVALID,
      MOCK_NFT_RECIPIENTS,
      gasDetailsSerialized,
    );
    expect(rsp.error).to.equal('Invalid RAILGUN address.');
  });
});
