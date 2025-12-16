import { RailgunWallet } from '@railgun-community/engine';
import { Chain } from '@railgun-community/shared-models';
import { EphemeralAccount } from './ephemeral-account';


export class EphemeralKeyManager {
  private railgunWallet: RailgunWallet;
  private encryptionKey: string;

  constructor(railgunWallet: RailgunWallet, encryptionKey: string) {
    this.railgunWallet = railgunWallet;
    this.encryptionKey = encryptionKey;
  }

  async getAccount(index: number): Promise<EphemeralAccount> {
    const wallet = await this.railgunWallet.getEphemeralWallet(this.encryptionKey, index);
    return new EphemeralAccount(wallet);
  }

  async getCurrentAccount(): Promise<EphemeralAccount> {
    const index = await this.railgunWallet.getEphemeralKeyIndex();
    return this.getAccount(index);
  }

  async getNextAccount(): Promise<EphemeralAccount> {
    const currentIndex = await this.railgunWallet.getEphemeralKeyIndex();
    const nextIndex = currentIndex + 1;
    await this.railgunWallet.setEphemeralKeyIndex(nextIndex);
    return this.getAccount(nextIndex);
  }

  async scanHistoryForEphemeralIndex(chain: Chain, scanLimit = 100): Promise<number> {
    const history = await this.railgunWallet.getTransactionHistory(chain, undefined);
    
    // Collect all unshield recipient addresses from history
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
    const GAP_LIMIT = 20; // Stop after 20 unused indices

    // Scan indices until we hit the gap limit or scan limit
    while (currentIndex < scanLimit && gapCount < GAP_LIMIT) {
      // eslint-disable-next-line no-await-in-loop
      const account = await this.getAccount(currentIndex);
      const address = account.address.toLowerCase();

      if (unshieldRecipients.has(address)) {
        maxUsedIndex = currentIndex;
        gapCount = 0; // Reset gap count on match
      } else {
        gapCount += 1;
      }
      currentIndex += 1;
    }

    const nextIndex = maxUsedIndex + 1;
    
    // Update DB if we found a higher index than currently stored
    const storedIndex = await this.railgunWallet.getEphemeralKeyIndex();
    if (nextIndex > storedIndex) {
      await this.railgunWallet.setEphemeralKeyIndex(nextIndex);
    }

    return nextIndex;
  }
}
