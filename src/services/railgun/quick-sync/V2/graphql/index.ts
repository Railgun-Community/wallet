/**
 * TO UPDATE:
 * 1. Find all places that are "MODIFIED", move them into the new built index.ts (in .graphclient)
 * 2. add these comments (including eslint disables)
 * 3. move the modified index file to quick-sync/graphql/
 */
// @ts-nocheck
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

import { GraphQLResolveInfo, SelectionSetNode, FieldNode, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { gql } from '@graphql-mesh/utils';

import type { GetMeshOptions } from '@graphql-mesh/runtime';
import type { YamlConfig } from '@graphql-mesh/types';
import { PubSub } from '@graphql-mesh/utils';
import { DefaultLogger } from '@graphql-mesh/utils';
import MeshCache from "@graphql-mesh/cache-localforage";
import { fetch as fetchFn } from '@whatwg-node/fetch';

import { MeshResolvedSource } from '@graphql-mesh/runtime';
import { MeshTransform, MeshPlugin } from '@graphql-mesh/types';
import GraphqlHandler from "@graphql-mesh/graphql"
import StitchingMerger from "@graphql-mesh/merger-stitching";
import { printWithCache } from '@graphql-mesh/utils';
import { createMeshHTTPHandler, MeshHTTPHandler } from '@graphql-mesh/http';
import { getMesh, ExecuteMeshFn, SubscribeMeshFn, MeshContext as BaseMeshContext, MeshInstance } from '@graphql-mesh/runtime';
import { MeshStore, FsStoreStorageAdapter } from '@graphql-mesh/store';
import { path as pathModule } from '@graphql-mesh/cross-helpers';
import { ImportFn } from '@graphql-mesh/types';
import type { ArbitrumOneTypes } from './.graphclient/sources/arbitrum-one/types';
import type { SepoliaTypes } from './.graphclient/sources/sepolia/types';
import type { BscTypes } from './.graphclient/sources/bsc/types';
import type { EthereumTypes } from './.graphclient/sources/ethereum/types';
import type { MaticTypes } from './.graphclient/sources/matic/types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };



/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Bytes: string; // MODIFIED
  BigInt: string; // MODIFIED
};

export type Query = {
  tokens: Array<Token>;
  tokenById?: Maybe<Token>;
  /** @deprecated Use tokenById */
  tokenByUniqueInput?: Maybe<Token>;
  tokensConnection: TokensConnection;
  commitmentPreimages: Array<CommitmentPreimage>;
  commitmentPreimageById?: Maybe<CommitmentPreimage>;
  /** @deprecated Use commitmentPreimageById */
  commitmentPreimageByUniqueInput?: Maybe<CommitmentPreimage>;
  commitmentPreimagesConnection: CommitmentPreimagesConnection;
  ciphertexts: Array<Ciphertext>;
  ciphertextById?: Maybe<Ciphertext>;
  /** @deprecated Use ciphertextById */
  ciphertextByUniqueInput?: Maybe<Ciphertext>;
  ciphertextsConnection: CiphertextsConnection;
  legacyCommitmentCiphertexts: Array<LegacyCommitmentCiphertext>;
  legacyCommitmentCiphertextById?: Maybe<LegacyCommitmentCiphertext>;
  /** @deprecated Use legacyCommitmentCiphertextById */
  legacyCommitmentCiphertextByUniqueInput?: Maybe<LegacyCommitmentCiphertext>;
  legacyCommitmentCiphertextsConnection: LegacyCommitmentCiphertextsConnection;
  commitmentCiphertexts: Array<CommitmentCiphertext>;
  commitmentCiphertextById?: Maybe<CommitmentCiphertext>;
  /** @deprecated Use commitmentCiphertextById */
  commitmentCiphertextByUniqueInput?: Maybe<CommitmentCiphertext>;
  commitmentCiphertextsConnection: CommitmentCiphertextsConnection;
  legacyGeneratedCommitments: Array<LegacyGeneratedCommitment>;
  legacyGeneratedCommitmentById?: Maybe<LegacyGeneratedCommitment>;
  /** @deprecated Use legacyGeneratedCommitmentById */
  legacyGeneratedCommitmentByUniqueInput?: Maybe<LegacyGeneratedCommitment>;
  legacyGeneratedCommitmentsConnection: LegacyGeneratedCommitmentsConnection;
  commitments: Array<Commitment>;
  commitmentsConnection: CommitmentsConnection;
  legacyEncryptedCommitments: Array<LegacyEncryptedCommitment>;
  legacyEncryptedCommitmentById?: Maybe<LegacyEncryptedCommitment>;
  /** @deprecated Use legacyEncryptedCommitmentById */
  legacyEncryptedCommitmentByUniqueInput?: Maybe<LegacyEncryptedCommitment>;
  legacyEncryptedCommitmentsConnection: LegacyEncryptedCommitmentsConnection;
  shieldCommitments: Array<ShieldCommitment>;
  shieldCommitmentById?: Maybe<ShieldCommitment>;
  /** @deprecated Use shieldCommitmentById */
  shieldCommitmentByUniqueInput?: Maybe<ShieldCommitment>;
  shieldCommitmentsConnection: ShieldCommitmentsConnection;
  transactCommitments: Array<TransactCommitment>;
  transactCommitmentById?: Maybe<TransactCommitment>;
  /** @deprecated Use transactCommitmentById */
  transactCommitmentByUniqueInput?: Maybe<TransactCommitment>;
  transactCommitmentsConnection: TransactCommitmentsConnection;
  unshields: Array<Unshield>;
  unshieldById?: Maybe<Unshield>;
  /** @deprecated Use unshieldById */
  unshieldByUniqueInput?: Maybe<Unshield>;
  unshieldsConnection: UnshieldsConnection;
  nullifiers: Array<Nullifier>;
  nullifierById?: Maybe<Nullifier>;
  /** @deprecated Use nullifierById */
  nullifierByUniqueInput?: Maybe<Nullifier>;
  nullifiersConnection: NullifiersConnection;
  transactions: Array<Transaction>;
  transactionById?: Maybe<Transaction>;
  /** @deprecated Use transactionById */
  transactionByUniqueInput?: Maybe<Transaction>;
  transactionsConnection: TransactionsConnection;
  verificationHashes: Array<VerificationHash>;
  verificationHashById?: Maybe<VerificationHash>;
  /** @deprecated Use verificationHashById */
  verificationHashByUniqueInput?: Maybe<VerificationHash>;
  verificationHashesConnection: VerificationHashesConnection;
  commitmentBatchEventNews: Array<CommitmentBatchEventNew>;
  commitmentBatchEventNewById?: Maybe<CommitmentBatchEventNew>;
  /** @deprecated Use commitmentBatchEventNewById */
  commitmentBatchEventNewByUniqueInput?: Maybe<CommitmentBatchEventNew>;
  commitmentBatchEventNewsConnection: CommitmentBatchEventNewsConnection;
  squidStatus?: Maybe<SquidStatus>;
};


export type QuerytokensArgs = {
  where?: InputMaybe<TokenWhereInput>;
  orderBy?: InputMaybe<Array<TokenOrderByInput>>;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QuerytokenByIdArgs = {
  id: Scalars['String'];
};


export type QuerytokenByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QuerytokensConnectionArgs = {
  orderBy: Array<TokenOrderByInput>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<TokenWhereInput>;
};


export type QuerycommitmentPreimagesArgs = {
  where?: InputMaybe<CommitmentPreimageWhereInput>;
  orderBy?: InputMaybe<Array<CommitmentPreimageOrderByInput>>;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QuerycommitmentPreimageByIdArgs = {
  id: Scalars['String'];
};


export type QuerycommitmentPreimageByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QuerycommitmentPreimagesConnectionArgs = {
  orderBy: Array<CommitmentPreimageOrderByInput>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<CommitmentPreimageWhereInput>;
};


export type QueryciphertextsArgs = {
  where?: InputMaybe<CiphertextWhereInput>;
  orderBy?: InputMaybe<Array<CiphertextOrderByInput>>;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QueryciphertextByIdArgs = {
  id: Scalars['String'];
};


export type QueryciphertextByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QueryciphertextsConnectionArgs = {
  orderBy: Array<CiphertextOrderByInput>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<CiphertextWhereInput>;
};


export type QuerylegacyCommitmentCiphertextsArgs = {
  where?: InputMaybe<LegacyCommitmentCiphertextWhereInput>;
  orderBy?: InputMaybe<Array<LegacyCommitmentCiphertextOrderByInput>>;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QuerylegacyCommitmentCiphertextByIdArgs = {
  id: Scalars['String'];
};


export type QuerylegacyCommitmentCiphertextByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QuerylegacyCommitmentCiphertextsConnectionArgs = {
  orderBy: Array<LegacyCommitmentCiphertextOrderByInput>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<LegacyCommitmentCiphertextWhereInput>;
};


export type QuerycommitmentCiphertextsArgs = {
  where?: InputMaybe<CommitmentCiphertextWhereInput>;
  orderBy?: InputMaybe<Array<CommitmentCiphertextOrderByInput>>;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QuerycommitmentCiphertextByIdArgs = {
  id: Scalars['String'];
};


export type QuerycommitmentCiphertextByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QuerycommitmentCiphertextsConnectionArgs = {
  orderBy: Array<CommitmentCiphertextOrderByInput>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<CommitmentCiphertextWhereInput>;
};


export type QuerylegacyGeneratedCommitmentsArgs = {
  where?: InputMaybe<LegacyGeneratedCommitmentWhereInput>;
  orderBy?: InputMaybe<Array<LegacyGeneratedCommitmentOrderByInput>>;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QuerylegacyGeneratedCommitmentByIdArgs = {
  id: Scalars['String'];
};


export type QuerylegacyGeneratedCommitmentByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QuerylegacyGeneratedCommitmentsConnectionArgs = {
  orderBy: Array<LegacyGeneratedCommitmentOrderByInput>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<LegacyGeneratedCommitmentWhereInput>;
};


export type QuerycommitmentsArgs = {
  where?: InputMaybe<CommitmentWhereInput>;
  orderBy?: InputMaybe<Array<CommitmentOrderByInput>>;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QuerycommitmentsConnectionArgs = {
  orderBy: Array<CommitmentOrderByInput>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<CommitmentWhereInput>;
};


export type QuerylegacyEncryptedCommitmentsArgs = {
  where?: InputMaybe<LegacyEncryptedCommitmentWhereInput>;
  orderBy?: InputMaybe<Array<LegacyEncryptedCommitmentOrderByInput>>;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QuerylegacyEncryptedCommitmentByIdArgs = {
  id: Scalars['String'];
};


export type QuerylegacyEncryptedCommitmentByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QuerylegacyEncryptedCommitmentsConnectionArgs = {
  orderBy: Array<LegacyEncryptedCommitmentOrderByInput>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<LegacyEncryptedCommitmentWhereInput>;
};


export type QueryshieldCommitmentsArgs = {
  where?: InputMaybe<ShieldCommitmentWhereInput>;
  orderBy?: InputMaybe<Array<ShieldCommitmentOrderByInput>>;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QueryshieldCommitmentByIdArgs = {
  id: Scalars['String'];
};


export type QueryshieldCommitmentByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QueryshieldCommitmentsConnectionArgs = {
  orderBy: Array<ShieldCommitmentOrderByInput>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<ShieldCommitmentWhereInput>;
};


export type QuerytransactCommitmentsArgs = {
  where?: InputMaybe<TransactCommitmentWhereInput>;
  orderBy?: InputMaybe<Array<TransactCommitmentOrderByInput>>;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QuerytransactCommitmentByIdArgs = {
  id: Scalars['String'];
};


export type QuerytransactCommitmentByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QuerytransactCommitmentsConnectionArgs = {
  orderBy: Array<TransactCommitmentOrderByInput>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<TransactCommitmentWhereInput>;
};


export type QueryunshieldsArgs = {
  where?: InputMaybe<UnshieldWhereInput>;
  orderBy?: InputMaybe<Array<UnshieldOrderByInput>>;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QueryunshieldByIdArgs = {
  id: Scalars['String'];
};


export type QueryunshieldByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QueryunshieldsConnectionArgs = {
  orderBy: Array<UnshieldOrderByInput>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<UnshieldWhereInput>;
};


export type QuerynullifiersArgs = {
  where?: InputMaybe<NullifierWhereInput>;
  orderBy?: InputMaybe<Array<NullifierOrderByInput>>;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QuerynullifierByIdArgs = {
  id: Scalars['String'];
};


export type QuerynullifierByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QuerynullifiersConnectionArgs = {
  orderBy: Array<NullifierOrderByInput>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<NullifierWhereInput>;
};


export type QuerytransactionsArgs = {
  where?: InputMaybe<TransactionWhereInput>;
  orderBy?: InputMaybe<Array<TransactionOrderByInput>>;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QuerytransactionByIdArgs = {
  id: Scalars['String'];
};


export type QuerytransactionByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QuerytransactionsConnectionArgs = {
  orderBy: Array<TransactionOrderByInput>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<TransactionWhereInput>;
};


export type QueryverificationHashesArgs = {
  where?: InputMaybe<VerificationHashWhereInput>;
  orderBy?: InputMaybe<Array<VerificationHashOrderByInput>>;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QueryverificationHashByIdArgs = {
  id: Scalars['String'];
};


export type QueryverificationHashByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QueryverificationHashesConnectionArgs = {
  orderBy: Array<VerificationHashOrderByInput>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<VerificationHashWhereInput>;
};


export type QuerycommitmentBatchEventNewsArgs = {
  where?: InputMaybe<CommitmentBatchEventNewWhereInput>;
  orderBy?: InputMaybe<Array<CommitmentBatchEventNewOrderByInput>>;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type QuerycommitmentBatchEventNewByIdArgs = {
  id: Scalars['String'];
};


export type QuerycommitmentBatchEventNewByUniqueInputArgs = {
  where: WhereIdInput;
};


export type QuerycommitmentBatchEventNewsConnectionArgs = {
  orderBy: Array<CommitmentBatchEventNewOrderByInput>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<CommitmentBatchEventNewWhereInput>;
};

export type Token = {
  id: Scalars['String'];
  tokenType: TokenType;
  tokenAddress: Scalars['Bytes'];
  tokenSubID: Scalars['String'];
};

export type TokenType =
  | 'ERC20'
  | 'ERC721'
  | 'ERC1155';

export type TokenWhereInput = {
  id_isNull?: InputMaybe<Scalars['Boolean']>;
  id_eq?: InputMaybe<Scalars['String']>;
  id_not_eq?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_startsWith?: InputMaybe<Scalars['String']>;
  id_not_startsWith?: InputMaybe<Scalars['String']>;
  id_endsWith?: InputMaybe<Scalars['String']>;
  id_not_endsWith?: InputMaybe<Scalars['String']>;
  tokenType_isNull?: InputMaybe<Scalars['Boolean']>;
  tokenType_eq?: InputMaybe<TokenType>;
  tokenType_not_eq?: InputMaybe<TokenType>;
  tokenType_in?: InputMaybe<Array<TokenType>>;
  tokenType_not_in?: InputMaybe<Array<TokenType>>;
  tokenAddress_isNull?: InputMaybe<Scalars['Boolean']>;
  tokenAddress_eq?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_not_eq?: InputMaybe<Scalars['Bytes']>;
  tokenSubID_isNull?: InputMaybe<Scalars['Boolean']>;
  tokenSubID_eq?: InputMaybe<Scalars['String']>;
  tokenSubID_not_eq?: InputMaybe<Scalars['String']>;
  tokenSubID_gt?: InputMaybe<Scalars['String']>;
  tokenSubID_gte?: InputMaybe<Scalars['String']>;
  tokenSubID_lt?: InputMaybe<Scalars['String']>;
  tokenSubID_lte?: InputMaybe<Scalars['String']>;
  tokenSubID_in?: InputMaybe<Array<Scalars['String']>>;
  tokenSubID_not_in?: InputMaybe<Array<Scalars['String']>>;
  tokenSubID_contains?: InputMaybe<Scalars['String']>;
  tokenSubID_not_contains?: InputMaybe<Scalars['String']>;
  tokenSubID_containsInsensitive?: InputMaybe<Scalars['String']>;
  tokenSubID_not_containsInsensitive?: InputMaybe<Scalars['String']>;
  tokenSubID_startsWith?: InputMaybe<Scalars['String']>;
  tokenSubID_not_startsWith?: InputMaybe<Scalars['String']>;
  tokenSubID_endsWith?: InputMaybe<Scalars['String']>;
  tokenSubID_not_endsWith?: InputMaybe<Scalars['String']>;
  AND?: InputMaybe<Array<TokenWhereInput>>;
  OR?: InputMaybe<Array<TokenWhereInput>>;
};

export type TokenOrderByInput =
  | 'id_ASC'
  | 'id_DESC'
  | 'id_ASC_NULLS_FIRST'
  | 'id_DESC_NULLS_LAST'
  | 'tokenType_ASC'
  | 'tokenType_DESC'
  | 'tokenType_ASC_NULLS_FIRST'
  | 'tokenType_DESC_NULLS_LAST'
  | 'tokenAddress_ASC'
  | 'tokenAddress_DESC'
  | 'tokenAddress_ASC_NULLS_FIRST'
  | 'tokenAddress_DESC_NULLS_LAST'
  | 'tokenSubID_ASC'
  | 'tokenSubID_DESC'
  | 'tokenSubID_ASC_NULLS_FIRST'
  | 'tokenSubID_DESC_NULLS_LAST';

export type WhereIdInput = {
  id: Scalars['String'];
};

export type TokensConnection = {
  edges: Array<TokenEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type TokenEdge = {
  node: Token;
  cursor: Scalars['String'];
};

export type PageInfo = {
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor: Scalars['String'];
  endCursor: Scalars['String'];
};

export type CommitmentPreimage = {
  id: Scalars['String'];
  npk: Scalars['Bytes'];
  token: Token;
  value: Scalars['BigInt'];
};

export type CommitmentPreimageWhereInput = {
  id_isNull?: InputMaybe<Scalars['Boolean']>;
  id_eq?: InputMaybe<Scalars['String']>;
  id_not_eq?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_startsWith?: InputMaybe<Scalars['String']>;
  id_not_startsWith?: InputMaybe<Scalars['String']>;
  id_endsWith?: InputMaybe<Scalars['String']>;
  id_not_endsWith?: InputMaybe<Scalars['String']>;
  npk_isNull?: InputMaybe<Scalars['Boolean']>;
  npk_eq?: InputMaybe<Scalars['Bytes']>;
  npk_not_eq?: InputMaybe<Scalars['Bytes']>;
  token_isNull?: InputMaybe<Scalars['Boolean']>;
  token?: InputMaybe<TokenWhereInput>;
  value_isNull?: InputMaybe<Scalars['Boolean']>;
  value_eq?: InputMaybe<Scalars['BigInt']>;
  value_not_eq?: InputMaybe<Scalars['BigInt']>;
  value_gt?: InputMaybe<Scalars['BigInt']>;
  value_gte?: InputMaybe<Scalars['BigInt']>;
  value_lt?: InputMaybe<Scalars['BigInt']>;
  value_lte?: InputMaybe<Scalars['BigInt']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  AND?: InputMaybe<Array<CommitmentPreimageWhereInput>>;
  OR?: InputMaybe<Array<CommitmentPreimageWhereInput>>;
};

export type CommitmentPreimageOrderByInput =
  | 'id_ASC'
  | 'id_DESC'
  | 'id_ASC_NULLS_FIRST'
  | 'id_DESC_NULLS_LAST'
  | 'npk_ASC'
  | 'npk_DESC'
  | 'npk_ASC_NULLS_FIRST'
  | 'npk_DESC_NULLS_LAST'
  | 'token_id_ASC'
  | 'token_id_DESC'
  | 'token_id_ASC_NULLS_FIRST'
  | 'token_id_DESC_NULLS_LAST'
  | 'token_tokenType_ASC'
  | 'token_tokenType_DESC'
  | 'token_tokenType_ASC_NULLS_FIRST'
  | 'token_tokenType_DESC_NULLS_LAST'
  | 'token_tokenAddress_ASC'
  | 'token_tokenAddress_DESC'
  | 'token_tokenAddress_ASC_NULLS_FIRST'
  | 'token_tokenAddress_DESC_NULLS_LAST'
  | 'token_tokenSubID_ASC'
  | 'token_tokenSubID_DESC'
  | 'token_tokenSubID_ASC_NULLS_FIRST'
  | 'token_tokenSubID_DESC_NULLS_LAST'
  | 'value_ASC'
  | 'value_DESC'
  | 'value_ASC_NULLS_FIRST'
  | 'value_DESC_NULLS_LAST';

export type CommitmentPreimagesConnection = {
  edges: Array<CommitmentPreimageEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type CommitmentPreimageEdge = {
  node: CommitmentPreimage;
  cursor: Scalars['String'];
};

export type Ciphertext = {
  id: Scalars['String'];
  iv: Scalars['Bytes'];
  tag: Scalars['Bytes'];
  data: Array<Scalars['Bytes']>;
};

export type CiphertextWhereInput = {
  id_isNull?: InputMaybe<Scalars['Boolean']>;
  id_eq?: InputMaybe<Scalars['String']>;
  id_not_eq?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_startsWith?: InputMaybe<Scalars['String']>;
  id_not_startsWith?: InputMaybe<Scalars['String']>;
  id_endsWith?: InputMaybe<Scalars['String']>;
  id_not_endsWith?: InputMaybe<Scalars['String']>;
  iv_isNull?: InputMaybe<Scalars['Boolean']>;
  iv_eq?: InputMaybe<Scalars['Bytes']>;
  iv_not_eq?: InputMaybe<Scalars['Bytes']>;
  tag_isNull?: InputMaybe<Scalars['Boolean']>;
  tag_eq?: InputMaybe<Scalars['Bytes']>;
  tag_not_eq?: InputMaybe<Scalars['Bytes']>;
  data_isNull?: InputMaybe<Scalars['Boolean']>;
  data_containsAll?: InputMaybe<Array<Scalars['Bytes']>>;
  data_containsAny?: InputMaybe<Array<Scalars['Bytes']>>;
  data_containsNone?: InputMaybe<Array<Scalars['Bytes']>>;
  AND?: InputMaybe<Array<CiphertextWhereInput>>;
  OR?: InputMaybe<Array<CiphertextWhereInput>>;
};

export type CiphertextOrderByInput =
  | 'id_ASC'
  | 'id_DESC'
  | 'id_ASC_NULLS_FIRST'
  | 'id_DESC_NULLS_LAST'
  | 'iv_ASC'
  | 'iv_DESC'
  | 'iv_ASC_NULLS_FIRST'
  | 'iv_DESC_NULLS_LAST'
  | 'tag_ASC'
  | 'tag_DESC'
  | 'tag_ASC_NULLS_FIRST'
  | 'tag_DESC_NULLS_LAST';

export type CiphertextsConnection = {
  edges: Array<CiphertextEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type CiphertextEdge = {
  node: Ciphertext;
  cursor: Scalars['String'];
};

export type LegacyCommitmentCiphertext = {
  id: Scalars['String'];
  ciphertext: Ciphertext;
  ephemeralKeys: Array<Scalars['Bytes']>;
  memo: Array<Scalars['Bytes']>;
};

export type LegacyCommitmentCiphertextWhereInput = {
  id_isNull?: InputMaybe<Scalars['Boolean']>;
  id_eq?: InputMaybe<Scalars['String']>;
  id_not_eq?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_startsWith?: InputMaybe<Scalars['String']>;
  id_not_startsWith?: InputMaybe<Scalars['String']>;
  id_endsWith?: InputMaybe<Scalars['String']>;
  id_not_endsWith?: InputMaybe<Scalars['String']>;
  ciphertext_isNull?: InputMaybe<Scalars['Boolean']>;
  ciphertext?: InputMaybe<CiphertextWhereInput>;
  ephemeralKeys_isNull?: InputMaybe<Scalars['Boolean']>;
  ephemeralKeys_containsAll?: InputMaybe<Array<Scalars['Bytes']>>;
  ephemeralKeys_containsAny?: InputMaybe<Array<Scalars['Bytes']>>;
  ephemeralKeys_containsNone?: InputMaybe<Array<Scalars['Bytes']>>;
  memo_isNull?: InputMaybe<Scalars['Boolean']>;
  memo_containsAll?: InputMaybe<Array<Scalars['Bytes']>>;
  memo_containsAny?: InputMaybe<Array<Scalars['Bytes']>>;
  memo_containsNone?: InputMaybe<Array<Scalars['Bytes']>>;
  AND?: InputMaybe<Array<LegacyCommitmentCiphertextWhereInput>>;
  OR?: InputMaybe<Array<LegacyCommitmentCiphertextWhereInput>>;
};

export type LegacyCommitmentCiphertextOrderByInput =
  | 'id_ASC'
  | 'id_DESC'
  | 'id_ASC_NULLS_FIRST'
  | 'id_DESC_NULLS_LAST'
  | 'ciphertext_id_ASC'
  | 'ciphertext_id_DESC'
  | 'ciphertext_id_ASC_NULLS_FIRST'
  | 'ciphertext_id_DESC_NULLS_LAST'
  | 'ciphertext_iv_ASC'
  | 'ciphertext_iv_DESC'
  | 'ciphertext_iv_ASC_NULLS_FIRST'
  | 'ciphertext_iv_DESC_NULLS_LAST'
  | 'ciphertext_tag_ASC'
  | 'ciphertext_tag_DESC'
  | 'ciphertext_tag_ASC_NULLS_FIRST'
  | 'ciphertext_tag_DESC_NULLS_LAST';

export type LegacyCommitmentCiphertextsConnection = {
  edges: Array<LegacyCommitmentCiphertextEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type LegacyCommitmentCiphertextEdge = {
  node: LegacyCommitmentCiphertext;
  cursor: Scalars['String'];
};

export type CommitmentCiphertext = {
  id: Scalars['String'];
  ciphertext: Ciphertext;
  blindedSenderViewingKey: Scalars['Bytes'];
  blindedReceiverViewingKey: Scalars['Bytes'];
  annotationData: Scalars['Bytes'];
  memo: Scalars['Bytes'];
};

export type CommitmentCiphertextWhereInput = {
  id_isNull?: InputMaybe<Scalars['Boolean']>;
  id_eq?: InputMaybe<Scalars['String']>;
  id_not_eq?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_startsWith?: InputMaybe<Scalars['String']>;
  id_not_startsWith?: InputMaybe<Scalars['String']>;
  id_endsWith?: InputMaybe<Scalars['String']>;
  id_not_endsWith?: InputMaybe<Scalars['String']>;
  ciphertext_isNull?: InputMaybe<Scalars['Boolean']>;
  ciphertext?: InputMaybe<CiphertextWhereInput>;
  blindedSenderViewingKey_isNull?: InputMaybe<Scalars['Boolean']>;
  blindedSenderViewingKey_eq?: InputMaybe<Scalars['Bytes']>;
  blindedSenderViewingKey_not_eq?: InputMaybe<Scalars['Bytes']>;
  blindedReceiverViewingKey_isNull?: InputMaybe<Scalars['Boolean']>;
  blindedReceiverViewingKey_eq?: InputMaybe<Scalars['Bytes']>;
  blindedReceiverViewingKey_not_eq?: InputMaybe<Scalars['Bytes']>;
  annotationData_isNull?: InputMaybe<Scalars['Boolean']>;
  annotationData_eq?: InputMaybe<Scalars['Bytes']>;
  annotationData_not_eq?: InputMaybe<Scalars['Bytes']>;
  memo_isNull?: InputMaybe<Scalars['Boolean']>;
  memo_eq?: InputMaybe<Scalars['Bytes']>;
  memo_not_eq?: InputMaybe<Scalars['Bytes']>;
  AND?: InputMaybe<Array<CommitmentCiphertextWhereInput>>;
  OR?: InputMaybe<Array<CommitmentCiphertextWhereInput>>;
};

export type CommitmentCiphertextOrderByInput =
  | 'id_ASC'
  | 'id_DESC'
  | 'id_ASC_NULLS_FIRST'
  | 'id_DESC_NULLS_LAST'
  | 'ciphertext_id_ASC'
  | 'ciphertext_id_DESC'
  | 'ciphertext_id_ASC_NULLS_FIRST'
  | 'ciphertext_id_DESC_NULLS_LAST'
  | 'ciphertext_iv_ASC'
  | 'ciphertext_iv_DESC'
  | 'ciphertext_iv_ASC_NULLS_FIRST'
  | 'ciphertext_iv_DESC_NULLS_LAST'
  | 'ciphertext_tag_ASC'
  | 'ciphertext_tag_DESC'
  | 'ciphertext_tag_ASC_NULLS_FIRST'
  | 'ciphertext_tag_DESC_NULLS_LAST'
  | 'blindedSenderViewingKey_ASC'
  | 'blindedSenderViewingKey_DESC'
  | 'blindedSenderViewingKey_ASC_NULLS_FIRST'
  | 'blindedSenderViewingKey_DESC_NULLS_LAST'
  | 'blindedReceiverViewingKey_ASC'
  | 'blindedReceiverViewingKey_DESC'
  | 'blindedReceiverViewingKey_ASC_NULLS_FIRST'
  | 'blindedReceiverViewingKey_DESC_NULLS_LAST'
  | 'annotationData_ASC'
  | 'annotationData_DESC'
  | 'annotationData_ASC_NULLS_FIRST'
  | 'annotationData_DESC_NULLS_LAST'
  | 'memo_ASC'
  | 'memo_DESC'
  | 'memo_ASC_NULLS_FIRST'
  | 'memo_DESC_NULLS_LAST';

export type CommitmentCiphertextsConnection = {
  edges: Array<CommitmentCiphertextEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type CommitmentCiphertextEdge = {
  node: CommitmentCiphertext;
  cursor: Scalars['String'];
};

export type LegacyGeneratedCommitment = Commitment & {
  id: Scalars['String'];
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

export type Commitment = {
  id: Scalars['String'];
  blockNumber: Scalars['BigInt'];
  blockTimestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  treeNumber: Scalars['Int'];
  batchStartTreePosition: Scalars['Int'];
  treePosition: Scalars['Int'];
  commitmentType: CommitmentType;
  hash: Scalars['BigInt'];
};

export type CommitmentType =
  | 'ShieldCommitment'
  | 'TransactCommitment'
  | 'LegacyGeneratedCommitment'
  | 'LegacyEncryptedCommitment';

export type LegacyGeneratedCommitmentWhereInput = {
  id_isNull?: InputMaybe<Scalars['Boolean']>;
  id_eq?: InputMaybe<Scalars['String']>;
  id_not_eq?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_startsWith?: InputMaybe<Scalars['String']>;
  id_not_startsWith?: InputMaybe<Scalars['String']>;
  id_endsWith?: InputMaybe<Scalars['String']>;
  id_not_endsWith?: InputMaybe<Scalars['String']>;
  blockNumber_isNull?: InputMaybe<Scalars['Boolean']>;
  blockNumber_eq?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not_eq?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_isNull?: InputMaybe<Scalars['Boolean']>;
  blockTimestamp_eq?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_not_eq?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash_isNull?: InputMaybe<Scalars['Boolean']>;
  transactionHash_eq?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_eq?: InputMaybe<Scalars['Bytes']>;
  treeNumber_isNull?: InputMaybe<Scalars['Boolean']>;
  treeNumber_eq?: InputMaybe<Scalars['Int']>;
  treeNumber_not_eq?: InputMaybe<Scalars['Int']>;
  treeNumber_gt?: InputMaybe<Scalars['Int']>;
  treeNumber_gte?: InputMaybe<Scalars['Int']>;
  treeNumber_lt?: InputMaybe<Scalars['Int']>;
  treeNumber_lte?: InputMaybe<Scalars['Int']>;
  treeNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  treeNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition_isNull?: InputMaybe<Scalars['Boolean']>;
  batchStartTreePosition_eq?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_not_eq?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition_isNull?: InputMaybe<Scalars['Boolean']>;
  treePosition_eq?: InputMaybe<Scalars['Int']>;
  treePosition_not_eq?: InputMaybe<Scalars['Int']>;
  treePosition_gt?: InputMaybe<Scalars['Int']>;
  treePosition_gte?: InputMaybe<Scalars['Int']>;
  treePosition_lt?: InputMaybe<Scalars['Int']>;
  treePosition_lte?: InputMaybe<Scalars['Int']>;
  treePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  commitmentType_isNull?: InputMaybe<Scalars['Boolean']>;
  commitmentType_eq?: InputMaybe<CommitmentType>;
  commitmentType_not_eq?: InputMaybe<CommitmentType>;
  commitmentType_in?: InputMaybe<Array<CommitmentType>>;
  commitmentType_not_in?: InputMaybe<Array<CommitmentType>>;
  hash_isNull?: InputMaybe<Scalars['Boolean']>;
  hash_eq?: InputMaybe<Scalars['BigInt']>;
  hash_not_eq?: InputMaybe<Scalars['BigInt']>;
  hash_gt?: InputMaybe<Scalars['BigInt']>;
  hash_gte?: InputMaybe<Scalars['BigInt']>;
  hash_lt?: InputMaybe<Scalars['BigInt']>;
  hash_lte?: InputMaybe<Scalars['BigInt']>;
  hash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  hash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  preimage_isNull?: InputMaybe<Scalars['Boolean']>;
  preimage?: InputMaybe<CommitmentPreimageWhereInput>;
  encryptedRandom_isNull?: InputMaybe<Scalars['Boolean']>;
  encryptedRandom_containsAll?: InputMaybe<Array<Scalars['Bytes']>>;
  encryptedRandom_containsAny?: InputMaybe<Array<Scalars['Bytes']>>;
  encryptedRandom_containsNone?: InputMaybe<Array<Scalars['Bytes']>>;
  AND?: InputMaybe<Array<LegacyGeneratedCommitmentWhereInput>>;
  OR?: InputMaybe<Array<LegacyGeneratedCommitmentWhereInput>>;
};

export type LegacyGeneratedCommitmentOrderByInput =
  | 'id_ASC'
  | 'id_DESC'
  | 'id_ASC_NULLS_FIRST'
  | 'id_DESC_NULLS_LAST'
  | 'blockNumber_ASC'
  | 'blockNumber_DESC'
  | 'blockNumber_ASC_NULLS_FIRST'
  | 'blockNumber_DESC_NULLS_LAST'
  | 'blockTimestamp_ASC'
  | 'blockTimestamp_DESC'
  | 'blockTimestamp_ASC_NULLS_FIRST'
  | 'blockTimestamp_DESC_NULLS_LAST'
  | 'transactionHash_ASC'
  | 'transactionHash_DESC'
  | 'transactionHash_ASC_NULLS_FIRST'
  | 'transactionHash_DESC_NULLS_LAST'
  | 'treeNumber_ASC'
  | 'treeNumber_DESC'
  | 'treeNumber_ASC_NULLS_FIRST'
  | 'treeNumber_DESC_NULLS_LAST'
  | 'batchStartTreePosition_ASC'
  | 'batchStartTreePosition_DESC'
  | 'batchStartTreePosition_ASC_NULLS_FIRST'
  | 'batchStartTreePosition_DESC_NULLS_LAST'
  | 'treePosition_ASC'
  | 'treePosition_DESC'
  | 'treePosition_ASC_NULLS_FIRST'
  | 'treePosition_DESC_NULLS_LAST'
  | 'commitmentType_ASC'
  | 'commitmentType_DESC'
  | 'commitmentType_ASC_NULLS_FIRST'
  | 'commitmentType_DESC_NULLS_LAST'
  | 'hash_ASC'
  | 'hash_DESC'
  | 'hash_ASC_NULLS_FIRST'
  | 'hash_DESC_NULLS_LAST'
  | 'preimage_id_ASC'
  | 'preimage_id_DESC'
  | 'preimage_id_ASC_NULLS_FIRST'
  | 'preimage_id_DESC_NULLS_LAST'
  | 'preimage_npk_ASC'
  | 'preimage_npk_DESC'
  | 'preimage_npk_ASC_NULLS_FIRST'
  | 'preimage_npk_DESC_NULLS_LAST'
  | 'preimage_value_ASC'
  | 'preimage_value_DESC'
  | 'preimage_value_ASC_NULLS_FIRST'
  | 'preimage_value_DESC_NULLS_LAST';

export type LegacyGeneratedCommitmentsConnection = {
  edges: Array<LegacyGeneratedCommitmentEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type LegacyGeneratedCommitmentEdge = {
  node: LegacyGeneratedCommitment;
  cursor: Scalars['String'];
};

export type CommitmentWhereInput = {
  id_isNull?: InputMaybe<Scalars['Boolean']>;
  id_eq?: InputMaybe<Scalars['String']>;
  id_not_eq?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_startsWith?: InputMaybe<Scalars['String']>;
  id_not_startsWith?: InputMaybe<Scalars['String']>;
  id_endsWith?: InputMaybe<Scalars['String']>;
  id_not_endsWith?: InputMaybe<Scalars['String']>;
  blockNumber_isNull?: InputMaybe<Scalars['Boolean']>;
  blockNumber_eq?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not_eq?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_isNull?: InputMaybe<Scalars['Boolean']>;
  blockTimestamp_eq?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_not_eq?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash_isNull?: InputMaybe<Scalars['Boolean']>;
  transactionHash_eq?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_eq?: InputMaybe<Scalars['Bytes']>;
  treeNumber_isNull?: InputMaybe<Scalars['Boolean']>;
  treeNumber_eq?: InputMaybe<Scalars['Int']>;
  treeNumber_not_eq?: InputMaybe<Scalars['Int']>;
  treeNumber_gt?: InputMaybe<Scalars['Int']>;
  treeNumber_gte?: InputMaybe<Scalars['Int']>;
  treeNumber_lt?: InputMaybe<Scalars['Int']>;
  treeNumber_lte?: InputMaybe<Scalars['Int']>;
  treeNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  treeNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition_isNull?: InputMaybe<Scalars['Boolean']>;
  batchStartTreePosition_eq?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_not_eq?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition_isNull?: InputMaybe<Scalars['Boolean']>;
  treePosition_eq?: InputMaybe<Scalars['Int']>;
  treePosition_not_eq?: InputMaybe<Scalars['Int']>;
  treePosition_gt?: InputMaybe<Scalars['Int']>;
  treePosition_gte?: InputMaybe<Scalars['Int']>;
  treePosition_lt?: InputMaybe<Scalars['Int']>;
  treePosition_lte?: InputMaybe<Scalars['Int']>;
  treePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  commitmentType_isNull?: InputMaybe<Scalars['Boolean']>;
  commitmentType_eq?: InputMaybe<CommitmentType>;
  commitmentType_not_eq?: InputMaybe<CommitmentType>;
  commitmentType_in?: InputMaybe<Array<CommitmentType>>;
  commitmentType_not_in?: InputMaybe<Array<CommitmentType>>;
  hash_isNull?: InputMaybe<Scalars['Boolean']>;
  hash_eq?: InputMaybe<Scalars['BigInt']>;
  hash_not_eq?: InputMaybe<Scalars['BigInt']>;
  hash_gt?: InputMaybe<Scalars['BigInt']>;
  hash_gte?: InputMaybe<Scalars['BigInt']>;
  hash_lt?: InputMaybe<Scalars['BigInt']>;
  hash_lte?: InputMaybe<Scalars['BigInt']>;
  hash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  hash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  AND?: InputMaybe<Array<CommitmentWhereInput>>;
  OR?: InputMaybe<Array<CommitmentWhereInput>>;
};

export type CommitmentOrderByInput =
  | 'id_ASC'
  | 'id_DESC'
  | 'id_ASC_NULLS_FIRST'
  | 'id_DESC_NULLS_LAST'
  | 'blockNumber_ASC'
  | 'blockNumber_DESC'
  | 'blockNumber_ASC_NULLS_FIRST'
  | 'blockNumber_DESC_NULLS_LAST'
  | 'blockTimestamp_ASC'
  | 'blockTimestamp_DESC'
  | 'blockTimestamp_ASC_NULLS_FIRST'
  | 'blockTimestamp_DESC_NULLS_LAST'
  | 'transactionHash_ASC'
  | 'transactionHash_DESC'
  | 'transactionHash_ASC_NULLS_FIRST'
  | 'transactionHash_DESC_NULLS_LAST'
  | 'treeNumber_ASC'
  | 'treeNumber_DESC'
  | 'treeNumber_ASC_NULLS_FIRST'
  | 'treeNumber_DESC_NULLS_LAST'
  | 'batchStartTreePosition_ASC'
  | 'batchStartTreePosition_DESC'
  | 'batchStartTreePosition_ASC_NULLS_FIRST'
  | 'batchStartTreePosition_DESC_NULLS_LAST'
  | 'treePosition_ASC'
  | 'treePosition_DESC'
  | 'treePosition_ASC_NULLS_FIRST'
  | 'treePosition_DESC_NULLS_LAST'
  | 'commitmentType_ASC'
  | 'commitmentType_DESC'
  | 'commitmentType_ASC_NULLS_FIRST'
  | 'commitmentType_DESC_NULLS_LAST'
  | 'hash_ASC'
  | 'hash_DESC'
  | 'hash_ASC_NULLS_FIRST'
  | 'hash_DESC_NULLS_LAST'
  | '_type_ASC'
  | '_type_DESC';

export type CommitmentsConnection = {
  edges: Array<CommitmentEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type CommitmentEdge = {
  node: Commitment;
  cursor: Scalars['String'];
};

export type LegacyEncryptedCommitment = Commitment & {
  id: Scalars['String'];
  blockNumber: Scalars['BigInt'];
  blockTimestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  treeNumber: Scalars['Int'];
  batchStartTreePosition: Scalars['Int'];
  treePosition: Scalars['Int'];
  commitmentType: CommitmentType;
  hash: Scalars['BigInt'];
  legacyCiphertext: LegacyCommitmentCiphertext; // MODIFIED
};

export type LegacyEncryptedCommitmentWhereInput = {
  id_isNull?: InputMaybe<Scalars['Boolean']>;
  id_eq?: InputMaybe<Scalars['String']>;
  id_not_eq?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_startsWith?: InputMaybe<Scalars['String']>;
  id_not_startsWith?: InputMaybe<Scalars['String']>;
  id_endsWith?: InputMaybe<Scalars['String']>;
  id_not_endsWith?: InputMaybe<Scalars['String']>;
  blockNumber_isNull?: InputMaybe<Scalars['Boolean']>;
  blockNumber_eq?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not_eq?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_isNull?: InputMaybe<Scalars['Boolean']>;
  blockTimestamp_eq?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_not_eq?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash_isNull?: InputMaybe<Scalars['Boolean']>;
  transactionHash_eq?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_eq?: InputMaybe<Scalars['Bytes']>;
  treeNumber_isNull?: InputMaybe<Scalars['Boolean']>;
  treeNumber_eq?: InputMaybe<Scalars['Int']>;
  treeNumber_not_eq?: InputMaybe<Scalars['Int']>;
  treeNumber_gt?: InputMaybe<Scalars['Int']>;
  treeNumber_gte?: InputMaybe<Scalars['Int']>;
  treeNumber_lt?: InputMaybe<Scalars['Int']>;
  treeNumber_lte?: InputMaybe<Scalars['Int']>;
  treeNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  treeNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition_isNull?: InputMaybe<Scalars['Boolean']>;
  batchStartTreePosition_eq?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_not_eq?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition_isNull?: InputMaybe<Scalars['Boolean']>;
  treePosition_eq?: InputMaybe<Scalars['Int']>;
  treePosition_not_eq?: InputMaybe<Scalars['Int']>;
  treePosition_gt?: InputMaybe<Scalars['Int']>;
  treePosition_gte?: InputMaybe<Scalars['Int']>;
  treePosition_lt?: InputMaybe<Scalars['Int']>;
  treePosition_lte?: InputMaybe<Scalars['Int']>;
  treePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  commitmentType_isNull?: InputMaybe<Scalars['Boolean']>;
  commitmentType_eq?: InputMaybe<CommitmentType>;
  commitmentType_not_eq?: InputMaybe<CommitmentType>;
  commitmentType_in?: InputMaybe<Array<CommitmentType>>;
  commitmentType_not_in?: InputMaybe<Array<CommitmentType>>;
  hash_isNull?: InputMaybe<Scalars['Boolean']>;
  hash_eq?: InputMaybe<Scalars['BigInt']>;
  hash_not_eq?: InputMaybe<Scalars['BigInt']>;
  hash_gt?: InputMaybe<Scalars['BigInt']>;
  hash_gte?: InputMaybe<Scalars['BigInt']>;
  hash_lt?: InputMaybe<Scalars['BigInt']>;
  hash_lte?: InputMaybe<Scalars['BigInt']>;
  hash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  hash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  ciphertext_isNull?: InputMaybe<Scalars['Boolean']>;
  ciphertext?: InputMaybe<LegacyCommitmentCiphertextWhereInput>;
  AND?: InputMaybe<Array<LegacyEncryptedCommitmentWhereInput>>;
  OR?: InputMaybe<Array<LegacyEncryptedCommitmentWhereInput>>;
};

export type LegacyEncryptedCommitmentOrderByInput =
  | 'id_ASC'
  | 'id_DESC'
  | 'id_ASC_NULLS_FIRST'
  | 'id_DESC_NULLS_LAST'
  | 'blockNumber_ASC'
  | 'blockNumber_DESC'
  | 'blockNumber_ASC_NULLS_FIRST'
  | 'blockNumber_DESC_NULLS_LAST'
  | 'blockTimestamp_ASC'
  | 'blockTimestamp_DESC'
  | 'blockTimestamp_ASC_NULLS_FIRST'
  | 'blockTimestamp_DESC_NULLS_LAST'
  | 'transactionHash_ASC'
  | 'transactionHash_DESC'
  | 'transactionHash_ASC_NULLS_FIRST'
  | 'transactionHash_DESC_NULLS_LAST'
  | 'treeNumber_ASC'
  | 'treeNumber_DESC'
  | 'treeNumber_ASC_NULLS_FIRST'
  | 'treeNumber_DESC_NULLS_LAST'
  | 'batchStartTreePosition_ASC'
  | 'batchStartTreePosition_DESC'
  | 'batchStartTreePosition_ASC_NULLS_FIRST'
  | 'batchStartTreePosition_DESC_NULLS_LAST'
  | 'treePosition_ASC'
  | 'treePosition_DESC'
  | 'treePosition_ASC_NULLS_FIRST'
  | 'treePosition_DESC_NULLS_LAST'
  | 'commitmentType_ASC'
  | 'commitmentType_DESC'
  | 'commitmentType_ASC_NULLS_FIRST'
  | 'commitmentType_DESC_NULLS_LAST'
  | 'hash_ASC'
  | 'hash_DESC'
  | 'hash_ASC_NULLS_FIRST'
  | 'hash_DESC_NULLS_LAST'
  | 'ciphertext_id_ASC'
  | 'ciphertext_id_DESC'
  | 'ciphertext_id_ASC_NULLS_FIRST'
  | 'ciphertext_id_DESC_NULLS_LAST';

export type LegacyEncryptedCommitmentsConnection = {
  edges: Array<LegacyEncryptedCommitmentEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type LegacyEncryptedCommitmentEdge = {
  node: LegacyEncryptedCommitment;
  cursor: Scalars['String'];
};

export type ShieldCommitment = Commitment & {
  id: Scalars['String'];
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

export type ShieldCommitmentWhereInput = {
  id_isNull?: InputMaybe<Scalars['Boolean']>;
  id_eq?: InputMaybe<Scalars['String']>;
  id_not_eq?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_startsWith?: InputMaybe<Scalars['String']>;
  id_not_startsWith?: InputMaybe<Scalars['String']>;
  id_endsWith?: InputMaybe<Scalars['String']>;
  id_not_endsWith?: InputMaybe<Scalars['String']>;
  blockNumber_isNull?: InputMaybe<Scalars['Boolean']>;
  blockNumber_eq?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not_eq?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_isNull?: InputMaybe<Scalars['Boolean']>;
  blockTimestamp_eq?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_not_eq?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash_isNull?: InputMaybe<Scalars['Boolean']>;
  transactionHash_eq?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_eq?: InputMaybe<Scalars['Bytes']>;
  treeNumber_isNull?: InputMaybe<Scalars['Boolean']>;
  treeNumber_eq?: InputMaybe<Scalars['Int']>;
  treeNumber_not_eq?: InputMaybe<Scalars['Int']>;
  treeNumber_gt?: InputMaybe<Scalars['Int']>;
  treeNumber_gte?: InputMaybe<Scalars['Int']>;
  treeNumber_lt?: InputMaybe<Scalars['Int']>;
  treeNumber_lte?: InputMaybe<Scalars['Int']>;
  treeNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  treeNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition_isNull?: InputMaybe<Scalars['Boolean']>;
  batchStartTreePosition_eq?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_not_eq?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition_isNull?: InputMaybe<Scalars['Boolean']>;
  treePosition_eq?: InputMaybe<Scalars['Int']>;
  treePosition_not_eq?: InputMaybe<Scalars['Int']>;
  treePosition_gt?: InputMaybe<Scalars['Int']>;
  treePosition_gte?: InputMaybe<Scalars['Int']>;
  treePosition_lt?: InputMaybe<Scalars['Int']>;
  treePosition_lte?: InputMaybe<Scalars['Int']>;
  treePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  commitmentType_isNull?: InputMaybe<Scalars['Boolean']>;
  commitmentType_eq?: InputMaybe<CommitmentType>;
  commitmentType_not_eq?: InputMaybe<CommitmentType>;
  commitmentType_in?: InputMaybe<Array<CommitmentType>>;
  commitmentType_not_in?: InputMaybe<Array<CommitmentType>>;
  hash_isNull?: InputMaybe<Scalars['Boolean']>;
  hash_eq?: InputMaybe<Scalars['BigInt']>;
  hash_not_eq?: InputMaybe<Scalars['BigInt']>;
  hash_gt?: InputMaybe<Scalars['BigInt']>;
  hash_gte?: InputMaybe<Scalars['BigInt']>;
  hash_lt?: InputMaybe<Scalars['BigInt']>;
  hash_lte?: InputMaybe<Scalars['BigInt']>;
  hash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  hash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  preimage_isNull?: InputMaybe<Scalars['Boolean']>;
  preimage?: InputMaybe<CommitmentPreimageWhereInput>;
  encryptedBundle_isNull?: InputMaybe<Scalars['Boolean']>;
  encryptedBundle_containsAll?: InputMaybe<Array<Scalars['Bytes']>>;
  encryptedBundle_containsAny?: InputMaybe<Array<Scalars['Bytes']>>;
  encryptedBundle_containsNone?: InputMaybe<Array<Scalars['Bytes']>>;
  shieldKey_isNull?: InputMaybe<Scalars['Boolean']>;
  shieldKey_eq?: InputMaybe<Scalars['Bytes']>;
  shieldKey_not_eq?: InputMaybe<Scalars['Bytes']>;
  fee_isNull?: InputMaybe<Scalars['Boolean']>;
  fee_eq?: InputMaybe<Scalars['BigInt']>;
  fee_not_eq?: InputMaybe<Scalars['BigInt']>;
  fee_gt?: InputMaybe<Scalars['BigInt']>;
  fee_gte?: InputMaybe<Scalars['BigInt']>;
  fee_lt?: InputMaybe<Scalars['BigInt']>;
  fee_lte?: InputMaybe<Scalars['BigInt']>;
  fee_in?: InputMaybe<Array<Scalars['BigInt']>>;
  fee_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  AND?: InputMaybe<Array<ShieldCommitmentWhereInput>>;
  OR?: InputMaybe<Array<ShieldCommitmentWhereInput>>;
};

export type ShieldCommitmentOrderByInput =
  | 'id_ASC'
  | 'id_DESC'
  | 'id_ASC_NULLS_FIRST'
  | 'id_DESC_NULLS_LAST'
  | 'blockNumber_ASC'
  | 'blockNumber_DESC'
  | 'blockNumber_ASC_NULLS_FIRST'
  | 'blockNumber_DESC_NULLS_LAST'
  | 'blockTimestamp_ASC'
  | 'blockTimestamp_DESC'
  | 'blockTimestamp_ASC_NULLS_FIRST'
  | 'blockTimestamp_DESC_NULLS_LAST'
  | 'transactionHash_ASC'
  | 'transactionHash_DESC'
  | 'transactionHash_ASC_NULLS_FIRST'
  | 'transactionHash_DESC_NULLS_LAST'
  | 'treeNumber_ASC'
  | 'treeNumber_DESC'
  | 'treeNumber_ASC_NULLS_FIRST'
  | 'treeNumber_DESC_NULLS_LAST'
  | 'batchStartTreePosition_ASC'
  | 'batchStartTreePosition_DESC'
  | 'batchStartTreePosition_ASC_NULLS_FIRST'
  | 'batchStartTreePosition_DESC_NULLS_LAST'
  | 'treePosition_ASC'
  | 'treePosition_DESC'
  | 'treePosition_ASC_NULLS_FIRST'
  | 'treePosition_DESC_NULLS_LAST'
  | 'commitmentType_ASC'
  | 'commitmentType_DESC'
  | 'commitmentType_ASC_NULLS_FIRST'
  | 'commitmentType_DESC_NULLS_LAST'
  | 'hash_ASC'
  | 'hash_DESC'
  | 'hash_ASC_NULLS_FIRST'
  | 'hash_DESC_NULLS_LAST'
  | 'preimage_id_ASC'
  | 'preimage_id_DESC'
  | 'preimage_id_ASC_NULLS_FIRST'
  | 'preimage_id_DESC_NULLS_LAST'
  | 'preimage_npk_ASC'
  | 'preimage_npk_DESC'
  | 'preimage_npk_ASC_NULLS_FIRST'
  | 'preimage_npk_DESC_NULLS_LAST'
  | 'preimage_value_ASC'
  | 'preimage_value_DESC'
  | 'preimage_value_ASC_NULLS_FIRST'
  | 'preimage_value_DESC_NULLS_LAST'
  | 'shieldKey_ASC'
  | 'shieldKey_DESC'
  | 'shieldKey_ASC_NULLS_FIRST'
  | 'shieldKey_DESC_NULLS_LAST'
  | 'fee_ASC'
  | 'fee_DESC'
  | 'fee_ASC_NULLS_FIRST'
  | 'fee_DESC_NULLS_LAST';

export type ShieldCommitmentsConnection = {
  edges: Array<ShieldCommitmentEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type ShieldCommitmentEdge = {
  node: ShieldCommitment;
  cursor: Scalars['String'];
};

export type TransactCommitment = Commitment & {
  id: Scalars['String'];
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

export type TransactCommitmentWhereInput = {
  id_isNull?: InputMaybe<Scalars['Boolean']>;
  id_eq?: InputMaybe<Scalars['String']>;
  id_not_eq?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_startsWith?: InputMaybe<Scalars['String']>;
  id_not_startsWith?: InputMaybe<Scalars['String']>;
  id_endsWith?: InputMaybe<Scalars['String']>;
  id_not_endsWith?: InputMaybe<Scalars['String']>;
  blockNumber_isNull?: InputMaybe<Scalars['Boolean']>;
  blockNumber_eq?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not_eq?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_isNull?: InputMaybe<Scalars['Boolean']>;
  blockTimestamp_eq?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_not_eq?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash_isNull?: InputMaybe<Scalars['Boolean']>;
  transactionHash_eq?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_eq?: InputMaybe<Scalars['Bytes']>;
  treeNumber_isNull?: InputMaybe<Scalars['Boolean']>;
  treeNumber_eq?: InputMaybe<Scalars['Int']>;
  treeNumber_not_eq?: InputMaybe<Scalars['Int']>;
  treeNumber_gt?: InputMaybe<Scalars['Int']>;
  treeNumber_gte?: InputMaybe<Scalars['Int']>;
  treeNumber_lt?: InputMaybe<Scalars['Int']>;
  treeNumber_lte?: InputMaybe<Scalars['Int']>;
  treeNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  treeNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition_isNull?: InputMaybe<Scalars['Boolean']>;
  batchStartTreePosition_eq?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_not_eq?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_gte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lt?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_lte?: InputMaybe<Scalars['Int']>;
  batchStartTreePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  batchStartTreePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition_isNull?: InputMaybe<Scalars['Boolean']>;
  treePosition_eq?: InputMaybe<Scalars['Int']>;
  treePosition_not_eq?: InputMaybe<Scalars['Int']>;
  treePosition_gt?: InputMaybe<Scalars['Int']>;
  treePosition_gte?: InputMaybe<Scalars['Int']>;
  treePosition_lt?: InputMaybe<Scalars['Int']>;
  treePosition_lte?: InputMaybe<Scalars['Int']>;
  treePosition_in?: InputMaybe<Array<Scalars['Int']>>;
  treePosition_not_in?: InputMaybe<Array<Scalars['Int']>>;
  commitmentType_isNull?: InputMaybe<Scalars['Boolean']>;
  commitmentType_eq?: InputMaybe<CommitmentType>;
  commitmentType_not_eq?: InputMaybe<CommitmentType>;
  commitmentType_in?: InputMaybe<Array<CommitmentType>>;
  commitmentType_not_in?: InputMaybe<Array<CommitmentType>>;
  hash_isNull?: InputMaybe<Scalars['Boolean']>;
  hash_eq?: InputMaybe<Scalars['BigInt']>;
  hash_not_eq?: InputMaybe<Scalars['BigInt']>;
  hash_gt?: InputMaybe<Scalars['BigInt']>;
  hash_gte?: InputMaybe<Scalars['BigInt']>;
  hash_lt?: InputMaybe<Scalars['BigInt']>;
  hash_lte?: InputMaybe<Scalars['BigInt']>;
  hash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  hash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  ciphertext_isNull?: InputMaybe<Scalars['Boolean']>;
  ciphertext?: InputMaybe<CommitmentCiphertextWhereInput>;
  AND?: InputMaybe<Array<TransactCommitmentWhereInput>>;
  OR?: InputMaybe<Array<TransactCommitmentWhereInput>>;
};

export type TransactCommitmentOrderByInput =
  | 'id_ASC'
  | 'id_DESC'
  | 'id_ASC_NULLS_FIRST'
  | 'id_DESC_NULLS_LAST'
  | 'blockNumber_ASC'
  | 'blockNumber_DESC'
  | 'blockNumber_ASC_NULLS_FIRST'
  | 'blockNumber_DESC_NULLS_LAST'
  | 'blockTimestamp_ASC'
  | 'blockTimestamp_DESC'
  | 'blockTimestamp_ASC_NULLS_FIRST'
  | 'blockTimestamp_DESC_NULLS_LAST'
  | 'transactionHash_ASC'
  | 'transactionHash_DESC'
  | 'transactionHash_ASC_NULLS_FIRST'
  | 'transactionHash_DESC_NULLS_LAST'
  | 'treeNumber_ASC'
  | 'treeNumber_DESC'
  | 'treeNumber_ASC_NULLS_FIRST'
  | 'treeNumber_DESC_NULLS_LAST'
  | 'batchStartTreePosition_ASC'
  | 'batchStartTreePosition_DESC'
  | 'batchStartTreePosition_ASC_NULLS_FIRST'
  | 'batchStartTreePosition_DESC_NULLS_LAST'
  | 'treePosition_ASC'
  | 'treePosition_DESC'
  | 'treePosition_ASC_NULLS_FIRST'
  | 'treePosition_DESC_NULLS_LAST'
  | 'commitmentType_ASC'
  | 'commitmentType_DESC'
  | 'commitmentType_ASC_NULLS_FIRST'
  | 'commitmentType_DESC_NULLS_LAST'
  | 'hash_ASC'
  | 'hash_DESC'
  | 'hash_ASC_NULLS_FIRST'
  | 'hash_DESC_NULLS_LAST'
  | 'ciphertext_id_ASC'
  | 'ciphertext_id_DESC'
  | 'ciphertext_id_ASC_NULLS_FIRST'
  | 'ciphertext_id_DESC_NULLS_LAST'
  | 'ciphertext_blindedSenderViewingKey_ASC'
  | 'ciphertext_blindedSenderViewingKey_DESC'
  | 'ciphertext_blindedSenderViewingKey_ASC_NULLS_FIRST'
  | 'ciphertext_blindedSenderViewingKey_DESC_NULLS_LAST'
  | 'ciphertext_blindedReceiverViewingKey_ASC'
  | 'ciphertext_blindedReceiverViewingKey_DESC'
  | 'ciphertext_blindedReceiverViewingKey_ASC_NULLS_FIRST'
  | 'ciphertext_blindedReceiverViewingKey_DESC_NULLS_LAST'
  | 'ciphertext_annotationData_ASC'
  | 'ciphertext_annotationData_DESC'
  | 'ciphertext_annotationData_ASC_NULLS_FIRST'
  | 'ciphertext_annotationData_DESC_NULLS_LAST'
  | 'ciphertext_memo_ASC'
  | 'ciphertext_memo_DESC'
  | 'ciphertext_memo_ASC_NULLS_FIRST'
  | 'ciphertext_memo_DESC_NULLS_LAST';

export type TransactCommitmentsConnection = {
  edges: Array<TransactCommitmentEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type TransactCommitmentEdge = {
  node: TransactCommitment;
  cursor: Scalars['String'];
};

export type Unshield = {
  id: Scalars['String'];
  blockNumber: Scalars['BigInt'];
  blockTimestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  to: Scalars['Bytes'];
  token: Token;
  amount: Scalars['BigInt'];
  fee: Scalars['BigInt'];
  eventLogIndex: Scalars['BigInt'];
};

export type UnshieldWhereInput = {
  id_isNull?: InputMaybe<Scalars['Boolean']>;
  id_eq?: InputMaybe<Scalars['String']>;
  id_not_eq?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_startsWith?: InputMaybe<Scalars['String']>;
  id_not_startsWith?: InputMaybe<Scalars['String']>;
  id_endsWith?: InputMaybe<Scalars['String']>;
  id_not_endsWith?: InputMaybe<Scalars['String']>;
  blockNumber_isNull?: InputMaybe<Scalars['Boolean']>;
  blockNumber_eq?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not_eq?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_isNull?: InputMaybe<Scalars['Boolean']>;
  blockTimestamp_eq?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_not_eq?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash_isNull?: InputMaybe<Scalars['Boolean']>;
  transactionHash_eq?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_eq?: InputMaybe<Scalars['Bytes']>;
  to_isNull?: InputMaybe<Scalars['Boolean']>;
  to_eq?: InputMaybe<Scalars['Bytes']>;
  to_not_eq?: InputMaybe<Scalars['Bytes']>;
  token_isNull?: InputMaybe<Scalars['Boolean']>;
  token?: InputMaybe<TokenWhereInput>;
  amount_isNull?: InputMaybe<Scalars['Boolean']>;
  amount_eq?: InputMaybe<Scalars['BigInt']>;
  amount_not_eq?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  fee_isNull?: InputMaybe<Scalars['Boolean']>;
  fee_eq?: InputMaybe<Scalars['BigInt']>;
  fee_not_eq?: InputMaybe<Scalars['BigInt']>;
  fee_gt?: InputMaybe<Scalars['BigInt']>;
  fee_gte?: InputMaybe<Scalars['BigInt']>;
  fee_lt?: InputMaybe<Scalars['BigInt']>;
  fee_lte?: InputMaybe<Scalars['BigInt']>;
  fee_in?: InputMaybe<Array<Scalars['BigInt']>>;
  fee_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  eventLogIndex_isNull?: InputMaybe<Scalars['Boolean']>;
  eventLogIndex_eq?: InputMaybe<Scalars['BigInt']>;
  eventLogIndex_not_eq?: InputMaybe<Scalars['BigInt']>;
  eventLogIndex_gt?: InputMaybe<Scalars['BigInt']>;
  eventLogIndex_gte?: InputMaybe<Scalars['BigInt']>;
  eventLogIndex_lt?: InputMaybe<Scalars['BigInt']>;
  eventLogIndex_lte?: InputMaybe<Scalars['BigInt']>;
  eventLogIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  eventLogIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  AND?: InputMaybe<Array<UnshieldWhereInput>>;
  OR?: InputMaybe<Array<UnshieldWhereInput>>;
};

export type UnshieldOrderByInput =
  | 'id_ASC'
  | 'id_DESC'
  | 'id_ASC_NULLS_FIRST'
  | 'id_DESC_NULLS_LAST'
  | 'blockNumber_ASC'
  | 'blockNumber_DESC'
  | 'blockNumber_ASC_NULLS_FIRST'
  | 'blockNumber_DESC_NULLS_LAST'
  | 'blockTimestamp_ASC'
  | 'blockTimestamp_DESC'
  | 'blockTimestamp_ASC_NULLS_FIRST'
  | 'blockTimestamp_DESC_NULLS_LAST'
  | 'transactionHash_ASC'
  | 'transactionHash_DESC'
  | 'transactionHash_ASC_NULLS_FIRST'
  | 'transactionHash_DESC_NULLS_LAST'
  | 'to_ASC'
  | 'to_DESC'
  | 'to_ASC_NULLS_FIRST'
  | 'to_DESC_NULLS_LAST'
  | 'token_id_ASC'
  | 'token_id_DESC'
  | 'token_id_ASC_NULLS_FIRST'
  | 'token_id_DESC_NULLS_LAST'
  | 'token_tokenType_ASC'
  | 'token_tokenType_DESC'
  | 'token_tokenType_ASC_NULLS_FIRST'
  | 'token_tokenType_DESC_NULLS_LAST'
  | 'token_tokenAddress_ASC'
  | 'token_tokenAddress_DESC'
  | 'token_tokenAddress_ASC_NULLS_FIRST'
  | 'token_tokenAddress_DESC_NULLS_LAST'
  | 'token_tokenSubID_ASC'
  | 'token_tokenSubID_DESC'
  | 'token_tokenSubID_ASC_NULLS_FIRST'
  | 'token_tokenSubID_DESC_NULLS_LAST'
  | 'amount_ASC'
  | 'amount_DESC'
  | 'amount_ASC_NULLS_FIRST'
  | 'amount_DESC_NULLS_LAST'
  | 'fee_ASC'
  | 'fee_DESC'
  | 'fee_ASC_NULLS_FIRST'
  | 'fee_DESC_NULLS_LAST'
  | 'eventLogIndex_ASC'
  | 'eventLogIndex_DESC'
  | 'eventLogIndex_ASC_NULLS_FIRST'
  | 'eventLogIndex_DESC_NULLS_LAST';

export type UnshieldsConnection = {
  edges: Array<UnshieldEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type UnshieldEdge = {
  node: Unshield;
  cursor: Scalars['String'];
};

export type Nullifier = {
  id: Scalars['String'];
  blockNumber: Scalars['BigInt'];
  blockTimestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  treeNumber: Scalars['Int'];
  nullifier: Scalars['Bytes'];
};

export type NullifierWhereInput = {
  id_isNull?: InputMaybe<Scalars['Boolean']>;
  id_eq?: InputMaybe<Scalars['String']>;
  id_not_eq?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_startsWith?: InputMaybe<Scalars['String']>;
  id_not_startsWith?: InputMaybe<Scalars['String']>;
  id_endsWith?: InputMaybe<Scalars['String']>;
  id_not_endsWith?: InputMaybe<Scalars['String']>;
  blockNumber_isNull?: InputMaybe<Scalars['Boolean']>;
  blockNumber_eq?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not_eq?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_isNull?: InputMaybe<Scalars['Boolean']>;
  blockTimestamp_eq?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_not_eq?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash_isNull?: InputMaybe<Scalars['Boolean']>;
  transactionHash_eq?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_eq?: InputMaybe<Scalars['Bytes']>;
  treeNumber_isNull?: InputMaybe<Scalars['Boolean']>;
  treeNumber_eq?: InputMaybe<Scalars['Int']>;
  treeNumber_not_eq?: InputMaybe<Scalars['Int']>;
  treeNumber_gt?: InputMaybe<Scalars['Int']>;
  treeNumber_gte?: InputMaybe<Scalars['Int']>;
  treeNumber_lt?: InputMaybe<Scalars['Int']>;
  treeNumber_lte?: InputMaybe<Scalars['Int']>;
  treeNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  treeNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  nullifier_isNull?: InputMaybe<Scalars['Boolean']>;
  nullifier_eq?: InputMaybe<Scalars['Bytes']>;
  nullifier_not_eq?: InputMaybe<Scalars['Bytes']>;
  AND?: InputMaybe<Array<NullifierWhereInput>>;
  OR?: InputMaybe<Array<NullifierWhereInput>>;
};

export type NullifierOrderByInput =
  | 'id_ASC'
  | 'id_DESC'
  | 'id_ASC_NULLS_FIRST'
  | 'id_DESC_NULLS_LAST'
  | 'blockNumber_ASC'
  | 'blockNumber_DESC'
  | 'blockNumber_ASC_NULLS_FIRST'
  | 'blockNumber_DESC_NULLS_LAST'
  | 'blockTimestamp_ASC'
  | 'blockTimestamp_DESC'
  | 'blockTimestamp_ASC_NULLS_FIRST'
  | 'blockTimestamp_DESC_NULLS_LAST'
  | 'transactionHash_ASC'
  | 'transactionHash_DESC'
  | 'transactionHash_ASC_NULLS_FIRST'
  | 'transactionHash_DESC_NULLS_LAST'
  | 'treeNumber_ASC'
  | 'treeNumber_DESC'
  | 'treeNumber_ASC_NULLS_FIRST'
  | 'treeNumber_DESC_NULLS_LAST'
  | 'nullifier_ASC'
  | 'nullifier_DESC'
  | 'nullifier_ASC_NULLS_FIRST'
  | 'nullifier_DESC_NULLS_LAST';

export type NullifiersConnection = {
  edges: Array<NullifierEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type NullifierEdge = {
  node: Nullifier;
  cursor: Scalars['String'];
};

export type Transaction = TransactionInterface & {
  id: Scalars['String'];
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
  id: Scalars['String'];
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

export type TransactionWhereInput = {
  id_isNull?: InputMaybe<Scalars['Boolean']>;
  id_eq?: InputMaybe<Scalars['String']>;
  id_not_eq?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_startsWith?: InputMaybe<Scalars['String']>;
  id_not_startsWith?: InputMaybe<Scalars['String']>;
  id_endsWith?: InputMaybe<Scalars['String']>;
  id_not_endsWith?: InputMaybe<Scalars['String']>;
  blockNumber_isNull?: InputMaybe<Scalars['Boolean']>;
  blockNumber_eq?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not_eq?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash_isNull?: InputMaybe<Scalars['Boolean']>;
  transactionHash_eq?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_eq?: InputMaybe<Scalars['Bytes']>;
  merkleRoot_isNull?: InputMaybe<Scalars['Boolean']>;
  merkleRoot_eq?: InputMaybe<Scalars['Bytes']>;
  merkleRoot_not_eq?: InputMaybe<Scalars['Bytes']>;
  nullifiers_isNull?: InputMaybe<Scalars['Boolean']>;
  nullifiers_containsAll?: InputMaybe<Array<Scalars['Bytes']>>;
  nullifiers_containsAny?: InputMaybe<Array<Scalars['Bytes']>>;
  nullifiers_containsNone?: InputMaybe<Array<Scalars['Bytes']>>;
  commitments_isNull?: InputMaybe<Scalars['Boolean']>;
  commitments_containsAll?: InputMaybe<Array<Scalars['Bytes']>>;
  commitments_containsAny?: InputMaybe<Array<Scalars['Bytes']>>;
  commitments_containsNone?: InputMaybe<Array<Scalars['Bytes']>>;
  boundParamsHash_isNull?: InputMaybe<Scalars['Boolean']>;
  boundParamsHash_eq?: InputMaybe<Scalars['Bytes']>;
  boundParamsHash_not_eq?: InputMaybe<Scalars['Bytes']>;
  hasUnshield_isNull?: InputMaybe<Scalars['Boolean']>;
  hasUnshield_eq?: InputMaybe<Scalars['Boolean']>;
  hasUnshield_not_eq?: InputMaybe<Scalars['Boolean']>;
  utxoTreeIn_isNull?: InputMaybe<Scalars['Boolean']>;
  utxoTreeIn_eq?: InputMaybe<Scalars['BigInt']>;
  utxoTreeIn_not_eq?: InputMaybe<Scalars['BigInt']>;
  utxoTreeIn_gt?: InputMaybe<Scalars['BigInt']>;
  utxoTreeIn_gte?: InputMaybe<Scalars['BigInt']>;
  utxoTreeIn_lt?: InputMaybe<Scalars['BigInt']>;
  utxoTreeIn_lte?: InputMaybe<Scalars['BigInt']>;
  utxoTreeIn_in?: InputMaybe<Array<Scalars['BigInt']>>;
  utxoTreeIn_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  utxoTreeOut_isNull?: InputMaybe<Scalars['Boolean']>;
  utxoTreeOut_eq?: InputMaybe<Scalars['BigInt']>;
  utxoTreeOut_not_eq?: InputMaybe<Scalars['BigInt']>;
  utxoTreeOut_gt?: InputMaybe<Scalars['BigInt']>;
  utxoTreeOut_gte?: InputMaybe<Scalars['BigInt']>;
  utxoTreeOut_lt?: InputMaybe<Scalars['BigInt']>;
  utxoTreeOut_lte?: InputMaybe<Scalars['BigInt']>;
  utxoTreeOut_in?: InputMaybe<Array<Scalars['BigInt']>>;
  utxoTreeOut_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  utxoBatchStartPositionOut_isNull?: InputMaybe<Scalars['Boolean']>;
  utxoBatchStartPositionOut_eq?: InputMaybe<Scalars['BigInt']>;
  utxoBatchStartPositionOut_not_eq?: InputMaybe<Scalars['BigInt']>;
  utxoBatchStartPositionOut_gt?: InputMaybe<Scalars['BigInt']>;
  utxoBatchStartPositionOut_gte?: InputMaybe<Scalars['BigInt']>;
  utxoBatchStartPositionOut_lt?: InputMaybe<Scalars['BigInt']>;
  utxoBatchStartPositionOut_lte?: InputMaybe<Scalars['BigInt']>;
  utxoBatchStartPositionOut_in?: InputMaybe<Array<Scalars['BigInt']>>;
  utxoBatchStartPositionOut_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  unshieldToken_isNull?: InputMaybe<Scalars['Boolean']>;
  unshieldToken?: InputMaybe<TokenWhereInput>;
  unshieldToAddress_isNull?: InputMaybe<Scalars['Boolean']>;
  unshieldToAddress_eq?: InputMaybe<Scalars['Bytes']>;
  unshieldToAddress_not_eq?: InputMaybe<Scalars['Bytes']>;
  unshieldValue_isNull?: InputMaybe<Scalars['Boolean']>;
  unshieldValue_eq?: InputMaybe<Scalars['BigInt']>;
  unshieldValue_not_eq?: InputMaybe<Scalars['BigInt']>;
  unshieldValue_gt?: InputMaybe<Scalars['BigInt']>;
  unshieldValue_gte?: InputMaybe<Scalars['BigInt']>;
  unshieldValue_lt?: InputMaybe<Scalars['BigInt']>;
  unshieldValue_lte?: InputMaybe<Scalars['BigInt']>;
  unshieldValue_in?: InputMaybe<Array<Scalars['BigInt']>>;
  unshieldValue_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_isNull?: InputMaybe<Scalars['Boolean']>;
  blockTimestamp_eq?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_not_eq?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  verificationHash_isNull?: InputMaybe<Scalars['Boolean']>;
  verificationHash_eq?: InputMaybe<Scalars['Bytes']>;
  verificationHash_not_eq?: InputMaybe<Scalars['Bytes']>;
  AND?: InputMaybe<Array<TransactionWhereInput>>;
  OR?: InputMaybe<Array<TransactionWhereInput>>;
};

export type TransactionOrderByInput =
  | 'id_ASC'
  | 'id_DESC'
  | 'id_ASC_NULLS_FIRST'
  | 'id_DESC_NULLS_LAST'
  | 'blockNumber_ASC'
  | 'blockNumber_DESC'
  | 'blockNumber_ASC_NULLS_FIRST'
  | 'blockNumber_DESC_NULLS_LAST'
  | 'transactionHash_ASC'
  | 'transactionHash_DESC'
  | 'transactionHash_ASC_NULLS_FIRST'
  | 'transactionHash_DESC_NULLS_LAST'
  | 'merkleRoot_ASC'
  | 'merkleRoot_DESC'
  | 'merkleRoot_ASC_NULLS_FIRST'
  | 'merkleRoot_DESC_NULLS_LAST'
  | 'boundParamsHash_ASC'
  | 'boundParamsHash_DESC'
  | 'boundParamsHash_ASC_NULLS_FIRST'
  | 'boundParamsHash_DESC_NULLS_LAST'
  | 'hasUnshield_ASC'
  | 'hasUnshield_DESC'
  | 'hasUnshield_ASC_NULLS_FIRST'
  | 'hasUnshield_DESC_NULLS_LAST'
  | 'utxoTreeIn_ASC'
  | 'utxoTreeIn_DESC'
  | 'utxoTreeIn_ASC_NULLS_FIRST'
  | 'utxoTreeIn_DESC_NULLS_LAST'
  | 'utxoTreeOut_ASC'
  | 'utxoTreeOut_DESC'
  | 'utxoTreeOut_ASC_NULLS_FIRST'
  | 'utxoTreeOut_DESC_NULLS_LAST'
  | 'utxoBatchStartPositionOut_ASC'
  | 'utxoBatchStartPositionOut_DESC'
  | 'utxoBatchStartPositionOut_ASC_NULLS_FIRST'
  | 'utxoBatchStartPositionOut_DESC_NULLS_LAST'
  | 'unshieldToken_id_ASC'
  | 'unshieldToken_id_DESC'
  | 'unshieldToken_id_ASC_NULLS_FIRST'
  | 'unshieldToken_id_DESC_NULLS_LAST'
  | 'unshieldToken_tokenType_ASC'
  | 'unshieldToken_tokenType_DESC'
  | 'unshieldToken_tokenType_ASC_NULLS_FIRST'
  | 'unshieldToken_tokenType_DESC_NULLS_LAST'
  | 'unshieldToken_tokenAddress_ASC'
  | 'unshieldToken_tokenAddress_DESC'
  | 'unshieldToken_tokenAddress_ASC_NULLS_FIRST'
  | 'unshieldToken_tokenAddress_DESC_NULLS_LAST'
  | 'unshieldToken_tokenSubID_ASC'
  | 'unshieldToken_tokenSubID_DESC'
  | 'unshieldToken_tokenSubID_ASC_NULLS_FIRST'
  | 'unshieldToken_tokenSubID_DESC_NULLS_LAST'
  | 'unshieldToAddress_ASC'
  | 'unshieldToAddress_DESC'
  | 'unshieldToAddress_ASC_NULLS_FIRST'
  | 'unshieldToAddress_DESC_NULLS_LAST'
  | 'unshieldValue_ASC'
  | 'unshieldValue_DESC'
  | 'unshieldValue_ASC_NULLS_FIRST'
  | 'unshieldValue_DESC_NULLS_LAST'
  | 'blockTimestamp_ASC'
  | 'blockTimestamp_DESC'
  | 'blockTimestamp_ASC_NULLS_FIRST'
  | 'blockTimestamp_DESC_NULLS_LAST'
  | 'verificationHash_ASC'
  | 'verificationHash_DESC'
  | 'verificationHash_ASC_NULLS_FIRST'
  | 'verificationHash_DESC_NULLS_LAST';

export type TransactionsConnection = {
  edges: Array<TransactionEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type TransactionEdge = {
  node: Transaction;
  cursor: Scalars['String'];
};

export type VerificationHash = {
  id: Scalars['String'];
  verificationHash: Scalars['Bytes'];
};

export type VerificationHashWhereInput = {
  id_isNull?: InputMaybe<Scalars['Boolean']>;
  id_eq?: InputMaybe<Scalars['String']>;
  id_not_eq?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_startsWith?: InputMaybe<Scalars['String']>;
  id_not_startsWith?: InputMaybe<Scalars['String']>;
  id_endsWith?: InputMaybe<Scalars['String']>;
  id_not_endsWith?: InputMaybe<Scalars['String']>;
  verificationHash_isNull?: InputMaybe<Scalars['Boolean']>;
  verificationHash_eq?: InputMaybe<Scalars['Bytes']>;
  verificationHash_not_eq?: InputMaybe<Scalars['Bytes']>;
  AND?: InputMaybe<Array<VerificationHashWhereInput>>;
  OR?: InputMaybe<Array<VerificationHashWhereInput>>;
};

export type VerificationHashOrderByInput =
  | 'id_ASC'
  | 'id_DESC'
  | 'id_ASC_NULLS_FIRST'
  | 'id_DESC_NULLS_LAST'
  | 'verificationHash_ASC'
  | 'verificationHash_DESC'
  | 'verificationHash_ASC_NULLS_FIRST'
  | 'verificationHash_DESC_NULLS_LAST';

export type VerificationHashesConnection = {
  edges: Array<VerificationHashEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type VerificationHashEdge = {
  node: VerificationHash;
  cursor: Scalars['String'];
};

export type CommitmentBatchEventNew = {
  id: Scalars['String'];
  treeNumber: Scalars['BigInt'];
  batchStartTreePosition: Scalars['BigInt'];
};

export type CommitmentBatchEventNewWhereInput = {
  id_isNull?: InputMaybe<Scalars['Boolean']>;
  id_eq?: InputMaybe<Scalars['String']>;
  id_not_eq?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_not_containsInsensitive?: InputMaybe<Scalars['String']>;
  id_startsWith?: InputMaybe<Scalars['String']>;
  id_not_startsWith?: InputMaybe<Scalars['String']>;
  id_endsWith?: InputMaybe<Scalars['String']>;
  id_not_endsWith?: InputMaybe<Scalars['String']>;
  treeNumber_isNull?: InputMaybe<Scalars['Boolean']>;
  treeNumber_eq?: InputMaybe<Scalars['BigInt']>;
  treeNumber_not_eq?: InputMaybe<Scalars['BigInt']>;
  treeNumber_gt?: InputMaybe<Scalars['BigInt']>;
  treeNumber_gte?: InputMaybe<Scalars['BigInt']>;
  treeNumber_lt?: InputMaybe<Scalars['BigInt']>;
  treeNumber_lte?: InputMaybe<Scalars['BigInt']>;
  treeNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  treeNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  batchStartTreePosition_isNull?: InputMaybe<Scalars['Boolean']>;
  batchStartTreePosition_eq?: InputMaybe<Scalars['BigInt']>;
  batchStartTreePosition_not_eq?: InputMaybe<Scalars['BigInt']>;
  batchStartTreePosition_gt?: InputMaybe<Scalars['BigInt']>;
  batchStartTreePosition_gte?: InputMaybe<Scalars['BigInt']>;
  batchStartTreePosition_lt?: InputMaybe<Scalars['BigInt']>;
  batchStartTreePosition_lte?: InputMaybe<Scalars['BigInt']>;
  batchStartTreePosition_in?: InputMaybe<Array<Scalars['BigInt']>>;
  batchStartTreePosition_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  AND?: InputMaybe<Array<CommitmentBatchEventNewWhereInput>>;
  OR?: InputMaybe<Array<CommitmentBatchEventNewWhereInput>>;
};

export type CommitmentBatchEventNewOrderByInput =
  | 'id_ASC'
  | 'id_DESC'
  | 'id_ASC_NULLS_FIRST'
  | 'id_DESC_NULLS_LAST'
  | 'treeNumber_ASC'
  | 'treeNumber_DESC'
  | 'treeNumber_ASC_NULLS_FIRST'
  | 'treeNumber_DESC_NULLS_LAST'
  | 'batchStartTreePosition_ASC'
  | 'batchStartTreePosition_DESC'
  | 'batchStartTreePosition_ASC_NULLS_FIRST'
  | 'batchStartTreePosition_DESC_NULLS_LAST';

export type CommitmentBatchEventNewsConnection = {
  edges: Array<CommitmentBatchEventNewEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type CommitmentBatchEventNewEdge = {
  node: CommitmentBatchEventNew;
  cursor: Scalars['String'];
};

export type SquidStatus = {
  /** The height of the processed part of the chain */
  height?: Maybe<Scalars['Int']>;
};

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
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Query: ResolverTypeWrapper<{}>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Token: ResolverTypeWrapper<Token>;
  TokenType: TokenType;
  Bytes: ResolverTypeWrapper<Scalars['Bytes']>;
  TokenWhereInput: TokenWhereInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  TokenOrderByInput: TokenOrderByInput;
  WhereIdInput: WhereIdInput;
  TokensConnection: ResolverTypeWrapper<TokensConnection>;
  TokenEdge: ResolverTypeWrapper<TokenEdge>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  CommitmentPreimage: ResolverTypeWrapper<CommitmentPreimage>;
  BigInt: ResolverTypeWrapper<Scalars['BigInt']>;
  CommitmentPreimageWhereInput: CommitmentPreimageWhereInput;
  CommitmentPreimageOrderByInput: CommitmentPreimageOrderByInput;
  CommitmentPreimagesConnection: ResolverTypeWrapper<CommitmentPreimagesConnection>;
  CommitmentPreimageEdge: ResolverTypeWrapper<CommitmentPreimageEdge>;
  Ciphertext: ResolverTypeWrapper<Ciphertext>;
  CiphertextWhereInput: CiphertextWhereInput;
  CiphertextOrderByInput: CiphertextOrderByInput;
  CiphertextsConnection: ResolverTypeWrapper<CiphertextsConnection>;
  CiphertextEdge: ResolverTypeWrapper<CiphertextEdge>;
  LegacyCommitmentCiphertext: ResolverTypeWrapper<LegacyCommitmentCiphertext>;
  LegacyCommitmentCiphertextWhereInput: LegacyCommitmentCiphertextWhereInput;
  LegacyCommitmentCiphertextOrderByInput: LegacyCommitmentCiphertextOrderByInput;
  LegacyCommitmentCiphertextsConnection: ResolverTypeWrapper<LegacyCommitmentCiphertextsConnection>;
  LegacyCommitmentCiphertextEdge: ResolverTypeWrapper<LegacyCommitmentCiphertextEdge>;
  CommitmentCiphertext: ResolverTypeWrapper<CommitmentCiphertext>;
  CommitmentCiphertextWhereInput: CommitmentCiphertextWhereInput;
  CommitmentCiphertextOrderByInput: CommitmentCiphertextOrderByInput;
  CommitmentCiphertextsConnection: ResolverTypeWrapper<CommitmentCiphertextsConnection>;
  CommitmentCiphertextEdge: ResolverTypeWrapper<CommitmentCiphertextEdge>;
  LegacyGeneratedCommitment: ResolverTypeWrapper<LegacyGeneratedCommitment>;
  Commitment: ResolversTypes['LegacyGeneratedCommitment'] | ResolversTypes['LegacyEncryptedCommitment'] | ResolversTypes['ShieldCommitment'] | ResolversTypes['TransactCommitment'];
  CommitmentType: CommitmentType;
  LegacyGeneratedCommitmentWhereInput: LegacyGeneratedCommitmentWhereInput;
  LegacyGeneratedCommitmentOrderByInput: LegacyGeneratedCommitmentOrderByInput;
  LegacyGeneratedCommitmentsConnection: ResolverTypeWrapper<LegacyGeneratedCommitmentsConnection>;
  LegacyGeneratedCommitmentEdge: ResolverTypeWrapper<LegacyGeneratedCommitmentEdge>;
  CommitmentWhereInput: CommitmentWhereInput;
  CommitmentOrderByInput: CommitmentOrderByInput;
  CommitmentsConnection: ResolverTypeWrapper<CommitmentsConnection>;
  CommitmentEdge: ResolverTypeWrapper<CommitmentEdge>;
  LegacyEncryptedCommitment: ResolverTypeWrapper<LegacyEncryptedCommitment>;
  LegacyEncryptedCommitmentWhereInput: LegacyEncryptedCommitmentWhereInput;
  LegacyEncryptedCommitmentOrderByInput: LegacyEncryptedCommitmentOrderByInput;
  LegacyEncryptedCommitmentsConnection: ResolverTypeWrapper<LegacyEncryptedCommitmentsConnection>;
  LegacyEncryptedCommitmentEdge: ResolverTypeWrapper<LegacyEncryptedCommitmentEdge>;
  ShieldCommitment: ResolverTypeWrapper<ShieldCommitment>;
  ShieldCommitmentWhereInput: ShieldCommitmentWhereInput;
  ShieldCommitmentOrderByInput: ShieldCommitmentOrderByInput;
  ShieldCommitmentsConnection: ResolverTypeWrapper<ShieldCommitmentsConnection>;
  ShieldCommitmentEdge: ResolverTypeWrapper<ShieldCommitmentEdge>;
  TransactCommitment: ResolverTypeWrapper<TransactCommitment>;
  TransactCommitmentWhereInput: TransactCommitmentWhereInput;
  TransactCommitmentOrderByInput: TransactCommitmentOrderByInput;
  TransactCommitmentsConnection: ResolverTypeWrapper<TransactCommitmentsConnection>;
  TransactCommitmentEdge: ResolverTypeWrapper<TransactCommitmentEdge>;
  Unshield: ResolverTypeWrapper<Unshield>;
  UnshieldWhereInput: UnshieldWhereInput;
  UnshieldOrderByInput: UnshieldOrderByInput;
  UnshieldsConnection: ResolverTypeWrapper<UnshieldsConnection>;
  UnshieldEdge: ResolverTypeWrapper<UnshieldEdge>;
  Nullifier: ResolverTypeWrapper<Nullifier>;
  NullifierWhereInput: NullifierWhereInput;
  NullifierOrderByInput: NullifierOrderByInput;
  NullifiersConnection: ResolverTypeWrapper<NullifiersConnection>;
  NullifierEdge: ResolverTypeWrapper<NullifierEdge>;
  Transaction: ResolverTypeWrapper<Transaction>;
  TransactionInterface: ResolversTypes['Transaction'];
  TransactionWhereInput: TransactionWhereInput;
  TransactionOrderByInput: TransactionOrderByInput;
  TransactionsConnection: ResolverTypeWrapper<TransactionsConnection>;
  TransactionEdge: ResolverTypeWrapper<TransactionEdge>;
  VerificationHash: ResolverTypeWrapper<VerificationHash>;
  VerificationHashWhereInput: VerificationHashWhereInput;
  VerificationHashOrderByInput: VerificationHashOrderByInput;
  VerificationHashesConnection: ResolverTypeWrapper<VerificationHashesConnection>;
  VerificationHashEdge: ResolverTypeWrapper<VerificationHashEdge>;
  CommitmentBatchEventNew: ResolverTypeWrapper<CommitmentBatchEventNew>;
  CommitmentBatchEventNewWhereInput: CommitmentBatchEventNewWhereInput;
  CommitmentBatchEventNewOrderByInput: CommitmentBatchEventNewOrderByInput;
  CommitmentBatchEventNewsConnection: ResolverTypeWrapper<CommitmentBatchEventNewsConnection>;
  CommitmentBatchEventNewEdge: ResolverTypeWrapper<CommitmentBatchEventNewEdge>;
  SquidStatus: ResolverTypeWrapper<SquidStatus>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Query: {};
  Int: Scalars['Int'];
  String: Scalars['String'];
  Token: Token;
  Bytes: Scalars['Bytes'];
  TokenWhereInput: TokenWhereInput;
  Boolean: Scalars['Boolean'];
  WhereIdInput: WhereIdInput;
  TokensConnection: TokensConnection;
  TokenEdge: TokenEdge;
  PageInfo: PageInfo;
  CommitmentPreimage: CommitmentPreimage;
  BigInt: Scalars['BigInt'];
  CommitmentPreimageWhereInput: CommitmentPreimageWhereInput;
  CommitmentPreimagesConnection: CommitmentPreimagesConnection;
  CommitmentPreimageEdge: CommitmentPreimageEdge;
  Ciphertext: Ciphertext;
  CiphertextWhereInput: CiphertextWhereInput;
  CiphertextsConnection: CiphertextsConnection;
  CiphertextEdge: CiphertextEdge;
  LegacyCommitmentCiphertext: LegacyCommitmentCiphertext;
  LegacyCommitmentCiphertextWhereInput: LegacyCommitmentCiphertextWhereInput;
  LegacyCommitmentCiphertextsConnection: LegacyCommitmentCiphertextsConnection;
  LegacyCommitmentCiphertextEdge: LegacyCommitmentCiphertextEdge;
  CommitmentCiphertext: CommitmentCiphertext;
  CommitmentCiphertextWhereInput: CommitmentCiphertextWhereInput;
  CommitmentCiphertextsConnection: CommitmentCiphertextsConnection;
  CommitmentCiphertextEdge: CommitmentCiphertextEdge;
  LegacyGeneratedCommitment: LegacyGeneratedCommitment;
  Commitment: ResolversParentTypes['LegacyGeneratedCommitment'] | ResolversParentTypes['LegacyEncryptedCommitment'] | ResolversParentTypes['ShieldCommitment'] | ResolversParentTypes['TransactCommitment'];
  LegacyGeneratedCommitmentWhereInput: LegacyGeneratedCommitmentWhereInput;
  LegacyGeneratedCommitmentsConnection: LegacyGeneratedCommitmentsConnection;
  LegacyGeneratedCommitmentEdge: LegacyGeneratedCommitmentEdge;
  CommitmentWhereInput: CommitmentWhereInput;
  CommitmentsConnection: CommitmentsConnection;
  CommitmentEdge: CommitmentEdge;
  LegacyEncryptedCommitment: LegacyEncryptedCommitment;
  LegacyEncryptedCommitmentWhereInput: LegacyEncryptedCommitmentWhereInput;
  LegacyEncryptedCommitmentsConnection: LegacyEncryptedCommitmentsConnection;
  LegacyEncryptedCommitmentEdge: LegacyEncryptedCommitmentEdge;
  ShieldCommitment: ShieldCommitment;
  ShieldCommitmentWhereInput: ShieldCommitmentWhereInput;
  ShieldCommitmentsConnection: ShieldCommitmentsConnection;
  ShieldCommitmentEdge: ShieldCommitmentEdge;
  TransactCommitment: TransactCommitment;
  TransactCommitmentWhereInput: TransactCommitmentWhereInput;
  TransactCommitmentsConnection: TransactCommitmentsConnection;
  TransactCommitmentEdge: TransactCommitmentEdge;
  Unshield: Unshield;
  UnshieldWhereInput: UnshieldWhereInput;
  UnshieldsConnection: UnshieldsConnection;
  UnshieldEdge: UnshieldEdge;
  Nullifier: Nullifier;
  NullifierWhereInput: NullifierWhereInput;
  NullifiersConnection: NullifiersConnection;
  NullifierEdge: NullifierEdge;
  Transaction: Transaction;
  TransactionInterface: ResolversParentTypes['Transaction'];
  TransactionWhereInput: TransactionWhereInput;
  TransactionsConnection: TransactionsConnection;
  TransactionEdge: TransactionEdge;
  VerificationHash: VerificationHash;
  VerificationHashWhereInput: VerificationHashWhereInput;
  VerificationHashesConnection: VerificationHashesConnection;
  VerificationHashEdge: VerificationHashEdge;
  CommitmentBatchEventNew: CommitmentBatchEventNew;
  CommitmentBatchEventNewWhereInput: CommitmentBatchEventNewWhereInput;
  CommitmentBatchEventNewsConnection: CommitmentBatchEventNewsConnection;
  CommitmentBatchEventNewEdge: CommitmentBatchEventNewEdge;
  SquidStatus: SquidStatus;
}>;

export type QueryResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  tokens?: Resolver<Array<ResolversTypes['Token']>, ParentType, ContextType, Partial<QuerytokensArgs>>;
  tokenById?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType, RequireFields<QuerytokenByIdArgs, 'id'>>;
  tokenByUniqueInput?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType, RequireFields<QuerytokenByUniqueInputArgs, 'where'>>;
  tokensConnection?: Resolver<ResolversTypes['TokensConnection'], ParentType, ContextType, RequireFields<QuerytokensConnectionArgs, 'orderBy'>>;
  commitmentPreimages?: Resolver<Array<ResolversTypes['CommitmentPreimage']>, ParentType, ContextType, Partial<QuerycommitmentPreimagesArgs>>;
  commitmentPreimageById?: Resolver<Maybe<ResolversTypes['CommitmentPreimage']>, ParentType, ContextType, RequireFields<QuerycommitmentPreimageByIdArgs, 'id'>>;
  commitmentPreimageByUniqueInput?: Resolver<Maybe<ResolversTypes['CommitmentPreimage']>, ParentType, ContextType, RequireFields<QuerycommitmentPreimageByUniqueInputArgs, 'where'>>;
  commitmentPreimagesConnection?: Resolver<ResolversTypes['CommitmentPreimagesConnection'], ParentType, ContextType, RequireFields<QuerycommitmentPreimagesConnectionArgs, 'orderBy'>>;
  ciphertexts?: Resolver<Array<ResolversTypes['Ciphertext']>, ParentType, ContextType, Partial<QueryciphertextsArgs>>;
  ciphertextById?: Resolver<Maybe<ResolversTypes['Ciphertext']>, ParentType, ContextType, RequireFields<QueryciphertextByIdArgs, 'id'>>;
  ciphertextByUniqueInput?: Resolver<Maybe<ResolversTypes['Ciphertext']>, ParentType, ContextType, RequireFields<QueryciphertextByUniqueInputArgs, 'where'>>;
  ciphertextsConnection?: Resolver<ResolversTypes['CiphertextsConnection'], ParentType, ContextType, RequireFields<QueryciphertextsConnectionArgs, 'orderBy'>>;
  legacyCommitmentCiphertexts?: Resolver<Array<ResolversTypes['LegacyCommitmentCiphertext']>, ParentType, ContextType, Partial<QuerylegacyCommitmentCiphertextsArgs>>;
  legacyCommitmentCiphertextById?: Resolver<Maybe<ResolversTypes['LegacyCommitmentCiphertext']>, ParentType, ContextType, RequireFields<QuerylegacyCommitmentCiphertextByIdArgs, 'id'>>;
  legacyCommitmentCiphertextByUniqueInput?: Resolver<Maybe<ResolversTypes['LegacyCommitmentCiphertext']>, ParentType, ContextType, RequireFields<QuerylegacyCommitmentCiphertextByUniqueInputArgs, 'where'>>;
  legacyCommitmentCiphertextsConnection?: Resolver<ResolversTypes['LegacyCommitmentCiphertextsConnection'], ParentType, ContextType, RequireFields<QuerylegacyCommitmentCiphertextsConnectionArgs, 'orderBy'>>;
  commitmentCiphertexts?: Resolver<Array<ResolversTypes['CommitmentCiphertext']>, ParentType, ContextType, Partial<QuerycommitmentCiphertextsArgs>>;
  commitmentCiphertextById?: Resolver<Maybe<ResolversTypes['CommitmentCiphertext']>, ParentType, ContextType, RequireFields<QuerycommitmentCiphertextByIdArgs, 'id'>>;
  commitmentCiphertextByUniqueInput?: Resolver<Maybe<ResolversTypes['CommitmentCiphertext']>, ParentType, ContextType, RequireFields<QuerycommitmentCiphertextByUniqueInputArgs, 'where'>>;
  commitmentCiphertextsConnection?: Resolver<ResolversTypes['CommitmentCiphertextsConnection'], ParentType, ContextType, RequireFields<QuerycommitmentCiphertextsConnectionArgs, 'orderBy'>>;
  legacyGeneratedCommitments?: Resolver<Array<ResolversTypes['LegacyGeneratedCommitment']>, ParentType, ContextType, Partial<QuerylegacyGeneratedCommitmentsArgs>>;
  legacyGeneratedCommitmentById?: Resolver<Maybe<ResolversTypes['LegacyGeneratedCommitment']>, ParentType, ContextType, RequireFields<QuerylegacyGeneratedCommitmentByIdArgs, 'id'>>;
  legacyGeneratedCommitmentByUniqueInput?: Resolver<Maybe<ResolversTypes['LegacyGeneratedCommitment']>, ParentType, ContextType, RequireFields<QuerylegacyGeneratedCommitmentByUniqueInputArgs, 'where'>>;
  legacyGeneratedCommitmentsConnection?: Resolver<ResolversTypes['LegacyGeneratedCommitmentsConnection'], ParentType, ContextType, RequireFields<QuerylegacyGeneratedCommitmentsConnectionArgs, 'orderBy'>>;
  commitments?: Resolver<Array<ResolversTypes['Commitment']>, ParentType, ContextType, Partial<QuerycommitmentsArgs>>;
  commitmentsConnection?: Resolver<ResolversTypes['CommitmentsConnection'], ParentType, ContextType, RequireFields<QuerycommitmentsConnectionArgs, 'orderBy'>>;
  legacyEncryptedCommitments?: Resolver<Array<ResolversTypes['LegacyEncryptedCommitment']>, ParentType, ContextType, Partial<QuerylegacyEncryptedCommitmentsArgs>>;
  legacyEncryptedCommitmentById?: Resolver<Maybe<ResolversTypes['LegacyEncryptedCommitment']>, ParentType, ContextType, RequireFields<QuerylegacyEncryptedCommitmentByIdArgs, 'id'>>;
  legacyEncryptedCommitmentByUniqueInput?: Resolver<Maybe<ResolversTypes['LegacyEncryptedCommitment']>, ParentType, ContextType, RequireFields<QuerylegacyEncryptedCommitmentByUniqueInputArgs, 'where'>>;
  legacyEncryptedCommitmentsConnection?: Resolver<ResolversTypes['LegacyEncryptedCommitmentsConnection'], ParentType, ContextType, RequireFields<QuerylegacyEncryptedCommitmentsConnectionArgs, 'orderBy'>>;
  shieldCommitments?: Resolver<Array<ResolversTypes['ShieldCommitment']>, ParentType, ContextType, Partial<QueryshieldCommitmentsArgs>>;
  shieldCommitmentById?: Resolver<Maybe<ResolversTypes['ShieldCommitment']>, ParentType, ContextType, RequireFields<QueryshieldCommitmentByIdArgs, 'id'>>;
  shieldCommitmentByUniqueInput?: Resolver<Maybe<ResolversTypes['ShieldCommitment']>, ParentType, ContextType, RequireFields<QueryshieldCommitmentByUniqueInputArgs, 'where'>>;
  shieldCommitmentsConnection?: Resolver<ResolversTypes['ShieldCommitmentsConnection'], ParentType, ContextType, RequireFields<QueryshieldCommitmentsConnectionArgs, 'orderBy'>>;
  transactCommitments?: Resolver<Array<ResolversTypes['TransactCommitment']>, ParentType, ContextType, Partial<QuerytransactCommitmentsArgs>>;
  transactCommitmentById?: Resolver<Maybe<ResolversTypes['TransactCommitment']>, ParentType, ContextType, RequireFields<QuerytransactCommitmentByIdArgs, 'id'>>;
  transactCommitmentByUniqueInput?: Resolver<Maybe<ResolversTypes['TransactCommitment']>, ParentType, ContextType, RequireFields<QuerytransactCommitmentByUniqueInputArgs, 'where'>>;
  transactCommitmentsConnection?: Resolver<ResolversTypes['TransactCommitmentsConnection'], ParentType, ContextType, RequireFields<QuerytransactCommitmentsConnectionArgs, 'orderBy'>>;
  unshields?: Resolver<Array<ResolversTypes['Unshield']>, ParentType, ContextType, Partial<QueryunshieldsArgs>>;
  unshieldById?: Resolver<Maybe<ResolversTypes['Unshield']>, ParentType, ContextType, RequireFields<QueryunshieldByIdArgs, 'id'>>;
  unshieldByUniqueInput?: Resolver<Maybe<ResolversTypes['Unshield']>, ParentType, ContextType, RequireFields<QueryunshieldByUniqueInputArgs, 'where'>>;
  unshieldsConnection?: Resolver<ResolversTypes['UnshieldsConnection'], ParentType, ContextType, RequireFields<QueryunshieldsConnectionArgs, 'orderBy'>>;
  nullifiers?: Resolver<Array<ResolversTypes['Nullifier']>, ParentType, ContextType, Partial<QuerynullifiersArgs>>;
  nullifierById?: Resolver<Maybe<ResolversTypes['Nullifier']>, ParentType, ContextType, RequireFields<QuerynullifierByIdArgs, 'id'>>;
  nullifierByUniqueInput?: Resolver<Maybe<ResolversTypes['Nullifier']>, ParentType, ContextType, RequireFields<QuerynullifierByUniqueInputArgs, 'where'>>;
  nullifiersConnection?: Resolver<ResolversTypes['NullifiersConnection'], ParentType, ContextType, RequireFields<QuerynullifiersConnectionArgs, 'orderBy'>>;
  transactions?: Resolver<Array<ResolversTypes['Transaction']>, ParentType, ContextType, Partial<QuerytransactionsArgs>>;
  transactionById?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType, RequireFields<QuerytransactionByIdArgs, 'id'>>;
  transactionByUniqueInput?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType, RequireFields<QuerytransactionByUniqueInputArgs, 'where'>>;
  transactionsConnection?: Resolver<ResolversTypes['TransactionsConnection'], ParentType, ContextType, RequireFields<QuerytransactionsConnectionArgs, 'orderBy'>>;
  verificationHashes?: Resolver<Array<ResolversTypes['VerificationHash']>, ParentType, ContextType, Partial<QueryverificationHashesArgs>>;
  verificationHashById?: Resolver<Maybe<ResolversTypes['VerificationHash']>, ParentType, ContextType, RequireFields<QueryverificationHashByIdArgs, 'id'>>;
  verificationHashByUniqueInput?: Resolver<Maybe<ResolversTypes['VerificationHash']>, ParentType, ContextType, RequireFields<QueryverificationHashByUniqueInputArgs, 'where'>>;
  verificationHashesConnection?: Resolver<ResolversTypes['VerificationHashesConnection'], ParentType, ContextType, RequireFields<QueryverificationHashesConnectionArgs, 'orderBy'>>;
  commitmentBatchEventNews?: Resolver<Array<ResolversTypes['CommitmentBatchEventNew']>, ParentType, ContextType, Partial<QuerycommitmentBatchEventNewsArgs>>;
  commitmentBatchEventNewById?: Resolver<Maybe<ResolversTypes['CommitmentBatchEventNew']>, ParentType, ContextType, RequireFields<QuerycommitmentBatchEventNewByIdArgs, 'id'>>;
  commitmentBatchEventNewByUniqueInput?: Resolver<Maybe<ResolversTypes['CommitmentBatchEventNew']>, ParentType, ContextType, RequireFields<QuerycommitmentBatchEventNewByUniqueInputArgs, 'where'>>;
  commitmentBatchEventNewsConnection?: Resolver<ResolversTypes['CommitmentBatchEventNewsConnection'], ParentType, ContextType, RequireFields<QuerycommitmentBatchEventNewsConnectionArgs, 'orderBy'>>;
  squidStatus?: Resolver<Maybe<ResolversTypes['SquidStatus']>, ParentType, ContextType>;
}>;

export type TokenResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Token'] = ResolversParentTypes['Token']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tokenType?: Resolver<ResolversTypes['TokenType'], ParentType, ContextType>;
  tokenAddress?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  tokenSubID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface BytesScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Bytes'], any> {
  name: 'Bytes';
}

export type TokensConnectionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['TokensConnection'] = ResolversParentTypes['TokensConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['TokenEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TokenEdgeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['TokenEdge'] = ResolversParentTypes['TokenEdge']> = ResolversObject<{
  node?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PageInfoResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = ResolversObject<{
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endCursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommitmentPreimageResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['CommitmentPreimage'] = ResolversParentTypes['CommitmentPreimage']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  npk?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface BigIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigInt'], any> {
  name: 'BigInt';
}

export type CommitmentPreimagesConnectionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['CommitmentPreimagesConnection'] = ResolversParentTypes['CommitmentPreimagesConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['CommitmentPreimageEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommitmentPreimageEdgeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['CommitmentPreimageEdge'] = ResolversParentTypes['CommitmentPreimageEdge']> = ResolversObject<{
  node?: Resolver<ResolversTypes['CommitmentPreimage'], ParentType, ContextType>;
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CiphertextResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Ciphertext'] = ResolversParentTypes['Ciphertext']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  iv?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  tag?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  data?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CiphertextsConnectionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['CiphertextsConnection'] = ResolversParentTypes['CiphertextsConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['CiphertextEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CiphertextEdgeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['CiphertextEdge'] = ResolversParentTypes['CiphertextEdge']> = ResolversObject<{
  node?: Resolver<ResolversTypes['Ciphertext'], ParentType, ContextType>;
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LegacyCommitmentCiphertextResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['LegacyCommitmentCiphertext'] = ResolversParentTypes['LegacyCommitmentCiphertext']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ciphertext?: Resolver<ResolversTypes['Ciphertext'], ParentType, ContextType>;
  ephemeralKeys?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  memo?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LegacyCommitmentCiphertextsConnectionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['LegacyCommitmentCiphertextsConnection'] = ResolversParentTypes['LegacyCommitmentCiphertextsConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['LegacyCommitmentCiphertextEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LegacyCommitmentCiphertextEdgeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['LegacyCommitmentCiphertextEdge'] = ResolversParentTypes['LegacyCommitmentCiphertextEdge']> = ResolversObject<{
  node?: Resolver<ResolversTypes['LegacyCommitmentCiphertext'], ParentType, ContextType>;
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommitmentCiphertextResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['CommitmentCiphertext'] = ResolversParentTypes['CommitmentCiphertext']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ciphertext?: Resolver<ResolversTypes['Ciphertext'], ParentType, ContextType>;
  blindedSenderViewingKey?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  blindedReceiverViewingKey?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  annotationData?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  memo?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommitmentCiphertextsConnectionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['CommitmentCiphertextsConnection'] = ResolversParentTypes['CommitmentCiphertextsConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['CommitmentCiphertextEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommitmentCiphertextEdgeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['CommitmentCiphertextEdge'] = ResolversParentTypes['CommitmentCiphertextEdge']> = ResolversObject<{
  node?: Resolver<ResolversTypes['CommitmentCiphertext'], ParentType, ContextType>;
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LegacyGeneratedCommitmentResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['LegacyGeneratedCommitment'] = ResolversParentTypes['LegacyGeneratedCommitment']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  treeNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  batchStartTreePosition?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  treePosition?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  commitmentType?: Resolver<ResolversTypes['CommitmentType'], ParentType, ContextType>;
  hash?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  preimage?: Resolver<ResolversTypes['CommitmentPreimage'], ParentType, ContextType>;
  encryptedRandom?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommitmentResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Commitment'] = ResolversParentTypes['Commitment']> = ResolversObject<{
  __resolveType: TypeResolveFn<'LegacyGeneratedCommitment' | 'LegacyEncryptedCommitment' | 'ShieldCommitment' | 'TransactCommitment', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  treeNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  batchStartTreePosition?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  treePosition?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  commitmentType?: Resolver<ResolversTypes['CommitmentType'], ParentType, ContextType>;
  hash?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
}>;

export type LegacyGeneratedCommitmentsConnectionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['LegacyGeneratedCommitmentsConnection'] = ResolversParentTypes['LegacyGeneratedCommitmentsConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['LegacyGeneratedCommitmentEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LegacyGeneratedCommitmentEdgeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['LegacyGeneratedCommitmentEdge'] = ResolversParentTypes['LegacyGeneratedCommitmentEdge']> = ResolversObject<{
  node?: Resolver<ResolversTypes['LegacyGeneratedCommitment'], ParentType, ContextType>;
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommitmentsConnectionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['CommitmentsConnection'] = ResolversParentTypes['CommitmentsConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['CommitmentEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommitmentEdgeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['CommitmentEdge'] = ResolversParentTypes['CommitmentEdge']> = ResolversObject<{
  node?: Resolver<ResolversTypes['Commitment'], ParentType, ContextType>;
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LegacyEncryptedCommitmentResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['LegacyEncryptedCommitment'] = ResolversParentTypes['LegacyEncryptedCommitment']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  treeNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  batchStartTreePosition?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  treePosition?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  commitmentType?: Resolver<ResolversTypes['CommitmentType'], ParentType, ContextType>;
  hash?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  ciphertext?: Resolver<ResolversTypes['LegacyCommitmentCiphertext'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LegacyEncryptedCommitmentsConnectionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['LegacyEncryptedCommitmentsConnection'] = ResolversParentTypes['LegacyEncryptedCommitmentsConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['LegacyEncryptedCommitmentEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LegacyEncryptedCommitmentEdgeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['LegacyEncryptedCommitmentEdge'] = ResolversParentTypes['LegacyEncryptedCommitmentEdge']> = ResolversObject<{
  node?: Resolver<ResolversTypes['LegacyEncryptedCommitment'], ParentType, ContextType>;
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ShieldCommitmentResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['ShieldCommitment'] = ResolversParentTypes['ShieldCommitment']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  treeNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  batchStartTreePosition?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  treePosition?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  commitmentType?: Resolver<ResolversTypes['CommitmentType'], ParentType, ContextType>;
  hash?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  preimage?: Resolver<ResolversTypes['CommitmentPreimage'], ParentType, ContextType>;
  encryptedBundle?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  shieldKey?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  fee?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ShieldCommitmentsConnectionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['ShieldCommitmentsConnection'] = ResolversParentTypes['ShieldCommitmentsConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['ShieldCommitmentEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ShieldCommitmentEdgeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['ShieldCommitmentEdge'] = ResolversParentTypes['ShieldCommitmentEdge']> = ResolversObject<{
  node?: Resolver<ResolversTypes['ShieldCommitment'], ParentType, ContextType>;
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransactCommitmentResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['TransactCommitment'] = ResolversParentTypes['TransactCommitment']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  treeNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  batchStartTreePosition?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  treePosition?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  commitmentType?: Resolver<ResolversTypes['CommitmentType'], ParentType, ContextType>;
  hash?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  ciphertext?: Resolver<ResolversTypes['CommitmentCiphertext'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransactCommitmentsConnectionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['TransactCommitmentsConnection'] = ResolversParentTypes['TransactCommitmentsConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['TransactCommitmentEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransactCommitmentEdgeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['TransactCommitmentEdge'] = ResolversParentTypes['TransactCommitmentEdge']> = ResolversObject<{
  node?: Resolver<ResolversTypes['TransactCommitment'], ParentType, ContextType>;
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UnshieldResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Unshield'] = ResolversParentTypes['Unshield']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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

export type UnshieldsConnectionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['UnshieldsConnection'] = ResolversParentTypes['UnshieldsConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['UnshieldEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UnshieldEdgeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['UnshieldEdge'] = ResolversParentTypes['UnshieldEdge']> = ResolversObject<{
  node?: Resolver<ResolversTypes['Unshield'], ParentType, ContextType>;
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NullifierResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Nullifier'] = ResolversParentTypes['Nullifier']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  treeNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nullifier?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NullifiersConnectionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['NullifiersConnection'] = ResolversParentTypes['NullifiersConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['NullifierEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NullifierEdgeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['NullifierEdge'] = ResolversParentTypes['NullifierEdge']> = ResolversObject<{
  node?: Resolver<ResolversTypes['Nullifier'], ParentType, ContextType>;
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransactionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Transaction'] = ResolversParentTypes['Transaction']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  merkleRoot?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  nullifiers?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  commitments?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  boundParamsHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  hasUnshield?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  utxoTreeIn?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  utxoTreeOut?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  utxoBatchStartPositionOut?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  unshieldToken?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  unshieldToAddress?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  unshieldValue?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  verificationHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransactionInterfaceResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['TransactionInterface'] = ResolversParentTypes['TransactionInterface']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Transaction', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  merkleRoot?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  nullifiers?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  commitments?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  boundParamsHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  hasUnshield?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  utxoTreeIn?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  utxoTreeOut?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  utxoBatchStartPositionOut?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  unshieldToken?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  unshieldToAddress?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  unshieldValue?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  blockTimestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  verificationHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
}>;

export type TransactionsConnectionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['TransactionsConnection'] = ResolversParentTypes['TransactionsConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['TransactionEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransactionEdgeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['TransactionEdge'] = ResolversParentTypes['TransactionEdge']> = ResolversObject<{
  node?: Resolver<ResolversTypes['Transaction'], ParentType, ContextType>;
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VerificationHashResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['VerificationHash'] = ResolversParentTypes['VerificationHash']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  verificationHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VerificationHashesConnectionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['VerificationHashesConnection'] = ResolversParentTypes['VerificationHashesConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['VerificationHashEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VerificationHashEdgeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['VerificationHashEdge'] = ResolversParentTypes['VerificationHashEdge']> = ResolversObject<{
  node?: Resolver<ResolversTypes['VerificationHash'], ParentType, ContextType>;
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommitmentBatchEventNewResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['CommitmentBatchEventNew'] = ResolversParentTypes['CommitmentBatchEventNew']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  treeNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  batchStartTreePosition?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommitmentBatchEventNewsConnectionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['CommitmentBatchEventNewsConnection'] = ResolversParentTypes['CommitmentBatchEventNewsConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['CommitmentBatchEventNewEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CommitmentBatchEventNewEdgeResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['CommitmentBatchEventNewEdge'] = ResolversParentTypes['CommitmentBatchEventNewEdge']> = ResolversObject<{
  node?: Resolver<ResolversTypes['CommitmentBatchEventNew'], ParentType, ContextType>;
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SquidStatusResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['SquidStatus'] = ResolversParentTypes['SquidStatus']> = ResolversObject<{
  height?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = MeshContext> = ResolversObject<{
  Query?: QueryResolvers<ContextType>;
  Token?: TokenResolvers<ContextType>;
  Bytes?: GraphQLScalarType;
  TokensConnection?: TokensConnectionResolvers<ContextType>;
  TokenEdge?: TokenEdgeResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  CommitmentPreimage?: CommitmentPreimageResolvers<ContextType>;
  BigInt?: GraphQLScalarType;
  CommitmentPreimagesConnection?: CommitmentPreimagesConnectionResolvers<ContextType>;
  CommitmentPreimageEdge?: CommitmentPreimageEdgeResolvers<ContextType>;
  Ciphertext?: CiphertextResolvers<ContextType>;
  CiphertextsConnection?: CiphertextsConnectionResolvers<ContextType>;
  CiphertextEdge?: CiphertextEdgeResolvers<ContextType>;
  LegacyCommitmentCiphertext?: LegacyCommitmentCiphertextResolvers<ContextType>;
  LegacyCommitmentCiphertextsConnection?: LegacyCommitmentCiphertextsConnectionResolvers<ContextType>;
  LegacyCommitmentCiphertextEdge?: LegacyCommitmentCiphertextEdgeResolvers<ContextType>;
  CommitmentCiphertext?: CommitmentCiphertextResolvers<ContextType>;
  CommitmentCiphertextsConnection?: CommitmentCiphertextsConnectionResolvers<ContextType>;
  CommitmentCiphertextEdge?: CommitmentCiphertextEdgeResolvers<ContextType>;
  LegacyGeneratedCommitment?: LegacyGeneratedCommitmentResolvers<ContextType>;
  Commitment?: CommitmentResolvers<ContextType>;
  LegacyGeneratedCommitmentsConnection?: LegacyGeneratedCommitmentsConnectionResolvers<ContextType>;
  LegacyGeneratedCommitmentEdge?: LegacyGeneratedCommitmentEdgeResolvers<ContextType>;
  CommitmentsConnection?: CommitmentsConnectionResolvers<ContextType>;
  CommitmentEdge?: CommitmentEdgeResolvers<ContextType>;
  LegacyEncryptedCommitment?: LegacyEncryptedCommitmentResolvers<ContextType>;
  LegacyEncryptedCommitmentsConnection?: LegacyEncryptedCommitmentsConnectionResolvers<ContextType>;
  LegacyEncryptedCommitmentEdge?: LegacyEncryptedCommitmentEdgeResolvers<ContextType>;
  ShieldCommitment?: ShieldCommitmentResolvers<ContextType>;
  ShieldCommitmentsConnection?: ShieldCommitmentsConnectionResolvers<ContextType>;
  ShieldCommitmentEdge?: ShieldCommitmentEdgeResolvers<ContextType>;
  TransactCommitment?: TransactCommitmentResolvers<ContextType>;
  TransactCommitmentsConnection?: TransactCommitmentsConnectionResolvers<ContextType>;
  TransactCommitmentEdge?: TransactCommitmentEdgeResolvers<ContextType>;
  Unshield?: UnshieldResolvers<ContextType>;
  UnshieldsConnection?: UnshieldsConnectionResolvers<ContextType>;
  UnshieldEdge?: UnshieldEdgeResolvers<ContextType>;
  Nullifier?: NullifierResolvers<ContextType>;
  NullifiersConnection?: NullifiersConnectionResolvers<ContextType>;
  NullifierEdge?: NullifierEdgeResolvers<ContextType>;
  Transaction?: TransactionResolvers<ContextType>;
  TransactionInterface?: TransactionInterfaceResolvers<ContextType>;
  TransactionsConnection?: TransactionsConnectionResolvers<ContextType>;
  TransactionEdge?: TransactionEdgeResolvers<ContextType>;
  VerificationHash?: VerificationHashResolvers<ContextType>;
  VerificationHashesConnection?: VerificationHashesConnectionResolvers<ContextType>;
  VerificationHashEdge?: VerificationHashEdgeResolvers<ContextType>;
  CommitmentBatchEventNew?: CommitmentBatchEventNewResolvers<ContextType>;
  CommitmentBatchEventNewsConnection?: CommitmentBatchEventNewsConnectionResolvers<ContextType>;
  CommitmentBatchEventNewEdge?: CommitmentBatchEventNewEdgeResolvers<ContextType>;
  SquidStatus?: SquidStatusResolvers<ContextType>;
}>;


export type MeshContext = ArbitrumOneTypes.Context & SepoliaTypes.Context & BscTypes.Context & EthereumTypes.Context & MaticTypes.Context & BaseMeshContext;


const baseDir = pathModule.join(typeof __dirname === 'string' ? __dirname : '/', '..');

const importFn: ImportFn = <T>(moduleId: string) => {
  const relativeModuleId = (pathModule.isAbsolute(moduleId) ? pathModule.relative(baseDir, moduleId) : moduleId).split('\\').join('/').replace(baseDir + '/', '');
  switch(relativeModuleId) {
    case ".graphclient/sources/arbitrum-one/introspectionSchema":
      return import("./.graphclient/sources/arbitrum-one/introspectionSchema") as T;
    
    case ".graphclient/sources/sepolia/introspectionSchema":
      return import("./.graphclient/sources/sepolia/introspectionSchema") as T;
    
    case ".graphclient/sources/bsc/introspectionSchema":
      return import("./.graphclient/sources/bsc/introspectionSchema") as T;
    
    case ".graphclient/sources/ethereum/introspectionSchema":
      return import("./.graphclient/sources/ethereum/introspectionSchema") as T;
    
    case ".graphclient/sources/matic/introspectionSchema":
      return import("./.graphclient/sources/matic/introspectionSchema") as T;
    
    default:
      return Promise.reject(new Error(`Cannot find module '${relativeModuleId}'.`));
  }
};

const rootStore = new MeshStore('.graphclient', new FsStoreStorageAdapter({
  cwd: baseDir,
  importFn,
  fileType: "ts",
}), {
  readonly: true,
  validate: false
});

export const rawServeConfig: YamlConfig.Config['serve'] = undefined as any
export async function getMeshOptions(): Promise<GetMeshOptions> {
const pubsub = new PubSub();
const sourcesStore = rootStore.child('sources');
const logger = new DefaultLogger("GraphClient");
const cache = new (MeshCache as any)({
      ...({} as any),
      importFn,
      store: rootStore.child('cache'),
      pubsub,
      logger,
    } as any)

const sources: MeshResolvedSource[] = [];
const transforms: MeshTransform[] = [];
const additionalEnvelopPlugins: MeshPlugin<any>[] = [];
const ethereumTransforms = [];
const bscTransforms = [];
const maticTransforms = [];
const arbitrumOneTransforms = [];
const sepoliaTransforms = [];
const additionalTypeDefs = [] as any[];
const ethereumHandler = new GraphqlHandler({
              name: "ethereum",
              config: {"endpoint":"https://rail-squid.squids.live/squid-railgun-ethereum-v2/graphql"},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("ethereum"),
              logger: logger.child("ethereum"),
              importFn,
            });
const bscHandler = new GraphqlHandler({
              name: "bsc",
              config: {"endpoint":"https://rail-squid.squids.live/squid-railgun-bsc-v2/graphql"},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("bsc"),
              logger: logger.child("bsc"),
              importFn,
            });
const maticHandler = new GraphqlHandler({
              name: "matic",
              config: {"endpoint":"https://rail-squid.squids.live/squid-railgun-polygon-v2/graphql"},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("matic"),
              logger: logger.child("matic"),
              importFn,
            });
const arbitrumOneHandler = new GraphqlHandler({
              name: "arbitrum-one",
              config: {"endpoint":"https://rail-squid.squids.live/squid-railgun-arbitrum-v2/graphql"},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("arbitrum-one"),
              logger: logger.child("arbitrum-one"),
              importFn,
            });
const sepoliaHandler = new GraphqlHandler({
              name: "sepolia",
              config: {"endpoint":"https://rail-squid.squids.live/squid-railgun-eth-sepolia-v2/graphql"},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("sepolia"),
              logger: logger.child("sepolia"),
              importFn,
            });
sources[0] = {
          name: 'ethereum',
          handler: ethereumHandler,
          transforms: ethereumTransforms
        }
sources[1] = {
          name: 'bsc',
          handler: bscHandler,
          transforms: bscTransforms
        }
sources[2] = {
          name: 'matic',
          handler: maticHandler,
          transforms: maticTransforms
        }
sources[3] = {
          name: 'arbitrum-one',
          handler: arbitrumOneHandler,
          transforms: arbitrumOneTransforms
        }
sources[4] = {
          name: 'sepolia',
          handler: sepoliaHandler,
          transforms: sepoliaTransforms
        }
const additionalResolvers = [] as any[]
const merger = new(StitchingMerger as any)({
        cache,
        pubsub,
        logger: logger.child('stitchingMerger'),
        store: rootStore.child('stitchingMerger')
      })

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
        location: 'NullifiersDocument.graphql'
      },{
        document: UnshieldsDocument,
        get rawSDL() {
          return printWithCache(UnshieldsDocument);
        },
        location: 'UnshieldsDocument.graphql'
      },{
        document: CommitmentsDocument,
        get rawSDL() {
          return printWithCache(CommitmentsDocument);
        },
        location: 'CommitmentsDocument.graphql'
      }
    ];
    },
    fetchFn,
  };
}

export function createBuiltMeshHTTPHandler<TServerContext = {}>(): MeshHTTPHandler<TServerContext> {
  return createMeshHTTPHandler<TServerContext>({
    baseDir,
    getBuiltMesh: getBuiltGraphClient,
    rawServeConfig: undefined,
  })
}


let meshInstance$: Promise<MeshInstance> | undefined;

export function getBuiltGraphClient(): Promise<MeshInstance> {
  if (meshInstance$ == null) {
    meshInstance$ = getMeshOptions().then(meshOptions => getMesh(meshOptions)).then(mesh => {
      const id = mesh.pubsub.subscribe('destroy', () => {
        meshInstance$ = undefined;
        mesh.pubsub.unsubscribe(id);
      });
      return mesh;
    });
  }
  return meshInstance$;
}

export const execute: ExecuteMeshFn = (...args) => getBuiltGraphClient().then(({ execute }) => execute(...args));

export const subscribe: SubscribeMeshFn = (...args) => getBuiltGraphClient().then(({ subscribe }) => subscribe(...args));
export function getBuiltGraphSDK<TGlobalContext = any, TOperationContext = any>(globalContext?: TGlobalContext) {
  const sdkRequester$ = getBuiltGraphClient().then(({ sdkRequesterFactory }) => sdkRequesterFactory(globalContext));
  return getSdk<TOperationContext, TGlobalContext>((...args) => sdkRequester$.then(sdkRequester => sdkRequester(...args)));
}
export type NullifiersQueryVariables = Exact<{
  blockNumber?: InputMaybe<Scalars['BigInt']>;
}>;


export type NullifiersQuery = { nullifiers: Array<Pick<Nullifier, 'id' | 'blockNumber' | 'nullifier' | 'transactionHash' | 'blockTimestamp' | 'treeNumber'>> };

export type UnshieldsQueryVariables = Exact<{
  blockNumber?: InputMaybe<Scalars['BigInt']>;
}>;


export type UnshieldsQuery = { unshields: Array<(
    Pick<Unshield, 'id' | 'blockNumber' | 'to' | 'transactionHash' | 'fee' | 'blockTimestamp' | 'amount' | 'eventLogIndex'>
    & { token: Pick<Token, 'id' | 'tokenType' | 'tokenSubID' | 'tokenAddress'> }
  )> };

export type CommitmentsQueryVariables = Exact<{
  blockNumber?: InputMaybe<Scalars['BigInt']>;
}>;


export type CommitmentsQuery = { commitments: Array<(
    Pick<LegacyGeneratedCommitment, 'id' | 'treeNumber' | 'batchStartTreePosition' | 'treePosition' | 'blockNumber' | 'transactionHash' | 'blockTimestamp' | 'commitmentType' | 'hash' | 'encryptedRandom'>
    & { preimage: (
      Pick<CommitmentPreimage, 'id' | 'npk' | 'value'>
      & { token: Pick<Token, 'id' | 'tokenType' | 'tokenSubID' | 'tokenAddress'> }
    ) }
  ) | (
    Pick<LegacyEncryptedCommitment, 'id' | 'blockNumber' | 'blockTimestamp' | 'transactionHash' | 'treeNumber' | 'batchStartTreePosition' | 'treePosition' | 'commitmentType' | 'hash'>
    & { legacyCiphertext: (
      Pick<LegacyCommitmentCiphertext, 'id' | 'ephemeralKeys' | 'memo'>
      & { ciphertext: Pick<Ciphertext, 'id' | 'iv' | 'tag' | 'data'> }
    ) }
  ) | (
    Pick<ShieldCommitment, 'id' | 'blockNumber' | 'blockTimestamp' | 'transactionHash' | 'treeNumber' | 'batchStartTreePosition' | 'treePosition' | 'commitmentType' | 'hash' | 'shieldKey' | 'fee' | 'encryptedBundle'>
    & { preimage: (
      Pick<CommitmentPreimage, 'id' | 'npk' | 'value'>
      & { token: Pick<Token, 'id' | 'tokenType' | 'tokenSubID' | 'tokenAddress'> }
    ) }
  ) | (
    Pick<TransactCommitment, 'id' | 'blockNumber' | 'blockTimestamp' | 'transactionHash' | 'treeNumber' | 'batchStartTreePosition' | 'treePosition' | 'commitmentType' | 'hash'>
    & { ciphertext: (
      Pick<CommitmentCiphertext, 'id' | 'blindedSenderViewingKey' | 'blindedReceiverViewingKey' | 'annotationData' | 'memo'>
      & { ciphertext: Pick<Ciphertext, 'id' | 'iv' | 'tag' | 'data'> }
    ) }
  )> };


export const NullifiersDocument = gql`
    query Nullifiers($blockNumber: BigInt = 0) {
  nullifiers(
    orderBy: [blockNumber_ASC, nullifier_DESC]
    where: {blockNumber_gte: $blockNumber}
    limit: 10000
  ) {
    id
    blockNumber
    nullifier
    transactionHash
    blockTimestamp
    treeNumber
  }
}
    ` as unknown as DocumentNode<NullifiersQuery, NullifiersQueryVariables>;
export const UnshieldsDocument = gql`
    query Unshields($blockNumber: BigInt = 0) {
  unshields(
    orderBy: [blockNumber_ASC, eventLogIndex_ASC]
    where: {blockNumber_gte: $blockNumber}
    limit: 10000
  ) {
    id
    blockNumber
    to
    transactionHash
    fee
    blockTimestamp
    amount
    eventLogIndex
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
    orderBy: [blockNumber_ASC, treePosition_ASC]
    where: {blockNumber_gte: $blockNumber}
    limit: 10000
  ) {
    id
    treeNumber
    batchStartTreePosition
    treePosition
    blockNumber
    transactionHash
    blockTimestamp
    commitmentType
    hash
    ... on LegacyGeneratedCommitment {
      id
      treeNumber
      batchStartTreePosition
      treePosition
      blockNumber
      transactionHash
      blockTimestamp
      commitmentType
      hash
      encryptedRandom
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
    ... on LegacyEncryptedCommitment {
      id
      blockNumber
      blockTimestamp
      transactionHash
      treeNumber
      batchStartTreePosition
      treePosition
      commitmentType
      hash
      legacyCiphertext: ciphertext {
        id
        ciphertext {
          id
          iv
          tag
          data
        }
        ephemeralKeys
        memo
      }
    }
    ... on ShieldCommitment {
      id
      blockNumber
      blockTimestamp
      transactionHash
      treeNumber
      batchStartTreePosition
      treePosition
      commitmentType
      hash
      shieldKey
      fee
      encryptedBundle
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
      treePosition
      commitmentType
      hash
      ciphertext {
        id
        ciphertext {
          id
          iv
          tag
          data
        }
        blindedSenderViewingKey
        blindedReceiverViewingKey
        annotationData
        memo
      }
    }
  }
}
    ` as unknown as DocumentNode<CommitmentsQuery, CommitmentsQueryVariables>;




export type Requester<C = {}, E = unknown> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>
export function getSdk<C, E>(requester: Requester<C, E>) {
  return {
    Nullifiers(variables?: NullifiersQueryVariables, options?: C): Promise<NullifiersQuery> {
      return requester<NullifiersQuery, NullifiersQueryVariables>(NullifiersDocument, variables, options) as Promise<NullifiersQuery>;
    },
    Unshields(variables?: UnshieldsQueryVariables, options?: C): Promise<UnshieldsQuery> {
      return requester<UnshieldsQuery, UnshieldsQueryVariables>(UnshieldsDocument, variables, options) as Promise<UnshieldsQuery>;
    },
    Commitments(variables?: CommitmentsQueryVariables, options?: C): Promise<CommitmentsQuery> {
      return requester<CommitmentsQuery, CommitmentsQueryVariables>(CommitmentsDocument, variables, options) as Promise<CommitmentsQuery>;
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;