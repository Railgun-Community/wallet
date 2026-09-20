import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Sinon, { SinonStub } from 'sinon';
import { POINodeRequest } from '../poi-node-request';
import {
  NETWORK_CONFIG,
  NetworkName,
  TXIDVersion,
} from '@railgun-community/shared-models';

chai.use(chaiAsPromised);
const { expect } = chai;

let postRequestStub: SinonStub<string[], Promise<boolean>>;

const { chain } = NETWORK_CONFIG[NetworkName.Polygon];

describe('poi-node-request', () => {
  before(() => {
    postRequestStub = Sinon.stub(
      POINodeRequest,
      'jsonRpcRequest' as any,
    ).callsFake(async (url: any) => {
      if ((url as string).includes('400')) {
        throw new Error('400');
      } else {
        return true;
      }
    });
  });
  afterEach(() => {
    postRequestStub.resetHistory();
  });
  after(() => {
    postRequestStub.restore();
  });

  it('Should reject non-https POI node URLs', () => {
    expect(() => new POINodeRequest(['http://poi.example.com'])).to.throw(
      'POI node URLs must use https.',
    );
    expect(() => new POINodeRequest(['ftp://poi.example.com'])).to.throw(
      'POI node URLs must use https.',
    );
    expect(() => new POINodeRequest(['not a url'])).to.throw();
  });

  it('Should allow https and local http POI node URLs', () => {
    expect(
      () =>
        new POINodeRequest([
          'https://poi.example.com',
          'http://localhost:8080',
          'http://127.0.0.1:8080',
        ]),
    ).to.not.throw();
  });

  it('Should fall back to next nodeUrl on failure', async () => {
    const nodeRequest = new POINodeRequest(['https://400.example.com', 'https://200.example.com']);

    const isValid = await nodeRequest.validateRailgunTxidMerkleroot(
      TXIDVersion.V2_PoseidonMerkle,
      chain,
      0,
      0,
      'merkleroot',
    );

    expect(isValid).to.be.true;
    expect(postRequestStub.callCount).to.be.equal(2);
  }).timeout(20_000);

  it('Should return error if all nodeUrls fail', async () => {
    const nodeRequest = new POINodeRequest(['https://400.example.com', 'https://400.example.com']);

    let rejection = false;
    try {
      await nodeRequest.validateRailgunTxidMerkleroot(
        TXIDVersion.V2_PoseidonMerkle,
        chain,
        0,
        0,
        'merkleroot',
      );
    } catch (error) {
      rejection = true;
    }

    expect(rejection).to.be.true;
    expect(postRequestStub.callCount).to.be.equal(3);
  }).timeout(20_000);
});
