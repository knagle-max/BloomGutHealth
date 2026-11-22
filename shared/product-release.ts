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
  // Approved version-to-element assignments, not arithmetic on major/minor.
  // Each new named feature/major release takes the next unused atomic number,
  // even if the SemVer sequence jumps. Patches inherit their release line.
  // Extend this list ONLY on an explicit release-naming decision; never
  // preassign a future 2.0.0 or skip elements just because 1.x was skipped.
  const namedReleaseLines = [
    { major: 1, minor: 0, name: "Hydrogen", symbol: "H", atomicNumber: 1 },
    { major: 1, minor: 1, name: "Helium", symbol: "He", atomicNumber: 2 },
    { major: 1, minor: 2, name: "Lithium", symbol: "Li", atomicNumber: 3 },
  ] as const;
  const element = namedReleaseLines.find(line => line.major === major && line.minor === minor);
  if (!element) {
    return {
      version, codename: null, publicRelease: true,
      label: `Bloom ${version}`, descriptor: "Public release",
      symbol: null, atomicNumber: null,
    };
  }
  return {
    version, codename: element.name, publicRelease: true,
    label: `Bloom ${version} · ${element.name}`, descriptor: "Public release",
    symbol: element.symbol, atomicNumber: element.atomicNumber,
  };
}

export const BLOOM_CURRENT_RELEASE = bloomReleaseIdentity(BLOOM_PRODUCT_VERSION);
