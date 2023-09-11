import axios from 'axios';
import { reportAndSanitizeError } from '../../utils/error';

export class POINodes {
  private static urls: string[] = [];
  private static listIDs: string[] = [];

  // TODO: Use better types
  static get = async <T>(route: string, params: any = {}): Promise<T> => {
    // TODO: Choose more than the first url.
    const url = `${POINodes.urls[0]}/${route}`;

    try {
      const rsp: { data: T } = await axios.get(url);
      return rsp.data;
    } catch (err) {
      throw reportAndSanitizeError(url, err);
    }
  };

  // TODO: Use better types
  static post = async <T>(route: string, params: any): Promise<void> => {
    // TODO: Choose more than the first url.
    const url = `${POINodes.urls[0]}/${route}`;

    try {
      await axios.post(url, params);
    } catch (err) {
      throw reportAndSanitizeError(url, err);
    }
  };

  static addNodeURL(url: string) {
    POINodes.urls.unshift(url);
  }

  static addListID(listID: string) {
    POINodes.listIDs.push(listID);
  }
}
