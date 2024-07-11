import { AccumulatedEvents } from '@railgun-community/engine';
import { delay, promiseTimeout } from '@railgun-community/shared-models';

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

  const shouldQueryMore = newResults.length === 10000;
  if (!overLimit && shouldQueryMore) {
    await delay(250);
    return autoPaginatingQuery(
      query,
      lastResult.blockNumber,
      maxQueryResults,
      totalResults,
    );
  }

  return totalResults;
};
