/* eslint-disable @typescript-eslint/no-unused-vars */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  RailgunWallet,
  ByteLength,
  formatToByteLength,
  nToHex,
  randomHex,
  OutputType,
  Note,
  RailgunEngine,
} from '@railgun-community/engine';
import {
  NetworkName,
  ProofType,
  RailgunProveTransactionResponse,
} from '@railgun-community/shared-models';
import { PopulatedTransaction } from '@ethersproject/contracts';
import {
  initTestEngine,
  initTestEngineNetwork,
  setTestArtifacts,
} from '../../../test/setup.test';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_MEMO,
  MOCK_MNEMONIC,
  MOCK_TOKEN_ADDRESS,
  MOCK_TOKEN_AMOUNTS_TOKEN_1_ONLY,
  MOCK_TOKEN_FEE,
} from '../../../test/mocks.test';
import { createRailgunWallet } from '../../railgun/wallets/wallets';
import { fullWalletForID } from '../../railgun/core/engine';
import { getCachedProvedTransaction } from '../proof-cache';
import { generateWithdrawProof } from '../tx-proof-withdraw';

let railgunWallet: RailgunWallet;
let railgunWalletAddress: string;
let relayerRailgunAddress: string;

chai.use(chaiAsPromised);
const { expect } = chai;

const MOCK_POPULATED_TX = {} as PopulatedTransaction;

describe.skip('tx-proof-withdraw', () => {
  before(async () => {
    initTestEngine();
    await initTestEngineNetwork();
    setTestArtifacts();
    const { railgunWalletInfo } = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!railgunWalletInfo) {
      throw new Error('Expected railgunWalletInfo');
    }
    railgunWallet = fullWalletForID(railgunWalletInfo.id);
    railgunWalletAddress = railgunWallet.getAddress();
    const addressData = RailgunEngine.decodeAddress(railgunWalletAddress);

    const { railgunWalletInfo: relayerWalletInfo } = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!relayerWalletInfo) {
      throw new Error('Expected relayerWalletInfo');
    }
    relayerRailgunAddress = relayerWalletInfo.railgunAddress;

    const mockDepositAmount = BigInt('12500000000');
    const tokenAddress = formatToByteLength(
      MOCK_TOKEN_ADDRESS,
      ByteLength.UINT_256,
      false,
    );
    const random = nToHex(
      BigInt('147663908922529969478643753345904959450'),
      ByteLength.UINT_128,
    );

    const senderBlindingKey = randomHex(15);

    const depositNote = Note.create(
      addressData,
      random,
      mockDepositAmount,
      MOCK_TOKEN_ADDRESS,
      railgunWallet.getViewingKeyPair(),
      senderBlindingKey,
      OutputType.Transfer,
      MOCK_MEMO,
    );
    expect(depositNote.notePublicKey).to.equal(
      BigInt(
        '8646677792808778106426841491192581170072532636409694279739894688473037283422',
      ),
    );
    expect(depositNote.hash).to.equal(
      BigInt(
        '17847544257240351011885349052582675772817264504940544227356428415831210506037',
      ),
    );

    // const balances: Balances = {
    //   [tokenAddress]: {
    //     balance: mockDepositAmount,
    //     utxos: [
    //       {
    //         tree: 0,
    //         position: 0,
    //         txid: '123',
    //         spendtxid: '123',
    //         note: depositNote,
    //       },
    //     ],
    //   },
    // };
    // walletBalanceStub = Sinon.stub(
    //   RailgunWallet.prototype,
    //   'balances',
    // ).resolves(balances);

    // const network = NETWORK_CONFIG[NetworkName.HardHat];
    // const chainID = network.chainId;

    // const vpk = railgunWallet.getViewingKeyPair().privateKey;
    // const deposit = new ERC20Deposit(
    //   addressData.masterPublicKey,
    //   randomHex(16),
    //   mockDepositAmount,
    //   MOCK_TOKEN_ADDRESS,
    // );
    // const { preImage, encryptedRandom } = deposit.serialize(vpk);

    // const commitment: GeneratedCommitment = {
    //   hash: '',
    //   txid: '123',
    //   preImage: {
    //     value: nToHex(deposit.value, ByteLength.UINT_128),
    //     npk: preImage.npk,
    //     token: preImage.token,
    //   },
    //   encryptedRandom,
    // };
    // const merkletree = getEngine().merkletree[chainID].erc20;
    // const length = await merkletree.getTreeLength(0);
    // await merkletree.queueLeaves(0, length, [commitment]);
    // await railgunWallet.scan(chainID);

    // console.log(await merkletree.getTreeLength(0));
    // console.log(await merkletree.getCommitment(0, 0));
    // console.log(await railgunWallet.getWalletDetails(chainID));
    // console.log(await railgunWallet.balances(chainID));
  });

  it('Should prove withdraw', async () => {
    const sendWithPublicWallet = false;
    const response: RailgunProveTransactionResponse =
      await generateWithdrawProof(
        NetworkName.HardHat,
        MOCK_ETH_WALLET_ADDRESS,
        railgunWallet.id,
        MOCK_DB_ENCRYPTION_KEY,
        MOCK_TOKEN_AMOUNTS_TOKEN_1_ONLY,
        relayerRailgunAddress,
        MOCK_TOKEN_FEE,
        sendWithPublicWallet,
        () => {}, // progressCallback
      );
    expect(response.error).to.equal(undefined, `Error: ${response.error}`);
    expect(getCachedProvedTransaction()).to.deep.equal({
      proofType: ProofType.Withdraw,
      populatedTransaction: MOCK_POPULATED_TX,
      railgunWalletID: railgunWallet.id,
      memoText: undefined,
      toWalletAddress: MOCK_ETH_WALLET_ADDRESS,
      tokenAmounts: MOCK_TOKEN_AMOUNTS_TOKEN_1_ONLY,
      relayerRailgunAddress,
      relayerFeeTokenAmount: MOCK_TOKEN_FEE,
    });
  }).timeout(30000);
});
// .timeout(50000);
