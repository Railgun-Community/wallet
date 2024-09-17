import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon, { SinonStub } from 'sinon';
import {
  NetworkName,
  EVMGasType,
  TransactionGasDetails,
} from '@railgun-community/shared-models';
import {
  closeTestEngine,
  initTestEngine,
  initTestEngineNetworks,
} from '../../../tests/setup.test';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_MNEMONIC,
  MOCK_TOKEN_AMOUNTS,
} from '../../../tests/mocks.test';
import {
  populateShieldBaseToken,
  gasEstimateForShieldBaseToken,
} from '../tx-shield-base-token';
import * as txGasDetailsModule from '../tx-gas-details';
import { createRailgunWallet } from '../../railgun/wallets/wallets';
import { ByteUtils } from '@railgun-community/engine';
import { getTestTXIDVersion } from '../../../tests/helper.test';

let getGasEstimateStub: SinonStub;
let gasEstimateStub: SinonStub;
let sendTxStub: SinonStub;
let railgunAddress: string;

const txidVersion = getTestTXIDVersion();

const shieldPrivateKey = ByteUtils.randomHex(32);

chai.use(chaiAsPromised);
const { expect } = chai;

const gasDetails: TransactionGasDetails = {
  evmGasType: EVMGasType.Type2,
  gasEstimate: 1000n,
  maxFeePerGas: BigInt('0x1000'),
  maxPriorityFeePerGas: BigInt('0x100'),
};

const stubGetGasEstimate = () => {
  getGasEstimateStub = Sinon.stub(
    txGasDetailsModule,
    'getGasEstimate',
  ).resolves(200n);
};

const stubGetGasEstimateFailure = () => {
  getGasEstimateStub = Sinon.stub(txGasDetailsModule, 'getGasEstimate').rejects(
    new Error('test rejection - gas estimate'),
  );
};

describe('tx-shield-base-token', () => {
  before(async function run() {
    this.timeout(60_000);
    await initTestEngine();
    await initTestEngineNetworks();
    const railgunWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );

    railgunAddress = railgunWalletInfo.railgunAddress;
  });
  afterEach(() => {
    gasEstimateStub?.restore();
    sendTxStub?.restore();
    getGasEstimateStub?.restore();
  });
  after(async () => {
    await closeTestEngine();
  });

  it('Should get gas estimate for valid shield base token', async () => {
    stubGetGasEstimate();
    const rsp = await gasEstimateForShieldBaseToken(
      txidVersion,
      NetworkName.Polygon,
      railgunAddress,
      shieldPrivateKey,
      MOCK_TOKEN_AMOUNTS[0],
      MOCK_ETH_WALLET_ADDRESS,
    );
    expect(rsp.gasEstimate).to.equal(200n);
  });

  it('Should error on gas estimates for invalid shield base token', async () => {
    stubGetGasEstimate();
    await expect(
      gasEstimateForShieldBaseToken(
        txidVersion,
        NetworkName.Polygon,
        '123456789',
        shieldPrivateKey,
        MOCK_TOKEN_AMOUNTS[0],
        MOCK_ETH_WALLET_ADDRESS,
      ),
    ).rejectedWith('Invalid RAILGUN address.');
  });

  it('Should error for ethers rejections', async () => {
    stubGetGasEstimateFailure();
    await expect(
      gasEstimateForShieldBaseToken(
        txidVersion,
        NetworkName.Polygon,
        railgunAddress,
        shieldPrivateKey,
        MOCK_TOKEN_AMOUNTS[0],
        MOCK_ETH_WALLET_ADDRESS,
      ),
    ).rejectedWith('test rejection - gas estimate');
  });

  it('Should send tx for valid shield base token', async () => {
    stubGetGasEstimate();
    const { transaction } = await populateShieldBaseToken(
      txidVersion,
      NetworkName.Polygon,
      railgunAddress,
      shieldPrivateKey,
      MOCK_TOKEN_AMOUNTS[0],
      gasDetails,
    );
    expect(transaction).to.be.an('object');
    expect(transaction.data).to.be.a('string');
    expect(transaction.to).to.be.a('string');
  });

  it('Should error on send tx for invalid shield base token', async () => {
    stubGetGasEstimate();
    await expect(
      populateShieldBaseToken(
        txidVersion,
        NetworkName.Polygon,
        '123456789',
        shieldPrivateKey,
        MOCK_TOKEN_AMOUNTS[0],
        gasDetails,
      ),
    ).rejectedWith('Invalid RAILGUN address.');
  });
});
