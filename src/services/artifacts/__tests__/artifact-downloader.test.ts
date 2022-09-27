import { PublicInputs } from '@railgun-community/engine/dist/prover';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  ArtifactGroup,
  ArtifactName,
  ArtifactVariant,
} from '@railgun-community/shared-models/dist/models/artifact';
import { initTestEngine } from '../../../test/setup.test';
import { setLoggerFuncs } from '../../../utils/logger';
import {
  clearArtifactCache,
  artifactsGetter,
  overrideArtifact,
} from '../../railgun/core/artifacts';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('engine', () => {
  beforeEach(() => {
    initTestEngine();
  });

  it('Should set and get artifacts', async () => {
    clearArtifactCache();

    const inputs: PublicInputs = {
      nullifiers: [BigInt(1), BigInt(1), BigInt(1), BigInt(1), BigInt(1)],
      merkleRoot: BigInt(0),
      boundParamsHash: BigInt(0),
      commitmentsOut: [BigInt(0), BigInt(1)],
    };
    await expect(artifactsGetter(inputs)).to.be.rejectedWith(
      'Circuit not supported by RAILGUN at this time: 5x2. If withdrawing, try exact amount in wallet. Or, select a different Relayer fee token.',
    );

    const artifactGroup: ArtifactGroup = {
      [ArtifactName.ZKEY]: Buffer.from('123'),
      [ArtifactName.WASM]: Buffer.from('456'),
      [ArtifactName.DAT]: undefined,
      [ArtifactName.VKEY]: { data: '789' },
    };
    overrideArtifact(ArtifactVariant.Variant_2_by_2, artifactGroup);

    // Pre-set in test.
    const inputs2: PublicInputs = {
      nullifiers: [BigInt(1), BigInt(2)],
      merkleRoot: BigInt(0),
      boundParamsHash: BigInt(0),
      commitmentsOut: [BigInt(0), BigInt(1)],
    };
    await expect(artifactsGetter(inputs2)).to.be.fulfilled;
  });

  // Skip because this runs an actual artifact download.
  it.skip('Should download artifacts', async () => {
    // eslint-disable-next-line no-console
    setLoggerFuncs(console.log, console.error);

    clearArtifactCache();

    // Requires download.
    const inputs: PublicInputs = {
      nullifiers: [
        BigInt(1),
        BigInt(1),
        BigInt(1),
        BigInt(1),
        BigInt(1),
        BigInt(1),
        BigInt(1),
        BigInt(1),
      ],
      merkleRoot: BigInt(0),
      boundParamsHash: BigInt(0),
      commitmentsOut: [BigInt(0), BigInt(1)],
    };

    const artifacts = await artifactsGetter(inputs);

    expect(artifacts.vkey).to.not.be.undefined;
    expect(artifacts.zkey).to.not.be.undefined;
    expect(artifacts.wasm).to.not.be.undefined;
    expect(artifacts.dat).to.be.undefined;
  }).timeout(100000);
});
