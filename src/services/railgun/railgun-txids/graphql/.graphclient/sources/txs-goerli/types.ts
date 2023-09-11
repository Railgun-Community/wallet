// @ts-nocheck

import { InContextSdkMethod } from '@graphql-mesh/types';
import { MeshContext } from '@graphql-mesh/runtime';

export namespace TxsGoerliTypes {
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

/** Defines the order direction, either ascending or descending */
export type OrderDirection =
  | 'asc'
  | 'desc';

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

  export type QuerySdk = {
      /** null **/
  transactCall: InContextSdkMethod<Query['transactCall'], QuerytransactCallArgs, MeshContext>,
  /** null **/
  transactCalls: InContextSdkMethod<Query['transactCalls'], QuerytransactCallsArgs, MeshContext>,
  /** null **/
  transaction: InContextSdkMethod<Query['transaction'], QuerytransactionArgs, MeshContext>,
  /** null **/
  transactions: InContextSdkMethod<Query['transactions'], QuerytransactionsArgs, MeshContext>,
  /** null **/
  transactionInterface: InContextSdkMethod<Query['transactionInterface'], QuerytransactionInterfaceArgs, MeshContext>,
  /** null **/
  transactionInterfaces: InContextSdkMethod<Query['transactionInterfaces'], QuerytransactionInterfacesArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Query['_meta'], Query_metaArgs, MeshContext>
  };

  export type MutationSdk = {
    
  };

  export type SubscriptionSdk = {
      /** null **/
  transactCall: InContextSdkMethod<Subscription['transactCall'], SubscriptiontransactCallArgs, MeshContext>,
  /** null **/
  transactCalls: InContextSdkMethod<Subscription['transactCalls'], SubscriptiontransactCallsArgs, MeshContext>,
  /** null **/
  transaction: InContextSdkMethod<Subscription['transaction'], SubscriptiontransactionArgs, MeshContext>,
  /** null **/
  transactions: InContextSdkMethod<Subscription['transactions'], SubscriptiontransactionsArgs, MeshContext>,
  /** null **/
  transactionInterface: InContextSdkMethod<Subscription['transactionInterface'], SubscriptiontransactionInterfaceArgs, MeshContext>,
  /** null **/
  transactionInterfaces: InContextSdkMethod<Subscription['transactionInterfaces'], SubscriptiontransactionInterfacesArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Subscription['_meta'], Subscription_metaArgs, MeshContext>
  };

  export type Context = {
      ["txs-goerli"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      
    };
}
