import { expect } from 'chai';
import { Interface } from 'ethers';
import {
  ABIRelayAdapt7702,
  ABIRelayAdapt7702_Legacy_PreExecuteNonce,
  RelayAdapt7702,
  RelayAdapt7702ExecutionType,
} from '@railgun-community/engine';
import { encodeRelayAdapt7702Execute } from '../relay-adapt-7702-execution';

describe('relay-adapt-7702-execution', () => {
  const actionData: RelayAdapt7702.ActionDataStruct = {
    requireSuccess: true,
    minGasLimit: 0n,
    calls: [],
  };
  const signature = '0x1234';

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
    const parsed = new Interface(ABIRelayAdapt7702_Legacy_PreExecuteNonce).parseTransaction({ data });

    expect(parsed?.name).to.equal('execute');
    expect(parsed?.args[2]).to.equal(signature);
  });
});