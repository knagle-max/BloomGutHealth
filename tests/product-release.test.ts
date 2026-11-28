import test from "node:test";
import assert from "node:assert/strict";
import { BLOOM_CURRENT_RELEASE, bloomReleaseIdentity } from "../shared/product-release";

test("Bloom development and release candidates remain Genesis, regardless of technical npm version", () => {
 for (const version of ["0.1.0","0.6.0","0.7.0","0.9.0","1.0.0-rc.1"]) {
   const release = bloomReleaseIdentity(version, true);
   assert.equal(release.codename, "Project Genesis");
   assert.equal(release.publicRelease, false);
   assert.equal(release.atomicNumber, null);
 }
 assert.equal(BLOOM_CURRENT_RELEASE.label,"Bloom 0.6.0 · Project Genesis");
 assert.equal(BLOOM_CURRENT_RELEASE.descriptor,"Pre-release development build");
});

test("Hydrogen is reserved for actual first public release, not merely a package version", () => {
 assert.equal(bloomReleaseIdentity("1.0.0").codename,"Project Genesis");
 assert.deepEqual(
   [bloomReleaseIdentity("1.0.0",true),bloomReleaseIdentity("1.0.1",true),bloomReleaseIdentity("1.1.0",true),bloomReleaseIdentity("1.2.0",true)]
    .map(x=>[x.codename,x.symbol,x.atomicNumber]),
   [["Hydrogen","H",1],["Hydrogen","H",1],["Helium","He",2],["Lithium","Li",3]]
 );
});

test("unknown future releases do not silently reuse an element or fabricate readiness",()=>{
 assert.equal(bloomReleaseIdentity("1.3.0",true).codename,null);
 assert.equal(bloomReleaseIdentity("2.0.0",true).codename,null);
 // No speculative claim: atomic sequence crosses major-version boundaries only when named lines are assigned.
 assert.equal(bloomReleaseIdentity("1.9.0",true).codename,null);
 assert.equal(bloomReleaseIdentity("3.0.0",true).codename,null);
 assert.throws(()=>bloomReleaseIdentity("not-a-version"));
});
