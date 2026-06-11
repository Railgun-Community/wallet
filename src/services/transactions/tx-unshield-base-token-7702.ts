import {
  NetworkName,
  NETWORK_CONFIG,
  RailgunERC20Amount,
  RailgunERC20AmountRecipient,
  TXIDVersion,
} from '@railgun-community/shared-models';
import {
  getTokenDataERC20,
  RelayAdapt7702,
  RelayAdapt__factory as RelayAdaptFactory,
  RelayAdapt7702Helper,
  TransactionStructV2,
  TransactionStructV3,
} from '@railgun-community/engine';
import { ContractTransaction } from 'ethers';
import { reportAndSanitizeError } from '../../utils/error';
import { sign7702Request } from '../railgun/wallets/wallets';
import { encodeRelayAdapt7702Execute } from '../railgun/wallets/relay-adapt-7702-execution';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const createRelayAdapt7702UnshieldBaseTokenERC20AmountRecipients = (
  unshieldERC20Amounts: RailgunERC20Amount[],
  ephemeralAddress: string,
): RailgunERC20AmountRecipient[] => {
  return unshieldERC20Amounts.map(unshieldERC20Amount => ({
    ...unshieldERC20Amount,
    recipientAddress: ephemeralAddress,
  }));
};

export const createUnshieldBaseTokenActionData7702 = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  unshieldAddress: string,
  ephemeralAddress: string,
  sendWithPublicWallet: boolean,
): Promise<RelayAdapt7702.ActionDataStruct> => {
  try {
    if (txidVersion !== TXIDVersion.V2_PoseidonMerkle) {
      throw new Error('7702 unshield base-token is only supported for TXID V2.');
    }

    const baseTokenData = getTokenDataERC20(ZERO_ADDRESS);
    const relayAdaptInterface = RelayAdaptFactory.createInterface();

    const calls: ContractTransaction[] = [
      {
        to: ephemeralAddress,
        data: relayAdaptInterface.encodeFunctionData('unwrapBase', [0n]),
        value: 0n,
      },
      {
        to: ephemeralAddress,
        data: relayAdaptInterface.encodeFunctionData('transfer', [[
          {
            token: baseTokenData,
            to: unshieldAddress,
            value: 0n,
          },
        ]]),
        value: 0n,
      },
    ];

    return RelayAdapt7702Helper.getActionData(
      sendWithPublicWallet,
      calls,
      BigInt(0),
    );
  } catch (err) {
    throw reportAndSanitizeError(createUnshieldBaseTokenActionData7702.name, err);
  }
};

export const createUnshieldBaseTokenTransaction7702 = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  railgunWalletID: string,
  encryptionKey: string,
  transactions: (TransactionStructV2 | TransactionStructV3)[],
  actionData: RelayAdapt7702.ActionDataStruct,
  ephemeralAddress: string,
): Promise<ContractTransaction> => {
  try {
    if (txidVersion !== TXIDVersion.V2_PoseidonMerkle) {
      throw new Error('7702 unshield base-token is only supported for TXID V2.');
    }

    const network = NETWORK_CONFIG[networkName];
    const relayAdapt7702Contract = network.relayAdapt7702Contract;
    if (!relayAdapt7702Contract) {
      throw new Error(`Missing relayAdapt7702Contract for network ${networkName}.`);
    }

    const { authorization, signature, executionDetails } = await sign7702Request(
      railgunWalletID,
      encryptionKey,
      networkName,
      relayAdapt7702Contract,
      BigInt(network.chain.id),
      transactions as TransactionStructV2[],
      actionData,
    );

    const data = encodeRelayAdapt7702Execute(
      transactions as TransactionStructV2[],
      actionData,
      signature,
      executionDetails,
    );

    return {
      to: ephemeralAddress,
      data,
      value: 0n,
      type: 4,
      authorizationList: [authorization],
    };
  } catch (err) {
    throw reportAndSanitizeError(createUnshieldBaseTokenTransaction7702.name, err);
  }
};