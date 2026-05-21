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
- Trusted 9.3 DOCX empty bin source: `/tmp/onlyoffice-9.3-sources/sdkjs/word/document/empty.js`, `DOCY;v4;8985`.
- Trusted 9.3 XLSX empty bin source: `/tmp/onlyoffice-9.3-sources/sdkjs/cell/document/empty.js`, `XLSY;v2;5958`.
- PPTX empty bin is not claimed: no trusted 9.3 PPTX empty bin was found in the current source set, so PPTX is outside the accepted smoke matrix.

## Minimal Runtime Manifest

Copied from `/tmp/onlyoffice-9.3-sources/documentserver-extract/var/www/onlyoffice/documentserver`:

- `public/web-apps/apps/api/documents/api.js`, generated from `api.js.tpl` with `{{PRODUCT_VERSION}} -> 9.3.1`.
- `public/web-apps/apps/{documenteditor,spreadsheeteditor,presentationeditor}/main/index.html`.
- `public/web-apps/apps/{documenteditor,spreadsheeteditor,presentationeditor}/main/index_loader.html`.
- `public/web-apps/apps/{documenteditor,spreadsheeteditor,presentationeditor}/main/app.js`.
- `public/web-apps/apps/{documenteditor,spreadsheeteditor,presentationeditor}/main/code.js`.
- `public/web-apps/apps/{documenteditor,spreadsheeteditor,presentationeditor}/main/locale/{en,zh}.json`.
- `public/web-apps/apps/api/documents/preload.html`, retained because 9.3 `api.js` references `api/documents/preload.html`.
- `public/web-apps/apps/api/documents/cache-scripts.html`, retained with the API loader cache path and verified later by browser diagnostics.
- `public/web-apps/apps/spreadsheeteditor/main/index_internal.html`, retained because 9.3 `api.js` can route embedded spreadsheet mode to `/index_internal.html`.
- `public/web-apps/apps/presentationeditor/main/{index.reporter.html,app.reporter.js}`, retained because 9.3 slide SDK references `index.reporter.html`.
- `public/web-apps/apps/common/main/resources/alphabetletters/**`, retained because editor app resources reference shared alphabet letter data.
- `public/web-apps/apps/documenteditor/main/resources/numbering/**`, retained because document editor resources reference numbering presets.
- `public/web-apps/vendor/{jquery,requirejs,underscore,xregexp,es6-promise,fetch,socketio}/**`.
- `public/sdkjs/{word,cell,slide}/sdk-all.js`, `sdk-all-min.js`, and `sdk-all.bin`.
- `public/sdkjs/cell/css/{main.css,main-mobile.css}`.
- `public/sdkjs/common/{Native,Charts,Drawings/Format,hash,spell,zlib,libfont}` runtime files required by the 9.3 desktop editor load chain.
- `public/document_editor_service_worker.js` from `sdkjs/common/serviceworker/document_editor_service_worker.js`.
- `public/themes.json`, retained because 9.3 editor apps request root `/themes.json` through `Common.Utils.loadConfig`; the value matches the official empty theme config.

Explicitly not copied unless browser smoke later proves they are loaded by the accepted single-user matrix:

- `public/sdkjs/pdf/**`
- `public/sdkjs/visio/**`
- `public/web-apps/apps/pdfeditor/**`
- `public/web-apps/apps/visioeditor/**`
- `public/web-apps/vendor/monaco/**`
- mobile/forms/embed editor variants
- help assets

`public/sdkjs/common/AllFonts.js` remains project-owned and browser-local. It deliberately avoids Windows/server font paths and maps Chinese aliases to local Noto fonts so Vite does not return HTML for font requests.

## Bridge Patch Findings

Earlier runtime-patch exploration proved that browser-local flows can work, but also showed that broad minified runtime patching is an unfit long-term boundary. The GCD route keeps compatibility in project-owned adapters first:

1. binary open, local save/download, media URLs, PDF guard, font expectations, and runtime readiness live in `lib/onlyoffice-compat/**`,
2. `lib/onlyoffice-editor.ts` stays an orchestration layer,
3. vendored runtime bundles are kept as official/minimal 9.3 inputs unless a real browser RED proves a narrow shim is unavoidable.

## Validation Matrix

| Gate | Status | Evidence |
| --- | --- | --- |
| Release metadata captured | PASS | `gh release view v9.3.1 --repo ONLYOFFICE/DocumentServer` saved JSON |
| Debian package digest | PASS | `sha256sum` matched GitHub digest |
| web-apps version signal | PASS | extracted editor app headers show `9.3.1 (build:10)` |
| sdkjs version signal | PASS | extracted `sdk-all.js` headers show `9.3.1 (build:10)` |
| x2t browser WASM source | CONTROLLED RISK | not present in DocumentServer package; keep existing browser x2t converter under adapter/smoke coverage; do not claim x2t 9.3 alignment |
| DOCX empty bin | PASS | `lib/empty_bin.ts` uses trusted 9.3 `DOCY;v4;8985` from `word/document/empty.js` |
| XLSX empty bin | PASS | `lib/empty_bin.ts` uses trusted 9.3 `XLSY;v2;5958` from `cell/document/empty.js` |
| PPTX empty bin | NOT CLAIMED | PPTX empty bin is not claimed; existing value is preserved only as legacy data and is outside final smoke |
| adapter boundary check | PASS | `timeout 60 node bin/check_onlyoffice_bridge_contract.mjs` exits 0 after T15 runtime changes |
| risk check | PASS | `timeout 60 node bin/check_onlyoffice_9_3_risks.mjs` exits 0 after T15 runtime and empty bin changes |
| TypeScript check | PASS | `timeout 60 pnpm run lint:ts` exits 0; only existing warning `bin/bundle_single_html.js:36 no-unused-expressions` |
| Production build | pending | not run yet in final verification phase |
| Browser smoke harness | PASS | dynamic Vite port, sample server `listen(0)`, generated DOCX/XLSX/CSV samples, structured JSON and per-scenario diagnostics |
| Browser smoke harness structure | PASS | entrypoint `bin/smoke_onlyoffice_9_3_browser.mjs` delegates to `bin/onlyoffice-smoke/**`; each module stays below 300 lines and preserves the same full smoke behavior |
| new-docx | PASS | full smoke matrix reports `documentReady=true`, version `9.3.1`, no 4xx, no bad font URLs |
| new-xlsx | PASS | full smoke matrix reports `documentReady=true`, `onlyofficeLocalBinaryOpen`, `onlyofficeLocalBinaryBridge` |
| open-docx | PASS | generated DOCX opens through adapter binary bridge |
| open-xlsx | PASS | generated XLSX opens through adapter binary bridge |
| open-csv | PASS | generated CSV converts/opens through adapter binary bridge |
| input-save-docx | PASS | `modified=true`, local `.docx` download anchor, `onlyofficeLocalDownloadBridge outputformat=65`, `asc_onEndAction [1,6]`; no `/downloadas/` request |
| pdf-block-docx | PASS | alert contains `server-side conversion`, no `.pdf` download anchor, `onlyofficeLocalDownloadBridge outputformat=513`, `asc_onEndAction [1,6]` |
| PPTX open/save | NOT CLAIMED | no trusted 9.3 PPTX empty bin source in scope; not part of final smoke matrix |
| Collaboration | NOT CLAIMED | current browser adapter supports single-user local editing only |

Fresh full smoke command:

```bash
timeout 360 node bin/smoke_onlyoffice_9_3_browser.mjs --scenario new-docx,new-xlsx,open-docx,open-xlsx,open-csv,input-save-docx,pdf-block-docx --timeout-ms 90000
```

Fresh result summary: 7/7 PASS, `failures=[]`, no failed responses, no `/downloadas/`, no `/fonts//fonts`, no browser exceptions.

## Rollback

- Delete `/tmp/onlyoffice-9.3-sources` to discard source staging.
- Delete `/tmp/document-onlyoffice-9-3-worktree` to discard isolated implementation.
- Revert or drop the feature commit if runtime replacement is already committed.
