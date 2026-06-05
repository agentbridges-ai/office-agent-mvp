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
| Verification | Static gates + lint/build + 11/11 smoke | Applied. Must be rerun after any code, artifact, or gate change. |

## Frozen Boundaries

Frozen:

- Public URL parameters and app entry behavior.
- No backend or remote DocumentServer service.
- No minified vendor patching unless separately approved after RED evidence.
- No fake success callback, swallowed conversion error, or silent fallback.
- No 9.4 resources.

Touched by the closed 9.3 adaptation plan:

- `lib/document-converter.ts`, because x2t path creation and FS sandbox behavior are adaptation-owned.
- `lib/file-types.ts`, because required 9.3 format IDs are adaptation-owned.
- `bin/onlyoffice-smoke/**`, because save coverage expanded to XLSX/PPTX.
- `bin/check_onlyoffice_9_3_risks.mjs`, because the old minimal-vendor assumptions became incorrect.

## Data Plane Risks

| Flow | Current risk | Required sensor |
| --- | --- | --- |
| DOCX/XLSX/PPTX/CSV open | x2t may produce incompatible editor bin | Browser smoke asserts document ready after x2t conversion. |
| DOCX save | Word bridge can drift with SDK internals | `input-save-docx` asserts callback and `.docx` download. |
| XLSX save | Cell bridge can drift with SDK internals | `input-save-xlsx` asserts callback and `.xlsx` download. |
| PPTX save | Slide bridge can drift with SDK internals | `input-save-pptx` asserts callback and `.pptx` download. |
| PDF export block | x2t may change PDF output behavior | `pdf-block-docx` rejects invalid/server-dependent PDF export visibly. |
| CSV path | SheetJS workaround may mask native x2t CSV behavior | Smoke verifies CSV open; native x2t CSV save is not claimed. |

## Complexity Transfer Ledger

| Complexity source | New location | Benefit | New cost |
| --- | --- | --- | --- |
| Unclear x2t version | Artifact provenance + hash docs | Reproducible converter baseline | Must maintain separate x2t source notes |
| Minified save internals | `lib/onlyoffice-compat/save.ts` hook table | One patch surface for Word/Cell/Slide | Future SDK updates need shim audit |
| Full vendor resource breadth | Risk gate allowlist with evidence | Full runtime completeness | Gate must distinguish intended full vendor from accidental drift |
| Format ID drift | Required-ID format gate | Required 9.3 ID coverage is visible | Does not prove full upstream format support |
| Browser FS path assumptions | Sandbox helper + static/behavior gates | Prevents traversal and hidden host/URL paths | Does not cover malicious archive extraction |

## Verification Layers

### L0 Static

- Runtime version signals.
- x2t artifact hashes and size checks.
- `main1`, `ccall`, and `FS` exports.
- Save bridge hook table includes `T7c`, `Iid`, `zWc`.
- Risk and bridge gates.
- Required-ID format table check.
- WASM FS static and behavior gates.

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
