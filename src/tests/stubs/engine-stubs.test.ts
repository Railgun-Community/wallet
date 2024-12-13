import {
  OutputType,
  TransactNote,
  Prover,
  AbstractWallet,
  RailgunWallet,
  ByteLength,
  getTokenDataERC20,
  TreeBalance,
  AddressData,
  CommitmentType,
  ByteUtils,
} from '@railgun-community/engine';
// eslint-disable-next-line import/no-extraneous-dependencies
import sinon, { SinonStub } from 'sinon';

let balancesStub: SinonStub;
let treeBalancesStub: SinonStub;
let verifyProofStub: SinonStub;

export const MOCK_SHIELD_TXID_FOR_BALANCES = '123';
export const MOCK_TOKEN_BALANCE = BigInt('1000000000000000000000');
const ZERO_32_BYTE_VALUE =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

const getMockBalanceData = async (
  addressData: AddressData,
  tokenAddress: string,
  tree: number,
): Promise<TreeBalance> => {
  const tokenData = getTokenDataERC20(tokenAddress);

  return {
    balance: MOCK_TOKEN_BALANCE,
    tokenData,
    utxos: [
      {
        tree,
        position: 0,
        blockNumber: 100,
        txid: MOCK_SHIELD_TXID_FOR_BALANCES,
        timestamp: undefined,
        spendtxid: false,
        note: TransactNote.createTransfer(
          addressData, // receiver
          addressData, // sender
          // '12345678901234561234567890123456', // random
          BigInt('1000000000000000000000'), // value
          tokenData, // tokenData
          false, // shouldShowSender
          OutputType.Transfer,
          undefined, // memoText
        ),
        commitmentType: CommitmentType.ShieldCommitment,
        nullifier: ZERO_32_BYTE_VALUE,
        poisPerList: undefined,
        blindedCommitment: undefined,
        transactCreationRailgunTxid: undefined,
      },
    ],
  };
};

export const createEngineWalletBalancesStub = async (
  addressData: AddressData,
  tokenAddress: string,
  tree: number,
) => {
  balancesStub = sinon
    .stub(AbstractWallet, 'getTokenBalancesByTxidVersion')
    .resolves({
      [tokenAddress]: await getMockBalanceData(addressData, tokenAddress, tree),
    });
};

export const createEngineWalletTreeBalancesStub = async (
  addressData: AddressData,
  tokenAddress: string,
  tree: number,
) => {
  const formattedTokenAddress = ByteUtils.formatToByteLength(
    tokenAddress.replace('0x', ''),
    ByteLength.UINT_256,
  );
  treeBalancesStub = sinon
    .stub(RailgunWallet.prototype, 'getTotalBalancesGroupedByTreeNumber')
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
