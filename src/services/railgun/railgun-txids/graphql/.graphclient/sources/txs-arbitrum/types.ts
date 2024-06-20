// @ts-nocheck

import { InContextSdkMethod } from '@graphql-mesh/types';
import { MeshContext } from '@graphql-mesh/runtime';

export namespace TxsArbitrumTypes {
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
  Bytes: any;
  BigInt: any;
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
  ciphertext: LegacyCommitmentCiphertext;
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

  export type QuerySdk = {
      /** null **/
  tokens: InContextSdkMethod<Query['tokens'], QuerytokensArgs, MeshContext>,
  /** null **/
  tokenById: InContextSdkMethod<Query['tokenById'], QuerytokenByIdArgs, MeshContext>,
  /** null **/
  tokenByUniqueInput: InContextSdkMethod<Query['tokenByUniqueInput'], QuerytokenByUniqueInputArgs, MeshContext>,
  /** null **/
  tokensConnection: InContextSdkMethod<Query['tokensConnection'], QuerytokensConnectionArgs, MeshContext>,
  /** null **/
  commitmentPreimages: InContextSdkMethod<Query['commitmentPreimages'], QuerycommitmentPreimagesArgs, MeshContext>,
  /** null **/
  commitmentPreimageById: InContextSdkMethod<Query['commitmentPreimageById'], QuerycommitmentPreimageByIdArgs, MeshContext>,
  /** null **/
  commitmentPreimageByUniqueInput: InContextSdkMethod<Query['commitmentPreimageByUniqueInput'], QuerycommitmentPreimageByUniqueInputArgs, MeshContext>,
  /** null **/
  commitmentPreimagesConnection: InContextSdkMethod<Query['commitmentPreimagesConnection'], QuerycommitmentPreimagesConnectionArgs, MeshContext>,
  /** null **/
  ciphertexts: InContextSdkMethod<Query['ciphertexts'], QueryciphertextsArgs, MeshContext>,
  /** null **/
  ciphertextById: InContextSdkMethod<Query['ciphertextById'], QueryciphertextByIdArgs, MeshContext>,
  /** null **/
  ciphertextByUniqueInput: InContextSdkMethod<Query['ciphertextByUniqueInput'], QueryciphertextByUniqueInputArgs, MeshContext>,
  /** null **/
  ciphertextsConnection: InContextSdkMethod<Query['ciphertextsConnection'], QueryciphertextsConnectionArgs, MeshContext>,
  /** null **/
  legacyCommitmentCiphertexts: InContextSdkMethod<Query['legacyCommitmentCiphertexts'], QuerylegacyCommitmentCiphertextsArgs, MeshContext>,
  /** null **/
  legacyCommitmentCiphertextById: InContextSdkMethod<Query['legacyCommitmentCiphertextById'], QuerylegacyCommitmentCiphertextByIdArgs, MeshContext>,
  /** null **/
  legacyCommitmentCiphertextByUniqueInput: InContextSdkMethod<Query['legacyCommitmentCiphertextByUniqueInput'], QuerylegacyCommitmentCiphertextByUniqueInputArgs, MeshContext>,
  /** null **/
  legacyCommitmentCiphertextsConnection: InContextSdkMethod<Query['legacyCommitmentCiphertextsConnection'], QuerylegacyCommitmentCiphertextsConnectionArgs, MeshContext>,
  /** null **/
  commitmentCiphertexts: InContextSdkMethod<Query['commitmentCiphertexts'], QuerycommitmentCiphertextsArgs, MeshContext>,
  /** null **/
  commitmentCiphertextById: InContextSdkMethod<Query['commitmentCiphertextById'], QuerycommitmentCiphertextByIdArgs, MeshContext>,
  /** null **/
  commitmentCiphertextByUniqueInput: InContextSdkMethod<Query['commitmentCiphertextByUniqueInput'], QuerycommitmentCiphertextByUniqueInputArgs, MeshContext>,
  /** null **/
  commitmentCiphertextsConnection: InContextSdkMethod<Query['commitmentCiphertextsConnection'], QuerycommitmentCiphertextsConnectionArgs, MeshContext>,
  /** null **/
  legacyGeneratedCommitments: InContextSdkMethod<Query['legacyGeneratedCommitments'], QuerylegacyGeneratedCommitmentsArgs, MeshContext>,
  /** null **/
  legacyGeneratedCommitmentById: InContextSdkMethod<Query['legacyGeneratedCommitmentById'], QuerylegacyGeneratedCommitmentByIdArgs, MeshContext>,
  /** null **/
  legacyGeneratedCommitmentByUniqueInput: InContextSdkMethod<Query['legacyGeneratedCommitmentByUniqueInput'], QuerylegacyGeneratedCommitmentByUniqueInputArgs, MeshContext>,
  /** null **/
  legacyGeneratedCommitmentsConnection: InContextSdkMethod<Query['legacyGeneratedCommitmentsConnection'], QuerylegacyGeneratedCommitmentsConnectionArgs, MeshContext>,
  /** null **/
  commitments: InContextSdkMethod<Query['commitments'], QuerycommitmentsArgs, MeshContext>,
  /** null **/
  commitmentsConnection: InContextSdkMethod<Query['commitmentsConnection'], QuerycommitmentsConnectionArgs, MeshContext>,
  /** null **/
  legacyEncryptedCommitments: InContextSdkMethod<Query['legacyEncryptedCommitments'], QuerylegacyEncryptedCommitmentsArgs, MeshContext>,
  /** null **/
  legacyEncryptedCommitmentById: InContextSdkMethod<Query['legacyEncryptedCommitmentById'], QuerylegacyEncryptedCommitmentByIdArgs, MeshContext>,
  /** null **/
  legacyEncryptedCommitmentByUniqueInput: InContextSdkMethod<Query['legacyEncryptedCommitmentByUniqueInput'], QuerylegacyEncryptedCommitmentByUniqueInputArgs, MeshContext>,
  /** null **/
  legacyEncryptedCommitmentsConnection: InContextSdkMethod<Query['legacyEncryptedCommitmentsConnection'], QuerylegacyEncryptedCommitmentsConnectionArgs, MeshContext>,
  /** null **/
  shieldCommitments: InContextSdkMethod<Query['shieldCommitments'], QueryshieldCommitmentsArgs, MeshContext>,
  /** null **/
  shieldCommitmentById: InContextSdkMethod<Query['shieldCommitmentById'], QueryshieldCommitmentByIdArgs, MeshContext>,
  /** null **/
  shieldCommitmentByUniqueInput: InContextSdkMethod<Query['shieldCommitmentByUniqueInput'], QueryshieldCommitmentByUniqueInputArgs, MeshContext>,
  /** null **/
  shieldCommitmentsConnection: InContextSdkMethod<Query['shieldCommitmentsConnection'], QueryshieldCommitmentsConnectionArgs, MeshContext>,
  /** null **/
  transactCommitments: InContextSdkMethod<Query['transactCommitments'], QuerytransactCommitmentsArgs, MeshContext>,
  /** null **/
  transactCommitmentById: InContextSdkMethod<Query['transactCommitmentById'], QuerytransactCommitmentByIdArgs, MeshContext>,
  /** null **/
  transactCommitmentByUniqueInput: InContextSdkMethod<Query['transactCommitmentByUniqueInput'], QuerytransactCommitmentByUniqueInputArgs, MeshContext>,
  /** null **/
  transactCommitmentsConnection: InContextSdkMethod<Query['transactCommitmentsConnection'], QuerytransactCommitmentsConnectionArgs, MeshContext>,
  /** null **/
  unshields: InContextSdkMethod<Query['unshields'], QueryunshieldsArgs, MeshContext>,
  /** null **/
  unshieldById: InContextSdkMethod<Query['unshieldById'], QueryunshieldByIdArgs, MeshContext>,
  /** null **/
  unshieldByUniqueInput: InContextSdkMethod<Query['unshieldByUniqueInput'], QueryunshieldByUniqueInputArgs, MeshContext>,
  /** null **/
  unshieldsConnection: InContextSdkMethod<Query['unshieldsConnection'], QueryunshieldsConnectionArgs, MeshContext>,
  /** null **/
  nullifiers: InContextSdkMethod<Query['nullifiers'], QuerynullifiersArgs, MeshContext>,
  /** null **/
  nullifierById: InContextSdkMethod<Query['nullifierById'], QuerynullifierByIdArgs, MeshContext>,
  /** null **/
  nullifierByUniqueInput: InContextSdkMethod<Query['nullifierByUniqueInput'], QuerynullifierByUniqueInputArgs, MeshContext>,
  /** null **/
  nullifiersConnection: InContextSdkMethod<Query['nullifiersConnection'], QuerynullifiersConnectionArgs, MeshContext>,
  /** null **/
  transactions: InContextSdkMethod<Query['transactions'], QuerytransactionsArgs, MeshContext>,
  /** null **/
  transactionById: InContextSdkMethod<Query['transactionById'], QuerytransactionByIdArgs, MeshContext>,
  /** null **/
  transactionByUniqueInput: InContextSdkMethod<Query['transactionByUniqueInput'], QuerytransactionByUniqueInputArgs, MeshContext>,
  /** null **/
  transactionsConnection: InContextSdkMethod<Query['transactionsConnection'], QuerytransactionsConnectionArgs, MeshContext>,
  /** null **/
  verificationHashes: InContextSdkMethod<Query['verificationHashes'], QueryverificationHashesArgs, MeshContext>,
  /** null **/
  verificationHashById: InContextSdkMethod<Query['verificationHashById'], QueryverificationHashByIdArgs, MeshContext>,
  /** null **/
  verificationHashByUniqueInput: InContextSdkMethod<Query['verificationHashByUniqueInput'], QueryverificationHashByUniqueInputArgs, MeshContext>,
  /** null **/
  verificationHashesConnection: InContextSdkMethod<Query['verificationHashesConnection'], QueryverificationHashesConnectionArgs, MeshContext>,
  /** null **/
  commitmentBatchEventNews: InContextSdkMethod<Query['commitmentBatchEventNews'], QuerycommitmentBatchEventNewsArgs, MeshContext>,
  /** null **/
  commitmentBatchEventNewById: InContextSdkMethod<Query['commitmentBatchEventNewById'], QuerycommitmentBatchEventNewByIdArgs, MeshContext>,
  /** null **/
  commitmentBatchEventNewByUniqueInput: InContextSdkMethod<Query['commitmentBatchEventNewByUniqueInput'], QuerycommitmentBatchEventNewByUniqueInputArgs, MeshContext>,
  /** null **/
  commitmentBatchEventNewsConnection: InContextSdkMethod<Query['commitmentBatchEventNewsConnection'], QuerycommitmentBatchEventNewsConnectionArgs, MeshContext>,
  /** null **/
  squidStatus: InContextSdkMethod<Query['squidStatus'], {}, MeshContext>
  };

  export type MutationSdk = {
    
  };

  export type SubscriptionSdk = {
    
  };

  export type Context = {
      ["txs-arbitrum"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      
    };
}
