import { NETWORK_CONFIG, NetworkName } from '@railgun-community/shared-models';
import { TransactionReceipt, TransactionResponse } from 'ethers';
import { sendErrorMessage } from '../../utils/logger';

const ERC20_TRANSFER_EVENT_SIGNATURE =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

async function extractTokenOwnerFromTransferEvents(
  receipt: TransactionReceipt,
  railgunContractAddress: string,
  shieldedTokenAddresses: string[],
): Promise<string> {
  const railgunAddressLower = railgunContractAddress.toLowerCase();
  const shieldedTokenAddressesLower = new Set(
    shieldedTokenAddresses.map(address => address.toLowerCase()),
  );

  const potentialOwners: Set<string> = new Set();

  for (const log of receipt.logs) {
    try {
      if (log.topics.length < 3) {
        continue;
      }

      if (log.topics[0] !== ERC20_TRANSFER_EVENT_SIGNATURE) {
        continue;
      }
      // Any contract can emit a Transfer-shaped event. Only trust logs
      // emitted by a token that was actually shielded to this wallet.
      if (!shieldedTokenAddressesLower.has(log.address.toLowerCase())) {
        continue;
      }
      // topics[0] = event signature hash
      const toAddress = `0x${log.topics[2].slice(-40).toLowerCase()}`;

      if (toAddress === railgunAddressLower) {
        const fromAddress = `0x${log.topics[1].slice(-40).toLowerCase()}`;
        potentialOwners.add(fromAddress);
      }
    } catch (error) {
      sendErrorMessage(
        new Error('Error parsing log for token owner extraction', {
          cause: error,
        }),
      );
      continue;
    }
  }

  if (potentialOwners.size === 1) {
    const [owner] = Array.from(potentialOwners);
    return owner;
  }
  // this handles cases where there are multiple deposits in one transaction
  if (potentialOwners.size > 1) {
    const [firstOwner] = Array.from(potentialOwners);
    return firstOwner;
  }

  throw new Error(
    'Could not find token owner: No Transfer event to Railgun contract detected in transaction'
  );
}

export async function getTokenOwnerWithFallback(
  receipt: TransactionReceipt,
  transaction: TransactionResponse,
  railgunContractAddress: string,
  networkName: NetworkName,
  shieldedTokenAddresses: string[],
): Promise<string> {
  try {
    // first attempt is try to extract from Transfer events
    const tokenOwner = await extractTokenOwnerFromTransferEvents(
      receipt,
      railgunContractAddress,
      shieldedTokenAddresses,
    );

    const normalizedTokenOwner = tokenOwner.toLowerCase()
    const normalizedRelayAdaptAddresses = [
      NETWORK_CONFIG[networkName].relayAdaptContract.toLowerCase(),
      ...NETWORK_CONFIG[networkName].relayAdaptHistory.map(a=>a.toLowerCase())
    ]

    if(normalizedRelayAdaptAddresses.includes(normalizedTokenOwner)){
      return transaction.from;
    }

    return tokenOwner;
  } catch (error) {
    return transaction.from;
  }
}
