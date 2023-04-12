import {
  AccumulatedEvents,
  Chain,
  Nullifier,
  UnshieldStoredEvent,
  CommitmentEvent,
  Commitment,
  TokenType,
  LegacyGeneratedCommitment,
  CommitmentType,
  LegacyEncryptedCommitment,
  ShieldCommitment,
  TransactCommitment,
  PreImage,
  TokenData,
  ByteLength,
  CommitmentCiphertext,
  Ciphertext,
  formatToByteLength,
  LegacyCommitmentCiphertext,
} from '@railgun-community/engine';
import { networkForChain } from '@railgun-community/shared-models';
import { EMPTY_EVENTS } from './empty-events';
import {
  NullifiersDocument,
  Nullifier as GraphNullifier,
  UnshieldsDocument,
  Unshield as GraphUnshield,
  CommitmentsDocument,
  execute,
  TokenType as GraphTokenType,
  LegacyGeneratedCommitment as GraphLegacyGeneratedCommitment,
  LegacyEncryptedCommitment as GraphLegacyEncryptedCommitment,
  ShieldCommitment as GraphShieldCommitment,
  TransactCommitment as GraphTransactCommitment,
  CommitmentPreimage as GraphCommitmentPreimage,
  LegacyCommitmentCiphertext as GraphLegacyCommitmentCiphertext,
  CommitmentCiphertext as GraphCommitmentCiphertext,
  Ciphertext as GraphCiphertext,
  Token as GraphToken,
  NullifiersQuery,
  UnshieldsQuery,
  CommitmentsQuery,
} from './graphql';
import { BigNumber } from '@ethersproject/bignumber';
import { getAddress } from '@ethersproject/address';

type GraphCommitment =
  | GraphLegacyEncryptedCommitment
  | GraphLegacyGeneratedCommitment
  | GraphShieldCommitment
  | GraphTransactCommitment;

// const getGraphSourceContext = (networkName: NetworkName): string => {
//   switch (networkName) {
//     case NetworkName.Ethereum:
//       return EthereumContext;
//     case NetworkName.EthereumGoerli:
//       return 'https://api.thegraph.com/subgraphs/name/railgun-community/railgun-v2-goerli';
//     case NetworkName.BNBChain:
//       return 'https://api.thegraph.com/subgraphs/name/railgun-community/railgun-v2-bsc';
//     case NetworkName.Polygon:
//       return 'https://api.thegraph.com/subgraphs/name/railgun-community/railgun-v2-polygon';
//     case NetworkName.Arbitrum:
//       return 'https://api.thegraph.com/subgraphs/name/railgun-community/railgun-v2-arbitrum';
//     case NetworkName.ArbitrumGoerli:
//       return 'https://api.thegraph.com/subgraphs/name/railgun-community/railgun-v2-arbitrum-goerli';
//     case NetworkName.PolygonMumbai:
//       return 'https://api.thegraph.com/subgraphs/name/railgun-community/railgun-v2-mumbai';
//     case NetworkName.Railgun:
//     case NetworkName.EthereumRopsten_DEPRECATED:
//     case NetworkName.Hardhat:
//       throw new Error('No Graph API hosted service for this network');
//   }
// };

export const quickSyncGraphProtocol = async (
  chain: Chain,
  startingBlock: number,
): Promise<AccumulatedEvents> => {
  const network = networkForChain(chain);
  if (!network || !network.shouldQuickSync) {
    // Return empty logs, Engine will default to full scan.
    return EMPTY_EVENTS;
  }

  const [nullifiers, unshields, commitments] = await Promise.all([
    executeQuickSyncNullifiersQuery(startingBlock),
    executeQuickSyncUnshieldsQuery(startingBlock),
    executeQuickSyncCommitmentsQuery(startingBlock),
  ]);

  const nullifierEvents = formatNullifierEvents(nullifiers);
  const unshieldEvents = formatUnshieldEvents(unshields);
  const commitmentEvents = formatCommitmentEvents(commitments);

  return { nullifierEvents, unshieldEvents, commitmentEvents };
};

const executeQuickSyncNullifiersQuery = async (
  blockNumber: number,
): Promise<GraphNullifier[]> => {
  const result = await execute(NullifiersDocument, {
    blockNumber,
  });
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return (result.data as NullifiersQuery).nullifiers;
};

const executeQuickSyncUnshieldsQuery = async (
  blockNumber: number,
): Promise<GraphUnshield[]> => {
  const result = await execute(UnshieldsDocument, {
    blockNumber,
  });
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return (result.data as UnshieldsQuery).unshields;
};

const executeQuickSyncCommitmentsQuery = async (
  blockNumber: number,
): Promise<GraphCommitment[]> => {
  const result = await execute(CommitmentsDocument, {
    blockNumber,
  });
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return (result.data as CommitmentsQuery).commitments;
};

const graphTokenTypeToEngineTokenType = (
  graphTokenType: GraphTokenType,
): TokenType => {
  switch (graphTokenType) {
    case 'ERC20':
      return TokenType.ERC20;
    case 'ERC721':
      return TokenType.ERC721;
    case 'ERC1155':
      return TokenType.ERC1155;
  }
};

const formatNullifierEvents = (nullifiers: GraphNullifier[]): Nullifier[] => {
  return nullifiers.map(nullifier => {
    return {
      txid: formatTo32Bytes(nullifier.transactionHash, false),
      nullifier: formatTo32Bytes(nullifier.nullifier, false),
      treeNumber: nullifier.treeNumber,
      blockNumber: Number(nullifier.blockNumber),
    };
  });
};

const formatUnshieldEvents = (
  unshields: GraphUnshield[],
): UnshieldStoredEvent[] => {
  return unshields.map(unshield => {
    return {
      txid: formatTo32Bytes(unshield.transactionHash, false),
      toAddress: getAddress(unshield.to),
      tokenType: graphTokenTypeToEngineTokenType(unshield.token.tokenType),
      tokenAddress: getAddress(unshield.token.tokenAddress),
      tokenSubID: unshield.token.tokenSubID,
      amount: bigIntToHex(unshield.amount),
      fee: bigIntToHex(unshield.fee),
      blockNumber: Number(unshield.blockNumber),
    };
  });
};

const formatCommitmentEvents = (
  graphCommitments: GraphCommitment[],
): CommitmentEvent[] => {
  return graphCommitments.map(graphCommitment => {
    return {
      txid: formatTo32Bytes(graphCommitment.transactionHash, false),
      commitments: [formatCommitment(graphCommitment)],
      treeNumber: graphCommitment.treeNumber,
      startPosition: graphCommitment.treePosition,
      blockNumber: Number(graphCommitment.blockNumber),
    };
  });
};

const formatCommitment = (commitment: GraphCommitment): Commitment => {
  switch (commitment.commitmentType) {
    case 'LegacyGeneratedCommitment':
      return formatLegacyGeneratedCommitment(
        commitment as GraphLegacyGeneratedCommitment,
      );
    case 'LegacyEncryptedCommitment':
      return formatLegacyEncryptedCommitment(
        commitment as GraphLegacyEncryptedCommitment,
      );
    case 'ShieldCommitment':
      return formatShieldCommitment(commitment as GraphShieldCommitment);
    case 'TransactCommitment':
      return formatTransactCommitment(commitment as GraphTransactCommitment);
  }
};

const formatToken = (graphToken: GraphToken): TokenData => {
  return {
    tokenAddress: graphToken.tokenAddress,
    tokenType: graphTokenTypeToEngineTokenType(graphToken.tokenType),
    tokenSubID: formatTo32Bytes(graphToken.tokenSubID, true),
  };
};

const formatPreImage = (graphPreImage: GraphCommitmentPreimage): PreImage => {
  return {
    npk: formatTo32Bytes(graphPreImage.npk, false),
    token: formatToken(graphPreImage.token),
    value: formatTo16Bytes(
      BigNumber.from(graphPreImage.value).toHexString(),
      false,
    ),
  };
};

const formatCiphertext = (graphCiphertext: GraphCiphertext): Ciphertext => {
  return {
    iv: formatTo16Bytes(graphCiphertext.iv, false),
    tag: formatTo16Bytes(graphCiphertext.tag, false),
    data: graphCiphertext.data.map(d => formatTo32Bytes(d, false)),
  };
};

const formatTo16Bytes = (value: string, prefix: boolean) => {
  return formatToByteLength(value, ByteLength.UINT_128, prefix);
};

const formatTo32Bytes = (value: string, prefix: boolean) => {
  return formatToByteLength(value, ByteLength.UINT_256, prefix);
};

const formatLegacyCommitmentCiphertext = (
  graphLegacyCommitmentCiphertext: GraphLegacyCommitmentCiphertext,
): LegacyCommitmentCiphertext => {
  return {
    ciphertext: formatCiphertext(graphLegacyCommitmentCiphertext.ciphertext),
    ephemeralKeys: graphLegacyCommitmentCiphertext.ephemeralKeys,
    memo: graphLegacyCommitmentCiphertext.memo,
  };
};

const formatCommitmentCiphertext = (
  graphCommitmentCiphertext: GraphCommitmentCiphertext,
): CommitmentCiphertext => {
  return {
    ciphertext: formatCiphertext(graphCommitmentCiphertext.ciphertext),
    blindedReceiverViewingKey: formatTo32Bytes(
      graphCommitmentCiphertext.blindedReceiverViewingKey,
      false,
    ),
    blindedSenderViewingKey: formatTo32Bytes(
      graphCommitmentCiphertext.blindedSenderViewingKey,
      false,
    ),
    memo: graphCommitmentCiphertext.memo,
    annotationData: graphCommitmentCiphertext.annotationData,
  };
};

const bigIntToHex = (bigint: string): string => {
  return BigNumber.from(bigint).toHexString();
};

const formatLegacyGeneratedCommitment = (
  commitment: GraphLegacyGeneratedCommitment,
): LegacyGeneratedCommitment => {
  return {
    txid: formatTo32Bytes(commitment.transactionHash, false),
    commitmentType: CommitmentType.LegacyGeneratedCommitment,
    hash: formatTo32Bytes(bigIntToHex(commitment.hash), false),
    preImage: formatPreImage(commitment.preimage),
    encryptedRandom: commitment.encryptedRandom as [string, string],
    blockNumber: Number(commitment.blockNumber),
  };
};

const formatLegacyEncryptedCommitment = (
  commitment: GraphLegacyEncryptedCommitment,
): LegacyEncryptedCommitment => {
  return {
    txid: formatTo32Bytes(commitment.transactionHash, false),
    commitmentType: CommitmentType.LegacyEncryptedCommitment,
    hash: formatTo32Bytes(bigIntToHex(commitment.hash), false),
    ciphertext: formatLegacyCommitmentCiphertext(commitment.legacyCiphertext),
    blockNumber: Number(commitment.blockNumber),
  };
};

const formatShieldCommitment = (
  commitment: GraphShieldCommitment,
): ShieldCommitment => {
  const shieldCommitment: ShieldCommitment = {
    txid: formatTo32Bytes(commitment.transactionHash, false),
    commitmentType: CommitmentType.ShieldCommitment,
    hash: formatTo32Bytes(bigIntToHex(commitment.hash), false),
    preImage: formatPreImage(commitment.preimage),
    blockNumber: Number(commitment.blockNumber),
    encryptedBundle: commitment.encryptedBundle as [string, string, string],
    shieldKey: commitment.shieldKey,
    fee: commitment.fee ?? undefined,
  };
  if (!shieldCommitment.fee) {
    delete shieldCommitment.fee;
  }
  return shieldCommitment;
};

const formatTransactCommitment = (
  commitment: GraphTransactCommitment,
): TransactCommitment => {
  return {
    txid: formatTo32Bytes(commitment.transactionHash, false),
    commitmentType: CommitmentType.TransactCommitment,
    hash: formatTo32Bytes(bigIntToHex(commitment.hash), false),
    ciphertext: formatCommitmentCiphertext(commitment.ciphertext),
    blockNumber: Number(commitment.blockNumber),
  };
};
