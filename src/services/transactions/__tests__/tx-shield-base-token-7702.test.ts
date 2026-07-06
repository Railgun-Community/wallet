import { expect } from 'chai';
import Sinon from 'sinon';
import { HDNodeWallet, Provider } from 'ethers';
import {
  RelayAdapt7702Helper,
  RelayAdapt7702ExecutionType,
  ShieldRequestStruct,
  TXIDVersion,
} from '@railgun-community/engine';
import { NetworkName } from '@railgun-community/shared-models';
import { createShieldBaseTokenTransaction7702 } from '../tx-shield-base-token-7702';
import { EphemeralAccount } from '../../railgun/wallets/ephemeral-account';
import * as RelayAdapt7702Execution from '../../railgun/wallets/relay-adapt-7702-execution';

const BYTES32 = `0x${'00'.repeat(32)}`;

const MOCK_SHIELD_REQUEST: ShieldRequestStruct = {
  preimage: {
    npk: BYTES32,
    token: { tokenType: 0, tokenAddress: `0x${'00'.repeat(20)}`, tokenSubID: 0n },
    value: 1000n,
  },
  ciphertext: {
    encryptedBundle: [BYTES32, BYTES32, BYTES32],
    shieldKey: BYTES32,
  },
};

describe('tx-shield-base-token-7702', () => {
  afterEach(() => {
    Sinon.restore();
  });

  // Regression guard for the shield-path authorization-nonce fix. The EIP-7702 authorization
  // nonce must equal the ephemeral EOA's current account nonce; the shield path used to hardcode
  // 0 (stale on a reused ephemeral account -> the authorization is skipped on-chain -> a silent
  // no-op shield). It must now read the live account nonce, matching the cross-contract/unshield
  // paths. Everything except that read is stubbed so the assertion is unambiguous.
  it('reads the ephemeral EOA account nonce live for the 7702 authorization (not a hardcoded 0)', async () => {
    const LIVE_NONCE = 5;
    const getTransactionCount = Sinon.stub().resolves(LIVE_NONCE);
    const fakeProvider = { getTransactionCount } as unknown as Provider;

    const ephemeralAccount = new EphemeralAccount(
      HDNodeWallet.createRandom().connect(fakeProvider),
    );

    // Isolate from the execute-nonce read and real EIP-712 signing.
    Sinon.stub(RelayAdapt7702Execution, 'getRelayAdapt7702ExecutionDetails').resolves({
      executionType: RelayAdapt7702ExecutionType.ExecuteWithNonce,
      executeNonce: 3n,
    });
    const signAuthStub = Sinon.stub(RelayAdapt7702Helper, 'signEIP7702Authorization').resolves(
      {} as never,
    );
    Sinon.stub(RelayAdapt7702Helper, 'signExecutionAuthorization').resolves(`0x${'11'.repeat(65)}`);

    await createShieldBaseTokenTransaction7702(
      TXIDVersion.V2_PoseidonMerkle,
      NetworkName.Ethereum,
      MOCK_SHIELD_REQUEST,
      ephemeralAccount,
    );

    // The account nonce is read live for the ephemeral address...
    expect(
      getTransactionCount.calledOnceWithExactly(ephemeralAccount.address, 'latest'),
    ).to.equal(true);
    // ...and threaded into the authorization as its nonce (4th arg), not a literal 0.
    expect(signAuthStub.calledOnce).to.equal(true);
    expect(signAuthStub.firstCall.args[3]).to.equal(LIVE_NONCE);
    expect(signAuthStub.firstCall.args[3]).to.not.equal(0);
  });
});
