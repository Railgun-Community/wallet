import {
  ByteLength,
  PreImage,
  TokenData,
  TokenType,
  ByteUtils,
  serializePreImage,
  serializeTokenData,
} from '@railgun-community/engine';
import {
  TokenType as GraphTokenTypeV2,
  Token as GraphTokenV2,
  CommitmentPreimage as GraphCommitmentPreimageV2,
} from './V2/graphql';
import {
  TokenType as GraphTokenTypeV3,
  Token as GraphTokenV3,
  CommitmentPreimage as GraphCommitmentPreimageV3,
} from './V3/graphql';

export const graphTokenTypeToEngineTokenType = (
  graphTokenType: GraphTokenTypeV2 | GraphTokenTypeV3,
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

export const formatSerializedToken = (
  graphToken: GraphTokenV2 | GraphTokenV3,
): TokenData => {
  return serializeTokenData(
    graphToken.tokenAddress,
    graphTokenTypeToEngineTokenType(graphToken.tokenType),
    graphToken.tokenSubID,
  );
};

export const formatPreImage = (
  graphPreImage: GraphCommitmentPreimageV2 | GraphCommitmentPreimageV3,
): PreImage => {
  return serializePreImage(
    graphPreImage.npk,
    formatSerializedToken(graphPreImage.token),
    BigInt(graphPreImage.value),
  );
};

export const formatTo16Bytes = (value: string, prefix: boolean) => {
  return ByteUtils.formatToByteLength(value, ByteLength.UINT_128, prefix);
};

export const formatTo32Bytes = (value: string, prefix: boolean) => {
  return ByteUtils.formatToByteLength(value, ByteLength.UINT_256, prefix);
};

export const bigIntStringToHex = (bigintString: string): string => {
  return `0x${BigInt(bigintString).toString(16)}`;
};
