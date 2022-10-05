import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  fullWalletForID,
  getEngine,
  viewOnlyWalletForID,
} from '../../core/engine';
import {
  createRailgunWallet,
  createViewOnlyRailgunWallet,
  getRailgunAddress,
  getWalletMnemonic,
  getWalletShareableViewingKey,
  loadWalletByID,
  unloadWalletByID,
  validateRailgunAddress,
} from '../wallets';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_MNEMONIC,
} from '../../../../test/mocks.test';
import { initTestEngine } from '../../../../test/setup.test';
import { RailgunWallet } from '@railgun-community/engine';
import { NetworkName } from '@railgun-community/shared-models';

chai.use(chaiAsPromised);
const { expect } = chai;

let wallet: RailgunWallet;

describe('wallets', () => {
  before(async () => {
    initTestEngine();
    const { railgunWalletInfo } = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      { [NetworkName.Ethereum]: 0, [NetworkName.Polygon]: 2 }, // creationBlockNumbers
    );
    if (!railgunWalletInfo) {
      throw new Error('Could not create wallet');
    }
    wallet = fullWalletForID(railgunWalletInfo.id);
  });

  it('Should create view only wallet', async () => {
    const { railgunWalletInfo } = await createViewOnlyRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      await wallet.generateShareableViewingKey(),
      undefined, // creationBlockNumbers
    );
    if (!railgunWalletInfo) {
      throw new Error('Could not create view-only wallet');
    }
    const viewOnlyWallet = viewOnlyWalletForID(railgunWalletInfo.id);
    expect(viewOnlyWallet).to.not.be.undefined;
    expect(railgunWalletInfo.railgunAddress).to.equal(wallet.getAddress());
  });

  it('Should get wallet address', async () => {
    const chain = undefined;
    const addressAny = await getRailgunAddress(chain, wallet.id);
    expect(addressAny).to.equal(
      '0zk1qyk9nn28x0u3rwn5pknglda68wrn7gw6anjw8gg94mcj6eq5u48tlrv7j6fe3z53lama02nutwtcqc979wnce0qwly4y7w4rls5cq040g7z8eagshxrw5ajy990',
    );
  });

  it('Should get wallet shareable viewing key', async () => {
    const shareableKey = await getWalletShareableViewingKey(wallet.id);
    expect(shareableKey).to.equal(
      '82a57670726976d94039646134623466306235343933613662613366376466303631316333653038343266376532626233643634306633313362323335663162373563316438306239a473707562d94030346164336335393738653064646561373030613336393932313861333461616336663736303437646661656131323966643530313464636338306534333961',
    );
  });

  it('Should get wallet mnemonic', async () => {
    const mnemonic = await getWalletMnemonic(MOCK_DB_ENCRYPTION_KEY, wallet.id);
    expect(mnemonic).to.equal(MOCK_MNEMONIC);
  });

  it('Should create and load wallet from valid mnemonic', async () => {
    const response = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    expect(response.railgunWalletInfo).to.not.be.undefined;
    expect(response.railgunWalletInfo?.id).to.be.a('string');
    expect(response.railgunWalletInfo?.railgunAddress).to.be.a('string');
    expect(response.railgunWalletInfo?.id).to.equal(wallet.id);

    const loadWalletResponse = await loadWalletByID(
      MOCK_DB_ENCRYPTION_KEY,
      response.railgunWalletInfo?.id ?? '',
      false, // isViewOnlyWallet
      undefined, // creationBlockNumbers
    );
    expect(loadWalletResponse.railgunWalletInfo).to.not.be.undefined;
    expect(loadWalletResponse.railgunWalletInfo?.id).to.equal(
      response.railgunWalletInfo?.id,
    );
    expect(loadWalletResponse.railgunWalletInfo?.railgunAddress).to.equal(
      response.railgunWalletInfo?.railgunAddress,
    );
  });

  it('Should load wallet from db after Engine wallet unload', async () => {
    expect(Object.keys(getEngine().wallets)).to.include(wallet.id);
    unloadWalletByID(wallet.id);
    expect(Object.keys(getEngine().wallets)).to.not.include(wallet.id);
    const loadWalletResponse = await loadWalletByID(
      MOCK_DB_ENCRYPTION_KEY,
      wallet.id,
      false, // isViewOnlyWallet
      undefined, // creationBlockNumbers
    );
    expect(loadWalletResponse.railgunWalletInfo).to.not.be.undefined;
    expect(loadWalletResponse.railgunWalletInfo?.id).to.equal(wallet.id);
    expect(loadWalletResponse.railgunWalletInfo?.railgunAddress).to.equal(
      wallet.getAddress(undefined),
    );
  });

  it('Should error for unknown load wallet', async () => {
    const loadWalletResponse = await loadWalletByID(
      MOCK_DB_ENCRYPTION_KEY,
      'unknown',
      false, // isViewOnlyWallet
      undefined, // creationBlockNumbers
    );
    expect(loadWalletResponse.error).to.equal('Could not load RAILGUN wallet.');
  });

  it('Should validate RAILGUN addresses', async () => {
    expect(validateRailgunAddress('0x9E9F988356f46744Ee0374A17a5Fa1a3A3cC3777'))
      .to.be.false;
    expect(validateRailgunAddress('9E9F988356f46744Ee0374A17a5Fa1a3A3cC3777'))
      .to.be.false;
    expect(
      validateRailgunAddress(
        'rgtestropsten1qyglk9smgj240x2xmj2laj7p5hexw0a30vvdqnv9gk020nsd7yzgwkgce9x',
      ),
    ).to.be.false;
    expect(
      validateRailgunAddress(
        '0zk1q8hxknrs97q8pjxaagwthzc0df99rzmhl2xnlxmgv9akv32sua0kfrv7j6fe3z53llhxknrs97q8pjxaagwthzc0df99rzmhl2xnlxmgv9akv32sua0kg0zpzts',
      ),
    ).to.be.true;
    expect(
      validateRailgunAddress(
        '0zk1qyqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqunpd9kxwatwqyqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqhshkca',
      ),
    ).to.be.true;
  });

  it('Should get wallet transaction history', async () => {
    const mnemonic = await getWalletMnemonic(MOCK_DB_ENCRYPTION_KEY, wallet.id);
    expect(mnemonic).to.equal(MOCK_MNEMONIC);
  });
});
