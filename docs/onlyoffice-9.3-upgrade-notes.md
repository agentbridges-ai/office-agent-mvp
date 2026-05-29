# ONLYOFFICE 9.3 Upgrade Notes

## Scope

This document records the current factual state of the 9.3 adaptation. The executable plan is:

- `docs/superpowers/plans/2026-05-29-onlyoffice-9.3-full-adaptation.md`

The target is not merely version strings. The target is a browser-local 9.3 editor runtime with working DOCX/XLSX/PPTX/CSV open paths and DOCX/XLSX/PPTX save bridge paths, using a 9.3-aligned x2t WASM converter.

## Provenance

| Artifact | Source | Status |
| --- | --- | --- |
| DocumentServer runtime | `ONLYOFFICE/DocumentServer v9.3.1` `.deb` | Applied |
| `.deb` sha256 | `b206c7eefcf3750605d6d3f61a95f81c2ecaf931f4855f004bfd1d4d05269817` | Verified |
| `web-apps` | Extracted from `.deb` | Applied full-vendor |
| `sdkjs` | Extracted from `.deb` | Applied full-vendor |
| `api.js` | Generated from `api.js.tpl`, `PRODUCT_VERSION=9.3.1`, `HASH_POSTFIX=10` | Applied |
| x2t current | CryptPad `onlyoffice-x2t-wasm v9.3.0+0`, upstream `ONLYOFFICE/core v9.3.0.140` | Applied with local `locateFile` patch |
| x2t artifact (old) | Existing old browser artifact in `public/wasm/x2t/**` | Replaced, hashes recorded for rollback |

## Runtime Findings

- The `.deb` ships built `web-apps` and `sdkjs` resources, but only server-side `server/FileConverter/bin/x2t`; it does not ship browser x2t WASM.
- The `.deb` ships `api.js.tpl`, not generated `api.js`.
- The `.deb` does not ship generated `AllFonts.js` or `themes.js`; this browser-local app must provide compatible versions.
- `api.js` originally injects `/9.3.1-10/` into resource paths. That is valid behind DocumentServer routing but breaks the standalone Vite deployment, so the prefix is disabled locally.
- Full-vendor presence of `pdfeditor`, `visioeditor`, `sdkjs/pdf`, `sdkjs/visio`, and `vendor/monaco` is intentional for this adaptation. Risk gates must document and permit it instead of applying the old minimal-vendor rule.

## Adapter Shim Contract

The browser-local adapter replaces missing server callbacks with first-party TypeScript shims. These are internal ONLYOFFICE hooks and must stay documented because minified names may change in future builds.

| Hook | Runtime file | Current implementation | Status |
| --- | --- | --- | --- |
| `openDocumentFromBinary` | `web-apps/apps/*/main/app.js` | Used by `local-binary.ts` | Implemented |
| `AscCommon.T7c` | `sdkjs/word/sdk-all-min.js` | Patched by `save.ts` | Smoke-verified: outputformat 65, callback ok |
| `AscCommon.Iid` | `sdkjs/cell/sdk-all-min.js` | Patched by `save.ts` | Smoke-verified: outputformat 257, callback ok |
| `AscCommon.zWc` | `sdkjs/slide/sdk-all-min.js` | Patched by `save.ts` | Smoke-verified: outputformat 129, callback ok |
| `asyncServerIdEndLoaded`, `n1f`, `Mmg`, `NOf` | editor controller internals | Used as local binary ready hook candidates | Implemented |
| `asc_getBuildVersion/asc_getBuildNumber` | local permission shim | Simulates `9.3.1 build 10` for local editor acceptance; not a real DocumentServer backend | Implemented |

The official 9.3.1 runtime does not provide the old local project bridge commands `asc_onSaveCallback`, `asc_writeFileCallback`, `asc_endDownloadAction`, `event: 'onSave'`, or `event: 'writeFile'`. The adapter must make failures visible and must not report fake success.

## PPTX Scope

PPTX create/open/save are in scope. All smoke scenarios pass with the 9.3 x2t artifact.
`input-save-pptx` verifies the `zWc` download bridge (outputformat 129, callback ok).
Content editing persistence in PPTX is not smoke-automated because the Cell/Slide editors
use different input APIs than `asc_AddText`.

## x2t State

### Active Artifact (Applied at `d1e20624`)

| File | Size | sha256 | Origin |
| --- | ---: | --- | --- |
| `public/wasm/x2t/x2t.wasm` | 35985703 | `e166c252adbd603e5e3abf65cf3b37bf0424a33edd9ae1b4b791176ce7fd2caa` | CryptPad v9.3.0+0 (unmodified) |
| `public/wasm/x2t/x2t.wasm.br` | 6806135 | `8dfeb638225fff59547eaca1ae6d24e0123aa90a2688c73d246e2ba1127d689e` | CryptPad v9.3.0+0 (unmodified) |
| `public/wasm/x2t/x2t.wasm.gz` | 9629242 | `9bd91c02ab5d8b25c1bdfdde145b89a6b87b20d53d77c3f44e571f67094663dd` | Generated from above wasm |
| `public/wasm/x2t/x2t.js` | 135767 | `e0abb59942bf4bf3734e04208107e88aeab243f26ca4b689b4c193bc96e58eeb` | CryptPad v9.3.0+0 + local `locateFile` patch |

### Local x2t.js Patch

CryptPad's `pre-js.js` uses `document.currentScript` to derive the WASM URL. In our
`scriptOnLoad` context, `currentScript` is null, causing `TypeError: Invalid URL` and
preventing WASM loading. The patch replaces the URL-based locateFile with:
```js
Module.locateFile = function(path, prefix) { return prefix + path; };
```
This must be re-applied (or the resulting patched JS preserved) on future CryptPad upgrades.

### Staged CryptPad Artifact (Source)

| File | sha256 |
| --- | --- |
| `/tmp/cryptpad-x2t-artifacts/x2t.zip` | `c209894d10d96fe1c4912e21fe518dca1bcdc0b4bc40778b4e6886e7227ef001` |

CryptPad tag `v9.3.0+0` (commit `96886ff`). Upstream `ONLYOFFICE/core v9.3.0.140` (commit `269dd9b`).

### Replaced Old Artifact (7.x, for rollback reference)

| File | Size | sha256 |
| --- | ---: | --- |
| `x2t.wasm` | 57305885 | `b39f89dc1b0c15afb4616c8c1cffb3977709475f375038d06248782971625436` |
| `x2t.wasm.br` | 8382291 | `2c27d209ba6737ed2c1f2132c875ef6b9fdeed72281c83c8619f00ef6e5a9593` |
| `x2t.wasm.gz` | 12004772 | `ca987dc993412b55ded8bffe383d8ddad3473ee9e72f591b598b5d05550be061` |
| `x2t.js` | 182079 | `264d920f397f89c821e9560f89700aea929c70c954d3ef7be172fb81b6f9dfd2` |

## Current Verification Status

| Gate | Status | Notes |
| --- | --- | --- |
| Runtime version signals | PASS | `web-apps` and `sdkjs` report `9.3.1 (build:10)` |
| `bin/check_onlyoffice_bridge_contract.mjs` | PASS | Enforces T7c/Iid/zWc presence in save.ts |
| `bin/check_onlyoffice_9_3_risks.mjs` | PASS | Aligned to full-vendor + PPTX + x2t 9.3 target |
| Browser smoke (11 scenarios) | PASS | 11/11 PASS, 0 failures, 0 exceptions |
| x2t 9.3 WASM | PASS | CryptPad v9.3.0+0 applied with local locateFile patch |
| `bin/check_onlyoffice_format_table.mjs` | PASS | Checks the required 9.3 ID set; not a full generated upstream format table |
| `bin/check_x2t_fs_sandbox.mjs` | PASS | Static gate for x2t path helper wiring and `/working/params.xml` constraints |
| `bin/check_x2t_path_behavior.mjs` | PASS | Behavior gate for traversal, absolute path, protocol, drive prefix, and NUL rejection |
| `bin/check_onlyoffice_9_3_docs_consistency.mjs` | PASS | Checks current x2t artifact sizes/hashes and rejects stale adaptation status text |

## Current Claims

Claimed:

- Full 9.3.1 editor runtime is present (full-vendor, including pdf/visio/monaco).
- DOCX/XLSX/PPTX/CSV create/open smoke passed with x2t 9.3 WASM.
- DOCX save: T7c bridge verified (outputformat 65, callback ok, download anchor .docx).
- XLSX save: Iid bridge verified (outputformat 257, callback ok, download anchor .xlsx).
- PPTX save: zWc bridge verified (outputformat 129, callback ok, download anchor .pptx).
- PDF export is intentionally blocked with a visible server-side conversion error.
- x2t WASM is 9.3-aligned (CryptPad v9.3.0+0, upstream ONLYOFFICE/core v9.3.0.140).

Not yet claimed:

- XLSX/PPTX content editing persistence (save smoke skips input for non-docx editors).
- x2t WASM is independently rebuildable from ONLYOFFICE/core source.
- Conversion quality (format fidelity, text extraction, visual layout, font rendering).
- Large-file, concurrency, password-protected document, CJK/RTL visual regression, and performance boundaries.
- CSV save through native x2t. CSV still uses the SheetJS workaround path.

## Required Fresh Verification Before Final Claim

After any code, artifact, or gate change, run:

```bash
node bin/check_onlyoffice_bridge_contract.mjs --root .
node bin/check_onlyoffice_9_3_risks.mjs --root .
node bin/check_onlyoffice_format_table.mjs --root .
node bin/check_x2t_fs_sandbox.mjs --root .
node bin/check_x2t_path_behavior.mjs --root .
node bin/check_onlyoffice_9_3_docs_consistency.mjs --root .
pnpm run lint:ts
pnpm run build
node bin/smoke_onlyoffice_9_3_browser.mjs --chrome /snap/bin/chromium --timeout-ms 240000
```

The smoke matrix must include:

- `open-docx`
- `open-xlsx`
- `open-pptx`
- `open-csv`
- `input-save-docx`
- `input-save-xlsx`
- `input-save-pptx`
- `pdf-block-docx`
