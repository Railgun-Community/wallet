// @ts-nocheck

import { InContextSdkMethod } from '@graphql-mesh/types';
import { MeshContext } from '@graphql-mesh/runtime';

export namespace EthereumTypes {
  export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
  Int8: any;
};

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type Ciphertext = {
  id: Scalars['Bytes'];
  iv: Scalars['Bytes'];
  tag: Scalars['Bytes'];
  data: Array<Scalars['Bytes']>;
};

export type Ciphertext_filter = {
  id?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  iv?: InputMaybe<Scalars['Bytes']>;
  iv_not?: InputMaybe<Scalars['Bytes']>;
  iv_gt?: InputMaybe<Scalars['Bytes']>;
  iv_lt?: InputMaybe<Scalars['Bytes']>;
  iv_gte?: InputMaybe<Scalars['Bytes']>;
  iv_lte?: InputMaybe<Scalars['Bytes']>;
  iv_in?: InputMaybe<Array<Scalars['Bytes']>>;
  iv_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  iv_contains?: InputMaybe<Scalars['Bytes']>;
  iv_not_contains?: InputMaybe<Scalars['Bytes']>;
  tag?: InputMaybe<Scalars['Bytes']>;
  tag_not?: InputMaybe<Scalars['Bytes']>;
  tag_gt?: InputMaybe<Scalars['Bytes']>;
  tag_lt?: InputMaybe<Scalars['Bytes']>;
  tag_gte?: InputMaybe<Scalars['Bytes']>;
  tag_lte?: InputMaybe<Scalars['Bytes']>;
  tag_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tag_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tag_contains?: InputMaybe<Scalars['Bytes']>;
  tag_not_contains?: InputMaybe<Scalars['Bytes']>;
  data?: InputMaybe<Array<Scalars['Bytes']>>;
  data_not?: InputMaybe<Array<Scalars['Bytes']>>;
  data_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  data_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  data_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  data_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Ciphertext_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Ciphertext_filter>>>;
};

export type Ciphertext_orderBy =
  | 'id'
  | 'iv'
  | 'tag'
  | 'data';

export type Commitment = {
  id: Scalars['Bytes'];
  blockNumber: Scalars['BigInt'];
  blockTimestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  treeNumber: Scalars['Int'];
  batchStartTreePosition: Scalars['Int'];
  treePosition: Scalars['Int'];
  commitmentType: CommitmentType;
  hash: Scalars['BigInt'];
};

export type CommitmentCiphertext = {
  id: Scalars['Bytes'];
  ciphertext: Ciphertext;
  blindedSenderViewingKey: Scalars['Bytes'];
  blindedReceiverViewingKey: Scalars['Bytes'];
  annotationData: Scalars['Bytes'];
  memo: Scalars['Bytes'];
};

export type CommitmentCiphertext_filter = {
  id?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  ciphertext?: InputMaybe<Scalars['String']>;
  ciphertext_not?: InputMaybe<Scalars['String']>;
  ciphertext_gt?: InputMaybe<Scalars['String']>;
  ciphertext_lt?: InputMaybe<Scalars['String']>;
  ciphertext_gte?: InputMaybe<Scalars['String']>;
  ciphertext_lte?: InputMaybe<Scalars['String']>;
  ciphertext_in?: InputMaybe<Array<Scalars['String']>>;
  ciphertext_not_in?: InputMaybe<Array<Scalars['String']>>;
  ciphertext_contains?: InputMaybe<Scalars['String']>;
  ciphertext_contains_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_not_contains?: InputMaybe<Scalars['String']>;
  ciphertext_not_contains_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_starts_with?: InputMaybe<Scalars['String']>;
  ciphertext_starts_with_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_not_starts_with?: InputMaybe<Scalars['String']>;
  ciphertext_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_ends_with?: InputMaybe<Scalars['String']>;
  ciphertext_ends_with_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_not_ends_with?: InputMaybe<Scalars['String']>;
  ciphertext_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_?: InputMaybe<Ciphertext_filter>;
  blindedSenderViewingKey?: InputMaybe<Scalars['Bytes']>;
  blindedSenderViewingKey_not?: InputMaybe<Scalars['Bytes']>;
  blindedSenderViewingKey_gt?: InputMaybe<Scalars['Bytes']>;
  blindedSenderViewingKey_lt?: InputMaybe<Scalars['Bytes']>;
  blindedSenderViewingKey_gte?: InputMaybe<Scalars['Bytes']>;
  blindedSenderViewingKey_lte?: InputMaybe<Scalars['Bytes']>;
  blindedSenderViewingKey_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blindedSenderViewingKey_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blindedSenderViewingKey_contains?: InputMaybe<Scalars['Bytes']>;
  blindedSenderViewingKey_not_contains?: InputMaybe<Scalars['Bytes']>;
  blindedReceiverViewingKey?: InputMaybe<Scalars['Bytes']>;
  blindedReceiverViewingKey_not?: InputMaybe<Scalars['Bytes']>;
  blindedReceiverViewingKey_gt?: InputMaybe<Scalars['Bytes']>;
  blindedReceiverViewingKey_lt?: InputMaybe<Scalars['Bytes']>;
  blindedReceiverViewingKey_gte?: InputMaybe<Scalars['Bytes']>;
  blindedReceiverViewingKey_lte?: InputMaybe<Scalars['Bytes']>;
  blindedReceiverViewingKey_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blindedReceiverViewingKey_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blindedReceiverViewingKey_contains?: InputMaybe<Scalars['Bytes']>;
  blindedReceiverViewingKey_not_contains?: InputMaybe<Scalars['Bytes']>;
  annotationData?: InputMaybe<Scalars['Bytes']>;
  annotationData_not?: InputMaybe<Scalars['Bytes']>;
  annotationData_gt?: InputMaybe<Scalars['Bytes']>;
  annotationData_lt?: InputMaybe<Scalars['Bytes']>;
  annotationData_gte?: InputMaybe<Scalars['Bytes']>;
  annotationData_lte?: InputMaybe<Scalars['Bytes']>;
  annotationData_in?: InputMaybe<Array<Scalars['Bytes']>>;
  annotationData_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  annotationData_contains?: InputMaybe<Scalars['Bytes']>;
  annotationData_not_contains?: InputMaybe<Scalars['Bytes']>;
  memo?: InputMaybe<Scalars['Bytes']>;
  memo_not?: InputMaybe<Scalars['Bytes']>;
  memo_gt?: InputMaybe<Scalars['Bytes']>;
  memo_lt?: InputMaybe<Scalars['Bytes']>;
  memo_gte?: InputMaybe<Scalars['Bytes']>;
  memo_lte?: InputMaybe<Scalars['Bytes']>;
  memo_in?: InputMaybe<Array<Scalars['Bytes']>>;
  memo_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  memo_contains?: InputMaybe<Scalars['Bytes']>;
  memo_not_contains?: InputMaybe<Scalars['Bytes']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<CommitmentCiphertext_filter>>>;
  or?: InputMaybe<Array<InputMaybe<CommitmentCiphertext_filter>>>;
};

export type CommitmentCiphertext_orderBy =
  | 'id'
  | 'ciphertext'
  | 'ciphertext__id'
  | 'ciphertext__iv'
  | 'ciphertext__tag'
  | 'blindedSenderViewingKey'
  | 'blindedReceiverViewingKey'
  | 'annotationData'
  | 'memo';

export type CommitmentPreimage = {
  id: Scalars['Bytes'];
  npk: Scalars['Bytes'];
  token: Token;
  value: Scalars['BigInt'];
};

export type CommitmentPreimage_filter = {
  id?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  npk?: InputMaybe<Scalars['Bytes']>;
  npk_not?: InputMaybe<Scalars['Bytes']>;
  npk_gt?: InputMaybe<Scalars['Bytes']>;
  npk_lt?: InputMaybe<Scalars['Bytes']>;
  npk_gte?: InputMaybe<Scalars['Bytes']>;
  npk_lte?: InputMaybe<Scalars['Bytes']>;
  npk_in?: InputMaybe<Array<Scalars['Bytes']>>;
  npk_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  npk_contains?: InputMaybe<Scalars['Bytes']>;
  npk_not_contains?: InputMaybe<Scalars['Bytes']>;
  token?: InputMaybe<Scalars['String']>;
  token_not?: InputMaybe<Scalars['String']>;
  token_gt?: InputMaybe<Scalars['String']>;
  token_lt?: InputMaybe<Scalars['String']>;
  token_gte?: InputMaybe<Scalars['String']>;
  token_lte?: InputMaybe<Scalars['String']>;
  token_in?: InputMaybe<Array<Scalars['String']>>;
  token_not_in?: InputMaybe<Array<Scalars['String']>>;
  token_contains?: InputMaybe<Scalars['String']>;
  token_contains_nocase?: InputMaybe<Scalars['String']>;
  token_not_contains?: InputMaybe<Scalars['String']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token_starts_with?: InputMaybe<Scalars['String']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token_not_starts_with?: InputMaybe<Scalars['String']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token_ends_with?: InputMaybe<Scalars['String']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_not_ends_with?: InputMaybe<Scalars['String']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_?: InputMaybe<Token_filter>;
  value?: InputMaybe<Scalars['BigInt']>;
  value_not?: InputMaybe<Scalars['BigInt']>;
  value_gt?: InputMaybe<Scalars['BigInt']>;
  value_lt?: InputMaybe<Scalars['BigInt']>;
  value_gte?: InputMaybe<Scalars['BigInt']>;
  value_lte?: InputMaybe<Scalars['BigInt']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<CommitmentPreimage_filter>>>;
  or?: InputMaybe<Array<InputMaybe<CommitmentPreimage_filter>>>;
};

export type CommitmentPreimage_orderBy =
  | 'id'
  | 'npk'
  | 'token'
  | 'token__id'
  | 'token__tokenType'
  | 'token__tokenAddress'
  | 'token__tokenSubID'
  | 'value';

export type CommitmentType =
  | 'ShieldCommitment'
  | 'TransactCommitment'
  | 'LegacyGeneratedCommitment'
  | 'LegacyEncryptedCommitment';

export type Commitment_filter = {
  id?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  treeNumber?: InputMaybe<Scalars['Int']>;
  treeNumber_not?: InputMaybe<Scalars['Int']>;
  treeNumber_gt?: InputMaybe<Scalars['Int']>;
  treeNumber_lt?: InputMaybe<Scalars['Int']>;
  treeNumber_gte?: InputMaybe<Scalars['Int']>;
  treeNumber_lte?: InputMaybe<Scalars['Int']>;
  treeNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  treeNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_not?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition?: InputMaybe<Scalars['Int']>;
  treePosition_not?: InputMaybe<Scalars['Int']>;
  treePosition_gt?: InputMaybe<Scalars['Int']>;
  treePosition_lt?: InputMaybe<Scalars['Int']>;
  treePosition_gte?: InputMaybe<Scalars['Int']>;
  treePosition_lte?: InputMaybe<Scalars['Int']>;
  treePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  commitmentType?: InputMaybe<CommitmentType>;
  commitmentType_not?: InputMaybe<CommitmentType>;
  commitmentType_in?: InputMaybe<Array<CommitmentType>>;
  commitmentType_not_in?: InputMaybe<Array<CommitmentType>>;
  hash?: InputMaybe<Scalars['BigInt']>;
  hash_not?: InputMaybe<Scalars['BigInt']>;
  hash_gt?: InputMaybe<Scalars['BigInt']>;
  hash_lt?: InputMaybe<Scalars['BigInt']>;
  hash_gte?: InputMaybe<Scalars['BigInt']>;
  hash_lte?: InputMaybe<Scalars['BigInt']>;
  hash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  hash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Commitment_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Commitment_filter>>>;
};

export type Commitment_orderBy =
  | 'id'
  | 'blockNumber'
  | 'blockTimestamp'
  | 'transactionHash'
  | 'treeNumber'
  | 'batchStartTreePosition'
  | 'treePosition'
  | 'commitmentType'
  | 'hash';

export type LegacyCommitmentCiphertext = {
  id: Scalars['Bytes'];
  ciphertext: Ciphertext;
  ephemeralKeys: Array<Scalars['Bytes']>;
  memo: Array<Scalars['Bytes']>;
};

export type LegacyCommitmentCiphertext_filter = {
  id?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  ciphertext?: InputMaybe<Scalars['String']>;
  ciphertext_not?: InputMaybe<Scalars['String']>;
  ciphertext_gt?: InputMaybe<Scalars['String']>;
  ciphertext_lt?: InputMaybe<Scalars['String']>;
  ciphertext_gte?: InputMaybe<Scalars['String']>;
  ciphertext_lte?: InputMaybe<Scalars['String']>;
  ciphertext_in?: InputMaybe<Array<Scalars['String']>>;
  ciphertext_not_in?: InputMaybe<Array<Scalars['String']>>;
  ciphertext_contains?: InputMaybe<Scalars['String']>;
  ciphertext_contains_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_not_contains?: InputMaybe<Scalars['String']>;
  ciphertext_not_contains_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_starts_with?: InputMaybe<Scalars['String']>;
  ciphertext_starts_with_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_not_starts_with?: InputMaybe<Scalars['String']>;
  ciphertext_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_ends_with?: InputMaybe<Scalars['String']>;
  ciphertext_ends_with_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_not_ends_with?: InputMaybe<Scalars['String']>;
  ciphertext_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_?: InputMaybe<Ciphertext_filter>;
  ephemeralKeys?: InputMaybe<Array<Scalars['Bytes']>>;
  ephemeralKeys_not?: InputMaybe<Array<Scalars['Bytes']>>;
  ephemeralKeys_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  ephemeralKeys_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  ephemeralKeys_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  ephemeralKeys_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  memo?: InputMaybe<Array<Scalars['Bytes']>>;
  memo_not?: InputMaybe<Array<Scalars['Bytes']>>;
  memo_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  memo_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  memo_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  memo_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<LegacyCommitmentCiphertext_filter>>>;
  or?: InputMaybe<Array<InputMaybe<LegacyCommitmentCiphertext_filter>>>;
};

export type LegacyCommitmentCiphertext_orderBy =
  | 'id'
  | 'ciphertext'
  | 'ciphertext__id'
  | 'ciphertext__iv'
  | 'ciphertext__tag'
  | 'ephemeralKeys'
  | 'memo';

export type LegacyEncryptedCommitment = Commitment & {
  id: Scalars['Bytes'];
  blockNumber: Scalars['BigInt'];
  blockTimestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  treeNumber: Scalars['Int'];
  batchStartTreePosition: Scalars['Int'];
  treePosition: Scalars['Int'];
  commitmentType: CommitmentType;
  hash: Scalars['BigInt'];
  ciphertext: LegacyCommitmentCiphertext;
};

export type LegacyEncryptedCommitment_filter = {
  id?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  treeNumber?: InputMaybe<Scalars['Int']>;
  treeNumber_not?: InputMaybe<Scalars['Int']>;
  treeNumber_gt?: InputMaybe<Scalars['Int']>;
  treeNumber_lt?: InputMaybe<Scalars['Int']>;
  treeNumber_gte?: InputMaybe<Scalars['Int']>;
  treeNumber_lte?: InputMaybe<Scalars['Int']>;
  treeNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  treeNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_not?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition?: InputMaybe<Scalars['Int']>;
  treePosition_not?: InputMaybe<Scalars['Int']>;
  treePosition_gt?: InputMaybe<Scalars['Int']>;
  treePosition_lt?: InputMaybe<Scalars['Int']>;
  treePosition_gte?: InputMaybe<Scalars['Int']>;
  treePosition_lte?: InputMaybe<Scalars['Int']>;
  treePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  commitmentType?: InputMaybe<CommitmentType>;
  commitmentType_not?: InputMaybe<CommitmentType>;
  commitmentType_in?: InputMaybe<Array<CommitmentType>>;
  commitmentType_not_in?: InputMaybe<Array<CommitmentType>>;
  hash?: InputMaybe<Scalars['BigInt']>;
  hash_not?: InputMaybe<Scalars['BigInt']>;
  hash_gt?: InputMaybe<Scalars['BigInt']>;
  hash_lt?: InputMaybe<Scalars['BigInt']>;
  hash_gte?: InputMaybe<Scalars['BigInt']>;
  hash_lte?: InputMaybe<Scalars['BigInt']>;
  hash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  hash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  ciphertext?: InputMaybe<Scalars['String']>;
  ciphertext_not?: InputMaybe<Scalars['String']>;
  ciphertext_gt?: InputMaybe<Scalars['String']>;
  ciphertext_lt?: InputMaybe<Scalars['String']>;
  ciphertext_gte?: InputMaybe<Scalars['String']>;
  ciphertext_lte?: InputMaybe<Scalars['String']>;
  ciphertext_in?: InputMaybe<Array<Scalars['String']>>;
  ciphertext_not_in?: InputMaybe<Array<Scalars['String']>>;
  ciphertext_contains?: InputMaybe<Scalars['String']>;
  ciphertext_contains_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_not_contains?: InputMaybe<Scalars['String']>;
  ciphertext_not_contains_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_starts_with?: InputMaybe<Scalars['String']>;
  ciphertext_starts_with_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_not_starts_with?: InputMaybe<Scalars['String']>;
  ciphertext_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_ends_with?: InputMaybe<Scalars['String']>;
  ciphertext_ends_with_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_not_ends_with?: InputMaybe<Scalars['String']>;
  ciphertext_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_?: InputMaybe<LegacyCommitmentCiphertext_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<LegacyEncryptedCommitment_filter>>>;
  or?: InputMaybe<Array<InputMaybe<LegacyEncryptedCommitment_filter>>>;
};

export type LegacyEncryptedCommitment_orderBy =
  | 'id'
  | 'blockNumber'
  | 'blockTimestamp'
  | 'transactionHash'
  | 'treeNumber'
  | 'batchStartTreePosition'
  | 'treePosition'
  | 'commitmentType'
  | 'hash'
  | 'ciphertext'
  | 'ciphertext__id';

export type LegacyGeneratedCommitment = Commitment & {
  id: Scalars['Bytes'];
  blockNumber: Scalars['BigInt'];
  blockTimestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  treeNumber: Scalars['Int'];
  batchStartTreePosition: Scalars['Int'];
  treePosition: Scalars['Int'];
  commitmentType: CommitmentType;
  hash: Scalars['BigInt'];
  preimage: CommitmentPreimage;
  encryptedRandom: Array<Scalars['Bytes']>;
};

export type LegacyGeneratedCommitment_filter = {
  id?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  treeNumber?: InputMaybe<Scalars['Int']>;
  treeNumber_not?: InputMaybe<Scalars['Int']>;
  treeNumber_gt?: InputMaybe<Scalars['Int']>;
  treeNumber_lt?: InputMaybe<Scalars['Int']>;
  treeNumber_gte?: InputMaybe<Scalars['Int']>;
  treeNumber_lte?: InputMaybe<Scalars['Int']>;
  treeNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  treeNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_not?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition?: InputMaybe<Scalars['Int']>;
  treePosition_not?: InputMaybe<Scalars['Int']>;
  treePosition_gt?: InputMaybe<Scalars['Int']>;
  treePosition_lt?: InputMaybe<Scalars['Int']>;
  treePosition_gte?: InputMaybe<Scalars['Int']>;
  treePosition_lte?: InputMaybe<Scalars['Int']>;
  treePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  commitmentType?: InputMaybe<CommitmentType>;
  commitmentType_not?: InputMaybe<CommitmentType>;
  commitmentType_in?: InputMaybe<Array<CommitmentType>>;
  commitmentType_not_in?: InputMaybe<Array<CommitmentType>>;
  hash?: InputMaybe<Scalars['BigInt']>;
  hash_not?: InputMaybe<Scalars['BigInt']>;
  hash_gt?: InputMaybe<Scalars['BigInt']>;
  hash_lt?: InputMaybe<Scalars['BigInt']>;
  hash_gte?: InputMaybe<Scalars['BigInt']>;
  hash_lte?: InputMaybe<Scalars['BigInt']>;
  hash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  hash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  preimage?: InputMaybe<Scalars['String']>;
  preimage_not?: InputMaybe<Scalars['String']>;
  preimage_gt?: InputMaybe<Scalars['String']>;
  preimage_lt?: InputMaybe<Scalars['String']>;
  preimage_gte?: InputMaybe<Scalars['String']>;
  preimage_lte?: InputMaybe<Scalars['String']>;
  preimage_in?: InputMaybe<Array<Scalars['String']>>;
  preimage_not_in?: InputMaybe<Array<Scalars['String']>>;
  preimage_contains?: InputMaybe<Scalars['String']>;
  preimage_contains_nocase?: InputMaybe<Scalars['String']>;
  preimage_not_contains?: InputMaybe<Scalars['String']>;
  preimage_not_contains_nocase?: InputMaybe<Scalars['String']>;
  preimage_starts_with?: InputMaybe<Scalars['String']>;
  preimage_starts_with_nocase?: InputMaybe<Scalars['String']>;
  preimage_not_starts_with?: InputMaybe<Scalars['String']>;
  preimage_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  preimage_ends_with?: InputMaybe<Scalars['String']>;
  preimage_ends_with_nocase?: InputMaybe<Scalars['String']>;
  preimage_not_ends_with?: InputMaybe<Scalars['String']>;
  preimage_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  preimage_?: InputMaybe<CommitmentPreimage_filter>;
  encryptedRandom?: InputMaybe<Array<Scalars['Bytes']>>;
  encryptedRandom_not?: InputMaybe<Array<Scalars['Bytes']>>;
  encryptedRandom_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  encryptedRandom_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  encryptedRandom_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  encryptedRandom_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<LegacyGeneratedCommitment_filter>>>;
  or?: InputMaybe<Array<InputMaybe<LegacyGeneratedCommitment_filter>>>;
};

export type LegacyGeneratedCommitment_orderBy =
  | 'id'
  | 'blockNumber'
  | 'blockTimestamp'
  | 'transactionHash'
  | 'treeNumber'
  | 'batchStartTreePosition'
  | 'treePosition'
  | 'commitmentType'
  | 'hash'
  | 'preimage'
  | 'preimage__id'
  | 'preimage__npk'
  | 'preimage__value'
  | 'encryptedRandom';

export type Nullifier = {
  id: Scalars['Bytes'];
  blockNumber: Scalars['BigInt'];
  blockTimestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  treeNumber: Scalars['Int'];
  nullifier: Scalars['Bytes'];
};

export type Nullifier_filter = {
  id?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  treeNumber?: InputMaybe<Scalars['Int']>;
  treeNumber_not?: InputMaybe<Scalars['Int']>;
  treeNumber_gt?: InputMaybe<Scalars['Int']>;
  treeNumber_lt?: InputMaybe<Scalars['Int']>;
  treeNumber_gte?: InputMaybe<Scalars['Int']>;
  treeNumber_lte?: InputMaybe<Scalars['Int']>;
  treeNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  treeNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  nullifier?: InputMaybe<Scalars['Bytes']>;
  nullifier_not?: InputMaybe<Scalars['Bytes']>;
  nullifier_gt?: InputMaybe<Scalars['Bytes']>;
  nullifier_lt?: InputMaybe<Scalars['Bytes']>;
  nullifier_gte?: InputMaybe<Scalars['Bytes']>;
  nullifier_lte?: InputMaybe<Scalars['Bytes']>;
  nullifier_in?: InputMaybe<Array<Scalars['Bytes']>>;
  nullifier_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  nullifier_contains?: InputMaybe<Scalars['Bytes']>;
  nullifier_not_contains?: InputMaybe<Scalars['Bytes']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Nullifier_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Nullifier_filter>>>;
};

export type Nullifier_orderBy =
  | 'id'
  | 'blockNumber'
  | 'blockTimestamp'
  | 'transactionHash'
  | 'treeNumber'
  | 'nullifier';

/** Defines the order direction, either ascending or descending */
export type OrderDirection =
  | 'asc'
  | 'desc';

export type Query = {
  token?: Maybe<Token>;
  tokens: Array<Token>;
  commitmentPreimage?: Maybe<CommitmentPreimage>;
  commitmentPreimages: Array<CommitmentPreimage>;
  ciphertext?: Maybe<Ciphertext>;
  ciphertexts: Array<Ciphertext>;
  legacyCommitmentCiphertext?: Maybe<LegacyCommitmentCiphertext>;
  legacyCommitmentCiphertexts: Array<LegacyCommitmentCiphertext>;
  commitmentCiphertext?: Maybe<CommitmentCiphertext>;
  commitmentCiphertexts: Array<CommitmentCiphertext>;
  legacyGeneratedCommitment?: Maybe<LegacyGeneratedCommitment>;
  legacyGeneratedCommitments: Array<LegacyGeneratedCommitment>;
  legacyEncryptedCommitment?: Maybe<LegacyEncryptedCommitment>;
  legacyEncryptedCommitments: Array<LegacyEncryptedCommitment>;
  shieldCommitment?: Maybe<ShieldCommitment>;
  shieldCommitments: Array<ShieldCommitment>;
  transactCommitment?: Maybe<TransactCommitment>;
  transactCommitments: Array<TransactCommitment>;
  unshield?: Maybe<Unshield>;
  unshields: Array<Unshield>;
  nullifier?: Maybe<Nullifier>;
  nullifiers: Array<Nullifier>;
  commitment?: Maybe<Commitment>;
  commitments: Array<Commitment>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type QuerytokenArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytokensArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Token_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Token_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerycommitmentPreimageArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerycommitmentPreimagesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CommitmentPreimage_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<CommitmentPreimage_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryciphertextArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryciphertextsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Ciphertext_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Ciphertext_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerylegacyCommitmentCiphertextArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerylegacyCommitmentCiphertextsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LegacyCommitmentCiphertext_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<LegacyCommitmentCiphertext_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerycommitmentCiphertextArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerycommitmentCiphertextsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CommitmentCiphertext_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<CommitmentCiphertext_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerylegacyGeneratedCommitmentArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerylegacyGeneratedCommitmentsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LegacyGeneratedCommitment_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<LegacyGeneratedCommitment_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerylegacyEncryptedCommitmentArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerylegacyEncryptedCommitmentsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LegacyEncryptedCommitment_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<LegacyEncryptedCommitment_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryshieldCommitmentArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryshieldCommitmentsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ShieldCommitment_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ShieldCommitment_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytransactCommitmentArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytransactCommitmentsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TransactCommitment_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TransactCommitment_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryunshieldArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryunshieldsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Unshield_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Unshield_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerynullifierArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerynullifiersArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Nullifier_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Nullifier_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerycommitmentArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerycommitmentsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Commitment_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Commitment_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Query_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type ShieldCommitment = Commitment & {
  id: Scalars['Bytes'];
  blockNumber: Scalars['BigInt'];
  blockTimestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  treeNumber: Scalars['Int'];
  batchStartTreePosition: Scalars['Int'];
  treePosition: Scalars['Int'];
  commitmentType: CommitmentType;
  hash: Scalars['BigInt'];
  preimage: CommitmentPreimage;
  encryptedBundle: Array<Scalars['Bytes']>;
  shieldKey: Scalars['Bytes'];
  fee?: Maybe<Scalars['BigInt']>;
};

export type ShieldCommitment_filter = {
  id?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  treeNumber?: InputMaybe<Scalars['Int']>;
  treeNumber_not?: InputMaybe<Scalars['Int']>;
  treeNumber_gt?: InputMaybe<Scalars['Int']>;
  treeNumber_lt?: InputMaybe<Scalars['Int']>;
  treeNumber_gte?: InputMaybe<Scalars['Int']>;
  treeNumber_lte?: InputMaybe<Scalars['Int']>;
  treeNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  treeNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_not?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition?: InputMaybe<Scalars['Int']>;
  treePosition_not?: InputMaybe<Scalars['Int']>;
  treePosition_gt?: InputMaybe<Scalars['Int']>;
  treePosition_lt?: InputMaybe<Scalars['Int']>;
  treePosition_gte?: InputMaybe<Scalars['Int']>;
  treePosition_lte?: InputMaybe<Scalars['Int']>;
  treePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  commitmentType?: InputMaybe<CommitmentType>;
  commitmentType_not?: InputMaybe<CommitmentType>;
  commitmentType_in?: InputMaybe<Array<CommitmentType>>;
  commitmentType_not_in?: InputMaybe<Array<CommitmentType>>;
  hash?: InputMaybe<Scalars['BigInt']>;
  hash_not?: InputMaybe<Scalars['BigInt']>;
  hash_gt?: InputMaybe<Scalars['BigInt']>;
  hash_lt?: InputMaybe<Scalars['BigInt']>;
  hash_gte?: InputMaybe<Scalars['BigInt']>;
  hash_lte?: InputMaybe<Scalars['BigInt']>;
  hash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  hash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  preimage?: InputMaybe<Scalars['String']>;
  preimage_not?: InputMaybe<Scalars['String']>;
  preimage_gt?: InputMaybe<Scalars['String']>;
  preimage_lt?: InputMaybe<Scalars['String']>;
  preimage_gte?: InputMaybe<Scalars['String']>;
  preimage_lte?: InputMaybe<Scalars['String']>;
  preimage_in?: InputMaybe<Array<Scalars['String']>>;
  preimage_not_in?: InputMaybe<Array<Scalars['String']>>;
  preimage_contains?: InputMaybe<Scalars['String']>;
  preimage_contains_nocase?: InputMaybe<Scalars['String']>;
  preimage_not_contains?: InputMaybe<Scalars['String']>;
  preimage_not_contains_nocase?: InputMaybe<Scalars['String']>;
  preimage_starts_with?: InputMaybe<Scalars['String']>;
  preimage_starts_with_nocase?: InputMaybe<Scalars['String']>;
  preimage_not_starts_with?: InputMaybe<Scalars['String']>;
  preimage_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  preimage_ends_with?: InputMaybe<Scalars['String']>;
  preimage_ends_with_nocase?: InputMaybe<Scalars['String']>;
  preimage_not_ends_with?: InputMaybe<Scalars['String']>;
  preimage_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  preimage_?: InputMaybe<CommitmentPreimage_filter>;
  encryptedBundle?: InputMaybe<Array<Scalars['Bytes']>>;
  encryptedBundle_not?: InputMaybe<Array<Scalars['Bytes']>>;
  encryptedBundle_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  encryptedBundle_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  encryptedBundle_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  encryptedBundle_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  shieldKey?: InputMaybe<Scalars['Bytes']>;
  shieldKey_not?: InputMaybe<Scalars['Bytes']>;
  shieldKey_gt?: InputMaybe<Scalars['Bytes']>;
  shieldKey_lt?: InputMaybe<Scalars['Bytes']>;
  shieldKey_gte?: InputMaybe<Scalars['Bytes']>;
  shieldKey_lte?: InputMaybe<Scalars['Bytes']>;
  shieldKey_in?: InputMaybe<Array<Scalars['Bytes']>>;
  shieldKey_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  shieldKey_contains?: InputMaybe<Scalars['Bytes']>;
  shieldKey_not_contains?: InputMaybe<Scalars['Bytes']>;
  fee?: InputMaybe<Scalars['BigInt']>;
  fee_not?: InputMaybe<Scalars['BigInt']>;
  fee_gt?: InputMaybe<Scalars['BigInt']>;
  fee_lt?: InputMaybe<Scalars['BigInt']>;
  fee_gte?: InputMaybe<Scalars['BigInt']>;
  fee_lte?: InputMaybe<Scalars['BigInt']>;
  fee_in?: InputMaybe<Array<Scalars['BigInt']>>;
  fee_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ShieldCommitment_filter>>>;
  or?: InputMaybe<Array<InputMaybe<ShieldCommitment_filter>>>;
};

export type ShieldCommitment_orderBy =
  | 'id'
  | 'blockNumber'
  | 'blockTimestamp'
  | 'transactionHash'
  | 'treeNumber'
  | 'batchStartTreePosition'
  | 'treePosition'
  | 'commitmentType'
  | 'hash'
  | 'preimage'
  | 'preimage__id'
  | 'preimage__npk'
  | 'preimage__value'
  | 'encryptedBundle'
  | 'shieldKey'
  | 'fee';

export type Subscription = {
  token?: Maybe<Token>;
  tokens: Array<Token>;
  commitmentPreimage?: Maybe<CommitmentPreimage>;
  commitmentPreimages: Array<CommitmentPreimage>;
  ciphertext?: Maybe<Ciphertext>;
  ciphertexts: Array<Ciphertext>;
  legacyCommitmentCiphertext?: Maybe<LegacyCommitmentCiphertext>;
  legacyCommitmentCiphertexts: Array<LegacyCommitmentCiphertext>;
  commitmentCiphertext?: Maybe<CommitmentCiphertext>;
  commitmentCiphertexts: Array<CommitmentCiphertext>;
  legacyGeneratedCommitment?: Maybe<LegacyGeneratedCommitment>;
  legacyGeneratedCommitments: Array<LegacyGeneratedCommitment>;
  legacyEncryptedCommitment?: Maybe<LegacyEncryptedCommitment>;
  legacyEncryptedCommitments: Array<LegacyEncryptedCommitment>;
  shieldCommitment?: Maybe<ShieldCommitment>;
  shieldCommitments: Array<ShieldCommitment>;
  transactCommitment?: Maybe<TransactCommitment>;
  transactCommitments: Array<TransactCommitment>;
  unshield?: Maybe<Unshield>;
  unshields: Array<Unshield>;
  nullifier?: Maybe<Nullifier>;
  nullifiers: Array<Nullifier>;
  commitment?: Maybe<Commitment>;
  commitments: Array<Commitment>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type SubscriptiontokenArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiontokensArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Token_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Token_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptioncommitmentPreimageArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptioncommitmentPreimagesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CommitmentPreimage_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<CommitmentPreimage_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionciphertextArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionciphertextsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Ciphertext_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Ciphertext_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionlegacyCommitmentCiphertextArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionlegacyCommitmentCiphertextsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LegacyCommitmentCiphertext_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<LegacyCommitmentCiphertext_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptioncommitmentCiphertextArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptioncommitmentCiphertextsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CommitmentCiphertext_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<CommitmentCiphertext_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionlegacyGeneratedCommitmentArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionlegacyGeneratedCommitmentsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LegacyGeneratedCommitment_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<LegacyGeneratedCommitment_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionlegacyEncryptedCommitmentArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionlegacyEncryptedCommitmentsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LegacyEncryptedCommitment_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<LegacyEncryptedCommitment_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionshieldCommitmentArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionshieldCommitmentsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ShieldCommitment_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ShieldCommitment_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiontransactCommitmentArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiontransactCommitmentsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TransactCommitment_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TransactCommitment_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionunshieldArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionunshieldsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Unshield_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Unshield_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionnullifierArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionnullifiersArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Nullifier_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Nullifier_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptioncommitmentArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptioncommitmentsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Commitment_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Commitment_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Subscription_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type Token = {
  id: Scalars['Bytes'];
  tokenType: TokenType;
  tokenAddress: Scalars['Bytes'];
  tokenSubID: Scalars['Bytes'];
};

export type TokenType =
  | 'ERC20'
  | 'ERC721'
  | 'ERC1155';

export type Token_filter = {
  id?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  tokenType?: InputMaybe<TokenType>;
  tokenType_not?: InputMaybe<TokenType>;
  tokenType_in?: InputMaybe<Array<TokenType>>;
  tokenType_not_in?: InputMaybe<Array<TokenType>>;
  tokenAddress?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_not?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_gt?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_lt?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_gte?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_lte?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tokenAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tokenAddress_contains?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
  tokenSubID?: InputMaybe<Scalars['Bytes']>;
  tokenSubID_not?: InputMaybe<Scalars['Bytes']>;
  tokenSubID_gt?: InputMaybe<Scalars['Bytes']>;
  tokenSubID_lt?: InputMaybe<Scalars['Bytes']>;
  tokenSubID_gte?: InputMaybe<Scalars['Bytes']>;
  tokenSubID_lte?: InputMaybe<Scalars['Bytes']>;
  tokenSubID_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tokenSubID_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tokenSubID_contains?: InputMaybe<Scalars['Bytes']>;
  tokenSubID_not_contains?: InputMaybe<Scalars['Bytes']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Token_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Token_filter>>>;
};

export type Token_orderBy =
  | 'id'
  | 'tokenType'
  | 'tokenAddress'
  | 'tokenSubID';

export type TransactCommitment = Commitment & {
  id: Scalars['Bytes'];
  blockNumber: Scalars['BigInt'];
  blockTimestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  treeNumber: Scalars['Int'];
  batchStartTreePosition: Scalars['Int'];
  treePosition: Scalars['Int'];
  commitmentType: CommitmentType;
  hash: Scalars['BigInt'];
  ciphertext: CommitmentCiphertext;
};

export type TransactCommitment_filter = {
  id?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  treeNumber?: InputMaybe<Scalars['Int']>;
  treeNumber_not?: InputMaybe<Scalars['Int']>;
  treeNumber_gt?: InputMaybe<Scalars['Int']>;
  treeNumber_lt?: InputMaybe<Scalars['Int']>;
  treeNumber_gte?: InputMaybe<Scalars['Int']>;
  treeNumber_lte?: InputMaybe<Scalars['Int']>;
  treeNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  treeNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_not?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition?: InputMaybe<Scalars['Int']>;
  treePosition_not?: InputMaybe<Scalars['Int']>;
  treePosition_gt?: InputMaybe<Scalars['Int']>;
  treePosition_lt?: InputMaybe<Scalars['Int']>;
  treePosition_gte?: InputMaybe<Scalars['Int']>;
  treePosition_lte?: InputMaybe<Scalars['Int']>;
  treePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  commitmentType?: InputMaybe<CommitmentType>;
  commitmentType_not?: InputMaybe<CommitmentType>;
  commitmentType_in?: InputMaybe<Array<CommitmentType>>;
  commitmentType_not_in?: InputMaybe<Array<CommitmentType>>;
  hash?: InputMaybe<Scalars['BigInt']>;
  hash_not?: InputMaybe<Scalars['BigInt']>;
  hash_gt?: InputMaybe<Scalars['BigInt']>;
  hash_lt?: InputMaybe<Scalars['BigInt']>;
  hash_gte?: InputMaybe<Scalars['BigInt']>;
  hash_lte?: InputMaybe<Scalars['BigInt']>;
  hash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  hash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  ciphertext?: InputMaybe<Scalars['String']>;
  ciphertext_not?: InputMaybe<Scalars['String']>;
  ciphertext_gt?: InputMaybe<Scalars['String']>;
  ciphertext_lt?: InputMaybe<Scalars['String']>;
  ciphertext_gte?: InputMaybe<Scalars['String']>;
  ciphertext_lte?: InputMaybe<Scalars['String']>;
  ciphertext_in?: InputMaybe<Array<Scalars['String']>>;
  ciphertext_not_in?: InputMaybe<Array<Scalars['String']>>;
  ciphertext_contains?: InputMaybe<Scalars['String']>;
  ciphertext_contains_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_not_contains?: InputMaybe<Scalars['String']>;
  ciphertext_not_contains_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_starts_with?: InputMaybe<Scalars['String']>;
  ciphertext_starts_with_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_not_starts_with?: InputMaybe<Scalars['String']>;
  ciphertext_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_ends_with?: InputMaybe<Scalars['String']>;
  ciphertext_ends_with_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_not_ends_with?: InputMaybe<Scalars['String']>;
  ciphertext_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  ciphertext_?: InputMaybe<CommitmentCiphertext_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TransactCommitment_filter>>>;
  or?: InputMaybe<Array<InputMaybe<TransactCommitment_filter>>>;
};

export type TransactCommitment_orderBy =
  | 'id'
  | 'blockNumber'
  | 'blockTimestamp'
  | 'transactionHash'
  | 'treeNumber'
  | 'batchStartTreePosition'
  | 'treePosition'
  | 'commitmentType'
  | 'hash'
  | 'ciphertext'
  | 'ciphertext__id'
  | 'ciphertext__blindedSenderViewingKey'
  | 'ciphertext__blindedReceiverViewingKey'
  | 'ciphertext__annotationData'
  | 'ciphertext__memo';

export type Unshield = {
  id: Scalars['Bytes'];
  blockNumber: Scalars['BigInt'];
  blockTimestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  to: Scalars['Bytes'];
  token: Token;
  amount: Scalars['BigInt'];
  fee: Scalars['BigInt'];
  eventLogIndex: Scalars['BigInt'];
};

export type Unshield_filter = {
  id?: InputMaybe<Scalars['Bytes']>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_gt?: InputMaybe<Scalars['Bytes']>;
  id_lt?: InputMaybe<Scalars['Bytes']>;
  id_gte?: InputMaybe<Scalars['Bytes']>;
  id_lte?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  to?: InputMaybe<Scalars['Bytes']>;
  to_not?: InputMaybe<Scalars['Bytes']>;
  to_gt?: InputMaybe<Scalars['Bytes']>;
  to_lt?: InputMaybe<Scalars['Bytes']>;
  to_gte?: InputMaybe<Scalars['Bytes']>;
  to_lte?: InputMaybe<Scalars['Bytes']>;
  to_in?: InputMaybe<Array<Scalars['Bytes']>>;
  to_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  to_contains?: InputMaybe<Scalars['Bytes']>;
  to_not_contains?: InputMaybe<Scalars['Bytes']>;
  token?: InputMaybe<Scalars['String']>;
  token_not?: InputMaybe<Scalars['String']>;
  token_gt?: InputMaybe<Scalars['String']>;
  token_lt?: InputMaybe<Scalars['String']>;
  token_gte?: InputMaybe<Scalars['String']>;
  token_lte?: InputMaybe<Scalars['String']>;
  token_in?: InputMaybe<Array<Scalars['String']>>;
  token_not_in?: InputMaybe<Array<Scalars['String']>>;
  token_contains?: InputMaybe<Scalars['String']>;
  token_contains_nocase?: InputMaybe<Scalars['String']>;
  token_not_contains?: InputMaybe<Scalars['String']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token_starts_with?: InputMaybe<Scalars['String']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token_not_starts_with?: InputMaybe<Scalars['String']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token_ends_with?: InputMaybe<Scalars['String']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_not_ends_with?: InputMaybe<Scalars['String']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_?: InputMaybe<Token_filter>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  fee?: InputMaybe<Scalars['BigInt']>;
  fee_not?: InputMaybe<Scalars['BigInt']>;
  fee_gt?: InputMaybe<Scalars['BigInt']>;
  fee_lt?: InputMaybe<Scalars['BigInt']>;
  fee_gte?: InputMaybe<Scalars['BigInt']>;
  fee_lte?: InputMaybe<Scalars['BigInt']>;
  fee_in?: InputMaybe<Array<Scalars['BigInt']>>;
  fee_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  eventLogIndex?: InputMaybe<Scalars['BigInt']>;
  eventLogIndex_not?: InputMaybe<Scalars['BigInt']>;
  eventLogIndex_gt?: InputMaybe<Scalars['BigInt']>;
  eventLogIndex_lt?: InputMaybe<Scalars['BigInt']>;
  eventLogIndex_gte?: InputMaybe<Scalars['BigInt']>;
  eventLogIndex_lte?: InputMaybe<Scalars['BigInt']>;
  eventLogIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  eventLogIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Unshield_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Unshield_filter>>>;
};

export type Unshield_orderBy =
  | 'id'
  | 'blockNumber'
  | 'blockTimestamp'
  | 'transactionHash'
  | 'to'
  | 'token'
  | 'token__id'
  | 'token__tokenType'
  | 'token__tokenAddress'
  | 'token__tokenSubID'
  | 'amount'
  | 'fee'
  | 'eventLogIndex';

export type _Block_ = {
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export type _SubgraphErrorPolicy_ =
  /** Data will be returned even if the subgraph has indexing errors */
  | 'allow'
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  | 'deny';

  export type QuerySdk = {
      /** null **/
  token: InContextSdkMethod<Query['token'], QuerytokenArgs, MeshContext>,
  /** null **/
  tokens: InContextSdkMethod<Query['tokens'], QuerytokensArgs, MeshContext>,
  /** null **/
  commitmentPreimage: InContextSdkMethod<Query['commitmentPreimage'], QuerycommitmentPreimageArgs, MeshContext>,
  /** null **/
  commitmentPreimages: InContextSdkMethod<Query['commitmentPreimages'], QuerycommitmentPreimagesArgs, MeshContext>,
  /** null **/
  ciphertext: InContextSdkMethod<Query['ciphertext'], QueryciphertextArgs, MeshContext>,
  /** null **/
  ciphertexts: InContextSdkMethod<Query['ciphertexts'], QueryciphertextsArgs, MeshContext>,
  /** null **/
  legacyCommitmentCiphertext: InContextSdkMethod<Query['legacyCommitmentCiphertext'], QuerylegacyCommitmentCiphertextArgs, MeshContext>,
  /** null **/
  legacyCommitmentCiphertexts: InContextSdkMethod<Query['legacyCommitmentCiphertexts'], QuerylegacyCommitmentCiphertextsArgs, MeshContext>,
  /** null **/
  commitmentCiphertext: InContextSdkMethod<Query['commitmentCiphertext'], QuerycommitmentCiphertextArgs, MeshContext>,
  /** null **/
  commitmentCiphertexts: InContextSdkMethod<Query['commitmentCiphertexts'], QuerycommitmentCiphertextsArgs, MeshContext>,
  /** null **/
  legacyGeneratedCommitment: InContextSdkMethod<Query['legacyGeneratedCommitment'], QuerylegacyGeneratedCommitmentArgs, MeshContext>,
  /** null **/
  legacyGeneratedCommitments: InContextSdkMethod<Query['legacyGeneratedCommitments'], QuerylegacyGeneratedCommitmentsArgs, MeshContext>,
  /** null **/
  legacyEncryptedCommitment: InContextSdkMethod<Query['legacyEncryptedCommitment'], QuerylegacyEncryptedCommitmentArgs, MeshContext>,
  /** null **/
  legacyEncryptedCommitments: InContextSdkMethod<Query['legacyEncryptedCommitments'], QuerylegacyEncryptedCommitmentsArgs, MeshContext>,
  /** null **/
  shieldCommitment: InContextSdkMethod<Query['shieldCommitment'], QueryshieldCommitmentArgs, MeshContext>,
  /** null **/
  shieldCommitments: InContextSdkMethod<Query['shieldCommitments'], QueryshieldCommitmentsArgs, MeshContext>,
  /** null **/
  transactCommitment: InContextSdkMethod<Query['transactCommitment'], QuerytransactCommitmentArgs, MeshContext>,
  /** null **/
  transactCommitments: InContextSdkMethod<Query['transactCommitments'], QuerytransactCommitmentsArgs, MeshContext>,
  /** null **/
  unshield: InContextSdkMethod<Query['unshield'], QueryunshieldArgs, MeshContext>,
  /** null **/
  unshields: InContextSdkMethod<Query['unshields'], QueryunshieldsArgs, MeshContext>,
  /** null **/
  nullifier: InContextSdkMethod<Query['nullifier'], QuerynullifierArgs, MeshContext>,
  /** null **/
  nullifiers: InContextSdkMethod<Query['nullifiers'], QuerynullifiersArgs, MeshContext>,
  /** null **/
  commitment: InContextSdkMethod<Query['commitment'], QuerycommitmentArgs, MeshContext>,
  /** null **/
  commitments: InContextSdkMethod<Query['commitments'], QuerycommitmentsArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Query['_meta'], Query_metaArgs, MeshContext>
  };

  export type MutationSdk = {
    
  };

  export type SubscriptionSdk = {
      /** null **/
  token: InContextSdkMethod<Subscription['token'], SubscriptiontokenArgs, MeshContext>,
  /** null **/
  tokens: InContextSdkMethod<Subscription['tokens'], SubscriptiontokensArgs, MeshContext>,
  /** null **/
  commitmentPreimage: InContextSdkMethod<Subscription['commitmentPreimage'], SubscriptioncommitmentPreimageArgs, MeshContext>,
  /** null **/
  commitmentPreimages: InContextSdkMethod<Subscription['commitmentPreimages'], SubscriptioncommitmentPreimagesArgs, MeshContext>,
  /** null **/
  ciphertext: InContextSdkMethod<Subscription['ciphertext'], SubscriptionciphertextArgs, MeshContext>,
  /** null **/
  ciphertexts: InContextSdkMethod<Subscription['ciphertexts'], SubscriptionciphertextsArgs, MeshContext>,
  /** null **/
  legacyCommitmentCiphertext: InContextSdkMethod<Subscription['legacyCommitmentCiphertext'], SubscriptionlegacyCommitmentCiphertextArgs, MeshContext>,
  /** null **/
  legacyCommitmentCiphertexts: InContextSdkMethod<Subscription['legacyCommitmentCiphertexts'], SubscriptionlegacyCommitmentCiphertextsArgs, MeshContext>,
  /** null **/
  commitmentCiphertext: InContextSdkMethod<Subscription['commitmentCiphertext'], SubscriptioncommitmentCiphertextArgs, MeshContext>,
  /** null **/
  commitmentCiphertexts: InContextSdkMethod<Subscription['commitmentCiphertexts'], SubscriptioncommitmentCiphertextsArgs, MeshContext>,
  /** null **/
  legacyGeneratedCommitment: InContextSdkMethod<Subscription['legacyGeneratedCommitment'], SubscriptionlegacyGeneratedCommitmentArgs, MeshContext>,
  /** null **/
  legacyGeneratedCommitments: InContextSdkMethod<Subscription['legacyGeneratedCommitments'], SubscriptionlegacyGeneratedCommitmentsArgs, MeshContext>,
  /** null **/
  legacyEncryptedCommitment: InContextSdkMethod<Subscription['legacyEncryptedCommitment'], SubscriptionlegacyEncryptedCommitmentArgs, MeshContext>,
  /** null **/
  legacyEncryptedCommitments: InContextSdkMethod<Subscription['legacyEncryptedCommitments'], SubscriptionlegacyEncryptedCommitmentsArgs, MeshContext>,
  /** null **/
  shieldCommitment: InContextSdkMethod<Subscription['shieldCommitment'], SubscriptionshieldCommitmentArgs, MeshContext>,
  /** null **/
  shieldCommitments: InContextSdkMethod<Subscription['shieldCommitments'], SubscriptionshieldCommitmentsArgs, MeshContext>,
  /** null **/
  transactCommitment: InContextSdkMethod<Subscription['transactCommitment'], SubscriptiontransactCommitmentArgs, MeshContext>,
  /** null **/
  transactCommitments: InContextSdkMethod<Subscription['transactCommitments'], SubscriptiontransactCommitmentsArgs, MeshContext>,
  /** null **/
  unshield: InContextSdkMethod<Subscription['unshield'], SubscriptionunshieldArgs, MeshContext>,
  /** null **/
  unshields: InContextSdkMethod<Subscription['unshields'], SubscriptionunshieldsArgs, MeshContext>,
  /** null **/
  nullifier: InContextSdkMethod<Subscription['nullifier'], SubscriptionnullifierArgs, MeshContext>,
  /** null **/
  nullifiers: InContextSdkMethod<Subscription['nullifiers'], SubscriptionnullifiersArgs, MeshContext>,
  /** null **/
  commitment: InContextSdkMethod<Subscription['commitment'], SubscriptioncommitmentArgs, MeshContext>,
  /** null **/
  commitments: InContextSdkMethod<Subscription['commitments'], SubscriptioncommitmentsArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Subscription['_meta'], Subscription_metaArgs, MeshContext>
  };

  export type Context = {
      ["ethereum"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      
    };
}
