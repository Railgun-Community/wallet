import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon, { SinonStub } from 'sinon';
import { RailgunWallet } from '@railgun-community/engine';
import { EphemeralKeyManager } from '../ephemeral-key-manager';
import { HDNodeWallet } from 'ethers';
import { Chain, ChainType } from '@railgun-community/shared-models';

chai.use(chaiAsPromised);
const { expect } = chai;

const MOCK_ENCRYPTION_KEY = '0x1234';
const MOCK_MNEMONIC = 'test test test test test test test test test test test junk';
const MOCK_CHAIN: Chain = { type: ChainType.EVM, id: 1 };

describe('ephemeral-key-manager', () => {
  let getEphemeralWalletStub: SinonStub;
  let getEphemeralKeyIndexStub: SinonStub;
  let setEphemeralKeyIndexStub: SinonStub;
  let getTransactionHistoryStub: SinonStub;
  let manager: EphemeralKeyManager;

  beforeEach(() => {
    const railgunWallet = {
      getEphemeralWallet: async () => {},
      getEphemeralKeyIndex: async () => {},
      setEphemeralKeyIndex: async () => {},
      getTransactionHistory: async () => {},
    } as unknown as RailgunWallet;

    getEphemeralWalletStub = Sinon.stub(railgunWallet, 'getEphemeralWallet');
    getEphemeralKeyIndexStub = Sinon.stub(railgunWallet, 'getEphemeralKeyIndex');
    setEphemeralKeyIndexStub = Sinon.stub(railgunWallet, 'setEphemeralKeyIndex');
    getTransactionHistoryStub = Sinon.stub(railgunWallet, 'getTransactionHistory');

    manager = new EphemeralKeyManager(railgunWallet, MOCK_ENCRYPTION_KEY);
  });

  it('Should get account at index', async () => {
    const mockWallet = HDNodeWallet.fromPhrase(MOCK_MNEMONIC);
    getEphemeralWalletStub.resolves(mockWallet);

    const account = await manager.getAccount(0);
    expect(account.address).to.equal(mockWallet.address);
    expect(getEphemeralWalletStub.calledWith(MOCK_ENCRYPTION_KEY, 0)).to.be.true;
  });

  it('Should get current account', async () => {
    const mockWallet = HDNodeWallet.fromPhrase(MOCK_MNEMONIC);
    getEphemeralKeyIndexStub.resolves(5);
    getEphemeralWalletStub.resolves(mockWallet);

    const account = await manager.getCurrentAccount();
    expect(account.address).to.equal(mockWallet.address);
    expect(getEphemeralKeyIndexStub.called).to.be.true;
    expect(getEphemeralWalletStub.calledWith(MOCK_ENCRYPTION_KEY, 5)).to.be.true;
  });

  it('Should get next account and increment index', async () => {
    const mockWallet = HDNodeWallet.fromPhrase(MOCK_MNEMONIC);
    getEphemeralKeyIndexStub.resolves(5);
    getEphemeralWalletStub.resolves(mockWallet);
    setEphemeralKeyIndexStub.resolves();

    const account = await manager.getNextAccount();
    expect(account.address).to.equal(mockWallet.address);
    expect(getEphemeralKeyIndexStub.called).to.be.true;
    expect(setEphemeralKeyIndexStub.calledWith(6)).to.be.true;
    expect(getEphemeralWalletStub.calledWith(MOCK_ENCRYPTION_KEY, 6)).to.be.true;
  });

  it('Should scan history and recover index', async () => {
    const mockWallet0 = HDNodeWallet.fromPhrase(MOCK_MNEMONIC, undefined, "m/44'/60'/0'/7702/0");
    const mockWallet1 = HDNodeWallet.fromPhrase(MOCK_MNEMONIC, undefined, "m/44'/60'/0'/7702/1");
    const mockWallet2 = HDNodeWallet.fromPhrase(MOCK_MNEMONIC, undefined, "m/44'/60'/0'/7702/2");

    getEphemeralWalletStub.withArgs(MOCK_ENCRYPTION_KEY, 0).resolves(mockWallet0);
    getEphemeralWalletStub.withArgs(MOCK_ENCRYPTION_KEY, 1).resolves(mockWallet1);
    getEphemeralWalletStub.withArgs(MOCK_ENCRYPTION_KEY, 2).resolves(mockWallet2);
    // Default resolve for other calls (like gap scanning)
    getEphemeralWalletStub.resolves(mockWallet2);

    // Mock history with unshield to index 1
    getTransactionHistoryStub.resolves([
      {
        unshieldTokenAmounts: [
          { recipientAddress: mockWallet1.address },
        ],
      },
    ]);

    getEphemeralKeyIndexStub.resolves(0); // Stored index is 0 (outdated)
    setEphemeralKeyIndexStub.resolves();

    const recoveredIndex = await manager.scanHistoryForEphemeralIndex(MOCK_CHAIN);

    expect(recoveredIndex).to.equal(2); // Should be index 1 + 1
    expect(setEphemeralKeyIndexStub.calledWith(2)).to.be.true;
  });

  it('Should not update index if stored is higher', async () => {
    const mockWallet0 = HDNodeWallet.fromPhrase(MOCK_MNEMONIC, undefined, "m/44'/60'/0'/7702/0");
    const mockWalletRandom = HDNodeWallet.createRandom();
    
    getEphemeralWalletStub.resolves(mockWalletRandom); // Default for non-matching indices
    getEphemeralWalletStub.withArgs(MOCK_ENCRYPTION_KEY, 0).resolves(mockWallet0);

    getTransactionHistoryStub.resolves([
      {
        unshieldTokenAmounts: [
          { recipientAddress: mockWallet0.address },
        ],
      },
    ]);

    getEphemeralKeyIndexStub.resolves(5); // Stored index is 5 (higher)
    setEphemeralKeyIndexStub.resolves();

    const recoveredIndex = await manager.scanHistoryForEphemeralIndex(MOCK_CHAIN);

    expect(recoveredIndex).to.equal(1); // Found index 0 + 1 = 1
    expect(setEphemeralKeyIndexStub.called).to.be.false; // Should not update
  });
});
