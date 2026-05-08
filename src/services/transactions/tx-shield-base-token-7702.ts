import { NetworkName, NETWORK_CONFIG, TXIDVersion } from '@railgun-community/shared-models';
import {
  RelayAdapt7702,
  RelayAdapt__factory as RelayAdaptFactory,
  RelayAdapt7702Helper,
  RelayAdapt7702__factory as RelayAdapt7702Factory,
  ShieldRequestStruct,
  TransactionStructV2,
} from '@railgun-community/engine';
import { Authorization, ContractTransaction } from 'ethers';
import { reportAndSanitizeError } from '../../utils/error';
import { EphemeralAccount } from '../railgun/wallets/ephemeral-account';

const RELAY_ADAPT_7702_EXECUTE_SIGNATURE =
  'execute((((uint256,uint256),(uint256[2],uint256[2]),(uint256,uint256)),bytes32,bytes32[],bytes32[],(uint16,uint72,uint8,uint64,address,bytes32,(bytes32[4],bytes32,bytes32,bytes,bytes)[]),(bytes32,(uint8,address,uint256),uint120))[],(bool,uint256,(address,bytes,uint256)[]),bytes)';

const encodeRelayAdapt7702Execute = (
  transactions: TransactionStructV2[],
  actionData: RelayAdapt7702.ActionDataStruct,
  signature: string,
): string => {
  const iface = RelayAdapt7702Factory.createInterface();
  return (iface as any).encodeFunctionData(RELAY_ADAPT_7702_EXECUTE_SIGNATURE, [
    transactions,
    actionData,
    signature,
  ]);
};

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
    const signature = await RelayAdapt7702Helper.signExecutionAuthorization(
      ephemeralAccount.signer,
      transactions,
      actionData,
      BigInt(network.chain.id),
    );

    const data = encodeRelayAdapt7702Execute(transactions, actionData, signature);

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