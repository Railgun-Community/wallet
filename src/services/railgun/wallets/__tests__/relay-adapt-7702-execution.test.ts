import { expect } from 'chai';
import { Interface, Provider } from 'ethers';
import {
  ABIRelayAdapt7702,
  ABIRelayAdapt7702_Legacy_PreExecuteNonce as abiRelayAdapt7702LegacyPreExecuteNonce,
  RelayAdapt7702,
  RelayAdapt7702ExecutionType,
} from '@railgun-community/engine';
import {
  encodeRelayAdapt7702Execute,
  getRelayAdapt7702ExecuteNonce,
} from '../relay-adapt-7702-execution';

describe('relay-adapt-7702-execution', () => {
  const actionData: RelayAdapt7702.ActionDataStruct = {
    requireSuccess: true,
    minGasLimit: 0n,
    calls: [],
  };
  const signature = '0x1234';
  const ephemeralAddress = '0x0000000000000000000000000000000000000001';

  const createProvider = (
    getCode: () => Promise<string>,
    call?: () => Promise<string>,
  ): Provider => ({
    getCode,
    call,
  } as unknown as Provider);

  it('should return undefined nonce for legacy pre-execute-nonce execution', async () => {
    const provider = createProvider(async () => {
      throw new Error('getCode should not be called');
    });

    const nonce = await getRelayAdapt7702ExecuteNonce(
      provider,
      ephemeralAddress,
      RelayAdapt7702ExecutionType.LegacyPreExecuteNonce,
    );

    expect(nonce).to.be.undefined;
  });

  it('should return on-chain execute nonce when nonce call succeeds', async () => {
    const iface = new Interface(ABIRelayAdapt7702);
    const provider = createProvider(
      async () => '0x7702',
      async () => iface.encodeFunctionResult('nonce', [7n]),
    );

    const nonce = await getRelayAdapt7702ExecuteNonce(
      provider,
      ephemeralAddress,
      RelayAdapt7702ExecutionType.ExecuteWithNonce,
    );

    expect(nonce).to.equal(7n);
  });

  it('should return zero nonce for fresh no-code ephemeral account', async () => {
    const provider = createProvider(
      async () => '0x',
      async () => {
        throw new Error('nonce should not be called');
      },
    );

    const nonce = await getRelayAdapt7702ExecuteNonce(
      provider,
      ephemeralAddress,
      RelayAdapt7702ExecutionType.ExecuteWithNonce,
    );

    expect(nonce).to.equal(0n);
  });

  it('should return zero nonce when nonce call returns empty data', async () => {
    const badDataError = new Error('could not decode result data (value="0x", info={ "method": "nonce", "signature": "nonce()" })') as Error & { code: string };
    badDataError.code = 'BAD_DATA';
    const provider = createProvider(
      async () => '0x7702',
      async () => {
        throw badDataError;
      },
    );

    const nonce = await getRelayAdapt7702ExecuteNonce(
      provider,
      ephemeralAddress,
      RelayAdapt7702ExecutionType.ExecuteWithNonce,
    );

    expect(nonce).to.equal(0n);
  });

  it('should rethrow non-empty nonce read errors', async () => {
    const providerError = new Error('provider unavailable');
    const provider = createProvider(
      async () => '0x7702',
      async () => {
        throw providerError;
      },
    );

    let thrownError: Optional<Error>;
    try {
      await getRelayAdapt7702ExecuteNonce(
        provider,
        ephemeralAddress,
        RelayAdapt7702ExecutionType.ExecuteWithNonce,
      );
    } catch (err) {
      thrownError = err as Error;
    }

    expect(thrownError).to.equal(providerError);
  });

  it('should encode current nonce-aware execute calldata', () => {
    const data = encodeRelayAdapt7702Execute([], actionData, signature, {
      executionType: RelayAdapt7702ExecutionType.ExecuteWithNonce,
      executeNonce: 7n,
    });
    const parsed = new Interface(ABIRelayAdapt7702).parseTransaction({ data });

    expect(parsed?.name).to.equal('execute');
    expect(parsed?.args[2]).to.equal(7n);
    expect(parsed?.args[3]).to.equal(signature);
  });

  it('should encode legacy pre-execute-nonce calldata', () => {
    const data = encodeRelayAdapt7702Execute([], actionData, signature, {
      executionType: RelayAdapt7702ExecutionType.LegacyPreExecuteNonce,
    });
    const parsed = new Interface(abiRelayAdapt7702LegacyPreExecuteNonce).parseTransaction({ data });

    expect(parsed?.name).to.equal('execute');
    expect(parsed?.args[2]).to.equal(signature);
  });
});