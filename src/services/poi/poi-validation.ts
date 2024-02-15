import {
  ExtractedRailgunTransactionData,
  POIMerklerootsValidator,
  POIValidation,
  RailgunVersionedSmartContracts,
} from '@railgun-community/engine';
import {
  Chain,
  PreTransactionPOIsPerTxidLeafPerList,
  TXIDVersion,
  networkForChain,
} from '@railgun-community/shared-models';
import { ContractTransaction } from 'ethers';
import { walletForID } from '../railgun/wallets/wallets';
import { getProver } from '../railgun/core/prover';

export class POIValidator {
  static initForPOINode(validatePOIMerkleroots: POIMerklerootsValidator) {
    POIValidation.initForPOINode(validatePOIMerkleroots);
  }

  static async isValidSpendableTransaction(
    railgunWalletID: string,
    txidVersion: TXIDVersion,
    chain: Chain,
    transactionRequest: ContractTransaction,
    useRelayAdapt: boolean,
    pois: PreTransactionPOIsPerTxidLeafPerList,
  ): Promise<{
    isValid: boolean;
    error?: string;
    extractedRailgunTransactionData?: ExtractedRailgunTransactionData;
  }> {
    const network = networkForChain(chain);
    if (!network) {
      throw new Error(`No network found for POI validator.`);
    }

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
    return wallet.isValidSpendableTransaction(
      txidVersion,
      chain,
      contractAddress,
      transactionRequest,
      useRelayAdapt,
      pois,
    );
  }

  static async assertIsValidSpendableTXID(
    listKey: string,
    txidVersion: TXIDVersion,
    chain: Chain,
    pois: PreTransactionPOIsPerTxidLeafPerList,
    railgunTxids: string[],
    utxoTreesIn: bigint[],
  ): Promise<boolean> {
    const prover = getProver();

    return POIValidation.assertIsValidSpendableTXID(
      txidVersion,
      listKey,
      chain,
      prover,
      pois,
      railgunTxids,
      utxoTreesIn,
    );
  }
}
