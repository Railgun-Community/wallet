import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  NetworkName,
  FallbackProviderJsonConfig,
} from '@railgun-community/shared-models';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
} from '../../../../test/mocks.test';
import { initTestEngine } from '../../../../test/setup.test';
import { walletForID } from '../engine';
import {
  getProxyContractForNetwork,
  getMerkleTreeForNetwork,
  getProviderForNetwork,
  loadProvider,
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
  it('Should load provider with json, pull fees, and check created objects', async () => {
    const shouldDebug = true;
    const response = await loadProvider(
      MOCK_FALLBACK_PROVIDER_JSON_CONFIG,
      NetworkName.Polygon,
      shouldDebug,
    );
    expect(response.error).to.be.undefined;
    expect(response.feesSerialized).to.deep.equal({
      deposit: '0x19',
      nft: '0x00',
      withdraw: '0x19',
    });

    expect(getProviderForNetwork(NetworkName.Polygon)).to.not.be.undefined;
    expect(() => getProviderForNetwork(NetworkName.EthereumRopsten)).to.throw;

    expect(getMerkleTreeForNetwork(NetworkName.Polygon)).to.not.be.undefined;
    expect(() => getMerkleTreeForNetwork(NetworkName.EthereumRopsten)).to.throw;

    expect(getProxyContractForNetwork(NetworkName.Polygon)).to.not.be.undefined;
    expect(() => getProxyContractForNetwork(NetworkName.EthereumRopsten)).to
      .throw;

    // Check that new wallet has merkletree.
    const { railgunWalletInfo } = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC_PROVIDERS_ONLY,
      undefined, // creationBlockNumbers
    );
    if (!railgunWalletInfo) {
      throw new Error('Expected railgunWalletInfo.');
    }
    const wallet = walletForID(railgunWalletInfo.id);
    expect(wallet.merkletrees[0][137]).to.not.be.undefined;
    expect(wallet.merkletrees[0][1]).to.be.undefined;
    expect(wallet.merkletrees[0][3]).to.be.undefined;
  }).timeout(20000);

  it('Should fail with invalid json', async () => {
    const shouldDebug = true;
    const response = await loadProvider(
      {} as FallbackProviderJsonConfig,
      NetworkName.BNBChain,
      shouldDebug,
    );
    expect(response.error).to.equal(
      'Proxy contract not yet loaded for network BNB Chain',
    );
  });
});
