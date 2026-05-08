import { HDNodeWallet } from 'ethers';

export class EphemeralAccount {
  private wallet: HDNodeWallet;

  constructor(wallet: HDNodeWallet) {
    this.wallet = wallet;
  }

  get address(): string {
    return this.wallet.address;
  }

  get signer(): HDNodeWallet {
    return this.wallet;
  }
}