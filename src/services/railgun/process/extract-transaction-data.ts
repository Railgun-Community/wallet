import { RailgunVersionedSmartContracts } from '@railgun-community/engine';
import { Network, TXIDVersion } from '@railgun-community/shared-models';
import { ContractTransaction } from 'ethers';
import { walletForID } from '../wallets/wallets';

export const extractFirstNoteERC20AmountMapFromTransactionRequest = (
  railgunWalletID: string,
  txidVersion: TXIDVersion,
  network: Network,
  transactionRequest: ContractTransaction,
  useRelayAdapt: boolean,
): Promise<MapType<bigint>> => {
  const chain = network.chain;

  let contractAddress: string;
  if (useRelayAdapt) {
    contractAddress = RailgunVersionedSmartContracts.getRelayAdaptContract(
      txidVersion,
      chain,
    ).address;
  } else {
    contractAddress = RailgunVersionedSmartContracts.getVerifier(
      txidVersion,
      chain,
    ).address;
  }

  const wallet = walletForID(railgunWalletID);
  return wallet.extractFirstNoteERC20AmountMap(
    txidVersion,
    chain,
    transactionRequest,
    useRelayAdapt,
    contractAddress,
  );
};
