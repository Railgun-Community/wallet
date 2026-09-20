import chai from 'chai';
import { NETWORK_CONFIG, NetworkName } from '@railgun-community/shared-models';
import { TransactionReceipt, TransactionResponse } from 'ethers';
import { getTokenOwnerWithFallback } from '../token-owner';

const { expect } = chai;

const TRANSFER_SIGNATURE =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const PROXY = NETWORK_CONFIG[NetworkName.Polygon].proxyContract;
const TOKEN = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const FAKE_TOKEN = '0x9999999999999999999999999999999999999999';
const OWNER = '0x1234567890123456789012345678901234567890';
const ATTACKER = '0x6666666666666666666666666666666666666666';
const TX_FROM = '0x9876543210987654321098765432109876543210';

const pad = (address: string) =>
  `0x${address.toLowerCase().replace('0x', '').padStart(64, '0')}`;

const transferLog = (tokenAddress: string, from: string, to: string) => ({
  address: tokenAddress,
  topics: [TRANSFER_SIGNATURE, pad(from), pad(to)],
});

const getOwner = (
  logs: ReturnType<typeof transferLog>[],
  shieldedTokens: string[],
) =>
  getTokenOwnerWithFallback(
    { logs } as unknown as TransactionReceipt,
    { from: TX_FROM } as unknown as TransactionResponse,
    PROXY,
    NetworkName.Polygon,
    shieldedTokens,
  );

describe('token-owner', () => {
  it('Should use the Transfer sender for a shielded token', async () => {
    const owner = await getOwner([transferLog(TOKEN, OWNER, PROXY)], [TOKEN]);
    expect(owner).to.equal(OWNER);
  });

  it('Should match token addresses case-insensitively', async () => {
    const owner = await getOwner(
      [transferLog(TOKEN.toUpperCase().replace('0X', '0x'), OWNER, PROXY)],
      [TOKEN.toLowerCase()],
    );
    expect(owner).to.equal(OWNER);
  });

  it('Should ignore Transfer events from contracts that are not shielded tokens', async () => {
    const owner = await getOwner(
      [transferLog(FAKE_TOKEN, ATTACKER, PROXY)],
      [TOKEN],
    );
    expect(owner).to.equal(TX_FROM);
  });

  it('Should not let a fake event override the real token owner', async () => {
    const owner = await getOwner(
      [
        transferLog(FAKE_TOKEN, ATTACKER, PROXY),
        transferLog(TOKEN, OWNER, PROXY),
      ],
      [TOKEN],
    );
    expect(owner).to.equal(OWNER);
  });

  it('Should fall back to tx.from when no shielded tokens are known', async () => {
    const owner = await getOwner([transferLog(TOKEN, OWNER, PROXY)], []);
    expect(owner).to.equal(TX_FROM);
  });
});
