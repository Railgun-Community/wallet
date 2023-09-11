import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  NetworkName,
  FallbackProviderJsonConfig,
  isDefined,
} from '@railgun-community/shared-models';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_FALLBACK_PROVIDER_JSON_CONFIG_MUMBAI,
} from '../../../../tests/mocks.test';
import { closeTestEngine, initTestEngine } from '../../../../tests/setup.test';
import { walletForID } from '../engine';
import {
  getUTXOMerkletreeForNetwork,
  getFallbackProviderForNetwork,
  loadProvider,
  getRelayAdaptContractForNetwork,
  getRailgunSmartWalletContractForNetwork,
} from '../providers';
import { createRailgunWallet } from '../../wallets/wallets';

chai.use(chaiAsPromised);
const { expect } = chai;

const MOCK_MNEMONIC_PROVIDERS_ONLY =
  'pause crystal tornado alcohol genre cement fade large song like bag where';

describe('providers', () => {
  before(async () => {
    initTestEngine();
  });
  after(async () => {
    await closeTestEngine();
  });

  it('Should load provider with json, pull fees, and check created objects', async () => {
    const response = await loadProvider(
      MOCK_FALLBACK_PROVIDER_JSON_CONFIG_MUMBAI,
      NetworkName.PolygonMumbai,
      10000, // pollingInterval
    );
    expect(response.feesSerialized).to.deep.equal({
      shield: '25',
      unshield: '25',
      nft: '25',
    });

    expect(getFallbackProviderForNetwork(NetworkName.PolygonMumbai)).to.not.be
      .undefined;
    expect(() =>
      getFallbackProviderForNetwork(NetworkName.EthereumRopsten_DEPRECATED),
    ).to.throw;

    expect(getUTXOMerkletreeForNetwork(NetworkName.PolygonMumbai)).to.not.be
      .undefined;
    expect(() =>
      getUTXOMerkletreeForNetwork(NetworkName.EthereumRopsten_DEPRECATED),
    ).to.throw;

    expect(getRailgunSmartWalletContractForNetwork(NetworkName.PolygonMumbai))
      .to.not.be.undefined;
    expect(() =>
      getRailgunSmartWalletContractForNetwork(
        NetworkName.EthereumRopsten_DEPRECATED,
      ),
    ).to.throw;

    expect(getRelayAdaptContractForNetwork(NetworkName.PolygonMumbai)).to.not.be
      .undefined;
    expect(() =>
      getRelayAdaptContractForNetwork(NetworkName.EthereumRopsten_DEPRECATED),
    ).to.throw;

    // Check that new wallet has merkletree.
    const railgunWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC_PROVIDERS_ONLY,
      undefined, // creationBlockNumbers
    );
    if (!isDefined(railgunWalletInfo)) {
      throw new Error('Expected railgunWalletInfo.');
    }
    const wallet = walletForID(railgunWalletInfo.id);
    expect(wallet.utxoMerkletrees[0][80001]).to.not.be.undefined;
    expect(wallet.utxoMerkletrees[0][1]).to.be.undefined;
    expect(wallet.utxoMerkletrees[0][3]).to.be.undefined;
  }).timeout(20000);

  it('Should fail with invalid chain ID', async () => {
    await expect(
      loadProvider(
        { chainId: 55 } as FallbackProviderJsonConfig,
        NetworkName.BNBChain,
        10000, // pollingInterval
      ),
    ).rejectedWith('Invalid chain ID');
  });

  it('Should fail with invalid json', async () => {
    await expect(
      loadProvider(
        { chainId: 56 } as FallbackProviderJsonConfig,
        NetworkName.BNBChain,
        10000, // pollingInterval
      ),
    ).rejectedWith(
      'Invalid fallback provider config for chain 56: Cannot read properties of undefined (reading reduce)',
    );
  });
});
