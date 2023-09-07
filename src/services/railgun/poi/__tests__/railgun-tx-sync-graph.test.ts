import { Chain } from '@railgun-community/engine';
import { NetworkName, NETWORK_CONFIG } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { syncPOIRailgunTxsFromSubgraph } from '../railgun-tx-sync-graph';

chai.use(chaiAsPromised);
const { expect } = chai;

const ETH_GOERLI_CHAIN: Chain =
  NETWORK_CONFIG[NetworkName.EthereumGoerli].chain;

describe('railgun-tx-sync-graph', () => {
  it('Should pull railgun txs subgraph query - Goerli', async () => {
    const railgunTxs = await syncPOIRailgunTxsFromSubgraph(
      ETH_GOERLI_CHAIN,
      undefined,
    );

    expect(railgunTxs).to.be.an('array');
    expect(railgunTxs.length).to.be.greaterThan(1000);

    expect(railgunTxs[0].commitments).to.deep.equal([
      '0x0f6104cf7b8f304e8a5fe224f3c291dedc7ff7f0865edb154171bcfa0d299e67',
      '0x165bf0d1cc1061ee5efa4037fbb9217e70f2c681f4b0d013adbcb115722709e2',
      '0x285a55d56266817bbf781452979e472a5fcca7fc5bb4582a33e4a7572b6f3e46',
    ]);
    expect(railgunTxs[0].nullifiers).to.deep.equal([
      '0x1e52cee52f67c37a468458671cddde6b56390dcbdc4cf3b770badc0e78d66401',
    ]);
    expect(railgunTxs[0].graphID).to.equal(
      '0x0000000000000000000000000000000000000000000000000000000000776be700000000000000000000000000000000000000000000000000000000000000290000000000000000000000000000000000000000000000000000000000000000',
    );
    expect(railgunTxs[0].boundParamsHash).to.equal(
      '0x0241df5c3ddca93c4bc340a10f628c7dff4acb0657469836836a2e824a4a000b',
    );
  }).timeout(20000);
});
