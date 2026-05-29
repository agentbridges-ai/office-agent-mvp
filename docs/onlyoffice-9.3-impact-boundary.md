# ONLYOFFICE 9.3 Full Adaptation Impact Boundary

## Target Input

- Issue: upgrade to ONLYOFFICE 9.3.
- Current runtime target already applied: DocumentServer `9.3.1 (build:10)` editor resources.
- All targets applied: 9.3.1 editor runtime, CryptPad x2t WASM v9.3.0+0, T7c/Iid/zWc save bridges, format table gate, FS sandbox.
- Executable plan: `docs/superpowers/plans/2026-05-29-onlyoffice-9.3-full-adaptation.md`

## System Layers

```text
index.ts / lib/converter.ts
  -> lib/document.ts / lib/ui.ts
  -> lib/document-converter.ts
  -> lib/onlyoffice-editor.ts
  -> lib/onlyoffice-compat/**
  -> public/web-apps/apps/api/documents/api.js
  -> public/web-apps/apps/{documenteditor,spreadsheeteditor,presentationeditor}/main/**
  -> public/sdkjs/{word,cell,slide,common}/**
  -> public/wasm/x2t/**
```

## Control Topology

| Layer | Current state | Allowed control input |
| --- | --- | --- |
| Editor runtime | Full 9.3.1 resources present | Applied. Full-vendor, risk gate aligned. |
| Adapter bridge | T7c/Iid/zWc save bridges smoke-verified | Applied. Bridge contract gate PASS. |
| x2t converter | CryptPad 9.3.0+0 with local locateFile patch | Applied. 11/11 smoke PASS. |
| Format mapping | 9.3 required IDs added, format table gate active | Applied. Gate PASS. |
| WASM FS | sanitizeX2TFileName helper, sandbox gate + behavior gate | Applied. Gates PASS. |
| Verification | 6 gates + tsc + build + 11/11 smoke | Applied. All PASS. |

## Frozen Boundaries

Frozen:

- Public URL parameters and app entry behavior.
- No backend or remote DocumentServer service.
- No minified vendor patching unless separately approved after RED evidence.
- No fake success callback, swallowed conversion error, or silent fallback.
- No 9.4 resources.

Unfrozen for this plan:

- `lib/document-converter.ts`, because x2t path creation, XML fields, and FS sandbox are part of the remaining target.
- `lib/file-types.ts`, because 9.3 format IDs must not stay as an unverified hard-coded subset.
- `bin/onlyoffice-smoke/**`, because save coverage must expand to XLSX/PPTX.
- `bin/check_onlyoffice_9_3_risks.mjs`, because the old minimal-vendor assumptions are now wrong.

## Data Plane Risks

| Flow | Current risk | Required sensor |
| --- | --- | --- |
| DOCX/XLSX/PPTX/CSV open | New x2t may produce incompatible editor bin | Browser smoke must assert document ready after x2t conversion. |
| DOCX save | Word path exists but must be retested after x2t swap | `input-save-docx` with callback and download assertions. |
| XLSX save | `AscCommon.Iid` not installed | `input-save-xlsx` must fail before fix and pass after fix. |
| PPTX save | `AscCommon.zWc` not installed | `input-save-pptx` must fail before fix and pass after fix. |
| PDF export block | New x2t may change PDF output behavior | `pdf-block-docx` must still reject invalid/server-dependent PDF export visibly. |
| CSV path | Current SheetJS workaround may mask 9.3 x2t CSV behavior | Smoke must verify open and save behavior without fake success. |

## Complexity Transfer Ledger

| Complexity source | New location | Benefit | New cost |
| --- | --- | --- | --- |
| Unclear x2t version | Artifact provenance + hash docs | Reproducible converter baseline | Must maintain separate x2t source notes |
| Minified save internals | `lib/onlyoffice-compat/save.ts` hook table | One patch surface for Word/Cell/Slide | Future SDK updates need shim audit |
| Full vendor resource breadth | Risk gate allowlist with evidence | Full runtime completeness | Gate must distinguish intended full vendor from accidental drift |
| Format ID drift | Generated/checked format table | 9.3 format coverage is visible | Adds generator/check script maintenance |
| Browser FS path assumptions | Sandbox helper/gate | Prevents traversal and hidden host/URL paths | Requires tests for path rejection |

## Verification Layers

### L0 Static

- Runtime version signals.
- x2t artifact hashes and size checks.
- `main1`, `ccall`, and `FS` exports.
- Save bridge hook table includes `T7c`, `Iid`, `zWc`.
- Risk and bridge gates.
- Format table generation/check.
- WASM FS sandbox tests/gates.

### L1 Build

- `pnpm run lint:ts`
- `pnpm run build`

### L2 Browser Smoke

Required scenarios:

- `open-docx`
- `open-xlsx`
- `open-pptx`
- `open-csv`
- `input-save-docx`
- `input-save-xlsx`
- `input-save-pptx`
- `pdf-block-docx`

Existing new-document scenarios may remain as regression coverage, but they do not substitute for x2t open/save coverage.

## Rollback

- Before x2t replacement, record current hashes from `public/wasm/x2t/**`.
- If the CryptPad artifact fails initialization, restore old `public/wasm/x2t/**` files and keep the failure log.
- If open/save smoke fails after initialization, keep the artifact branch isolated until the failing format path is understood.
- Do not make gates pass by weakening target assertions.
