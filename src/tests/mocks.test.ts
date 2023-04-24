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
import { BoundParamsStruct } from '@railgun-community/engine/dist/typechain-types/contracts/logic/RailgunLogic';
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
        '0xba002e1e01f1d63d7fa06c83880b2bef23063903d3f4a2b8f7eb800f6c45491c',
        '0x8687c2941bddfc807aa3512ebef36e889a82f3885383877e55b7f86e488b6360',
        '0x40521d04c766273db030a1ee070706493383f26b8fd677cb51acf0fd30682a37',
        '0x6588e860594d6709193c391b4e79de12cecdaed31eef71a2894af5729c0209f7',
      ],
      blindedSenderViewingKey:
        '0x2b0f49a1c0fb28ed4cc26fe0531848a25422e5ebdf5bf3df34f67d36d8a484fc',
      blindedReceiverViewingKey:
        '0x2b0f49a1c0fb28ed4cc26fe0531848a25422e5ebdf5bf3df34f67d36d8a484fc',
      memo: '0x',
      annotationData:
        '0x3f5ff6e7bab3653afd46501dac3d55bd72b33355e41bfc02fcd63a78fe9d5da550957fabde36c9ded90126755f80a3fa3cdd0d84be4686c4192e920d85dd',
    },
  ],
} as BoundParamsStruct;

export const MOCK_FORMATTED_RELAYER_FEE_COMMITMENT_CIPHERTEXT: CommitmentCiphertext =
  {
    annotationData:
      '0x3f5ff6e7bab3653afd46501dac3d55bd72b33355e41bfc02fcd63a78fe9d5da550957fabde36c9ded90126755f80a3fa3cdd0d84be4686c4192e920d85dd',
    blindedReceiverViewingKey:
      '2b0f49a1c0fb28ed4cc26fe0531848a25422e5ebdf5bf3df34f67d36d8a484fc',
    blindedSenderViewingKey:
      '2b0f49a1c0fb28ed4cc26fe0531848a25422e5ebdf5bf3df34f67d36d8a484fc',
    ciphertext: {
      data: [
        '8687c2941bddfc807aa3512ebef36e889a82f3885383877e55b7f86e488b6360',
        '40521d04c766273db030a1ee070706493383f26b8fd677cb51acf0fd30682a37',
        '6588e860594d6709193c391b4e79de12cecdaed31eef71a2894af5729c0209f7',
      ],
      iv: 'ba002e1e01f1d63d7fa06c83880b2bef',
      tag: '23063903d3f4a2b8f7eb800f6c45491c',
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
