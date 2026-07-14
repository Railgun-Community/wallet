import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { getEngine } from '../../core/engine';
import {
  createRailgunWallet,
  createViewOnlyRailgunWallet,
  fullWalletForID,
  getCurrentEphemeralAddress,
  getRailgunAddress,
  getWalletMnemonic,
  getWalletShareableViewingKey,
  loadWalletByID,
  unloadWalletByID,
  validateRailgunAddress,
  viewOnlyWalletForID,
} from '../wallets';
import { HDNodeWallet } from 'ethers';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_MNEMONIC_2,
} from '../../../../tests/mocks.test';
import {
  closeTestEngine,
  initTestEngine,
  initTestEngineNetworks,
} from '../../../../tests/setup.test';
import { RailgunWallet } from '@railgun-community/engine';
import { NetworkName, isDefined } from '@railgun-community/shared-models';

chai.use(chaiAsPromised);
const { expect } = chai;

let wallet: RailgunWallet;

describe('wallets', () => {
  before(async function run() {
    this.timeout(60_000);
    await initTestEngine();
    await initTestEngineNetworks();
    const railgunWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC_2,
      { [NetworkName.Ethereum]: 0, [NetworkName.Polygon]: 2 }, // creationBlockNumbers
    );
    if (!isDefined(railgunWalletInfo)) {
      throw new Error(`Could not create wallet`);
    }
    wallet = fullWalletForID(railgunWalletInfo.id);
  });
  after(async () => {
    await closeTestEngine();
  });

  it('Should create view only wallet', async () => {
    const railgunWalletInfo = await createViewOnlyRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      wallet.generateShareableViewingKey(),
      undefined, // creationBlockNumbers
    );
    if (!isDefined(railgunWalletInfo)) {
      throw new Error('Could not create view-only wallet');
    }
    const viewOnlyWallet = viewOnlyWalletForID(railgunWalletInfo.id);
    expect(viewOnlyWallet).to.not.be.undefined;
    expect(railgunWalletInfo.railgunAddress).to.equal(wallet.getAddress());
  }).timeout(60_000);

  it('Should get wallet address', () => {
    const addressAny = getRailgunAddress(wallet.id);
    expect(addressAny).to.equal(
      '0zk1qykzjxctynyz4z43pukckpv43jyzhyvy0ehrd5wuc54l5enqf9qfrrv7j6fe3z53la7enqphqvxys9aqyp9xx0km95ehqslx8apmu8l7anc7emau4tvsultrkvd',
    );
  });

  it('Should get wallet shareable viewing key', async () => {
    const shareableKey = await getWalletShareableViewingKey(wallet.id);
    expect(shareableKey).to.equal(
      '82a57670726976d94032643030623234396632646337313236303565336263653364373665376631313931373933363436393365333931666566643963323764303161396262336433a473707562d94030633661376436386331663437303262613764666134613361353236323035303765386637366632393139326363666637653861366231303637393062316165',
    );
  });

  it('Should get wallet mnemonic', async () => {
    const mnemonic = await getWalletMnemonic(MOCK_DB_ENCRYPTION_KEY, wallet.id);
    expect(mnemonic).to.equal(MOCK_MNEMONIC_2);
  });

  it('Should create and load wallet from valid mnemonic', async () => {
    const railgunWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC_2,
      undefined, // creationBlockNumbers
    );
    expect(railgunWalletInfo.railgunAddress).to.be.a('string');
    expect(railgunWalletInfo.id).to.equal(wallet.id);

    const loadWalletInfo = await loadWalletByID(
      MOCK_DB_ENCRYPTION_KEY,
      railgunWalletInfo.id,
      false, // isViewOnlyWallet
    );
    expect(loadWalletInfo.railgunAddress).to.be.a('string');
    expect(loadWalletInfo.id).to.equal(wallet.id);
  });

  it('Should create and load wallet from mnemonic with password', async () => {
    const mnemonicPassword = 'test mnemonic password';
    const railgunWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC_2,
      undefined, // creationBlockNumbers
      undefined, // railgunWalletDerivationIndex
      mnemonicPassword,
    );

    expect(railgunWalletInfo.railgunAddress).to.be.a('string');
    expect(railgunWalletInfo.id).to.not.equal(wallet.id);

    // The mnemonic password is never persisted, so it must be supplied again on
    // load to reproduce the wallet ID.
    unloadWalletByID(railgunWalletInfo.id);
    const loadWalletInfo = await loadWalletByID(
      MOCK_DB_ENCRYPTION_KEY,
      railgunWalletInfo.id,
      false, // isViewOnlyWallet
      mnemonicPassword,
    );
    expect(loadWalletInfo.id).to.equal(railgunWalletInfo.id);
    expect(loadWalletInfo.railgunAddress).to.equal(railgunWalletInfo.railgunAddress);
  });

  it('Should fail to load a mnemonic-password wallet without the password', async () => {
    const railgunWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC_2,
      undefined, // creationBlockNumbers
      undefined, // railgunWalletDerivationIndex
      'test mnemonic password',
    );

    // Missing password and wrong password must both be rejected — the engine
    // verifies the supplied password reproduces the wallet ID.
    unloadWalletByID(railgunWalletInfo.id);
    await expect(
      loadWalletByID(
        MOCK_DB_ENCRYPTION_KEY,
        railgunWalletInfo.id,
        false, // isViewOnlyWallet
      ),
    ).rejectedWith('Could not load RAILGUN wallet');

    await expect(
      loadWalletByID(
        MOCK_DB_ENCRYPTION_KEY,
        railgunWalletInfo.id,
        false, // isViewOnlyWallet
        'wrong password',
      ),
    ).rejectedWith('Could not load RAILGUN wallet');
  });

  it('Should load wallet from db after Engine wallet unload', async () => {
    expect(Object.keys(getEngine().wallets)).to.include(wallet.id);
    unloadWalletByID(wallet.id);
    expect(Object.keys(getEngine().wallets)).to.not.include(wallet.id);
    const railgunWalletInfo = await loadWalletByID(
      MOCK_DB_ENCRYPTION_KEY,
      wallet.id,
      false, // isViewOnlyWallet
    );
    expect(railgunWalletInfo.id).to.equal(wallet.id);
    expect(railgunWalletInfo.railgunAddress).to.equal(
      wallet.getAddress(undefined),
    );
  });

  it('Should error for unknown load wallet', async () => {
    await expect(
      loadWalletByID(
        MOCK_DB_ENCRYPTION_KEY,
        'unknown',
        false, // isViewOnlyWallet
      ),
    ).rejectedWith('Could not load RAILGUN wallet');
  });

  it('Should resolve the current ephemeral address to a pinned override (7702 authority == to)', async () => {
    // Level 2 single-sources `to`/recipients on the signer's address. With an override pinned,
    // getCurrentEphemeralAddress must return the override address (the EIP-7702 authorization
    // authority), not a separately-derived HD wallet — otherwise `to` != authority and the
    // sponsored execute no-ops on-chain.
    // Resolve the live wallet instance — an earlier spec unloads/reloads wallet.id, replacing
    // the engine's instance, so mutate the one getCurrentEphemeralAddress will actually resolve.
    const liveWallet = fullWalletForID(wallet.id);
    const override = HDNodeWallet.createRandom();
    await liveWallet.setCurrentEphemeralWallet(override);
    try {
      const address = await getCurrentEphemeralAddress(
        wallet.id,
        MOCK_DB_ENCRYPTION_KEY,
        NetworkName.Ethereum,
      );
      expect(address).to.equal(override.address);
    } finally {
      // Shared fixture — clear the override so it cannot leak into other specs.
      liveWallet.ephemeralWalletOverride = undefined;
    }
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
});
