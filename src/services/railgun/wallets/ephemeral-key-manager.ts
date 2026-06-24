import { RailgunWallet } from '@railgun-community/engine';
import { Chain } from '@railgun-community/shared-models';
import { EphemeralAccount } from './ephemeral-account';


export class EphemeralKeyManager {
  private railgunWallet: RailgunWallet;
  private encryptionKey: string;
  private mnemonicPassword?: string;

  constructor(railgunWallet: RailgunWallet, encryptionKey: string, mnemonicPassword?: string) {
    this.railgunWallet = railgunWallet;
    this.encryptionKey = encryptionKey;
    this.mnemonicPassword = mnemonicPassword;
  }

  async getAccount(chainId: bigint, index: number): Promise<EphemeralAccount> {
    const wallet = await this.railgunWallet.getEphemeralWallet(
      this.encryptionKey,
      chainId,
      index,
      this.mnemonicPassword,
    );
    return new EphemeralAccount(wallet);
  }

  async getCurrentAccount(chainId: bigint): Promise<EphemeralAccount> {
    const index = await this.railgunWallet.getEphemeralKeyIndex(chainId);
    return this.getAccount(chainId, index);
  }

  async getNextAccount(chainId: bigint): Promise<EphemeralAccount> {
    // Use the engine's atomic, per-chain-serialized ratchet so concurrent callers can't
    // reuse the same ephemeral key/nonce.
    const nextIndex = await this.railgunWallet.incrementEphemeralKeyIndex(chainId);
    return this.getAccount(chainId, nextIndex);
  }

  async scanHistoryForEphemeralIndex(
    chain: Chain,
    scanLimit = 100,
  ): Promise<number> {
    const chainId = BigInt(chain.id);
    const history = await this.railgunWallet.getTransactionHistory(chain, undefined);

    const unshieldRecipients = new Set<string>();
    for (const entry of history) {
      for (const unshield of entry.unshieldTokenAmounts) {
        unshieldRecipients.add(unshield.recipientAddress.toLowerCase());
      }
    }

    if (unshieldRecipients.size === 0) {
      return 0;
    }

    let maxUsedIndex = -1;
    let currentIndex = 0;
    let gapCount = 0;
    const gapLimit = 20;

    while (currentIndex < scanLimit && gapCount < gapLimit) {
      // eslint-disable-next-line no-await-in-loop
      const account = await this.getAccount(chainId, currentIndex);
      const address = account.address.toLowerCase();

      if (unshieldRecipients.has(address)) {
        maxUsedIndex = currentIndex;
        gapCount = 0;
      } else {
        gapCount += 1;
      }
      currentIndex += 1;
    }

    // Raise the stored index atomically so a concurrent ratchet cannot be clobbered.
    const nextIndex = maxUsedIndex + 1;
    return this.railgunWallet.setEphemeralKeyIndexIfGreater(chainId, nextIndex);
  }
}
