import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  NetworkName,
  FallbackProviderJsonConfig,
  isDefined,
  NETWORK_CONFIG,
} from '@railgun-community/shared-models';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_FALLBACK_PROVIDER_JSON_CONFIG_SEPOLIA,
} from '../../../../tests/mocks.test';
import { closeTestEngine, initTestEngine } from '../../../../tests/setup.test';
import { getFallbackProviderForNetwork } from '../providers';
import { loadProvider } from '../load-provider';
import { createRailgunWallet, walletForID } from '../../wallets/wallets';
import {
  getUTXOMerkletreeForNetwork,
  getTXIDMerkletreeForNetwork,
} from '../merkletree';
import {
  RailgunVersionedSmartContracts,
  RelayAdaptVersionedSmartContracts,
} from '@railgun-community/engine';
import { getTestTXIDVersion, isV2Test } from '../../../../tests/helper.test';

chai.use(chaiAsPromised);
const { expect } = chai;

const MOCK_MNEMONIC_PROVIDERS_ONLY =
  'pause crystal tornado alcohol genre cement fade large song like bag where';

const txidVersion = getTestTXIDVersion();

describe('providers', () => {
  before(async () => {
    await closeTestEngine();
    await initTestEngine();
  });
  after(async () => {
    await closeTestEngine();
  });

  it('Should load provider with json, pull fees, and check created objects', async () => {
    const response = await loadProvider(
      MOCK_FALLBACK_PROVIDER_JSON_CONFIG_SEPOLIA,
      NetworkName.EthereumSepolia,
      10_000, // pollingInterval
    );
    expect(response.feesSerialized).to.deep.equal({
      shieldFeeV2: '25',
      unshieldFeeV2: '25',
      shieldFeeV3: undefined,
      unshieldFeeV3: undefined,
    });

    expect(getFallbackProviderForNetwork(NetworkName.EthereumSepolia)).to.not.be
      .undefined;
    expect(() =>
      getFallbackProviderForNetwork(NetworkName.EthereumRopsten_DEPRECATED),
    ).to.throw;

    expect(getUTXOMerkletreeForNetwork(txidVersion, NetworkName.EthereumSepolia))
      .to.not.be.undefined;
    expect(() =>
      getUTXOMerkletreeForNetwork(
        txidVersion,
        NetworkName.EthereumRopsten_DEPRECATED,
      ),
    ).to.throw;

    // expect(getTXIDMerkletreeForNetwork(txidVersion, NetworkName.EthereumSepolia))
    //   .to.be.undefined; // Until poi.launchBlock is defined.
    expect(() =>
      getTXIDMerkletreeForNetwork(
        txidVersion,
        NetworkName.EthereumRopsten_DEPRECATED,
      ),
    ).to.throw;

    const { chain } = NETWORK_CONFIG[NetworkName.EthereumSepolia];
    expect(
      RailgunVersionedSmartContracts.getShieldApprovalContract(
        txidVersion,
        chain,
      ),
    ).to.not.be.undefined;

    if (isV2Test()) {
      // TODO-V3: Remove when ready
      expect(
        RelayAdaptVersionedSmartContracts.getRelayAdaptContract(
          txidVersion,
          chain,
        ),
      ).to.not.be.undefined;
    }

    const { chain: chainEthereumRopsten } =
      NETWORK_CONFIG[NetworkName.EthereumRopsten_DEPRECATED];
    expect(() =>
      RelayAdaptVersionedSmartContracts.getRelayAdaptContract(
        txidVersion,
        chainEthereumRopsten,
      ),
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
    expect(
      wallet.getUTXOMerkletree(
        txidVersion,
        NETWORK_CONFIG[NetworkName.EthereumSepolia].chain,
      ),
    ).to.not.be.undefined;
  }).timeout(15_000);

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
    ).rejectedWith('Invalid fallback provider config for chain 56');
  });
});
