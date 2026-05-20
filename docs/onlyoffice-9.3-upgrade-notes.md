# ONLYOFFICE 9.3 Upgrade Notes

## Target

- DocumentServer release: `v9.3.1`
- DocumentServer package: `onlyoffice-documentserver_amd64.deb`
- Expected editor runtime version: `9.3.1 (build:10)`
- Source staging root: `/tmp/onlyoffice-9.3-sources`

## Provenance

| Artifact | Source | Evidence |
| --- | --- | --- |
| DocumentServer release metadata | GitHub release `ONLYOFFICE/DocumentServer v9.3.1` | `/tmp/onlyoffice-9.3-sources/documentserver-release/v9.3.1.json` |
| DocumentServer Debian package | `https://github.com/ONLYOFFICE/DocumentServer/releases/download/v9.3.1/onlyoffice-documentserver_amd64.deb` | sha256 `b206c7eefcf3750605d6d3f61a95f81c2ecaf931f4855f004bfd1d4d05269817` |
| Runtime extraction path | Debian package extracted with `dpkg-deb -x` | `/tmp/onlyoffice-9.3-sources/documentserver-extract/var/www/onlyoffice/documentserver` |
| web-apps runtime | extracted DocumentServer package | editor app headers report `Version: 9.3.1 (build:10)` |
| sdkjs runtime | extracted DocumentServer package | `sdkjs/{word,cell,slide}/sdk-all.js` headers report `Version: 9.3.1 (build:10)` |

## Source Findings

- The `ONLYOFFICE/web-apps` tag `v9.3.1.11` contains source/template assets, not a directly copyable final runtime for this project.
- The `ONLYOFFICE/sdkjs` tag `v9.3.1.11` contains source files and does not contain the built `word/cell/slide/sdk-all.js` paths currently vendored by this project.
- The DocumentServer `.deb` contains the final built `web-apps` and `sdkjs` runtime assets needed by this project.
- The DocumentServer `.deb` contains `web-apps/apps/api/documents/api.js.tpl`; the project needs a generated `api.js` with `{{PRODUCT_VERSION}}` replaced by `9.3.1`.
- The DocumentServer `.deb` does not contain the browser `public/wasm/x2t/x2t.js` and `x2t.wasm` used by this project. It contains a server-side `server/FileConverter/bin/x2t`, which must not replace the browser WASM converter.

## Bridge Patch Findings

The current project runtime contains local bridge patches in all three editor apps:

- `asc_setImageUrls`
- `asc_onSaveCallback`
- `asc_writeFileCallback`
- `event: 'onSave'`
- `event: 'writeFile'`

The extracted official 9.3.1 runtime contains `asc_openDocument`, but does not contain these local bridge strings in the three editor app bundles.

Therefore the 9.3.1 upgrade cannot be a pure runtime overwrite. T7 must:

1. copy the 9.3.1 runtime in an isolated worktree,
2. run a bridge-contract check that fails on pure official runtime,
3. replay the existing bridge patches onto the 9.3.1 editor app bundles,
4. rerun the bridge-contract check and only then proceed.

## Validation Matrix

| Gate | Status | Evidence |
| --- | --- | --- |
| Release metadata captured | PASS | `gh release view v9.3.1 --repo ONLYOFFICE/DocumentServer` saved JSON |
| Debian package digest | PASS | `sha256sum` matched GitHub digest |
| web-apps version signal | PASS | extracted editor app headers show `9.3.1 (build:10)` |
| sdkjs version signal | PASS | extracted `sdk-all.js` headers show `9.3.1 (build:10)` |
| x2t browser WASM source | OPEN | not present in DocumentServer package; keep existing converter until verified |
| bridge contract on official runtime | FAIL EXPECTED | official runtime lacks current local save/write/image bridge strings |
| TypeScript check | pending | not run yet |
| Production build | pending | not run yet |
| DOCX open/save | pending | not run yet |
| XLSX open/save | pending | not run yet |
| PPTX open/save | pending | not run yet |
| CSV conversion/open/save | pending | not run yet |

## Rollback

- Delete `/tmp/onlyoffice-9.3-sources` to discard source staging.
- Delete `/tmp/document-onlyoffice-9-3-worktree` to discard isolated implementation.
- Revert or drop the feature commit if runtime replacement is already committed.
