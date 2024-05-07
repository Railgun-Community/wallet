import {
  Nullifier,
  UnshieldStoredEvent,
  CommitmentEvent,
  V3Events,
  getNoteHash,
  serializeTokenData,
  ByteLength,
  ByteUtils,
} from '@railgun-community/engine';
import {
  Nullifier as GraphNullifierV3,
  Unshield as GraphUnshieldV3,
  ShieldCommitment as GraphShieldCommitmentV3,
  TransactCommitment as GraphTransactCommitmentV3,
  RailgunTransaction as GraphRailgunTransactionV3,
} from './graphql';
import {
  formatTo32Bytes,
  graphTokenTypeToEngineTokenType,
} from '../shared-formatters';

export type GraphCommitmentV3 =
  | GraphShieldCommitmentV3
  | GraphTransactCommitmentV3;

export type RailgunTxidMapV3 = MapType<string[]>;

export const formatGraphRailgunTransactionEventsV3 = (
  railgunTransactions: GraphRailgunTransactionV3[],
) => {
  return railgunTransactions.map(railgunTransaction => {
    return V3Events.formatRailgunTransactionEvent(
      railgunTransaction.transactionHash,
      Number(railgunTransaction.blockNumber),
      railgunTransaction.commitments,
      railgunTransaction.nullifiers,
      {
        npk: railgunTransaction.unshieldToAddress,
        token: {
          tokenType: BigInt(
            graphTokenTypeToEngineTokenType(
              railgunTransaction.unshieldToken.tokenType,
            ),
          ),
          tokenAddress: railgunTransaction.unshieldToken.tokenAddress,
          tokenSubID: BigInt(railgunTransaction.unshieldToken.tokenSubID),
        },
        value: BigInt(railgunTransaction.unshieldValue),
      },
      railgunTransaction.boundParamsHash,
      Number(railgunTransaction.utxoTreeIn),
      Number(railgunTransaction.utxoTreeOut),
      Number(railgunTransaction.utxoBatchStartPositionOut),
      railgunTransaction.verificationHash,
    );
  });
};

export const formatGraphNullifierEventsV3 = (
  nullifiers: GraphNullifierV3[],
): Nullifier[] => {
  return nullifiers.map(nullifier => {
    return {
      txid: formatTo32Bytes(nullifier.transactionHash, false),
      nullifier: formatTo32Bytes(nullifier.nullifier, false),
      treeNumber: nullifier.treeNumber,
      blockNumber: Number(nullifier.blockNumber),
      spentRailgunTxid: undefined,
    };
  });
};

const getUnshieldCommitmentHash = (
  npk: string,
  tokenAddress: string,
  tokenType: bigint,
  tokenSubID: bigint,
  value: bigint,
) => {
  return getNoteHash(
    npk,
    serializeTokenData(tokenAddress, tokenType, tokenSubID.toString()),
    value,
  );
};

export const formatGraphUnshieldEventsV3 = (
  unshields: GraphUnshieldV3[],
  railgunTxidMap: RailgunTxidMapV3,
): UnshieldStoredEvent[] => {
  return unshields.map(unshield => {
    const unshieldCommitmentHash = ByteUtils.nToHex(
      getUnshieldCommitmentHash(
        unshield.to,
        unshield.token.tokenAddress,
        BigInt(graphTokenTypeToEngineTokenType(unshield.token.tokenType)),
        BigInt(unshield.token.tokenSubID),
        BigInt(unshield.value),
      ),
      ByteLength.UINT_256,
      true,
    );
    const railgunTxid = getRailgunTxid(railgunTxidMap, [
      unshieldCommitmentHash,
    ]);
    return V3Events.formatUnshieldEvent(
      unshield.transactionHash,
      Number(unshield.blockNumber),
      {
        npk: unshield.to,
        token: {
          tokenType: BigInt(
            graphTokenTypeToEngineTokenType(unshield.token.tokenType),
          ),
          tokenAddress: unshield.token.tokenAddress,
          tokenSubID: BigInt(unshield.token.tokenSubID),
        },
        value: BigInt(unshield.value),
      },
      Number(unshield.transactIndex),
      BigInt(unshield.fee),
      railgunTxid,
    );
  });
};

export const formatGraphCommitmentEventsV3 = (
  commitments: GraphCommitmentV3[],
  railgunTxidMap: RailgunTxidMapV3,
): CommitmentEvent[] => {
  return commitments.map(commitment => {
    return formatGraphCommitmentEventV3(commitment, railgunTxidMap);
  });
};

const formatGraphCommitmentEventV3 = (
  commitment: GraphCommitmentV3,
  railgunTxidMap: RailgunTxidMapV3,
): CommitmentEvent => {
  switch (commitment.commitmentType) {
    case 'LegacyGeneratedCommitment':
    case 'LegacyEncryptedCommitment':
      throw new Error('Not possible in V3');
    case 'ShieldCommitment':
      return formatShieldCommitmentEvent(commitment as GraphShieldCommitmentV3);
    case 'TransactCommitment': {
      const railgunTxid = getRailgunTxid(railgunTxidMap, commitment.hashes);
      return formatTransactCommitmentEvent(
        commitment as GraphTransactCommitmentV3,
        railgunTxid,
      );
    }
  }
};

const getRailgunTxid = (
  railgunTxidMap: RailgunTxidMapV3,
  commitments: string[],
): string => {
  const railgunTxids = Object.keys(railgunTxidMap);
  for (const railgunTxid of railgunTxids) {
    const railgunTxidCommitments = railgunTxidMap[railgunTxid];
    if (!railgunTxidCommitments) {
      continue;
    }
    const hasAllCommitments = commitments.every(commitment =>
      railgunTxidCommitments.includes(commitment),
    );
    if (hasAllCommitments) {
      return railgunTxid;
    }
  }
  throw new Error('railgunTxid not found including all transact commitments');
};

const formatShieldCommitmentEvent = (
  commitment: GraphShieldCommitmentV3,
): CommitmentEvent => {
  return V3Events.formatShieldEvent(
    commitment.transactionHash,
    Number(commitment.blockNumber),
    commitment.from,
    {
      npk: commitment.preimage.npk,
      token: {
        tokenType: BigInt(
          graphTokenTypeToEngineTokenType(commitment.preimage.token.tokenType),
        ),
        tokenAddress: commitment.preimage.token.tokenAddress,
        tokenSubID: BigInt(commitment.preimage.token.tokenSubID),
      },
      value: BigInt(commitment.preimage.value),
    },
    {
      encryptedBundle: commitment.encryptedBundle as [string, string, string],
      shieldKey: commitment.shieldKey,
    },
    commitment.treeNumber,
    commitment.treePosition,
    BigInt(commitment.fee),
  );
};

const formatTransactCommitmentEvent = (
  commitment: GraphTransactCommitmentV3,
  railgunTxid: string,
): CommitmentEvent => {
  return V3Events.formatTransactEvent(
    commitment.transactionHash,
    Number(commitment.blockNumber),
    commitment.hashes,
    commitment.commitmentCiphertexts,
    commitment.treeNumber,
    commitment.batchStartTreePosition,
    commitment.transactIndex,
    commitment.senderCiphertext,
    railgunTxid,
  );
};
