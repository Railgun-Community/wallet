import {
  ViewingKeyPair,
  OutputType,
  TransactNote,
  Prover,
  formatToByteLength,
  getPublicViewingKey,
  AbstractWallet,
  RailgunWallet,
  ByteLength,
  getTokenDataERC20,
  TreeBalance,
  AddressData,
  CommitmentType,
  ZERO_32_BYTE_VALUE,
} from '@railgun-community/engine';
import { randomBytes } from 'ethers';
// eslint-disable-next-line import/no-extraneous-dependencies
import sinon, { SinonStub } from 'sinon';

let balancesStub: SinonStub;
let treeBalancesStub: SinonStub;
let verifyProofStub: SinonStub;

const getMockBalanceData = async (
  addressData: AddressData,
  tokenAddress: string,
  tree: number,
): Promise<TreeBalance> => {
  const privateViewingKey = randomBytes(32);
  const publicViewingKey = await getPublicViewingKey(privateViewingKey);
  const senderViewingKeys: ViewingKeyPair = {
    privateKey: privateViewingKey,
    pubkey: publicViewingKey,
  };
  const tokenData = getTokenDataERC20(tokenAddress);

  return {
    balance: BigInt('1000000000000000000000'),
    tokenData,
    utxos: [
      {
        tree,
        position: 0,
        txid: '123',
        timestamp: undefined,
        spendtxid: '123',
        note: TransactNote.createTransfer(
          addressData, // receiver
          addressData, // sender
          // '12345678901234561234567890123456', // random
          BigInt('1000000000000000000000'), // value
          tokenData, // tokenData
          senderViewingKeys,
          false, // shouldShowSender
          OutputType.Transfer,
          undefined, // memoText
        ),
        commitmentType: CommitmentType.TransactCommitment,
        nullifier: ZERO_32_BYTE_VALUE,
        railgunTxid: undefined,
        poisPerList: undefined,
        blindedCommitment: undefined,
      },
    ],
  };
};

export const createEngineWalletBalancesStub = async (
  addressData: AddressData,
  tokenAddress: string,
  tree: number,
) => {
  balancesStub = sinon.stub(RailgunWallet.prototype, 'balances').resolves({
    [tokenAddress]: await getMockBalanceData(addressData, tokenAddress, tree),
  });
};

export const createAbstractWalletBalancesStub = async (
  addressData: AddressData,
  tokenAddress: string,
  tree: number,
) => {
  balancesStub = sinon.stub(AbstractWallet.prototype, 'balances').resolves({
    [tokenAddress]: await getMockBalanceData(addressData, tokenAddress, tree),
  });
};

export const createEngineWalletTreeBalancesStub = async (
  addressData: AddressData,
  tokenAddress: string,
  tree: number,
) => {
  const formattedTokenAddress = formatToByteLength(
    tokenAddress.replace('0x', ''),
    ByteLength.UINT_256,
  );
  treeBalancesStub = sinon
    .stub(RailgunWallet.prototype, 'balancesByTree')
    .resolves({
      [formattedTokenAddress]: [
        await getMockBalanceData(addressData, tokenAddress, tree),
      ],
    });
};

export const createEngineVerifyProofStub = () => {
  verifyProofStub = sinon
    .stub(Prover.prototype, 'verifyRailgunProof')
    .resolves(true);
};

export const restoreEngineStubs = () => {
  balancesStub?.restore();
  treeBalancesStub?.restore();
  verifyProofStub?.restore();
};
