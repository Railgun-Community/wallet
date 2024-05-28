import { Chain, RailgunTransactionV2 } from '@railgun-community/engine';
import { NetworkName, NETWORK_CONFIG } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  getRailgunTxidsForUnshields,
  quickSyncRailgunTransactionsV2,
} from '../railgun-txid-sync-graph-v2';

chai.use(chaiAsPromised);
const { expect } = chai;

const ETH_CHAIN: Chain = NETWORK_CONFIG[NetworkName.Ethereum].chain;

describe('railgun-txid-sync-graph', () => {
  before(() => {
    NETWORK_CONFIG[NetworkName.Ethereum].poi = {
      launchBlock: 1000,
      launchTimestamp: 1000,
    };

    NETWORK_CONFIG[NetworkName.EthereumSepolia].poi = {
      launchBlock: 1000,
      launchTimestamp: 1000,
    };
  });

  it('Should pull railgun txs subsquid query - Ethereum', async () => {
    const railgunTxs: RailgunTransactionV2[] =
      await quickSyncRailgunTransactionsV2(ETH_CHAIN, undefined);

    expect(railgunTxs).to.be.an('array');
    expect(railgunTxs.length).to.equal(5000);

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
    expect(railgunTxs[0].txid).to.equal(
      'f07a9a458f57f1cc9cc2e5a627c3ef611a18b77e10c2bfc133fceca7743f8d0c',
    );
    expect(railgunTxs[0].utxoTreeIn).to.equal(0);
    expect(railgunTxs[0].utxoTreeOut).to.equal(0);
    expect(railgunTxs[0].utxoBatchStartPositionOut).to.equal(2);
    expect(railgunTxs[0].unshield).to.equal(undefined);
    expect(railgunTxs[0].blockNumber).to.equal(14755920);
    expect(railgunTxs[0].verificationHash).to.equal(
      '0x099cd3ebcadaf6ff470d16bc0186fb5f26cd4103e9970effc9b6679478e11c72',
    );
  }).timeout(20_000);

  it('Should pull unshield railgun txids - Ethereum', async () => {
    const unshieldRailgunTxids: string[] = await getRailgunTxidsForUnshields(
      ETH_CHAIN,
      '0x0b3b7179df1377c0a13058508e7dff2dbe8f73c39d68f569bc90b1c8b277082e',
    );

    expect(unshieldRailgunTxids).to.deep.equal([
      '065bcb1a9d4cfa110f05b480f79f27fe2ad672868d3d1bdec05df2ddaec8333d',
    ]);
  }).timeout(20000);

  it('Should pull railgun txs subsquid query - Sepolia', async () => {
    const railgunTxs: RailgunTransactionV2[] =
      await quickSyncRailgunTransactionsV2(ETH_CHAIN, undefined);

    expect(railgunTxs).to.be.an('array');
    expect(railgunTxs.length).to.equal(5000);

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
    expect(railgunTxs[0].txid).to.equal(
      'f07a9a458f57f1cc9cc2e5a627c3ef611a18b77e10c2bfc133fceca7743f8d0c',
    );
    expect(railgunTxs[0].utxoTreeIn).to.equal(0);
    expect(railgunTxs[0].utxoTreeOut).to.equal(0);
    expect(railgunTxs[0].utxoBatchStartPositionOut).to.equal(2);
    expect(railgunTxs[0].unshield).to.equal(undefined);
    expect(railgunTxs[0].blockNumber).to.equal(14755920);
    expect(railgunTxs[0].verificationHash).to.equal(
      '0x099cd3ebcadaf6ff470d16bc0186fb5f26cd4103e9970effc9b6679478e11c72',
    );
  }).timeout(20_000);

  it('Should pull unshield railgun txids - Sepolia', async () => {
    const unshieldRailgunTxids: string[] = await getRailgunTxidsForUnshields(
      ETH_CHAIN,
      '0x0b3b7179df1377c0a13058508e7dff2dbe8f73c39d68f569bc90b1c8b277082e',
    );

    expect(unshieldRailgunTxids).to.deep.equal([
      '065bcb1a9d4cfa110f05b480f79f27fe2ad672868d3d1bdec05df2ddaec8333d',
    ]);
  }).timeout(20000);
});
