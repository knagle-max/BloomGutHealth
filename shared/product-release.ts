/**
 * Bloom's product identity is independent from package.json (the legacy
 * rest-express tooling package still has version 1.0.0).
 * A codename NEVER indicates a deployment, safety, scientific, or legal clearance.
 */
export const BLOOM_PRODUCT_VERSION = "0.6.0" as const;

export type BloomReleaseIdentity = {
  version: string;
  codename: string | null;
  publicRelease: boolean;
  label: string;
  descriptor: string;
  symbol: string | null;
  atomicNumber: number | null;
};

/** All pre-1.0 versions and 1.0 prereleases remain Project Genesis. */
export function bloomReleaseIdentity(version: string, publiclyReleased = false): BloomReleaseIdentity {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z][0-9A-Za-z.-]*))?$/.exec(version);
  if (!match) throw new Error("Invalid Bloom product version");
  const major = Number(match[1]), minor = Number(match[2]), prerelease = Boolean(match[4]);
  // Public publication is an explicitly authorized event, not an inference from version.
  if (major === 0 || prerelease || !publiclyReleased) {
    return {
      version, codename: "Project Genesis", publicRelease: false,
      label: `Bloom ${version} · Project Genesis`, descriptor: "Pre-release development build",
      symbol: null, atomicNumber: null,
    };
  }
  // Planned 1.x release series. Additional entries must be added in periodic-table order.
  const releases = [
    { name: "Hydrogen", symbol: "H" },
    { name: "Helium", symbol: "He" },
    { name: "Lithium", symbol: "Li" },
  ] as const;
  if (major !== 1 || minor >= releases.length) {
    return {
      version, codename: null, publicRelease: true,
      label: `Bloom ${version}`, descriptor: "Public release",
      symbol: null, atomicNumber: null,
    };
  }
  const element = releases[minor];
  return {
    version, codename: element.name, publicRelease: true,
    label: `Bloom ${version} · ${element.name}`, descriptor: "Public release",
    symbol: element.symbol, atomicNumber: minor + 1,
  };
}

export const BLOOM_CURRENT_RELEASE = bloomReleaseIdentity(BLOOM_PRODUCT_VERSION);
