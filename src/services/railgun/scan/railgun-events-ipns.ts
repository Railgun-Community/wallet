import axios from 'axios';
import { Nullifier, CommitmentEvent, Chain } from '@railgun-community/engine';
import { sendErrorMessage } from '../../../utils/logger';

const MAX_NUM_RETRIES = 3;

const GATEWAY_URLS = [
  'https://railgun1.b-cdn.net',
  'https://railgun2.b-cdn.net',
  'https://railgun3.b-cdn.net',
];

const IPNS_HASH =
  'k51qzi5uqu5dks5d4t206cd9uhtegm7o7agaefab3ykitmauywh8epnoviplgn';

export enum QuickSyncPageSize {
  Small = 25,
  Medium = 50,
  Large = 250,
  XLarge = 500,
}

// CDN automatically pulls XL on a timer, making sure its cache is
//  updated regularly. Consider this if modifying this default setting.
export const DEFAULT_QUICK_SYNC_PAGE_SIZE = QuickSyncPageSize.XLarge;

type PageMetadata = {
  start_block: number;
  end_block: number;
};
type PagesMetadata = { [index: string]: PageMetadata };

type CommitmentPageData = {
  num_pages: number;
  pages_metadata: PagesMetadata;
};

type NullifierPageData = {
  num_pages: number;
  pages_metadata: PagesMetadata;
};

type QuickSyncChainPageMetadataResponse = {
  commitment: CommitmentPageData;
  nullifier: NullifierPageData;
};

export type QuickSyncEventLog = {
  commitmentEvents: CommitmentEvent[];
  nullifierEvents: Nullifier[];
};

const getIpnsUrl = (gateway: string) => {
  return `${gateway}/ipns/${IPNS_HASH}`;
};

const ipnsUrlForChain = (gateway: string, chain: Chain) => {
  return `${getIpnsUrl(gateway)}/${chain.type}/${chain.id}`;
};

const getChainPageMetadataURL = (
  gateway: string,
  chain: Chain,
  pageSize: QuickSyncPageSize,
) => {
  return `${ipnsUrlForChain(gateway, chain)}/${pageSize}/pages.json`;
};

const getPageURLs = (
  gateway: string,
  chain: Chain,
  path: 'commitment' | 'nullifier',
  pageSize: QuickSyncPageSize,
  numPages: number,
  startPageIndex: number,
): string[] => {
  const urls: string[] = [];
  for (let i = startPageIndex; i < numPages; i += 1) {
    urls.push(
      `${ipnsUrlForChain(gateway, chain)}/${pageSize}/${path}/${i}.json`,
    );
  }
  return urls;
};

const getStartingPageIndex = (
  numPages: number,
  pagesMetadata: PagesMetadata,
  startingBlock: number,
) => {
  for (let i = 0; i < numPages; i += 1) {
    if (pagesMetadata[i].end_block >= startingBlock) {
      return i;
    }
  }
  return numPages;
};

const getChainPageMatadata = async (
  gateway: string,
  chain: Chain,
  pageSize: QuickSyncPageSize,
): Promise<Optional<QuickSyncChainPageMetadataResponse>> => {
  try {
    const data = await fetchJsonData<QuickSyncChainPageMetadataResponse>(
      getChainPageMetadataURL(gateway, chain, pageSize),
    );
    return data;
  } catch {
    return undefined;
  }
};

const getFirstLookupChainPageMetadataAndGateway = async (
  chain: Chain,
  pageSize: QuickSyncPageSize,
): Promise<{
  chainPageMetadata: QuickSyncChainPageMetadataResponse;
  gateway: string;
}> => {
  for (const gateway of GATEWAY_URLS) {
    // eslint-disable-next-line no-await-in-loop
    const chainPageMetadata = await getChainPageMatadata(
      gateway,
      chain,
      pageSize,
    );
    if (!chainPageMetadata) {
      continue;
    }
    return { chainPageMetadata, gateway };
  }
  throw new Error('Could not get historical event metadata from any gateway.');
};

export const getRailgunEventLogIPNS = async (
  chain: Chain,
  pageSize: QuickSyncPageSize,
  startingBlock: number,
): Promise<QuickSyncEventLog> => {
  const { chainPageMetadata, gateway } =
    await getFirstLookupChainPageMetadataAndGateway(chain, pageSize);

  const numPagesCommitments = chainPageMetadata.commitment.num_pages;
  const startPageCommitments = getStartingPageIndex(
    numPagesCommitments,
    chainPageMetadata.commitment.pages_metadata,
    startingBlock,
  );

  const numPagesNullifiers = chainPageMetadata.nullifier.num_pages;
  const startPageNullifiers = getStartingPageIndex(
    numPagesNullifiers,
    chainPageMetadata.nullifier.pages_metadata,
    startingBlock,
  );

  const commitmentPageURLs: string[] = getPageURLs(
    gateway,
    chain,
    'commitment',
    pageSize,
    numPagesCommitments,
    startPageCommitments,
  );
  const nullifierPageURLs: string[] = getPageURLs(
    gateway,
    chain,
    'nullifier',
    pageSize,
    numPagesNullifiers,
    startPageNullifiers,
  );

  const [commitmentLogBatchUnordered, nullifierLogBatchUnordered] =
    await Promise.all([
      Promise.all(
        commitmentPageURLs.map(url => fetchJsonData<CommitmentEvent[]>(url)),
      ),
      Promise.all(
        nullifierPageURLs.map(url => fetchJsonData<Nullifier[]>(url)),
      ),
    ]);

  const eventLogUnordered: QuickSyncEventLog = {
    commitmentEvents: commitmentLogBatchUnordered.flat(),
    nullifierEvents: nullifierLogBatchUnordered.flat(),
  };

  if (typeof eventLogUnordered.commitmentEvents !== 'object') {
    throw new Error('Expected object `commitmentEvents` response.');
  }
  if (typeof eventLogUnordered.nullifierEvents !== 'object') {
    throw new Error('Expected object `nullifierEvents` response.');
  }

  return eventLogUnordered;
};

const fetchJsonData = async <ReturnType>(
  url: string,
  retryCount = 1,
): Promise<ReturnType> => {
  try {
    const rsp = await axios.get(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return rsp.data;
  } catch (err) {
    if (retryCount < MAX_NUM_RETRIES) {
      return fetchJsonData(url, retryCount + 1);
    }
    sendErrorMessage(err);
    throw new Error(
      'Could not pull historical transactions. Please try again.',
    );
  }
};
