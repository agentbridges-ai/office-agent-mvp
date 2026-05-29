# ONLYOFFICE 9.3 Full Adaptation Goal Contract

## Goal

Complete the project-local ONLYOFFICE 9.3 adaptation as a full, non-minimal implementation:

- full DocumentServer 9.3.1 editor runtime,
- first-party browser-local adapter bridge,
- x2t WASM aligned to upstream `v9.3.0.140`,
- DOCX/XLSX/PPTX/CSV open verification, plus DOCX/XLSX/PPTX browser-local save bridge verification.

## Current Executable Plan

Use only:

- `docs/superpowers/plans/2026-05-29-onlyoffice-9.3-full-adaptation.md`

Older plans are historical and superseded.

## Scope

Allowed:

- `public/web-apps/**`
- `public/sdkjs/**`
- `public/wasm/x2t/**`
- `public/fonts/**`
- `lib/onlyoffice-compat/**`
- `lib/onlyoffice-editor.ts`
- `lib/document-converter.ts`
- `lib/converter.ts`
- `lib/file-types.ts`
- `lib/document-types.ts`
- `lib/document-utils.ts`
- `lib/document.ts`
- `lib/ui.ts`
- `types/editor.d.ts`
- `bin/check_onlyoffice_9_3_risks.mjs`
- `bin/check_onlyoffice_bridge_contract.mjs`
- `bin/smoke_onlyoffice_9_3_browser.mjs`
- `bin/onlyoffice-smoke/**`
- `docs/onlyoffice-9.3-*.md`
- `docs/superpowers/plans/2026-05-29-onlyoffice-9.3-full-adaptation.md`

Frozen unless explicitly approved:

- `.github/**`
- `Dockerfile`
- `docker-compose.yaml`
- `package.json`
- `pnpm-lock.yaml`
- public URL parameter semantics: `locale`, `src`, `file`
- server/backend introduction
- mock success paths or silent fallbacks

## Done When

All conditions must be true:

1. Runtime version signals report `9.3.1 (build:10)` for API, editor apps, and SDK bundles.
2. Risk gate passes under full-vendor + PPTX + x2t 9.3 target.
3. Bridge contract gate passes and verifies installed save bridge targets for `T7c`, `Iid`, and `zWc`.
4. `public/wasm/x2t/**` uses CryptPad `v9.3.0+0` / upstream core `v9.3.0.140` artifacts with recorded hashes.
5. Smoke covers and passes `open-docx`, `open-xlsx`, `open-pptx`, `open-csv`.
6. Smoke covers and passes `input-save-docx`, `input-save-xlsx`, `input-save-pptx`.
7. `pdf-block-docx` still fails visibly and does not report fake success.
8. `pnpm run lint:ts` passes.
9. `pnpm run build` passes.
10. 9.3 required format IDs are checked against the required ID set derived from `Common/OfficeFileFormats.h`; a full generated upstream table is not claimed.
11. WASM FS filename sanitizer and static FS path gates reject traversal, absolute paths, URL paths, NUL bytes, and unsafe path semantics.
12. Docs record current claims and non-claims without contradicting code or gates.

## Stop Conditions

Stop and replan if:

- x2t 9.3 artifact fails to initialize or does not export `main1`, `ccall`, and `FS`.
- New x2t cannot open one of DOCX/XLSX/PPTX/CSV and the failure is not isolated to a test fixture.
- Save bridge cannot be made to work for `Iid` or `zWc` without patching minified vendor bundles.
- A required change would introduce backend services, npm dependencies, or hidden mock/fallback behavior.
- A gate can only be made green by weakening it below the documented target.

## Layer Responsibilities

| Layer | Owner files | Contract |
| --- | --- | --- |
| Editor runtime | `public/web-apps/**`, `public/sdkjs/**` | Full 9.3.1 resources load in standalone Vite deployment. |
| Adapter bridge | `lib/onlyoffice-compat/**`, `lib/onlyoffice-editor.ts` | Browser-local open/save/media/PDF behavior is explicit and visible on failure. |
| x2t WASM | `public/wasm/x2t/**`, `lib/document-converter.ts`, `lib/file-types.ts` | Conversion uses 9.3-aligned artifact, controlled FS paths, and 9.3 format IDs. |
| Verification | `bin/**`, `docs/**` | Gates encode current target and reject old drift. |
