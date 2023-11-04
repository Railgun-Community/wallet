/**
 * TO UPDATE:
 * 1. Find all places that are "MODIFIED", move them into the new built index.ts (in .graphclient)
 * 2. add these comments (including eslint disables)
 * 3. move the modified index file to quick-sync/graphql/
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/no-duplicates */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable import/newline-after-import */
/* eslint-disable prefer-template */
/* eslint-disable @typescript-eslint/no-unsafe-return */

// @ts-nocheck
import {
  GraphQLResolveInfo,
  SelectionSetNode,
  FieldNode,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from 'graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { gql } from '@graphql-mesh/utils';

import type { GetMeshOptions } from '@graphql-mesh/runtime';
import type { YamlConfig } from '@graphql-mesh/types';
import { PubSub } from '@graphql-mesh/utils';
import { DefaultLogger } from '@graphql-mesh/utils';
import MeshCache from '@graphql-mesh/cache-localforage';
import { fetch as fetchFn } from '@whatwg-node/fetch';

import { MeshResolvedSource } from '@graphql-mesh/runtime';
import { MeshTransform, MeshPlugin } from '@graphql-mesh/types';
import GraphqlHandler from '@graphql-mesh/graphql';
import BareMerger from '@graphql-mesh/merger-bare';
import { printWithCache } from '@graphql-mesh/utils';
import { createMeshHTTPHandler, MeshHTTPHandler } from '@graphql-mesh/http';
import {
  getMesh,
  ExecuteMeshFn,
  SubscribeMeshFn,
  MeshContext as BaseMeshContext,
  MeshInstance,
} from '@graphql-mesh/runtime';
import { MeshStore, FsStoreStorageAdapter } from '@graphql-mesh/store';
import { path as pathModule } from '@graphql-mesh/cross-helpers';
import { ImportFn } from '@graphql-mesh/types';
import type { MumbaiTypes } from './.graphclient/sources/mumbai/types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: string; // MODIFIED
  BigInt: string; // MODIFIED
  Bytes: string; // MODIFIED
  Int8: string; // MODIFIED
};

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type Commitment = {
  id: Scalars['Bytes'];
  blockNumber: Scalars['BigInt'];
  blockTimestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  treeNumber: Scalars['Int'];
  commitmentType: CommitmentType;
  hashes: Array<Scalars['Bytes']>;
};

export type CommitmentCiphertext = {
  id: Scalars['Bytes'];
  ciphertext: Scalars['Bytes'];
  blindedSenderViewingKey: Scalars['Bytes'];
  blindedReceiverViewingKey: Scalars['Bytes'];
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
  ciphertext?: InputMaybe<Scalars['Bytes']>;
  ciphertext_not?: InputMaybe<Scalars['Bytes']>;
  ciphertext_gt?: InputMaybe<Scalars['Bytes']>;
  ciphertext_lt?: InputMaybe<Scalars['Bytes']>;
  ciphertext_gte?: InputMaybe<Scalars['Bytes']>;
  ciphertext_lte?: InputMaybe<Scalars['Bytes']>;
  ciphertext_in?: InputMaybe<Array<Scalars['Bytes']>>;
  ciphertext_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  ciphertext_contains?: InputMaybe<Scalars['Bytes']>;
  ciphertext_not_contains?: InputMaybe<Scalars['Bytes']>;
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
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<CommitmentCiphertext_filter>>>;
  or?: InputMaybe<Array<InputMaybe<CommitmentCiphertext_filter>>>;
};

export type CommitmentCiphertext_orderBy =
  | 'id'
  | 'ciphertext'
  | 'blindedSenderViewingKey'
  | 'blindedReceiverViewingKey';

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
  commitmentType?: InputMaybe<CommitmentType>;
  commitmentType_not?: InputMaybe<CommitmentType>;
  commitmentType_in?: InputMaybe<Array<CommitmentType>>;
  commitmentType_not_in?: InputMaybe<Array<CommitmentType>>;
  hashes?: InputMaybe<Array<Scalars['Bytes']>>;
  hashes_not?: InputMaybe<Array<Scalars['Bytes']>>;
  hashes_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  hashes_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  hashes_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  hashes_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
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
  | 'commitmentType'
  | 'hashes';

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
export type OrderDirection = 'asc' | 'desc';

export type Query = {
  token?: Maybe<Token>;
  tokens: Array<Token>;
  commitmentPreimage?: Maybe<CommitmentPreimage>;
  commitmentPreimages: Array<CommitmentPreimage>;
  commitmentCiphertext?: Maybe<CommitmentCiphertext>;
  commitmentCiphertexts: Array<CommitmentCiphertext>;
  shieldCommitment?: Maybe<ShieldCommitment>;
  shieldCommitments: Array<ShieldCommitment>;
  transactCommitment?: Maybe<TransactCommitment>;
  transactCommitments: Array<TransactCommitment>;
  unshield?: Maybe<Unshield>;
  unshields: Array<Unshield>;
  nullifier?: Maybe<Nullifier>;
  nullifiers: Array<Nullifier>;
  railgunTransaction?: Maybe<RailgunTransaction>;
  railgunTransactions: Array<RailgunTransaction>;
  verificationHash?: Maybe<VerificationHash>;
  verificationHashes: Array<VerificationHash>;
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

export type QueryrailgunTransactionArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryrailgunTransactionsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RailgunTransaction_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<RailgunTransaction_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryverificationHashArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryverificationHashesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VerificationHash_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VerificationHash_filter>;
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

export type RailgunTransaction = {
  id: Scalars['Bytes'];
  blockNumber: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  nullifiers: Array<Scalars['Bytes']>;
  commitments: Array<Scalars['Bytes']>;
  boundParamsHash: Scalars['Bytes'];
  hasUnshield: Scalars['Boolean'];
  utxoTreeIn: Scalars['BigInt'];
  utxoTreeOut: Scalars['BigInt'];
  utxoBatchStartPositionOut: Scalars['BigInt'];
  unshieldToken: Token;
  unshieldToAddress: Scalars['Bytes'];
  unshieldValue: Scalars['BigInt'];
  blockTimestamp: Scalars['BigInt'];
  verificationHash: Scalars['Bytes'];
};

export type RailgunTransaction_filter = {
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
  nullifiers?: InputMaybe<Array<Scalars['Bytes']>>;
  nullifiers_not?: InputMaybe<Array<Scalars['Bytes']>>;
  nullifiers_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  nullifiers_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  nullifiers_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  nullifiers_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  commitments?: InputMaybe<Array<Scalars['Bytes']>>;
  commitments_not?: InputMaybe<Array<Scalars['Bytes']>>;
  commitments_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  commitments_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  commitments_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  commitments_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  boundParamsHash?: InputMaybe<Scalars['Bytes']>;
  boundParamsHash_not?: InputMaybe<Scalars['Bytes']>;
  boundParamsHash_gt?: InputMaybe<Scalars['Bytes']>;
  boundParamsHash_lt?: InputMaybe<Scalars['Bytes']>;
  boundParamsHash_gte?: InputMaybe<Scalars['Bytes']>;
  boundParamsHash_lte?: InputMaybe<Scalars['Bytes']>;
  boundParamsHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  boundParamsHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  boundParamsHash_contains?: InputMaybe<Scalars['Bytes']>;
  boundParamsHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  hasUnshield?: InputMaybe<Scalars['Boolean']>;
  hasUnshield_not?: InputMaybe<Scalars['Boolean']>;
  hasUnshield_in?: InputMaybe<Array<Scalars['Boolean']>>;
  hasUnshield_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  utxoTreeIn?: InputMaybe<Scalars['BigInt']>;
  utxoTreeIn_not?: InputMaybe<Scalars['BigInt']>;
  utxoTreeIn_gt?: InputMaybe<Scalars['BigInt']>;
  utxoTreeIn_lt?: InputMaybe<Scalars['BigInt']>;
  utxoTreeIn_gte?: InputMaybe<Scalars['BigInt']>;
  utxoTreeIn_lte?: InputMaybe<Scalars['BigInt']>;
  utxoTreeIn_in?: InputMaybe<Array<Scalars['BigInt']>>;
  utxoTreeIn_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  utxoTreeOut?: InputMaybe<Scalars['BigInt']>;
  utxoTreeOut_not?: InputMaybe<Scalars['BigInt']>;
  utxoTreeOut_gt?: InputMaybe<Scalars['BigInt']>;
  utxoTreeOut_lt?: InputMaybe<Scalars['BigInt']>;
  utxoTreeOut_gte?: InputMaybe<Scalars['BigInt']>;
  utxoTreeOut_lte?: InputMaybe<Scalars['BigInt']>;
  utxoTreeOut_in?: InputMaybe<Array<Scalars['BigInt']>>;
  utxoTreeOut_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  utxoBatchStartPositionOut?: InputMaybe<Scalars['BigInt']>;
  utxoBatchStartPositionOut_not?: InputMaybe<Scalars['BigInt']>;
  utxoBatchStartPositionOut_gt?: InputMaybe<Scalars['BigInt']>;
  utxoBatchStartPositionOut_lt?: InputMaybe<Scalars['BigInt']>;
  utxoBatchStartPositionOut_gte?: InputMaybe<Scalars['BigInt']>;
  utxoBatchStartPositionOut_lte?: InputMaybe<Scalars['BigInt']>;
  utxoBatchStartPositionOut_in?: InputMaybe<Array<Scalars['BigInt']>>;
  utxoBatchStartPositionOut_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  unshieldToken?: InputMaybe<Scalars['String']>;
  unshieldToken_not?: InputMaybe<Scalars['String']>;
  unshieldToken_gt?: InputMaybe<Scalars['String']>;
  unshieldToken_lt?: InputMaybe<Scalars['String']>;
  unshieldToken_gte?: InputMaybe<Scalars['String']>;
  unshieldToken_lte?: InputMaybe<Scalars['String']>;
  unshieldToken_in?: InputMaybe<Array<Scalars['String']>>;
  unshieldToken_not_in?: InputMaybe<Array<Scalars['String']>>;
  unshieldToken_contains?: InputMaybe<Scalars['String']>;
  unshieldToken_contains_nocase?: InputMaybe<Scalars['String']>;
  unshieldToken_not_contains?: InputMaybe<Scalars['String']>;
  unshieldToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
  unshieldToken_starts_with?: InputMaybe<Scalars['String']>;
  unshieldToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
  unshieldToken_not_starts_with?: InputMaybe<Scalars['String']>;
  unshieldToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  unshieldToken_ends_with?: InputMaybe<Scalars['String']>;
  unshieldToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
  unshieldToken_not_ends_with?: InputMaybe<Scalars['String']>;
  unshieldToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  unshieldToken_?: InputMaybe<Token_filter>;
  unshieldToAddress?: InputMaybe<Scalars['Bytes']>;
  unshieldToAddress_not?: InputMaybe<Scalars['Bytes']>;
  unshieldToAddress_gt?: InputMaybe<Scalars['Bytes']>;
  unshieldToAddress_lt?: InputMaybe<Scalars['Bytes']>;
  unshieldToAddress_gte?: InputMaybe<Scalars['Bytes']>;
  unshieldToAddress_lte?: InputMaybe<Scalars['Bytes']>;
  unshieldToAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
  unshieldToAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  unshieldToAddress_contains?: InputMaybe<Scalars['Bytes']>;
  unshieldToAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
  unshieldValue?: InputMaybe<Scalars['BigInt']>;
  unshieldValue_not?: InputMaybe<Scalars['BigInt']>;
  unshieldValue_gt?: InputMaybe<Scalars['BigInt']>;
  unshieldValue_lt?: InputMaybe<Scalars['BigInt']>;
  unshieldValue_gte?: InputMaybe<Scalars['BigInt']>;
  unshieldValue_lte?: InputMaybe<Scalars['BigInt']>;
  unshieldValue_in?: InputMaybe<Array<Scalars['BigInt']>>;
  unshieldValue_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  verificationHash?: InputMaybe<Scalars['Bytes']>;
  verificationHash_not?: InputMaybe<Scalars['Bytes']>;
  verificationHash_gt?: InputMaybe<Scalars['Bytes']>;
  verificationHash_lt?: InputMaybe<Scalars['Bytes']>;
  verificationHash_gte?: InputMaybe<Scalars['Bytes']>;
  verificationHash_lte?: InputMaybe<Scalars['Bytes']>;
  verificationHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  verificationHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  verificationHash_contains?: InputMaybe<Scalars['Bytes']>;
  verificationHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<RailgunTransaction_filter>>>;
  or?: InputMaybe<Array<InputMaybe<RailgunTransaction_filter>>>;
};

export type RailgunTransaction_orderBy =
  | 'id'
  | 'blockNumber'
  | 'transactionHash'
  | 'nullifiers'
  | 'commitments'
  | 'boundParamsHash'
  | 'hasUnshield'
  | 'utxoTreeIn'
  | 'utxoTreeOut'
  | 'utxoBatchStartPositionOut'
  | 'unshieldToken'
  | 'unshieldToken__id'
  | 'unshieldToken__tokenType'
  | 'unshieldToken__tokenAddress'
  | 'unshieldToken__tokenSubID'
  | 'unshieldToAddress'
  | 'unshieldValue'
  | 'blockTimestamp'
  | 'verificationHash';

export type ShieldCommitment = Commitment & {
  id: Scalars['Bytes'];
  blockNumber: Scalars['BigInt'];
  blockTimestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  treeNumber: Scalars['Int'];
  commitmentType: CommitmentType;
  hashes: Array<Scalars['Bytes']>;
  from: Scalars['Bytes'];
  treePosition: Scalars['Int'];
  preimage: CommitmentPreimage;
  encryptedBundle: Array<Scalars['Bytes']>;
  shieldKey: Scalars['Bytes'];
  fee: Scalars['BigInt'];
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
  commitmentType?: InputMaybe<CommitmentType>;
  commitmentType_not?: InputMaybe<CommitmentType>;
  commitmentType_in?: InputMaybe<Array<CommitmentType>>;
  commitmentType_not_in?: InputMaybe<Array<CommitmentType>>;
  hashes?: InputMaybe<Array<Scalars['Bytes']>>;
  hashes_not?: InputMaybe<Array<Scalars['Bytes']>>;
  hashes_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  hashes_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  hashes_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  hashes_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  from?: InputMaybe<Scalars['Bytes']>;
  from_not?: InputMaybe<Scalars['Bytes']>;
  from_gt?: InputMaybe<Scalars['Bytes']>;
  from_lt?: InputMaybe<Scalars['Bytes']>;
  from_gte?: InputMaybe<Scalars['Bytes']>;
  from_lte?: InputMaybe<Scalars['Bytes']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']>>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  from_contains?: InputMaybe<Scalars['Bytes']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']>;
  treePosition?: InputMaybe<Scalars['Int']>;
  treePosition_not?: InputMaybe<Scalars['Int']>;
  treePosition_gt?: InputMaybe<Scalars['Int']>;
  treePosition_lt?: InputMaybe<Scalars['Int']>;
  treePosition_gte?: InputMaybe<Scalars['Int']>;
  treePosition_lte?: InputMaybe<Scalars['Int']>;
  treePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  | 'commitmentType'
  | 'hashes'
  | 'from'
  | 'treePosition'
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
  commitmentCiphertext?: Maybe<CommitmentCiphertext>;
  commitmentCiphertexts: Array<CommitmentCiphertext>;
  shieldCommitment?: Maybe<ShieldCommitment>;
  shieldCommitments: Array<ShieldCommitment>;
  transactCommitment?: Maybe<TransactCommitment>;
  transactCommitments: Array<TransactCommitment>;
  unshield?: Maybe<Unshield>;
  unshields: Array<Unshield>;
  nullifier?: Maybe<Nullifier>;
  nullifiers: Array<Nullifier>;
  railgunTransaction?: Maybe<RailgunTransaction>;
  railgunTransactions: Array<RailgunTransaction>;
  verificationHash?: Maybe<VerificationHash>;
  verificationHashes: Array<VerificationHash>;
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

export type SubscriptionrailgunTransactionArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionrailgunTransactionsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RailgunTransaction_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<RailgunTransaction_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionverificationHashArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionverificationHashesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VerificationHash_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VerificationHash_filter>;
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

export type TokenType = 'ERC20' | 'ERC721' | 'ERC1155';

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

export type Token_orderBy = 'id' | 'tokenType' | 'tokenAddress' | 'tokenSubID';

export type TransactCommitment = Commitment & {
  id: Scalars['Bytes'];
  blockNumber: Scalars['BigInt'];
  blockTimestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  treeNumber: Scalars['Int'];
  commitmentType: CommitmentType;
  hashes: Array<Scalars['Bytes']>;
  commitmentCiphertexts: Array<CommitmentCiphertext>;
  batchStartTreePosition: Scalars['Int'];
  transactIndex: Scalars['Int'];
  senderCiphertext: Scalars['Bytes'];
};

export type TransactCommitmentcommitmentCiphertextsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CommitmentCiphertext_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<CommitmentCiphertext_filter>;
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
  commitmentType?: InputMaybe<CommitmentType>;
  commitmentType_not?: InputMaybe<CommitmentType>;
  commitmentType_in?: InputMaybe<Array<CommitmentType>>;
  commitmentType_not_in?: InputMaybe<Array<CommitmentType>>;
  hashes?: InputMaybe<Array<Scalars['Bytes']>>;
  hashes_not?: InputMaybe<Array<Scalars['Bytes']>>;
  hashes_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  hashes_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  hashes_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  hashes_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  commitmentCiphertexts?: InputMaybe<Array<Scalars['String']>>;
  commitmentCiphertexts_not?: InputMaybe<Array<Scalars['String']>>;
  commitmentCiphertexts_contains?: InputMaybe<Array<Scalars['String']>>;
  commitmentCiphertexts_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  commitmentCiphertexts_not_contains?: InputMaybe<Array<Scalars['String']>>;
  commitmentCiphertexts_not_contains_nocase?: InputMaybe<
    Array<Scalars['String']>
  >;
  commitmentCiphertexts_?: InputMaybe<CommitmentCiphertext_filter>;
  batchStartTreePosition?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_not?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transactIndex?: InputMaybe<Scalars['Int']>;
  transactIndex_not?: InputMaybe<Scalars['Int']>;
  transactIndex_gt?: InputMaybe<Scalars['Int']>;
  transactIndex_lt?: InputMaybe<Scalars['Int']>;
  transactIndex_gte?: InputMaybe<Scalars['Int']>;
  transactIndex_lte?: InputMaybe<Scalars['Int']>;
  transactIndex_in?: InputMaybe<Array<Scalars['Int']>>;
  transactIndex_not_in?: InputMaybe<Array<Scalars['Int']>>;
  senderCiphertext?: InputMaybe<Scalars['Bytes']>;
  senderCiphertext_not?: InputMaybe<Scalars['Bytes']>;
  senderCiphertext_gt?: InputMaybe<Scalars['Bytes']>;
  senderCiphertext_lt?: InputMaybe<Scalars['Bytes']>;
  senderCiphertext_gte?: InputMaybe<Scalars['Bytes']>;
  senderCiphertext_lte?: InputMaybe<Scalars['Bytes']>;
  senderCiphertext_in?: InputMaybe<Array<Scalars['Bytes']>>;
  senderCiphertext_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  senderCiphertext_contains?: InputMaybe<Scalars['Bytes']>;
  senderCiphertext_not_contains?: InputMaybe<Scalars['Bytes']>;
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
  | 'commitmentType'
  | 'hashes'
  | 'commitmentCiphertexts'
  | 'batchStartTreePosition'
  | 'transactIndex'
  | 'senderCiphertext';

export type Unshield = {
  id: Scalars['Bytes'];
  blockNumber: Scalars['BigInt'];
  blockTimestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  to: Scalars['Bytes'];
  token: Token;
  value: Scalars['BigInt'];
  fee: Scalars['BigInt'];
  transactIndex: Scalars['BigInt'];
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
  value?: InputMaybe<Scalars['BigInt']>;
  value_not?: InputMaybe<Scalars['BigInt']>;
  value_gt?: InputMaybe<Scalars['BigInt']>;
  value_lt?: InputMaybe<Scalars['BigInt']>;
  value_gte?: InputMaybe<Scalars['BigInt']>;
  value_lte?: InputMaybe<Scalars['BigInt']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  fee?: InputMaybe<Scalars['BigInt']>;
  fee_not?: InputMaybe<Scalars['BigInt']>;
  fee_gt?: InputMaybe<Scalars['BigInt']>;
  fee_lt?: InputMaybe<Scalars['BigInt']>;
  fee_gte?: InputMaybe<Scalars['BigInt']>;
  fee_lte?: InputMaybe<Scalars['BigInt']>;
  fee_in?: InputMaybe<Array<Scalars['BigInt']>>;
  fee_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactIndex?: InputMaybe<Scalars['BigInt']>;
  transactIndex_not?: InputMaybe<Scalars['BigInt']>;
  transactIndex_gt?: InputMaybe<Scalars['BigInt']>;
  transactIndex_lt?: InputMaybe<Scalars['BigInt']>;
  transactIndex_gte?: InputMaybe<Scalars['BigInt']>;
  transactIndex_lte?: InputMaybe<Scalars['BigInt']>;
  transactIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  | 'value'
  | 'fee'
  | 'transactIndex';

export type VerificationHash = {
  id: Scalars['Bytes'];
  verificationHash: Scalars['Bytes'];
};

export type VerificationHash_filter = {
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
  verificationHash?: InputMaybe<Scalars['Bytes']>;
  verificationHash_not?: InputMaybe<Scalars['Bytes']>;
  verificationHash_gt?: InputMaybe<Scalars['Bytes']>;
  verificationHash_lt?: InputMaybe<Scalars['Bytes']>;
  verificationHash_gte?: InputMaybe<Scalars['Bytes']>;
  verificationHash_lte?: InputMaybe<Scalars['Bytes']>;
  verificationHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  verificationHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  verificationHash_contains?: InputMaybe<Scalars['Bytes']>;
  verificationHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VerificationHash_filter>>>;
  or?: InputMaybe<Array<InputMaybe<VerificationHash_filter>>>;
};

export type VerificationHash_orderBy = 'id' | 'verificationHash';

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

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string | ((fieldNode: FieldNode) => SelectionSetNode);
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> =
  | LegacyStitchingResolver<TResult, TParent, TContext, TArgs>
  | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {},
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo,
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo,
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {},
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  BigDecimal: ResolverTypeWrapper<Scalars['BigDecimal']>;
  BigInt: ResolverTypeWrapper<Scalars['BigInt']>;
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_height;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Bytes: ResolverTypeWrapper<Scalars['Bytes']>;
  Commitment:
    | ResolversTypes['ShieldCommitment']
    | ResolversTypes['TransactCommitment'];
  CommitmentCiphertext: ResolverTypeWrapper<CommitmentCiphertext>;
  CommitmentCiphertext_filter: CommitmentCiphertext_filter;
  CommitmentCiphertext_orderBy: CommitmentCiphertext_orderBy;
  CommitmentPreimage: ResolverTypeWrapper<CommitmentPreimage>;
  CommitmentPreimage_filter: CommitmentPreimage_filter;
  CommitmentPreimage_orderBy: CommitmentPreimage_orderBy;
  CommitmentType: CommitmentType;
  Commitment_filter: Commitment_filter;
  Commitment_orderBy: Commitment_orderBy;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Int8: ResolverTypeWrapper<Scalars['Int8']>;
  Nullifier: ResolverTypeWrapper<Nullifier>;
  Nullifier_filter: Nullifier_filter;
  Nullifier_orderBy: Nullifier_orderBy;
  OrderDirection: OrderDirection;
  Query: ResolverTypeWrapper<{}>;
  RailgunTransaction: ResolverTypeWrapper<RailgunTransaction>;
  RailgunTransaction_filter: RailgunTransaction_filter;
  RailgunTransaction_orderBy: RailgunTransaction_orderBy;
  ShieldCommitment: ResolverTypeWrapper<ShieldCommitment>;
  ShieldCommitment_filter: ShieldCommitment_filter;
  ShieldCommitment_orderBy: ShieldCommitment_orderBy;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  Token: ResolverTypeWrapper<Token>;
  TokenType: TokenType;
  Token_filter: Token_filter;
  Token_orderBy: Token_orderBy;
  TransactCommitment: ResolverTypeWrapper<TransactCommitment>;
  TransactCommitment_filter: TransactCommitment_filter;
  TransactCommitment_orderBy: TransactCommitment_orderBy;
  Unshield: ResolverTypeWrapper<Unshield>;
  Unshield_filter: Unshield_filter;
  Unshield_orderBy: Unshield_orderBy;
  VerificationHash: ResolverTypeWrapper<VerificationHash>;
  VerificationHash_filter: VerificationHash_filter;
  VerificationHash_orderBy: VerificationHash_orderBy;
  _Block_: ResolverTypeWrapper<_Block_>;
  _Meta_: ResolverTypeWrapper<_Meta_>;
  _SubgraphErrorPolicy_: _SubgraphErrorPolicy_;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  BigDecimal: Scalars['BigDecimal'];
  BigInt: Scalars['BigInt'];
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_height;
  Boolean: Scalars['Boolean'];
  Bytes: Scalars['Bytes'];
  Commitment:
    | ResolversParentTypes['ShieldCommitment']
    | ResolversParentTypes['TransactCommitment'];
  CommitmentCiphertext: CommitmentCiphertext;
  CommitmentCiphertext_filter: CommitmentCiphertext_filter;
  CommitmentPreimage: CommitmentPreimage;
  CommitmentPreimage_filter: CommitmentPreimage_filter;
  Commitment_filter: Commitment_filter;
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Int8: Scalars['Int8'];
  Nullifier: Nullifier;
  Nullifier_filter: Nullifier_filter;
  Query: {};
  RailgunTransaction: RailgunTransaction;
  RailgunTransaction_filter: RailgunTransaction_filter;
  ShieldCommitment: ShieldCommitment;
  ShieldCommitment_filter: ShieldCommitment_filter;
  String: Scalars['String'];
  Subscription: {};
  Token: Token;
  Token_filter: Token_filter;
  TransactCommitment: TransactCommitment;
  TransactCommitment_filter: TransactCommitment_filter;
  Unshield: Unshield;
  Unshield_filter: Unshield_filter;
  VerificationHash: VerificationHash;
  VerificationHash_filter: VerificationHash_filter;
  _Block_: _Block_;
  _Meta_: _Meta_;
}>;

export type entityDirectiveArgs = {};

export type entityDirectiveResolver<
  Result,
  Parent,
  ContextType = MeshContext,
  Args = entityDirectiveArgs,
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type subgraphIdDirectiveArgs = {
  id: Scalars['String'];
};

export type subgraphIdDirectiveResolver<
  Result,
  Parent,
  ContextType = MeshContext,
  Args = subgraphIdDirectiveArgs,
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type derivedFromDirectiveArgs = {
  field: Scalars['String'];
};

export type derivedFromDirectiveResolver<
  Result,
  Parent,
  ContextType = MeshContext,
  Args = derivedFromDirectiveArgs,
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export interface BigDecimalScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['BigDecimal'], any> {
  name: 'BigDecimal';
}

export interface BigIntScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['BigInt'], any> {
  name: 'BigInt';
}

export interface BytesScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Bytes'], any> {
  name: 'Bytes';
}

export type CommitmentResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['Commitment'] = ResolversParentTypes['Commitment'],
> = ResolversObject<{
  __resolveType: TypeResolveFn<
    'ShieldCommitment' | 'TransactCommitment',
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  treeNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  commitmentType?: Resolver<
    ResolversTypes['CommitmentType'],
    ParentType,
    ContextType
  >;
  hashes?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
}>;

export type CommitmentCiphertextResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['CommitmentCiphertext'] = ResolversParentTypes['CommitmentCiphertext'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  ciphertext?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  blindedSenderViewingKey?: Resolver<
    ResolversTypes['Bytes'],
    ParentType,
    ContextType
  >;
  blindedReceiverViewingKey?: Resolver<
    ResolversTypes['Bytes'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommitmentPreimageResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['CommitmentPreimage'] = ResolversParentTypes['CommitmentPreimage'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  npk?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface Int8ScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Int8'], any> {
  name: 'Int8';
}

export type NullifierResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['Nullifier'] = ResolversParentTypes['Nullifier'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  treeNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nullifier?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query'],
> = ResolversObject<{
  token?: Resolver<
    Maybe<ResolversTypes['Token']>,
    ParentType,
    ContextType,
    RequireFields<QuerytokenArgs, 'id' | 'subgraphError'>
  >;
  tokens?: Resolver<
    Array<ResolversTypes['Token']>,
    ParentType,
    ContextType,
    RequireFields<QuerytokensArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  commitmentPreimage?: Resolver<
    Maybe<ResolversTypes['CommitmentPreimage']>,
    ParentType,
    ContextType,
    RequireFields<QuerycommitmentPreimageArgs, 'id' | 'subgraphError'>
  >;
  commitmentPreimages?: Resolver<
    Array<ResolversTypes['CommitmentPreimage']>,
    ParentType,
    ContextType,
    RequireFields<
      QuerycommitmentPreimagesArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  commitmentCiphertext?: Resolver<
    Maybe<ResolversTypes['CommitmentCiphertext']>,
    ParentType,
    ContextType,
    RequireFields<QuerycommitmentCiphertextArgs, 'id' | 'subgraphError'>
  >;
  commitmentCiphertexts?: Resolver<
    Array<ResolversTypes['CommitmentCiphertext']>,
    ParentType,
    ContextType,
    RequireFields<
      QuerycommitmentCiphertextsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  shieldCommitment?: Resolver<
    Maybe<ResolversTypes['ShieldCommitment']>,
    ParentType,
    ContextType,
    RequireFields<QueryshieldCommitmentArgs, 'id' | 'subgraphError'>
  >;
  shieldCommitments?: Resolver<
    Array<ResolversTypes['ShieldCommitment']>,
    ParentType,
    ContextType,
    RequireFields<
      QueryshieldCommitmentsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  transactCommitment?: Resolver<
    Maybe<ResolversTypes['TransactCommitment']>,
    ParentType,
    ContextType,
    RequireFields<QuerytransactCommitmentArgs, 'id' | 'subgraphError'>
  >;
  transactCommitments?: Resolver<
    Array<ResolversTypes['TransactCommitment']>,
    ParentType,
    ContextType,
    RequireFields<
      QuerytransactCommitmentsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  unshield?: Resolver<
    Maybe<ResolversTypes['Unshield']>,
    ParentType,
    ContextType,
    RequireFields<QueryunshieldArgs, 'id' | 'subgraphError'>
  >;
  unshields?: Resolver<
    Array<ResolversTypes['Unshield']>,
    ParentType,
    ContextType,
    RequireFields<QueryunshieldsArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  nullifier?: Resolver<
    Maybe<ResolversTypes['Nullifier']>,
    ParentType,
    ContextType,
    RequireFields<QuerynullifierArgs, 'id' | 'subgraphError'>
  >;
  nullifiers?: Resolver<
    Array<ResolversTypes['Nullifier']>,
    ParentType,
    ContextType,
    RequireFields<QuerynullifiersArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  railgunTransaction?: Resolver<
    Maybe<ResolversTypes['RailgunTransaction']>,
    ParentType,
    ContextType,
    RequireFields<QueryrailgunTransactionArgs, 'id' | 'subgraphError'>
  >;
  railgunTransactions?: Resolver<
    Array<ResolversTypes['RailgunTransaction']>,
    ParentType,
    ContextType,
    RequireFields<
      QueryrailgunTransactionsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  verificationHash?: Resolver<
    Maybe<ResolversTypes['VerificationHash']>,
    ParentType,
    ContextType,
    RequireFields<QueryverificationHashArgs, 'id' | 'subgraphError'>
  >;
  verificationHashes?: Resolver<
    Array<ResolversTypes['VerificationHash']>,
    ParentType,
    ContextType,
    RequireFields<
      QueryverificationHashesArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  commitment?: Resolver<
    Maybe<ResolversTypes['Commitment']>,
    ParentType,
    ContextType,
    RequireFields<QuerycommitmentArgs, 'id' | 'subgraphError'>
  >;
  commitments?: Resolver<
    Array<ResolversTypes['Commitment']>,
    ParentType,
    ContextType,
    RequireFields<QuerycommitmentsArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  _meta?: Resolver<
    Maybe<ResolversTypes['_Meta_']>,
    ParentType,
    ContextType,
    Partial<Query_metaArgs>
  >;
}>;

export type RailgunTransactionResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['RailgunTransaction'] = ResolversParentTypes['RailgunTransaction'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  nullifiers?: Resolver<
    Array<ResolversTypes['Bytes']>,
    ParentType,
    ContextType
  >;
  commitments?: Resolver<
    Array<ResolversTypes['Bytes']>,
    ParentType,
    ContextType
  >;
  boundParamsHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  hasUnshield?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  utxoTreeIn?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  utxoTreeOut?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  utxoBatchStartPositionOut?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  unshieldToken?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  unshieldToAddress?: Resolver<
    ResolversTypes['Bytes'],
    ParentType,
    ContextType
  >;
  unshieldValue?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  verificationHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ShieldCommitmentResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['ShieldCommitment'] = ResolversParentTypes['ShieldCommitment'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  treeNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  commitmentType?: Resolver<
    ResolversTypes['CommitmentType'],
    ParentType,
    ContextType
  >;
  hashes?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  from?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  treePosition?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  preimage?: Resolver<
    ResolversTypes['CommitmentPreimage'],
    ParentType,
    ContextType
  >;
  encryptedBundle?: Resolver<
    Array<ResolversTypes['Bytes']>,
    ParentType,
    ContextType
  >;
  shieldKey?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  fee?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription'],
> = ResolversObject<{
  token?: SubscriptionResolver<
    Maybe<ResolversTypes['Token']>,
    'token',
    ParentType,
    ContextType,
    RequireFields<SubscriptiontokenArgs, 'id' | 'subgraphError'>
  >;
  tokens?: SubscriptionResolver<
    Array<ResolversTypes['Token']>,
    'tokens',
    ParentType,
    ContextType,
    RequireFields<SubscriptiontokensArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  commitmentPreimage?: SubscriptionResolver<
    Maybe<ResolversTypes['CommitmentPreimage']>,
    'commitmentPreimage',
    ParentType,
    ContextType,
    RequireFields<SubscriptioncommitmentPreimageArgs, 'id' | 'subgraphError'>
  >;
  commitmentPreimages?: SubscriptionResolver<
    Array<ResolversTypes['CommitmentPreimage']>,
    'commitmentPreimages',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptioncommitmentPreimagesArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  commitmentCiphertext?: SubscriptionResolver<
    Maybe<ResolversTypes['CommitmentCiphertext']>,
    'commitmentCiphertext',
    ParentType,
    ContextType,
    RequireFields<SubscriptioncommitmentCiphertextArgs, 'id' | 'subgraphError'>
  >;
  commitmentCiphertexts?: SubscriptionResolver<
    Array<ResolversTypes['CommitmentCiphertext']>,
    'commitmentCiphertexts',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptioncommitmentCiphertextsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  shieldCommitment?: SubscriptionResolver<
    Maybe<ResolversTypes['ShieldCommitment']>,
    'shieldCommitment',
    ParentType,
    ContextType,
    RequireFields<SubscriptionshieldCommitmentArgs, 'id' | 'subgraphError'>
  >;
  shieldCommitments?: SubscriptionResolver<
    Array<ResolversTypes['ShieldCommitment']>,
    'shieldCommitments',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionshieldCommitmentsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  transactCommitment?: SubscriptionResolver<
    Maybe<ResolversTypes['TransactCommitment']>,
    'transactCommitment',
    ParentType,
    ContextType,
    RequireFields<SubscriptiontransactCommitmentArgs, 'id' | 'subgraphError'>
  >;
  transactCommitments?: SubscriptionResolver<
    Array<ResolversTypes['TransactCommitment']>,
    'transactCommitments',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptiontransactCommitmentsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  unshield?: SubscriptionResolver<
    Maybe<ResolversTypes['Unshield']>,
    'unshield',
    ParentType,
    ContextType,
    RequireFields<SubscriptionunshieldArgs, 'id' | 'subgraphError'>
  >;
  unshields?: SubscriptionResolver<
    Array<ResolversTypes['Unshield']>,
    'unshields',
    ParentType,
    ContextType,
    RequireFields<SubscriptionunshieldsArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  nullifier?: SubscriptionResolver<
    Maybe<ResolversTypes['Nullifier']>,
    'nullifier',
    ParentType,
    ContextType,
    RequireFields<SubscriptionnullifierArgs, 'id' | 'subgraphError'>
  >;
  nullifiers?: SubscriptionResolver<
    Array<ResolversTypes['Nullifier']>,
    'nullifiers',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionnullifiersArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  railgunTransaction?: SubscriptionResolver<
    Maybe<ResolversTypes['RailgunTransaction']>,
    'railgunTransaction',
    ParentType,
    ContextType,
    RequireFields<SubscriptionrailgunTransactionArgs, 'id' | 'subgraphError'>
  >;
  railgunTransactions?: SubscriptionResolver<
    Array<ResolversTypes['RailgunTransaction']>,
    'railgunTransactions',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionrailgunTransactionsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  verificationHash?: SubscriptionResolver<
    Maybe<ResolversTypes['VerificationHash']>,
    'verificationHash',
    ParentType,
    ContextType,
    RequireFields<SubscriptionverificationHashArgs, 'id' | 'subgraphError'>
  >;
  verificationHashes?: SubscriptionResolver<
    Array<ResolversTypes['VerificationHash']>,
    'verificationHashes',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionverificationHashesArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  commitment?: SubscriptionResolver<
    Maybe<ResolversTypes['Commitment']>,
    'commitment',
    ParentType,
    ContextType,
    RequireFields<SubscriptioncommitmentArgs, 'id' | 'subgraphError'>
  >;
  commitments?: SubscriptionResolver<
    Array<ResolversTypes['Commitment']>,
    'commitments',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptioncommitmentsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  _meta?: SubscriptionResolver<
    Maybe<ResolversTypes['_Meta_']>,
    '_meta',
    ParentType,
    ContextType,
    Partial<Subscription_metaArgs>
  >;
}>;

export type TokenResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['Token'] = ResolversParentTypes['Token'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  tokenType?: Resolver<ResolversTypes['TokenType'], ParentType, ContextType>;
  tokenAddress?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  tokenSubID?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransactCommitmentResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['TransactCommitment'] = ResolversParentTypes['TransactCommitment'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  treeNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  commitmentType?: Resolver<
    ResolversTypes['CommitmentType'],
    ParentType,
    ContextType
  >;
  hashes?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  commitmentCiphertexts?: Resolver<
    Array<ResolversTypes['CommitmentCiphertext']>,
    ParentType,
    ContextType,
    RequireFields<TransactCommitmentcommitmentCiphertextsArgs, 'skip' | 'first'>
  >;
  batchStartTreePosition?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  transactIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  senderCiphertext?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UnshieldResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['Unshield'] = ResolversParentTypes['Unshield'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  to?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  fee?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactIndex?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VerificationHashResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['VerificationHash'] = ResolversParentTypes['VerificationHash'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  verificationHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type _Block_Resolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['_Block_'] = ResolversParentTypes['_Block_'],
> = ResolversObject<{
  hash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type _Meta_Resolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['_Meta_'] = ResolversParentTypes['_Meta_'],
> = ResolversObject<{
  block?: Resolver<ResolversTypes['_Block_'], ParentType, ContextType>;
  deployment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasIndexingErrors?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = MeshContext> = ResolversObject<{
  BigDecimal?: GraphQLScalarType;
  BigInt?: GraphQLScalarType;
  Bytes?: GraphQLScalarType;
  Commitment?: CommitmentResolvers<ContextType>;
  CommitmentCiphertext?: CommitmentCiphertextResolvers<ContextType>;
  CommitmentPreimage?: CommitmentPreimageResolvers<ContextType>;
  Int8?: GraphQLScalarType;
  Nullifier?: NullifierResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RailgunTransaction?: RailgunTransactionResolvers<ContextType>;
  ShieldCommitment?: ShieldCommitmentResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  Token?: TokenResolvers<ContextType>;
  TransactCommitment?: TransactCommitmentResolvers<ContextType>;
  Unshield?: UnshieldResolvers<ContextType>;
  VerificationHash?: VerificationHashResolvers<ContextType>;
  _Block_?: _Block_Resolvers<ContextType>;
  _Meta_?: _Meta_Resolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = MeshContext> = ResolversObject<{
  entity?: entityDirectiveResolver<any, any, ContextType>;
  subgraphId?: subgraphIdDirectiveResolver<any, any, ContextType>;
  derivedFrom?: derivedFromDirectiveResolver<any, any, ContextType>;
}>;

export type MeshContext = MumbaiTypes.Context & BaseMeshContext;

const baseDir = pathModule.join(
  typeof __dirname === 'string' ? __dirname : '/',
  '..',
);

const importFn: ImportFn = <T>(moduleId: string) => {
  const relativeModuleId = (
    pathModule.isAbsolute(moduleId)
      ? pathModule.relative(baseDir, moduleId)
      : moduleId
  )
    .split('\\')
    .join('/')
    .replace(baseDir + '/', '');
  switch (relativeModuleId) {
    case '.graphclient/sources/mumbai/introspectionSchema':
      return import('./.graphclient/sources/mumbai/introspectionSchema') as T;

    default:
      return Promise.reject(
        new Error(`Cannot find module '${relativeModuleId}'.`),
      );
  }
};

const rootStore = new MeshStore(
  '.graphclient',
  new FsStoreStorageAdapter({
    cwd: baseDir,
    importFn,
    fileType: 'ts',
  }),
  {
    readonly: true,
    validate: false,
  },
);

export const rawServeConfig: YamlConfig.Config['serve'] = undefined as any;
export async function getMeshOptions(): Promise<GetMeshOptions> {
  const pubsub = new PubSub();
  const sourcesStore = rootStore.child('sources');
  const logger = new DefaultLogger('GraphClient');
  const cache = new (MeshCache as any)({
    ...({} as any),
    importFn,
    store: rootStore.child('cache'),
    pubsub,
    logger,
  } as any);

  const sources: MeshResolvedSource[] = [];
  const transforms: MeshTransform[] = [];
  const additionalEnvelopPlugins: MeshPlugin<any>[] = [];
  const mumbaiTransforms = [];
  const additionalTypeDefs = [] as any[];
  const mumbaiHandler = new GraphqlHandler({
    name: 'mumbai',
    config: {
      endpoint:
        'https://api.thegraph.com/subgraphs/name/railgun-community/railgun-v3-mumbai',
    },
    baseDir,
    cache,
    pubsub,
    store: sourcesStore.child('mumbai'),
    logger: logger.child('mumbai'),
    importFn,
  });
  sources[0] = {
    name: 'mumbai',
    handler: mumbaiHandler,
    transforms: mumbaiTransforms,
  };
  const additionalResolvers = [] as any[];
  const merger = new (BareMerger as any)({
    cache,
    pubsub,
    logger: logger.child('bareMerger'),
    store: rootStore.child('bareMerger'),
  });

  return {
    sources,
    transforms,
    additionalTypeDefs,
    additionalResolvers,
    cache,
    pubsub,
    merger,
    logger,
    additionalEnvelopPlugins,
    get documents() {
      return [
        {
          document: NullifiersDocument,
          get rawSDL() {
            return printWithCache(NullifiersDocument);
          },
          location: 'NullifiersDocument.graphql',
        },
        {
          document: UnshieldsDocument,
          get rawSDL() {
            return printWithCache(UnshieldsDocument);
          },
          location: 'UnshieldsDocument.graphql',
        },
        {
          document: CommitmentsDocument,
          get rawSDL() {
            return printWithCache(CommitmentsDocument);
          },
          location: 'CommitmentsDocument.graphql',
        },
        {
          document: RailgunTransactionsDocument,
          get rawSDL() {
            return printWithCache(RailgunTransactionsDocument);
          },
          location: 'RailgunTransactionsDocument.graphql',
        },
      ];
    },
    fetchFn,
  };
}

export function createBuiltMeshHTTPHandler<
  TServerContext = {},
>(): MeshHTTPHandler<TServerContext> {
  return createMeshHTTPHandler<TServerContext>({
    baseDir,
    getBuiltMesh: getBuiltGraphClient,
    rawServeConfig: undefined,
  });
}

let meshInstance$: Promise<MeshInstance> | undefined;

export function getBuiltGraphClient(): Promise<MeshInstance> {
  if (meshInstance$ == null) {
    meshInstance$ = getMeshOptions()
      .then(meshOptions => getMesh(meshOptions))
      .then(mesh => {
        const id = mesh.pubsub.subscribe('destroy', () => {
          meshInstance$ = undefined;
          mesh.pubsub.unsubscribe(id);
        });
        return mesh;
      });
  }
  return meshInstance$;
}

export const execute: ExecuteMeshFn = (...args) =>
  getBuiltGraphClient().then(({ execute }) => execute(...args));

export const subscribe: SubscribeMeshFn = (...args) =>
  getBuiltGraphClient().then(({ subscribe }) => subscribe(...args));
export function getBuiltGraphSDK<TGlobalContext = any, TOperationContext = any>(
  globalContext?: TGlobalContext,
) {
  const sdkRequester$ = getBuiltGraphClient().then(({ sdkRequesterFactory }) =>
    sdkRequesterFactory(globalContext),
  );
  return getSdk<TOperationContext, TGlobalContext>((...args) =>
    sdkRequester$.then(sdkRequester => sdkRequester(...args)),
  );
}
export type NullifiersQueryVariables = Exact<{
  blockNumber?: InputMaybe<Scalars['BigInt']>;
}>;

export type NullifiersQuery = {
  nullifiers: Array<
    Pick<
      Nullifier,
      | 'id'
      | 'blockNumber'
      | 'blockTimestamp'
      | 'transactionHash'
      | 'treeNumber'
      | 'nullifier'
    >
  >;
};

export type UnshieldsQueryVariables = Exact<{
  blockNumber?: InputMaybe<Scalars['BigInt']>;
}>;

export type UnshieldsQuery = {
  unshields: Array<
    Pick<
      Unshield,
      | 'id'
      | 'blockNumber'
      | 'blockTimestamp'
      | 'to'
      | 'transactionHash'
      | 'fee'
      | 'value'
      | 'transactIndex'
    > & {
      token: Pick<Token, 'id' | 'tokenType' | 'tokenSubID' | 'tokenAddress'>;
    }
  >;
};

export type CommitmentsQueryVariables = Exact<{
  blockNumber?: InputMaybe<Scalars['BigInt']>;
}>;

export type CommitmentsQuery = {
  commitments: Array<
    | (Pick<
        ShieldCommitment,
        | 'id'
        | 'blockNumber'
        | 'blockTimestamp'
        | 'transactionHash'
        | 'treeNumber'
        | 'treePosition'
        | 'commitmentType'
        | 'hashes'
        | 'shieldKey'
        | 'fee'
        | 'encryptedBundle'
        | 'from'
      > & {
        preimage: Pick<CommitmentPreimage, 'id' | 'npk' | 'value'> & {
          token: Pick<
            Token,
            'id' | 'tokenType' | 'tokenSubID' | 'tokenAddress'
          >;
        };
      })
    | (Pick<
        TransactCommitment,
        | 'id'
        | 'blockNumber'
        | 'blockTimestamp'
        | 'transactionHash'
        | 'treeNumber'
        | 'batchStartTreePosition'
        | 'transactIndex'
        | 'commitmentType'
        | 'senderCiphertext'
        | 'hashes'
      > & {
        commitmentCiphertexts: Array<
          Pick<
            CommitmentCiphertext,
            | 'id'
            | 'ciphertext'
            | 'blindedSenderViewingKey'
            | 'blindedReceiverViewingKey'
          >
        >;
      })
  >;
};

export type RailgunTransactionsQueryVariables = Exact<{
  blockNumber?: InputMaybe<Scalars['BigInt']>;
}>;

export type RailgunTransactionsQuery = {
  railgunTransactions: Array<
    Pick<
      RailgunTransaction,
      | 'id'
      | 'blockNumber'
      | 'blockTimestamp'
      | 'transactionHash'
      | 'nullifiers'
      | 'commitments'
      | 'boundParamsHash'
      | 'hasUnshield'
      | 'utxoTreeIn'
      | 'utxoTreeOut'
      | 'utxoBatchStartPositionOut'
      | 'unshieldToAddress'
      | 'unshieldValue'
      | 'verificationHash'
    > & {
      unshieldToken: Pick<
        Token,
        'id' | 'tokenType' | 'tokenAddress' | 'tokenSubID'
      >;
    }
  >;
};

export const NullifiersDocument = gql`
  query Nullifiers($blockNumber: BigInt = 0) {
    nullifiers(
      orderBy: blockNumber
      where: { blockNumber_gte: $blockNumber }
      first: 1000
    ) {
      id
      blockNumber
      blockTimestamp
      transactionHash
      treeNumber
      nullifier
    }
  }
` as unknown as DocumentNode<NullifiersQuery, NullifiersQueryVariables>;
export const UnshieldsDocument = gql`
  query Unshields($blockNumber: BigInt = 0) {
    unshields(
      orderBy: blockNumber
      where: { blockNumber_gte: $blockNumber }
      first: 1000
    ) {
      id
      blockNumber
      blockTimestamp
      to
      transactionHash
      fee
      value
      transactIndex
      token {
        id
        tokenType
        tokenSubID
        tokenAddress
      }
    }
  }
` as unknown as DocumentNode<UnshieldsQuery, UnshieldsQueryVariables>;
export const CommitmentsDocument = gql`
  query Commitments($blockNumber: BigInt = 0) {
    commitments(
      orderBy: blockNumber
      where: { blockNumber_gte: $blockNumber }
      first: 1000
    ) {
      id
      treeNumber
      blockNumber
      transactionHash
      blockTimestamp
      ... on ShieldCommitment {
        id
        blockNumber
        blockTimestamp
        transactionHash
        treeNumber
        treePosition
        commitmentType
        hashes
        shieldKey
        fee
        encryptedBundle
        from
        preimage {
          id
          npk
          value
          token {
            id
            tokenType
            tokenSubID
            tokenAddress
          }
        }
      }
      ... on TransactCommitment {
        id
        blockNumber
        blockTimestamp
        transactionHash
        treeNumber
        batchStartTreePosition
        transactIndex
        commitmentType
        senderCiphertext
        hashes
        commitmentCiphertexts {
          id
          ciphertext
          blindedSenderViewingKey
          blindedReceiverViewingKey
        }
      }
    }
  }
` as unknown as DocumentNode<CommitmentsQuery, CommitmentsQueryVariables>;
export const RailgunTransactionsDocument = gql`
  query RailgunTransactions($blockNumber: BigInt = 0) {
    railgunTransactions(
      orderBy: blockNumber
      where: { blockNumber_gte: $blockNumber }
      first: 1000
    ) {
      id
      blockNumber
      blockTimestamp
      transactionHash
      blockNumber
      blockTimestamp
      nullifiers
      commitments
      boundParamsHash
      hasUnshield
      utxoTreeIn
      utxoTreeOut
      utxoBatchStartPositionOut
      unshieldToken {
        id
        tokenType
        tokenAddress
        tokenSubID
      }
      unshieldToAddress
      unshieldValue
      verificationHash
    }
  }
` as unknown as DocumentNode<
  RailgunTransactionsQuery,
  RailgunTransactionsQueryVariables
>;

export type Requester<C = {}, E = unknown> = <R, V>(
  doc: DocumentNode,
  vars?: V,
  options?: C,
) => Promise<R> | AsyncIterable<R>;
export function getSdk<C, E>(requester: Requester<C, E>) {
  return {
    Nullifiers(
      variables?: NullifiersQueryVariables,
      options?: C,
    ): Promise<NullifiersQuery> {
      return requester<NullifiersQuery, NullifiersQueryVariables>(
        NullifiersDocument,
        variables,
        options,
      ) as Promise<NullifiersQuery>;
    },
    Unshields(
      variables?: UnshieldsQueryVariables,
      options?: C,
    ): Promise<UnshieldsQuery> {
      return requester<UnshieldsQuery, UnshieldsQueryVariables>(
        UnshieldsDocument,
        variables,
        options,
      ) as Promise<UnshieldsQuery>;
    },
    Commitments(
      variables?: CommitmentsQueryVariables,
      options?: C,
    ): Promise<CommitmentsQuery> {
      return requester<CommitmentsQuery, CommitmentsQueryVariables>(
        CommitmentsDocument,
        variables,
        options,
      ) as Promise<CommitmentsQuery>;
    },
    RailgunTransactions(
      variables?: RailgunTransactionsQueryVariables,
      options?: C,
    ): Promise<RailgunTransactionsQuery> {
      return requester<
        RailgunTransactionsQuery,
        RailgunTransactionsQueryVariables
      >(
        RailgunTransactionsDocument,
        variables,
        options,
      ) as Promise<RailgunTransactionsQuery>;
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
