import { ExtractedRailgunTransactionData } from '@railgun-community/engine';
import {
  Chain,
  PreTransactionPOIsPerTxidLeafPerList,
  TXIDVersion,
  networkForChain,
} from '@railgun-community/shared-models';
import { ContractTransaction } from 'ethers';
import { walletForID } from '../railgun/wallets/wallets';

export class POIValidator {
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

    let verifierAddress: string;
    switch (txidVersion) {
      case TXIDVersion.V2_PoseidonMerkle:
        verifierAddress = network.proxyContract;
        break;
      case TXIDVersion.V3_PoseidonMerkle:
        verifierAddress = network.poseidonMerkleVerifierV3Contract;
        break;
    }

    const wallet = walletForID(railgunWalletID);
    return wallet.isValidSpendableTransaction(
      txidVersion,
      chain,
      verifierAddress,
      transactionRequest,
      useRelayAdapt,
      pois,
    );
  }
}
