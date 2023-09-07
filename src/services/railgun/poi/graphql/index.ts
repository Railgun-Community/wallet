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
  Int8: number; // MODIFIED
};

export type Query = {
  transactCall?: Maybe<TransactCall>;
  transactCalls: Array<TransactCall>;
  transaction?: Maybe<Transaction>;
  transactions: Array<Transaction>;
  transactionInterface?: Maybe<TransactionInterface>;
  transactionInterfaces: Array<TransactionInterface>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};

export type QuerytransactCallArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerytransactCallsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TransactCall_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TransactCall_filter>;
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
  transactCall?: Maybe<TransactCall>;
  transactCalls: Array<TransactCall>;
  transaction?: Maybe<Transaction>;
  transactions: Array<Transaction>;
  transactionInterface?: Maybe<TransactionInterface>;
  transactionInterfaces: Array<TransactionInterface>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};

export type SubscriptiontransactCallArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptiontransactCallsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TransactCall_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TransactCall_filter>;
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

/** Defines the order direction, either ascending or descending */
export type OrderDirection = 'asc' | 'desc';

export type TransactCall = {
  id: Scalars['Bytes'];
  blockNumber: Scalars['BigInt'];
  blockTimestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
};

export type TransactCall_filter = {
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
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TransactCall_filter>>>;
  or?: InputMaybe<Array<InputMaybe<TransactCall_filter>>>;
};

export type TransactCall_orderBy =
  | 'id'
  | 'blockNumber'
  | 'blockTimestamp'
  | 'transactionHash';

export type Transaction = TransactionInterface & {
  id: Scalars['Bytes'];
  transactionHash: Scalars['Bytes'];
  merkleRoot: Scalars['Bytes'];
  nullifiers: Array<Scalars['Bytes']>;
  commitments: Array<Scalars['Bytes']>;
  boundParamsHash: Scalars['Bytes'];
};

export type TransactionInterface = {
  id: Scalars['Bytes'];
  transactionHash: Scalars['Bytes'];
  merkleRoot: Scalars['Bytes'];
  nullifiers: Array<Scalars['Bytes']>;
  commitments: Array<Scalars['Bytes']>;
  boundParamsHash: Scalars['Bytes'];
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
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TransactionInterface_filter>>>;
  or?: InputMaybe<Array<InputMaybe<TransactionInterface_filter>>>;
};

export type TransactionInterface_orderBy =
  | 'id'
  | 'transactionHash'
  | 'merkleRoot'
  | 'nullifiers'
  | 'commitments'
  | 'boundParamsHash';

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
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Transaction_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Transaction_filter>>>;
};

export type Transaction_orderBy =
  | 'id'
  | 'transactionHash'
  | 'merkleRoot'
  | 'nullifiers'
  | 'commitments'
  | 'boundParamsHash';

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
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Int8: ResolverTypeWrapper<Scalars['Int8']>;
  OrderDirection: OrderDirection;
  String: ResolverTypeWrapper<Scalars['String']>;
  TransactCall: ResolverTypeWrapper<TransactCall>;
  TransactCall_filter: TransactCall_filter;
  TransactCall_orderBy: TransactCall_orderBy;
  Transaction: ResolverTypeWrapper<Transaction>;
  TransactionInterface: ResolversTypes['Transaction'];
  TransactionInterface_filter: TransactionInterface_filter;
  TransactionInterface_orderBy: TransactionInterface_orderBy;
  Transaction_filter: Transaction_filter;
  Transaction_orderBy: Transaction_orderBy;
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
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Int8: Scalars['Int8'];
  String: Scalars['String'];
  TransactCall: TransactCall;
  TransactCall_filter: TransactCall_filter;
  Transaction: Transaction;
  TransactionInterface: ResolversParentTypes['Transaction'];
  TransactionInterface_filter: TransactionInterface_filter;
  Transaction_filter: Transaction_filter;
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
  transactCall?: Resolver<
    Maybe<ResolversTypes['TransactCall']>,
    ParentType,
    ContextType,
    RequireFields<QuerytransactCallArgs, 'id' | 'subgraphError'>
  >;
  transactCalls?: Resolver<
    Array<ResolversTypes['TransactCall']>,
    ParentType,
    ContextType,
    RequireFields<QuerytransactCallsArgs, 'skip' | 'first' | 'subgraphError'>
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
  transactCall?: SubscriptionResolver<
    Maybe<ResolversTypes['TransactCall']>,
    'transactCall',
    ParentType,
    ContextType,
    RequireFields<SubscriptiontransactCallArgs, 'id' | 'subgraphError'>
  >;
  transactCalls?: SubscriptionResolver<
    Array<ResolversTypes['TransactCall']>,
    'transactCalls',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptiontransactCallsArgs,
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

export interface Int8ScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Int8'], any> {
  name: 'Int8';
}

export type TransactCallResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['TransactCall'] = ResolversParentTypes['TransactCall'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransactionResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['Transaction'] = ResolversParentTypes['Transaction'],
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
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
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransactionInterfaceResolvers<
  ContextType = MeshContext,
  ParentType extends ResolversParentTypes['TransactionInterface'] = ResolversParentTypes['TransactionInterface'],
> = ResolversObject<{
  __resolveType: TypeResolveFn<'Transaction', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
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
  Int8?: GraphQLScalarType;
  TransactCall?: TransactCallResolvers<ContextType>;
  Transaction?: TransactionResolvers<ContextType>;
  TransactionInterface?: TransactionInterfaceResolvers<ContextType>;
  _Block_?: _Block_Resolvers<ContextType>;
  _Meta_?: _Meta_Resolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = MeshContext> = ResolversObject<{
  entity?: entityDirectiveResolver<any, any, ContextType>;
  subgraphId?: subgraphIdDirectiveResolver<any, any, ContextType>;
  derivedFrom?: derivedFromDirectiveResolver<any, any, ContextType>;
}>;

export type MeshContext = TxsGoerliTypes.Context &
  TxsEthereumTypes.Context &
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
    case '.graphclient/sources/txs-goerli/introspectionSchema':
      return import(
        './.graphclient/sources/txs-goerli/introspectionSchema'
      ) as T;

    case '.graphclient/sources/txs-ethereum/introspectionSchema':
      return import(
        './.graphclient/sources/txs-ethereum/introspectionSchema'
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
        'https://api.thegraph.com/subgraphs/name/ekrembal/railgun-transactions-ethereum',
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
        'https://api.thegraph.com/subgraphs/name/ekrembal/railgun-transactions-goerli',
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
          document: PoiMessageHashesDocument,
          get rawSDL() {
            return printWithCache(PoiMessageHashesDocument);
          },
          location: 'PoiMessageHashesDocument.graphql',
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
export type PoiMessageHashesQueryVariables = Exact<{
  idLow?: InputMaybe<Scalars['Bytes']>;
}>;

export type PoiMessageHashesQuery = {
  transactionInterfaces: Array<
    Pick<
      Transaction,
      | 'id'
      | 'nullifiers'
      | 'commitments'
      | 'transactionHash'
      | 'boundParamsHash'
    >
  >;
};

export const PoiMessageHashesDocument = gql`
  query PoiMessageHashes($idLow: Bytes = "0x00") {
    transactionInterfaces(orderBy: id, first: 1000, where: { id_gt: $idLow }) {
      id
      nullifiers
      commitments
      transactionHash
      boundParamsHash
    }
  }
` as unknown as DocumentNode<
  PoiMessageHashesQuery,
  PoiMessageHashesQueryVariables
>;

export type Requester<C = {}, E = unknown> = <R, V>(
  doc: DocumentNode,
  vars?: V,
  options?: C,
) => Promise<R> | AsyncIterable<R>;
export function getSdk<C, E>(requester: Requester<C, E>) {
  return {
    PoiMessageHashes(
      variables?: PoiMessageHashesQueryVariables,
      options?: C,
    ): Promise<PoiMessageHashesQuery> {
      return requester<PoiMessageHashesQuery, PoiMessageHashesQueryVariables>(
        PoiMessageHashesDocument,
        variables,
        options,
      ) as Promise<PoiMessageHashesQuery>;
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
