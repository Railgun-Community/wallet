import { expect } from 'chai';
import { Interface, Provider, Wallet, verifyTypedData } from 'ethers';
import {
  ABIRelayAdapt7702,
  ABIRelayAdapt7702_Legacy_PreExecuteNonce as abiRelayAdapt7702LegacyPreExecuteNonce,
  RelayAdapt7702,
  RelayAdapt7702ExecutionType,
  RelayAdapt7702Helper,
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

  // Binding guard: the execute nonce that is SIGNED must equal the one that is ENCODED, at a
  // nonce > 0 (the production steady state — the ephemeral account is reused). The existing
  // encode test only checks the encoded side; a regression that signed one nonce and encoded
  // another would revert on-chain (signature recovers to the wrong address) yet still pass an
  // encode-only assertion. This drives the real sign + encode primitives with one shared
  // executionDetails and proves they agree — and that the agreement is nonce-sensitive.
  it('binds the signed execute nonce to the encoded calldata nonce (nonce > 0)', async () => {
    const signer = Wallet.createRandom();
    const chainId = 1n;
    const executeNonce = 7n;
    const executionDetails = {
      executionType: RelayAdapt7702ExecutionType.ExecuteWithNonce,
      executeNonce,
    };

    const executionSignature = await RelayAdapt7702Helper.signExecutionAuthorization(
      signer,
      [],
      actionData,
      chainId,
      executionDetails,
    );

    // Encode with the SAME executionDetails object the signature was produced from.
    const data = encodeRelayAdapt7702Execute([], actionData, executionSignature, executionDetails);
    const parsed = new Interface(ABIRelayAdapt7702).parseTransaction({ data });
    expect(parsed?.args[2]).to.equal(executeNonce); // encoded nonce == 7

    const domain = {
      name: 'RelayAdapt7702',
      version: '1',
      chainId,
      verifyingContract: signer.address,
    };
    const types = { Execute: [{ name: 'payloadHash', type: 'bytes32' }] };

    // Recovering over the nonce-7 payload returns the signer -> it was SIGNED over nonce 7.
    expect(
      verifyTypedData(
        domain,
        types,
        { payloadHash: RelayAdapt7702Helper.getExecutePayloadHash([], actionData, executionDetails) },
        executionSignature,
      ),
    ).to.equal(signer.address);

    // ...and the binding is nonce-sensitive: recovering over nonce 0 must NOT match, so a
    // sign-0/encode-7 divergence would be caught (on-chain it would revert).
    expect(
      verifyTypedData(
        domain,
        types,
        {
          payloadHash: RelayAdapt7702Helper.getExecutePayloadHash([], actionData, {
            executionType: RelayAdapt7702ExecutionType.ExecuteWithNonce,
            executeNonce: 0n,
          }),
        },
        executionSignature,
      ),
    ).to.not.equal(signer.address);
  });
});