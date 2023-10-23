/**
 * TO UPDATE:
 * 1. Find all places that are "MODIFIED", move them into the new built index.ts (in .graphclient)
 * 2. add these comments (including eslint disables)
 * 3. move the modified index file to quick-sync/graphql/ (NOTE: MAKE SURE TO DRAG AND DROP IN VSCODE SO THE SOURCE LOCATIONS CHANGE!)
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
import StitchingMerger from '@graphql-mesh/merger-stitching';
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
import type { TxsGoerliTypes } from './.graphclient/sources/txs-goerli/types';
import type { TxsEthereumTypes } from './.graphclient/sources/txs-ethereum/types';
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
  commitmentBatchEventNew?: Maybe<CommitmentBatchEventNew>;
  commitmentBatchEventNews: Array<CommitmentBatchEventNew>;
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
  transaction?: Maybe<Transaction>;
  transactions: Array<Transaction>;
  verificationHash?: Maybe<VerificationHash>;
  verificationHashes: Array<VerificationHash>;
  commitment?: Maybe<Commitment>;
  commitments: Array<Commitment>;
  transactionInterface?: Maybe<TransactionInterface>;
  transactionInterfaces: Array<TransactionInterface>;
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

export type QuerycommitmentBatchEventNewArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerycommitmentBatchEventNewsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CommitmentBatchEventNew_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<CommitmentBatchEventNew_filter>;
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

export type QuerytransactionArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerytransactionsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transaction_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Transaction_filter>;
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

export type QuerytransactionInterfaceArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerytransactionInterfacesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TransactionInterface_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TransactionInterface_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type Query_metaArgs = {
  block?: InputMaybe<Block_height>;
};

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
  commitmentBatchEventNew?: Maybe<CommitmentBatchEventNew>;
  commitmentBatchEventNews: Array<CommitmentBatchEventNew>;
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
  transaction?: Maybe<Transaction>;
  transactions: Array<Transaction>;
  verificationHash?: Maybe<VerificationHash>;
  verificationHashes: Array<VerificationHash>;
  commitment?: Maybe<Commitment>;
  commitments: Array<Commitment>;
  transactionInterface?: Maybe<TransactionInterface>;
  transactionInterfaces: Array<TransactionInterface>;
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

export type SubscriptioncommitmentBatchEventNewArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptioncommitmentBatchEventNewsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CommitmentBatchEventNew_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<CommitmentBatchEventNew_filter>;
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

export type SubscriptiontransactionArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptiontransactionsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transaction_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Transaction_filter>;
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

export type SubscriptiontransactionInterfaceArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptiontransactionInterfacesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TransactionInterface_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TransactionInterface_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type Subscription_metaArgs = {
  block?: InputMaybe<Block_height>;
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

export type Ciphertext_orderBy = 'id' | 'iv' | 'tag' | 'data';

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

export type CommitmentBatchEventNew = {
  id: Scalars['Bytes'];
  treeNumber: Scalars['BigInt'];
  batchStartTreePosition: Scalars['BigInt'];
};

export type CommitmentBatchEventNew_filter = {
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
  treeNumber?: InputMaybe<Scalars['BigInt']>;
  treeNumber_not?: InputMaybe<Scalars['BigInt']>;
  treeNumber_gt?: InputMaybe<Scalars['BigInt']>;
  treeNumber_lt?: InputMaybe<Scalars['BigInt']>;
  treeNumber_gte?: InputMaybe<Scalars['BigInt']>;
  treeNumber_lte?: InputMaybe<Scalars['BigInt']>;
  treeNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  treeNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  batchStartTreePosition?: InputMaybe<Scalars['BigInt']>;
  batchStartTreePosition_not?: InputMaybe<Scalars['BigInt']>;
  batchStartTreePosition_gt?: InputMaybe<Scalars['BigInt']>;
  batchStartTreePosition_lt?: InputMaybe<Scalars['BigInt']>;
  batchStartTreePosition_gte?: InputMaybe<Scalars['BigInt']>;
  batchStartTreePosition_lte?: InputMaybe<Scalars['BigInt']>;
  batchStartTreePosition_in?: InputMaybe<Array<Scalars['BigInt']>>;
  batchStartTreePosition_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<CommitmentBatchEventNew_filter>>>;
  or?: InputMaybe<Array<InputMaybe<CommitmentBatchEventNew_filter>>>;
};

export type CommitmentBatchEventNew_orderBy =
  | 'id'
  | 'treeNumber'
  | 'batchStartTreePosition';

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
export type OrderDirection = 'asc' | 'desc';

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

export type Transaction = TransactionInterface & {
  id: Scalars['Bytes'];
  blockNumber: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  merkleRoot: Scalars['Bytes'];
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

export type TransactionInterface = {
  id: Scalars['Bytes'];
  blockNumber: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  merkleRoot: Scalars['Bytes'];
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

export type TransactionInterface_filter = {
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
  merkleRoot?: InputMaybe<Scalars['Bytes']>;
  merkleRoot_not?: InputMaybe<Scalars['Bytes']>;
  merkleRoot_gt?: InputMaybe<Scalars['Bytes']>;
  merkleRoot_lt?: InputMaybe<Scalars['Bytes']>;
  merkleRoot_gte?: InputMaybe<Scalars['Bytes']>;
  merkleRoot_lte?: InputMaybe<Scalars['Bytes']>;
  merkleRoot_in?: InputMaybe<Array<Scalars['Bytes']>>;
  merkleRoot_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  merkleRoot_contains?: InputMaybe<Scalars['Bytes']>;
  merkleRoot_not_contains?: InputMaybe<Scalars['Bytes']>;
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
  and?: InputMaybe<Array<InputMaybe<TransactionInterface_filter>>>;
  or?: InputMaybe<Array<InputMaybe<TransactionInterface_filter>>>;
};

export type TransactionInterface_orderBy =
  | 'id'
  | 'blockNumber'
  | 'transactionHash'
  | 'merkleRoot'
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

export type Transaction_filter = {
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
  merkleRoot?: InputMaybe<Scalars['Bytes']>;
  merkleRoot_not?: InputMaybe<Scalars['Bytes']>;
  merkleRoot_gt?: InputMaybe<Scalars['Bytes']>;
  merkleRoot_lt?: InputMaybe<Scalars['Bytes']>;
  merkleRoot_gte?: InputMaybe<Scalars['Bytes']>;
  merkleRoot_lte?: InputMaybe<Scalars['Bytes']>;
  merkleRoot_in?: InputMaybe<Array<Scalars['Bytes']>>;
  merkleRoot_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  merkleRoot_contains?: InputMaybe<Scalars['Bytes']>;
  merkleRoot_not_contains?: InputMaybe<Scalars['Bytes']>;
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
  and?: InputMaybe<Array<InputMaybe<Transaction_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Transaction_filter>>>;
};

export type Transaction_orderBy =
  | 'id'
  | 'blockNumber'
  | 'transactionHash'
  | 'merkleRoot'
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
  Query: ResolverTypeWrapper<{}>;
  Subscription: ResolverTypeWrapper<{}>;
  BigDecimal: ResolverTypeWrapper<Scalars['BigDecimal']>;
  BigInt: ResolverTypeWrapper<Scalars['BigInt']>;
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_height;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Bytes: ResolverTypeWrapper<Scalars['Bytes']>;
  Ciphertext: ResolverTypeWrapper<Ciphertext>;
  Ciphertext_filter: Ciphertext_filter;
  Ciphertext_orderBy: Ciphertext_orderBy;
  Commitment:
    | ResolversTypes['LegacyEncryptedCommitment']
    | ResolversTypes['LegacyGeneratedCommitment']
    | ResolversTypes['ShieldCommitment']
    | ResolversTypes['TransactCommitment'];
  CommitmentBatchEventNew: ResolverTypeWrapper<CommitmentBatchEventNew>;
  CommitmentBatchEventNew_filter: CommitmentBatchEventNew_filter;
  CommitmentBatchEventNew_orderBy: CommitmentBatchEventNew_orderBy;
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
  LegacyCommitmentCiphertext: ResolverTypeWrapper<LegacyCommitmentCiphertext>;
  LegacyCommitmentCiphertext_filter: LegacyCommitmentCiphertext_filter;
  LegacyCommitmentCiphertext_orderBy: LegacyCommitmentCiphertext_orderBy;
  LegacyEncryptedCommitment: ResolverTypeWrapper<LegacyEncryptedCommitment>;
  LegacyEncryptedCommitment_filter: LegacyEncryptedCommitment_filter;
  LegacyEncryptedCommitment_orderBy: LegacyEncryptedCommitment_orderBy;
  LegacyGeneratedCommitment: ResolverTypeWrapper<LegacyGeneratedCommitment>;
  LegacyGeneratedCommitment_filter: LegacyGeneratedCommitment_filter;
  LegacyGeneratedCommitment_orderBy: LegacyGeneratedCommitment_orderBy;
  Nullifier: ResolverTypeWrapper<Nullifier>;
  Nullifier_filter: Nullifier_filter;
  Nullifier_orderBy: Nullifier_orderBy;
  OrderDirection: OrderDirection;
  ShieldCommitment: ResolverTypeWrapper<ShieldCommitment>;
  ShieldCommitment_filter: ShieldCommitment_filter;
  ShieldCommitment_orderBy: ShieldCommitment_orderBy;
  String: ResolverTypeWrapper<Scalars['String']>;
  Token: ResolverTypeWrapper<Token>;
  TokenType: TokenType;
  Token_filter: Token_filter;
  Token_orderBy: Token_orderBy;
  TransactCommitment: ResolverTypeWrapper<TransactCommitment>;
  TransactCommitment_filter: TransactCommitment_filter;
  TransactCommitment_orderBy: TransactCommitment_orderBy;
  Transaction: ResolverTypeWrapper<Transaction>;
  TransactionInterface: ResolversTypes['Transaction'];
  TransactionInterface_filter: TransactionInterface_filter;
  TransactionInterface_orderBy: TransactionInterface_orderBy;
  Transaction_filter: Transaction_filter;
  Transaction_orderBy: Transaction_orderBy;
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
  Query: {};
  Subscription: {};
  BigDecimal: Scalars['BigDecimal'];
  BigInt: Scalars['BigInt'];
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_height;
  Boolean: Scalars['Boolean'];
  Bytes: Scalars['Bytes'];
  Ciphertext: Ciphertext;
  Ciphertext_filter: Ciphertext_filter;
  Commitment:
    | ResolversParentTypes['LegacyEncryptedCommitment']
    | ResolversParentTypes['LegacyGeneratedCommitment']
    | ResolversParentTypes['ShieldCommitment']
    | ResolversParentTypes['TransactCommitment'];
  CommitmentBatchEventNew: CommitmentBatchEventNew;
  CommitmentBatchEventNew_filter: CommitmentBatchEventNew_filter;
  CommitmentCiphertext: CommitmentCiphertext;
  CommitmentCiphertext_filter: CommitmentCiphertext_filter;
  CommitmentPreimage: CommitmentPreimage;
  CommitmentPreimage_filter: CommitmentPreimage_filter;
  Commitment_filter: Commitment_filter;
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Int8: Scalars['Int8'];
  LegacyCommitmentCiphertext: LegacyCommitmentCiphertext;
  LegacyCommitmentCiphertext_filter: LegacyCommitmentCiphertext_filter;
  LegacyEncryptedCommitment: LegacyEncryptedCommitment;
  LegacyEncryptedCommitment_filter: LegacyEncryptedCommitment_filter;
  LegacyGeneratedCommitment: LegacyGeneratedCommitment;
  LegacyGeneratedCommitment_filter: LegacyGeneratedCommitment_filter;
  Nullifier: Nullifier;
  Nullifier_filter: Nullifier_filter;
  ShieldCommitment: ShieldCommitment;
  ShieldCommitment_filter: ShieldCommitment_filter;
  String: Scalars['String'];
  Token: Token;
  Token_filter: Token_filter;
  TransactCommitment: TransactCommitment;
  TransactCommitment_filter: TransactCommitment_filter;
  Transaction: Transaction;
  TransactionInterface: ResolversParentTypes['Transaction'];
  TransactionInterface_filter: TransactionInterface_filter;
  Transaction_filter: Transaction_filter;
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
  ciphertext?: Resolver<
    Maybe<ResolversTypes['Ciphertext']>,
    ParentType,
    ContextType,
    RequireFields<QueryciphertextArgs, 'id' | 'subgraphError'>
  >;
  ciphertexts?: Resolver<
    Array<ResolversTypes['Ciphertext']>,
    ParentType,
    ContextType,
    RequireFields<QueryciphertextsArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  legacyCommitmentCiphertext?: Resolver<
    Maybe<ResolversTypes['LegacyCommitmentCiphertext']>,
    ParentType,
    ContextType,
    RequireFields<QuerylegacyCommitmentCiphertextArgs, 'id' | 'subgraphError'>
  >;
  legacyCommitmentCiphertexts?: Resolver<
    Array<ResolversTypes['LegacyCommitmentCiphertext']>,
    ParentType,
    ContextType,
    RequireFields<
      QuerylegacyCommitmentCiphertextsArgs,
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
  commitmentBatchEventNew?: Resolver<
    Maybe<ResolversTypes['CommitmentBatchEventNew']>,
    ParentType,
    ContextType,
    RequireFields<QuerycommitmentBatchEventNewArgs, 'id' | 'subgraphError'>
  >;
  commitmentBatchEventNews?: Resolver<
    Array<ResolversTypes['CommitmentBatchEventNew']>,
    ParentType,
    ContextType,
    RequireFields<
      QuerycommitmentBatchEventNewsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  legacyGeneratedCommitment?: Resolver<
    Maybe<ResolversTypes['LegacyGeneratedCommitment']>,
    ParentType,
    ContextType,
    RequireFields<QuerylegacyGeneratedCommitmentArgs, 'id' | 'subgraphError'>
  >;
  legacyGeneratedCommitments?: Resolver<
    Array<ResolversTypes['LegacyGeneratedCommitment']>,
    ParentType,
    ContextType,
    RequireFields<
      QuerylegacyGeneratedCommitmentsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  legacyEncryptedCommitment?: Resolver<
    Maybe<ResolversTypes['LegacyEncryptedCommitment']>,
    ParentType,
    ContextType,
    RequireFields<QuerylegacyEncryptedCommitmentArgs, 'id' | 'subgraphError'>
  >;
  legacyEncryptedCommitments?: Resolver<
    Array<ResolversTypes['LegacyEncryptedCommitment']>,
    ParentType,
    ContextType,
    RequireFields<
      QuerylegacyEncryptedCommitmentsArgs,
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
  transaction?: Resolver<
    Maybe<ResolversTypes['Transaction']>,
    ParentType,
    ContextType,
    RequireFields<QuerytransactionArgs, 'id' | 'subgraphError'>
  >;
  transactions?: Resolver<
    Array<ResolversTypes['Transaction']>,
    ParentType,
    ContextType,
    RequireFields<QuerytransactionsArgs, 'skip' | 'first' | 'subgraphError'>
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
  transactionInterface?: Resolver<
    Maybe<ResolversTypes['TransactionInterface']>,
    ParentType,
    ContextType,
    RequireFields<QuerytransactionInterfaceArgs, 'id' | 'subgraphError'>
  >;
  transactionInterfaces?: Resolver<
    Array<ResolversTypes['TransactionInterface']>,
    ParentType,
    ContextType,
    RequireFields<
      QuerytransactionInterfacesArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  _meta?: Resolver<
    Maybe<ResolversTypes['_Meta_']>,
    ParentType,
    ContextType,
    Partial<Query_metaArgs>
  >;
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
  ciphertext?: SubscriptionResolver<
    Maybe<ResolversTypes['Ciphertext']>,
    'ciphertext',
    ParentType,
    ContextType,
    RequireFields<SubscriptionciphertextArgs, 'id' | 'subgraphError'>
  >;
  ciphertexts?: SubscriptionResolver<
    Array<ResolversTypes['Ciphertext']>,
    'ciphertexts',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionciphertextsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  legacyCommitmentCiphertext?: SubscriptionResolver<
    Maybe<ResolversTypes['LegacyCommitmentCiphertext']>,
    'legacyCommitmentCiphertext',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionlegacyCommitmentCiphertextArgs,
      'id' | 'subgraphError'
    >
  >;
  legacyCommitmentCiphertexts?: SubscriptionResolver<
    Array<ResolversTypes['LegacyCommitmentCiphertext']>,
    'legacyCommitmentCiphertexts',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionlegacyCommitmentCiphertextsArgs,
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
  commitmentBatchEventNew?: SubscriptionResolver<
    Maybe<ResolversTypes['CommitmentBatchEventNew']>,
    'commitmentBatchEventNew',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptioncommitmentBatchEventNewArgs,
      'id' | 'subgraphError'
    >
  >;
  commitmentBatchEventNews?: SubscriptionResolver<
    Array<ResolversTypes['CommitmentBatchEventNew']>,
    'commitmentBatchEventNews',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptioncommitmentBatchEventNewsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  legacyGeneratedCommitment?: SubscriptionResolver<
    Maybe<ResolversTypes['LegacyGeneratedCommitment']>,
    'legacyGeneratedCommitment',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionlegacyGeneratedCommitmentArgs,
      'id' | 'subgraphError'
    >
  >;
  legacyGeneratedCommitments?: SubscriptionResolver<
    Array<ResolversTypes['LegacyGeneratedCommitment']>,
    'legacyGeneratedCommitments',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionlegacyGeneratedCommitmentsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  legacyEncryptedCommitment?: SubscriptionResolver<
    Maybe<ResolversTypes['LegacyEncryptedCommitment']>,
    'legacyEncryptedCommitment',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionlegacyEncryptedCommitmentArgs,
      'id' | 'subgraphError'
    >
  >;
  legacyEncryptedCommitments?: SubscriptionResolver<
    Array<ResolversTypes['LegacyEncryptedCommitment']>,
    'legacyEncryptedCommitments',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionlegacyEncryptedCommitmentsArgs,
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
  transaction?: SubscriptionResolver<
    Maybe<ResolversTypes['Transaction']>,
    'transaction',
    ParentType,
    ContextType,
    RequireFields<SubscriptiontransactionArgs, 'id' | 'subgraphError'>
  >;
  transactions?: SubscriptionResolver<
    Array<ResolversTypes['Transaction']>,
    'transactions',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptiontransactionsArgs,
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
  transactionInterface?: SubscriptionResolver<
    Maybe<ResolversTypes['TransactionInterface']>,
    'transactionInterface',
    ParentType,
    ContextType,
    RequireFields<SubscriptiontransactionInterfaceArgs, 'id' | 'subgraphError'>
  >;
  transactionInterfaces?: SubscriptionResolver<
    Array<ResolversTypes['TransactionInterface']>,
    'transactionInterfaces',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptiontransactionInterfacesArgs,
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

export type CiphertextResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['Ciphertext'] = ResolversParentTypes['Ciphertext'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  iv?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  tag?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  data?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommitmentResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['Commitment'] = ResolversParentTypes['Commitment'],
> = ResolversObject<{
  __resolveType: TypeResolveFn<
    | 'LegacyEncryptedCommitment'
    | 'LegacyGeneratedCommitment'
    | 'ShieldCommitment'
    | 'TransactCommitment',
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  treeNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  batchStartTreePosition?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  treePosition?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  commitmentType?: Resolver<
    ResolversTypes['CommitmentType'],
    ParentType,
    ContextType
  >;
  hash?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
}>;

export type CommitmentBatchEventNewResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['CommitmentBatchEventNew'] = ResolversParentTypes['CommitmentBatchEventNew'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  treeNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  batchStartTreePosition?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommitmentCiphertextResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['CommitmentCiphertext'] = ResolversParentTypes['CommitmentCiphertext'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  ciphertext?: Resolver<ResolversTypes['Ciphertext'], ParentType, ContextType>;
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
  annotationData?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  memo?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
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

export type LegacyCommitmentCiphertextResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['LegacyCommitmentCiphertext'] = ResolversParentTypes['LegacyCommitmentCiphertext'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  ciphertext?: Resolver<ResolversTypes['Ciphertext'], ParentType, ContextType>;
  ephemeralKeys?: Resolver<
    Array<ResolversTypes['Bytes']>,
    ParentType,
    ContextType
  >;
  memo?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LegacyEncryptedCommitmentResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['LegacyEncryptedCommitment'] = ResolversParentTypes['LegacyEncryptedCommitment'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  treeNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  batchStartTreePosition?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  treePosition?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  commitmentType?: Resolver<
    ResolversTypes['CommitmentType'],
    ParentType,
    ContextType
  >;
  hash?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  ciphertext?: Resolver<
    ResolversTypes['LegacyCommitmentCiphertext'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LegacyGeneratedCommitmentResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['LegacyGeneratedCommitment'] = ResolversParentTypes['LegacyGeneratedCommitment'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  treeNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  batchStartTreePosition?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  treePosition?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  commitmentType?: Resolver<
    ResolversTypes['CommitmentType'],
    ParentType,
    ContextType
  >;
  hash?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  preimage?: Resolver<
    ResolversTypes['CommitmentPreimage'],
    ParentType,
    ContextType
  >;
  encryptedRandom?: Resolver<
    Array<ResolversTypes['Bytes']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

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

export type ShieldCommitmentResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['ShieldCommitment'] = ResolversParentTypes['ShieldCommitment'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  treeNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  batchStartTreePosition?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  treePosition?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  commitmentType?: Resolver<
    ResolversTypes['CommitmentType'],
    ParentType,
    ContextType
  >;
  hash?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
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
  fee?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
  batchStartTreePosition?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  treePosition?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  commitmentType?: Resolver<
    ResolversTypes['CommitmentType'],
    ParentType,
    ContextType
  >;
  hash?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  ciphertext?: Resolver<
    ResolversTypes['CommitmentCiphertext'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransactionResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['Transaction'] = ResolversParentTypes['Transaction'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  merkleRoot?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
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

export type TransactionInterfaceResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['TransactionInterface'] = ResolversParentTypes['TransactionInterface'],
> = ResolversObject<{
  __resolveType: TypeResolveFn<'Transaction', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  merkleRoot?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
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
  amount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  fee?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  eventLogIndex?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
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
  Query?: QueryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  BigDecimal?: GraphQLScalarType;
  BigInt?: GraphQLScalarType;
  Bytes?: GraphQLScalarType;
  Ciphertext?: CiphertextResolvers<ContextType>;
  Commitment?: CommitmentResolvers<ContextType>;
  CommitmentBatchEventNew?: CommitmentBatchEventNewResolvers<ContextType>;
  CommitmentCiphertext?: CommitmentCiphertextResolvers<ContextType>;
  CommitmentPreimage?: CommitmentPreimageResolvers<ContextType>;
  Int8?: GraphQLScalarType;
  LegacyCommitmentCiphertext?: LegacyCommitmentCiphertextResolvers<ContextType>;
  LegacyEncryptedCommitment?: LegacyEncryptedCommitmentResolvers<ContextType>;
  LegacyGeneratedCommitment?: LegacyGeneratedCommitmentResolvers<ContextType>;
  Nullifier?: NullifierResolvers<ContextType>;
  ShieldCommitment?: ShieldCommitmentResolvers<ContextType>;
  Token?: TokenResolvers<ContextType>;
  TransactCommitment?: TransactCommitmentResolvers<ContextType>;
  Transaction?: TransactionResolvers<ContextType>;
  TransactionInterface?: TransactionInterfaceResolvers<ContextType>;
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

export type MeshContext = TxsEthereumTypes.Context &
  TxsGoerliTypes.Context &
  BaseMeshContext;

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
    case '.graphclient/sources/txs-ethereum/introspectionSchema':
      return import(
        './.graphclient/sources/txs-ethereum/introspectionSchema'
      ) as T;

    case '.graphclient/sources/txs-goerli/introspectionSchema':
      return import(
        './.graphclient/sources/txs-goerli/introspectionSchema'
      ) as T;

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
  const txsEthereumTransforms = [];
  const txsGoerliTransforms = [];
  const additionalTypeDefs = [] as any[];
  const txsEthereumHandler = new GraphqlHandler({
    name: 'txs-ethereum',
    config: {
      endpoint:
        'https://api.thegraph.com/subgraphs/name/ekrembal/railgun-ethereum-v2-txids',
    },
    baseDir,
    cache,
    pubsub,
    store: sourcesStore.child('txs-ethereum'),
    logger: logger.child('txs-ethereum'),
    importFn,
  });
  const txsGoerliHandler = new GraphqlHandler({
    name: 'txs-goerli',
    config: {
      endpoint:
        'https://api.thegraph.com/subgraphs/name/ekrembal/railgun-goerli-v2-txids',
    },
    baseDir,
    cache,
    pubsub,
    store: sourcesStore.child('txs-goerli'),
    logger: logger.child('txs-goerli'),
    importFn,
  });
  sources[0] = {
    name: 'txs-ethereum',
    handler: txsEthereumHandler,
    transforms: txsEthereumTransforms,
  };
  sources[1] = {
    name: 'txs-goerli',
    handler: txsGoerliHandler,
    transforms: txsGoerliTransforms,
  };
  const additionalResolvers = [] as any[];
  const merger = new (StitchingMerger as any)({
    cache,
    pubsub,
    logger: logger.child('stitchingMerger'),
    store: rootStore.child('stitchingMerger'),
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
          document: GetRailgunTransactionsAfterGraphIdDocument,
          get rawSDL() {
            return printWithCache(GetRailgunTransactionsAfterGraphIdDocument);
          },
          location: 'GetRailgunTransactionsAfterGraphIdDocument.graphql',
        },
        {
          document: GetRailgunTransactionsByTxidDocument,
          get rawSDL() {
            return printWithCache(GetRailgunTransactionsByTxidDocument);
          },
          location: 'GetRailgunTransactionsByTxidDocument.graphql',
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
export type GetRailgunTransactionsAfterGraphIDQueryVariables = Exact<{
  idLow?: InputMaybe<Scalars['Bytes']>;
}>;

export type GetRailgunTransactionsAfterGraphIDQuery = {
  transactions: Array<
    Pick<
      Transaction,
      | 'id'
      | 'nullifiers'
      | 'commitments'
      | 'transactionHash'
      | 'boundParamsHash'
      | 'blockNumber'
      | 'utxoTreeIn'
      | 'utxoTreeOut'
      | 'utxoBatchStartPositionOut'
      | 'hasUnshield'
      | 'unshieldToAddress'
      | 'unshieldValue'
      | 'blockTimestamp'
      | 'verificationHash'
    > & {
      unshieldToken: Pick<Token, 'tokenType' | 'tokenSubID' | 'tokenAddress'>;
    }
  >;
};

export type GetRailgunTransactionsByTxidQueryVariables = Exact<{
  txid?: InputMaybe<Scalars['Bytes']>;
}>;

export type GetRailgunTransactionsByTxidQuery = {
  transactions: Array<
    Pick<
      Transaction,
      | 'id'
      | 'nullifiers'
      | 'commitments'
      | 'transactionHash'
      | 'boundParamsHash'
      | 'blockNumber'
      | 'utxoTreeIn'
      | 'utxoTreeOut'
      | 'utxoBatchStartPositionOut'
      | 'hasUnshield'
      | 'unshieldToAddress'
      | 'unshieldValue'
      | 'blockTimestamp'
      | 'verificationHash'
    > & {
      unshieldToken: Pick<Token, 'tokenType' | 'tokenSubID' | 'tokenAddress'>;
    }
  >;
};

export const GetRailgunTransactionsAfterGraphIDDocument = gql`
  query GetRailgunTransactionsAfterGraphID($idLow: Bytes = "0x00") {
    transactions(orderBy: id, first: 1000, where: { id_gt: $idLow }) {
      id
      nullifiers
      commitments
      transactionHash
      boundParamsHash
      blockNumber
      utxoTreeIn
      utxoTreeOut
      utxoBatchStartPositionOut
      hasUnshield
      unshieldToken {
        tokenType
        tokenSubID
        tokenAddress
      }
      unshieldToAddress
      unshieldValue
      blockTimestamp
      verificationHash
    }
  }
` as unknown as DocumentNode<
  GetRailgunTransactionsAfterGraphIDQuery,
  GetRailgunTransactionsAfterGraphIDQueryVariables
>;
export const GetRailgunTransactionsByTxidDocument = gql`
  query GetRailgunTransactionsByTxid($txid: Bytes) {
    transactions(where: { transactionHash: $txid }) {
      id
      nullifiers
      commitments
      transactionHash
      boundParamsHash
      blockNumber
      utxoTreeIn
      utxoTreeOut
      utxoBatchStartPositionOut
      hasUnshield
      unshieldToken {
        tokenType
        tokenSubID
        tokenAddress
      }
      unshieldToAddress
      unshieldValue
      blockTimestamp
      verificationHash
    }
  }
` as unknown as DocumentNode<
  GetRailgunTransactionsByTxidQuery,
  GetRailgunTransactionsByTxidQueryVariables
>;

export type Requester<C = {}, E = unknown> = <R, V>(
  doc: DocumentNode,
  vars?: V,
  options?: C,
) => Promise<R> | AsyncIterable<R>;
export function getSdk<C, E>(requester: Requester<C, E>) {
  return {
    GetRailgunTransactionsAfterGraphID(
      variables?: GetRailgunTransactionsAfterGraphIDQueryVariables,
      options?: C,
    ): Promise<GetRailgunTransactionsAfterGraphIDQuery> {
      return requester<
        GetRailgunTransactionsAfterGraphIDQuery,
        GetRailgunTransactionsAfterGraphIDQueryVariables
      >(
        GetRailgunTransactionsAfterGraphIDDocument,
        variables,
        options,
      ) as Promise<GetRailgunTransactionsAfterGraphIDQuery>;
    },
    GetRailgunTransactionsByTxid(
      variables?: GetRailgunTransactionsByTxidQueryVariables,
      options?: C,
    ): Promise<GetRailgunTransactionsByTxidQuery> {
      return requester<
        GetRailgunTransactionsByTxidQuery,
        GetRailgunTransactionsByTxidQueryVariables
      >(
        GetRailgunTransactionsByTxidDocument,
        variables,
        options,
      ) as Promise<GetRailgunTransactionsByTxidQuery>;
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
