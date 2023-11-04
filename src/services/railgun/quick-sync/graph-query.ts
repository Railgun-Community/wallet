import { AccumulatedEvents } from '@railgun-community/engine';
import { promiseTimeout } from '@railgun-community/shared-models';

export const EMPTY_EVENTS: AccumulatedEvents = {
  commitmentEvents: [],
  unshieldEvents: [],
  nullifierEvents: [],
};

export const autoPaginatingQuery = async <
  ReturnType extends { blockNumber: string },
>(
  query: (blockNumber: string) => Promise<ReturnType[]>,
  blockNumber: string,
  maxQueryResults: number,
  prevResults: ReturnType[] = [],
): Promise<ReturnType[]> => {
  const newResults = await promiseTimeout(
    query(blockNumber),
    20000,
    new Error('Timeout querying Graph for QuickSync of RAILGUN Events'),
  );
  if (newResults.length === 0) {
    return prevResults;
  }

  const totalResults = prevResults.concat(newResults);

  const overLimit = totalResults.length >= maxQueryResults;
  const lastResult = totalResults[totalResults.length - 1];

  const shouldQueryMore = newResults.length === 1000;
  if (!overLimit && shouldQueryMore) {
    return autoPaginatingQuery(
      query,
      lastResult.blockNumber,
      maxQueryResults,
      totalResults,
    );
  }

  return totalResults;
};
