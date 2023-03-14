import axios from 'axios';
import {
  Nullifier,
  CommitmentEvent,
  Chain,
  UnshieldStoredEvent,
  AccumulatedEvents,
  promiseTimeout,
} from '@railgun-community/engine';
import { reportAndSanitizeError } from '../../../utils/error';
import { removeUndefineds } from '../../../utils/utils';

const MAX_NUM_RETRIES = 2;

// 2.5 sec to look up chain page metadata.
const CHAIN_PAGE_METADATA_TIMEOUT = 2500;

const GATEWAY_URLS: string[] = [
  'https://mex.ipfs-lb.com',
  'https://ams.ipfs-lb.com',
  'https://sin.ipfs-lb.com',
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
//  updated regularly. This will pull data the fastest.
// Consider this if modifying this default setting.
export const DEFAULT_QUICK_SYNC_PAGE_SIZE = QuickSyncPageSize.XLarge;

type QuickSyncPath = 'commitment' | 'unshield' | 'nullifier';

type PageMetadata = {
  start_block: number;
  end_block: number;
};
type PagesMetadata = { [index: string]: PageMetadata };

type CommitmentPageData = {
  num_pages: number;
  pages_metadata: PagesMetadata;
};
type UnshieldPageData = {
  num_pages: number;
  pages_metadata: PagesMetadata;
};
type NullifierPageData = {
  num_pages: number;
  pages_metadata: PagesMetadata;
};

type QuickSyncChainPageMetadataResponse = {
  commitment: CommitmentPageData;
  unshield: UnshieldPageData;
  nullifier: NullifierPageData;
};

type ChainPageMetadataAndGateway = {
  chainPageMetadata: QuickSyncChainPageMetadataResponse;
  gateway: string;
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
  path: QuickSyncPath,
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
    const data = await promiseTimeout(
      fetchJsonData<QuickSyncChainPageMetadataResponse>(
        getChainPageMetadataURL(gateway, chain, pageSize),
      ),
      CHAIN_PAGE_METADATA_TIMEOUT,
    );
    return data;
  } catch {
    return undefined;
  }
};

const getBestLookupChainPageMetadataAndGateway = async (
  chain: Chain,
  pageSize: QuickSyncPageSize,
): Promise<ChainPageMetadataAndGateway> => {
  const chainPageMetadataAndGateways = await Promise.all(
    GATEWAY_URLS.map(async gateway => {
      const chainPageMetadata = await getChainPageMatadata(
        gateway,
        chain,
        pageSize,
      );
      if (!chainPageMetadata) {
        return undefined;
      }
      return {
        chainPageMetadata,
        gateway,
      };
    }),
  );

  let latestBlock = 0;
  let latestChainPageMetadataAndGateway: Optional<ChainPageMetadataAndGateway>;

  for (const chainPageMetadataAndGateway of chainPageMetadataAndGateways) {
    if (!chainPageMetadataAndGateway) {
      continue;
    }
    const { chainPageMetadata } = chainPageMetadataAndGateway;
    const latestPage = chainPageMetadata.commitment.num_pages - 1;
    const latestCommitmentBlock =
      chainPageMetadata.commitment.pages_metadata[latestPage].end_block;
    if (latestBlock < latestCommitmentBlock) {
      latestBlock = latestCommitmentBlock;
      latestChainPageMetadataAndGateway = chainPageMetadataAndGateway;
    }
  }

  if (!latestChainPageMetadataAndGateway) {
    throw new Error(
      'Could not get historical event metadata from any gateway.',
    );
  }

  return latestChainPageMetadataAndGateway;
};

export const getRailgunEventLogIPNS = async (
  chain: Chain,
  pageSize: QuickSyncPageSize,
  startingBlock: number,
): Promise<AccumulatedEvents> => {
  const { chainPageMetadata, gateway } =
    await getBestLookupChainPageMetadataAndGateway(chain, pageSize);

  const numPagesCommitments = chainPageMetadata.commitment.num_pages;
  const startPageCommitments = getStartingPageIndex(
    numPagesCommitments,
    chainPageMetadata.commitment.pages_metadata,
    startingBlock,
  );

  const numPagesUnshields = chainPageMetadata.unshield.num_pages;
  const startPageUnshields = getStartingPageIndex(
    numPagesUnshields,
    chainPageMetadata.unshield.pages_metadata,
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
  const unshieldPageURLs: string[] = getPageURLs(
    gateway,
    chain,
    'unshield',
    pageSize,
    numPagesUnshields,
    startPageUnshields,
  );
  const nullifierPageURLs: string[] = getPageURLs(
    gateway,
    chain,
    'nullifier',
    pageSize,
    numPagesNullifiers,
    startPageNullifiers,
  );

  const [
    commitmentLogBatchUnordered,
    unshieldLogBatchUnordered,
    nullifierLogBatchUnordered,
  ] = await Promise.all([
    Promise.all(
      commitmentPageURLs.map(url => fetchJsonData<CommitmentEvent[]>(url)),
    ),
    Promise.all(
      unshieldPageURLs.map(url => fetchJsonData<UnshieldStoredEvent[]>(url)),
    ),
    Promise.all(nullifierPageURLs.map(url => fetchJsonData<Nullifier[]>(url))),
  ]);

  const commitmentEventsNonnull = removeUndefineds(
    commitmentLogBatchUnordered.flat(),
  );
  const unshieldEventsNonnull = removeUndefineds(
    unshieldLogBatchUnordered.flat(),
  );
  const nullifierEventsNonnull = removeUndefineds(
    nullifierLogBatchUnordered.flat(),
  );

  const eventLogUnordered: AccumulatedEvents = {
    commitmentEvents: commitmentEventsNonnull.filter(
      commitmentEvent => commitmentEvent.blockNumber >= startingBlock,
    ),
    unshieldEvents: unshieldEventsNonnull.filter(
      unshieldEvent => unshieldEvent.blockNumber >= startingBlock,
    ),
    nullifierEvents: nullifierEventsNonnull.filter(
      nullifierEvent => nullifierEvent.blockNumber >= startingBlock,
    ),
  };

  const eventLogOrdered: AccumulatedEvents = {
    commitmentEvents: eventLogUnordered.commitmentEvents.sort(
      (a: CommitmentEvent, b: CommitmentEvent) => {
        return a.treeNumber < b.treeNumber || a.startPosition < b.startPosition
          ? -1
          : 1;
      },
    ),
    unshieldEvents: eventLogUnordered.unshieldEvents,
    nullifierEvents: eventLogUnordered.nullifierEvents,
  };

  if (typeof eventLogOrdered.commitmentEvents !== 'object') {
    throw new Error('Expected object `commitmentEvents` response.');
  }
  if (typeof eventLogOrdered.unshieldEvents !== 'object') {
    throw new Error('Expected object `unshieldEvents` response.');
  }
  if (typeof eventLogOrdered.nullifierEvents !== 'object') {
    throw new Error('Expected object `nullifierEvents` response.');
  }

  return eventLogOrdered;
};

const fetchJsonData = async <ReturnType>(
  url: string,
  retryCount = 1,
): Promise<Optional<ReturnType>> => {
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
    reportAndSanitizeError(fetchJsonData.name, err);
    return undefined;
  }
};
