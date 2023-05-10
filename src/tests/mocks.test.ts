import {
  FallbackProviderJsonConfig,
  FeeTokenDetails,
  EVMGasType,
  RailgunERC20Amount,
  TransactionGasDetailsSerialized,
  RailgunNFTAmountRecipient,
  NFTTokenType,
  RailgunNFTAmount,
} from '@railgun-community/shared-models';
import { BalancesUpdatedCallback } from '../services/railgun/wallets/balance-update';
import { CommitmentCiphertext } from '@railgun-community/engine';

export const MOCK_MNEMONIC =
  'test test test test test test test test test test test junk';

export const MOCK_MNEMONIC_2 =
  'pause crystal tornado alcohol genre cement fade large song like bag where';

export const MOCK_DB_ENCRYPTION_KEY =
  '0101010101010101010101010101010101010101010101010101010101010101';

export const MOCK_MEMO =
  'A nice little mock memo, and how bout a little more for ya? 🤩';

export const MOCK_RAILGUN_WALLET_ADDRESS =
  '0zk1q8hxknrs97q8pjxaagwthzc0df99rzmhl2xnlxmgv9akv32sua0kfrv7j6fe3z53llhxknrs97q8pjxaagwthzc0df99rzmhl2xnlxmgv9akv32sua0kg0zpzts';

export const MOCK_ETH_WALLET_ADDRESS =
  '0x9E9F988356f46744Ee0374A17a5Fa1a3A3cC3777';

export const MOCK_TOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const MOCK_TOKEN_ADDRESS_2 =
  '0xe76C6c83af64e4C60245D8C7dE953DF673a7A33D';

export const MOCK_NFT_ADDRESS = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';

export const TEST_POLYGON_RPC = 'https://polygon-rpc.com';

export const TEST_WALLET_SOURCE = 'test engine';

export const MOCK_TOKEN_AMOUNTS_TOKEN_1_ONLY: RailgunERC20Amount[] = [
  {
    tokenAddress: MOCK_TOKEN_ADDRESS,
    amountString: '0x100',
  },
];

export const MOCK_TOKEN_AMOUNTS: RailgunERC20Amount[] = [
  {
    tokenAddress: MOCK_TOKEN_ADDRESS,
    amountString: '0x100',
  },
  {
    tokenAddress: MOCK_TOKEN_ADDRESS_2,
    amountString: '0x200',
  },
];

export const MOCK_NFT_AMOUNTS: RailgunNFTAmount[] = [
  {
    nftAddress: MOCK_NFT_ADDRESS,
    nftTokenType: NFTTokenType.ERC721,
    tokenSubID: '0x01',
    amountString: '0x01',
  },
  {
    nftAddress: MOCK_NFT_ADDRESS,
    nftTokenType: NFTTokenType.ERC1155,
    tokenSubID: '0x02',
    amountString: '0x02',
  },
];

export const MOCK_COMMITMENTS: string[] = [
  '0x0000000000000000000000000000000000000000000000000000000000000003',
];

export const MOCK_NULLIFIERS: string[] = [
  '0x0000000000000000000000000000000000000000000000000000000000000001',
  '0x0000000000000000000000000000000000000000000000000000000000000002',
];

export const MOCK_BOUND_PARAMS = {
  commitmentCiphertext: [
    {
      ciphertext: [
        '0x7d6854cd1fc49f0602ccd933422ed2e2ee070a9f1806843d5c81c08253134950',
        '0x8f54329134103720a7dac44d6f2a632ff18e7599b9bc1bf39d639e998a223b80',
        '0xed1ec36daf72e389fc567b2b5507fb6bff80b601bd3c0c441e4e97f28551f2f2',
        '0xede74ef3a06347178de5e4204f6bf8c475be62bcdb9911bd31be952f2e8af096',
      ],
      blindedSenderViewingKey:
        '0x898bc07d416014a2854f756b9f8873bde925b043e9e01ea6d97183b91217b5b6',
      blindedReceiverViewingKey:
        '0x898bc07d416014a2854f756b9f8873bde925b043e9e01ea6d97183b91217b5b6',
      memo: '0x',
      annotationData:
        '0xfaeb57df19481f9ad59b8619a5687b2623aa2280d0df93aa77258326df9e6657bbdb72d305e1373906a47c6e684c34c2553c7e061baac1f744e8ece042c6',
    },
  ],
};

export const MOCK_COMMITMENT_HASH =
  '0x2b13bccd4974c797df42a89221ed6e19e50c32055058cdcc5a8ea836233e4cab';

export const MOCK_FORMATTED_RELAYER_FEE_COMMITMENT_CIPHERTEXT: CommitmentCiphertext =
  {
    annotationData:
      '0xfaeb57df19481f9ad59b8619a5687b2623aa2280d0df93aa77258326df9e6657bbdb72d305e1373906a47c6e684c34c2553c7e061baac1f744e8ece042c6',
    blindedReceiverViewingKey:
      '898bc07d416014a2854f756b9f8873bde925b043e9e01ea6d97183b91217b5b6',
    blindedSenderViewingKey:
      '898bc07d416014a2854f756b9f8873bde925b043e9e01ea6d97183b91217b5b6',
    ciphertext: {
      data: [
        '8f54329134103720a7dac44d6f2a632ff18e7599b9bc1bf39d639e998a223b80',
        'ed1ec36daf72e389fc567b2b5507fb6bff80b601bd3c0c441e4e97f28551f2f2',
        'ede74ef3a06347178de5e4204f6bf8c475be62bcdb9911bd31be952f2e8af096',
      ],
      iv: '7d6854cd1fc49f0602ccd933422ed2e2',
      tag: 'ee070a9f1806843d5c81c08253134950',
    },
    memo: '0x',
  };

export const MOCK_NFT_AMOUNT_RECIPIENTS: RailgunNFTAmountRecipient[] =
  MOCK_NFT_AMOUNTS.map(nftAmount => ({
    ...nftAmount,
    recipientAddress: MOCK_RAILGUN_WALLET_ADDRESS,
  }));

export const MOCK_NFT_AMOUNT_RECIPIENTS_UNSHIELD: RailgunNFTAmountRecipient[] =
  MOCK_NFT_AMOUNT_RECIPIENTS.map(nftAmountRecipient => ({
    ...nftAmountRecipient,
    recipientAddress: MOCK_ETH_WALLET_ADDRESS,
  }));

export const MOCK_TOKEN_FEE: RailgunERC20Amount = {
  tokenAddress: MOCK_TOKEN_ADDRESS,
  amountString: '0x0300',
};

export const MOCK_FEE_TOKEN_DETAILS: FeeTokenDetails = {
  tokenAddress: MOCK_TOKEN_ADDRESS,
  feePerUnitGas: '0x2000000000000000000', // 2x
};

export const MOCK_TRANSACTION_GAS_DETAILS_SERIALIZED_TYPE_2: TransactionGasDetailsSerialized =
  {
    evmGasType: EVMGasType.Type2,
    gasEstimateString: '0x00',
    maxFeePerGasString: '0x1234567890',
    maxPriorityFeePerGasString: '0x123456',
  };

export const MOCK_BALANCES_UPDATE_CALLBACK: BalancesUpdatedCallback = () => {
  // noop
};

export const MOCK_HISTORY_SCAN_CALLBACK = () => {
  // noop
};

export const MOCK_FALLBACK_PROVIDER_JSON_CONFIG: FallbackProviderJsonConfig = {
  chainId: 137,
  providers: [
    {
      provider: 'https://rpc.ankr.com/polygon',
      priority: 1,
      weight: 1,
    },
    {
      provider: 'https://polygon-rpc.com',
      priority: 2,
      weight: 1,
    },
    {
      provider: 'https://rpc-mainnet.maticvigil.com',
      priority: 3,
      weight: 1,
    },
  ],
};

export const MOCK_FALLBACK_PROVIDER_JSON_CONFIG_MUMBAI: FallbackProviderJsonConfig =
  {
    chainId: 80001,
    providers: [
      {
        provider:
          'https://polygon-mumbai.gateway.pokt.network/v1/lb/627a4b6e18e53a003a6b6c26',
        priority: 2,
        weight: 1,
      },
      {
        provider: 'https://rpc-mumbai.maticvigil.com',
        priority: 3,
        weight: 1,
      },
      {
        provider: 'https://matic-mumbai.chainstacklabs.com',
        priority: 3,
        weight: 1,
      },
      {
        provider: 'https://rpc.ankr.com/polygon_mumbai',
        priority: 3,
        weight: 1,
      },
    ],
  };

export const MOCK_FALLBACK_PROVIDER_JSON_CONFIG_GOERLI: FallbackProviderJsonConfig =
  {
    chainId: 5,
    providers: [
      {
        provider: 'https://goerli.blockpi.network/v1/rpc/public',
        priority: 2,
        weight: 1,
      },
      {
        provider:
          'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        priority: 3,
        weight: 1,
      },
      {
        provider: 'https://rpc.ankr.com/eth_goerli',
        priority: 3,
        weight: 1,
      },
    ],
  };
