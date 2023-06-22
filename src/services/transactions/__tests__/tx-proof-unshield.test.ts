/* eslint-disable @typescript-eslint/no-unused-vars */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  RailgunWallet,
  ByteLength,
  nToHex,
  OutputType,
  TransactNote,
  RailgunEngine,
  getTokenDataERC20,
} from '@railgun-community/engine';
import {
  NetworkName,
  ProofType,
  RailgunNFTAmountRecipient,
  RailgunERC20AmountRecipient,
  isDefined,
} from '@railgun-community/shared-models';
import {
  closeTestEngine,
  initTestEngine,
  initTestEngineNetwork,
} from '../../../tests/setup.test';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_ETH_WALLET_ADDRESS,
  MOCK_MEMO,
  MOCK_MNEMONIC,
  MOCK_NFT_AMOUNT_RECIPIENTS,
  MOCK_TOKEN_ADDRESS,
  MOCK_TOKEN_AMOUNTS_TOKEN_1_ONLY,
  MOCK_TOKEN_FEE,
} from '../../../tests/mocks.test';
import { createRailgunWallet } from '../../railgun/wallets/wallets';
import { fullWalletForID } from '../../railgun/core/engine';
import { getCachedProvedTransaction } from '../proof-cache';
import { generateUnshieldProof } from '../tx-proof-unshield';
import { ContractTransaction } from 'ethers';

let railgunWallet: RailgunWallet;
let railgunWalletAddress: string;
let relayerFeeERC20AmountRecipient: RailgunERC20AmountRecipient;
let erc20AmountRecipients: RailgunERC20AmountRecipient[];
let nftAmountRecipients: RailgunNFTAmountRecipient[];

chai.use(chaiAsPromised);
const { expect } = chai;

const MOCK_TRANSACTION = {} as ContractTransaction;

const overallBatchMinGasPrice = BigInt('0x1000');

describe.skip('tx-proof-unshield', () => {
  before(async () => {
    initTestEngine();
    await initTestEngineNetwork();
    const railgunWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!isDefined(railgunWalletInfo)) {
      throw new Error('Expected railgunWalletInfo');
    }
    railgunWallet = fullWalletForID(railgunWalletInfo.id);
    railgunWalletAddress = railgunWallet.getAddress();
    const receiverAddressData =
      RailgunEngine.decodeAddress(railgunWalletAddress);

    erc20AmountRecipients = MOCK_TOKEN_AMOUNTS_TOKEN_1_ONLY.map(
      erc20Amount => ({
        ...erc20Amount,
        recipientAddress: MOCK_ETH_WALLET_ADDRESS,
      }),
    );
    nftAmountRecipients = MOCK_NFT_AMOUNT_RECIPIENTS;

    const relayerWalletInfo = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!isDefined(relayerWalletInfo)) {
      throw new Error('Expected relayerWalletInfo');
    }
    const relayerRailgunAddress = relayerWalletInfo.railgunAddress;
    relayerFeeERC20AmountRecipient = {
      ...MOCK_TOKEN_FEE,
      recipientAddress: relayerRailgunAddress,
    };

    const mockShieldAmount = BigInt('12500000000');
    const tokenData = getTokenDataERC20(MOCK_TOKEN_ADDRESS);
    const random = nToHex(
      BigInt('147663908922529969478643753345904959450'),
      ByteLength.UINT_128,
    );

    const shieldNote = TransactNote.createTransfer(
      receiverAddressData,
      railgunWallet.addressKeys,
      random,
      mockShieldAmount,
      tokenData,
      railgunWallet.getViewingKeyPair(),
      true, // showSenderAddressToRecipient
      OutputType.Transfer,
      MOCK_MEMO,
    );
    expect(shieldNote.notePublicKey).to.equal(
      BigInt(
        '8646677792808778106426841491192581170072532636409694279739894688473037283422',
      ),
    );
    expect(shieldNote.hash).to.equal(
      BigInt(
        '17847544257240351011885349052582675772817264504940544227356428415831210506037',
      ),
    );
    after(async () => {
      await closeTestEngine();
    });

    // const balances: Balances = {
    //   [tokenAddress]: {
    //     balance: mockShieldAmount,
    //     utxos: [
    //       {
    //         tree: 0,
    //         position: 0,
    //         txid: '123',
    //         spendtxid: '123',
    //         note: shieldNote,
    //       },
    //     ],
    //   },
    // };
    // walletBalanceStub = Sinon.stub(
    //   RailgunWallet.prototype,
    //   'balances',
    // ).resolves(balances);

    // const network = NETWORK_CONFIG[NetworkName.Hardhat];
    // const chainID = network.chainId;

    // const vpk = railgunWallet.getViewingKeyPair().privateKey;
    // const shield = new ShieldNote(
    //   addressData.masterPublicKey,
    //   randomHex(16),
    //   mockShieldAmount,
    //   MOCK_TOKEN_ADDRESS,
    // );
    // const { preImage, encryptedRandom } = shield.serialize(vpk);

    // const commitment: GeneratedCommitment = {
    //   hash: '',
    //   txid: '123',
    //   preImage: {
    //     value: nToHex(shield.value, ByteLength.UINT_128),
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

  it('Should prove unshield', async () => {
    const sendWithPublicWallet = false;
    await generateUnshieldProof(
      NetworkName.Hardhat,
      railgunWallet.id,
      MOCK_DB_ENCRYPTION_KEY,
      erc20AmountRecipients,
      nftAmountRecipients,
      relayerFeeERC20AmountRecipient,
      sendWithPublicWallet,
      overallBatchMinGasPrice,
      () => {}, // progressCallback
    );
    expect(getCachedProvedTransaction()).to.deep.equal({
      proofType: ProofType.Unshield,
      transaction: MOCK_TRANSACTION,
      railgunWalletID: railgunWallet.id,
      memoText: undefined,
      toWalletAddress: MOCK_ETH_WALLET_ADDRESS,
      erc20AmountRecipients,
      relayerFeeERC20AmountRecipient,
    });
  }).timeout(30000);
});
// .timeout(50000);
