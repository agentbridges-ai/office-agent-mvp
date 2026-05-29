# ONLYOFFICE 9.3 Full Adaptation Progress

## Current Source Of Truth

- Current executable plan: `docs/superpowers/plans/2026-05-29-onlyoffice-9.3-full-adaptation.md`
- Upgrade evidence: `docs/onlyoffice-9.3-upgrade-notes.md`
- Current branch: `onlyoffice-9-3-adaption`
- Runtime target: ONLYOFFICE DocumentServer `9.3.1 (build:10)` for `web-apps` and `sdkjs`
- x2t target: CryptPad `onlyoffice-x2t-wasm v9.3.0+0`, upstream `ONLYOFFICE/core v9.3.0.140`

Older plans under `docs/superpowers/plans/2026-05-20-*` and `docs/superpowers/plans/2026-05-21-*` are historical only and must not be executed.

## Overall Status

- Overall: `completed`
- All layers complete: editor runtime, adapter bridge (T7c/Iid/zWc), x2t WASM 9.3.0.140, format table gate, FS sandbox gate.

## Layer Status

| Layer | Status | Summary |
| --- | --- | --- |
| Editor runtime | `complete` | Full 9.3.1 `web-apps`/`sdkjs` resources present. Risk gate aligned. |
| Adapter bridge | `complete` | T7c/Iid/zWc save bridges smoke-verified. Bridge contract gate PASS. |
| x2t WASM | `complete` | CryptPad 9.3.0+0 applied with local locateFile patch. 11/11 smoke PASS. |
| Format table | `complete` | Required 9.3 IDs added. Format table gate PASS. |
| FS sandbox | `complete` | `sanitizeX2TFileName` helper added. Static sandbox and behavior gates PASS. |

## Completed Checklist

| ID | Item | Status | Evidence |
| --- | --- | --- | --- |
| L1-01 | `.deb` sha256 verified | completed | `b206c7eefcf...` |
| L1-02 | `api.js` generated from `api.js.tpl` | completed | `return '9.3.1'` |
| L1-03 | Full `public/web-apps/**` replacement | completed | 16,957 files including pdf/visio editors |
| L1-04 | Full `public/sdkjs/**` replacement | completed | word/cell/slide/pdf/visio/common |
| L1-05 | Vendor libraries (monaco/jquery/requirejs) | completed | Full-vendor intentionally present |
| L1-06 | Runtime fixes (version prefix/AllFonts/themes/plugins) | completed | Applied |
| L1-07 | Version signal check | completed | 7 files report `9.3.1 (build:10)` |
| L1-08 | Type/build checks | completed | `tsc`, `oxlint`, `pnpm run build` pass |
| L1-09 | Risk gate aligned to full-vendor | completed | `check_onlyoffice_9_3_risks.mjs` PASS |
| L2-01 | Cross-realm binary helper | completed | `lib/onlyoffice-compat/binary.ts` |
| L2-02 | Runtime/local binary bridge | completed | `openDocumentFromBinary` postMessage |
| L2-03 | Word save bridge (T7c) | completed | Smoke: input-save-docx PASS, callback ok, outputformat 65 |
| L2-04 | Cell save bridge (Iid) | completed | Smoke: input-save-xlsx PASS, callback ok, outputformat 257 |
| L2-05 | Slide save bridge (zWc) | completed | Smoke: input-save-pptx PASS, callback ok, outputformat 129 |
| L2-06 | Media/font/PDF adapter modules | completed | `media.ts`, `fonts.ts`, `pdf.ts` present |
| L2-07 | Bridge contract gate | completed | `check_onlyoffice_bridge_contract.mjs` PASS, enforces T7c/Iid/zWc |
| L3-01 | x2t provenance recorded | completed | Old hashes recorded; CryptPad v9.3.0+0 provenance in upgrade notes |
| L3-02 | x2t artifact replaced | completed | `d1e20624`: wasm/br from CryptPad, x2t.js with local locateFile patch |
| L3-03 | x2t open smoke (DOCX/XLSX/CSV/PPTX) | completed | 4/4 PASS with 9.3 x2t |
| L3-04 | x2t save smoke (DOCX/XLSX/PPTX) | completed | 3/3 PASS: T7c(65)/Iid(257)/zWc(129) bridges verified |
| L3-05 | Full 11-scenario smoke | completed | 11/11 PASS, 0 failures, 0 exceptions |

## Remaining

None for the browser-local 9.3 adaptation scope. Residual quality and rebuild risks are tracked as known claim boundaries below.

## Known Claim Boundaries

- XLSX/PPTX save smoke verifies the **download bridge** (Iid/zWc interception → callback ok), not end-to-end content editing persistence. The input step is skipped for non-docx editors because Cell/Slide use different input APIs than `asc_AddText`.
- x2t.wasm and x2t.wasm.br are unmodified CryptPad v9.3.0+0 artifacts. x2t.js is based on CryptPad artifact with a local `locateFile` patch (removed `document.currentScript` URL parsing that fails in `scriptOnLoad` context).
- PDF export remains blocked: x2t WASM produces 0-page PDFs; requires server-side conversion.
- Format table coverage means the required 9.3 IDs are present in `lib/file-types.ts`; it does not claim every upstream format is product-exposed or conversion-quality verified.
- FS sandbox coverage means filename/path semantics are rejected before writing under `/working`; it does not claim malicious archive or zip-slip payload coverage.
- The project does not yet own a reproducible x2t source-build pipeline independent of CryptPad artifacts.
