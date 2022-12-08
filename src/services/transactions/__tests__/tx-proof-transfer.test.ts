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
  TransactNote,
  RailgunEngine,
} from '@railgun-community/engine';
import {
  NetworkName,
  ProofType,
  RailgunNFTRecipient,
  RailgunProveTransactionResponse,
  RailgunWalletTokenAmountRecipient,
} from '@railgun-community/shared-models';
import { PopulatedTransaction } from '@ethersproject/contracts';
import {
  initTestEngine,
  initTestEngineNetwork,
  setTestArtifacts,
} from '../../../test/setup.test';
import {
  MOCK_DB_ENCRYPTION_KEY,
  MOCK_MEMO,
  MOCK_MNEMONIC,
  MOCK_NFT_RECIPIENTS,
  MOCK_TOKEN_ADDRESS,
  MOCK_TOKEN_AMOUNTS_TOKEN_1_ONLY,
  MOCK_TOKEN_FEE,
} from '../../../test/mocks.test';
import { createRailgunWallet } from '../../railgun/wallets/wallets';
import { fullWalletForID } from '../../railgun/core/engine';
import { getCachedProvedTransaction } from '../proof-cache';
import { generateTransferProof } from '../tx-proof-transfer';

let railgunWallet: RailgunWallet;
let railgunWalletAddress: string;
let relayerFeeTokenAmountRecipient: RailgunWalletTokenAmountRecipient;
let tokenAmountRecipients: RailgunWalletTokenAmountRecipient[];
let nftRecipients: RailgunNFTRecipient[];

chai.use(chaiAsPromised);
const { expect } = chai;

const MOCK_POPULATED_TX = {} as PopulatedTransaction;

const overallBatchMinGasPrice = '0x1000';

describe.skip('tx-proofs', () => {
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
    const receiverAddressData =
      RailgunEngine.decodeAddress(railgunWalletAddress);

    tokenAmountRecipients = MOCK_TOKEN_AMOUNTS_TOKEN_1_ONLY.map(
      tokenAmount => ({
        ...tokenAmount,
        recipientAddress: railgunWalletAddress,
      }),
    );
    nftRecipients = MOCK_NFT_RECIPIENTS;

    const { railgunWalletInfo: relayerWalletInfo } = await createRailgunWallet(
      MOCK_DB_ENCRYPTION_KEY,
      MOCK_MNEMONIC,
      undefined, // creationBlockNumbers
    );
    if (!relayerWalletInfo) {
      throw new Error('Expected relayerWalletInfo');
    }
    const relayerRailgunAddress = relayerWalletInfo.railgunAddress;
    relayerFeeTokenAmountRecipient = {
      ...MOCK_TOKEN_FEE,
      recipientAddress: relayerRailgunAddress,
    };

    const mockShieldAmount = BigInt('12500000000');
    const tokenAddress = formatToByteLength(
      MOCK_TOKEN_ADDRESS,
      ByteLength.UINT_256,
      false,
    );
    const random = nToHex(
      BigInt('147663908922529969478643753345904959450'),
      ByteLength.UINT_128,
    );

    const shieldNote = TransactNote.createTransfer(
      receiverAddressData,
      railgunWallet.addressKeys,
      random,
      mockShieldAmount,
      MOCK_TOKEN_ADDRESS,
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

  it('Should prove transfer', async () => {
    const sendWithPublicWallet = false;
    const response: RailgunProveTransactionResponse =
      await generateTransferProof(
        NetworkName.Hardhat,
        railgunWallet.id,
        MOCK_DB_ENCRYPTION_KEY,
        false, // showSenderAddressToRecipient
        MOCK_MEMO,
        tokenAmountRecipients,
        nftRecipients,
        relayerFeeTokenAmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
        () => {}, // progressCallback
      );
    expect(response.error).to.equal(undefined, `Error: ${response.error}`);
    expect(getCachedProvedTransaction()).to.deep.equal({
      proofType: ProofType.Transfer,
      populatedTransaction: MOCK_POPULATED_TX,
      railgunWalletID: railgunWallet.id,
      toWalletAddress: railgunWalletAddress,
      tokenAmountRecipients,
      relayerFeeTokenAmountRecipient,
      relayerFeeTokenAmount: MOCK_TOKEN_FEE,
    });
  }).timeout(30000);
});
// .timeout(50000);
