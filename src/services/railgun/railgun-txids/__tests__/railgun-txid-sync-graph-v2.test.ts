import { RailgunTransactionV2 } from '@railgun-community/engine';
import { NetworkName, NETWORK_CONFIG } from '@railgun-community/shared-models';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  getRailgunTxidsForUnshields,
  quickSyncRailgunTransactionsV2,
} from '../railgun-txid-sync-graph-v2';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('railgun-txid-sync-graph', () => {
  it('Should pull railgun txs subsquid query - Ethereum', async () => {
    const railgunTxs: RailgunTransactionV2[] =
      await quickSyncRailgunTransactionsV2(
        NETWORK_CONFIG[NetworkName.Ethereum].chain,
        undefined,
      );

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
      NETWORK_CONFIG[NetworkName.Ethereum].chain,
      '0x0b3b7179df1377c0a13058508e7dff2dbe8f73c39d68f569bc90b1c8b277082e',
    );

    expect(unshieldRailgunTxids).to.deep.equal([
      '065bcb1a9d4cfa110f05b480f79f27fe2ad672868d3d1bdec05df2ddaec8333d',
    ]);
  }).timeout(20000);

  it('Should pull railgun txs subsquid query - Polygon', async () => {
    const railgunTxs: RailgunTransactionV2[] =
      await quickSyncRailgunTransactionsV2(
        NETWORK_CONFIG[NetworkName.Polygon].chain,
        undefined,
      );

    expect(railgunTxs).to.be.an('array');
    expect(railgunTxs.length).to.equal(5000);

    expect(railgunTxs[0].commitments).to.deep.equal([
      '0x06c764e6221b61792530c5d6d33710b9cd4c4d4f734265a4e9070cf081436079',
      '0x140459c3519d73d56d292fd6d51292980f640623f008a4df063d387a819a7451',
      '0x23303173569d99ffd5799f526bd53cb81073e2d6e9ff8f4b07bed8d948722673',
    ]);
    expect(railgunTxs[0].nullifiers).to.deep.equal([
      '0x1e52cee52f67c37a468458671cddde6b56390dcbdc4cf3b770badc0e78d66401',
    ]);
    expect(railgunTxs[0].graphID).to.equal(
      '0x0000000000000000000000000000000000000000000000000000000001ae397e00000000000000000000000000000000000000000000000000000000000000260000000000000000000000000000000000000000000000000000000000000000',
    );
    expect(railgunTxs[0].boundParamsHash).to.equal(
      '0x251fcceba8b19129e88aff1e5214ad6f2a807e4a095075e55873aa59416111a2',
    );
    expect(railgunTxs[0].txid).to.equal(
      '65df130da6a571fbcceb8538400f37bcaa4fe508caec7ab05f3b438f303bfe31',
    );
    expect(railgunTxs[0].utxoTreeIn).to.equal(0);
    expect(railgunTxs[0].utxoTreeOut).to.equal(0);
    expect(railgunTxs[0].utxoBatchStartPositionOut).to.equal(2);
    expect(railgunTxs[0].unshield).to.equal(undefined);
    expect(railgunTxs[0].blockNumber).to.equal(28195198);
    expect(railgunTxs[0].verificationHash).to.equal(
      '0x099cd3ebcadaf6ff470d16bc0186fb5f26cd4103e9970effc9b6679478e11c72',
    );
  }).timeout(20_000);

  it('Should pull unshield railgun txids - Polygon', async () => {
    const unshieldRailgunTxids: string[] = await getRailgunTxidsForUnshields(
      NETWORK_CONFIG[NetworkName.Polygon].chain,
      '0x7310a30b3a0dcec299917d5cd7ef2feab8c0507c41ec17649f38a21b4093dc32',
    );

    expect(unshieldRailgunTxids).to.deep.equal([
      '113827d5fea4ebacffc3ab7289e6185d328c51c5f59ecbcd874d8f73e5638e27',
    ]);
  }).timeout(20000);

  it('Should pull railgun txs subsquid query - Arbitrum', async () => {
    const railgunTxs: RailgunTransactionV2[] =
      await quickSyncRailgunTransactionsV2(
        NETWORK_CONFIG[NetworkName.Arbitrum].chain,
        undefined,
      );

    expect(railgunTxs).to.be.an('array');
    expect(railgunTxs.length).to.equal(5000);

    expect(railgunTxs[0].commitments).to.deep.equal([
      '0x0bb9f2d13f87b8ba19b7f5bb7750148faeb0fed4a97bc6c3e63d7fe2a7b6d63e',
      '0x217fb14374fcc4eca2d92c204bad0b2b36f6787e3268ae4740c992c632f7691c',
    ]);
    expect(railgunTxs[0].nullifiers).to.deep.equal([
      '0x25234f8100ee0b86e2f331f255d982ba60d05710ceae8f226f6254addd362b1f',
    ]);
    expect(railgunTxs[0].graphID).to.equal(
      '0x00000000000000000000000000000000000000000000000000000000039dd19000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000',
    );
    expect(railgunTxs[0].boundParamsHash).to.equal(
      '0x2bb2954938dfcfdcc47253fd59d2225fc98feab293eb1bc80eff5d9d79de05a2',
    );
    expect(railgunTxs[0].txid).to.equal(
      'cb4293e3a81241ef8b6c48285e4860222d9c147da8583aa1d53a7117f230c368',
    );
    expect(railgunTxs[0].utxoTreeIn).to.equal(0);
    expect(railgunTxs[0].utxoTreeOut).to.equal(0);
    expect(railgunTxs[0].utxoBatchStartPositionOut).to.equal(1);
    expect(railgunTxs[0].unshield).to.deep.equal({
      tokenData: {
        tokenType: 0,
        tokenAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        tokenSubID: '0x00',
      },
      toAddress: '0x5ad95c537b002770a39dea342c4bb2b68b1497aa',
      value: '1000000000000000',
    });
    expect(railgunTxs[0].blockNumber).to.equal(60674448);
    expect(railgunTxs[0].verificationHash).to.equal(
      '0x4f7406636df927247b46552673d024567d99fd60e5fb50159ba47a170580308a',
    );
  }).timeout(20_000);

  it('Should pull unshield railgun txids - Arbitrum', async () => {
    const unshieldRailgunTxids: string[] = await getRailgunTxidsForUnshields(
      NETWORK_CONFIG[NetworkName.Arbitrum].chain,
      '0xcb4293e3a81241ef8b6c48285e4860222d9c147da8583aa1d53a7117f230c368',
    );

    expect(unshieldRailgunTxids).to.deep.equal([
      '1bef936762f21323e57539cdf4b87251279b34880881ae003219058dacc258a7',
    ]);
  }).timeout(20000);

  it('Should pull railgun txs subsquid query - BNBChain', async () => {
    const railgunTxs: RailgunTransactionV2[] =
      await quickSyncRailgunTransactionsV2(
        NETWORK_CONFIG[NetworkName.BNBChain].chain,
        undefined,
      );

    expect(railgunTxs).to.be.an('array');
    expect(railgunTxs.length).to.equal(5000);

    expect(railgunTxs[0].commitments).to.deep.equal([
      '0x2f1f83e339c05d14f102088c0c3f2b8f8addbd8497a88ef49a1e9c942bbb0f87',
      '0x275c216c06fd5e68bb65f46f85e93afb563f9bad08b2eaf222a38ce6d848c004',
    ]);
    expect(railgunTxs[0].nullifiers).to.deep.equal([
      '0x1866ea0094491975f18fa92ba6fac7c2f562bbc49e975866643108dd15f0a6b2',
    ]);
    expect(railgunTxs[0].graphID).to.equal(
      '0x00000000000000000000000000000000000000000000000000000000010f2d7b000000000000000000000000000000000000000000000000000000000000003f0000000000000000000000000000000000000000000000000000000000000000',
    );
    expect(railgunTxs[0].boundParamsHash).to.equal(
      '0x0d0cc0770e4915c2b841f394834c0e3b2d5807642c23a9578a1bbc80f8b47f6a',
    );
    expect(railgunTxs[0].txid).to.equal(
      '4388f3727fe7f9cfd0d57807f7a2a126fbb7e56a25a17e3e99102931ea2e4b33',
    );
    expect(railgunTxs[0].utxoTreeIn).to.equal(0);
    expect(railgunTxs[0].utxoTreeOut).to.equal(0);
    expect(railgunTxs[0].utxoBatchStartPositionOut).to.equal(4);
    expect(railgunTxs[0].unshield).to.equal(undefined);
    expect(railgunTxs[0].blockNumber).to.equal(17771899);
    expect(railgunTxs[0].verificationHash).to.equal(
      '0x5052ad94d14b1f0a16fa8ca6680f9736a357cc73798695d3e1247ca95483415c',
    );
  }).timeout(20_000);

  it('Should pull unshield railgun txids - BNBChain', async () => {
    const unshieldRailgunTxids: string[] = await getRailgunTxidsForUnshields(
      NETWORK_CONFIG[NetworkName.BNBChain].chain,
      '0xcef99c75d555b81625e5e96304716b04bd6900d99b664fda7d5a89265dca3c38',
    );

    expect(unshieldRailgunTxids).to.deep.equal([
      '27fe3f9eef756cba48cf2850935c20dc7faf36911fe2cc43b69b4650912e09e0',
    ]);
  }).timeout(20000);

  it('Should pull railgun txs subsquid query - Sepolia', async () => {
    const railgunTxs: RailgunTransactionV2[] =
      await quickSyncRailgunTransactionsV2(
        NETWORK_CONFIG[NetworkName.EthereumSepolia].chain,
        undefined,
      );

    expect(railgunTxs).to.be.an('array');
    expect(railgunTxs.length).to.be.greaterThanOrEqual(10);

    expect(railgunTxs[0].commitments).to.deep.equal([
      '0x213b8672321b8b6d4165528e3146b1c25da4656fd93db74efa3258416e20b5d9',
      '0x14b55264849684c1d549c44b469e1047d67f06bfdb6aa22f1d14e1c545d749a5',
    ]);
    expect(railgunTxs[0].nullifiers).to.deep.equal([
      '0x25234f8100ee0b86e2f331f255d982ba60d05710ceae8f226f6254addd362b1f',
    ]);
    expect(railgunTxs[0].graphID).to.equal(
      '0x00000000000000000000000000000000000000000000000000000000005b001e000000000000000000000000000000000000000000000000000000000000003b0000000000000000000000000000000000000000000000000000000000000000',
    );
    expect(railgunTxs[0].boundParamsHash).to.equal(
      '0x1a2fec90b4354f18153226a457bc24fe480fa816f2cf8ae13419be7938f80b51',
    );
    expect(railgunTxs[0].txid).to.equal(
      'e629e8f89ab98fee9dadacb9323746e4c150dee57917218509e94d9e35cc1db0',
    );
    expect(railgunTxs[0].utxoTreeIn).to.equal(0);
    expect(railgunTxs[0].utxoTreeOut).to.equal(0);
    expect(railgunTxs[0].utxoBatchStartPositionOut).to.equal(1);
    expect(railgunTxs[0].unshield).to.deep.equal({
      tokenData: {
        tokenType: 0,
        tokenAddress: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
        tokenSubID: '0x00',
      },
      toAddress: '0x7e3d929ebd5bdc84d02bd3205c777578f33a214d',
      value: '10025062656641604',
    });
    expect(railgunTxs[0].blockNumber).to.equal(5963806);
    expect(railgunTxs[0].verificationHash).to.equal(
      '0x4f7406636df927247b46552673d024567d99fd60e5fb50159ba47a170580308a',
    );
  }).timeout(20_000);

  it('Should pull unshield railgun txids - Sepolia', async () => {
    const unshieldRailgunTxids: string[] = await getRailgunTxidsForUnshields(
      NETWORK_CONFIG[NetworkName.EthereumSepolia].chain,
      '0xe629e8f89ab98fee9dadacb9323746e4c150dee57917218509e94d9e35cc1db0',
    );

    expect(unshieldRailgunTxids).to.deep.equal([
      '1acb0bd1981ecdf3652d3580b72bcb97cbfe635abf66e339d8e6d8577184f65e',
    ]);
  }).timeout(20000);
});
