import { Network, NetworkName, NETWORK_CONFIG } from '@railgun-community/shared-models';
import {
  ABIRelayAdapt7702,
  ABIRelayAdapt7702_Legacy_PreExecuteNonce,
  RelayAdapt7702,
  RelayAdapt7702ExecutionDetails,
  RelayAdapt7702ExecutionType,
  RelayAdapt7702Helper,
  TransactionStructV2,
} from '@railgun-community/engine';
import { Contract, Interface, Provider } from 'ethers';

export const getRelayAdapt7702ExecutionTypeForNetwork = (
  networkName: NetworkName,
): RelayAdapt7702ExecutionType => {
  const network: Network = NETWORK_CONFIG[networkName];
  return network.relayAdapt7702SupportsExecuteNonce
    ? RelayAdapt7702ExecutionType.ExecuteWithNonce
    : RelayAdapt7702ExecutionType.LegacyPreExecuteNonce;
};

export const getRelayAdapt7702ExecuteNonce = async (
  provider: Provider,
  ephemeralAddress: string,
  executionType: RelayAdapt7702ExecutionType,
): Promise<Optional<bigint>> => {
  if (executionType === RelayAdapt7702ExecutionType.LegacyPreExecuteNonce) {
    return undefined;
  }

  const nonceContract = new Contract(
    ephemeralAddress,
    ABIRelayAdapt7702,
    provider,
  ) as unknown as RelayAdapt7702;
  return nonceContract.nonce();
};

export const getRelayAdapt7702ExecutionDetails = async (
  provider: Provider,
  networkName: NetworkName,
  ephemeralAddress: string,
): Promise<RelayAdapt7702ExecutionDetails> => {
  const executionType = getRelayAdapt7702ExecutionTypeForNetwork(networkName);
  const executeNonce = await getRelayAdapt7702ExecuteNonce(
    provider,
    ephemeralAddress,
    executionType,
  );

  return {
    executionType,
    executeNonce,
  };
};

export const encodeRelayAdapt7702Execute = (
  transactions: TransactionStructV2[],
  actionData: RelayAdapt7702.ActionDataStruct,
  signature: string,
  executionDetails: RelayAdapt7702ExecutionDetails,
): string => {
  const abi = executionDetails.executionType === RelayAdapt7702ExecutionType.LegacyPreExecuteNonce
    ? ABIRelayAdapt7702_Legacy_PreExecuteNonce
    : ABIRelayAdapt7702;
  const iface = new Interface(abi);
  return RelayAdapt7702Helper.encodeExecute(
    iface,
    transactions,
    actionData,
    signature,
    executionDetails,
  );
};