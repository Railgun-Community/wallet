import { NetworkName, NETWORK_CONFIG, TXIDVersion } from '@railgun-community/shared-models';
import {
  RelayAdapt7702,
  RelayAdapt__factory as RelayAdaptFactory,
  RelayAdapt7702Helper,
  ShieldRequestStruct,
  TransactionStructV2,
} from '@railgun-community/engine';
import { Authorization, ContractTransaction } from 'ethers';
import { reportAndSanitizeError } from '../../utils/error';
import { EphemeralAccount } from '../railgun/wallets/ephemeral-account';
import { getFallbackProviderForNetwork } from '../railgun/core/providers';
import {
  encodeRelayAdapt7702Execute,
  getRelayAdapt7702ExecutionDetails,
} from '../railgun/wallets/relay-adapt-7702-execution';

export const createShieldBaseTokenActionData7702 = (
  txidVersion: TXIDVersion,
  shieldRequest: ShieldRequestStruct,
  ephemeralAddress: string,
): RelayAdapt7702.ActionDataStruct => {
  if (txidVersion !== TXIDVersion.V2_PoseidonMerkle) {
    throw new Error('7702 shield base-token is only supported for TXID V2.');
  }

  const relayAdaptInterface = RelayAdaptFactory.createInterface();

  const calls: ContractTransaction[] = [
    {
      to: ephemeralAddress,
      data: relayAdaptInterface.encodeFunctionData('wrapBase', [
        shieldRequest.preimage.value,
      ]),
      value: 0n,
    },
    {
      to: ephemeralAddress,
      data: relayAdaptInterface.encodeFunctionData('shield', [[shieldRequest]]),
      value: 0n,
    },
  ];

  return RelayAdapt7702Helper.getActionData(
    true,
    calls,
    BigInt(0),
  );
};

export const createShieldBaseTokenTransaction7702 = async (
  txidVersion: TXIDVersion,
  networkName: NetworkName,
  shieldRequest: ShieldRequestStruct,
  ephemeralAccount: EphemeralAccount,
): Promise<ContractTransaction> => {
  try {
    if (txidVersion !== TXIDVersion.V2_PoseidonMerkle) {
      throw new Error('7702 shield base-token is only supported for TXID V2.');
    }

    const network = NETWORK_CONFIG[networkName];
    const relayAdapt7702Contract = network.relayAdapt7702Contract;
    if (!relayAdapt7702Contract) {
      throw new Error(`Missing relayAdapt7702Contract for network ${networkName}.`);
    }

    if (!(ephemeralAccount instanceof EphemeralAccount)) {
      throw new Error(
        'Shield 7702 requires an EphemeralAccount signer.',
      );
    }

    const ephemeralAddress = ephemeralAccount.address;

    const actionData = createShieldBaseTokenActionData7702(
      txidVersion,
      shieldRequest,
      ephemeralAddress,
    );

    const transactions: TransactionStructV2[] = [];
    const authorization: Authorization = await RelayAdapt7702Helper.signEIP7702Authorization(
      ephemeralAccount.signer,
      relayAdapt7702Contract,
      BigInt(network.chain.id),
      0,
    );
    const provider = ephemeralAccount.signer.provider ?? getFallbackProviderForNetwork(networkName);
    const executionDetails = await getRelayAdapt7702ExecutionDetails(
      provider,
      networkName,
      ephemeralAddress,
    );
    const signature = await RelayAdapt7702Helper.signExecutionAuthorization(
      ephemeralAccount.signer,
      transactions,
      actionData,
      BigInt(network.chain.id),
      executionDetails,
    );

    const data = encodeRelayAdapt7702Execute(
      transactions,
      actionData,
      signature,
      executionDetails,
    );

    return {
      to: ephemeralAddress,
      data,
      value: BigInt(shieldRequest.preimage.value.toString()),
      type: 4,
      authorizationList: [authorization],
    };
  } catch (err) {
    throw reportAndSanitizeError(createShieldBaseTokenTransaction7702.name, err);
  }
};