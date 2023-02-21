import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  Artifact,
  ArtifactName,
  ipfsHashForArtifact,
} from '@railgun-community/shared-models';
import { initTestEngine } from '../../../tests/setup.test';
import {
  clearArtifactCache,
  overrideArtifact,
  artifactGetterDownloadJustInTime,
} from '../../railgun/core/artifacts';
import { PublicInputs } from '@railgun-community/engine';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('engine', () => {
  beforeEach(() => {
    initTestEngine();
  });

  it('Should set and get artifacts', async () => {
    clearArtifactCache();

    const inputs11By2: PublicInputs = {
      nullifiers: [
        BigInt(1),
        BigInt(1),
        BigInt(1),
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
    await expect(
      artifactGetterDownloadJustInTime.getArtifacts(inputs11By2),
    ).to.be.rejectedWith('No artifacts for inputs: 11-2');

    const artifactGroup: Artifact = {
      [ArtifactName.ZKEY]: Buffer.from('123'),
      [ArtifactName.WASM]: Buffer.from('456'),
      [ArtifactName.DAT]: undefined,
      [ArtifactName.VKEY]: { data: '789' },
    };
    const ipfsHash2By2 = ipfsHashForArtifact(2, 2);
    overrideArtifact(ipfsHash2By2, artifactGroup);

    // Pre-set in test.
    const inputs2By2: PublicInputs = {
      nullifiers: [BigInt(1), BigInt(2)],
      merkleRoot: BigInt(0),
      boundParamsHash: BigInt(0),
      commitmentsOut: [BigInt(0), BigInt(1)],
    };
    await expect(artifactGetterDownloadJustInTime.getArtifacts(inputs2By2)).to
      .be.fulfilled;
  });

  it('Should download artifacts - wasm', async () => {
    // eslint-disable-next-line no-console
    // setLoggers(console.log, console.error);

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

    const artifacts: Artifact =
      await artifactGetterDownloadJustInTime.getArtifacts(inputs);

    expect(artifacts.vkey).to.not.be.undefined;
    expect(artifacts.zkey).to.not.be.undefined;
    expect(artifacts.wasm).to.not.be.undefined;
    expect(artifacts.dat).to.be.undefined;
  }).timeout(10000);
});
