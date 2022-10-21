import {
  FallbackProviderJsonConfig,
  FeeTokenDetails,
  EVMGasType,
  RailgunWalletTokenAmount,
  TransactionGasDetailsSerialized,
} from '@railgun-community/shared-models';
import { BalancesUpdatedCallback } from '../services/railgun/wallets/balance-update';

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

export const TEST_POLYGON_RPC = 'https://polygon-rpc.com';

export const TEST_WALLET_SOURCE = 'test engine';

export const MOCK_TOKEN_AMOUNTS_TOKEN_1_ONLY: RailgunWalletTokenAmount[] = [
  {
    tokenAddress: MOCK_TOKEN_ADDRESS,
    amountString: '0x100',
  },
];

export const MOCK_TOKEN_AMOUNTS: RailgunWalletTokenAmount[] = [
  {
    tokenAddress: MOCK_TOKEN_ADDRESS,
    amountString: '0x100',
  },
  {
    tokenAddress: MOCK_TOKEN_ADDRESS_2,
    amountString: '0x200',
  },
];

export const MOCK_TOKEN_FEE: RailgunWalletTokenAmount = {
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
      priority: 3,
      weight: 1,
    },
    {
      provider: 'https://polygon-rpc.com',
      priority: 3,
      weight: 1,
    },
    {
      provider: 'https://rpc-mainnet.maticvigil.com',
      priority: 3,
      weight: 1,
    },
  ],
};
