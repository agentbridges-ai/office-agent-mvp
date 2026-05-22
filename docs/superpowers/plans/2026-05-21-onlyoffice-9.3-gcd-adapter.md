# ONLYOFFICE 9.3 GCD Adapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Solve issue #1 by implementing the maximum-common-denominator ONLYOFFICE 9.3 adaptation: official/minimal 9.3 editor runtime, project-owned backward compatibility adapters, and browser-local single-user open/edit/save verification.

**Architecture:** Start from `main@96b2a9e2` on `feat/onlyoffice-9-3-gcd-adapter`. Treat `feat/onlyoffice-9-3-runtime` as a failure corpus and `feat/onlyoffice-9-3-adapter-layer` as the preferred structural reference, but do not merge either branch wholesale. Compatibility lives in `lib/onlyoffice-compat/**`; vendored ONLYOFFICE assets remain a manifest-driven runtime input with last-resort documented shims only after browser RED evidence.

**Tech Stack:** Vite, TypeScript, pnpm, ONLYOFFICE DocumentServer 9.3.1 built web-apps/sdkjs assets, existing browser x2t WASM, Chromium/CDP smoke harness.

---

## Branch And Evidence Baseline

- New branch: `feat/onlyoffice-9-3-gcd-adapter`.
- Worktree: `/tmp/document-onlyoffice-9-3-gcd-adapter`.
- Base commit: `96b2a9e2 docs: record onlyoffice 9.3 source provenance`.
- Runtime evidence branch: `feat/onlyoffice-9-3-runtime` at `cec52b4f`.
- Adapter evidence branch: `feat/onlyoffice-9-3-adapter-layer` at `1526ddc2`.
- Issue: `https://github.com/agentbridges-ai/document/issues/1`, title only: `升级到onlyoffice-9.3版本`.

## File Responsibility Map

- Create/modify `lib/onlyoffice-compat/binary.ts`: header-preserving bin normalization for `string | Uint8Array | ArrayBuffer`.
- Create/modify `lib/onlyoffice-compat/runtime.ts`: runtime version checks, local binary open, editor options, iframe/app host sizing.
- Create/modify `lib/onlyoffice-compat/local-binary.ts`: iframe message bridge for local binary open when official API requires parent-frame transfer.
- Create/modify `lib/onlyoffice-compat/save.ts`: local save/download bridge, converter callback, overlay end action, visible failures.
- Create/modify `lib/onlyoffice-compat/media.ts`: media URL object map and delayed image URL injection.
- Create/modify `lib/onlyoffice-compat/pdf.ts`: invalid PDF detection and explicit server-conversion error.
- Create/modify `lib/onlyoffice-compat/fonts.ts`: expected browser font paths and alias contract.
- Modify `lib/onlyoffice-editor.ts`: orchestration only; delegate compatibility behavior to adapter modules.
- Modify `lib/converter.ts` and `lib/document-converter.ts`: honest x2t typing and PDF guard.
- Modify `lib/empty_bin.ts`: trusted 9.3 DOCX/XLSX empty bins; do not guess PPTX.
- Modify `types/editor.d.ts` and `lib/document-types.ts`: 9.3 `openDocument({ buffer })`, save event, and adapter-owned types.
- Modify `bin/check_onlyoffice_9_3_risks.mjs`: block broad vendor replacement, minified patch defaulting, `/downloadas`, bad PDF, false x2t claims, and missing adapter modules.
- Modify `bin/check_onlyoffice_bridge_contract.mjs`: assert editor orchestration depends on first-party adapters instead of raw old bridge strings.
- Modify `bin/smoke_onlyoffice_9_3_browser.mjs`: dynamic ports, generated or repo-local samples, structured per-scenario diagnostics.
- Modify `public/web-apps/**`, `public/sdkjs/**`, `public/fonts/**`, `public/document_editor_service_worker.js`: only through a minimal 9.3 runtime manifest.
- Modify `docs/onlyoffice-9.3-progress.md` and `docs/onlyoffice-9.3-upgrade-notes.md`: real-time evidence and handoff language.

## Task 1: Commit GCD Design Baseline

**Files:**
- Create: `docs/superpowers/specs/2026-05-21-onlyoffice-9.3-gcd-adapter-design.md`
- Create: `docs/superpowers/plans/2026-05-21-onlyoffice-9.3-gcd-adapter.md`
- Modify: `docs/onlyoffice-9.3-progress.md`

- [ ] **Step 1: Record the branch relationship**

Add a progress checkpoint stating that this branch starts from `96b2a9e2`, does not merge `cec52b4f` or `1526ddc2`, and will extract only common logic and evidence.

- [ ] **Step 2: Verify docs are the only staged files**

Run:

```bash
git status --short
```

Expected: only the two new docs and the progress doc are changed.

- [ ] **Step 3: Commit planning**

Run:

```bash
git add docs/superpowers/specs/2026-05-21-onlyoffice-9.3-gcd-adapter-design.md docs/superpowers/plans/2026-05-21-onlyoffice-9.3-gcd-adapter.md docs/onlyoffice-9.3-progress.md
git commit -m "docs: plan onlyoffice 9.3 gcd adapter"
```

Expected: one docs-only commit on `feat/onlyoffice-9-3-gcd-adapter`.

## Task 2: Build Adapter Boundary RED Gates

**Files:**
- Create or modify: `bin/check_onlyoffice_9_3_risks.mjs`
- Create or modify: `bin/check_onlyoffice_bridge_contract.mjs`
- Modify: `docs/onlyoffice-9.3-progress.md`

- [ ] **Step 1: Add risk assertions**

The risk script must fail until all of these are true:

```text
lib/onlyoffice-compat/binary.ts exists
lib/onlyoffice-compat/runtime.ts exists
lib/onlyoffice-compat/save.ts exists
lib/onlyoffice-compat/media.ts exists
lib/onlyoffice-compat/pdf.ts exists
lib/onlyoffice-compat/fonts.ts exists
docs/onlyoffice-9.3-upgrade-notes.md says existing browser x2t is a controlled risk
public/sdkjs/pdf and public/sdkjs/visio are absent unless documented
public/web-apps/vendor/monaco is absent unless documented
runtime save path does not use /downloadas as success path
bad PDF output is blocked
```

- [ ] **Step 2: Add bridge assertions**

The bridge script must fail until `lib/onlyoffice-editor.ts` imports adapter modules and does not own binary normalization, media injection, PDF validation, or save/download conversion directly.

- [ ] **Step 3: Verify RED**

Run:

```bash
timeout 60 node bin/check_onlyoffice_9_3_risks.mjs
timeout 60 node bin/check_onlyoffice_bridge_contract.mjs
```

Expected: both fail with explicit missing adapter/boundary messages.

- [ ] **Step 4: Commit RED gates**

Run:

```bash
git add bin/check_onlyoffice_9_3_risks.mjs bin/check_onlyoffice_bridge_contract.mjs docs/onlyoffice-9.3-progress.md
git commit -m "test: define onlyoffice gcd adapter gates"
```

## Task 3: Implement First-Party Compatibility Modules

**Files:**
- Create: `lib/onlyoffice-compat/binary.ts`
- Create: `lib/onlyoffice-compat/runtime.ts`
- Create: `lib/onlyoffice-compat/local-binary.ts`
- Create: `lib/onlyoffice-compat/save.ts`
- Create: `lib/onlyoffice-compat/media.ts`
- Create: `lib/onlyoffice-compat/pdf.ts`
- Create: `lib/onlyoffice-compat/fonts.ts`
- Modify: `lib/onlyoffice-editor.ts`
- Modify: `lib/converter.ts`
- Modify: `lib/document-converter.ts`
- Modify: `lib/document-types.ts`
- Modify: `types/editor.d.ts`

- [ ] **Step 1: Implement binary contract**

Define `OnlyOfficeBinData = ArrayBuffer | Uint8Array | string`. Decode complete `DOCY/XLSY/PPTY;vX;len;base64` strings into bytes without stripping headers. Convert `Uint8Array` to a standalone `ArrayBuffer` without relying on cross-realm `instanceof`.

- [ ] **Step 2: Move runtime orchestration**

Move host sizing, single-user local settings, version observation, and local binary open into runtime/local-binary helpers. `lib/onlyoffice-editor.ts` should create the editor and delegate behavior.

- [ ] **Step 3: Move save/download**

Implement save normalization, converter invocation, local download, visible error propagation, `asc_onSaveCallback`, and download overlay end-action in `save.ts`.

- [ ] **Step 4: Move media and PDF boundaries**

Implement delayed media URL injection in `media.ts`. Implement bad PDF checks in `pdf.ts` for non-`%PDF`, `0 pages`, and `/Count 0`.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
timeout 60 node bin/check_onlyoffice_bridge_contract.mjs
timeout 60 node bin/check_onlyoffice_9_3_risks.mjs
timeout 60 pnpm run lint:ts
```

Expected: bridge contract passes; risk check fails only on runtime version/resources not yet copied; lint exits 0 with only the existing `bin/bundle_single_html.js:36 no-unused-expressions` warning.

- [ ] **Step 6: Commit adapter modules**

Run:

```bash
git add lib/onlyoffice-compat lib/onlyoffice-editor.ts lib/converter.ts lib/document-converter.ts lib/document-types.ts types/editor.d.ts bin/check_onlyoffice_9_3_risks.mjs bin/check_onlyoffice_bridge_contract.mjs docs/onlyoffice-9.3-progress.md
git commit -m "feat: implement onlyoffice gcd adapter layer"
```

## Task 4: Copy Minimal Official 9.3 Runtime

**Files:**
- Modify: `public/web-apps/**`
- Modify: `public/sdkjs/**`
- Modify: `public/fonts/**`
- Create or modify: `public/document_editor_service_worker.js`
- Modify: `lib/empty_bin.ts`
- Modify: `docs/onlyoffice-9.3-upgrade-notes.md`
- Modify: `docs/onlyoffice-9.3-progress.md`

- [ ] **Step 1: Verify source provenance**

Run:

```bash
test -d /tmp/onlyoffice-9.3-sources/documentserver-extract/var/www/onlyoffice/documentserver
rg -n "Version: 9\\.3\\.1|build:10|return '9\\.3\\.1'" /tmp/onlyoffice-9.3-sources/documentserver-extract/var/www/onlyoffice/documentserver/web-apps /tmp/onlyoffice-9.3-sources/documentserver-extract/var/www/onlyoffice/documentserver/sdkjs
```

Expected: extracted DocumentServer runtime exists and reports 9.3.1.

- [ ] **Step 2: Copy manifest entries**

Copy only:

```text
web-apps/apps/api/documents/api.js generated from api.js.tpl
web-apps/apps/{documenteditor,spreadsheeteditor,presentationeditor}/main/index.html
web-apps/apps/{documenteditor,spreadsheeteditor,presentationeditor}/main/index_loader.html
web-apps/apps/{documenteditor,spreadsheeteditor,presentationeditor}/main/app.js
web-apps/apps/{documenteditor,spreadsheeteditor,presentationeditor}/main/code.js
web-apps/apps/{documenteditor,spreadsheeteditor,presentationeditor}/main/locale/{en,zh}.json
web-apps/vendor/{jquery,requirejs,underscore,xregexp,es6-promise,fetch,socketio}
sdkjs/{word,cell,slide}/sdk-all.js
sdkjs/{word,cell,slide}/sdk-all-min.js
sdkjs/{word,cell,slide}/sdk-all.bin
sdkjs/cell/css/main.css
sdkjs/cell/css/main-mobile.css
sdkjs/common/{Native,Charts,Drawings/Format,hash,spell,zlib,libfont}
document_editor_service_worker.js
```

Do not copy PDF, Visio, Monaco, help, mobile, forms, or embed resources without a browser load trace.

- [ ] **Step 3: Update empty bins**

Use trusted 9.3 DOCX and XLSX empty bins. Leave PPTX unchanged or unsupported unless a trusted source is found; document this explicitly.

- [ ] **Step 4: Verify runtime gates**

Run:

```bash
timeout 60 node bin/check_onlyoffice_9_3_risks.mjs
timeout 60 node bin/check_onlyoffice_bridge_contract.mjs
```

Expected: both pass.

- [ ] **Step 5: Commit runtime**

Run:

```bash
git add public/web-apps public/sdkjs public/fonts public/document_editor_service_worker.js lib/empty_bin.ts docs/onlyoffice-9.3-upgrade-notes.md docs/onlyoffice-9.3-progress.md
git commit -m "chore: add minimal onlyoffice 9.3 gcd runtime"
```

## Task 5: Browser Smoke Harness

**Files:**
- Modify: `bin/smoke_onlyoffice_9_3_browser.mjs`
- Modify: `docs/onlyoffice-9.3-progress.md`

- [ ] **Step 1: Implement dynamic ports**

Use `server.listen(0)` for fixture/sample serving. Do not bind a fixed smoke fixture port.

- [ ] **Step 2: Use isolated scenario state**

Each scenario must create its own browser page/session state and return `scenarioDiagnostics` even on failure.

- [ ] **Step 3: Generate portable samples**

Use repo-local or generated DOCX/XLSX/CSV samples. Do not require `/Users/xy/Downloads/demo.docx` or other machine-specific paths for the final gate.

- [ ] **Step 4: Commit harness**

Run:

```bash
git add bin/smoke_onlyoffice_9_3_browser.mjs docs/onlyoffice-9.3-progress.md
git commit -m "test: add onlyoffice gcd browser smoke harness"
```

## Task 6: Full Verification And Handoff

**Files:**
- Modify: `docs/onlyoffice-9.3-progress.md`
- Modify: `docs/onlyoffice-9.3-upgrade-notes.md`

- [ ] **Step 1: Run script gates**

Run:

```bash
timeout 60 node bin/check_onlyoffice_bridge_contract.mjs
timeout 60 node bin/check_onlyoffice_9_3_risks.mjs
timeout 60 pnpm run lint:ts
timeout 60 pnpm run build
```

Expected: all exit 0; only existing lint/build warnings are documented.

- [ ] **Step 2: Run full browser smoke**

Run:

```bash
timeout 360 node bin/smoke_onlyoffice_9_3_browser.mjs --scenario new-docx,new-xlsx,open-docx,open-xlsx,open-csv,input-save-docx,pdf-block-docx --timeout-ms 90000
```

Expected:

```text
7/7 PASS
failures=[]
no /downloadas/
no /fonts//fonts
no browser exceptions
PDF export blocked with server-side conversion message
```

- [ ] **Step 3: Record handoff language**

Write that the deliverable is:

```text
ONLYOFFICE 9.3.1 editor runtime with existing browser x2t under adapter and browser-smoke coverage.
Single-user local editing only.
PPTX and full collaboration are not claimed.
```

- [ ] **Step 4: Commit verification docs**

Run:

```bash
git add docs/onlyoffice-9.3-progress.md docs/onlyoffice-9.3-upgrade-notes.md
git commit -m "docs: record onlyoffice gcd verification"
```

## Stop Conditions

- A trusted browser-compatible 9.3 x2t artifact is required but unavailable.
- A necessary behavior can only be achieved by broad minified bundle patching with no narrow RED trace.
- Browser smoke cannot advance after three independent root-cause hypotheses.
- The implementation requires a backend, persistence schema, new dependency, or fake server success path.
- The final result would claim full multi-user collaboration or download known-bad PDFs.

