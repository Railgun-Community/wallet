import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { fullWalletForID } from '../../core/engine';
import { createRailgunWallet } from '../../wallets/wallets';
import { getWalletTransactionHistory } from '../transaction-history';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_MNEMONIC_2,
} from '../../../../tests/mocks.test';
import {
  initTestEngine,
  initTestEngineNetwork,
} from '../../../../tests/setup.test';
import { RailgunWallet } from '@railgun-community/engine';
import {
  Chain,
  ChainType,
  NetworkName,
} from '@railgun-community/shared-models';

chai.use(chaiAsPromised);
const { expect } = chai;

const POLYGON_CHAIN: Chain = { type: ChainType.EVM, id: 137 };
let wallet: RailgunWallet;

describe('transaction-history', () => {
  before(async () => {
    initTestEngine();
    await initTestEngineNetwork();
    const { railgunWalletInfo, error } = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC_2,
      { [NetworkName.Ethereum]: 0, [NetworkName.Polygon]: 2 }, // creationBlockNumbers
    );
    if (!railgunWalletInfo) {
      throw new Error(`Could not create wallet: ${error}`);
    }
    wallet = fullWalletForID(railgunWalletInfo.id);
  });

  // TODO: This should ensure merkletree is scanned first.
  it.skip('Should get wallet transaction history', async () => {
    const resp = await getWalletTransactionHistory(
      POLYGON_CHAIN,
      wallet.id,
      undefined,
    );
    if (resp.items == null) {
      throw new Error('items is null');
    }
    expect(resp.items.length).to.be.greaterThanOrEqual(6);
    resp.items.forEach(item => {
      expect(item.txid.length === 66); // '0x' + 32 bytes
    });
  });
});
