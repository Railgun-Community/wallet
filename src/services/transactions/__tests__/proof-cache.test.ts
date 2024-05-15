import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  ProofType,
  RailgunNFTAmountRecipient,
  RailgunERC20Amount,
  RailgunERC20AmountRecipient,
  NetworkName,
  RailgunNFTAmount,
  RailgunERC20Recipient,
} from '@railgun-community/shared-models';
import {
  MOCK_NFT_AMOUNTS,
  MOCK_NFT_AMOUNT_RECIPIENTS,
  MOCK_RAILGUN_WALLET_ADDRESS,
  MOCK_TOKEN_AMOUNTS,
  MOCK_TOKEN_FEE,
} from '../../../tests/mocks.test';
import {
  setCachedProvedTransaction,
  validateCachedProvedTransaction,
} from '../proof-cache';
import { ContractTransaction } from 'ethers';
import { getTestTXIDVersion } from '../../../tests/helper.test';

chai.use(chaiAsPromised);
const { expect } = chai;

const networkName = NetworkName.BNBChain;
const txidVersion = getTestTXIDVersion();
const railgunWalletID = '123';
const showSenderAddressToRecipient = true;
const memoText = 'Some memo';
const recipientAddress = '0x12345';
const erc20AmountRecipients: RailgunERC20AmountRecipient[] =
  MOCK_TOKEN_AMOUNTS.map(erc20Amount => ({
    ...erc20Amount,
    recipientAddress,
  }));
const nftAmountRecipients: RailgunNFTAmountRecipient[] =
  MOCK_NFT_AMOUNT_RECIPIENTS;
const broadcasterFeeERC20AmountRecipient: RailgunERC20AmountRecipient = {
  ...MOCK_TOKEN_FEE,
  recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
};
const crossContractCalls: ContractTransaction[] = [
  { to: '0x4567', data: '0x' },
];
const relayAdaptShieldERC20Recipients: RailgunERC20Recipient[] = [
  { tokenAddress: '0x123', recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS },
];
const relayAdaptUnshieldERC20Amounts: RailgunERC20Amount[] = [MOCK_TOKEN_FEE];
const relayAdaptUnshieldNFTAmounts: RailgunNFTAmount[] = MOCK_NFT_AMOUNTS;
const relayAdaptShieldNFTRecipients: RailgunNFTAmountRecipient[] =
  MOCK_NFT_AMOUNT_RECIPIENTS;

const nullifiers = ['0x1234'];

const sendWithPublicWallet = false;
const overallBatchMinGasPrice = BigInt('0x1000');

const preTransactionPOIsPerTxidLeafPerList = {};

const setCached = (proofType: ProofType) => {
  setCachedProvedTransaction({
    proofType,
    txidVersion,
    transaction: {} as ContractTransaction,
    showSenderAddressToRecipient,
    memoText,
    railgunWalletID,
    erc20AmountRecipients,
    nftAmountRecipients,
    relayAdaptUnshieldERC20Amounts,
    relayAdaptUnshieldNFTAmounts,
    relayAdaptShieldERC20Recipients,
    relayAdaptShieldNFTRecipients,
    crossContractCalls,
    broadcasterFeeERC20AmountRecipient,
    sendWithPublicWallet: false,
    preTransactionPOIsPerTxidLeafPerList,
    overallBatchMinGasPrice,
    nullifiers,
  });
};

describe('proof-cache', () => {
  it('Should validate cached transaction correctly', () => {
    setCachedProvedTransaction(undefined);
    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        ProofType.CrossContractCalls,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        relayAdaptShieldERC20Recipients,
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ),
    ).to.throw('No proof found.');

    setCached(ProofType.CrossContractCalls);

    // Same same
    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        ProofType.CrossContractCalls,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        relayAdaptShieldERC20Recipients,
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ),
    ).to.not.throw();

    expect(() =>
      validateCachedProvedTransaction(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        'something else' as any,
        networkName,
        ProofType.CrossContractCalls,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        relayAdaptShieldERC20Recipients,
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ),
    ).to.throw('Mismatch: txidVersion.');

    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        ProofType.Unshield,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        relayAdaptShieldERC20Recipients,
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ),
    ).to.throw('Mismatch: proofType.');

    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        ProofType.Transfer,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        relayAdaptShieldERC20Recipients,
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ),
    ).to.throw('Mismatch: proofType.');

    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        ProofType.CrossContractCalls,
        '987',
        showSenderAddressToRecipient,
        memoText,
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        relayAdaptShieldERC20Recipients,
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ),
    ).to.throw('Mismatch: railgunWalletID.');

    // Set new for Transfer proof type
    setCached(ProofType.Transfer);

    // Requires ProofType.Transfer
    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        ProofType.Transfer,
        railgunWalletID,
        false, // showSenderAddressToRecipient
        memoText,
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        relayAdaptShieldERC20Recipients,
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ),
    ).to.throw('Mismatch: showSenderAddressToRecipient.');

    // Requires ProofType.Transfer
    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        ProofType.Transfer,
        railgunWalletID,
        showSenderAddressToRecipient,
        'different memo',
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        relayAdaptShieldERC20Recipients,
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ),
    ).to.throw('Mismatch: memoText.');

    // Requires ProofType.Transfer
    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        ProofType.Transfer,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        [
          {
            tokenAddress: '0x765',
            amount: 100n,
            recipientAddress: '0x123',
          },
        ],
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        relayAdaptShieldERC20Recipients,
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ),
    ).to.throw('Mismatch: erc20AmountRecipients.');

    setCached(ProofType.CrossContractCalls);

    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        ProofType.CrossContractCalls,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        erc20AmountRecipients,
        [MOCK_NFT_AMOUNT_RECIPIENTS[0]],
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        relayAdaptShieldERC20Recipients,
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ),
    ).to.throw('Mismatch: nftAmountRecipients.');

    // Note: requires ProofType.CrossContractCalls
    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        ProofType.CrossContractCalls,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        erc20AmountRecipients,
        nftAmountRecipients,
        [
          {
            tokenAddress: '0x765',
            amount: 100n,
          },
        ],
        relayAdaptUnshieldNFTAmounts,
        relayAdaptShieldERC20Recipients,
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ),
    ).to.throw('Mismatch: relayAdaptUnshieldERC20Amounts.');

    // Note: requires ProofType.CrossContractCalls
    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        ProofType.CrossContractCalls,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        [MOCK_NFT_AMOUNTS[0]],
        relayAdaptShieldERC20Recipients,
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ),
    ).to.throw('Mismatch: relayAdaptUnshieldNFTAmounts.');

    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        // proofType (ProofType.Transfer) will not validate relayAdaptUnshieldERC20Amounts.. requires ProofType.CrossContractCalls
        ProofType.CrossContractCalls,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        [
          {
            tokenAddress: 'test',
            recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
          },
        ],
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ),
    ).to.throw('Mismatch: relayAdaptShieldERC20Recipients.');

    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        // proofType (ProofType.Transfer) will not validate relayAdaptUnshieldERC20Amounts.. requires ProofType.CrossContractCalls
        ProofType.CrossContractCalls,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        [],
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ),
    ).to.throw('Mismatch: relayAdaptShieldERC20Recipients.');

    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        // proofType (ProofType.Transfer) will not validate relayAdaptUnshieldERC20Amounts.. requires ProofType.CrossContractCalls
        ProofType.CrossContractCalls,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        relayAdaptShieldERC20Recipients,
        [MOCK_NFT_AMOUNTS[0]],
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ),
    ).to.throw('Mismatch: relayAdaptShieldNFTRecipients.');

    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        // proofType (ProofType.Transfer) will not validate relayAdaptUnshieldERC20Amounts.. requires ProofType.CrossContractCalls
        ProofType.CrossContractCalls,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        relayAdaptShieldERC20Recipients,
        relayAdaptShieldNFTRecipients,
        [{ to: 'test', data: '0x' }],
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ),
    ).to.throw('Mismatch: crossContractCalls.');

    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        ProofType.CrossContractCalls,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        relayAdaptShieldERC20Recipients,
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        {
          tokenAddress: '0x765',
          amount: 100n,
          recipientAddress: '0x1233',
        },
        sendWithPublicWallet,
        overallBatchMinGasPrice,
      ),
    ).to.throw('Mismatch: broadcasterFeeERC20AmountRecipient.');

    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        ProofType.CrossContractCalls,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        relayAdaptShieldERC20Recipients,
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        true, // sendWithPublicWallet
        overallBatchMinGasPrice,
      ),
    ).to.throw('Mismatch: sendWithPublicWallet.');

    expect(() =>
      validateCachedProvedTransaction(
        txidVersion,
        networkName,
        ProofType.CrossContractCalls,
        railgunWalletID,
        showSenderAddressToRecipient,
        memoText,
        erc20AmountRecipients,
        nftAmountRecipients,
        relayAdaptUnshieldERC20Amounts,
        relayAdaptUnshieldNFTAmounts,
        relayAdaptShieldERC20Recipients,
        relayAdaptShieldNFTRecipients,
        crossContractCalls,
        broadcasterFeeERC20AmountRecipient,
        sendWithPublicWallet,
        BigInt('0x2000'),
      ),
    ).to.throw('Mismatch: overallBatchMinGasPrice.');
  });
});
