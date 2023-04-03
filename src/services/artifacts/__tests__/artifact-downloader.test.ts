import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Artifact, ArtifactName } from '@railgun-community/shared-models';
import { initTestEngine } from '../../../tests/setup.test';
import {
  clearArtifactCache,
  overrideArtifact,
  artifactGetterDownloadJustInTime,
  artifactCache,
  setUseNativeArtifacts,
} from '../../railgun/core/artifacts';
import { PublicInputs } from '@railgun-community/engine';
import { getArtifactVariantString } from '../artifact-util';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('artifact-downloader', () => {
  before(() => {
    const useNativeArtifacts = false;
    initTestEngine(useNativeArtifacts);
  });

  it('Should set and get artifacts', async () => {
    setUseNativeArtifacts(false);

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

    const mockArtifact: Artifact = {
      [ArtifactName.ZKEY]: Buffer.from('123'),
      [ArtifactName.WASM]: Buffer.from('456'),
      [ArtifactName.DAT]: undefined,
      [ArtifactName.VKEY]: { data: '789' },
    };
    const artifactVariantString2by2 = getArtifactVariantString(2, 2);
    overrideArtifact(artifactVariantString2by2, mockArtifact);

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

  it('Should download artifacts - snarkjs', async () => {
    setUseNativeArtifacts(false);

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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const artifacts: Artifact =
      await artifactGetterDownloadJustInTime.getArtifacts(inputs);

    expect(artifacts.vkey).to.not.be.undefined;
    expect(artifacts.zkey).to.not.be.undefined;
    expect(artifacts.wasm).to.not.be.undefined;
    expect(artifacts.dat).to.be.undefined;

    const cached: Artifact = artifactCache['8x2'];
    expect(cached.vkey).to.not.be.undefined;
    expect(cached.zkey).to.not.be.undefined;
    expect(cached.wasm).to.not.be.undefined;
    expect(cached.dat).to.be.undefined;
  }).timeout(30000);

  it('Should download artifacts - native', async () => {
    setUseNativeArtifacts(true);

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
      ],
      merkleRoot: BigInt(0),
      boundParamsHash: BigInt(0),
      commitmentsOut: [BigInt(0), BigInt(1), BigInt(1)],
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const artifacts: Artifact =
      await artifactGetterDownloadJustInTime.getArtifacts(inputs);

    expect(artifacts.vkey).to.not.be.undefined;
    expect(artifacts.zkey).to.not.be.undefined;
    expect(artifacts.wasm).to.be.undefined;
    expect(artifacts.dat).to.not.be.undefined;

    const cached: Artifact = artifactCache['6x3'];
    expect(cached.vkey).to.not.be.undefined;
    expect(cached.zkey).to.not.be.undefined;
    expect(cached.wasm).to.be.undefined;
    expect(cached.dat).to.not.be.undefined;
  }).timeout(30000);

  // Skipped because we don't want to run this on every build.
  it.skip('Should download ALL artifacts - native and nodejs', async () => {
    setUseNativeArtifacts(true);

    clearArtifactCache();

    for (let i = 1; i <= 10; i += 1) {
      for (let j = 1; j <= 3; j += 1) {
        if (i === 10 && j === 5) {
          continue;
        }

        // console.log(`NATIVE: ${i}x${j}...`);

        const inputs: PublicInputs = {
          nullifiers: new Array<bigint>(i),
          merkleRoot: BigInt(0),
          boundParamsHash: BigInt(0),
          commitmentsOut: new Array<bigint>(j),
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const artifacts: Artifact =
          // eslint-disable-next-line no-await-in-loop
          await artifactGetterDownloadJustInTime.getArtifacts(inputs);

        expect(artifacts.vkey).to.not.be.undefined;
        expect(artifacts.zkey).to.not.be.undefined;
        expect(artifacts.wasm).to.be.undefined;
        expect(artifacts.dat).to.not.be.undefined;
      }
    }

    clearArtifactCache();
    setUseNativeArtifacts(false);

    for (let i = 1; i <= 10; i += 1) {
      for (let j = 1; j <= 5; j += 1) {
        if (i === 10 && j === 5) {
          continue;
        }

        // console.log(`NODEJS: ${i}x${j}...`);

        const inputs: PublicInputs = {
          nullifiers: new Array<bigint>(i),
          merkleRoot: BigInt(0),
          boundParamsHash: BigInt(0),
          commitmentsOut: new Array<bigint>(j),
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const artifacts: Artifact =
          // eslint-disable-next-line no-await-in-loop
          await artifactGetterDownloadJustInTime.getArtifacts(inputs);

        expect(artifacts.vkey).to.not.be.undefined;
        expect(artifacts.zkey).to.not.be.undefined;
        expect(artifacts.wasm).to.not.be.undefined;
        expect(artifacts.dat).to.be.undefined;
      }
    }
  }).timeout(30000);
});
