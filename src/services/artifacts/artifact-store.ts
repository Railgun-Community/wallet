type GetArtifact = (path: string) => Promise<string | Buffer | null>;
type StoreArtifact = (
  dir: string,
  path: string,
  item: string | Uint8Array,
) => Promise<void>;
type ArtifactExists = (path: string) => Promise<boolean>;

export class ArtifactStore {
  get: GetArtifact;

  store: StoreArtifact;

  exists: ArtifactExists;

  constructor(get: GetArtifact, store: StoreArtifact, exists: ArtifactExists) {
    this.get = get;
    this.store = store;
    this.exists = exists;
  }
}
