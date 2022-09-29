import { CommitmentEvent } from '@railgun-community/engine/dist/models/event-types';
import { Nullifier } from '@railgun-community/engine/dist/models/formatted-types';
import { sendErrorMessage } from '../../../../utils/logger';
import axios from 'axios';

const MAX_NUM_RETRIES = 3;

export type QuickSyncEventLog = {
  commitmentEvents: CommitmentEvent[];
  nullifierEvents: Nullifier[];
};

export const getRailgunEventLogLegacy = async (
  quickSyncURL: string,
): Promise<QuickSyncEventLog> => {
  const eventLog = await fetchEventLog<QuickSyncEventLog>(quickSyncURL);
  if (eventLog == null) {
    throw new Error('Expected object `eventLog` response.');
  }
  if (typeof eventLog.commitmentEvents !== 'object') {
    throw new Error('Expected object `commitmentEvents` response.');
  }
  if (typeof eventLog.nullifierEvents !== 'object') {
    throw new Error('Expected object `nullifierEvents` response.');
  }

  return eventLog;
};

const fetchEventLog = async <ReturnType>(
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
      return fetchEventLog(url, retryCount + 1);
    }
    sendErrorMessage(err);
    throw new Error(
      'Could not pull historical transactions. Please try again.',
    );
  }
};
