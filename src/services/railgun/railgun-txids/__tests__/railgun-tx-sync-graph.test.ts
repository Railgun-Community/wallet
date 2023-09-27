import { Chain, RailgunTransaction } from '@railgun-community/engine';
import { NetworkName, NETWORK_CONFIG } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { MOCK_ETH_WALLET_ADDRESS } from '../../../../tests/mocks.test';
import {
  getUnshieldRailgunTransactionBlindedCommitmentGroups,
  quickSyncRailgunTransactions,
} from '../railgun-tx-sync-graph';

chai.use(chaiAsPromised);
const { expect } = chai;

const ETH_CHAIN: Chain = NETWORK_CONFIG[NetworkName.Ethereum].chain;

const ETH_GOERLI_CHAIN: Chain =
  NETWORK_CONFIG[NetworkName.EthereumGoerli].chain;

describe('railgun-tx-sync-graph', () => {
  before(() => {
    NETWORK_CONFIG[NetworkName.Ethereum].poi = { launchBlock: 1000 };
  });

  it('Should pull railgun txs subgraph query - Ethereum', async () => {
    const railgunTxs: RailgunTransaction[] = await quickSyncRailgunTransactions(
      ETH_CHAIN,
      undefined,
    );

    expect(railgunTxs).to.be.an('array');
    expect(railgunTxs.length).to.be.greaterThan(8000);

    expect(railgunTxs[0].commitments).to.deep.equal([
      '0x1afd01a29faf22dcc5678694092a08d38de99fc97d07b9281fa66f956ce43579',
      '0x2ffc716d8ae767995961bbde4a208dbae438783065bbd200f51a8d4e97cc2289',
      '0x078f9824c86b2488714eb76dc15199c3fa21903517d5f3e19ab2035d264400b6',
    ]);
    expect(railgunTxs[0].nullifiers).to.deep.equal([
      '0x1e52cee52f67c37a468458671cddde6b56390dcbdc4cf3b770badc0e78d66401',
      '0x0ac9f5ab5bcb5a115a3efdd0475f6c22dc6a6841caf35a52ecf86a802bfce8ee',
    ]);
    expect(railgunTxs[0].graphID).to.equal(
      '0x0000000000000000000000000000000000000000000000000000000000e1285000000000000000000000000000000000000000000000000000000000000001500000000000000000000000000000000000000000000000000000000000000000',
    );
    expect(railgunTxs[0].boundParamsHash).to.equal(
      '0x2c72a0bcce4f1169dd988204775483938ded5f5899cec84829b1cc667a683784',
    );
    expect(railgunTxs[0].blockNumber).to.equal(14755920);
  }).timeout(20000);

  it('Should pull unshield railgun txids - Ethereum', async () => {
    const unshieldBlindedCommitmentGroups: string[][] =
      await getUnshieldRailgunTransactionBlindedCommitmentGroups(
        ETH_CHAIN,
        '0x0b3b7179df1377c0a13058508e7dff2dbe8f73c39d68f569bc90b1c8b277082e',
        MOCK_ETH_WALLET_ADDRESS,
      );

    expect(unshieldBlindedCommitmentGroups).to.deep.equal([
      [
        '0x14b7dd1d4774c091325f3229b8cb425732fa550477a48f90a92f5260ce6e8bce',
        '0x1e3d0f05021d51c4e65542b230ba79bea924ef2e38736e7071385a251f46a271',
        '0x133fb78507782c58009fe2df49ec62ce28db39e4de426033cce0942f47c03f29',
      ],
    ]);
  }).timeout(20000);

  it('Should pull railgun txs subgraph query - Goerli', async () => {
    const railgunTxs: RailgunTransaction[] = await quickSyncRailgunTransactions(
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
    expect(railgunTxs[0].blockNumber).to.equal(7826407);
  }).timeout(20000);

  it('Should pull unshield railgun txids - Goerli', async () => {
    const unshieldBlindedCommitmentGroups: string[][] =
      await getUnshieldRailgunTransactionBlindedCommitmentGroups(
        ETH_GOERLI_CHAIN,
        '0x3f0648eec7be61c7154013f5ecdf01cec48f0b0161f235b240c0f1ae94c3bbc1',
        MOCK_ETH_WALLET_ADDRESS,
      );

    expect(unshieldBlindedCommitmentGroups).to.deep.equal([
      [
        '0x17beae543aebb258a29b1414a2350191b93e5154c31a6cdd3968f91203acc9c5',
        '0x25fa992b327695d74c10b1f89b7fb5e8b5416a218f5a3698a22b480d5284a707',
      ],
    ]);
  }).timeout(20000);
});
