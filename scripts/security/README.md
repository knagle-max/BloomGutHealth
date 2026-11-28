# Local privacy preflight

Use before any separately authorized commit or push. This tool grants no
publication permission. Current owner instruction prohibits commit/push/deploy
without explicit approval. Do not install hooks or change production settings.

```bash
python3 -m venv /tmp/bloom-privacy-tools
/tmp/bloom-privacy-tools/bin/python -m pip install -r scripts/security/requirements-privacy-tools.txt
/tmp/bloom-privacy-tools/bin/python -m unittest tests.test_privacy_preflight
/tmp/bloom-privacy-tools/bin/python scripts/security/privacy_preflight.py --report /tmp/bloom-private-preflight-NEW.json
```

Use a new report filename each time. The report must be outside Git; the tool
creates it exclusively with0600 permissions and refuses to overwrite a file or
follow its final symlink. Standard output contains only counts/categories. Neither
report nor stdout contains matched values, excerpts or reversible secret digests.
Do not upload reports, repository/private data or logs as CI artifacts/telemetry.

Scope: tracked and nonignored untracked working files, indexed contents (including
previously tracked ignored files), all refs and local reflog-reachable history.
Commit/tag messages and historical blobs are included. Unfetched remote refs, hosted PR/cache copies and objects unreachable from all local refs/reflogs are outside this scan. Nothing is deleted, staged,
committed, pushed or rewritten. Detection uses detect-secrets1.5.0 local pattern
detectors directly; no credential verification API/network requests are invoked.
There is no credential access, database query, provider test or personal-data
transfer. Separate health-record format patterns add conservative review signals.

Exit0 means no selected pattern findings, **not** privacy certification. Exit1
means review required; exit2 means incomplete. Binary/images, non-UTF8 and large
objects, and lines longer than16384characters, are explicitly uninspected, never silently counted clean. Arbitrary genetic,
microbiome, bloodwork or simulation formats can evade simple patterns. Findings
are candidates: synthetic examples, hashes, public identifiers and code can also
trigger detectors. Review exact objects locally without printing matched contents
into agent/CI logs. Don't dismiss all tests or historical files as automatically
synthetic. Known public images can be checked against existing verified asset
manifests without reopening existing public-art approval; uncertain report screenshots need private review. Uninspected coverage flags do not revoke approved public artwork or add an application activation gate.

Index/history object changes during a run make the result incomplete. Working files are inspected during the run, not an atomic filesystem snapshot. Before a future approved commit, run again on stable staged contents and review the actual staged diff plus this report,
resolve candidate findings, confirm fixtures are synthetic/authorized anonymized
data and preserve unknown/needs-review status where uncertain. No blanket pass or
automatic whitelist is created by the tool. Re-run after changed staged content.
Before push, include the history/ref check again; deleting a file at HEAD does not
erase earlier blobs or cached copies.

If actual credentials or private records are confirmed in existing history:

1. Stop further publication of those objects and flag the incident without quoting
   the credential or personal data. Record scope privately outside Git.
2. Recommend revoking/rotating the credential and reviewing relevant access; do not
   change production security settings without approval or contact others unasked.
3. Prepare an exact-path/blob history-removal plan, private backup and collaborator
   coordination. Include remote branches/tags, PR views, forks/clones and caches;
   a new deletion commit alone is insufficient.
4. Obtain explicit approval before rewriting history, force-pushing, deleting
   remote refs or undertaking other irreversible remediation. Verify the result
   with a fresh scan and document residual copies/limits honestly.

This is one bounded local security tool, not a new data store or security platform.
