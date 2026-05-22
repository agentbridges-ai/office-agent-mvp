# ONLYOFFICE 9.3 GCD Review Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the review findings in `docs/onlyoffice-9.3-gcd-review.md` without widening the ONLYOFFICE 9.3 GCD adapter scope.

**Architecture:** Keep compatibility logic in `lib/onlyoffice-compat/**`; keep vendored runtime as official/minimal inputs. Add narrow tests/gates that expose the exact failures: cross-realm binary values, fake save success, unsupported PPTX entry points, undocumented minified shims, and port collision.

**Tech Stack:** TypeScript, Vite, pnpm, Node `.mjs` gate scripts, Chromium/CDP smoke harness, existing browser x2t WASM.

---

## Files

- Modify: `lib/onlyoffice-compat/binary.ts`
- Modify: `lib/onlyoffice-compat/media.ts`
- Modify: `lib/onlyoffice-compat/save.ts`
- Modify: `lib/onlyoffice-compat/local-binary.ts`
- Modify: `lib/onlyoffice-compat/runtime.ts`
- Modify: `lib/onlyoffice-compat/fonts.ts`
- Modify: `lib/onlyoffice-editor.ts`
- Modify: `lib/converter.ts`
- Modify: `lib/document-converter.ts`
- Modify: `lib/document.ts`
- Modify: `lib/ui.ts`
- Modify: `bin/check_onlyoffice_9_3_risks.mjs`
- Modify: `bin/check_onlyoffice_bridge_contract.mjs`
- Modify: `bin/smoke_onlyoffice_9_3_browser.mjs`
- Modify: `bin/onlyoffice-smoke/**`
- Modify: `docs/onlyoffice-9.3-progress.md`
- Modify: `docs/onlyoffice-9.3-upgrade-notes.md`
- Modify: `docs/onlyoffice-9.3-gcd-review.md`

## Task 1: Normalize Cross-Realm Binary Handling

- [ ] **Step 1: Add failing gate for cross-realm unsafe checks**

Update `bin/check_onlyoffice_bridge_contract.mjs` to fail when first-party adapter/converter code uses `instanceof Uint8Array` or `instanceof ArrayBuffer` for binary acceptance outside the central binary helper.

Run:

```bash
timeout 60 node bin/check_onlyoffice_bridge_contract.mjs
```

Expected: FAIL naming `media.ts`, `converter.ts`, and `document-converter.ts`.

- [ ] **Step 2: Implement central helpers**

In `lib/onlyoffice-compat/binary.ts`, export:

```ts
export function toStandaloneArrayBuffer(value: ArrayBuffer | ArrayBufferView): ArrayBuffer {
  if (isArrayBufferView(value)) {
    const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    return bytes.slice().buffer;
  }
  if (isArrayBuffer(value)) return value;
  throw new Error('Expected binary ArrayBuffer or ArrayBufferView');
}

export function toUint8Array(value: unknown): Uint8Array | null {
  if (isArrayBuffer(value)) return new Uint8Array(value);
  if (isArrayBufferView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  return null;
}
```

Keep the existing object-tag ArrayBuffer detection.

- [ ] **Step 3: Replace unsafe binary checks**

Use `toUint8Array()` or `toStandaloneArrayBuffer()` in:

- `lib/onlyoffice-compat/media.ts`
- `lib/converter.ts`
- `lib/document-converter.ts`

Do not add new fallback behavior; invalid binary values must still throw.

- [ ] **Step 4: Verify**

Run:

```bash
timeout 60 node bin/check_onlyoffice_bridge_contract.mjs
timeout 60 pnpm run lint:ts
```

Expected: both exit 0; `lint:ts` may retain only `bin/bundle_single_html.js:36 no-unused-expressions`.

- [ ] **Step 5: Commit**

```bash
git add lib/onlyoffice-compat/binary.ts lib/onlyoffice-compat/media.ts lib/converter.ts lib/document-converter.ts bin/check_onlyoffice_bridge_contract.mjs docs/onlyoffice-9.3-progress.md
git commit -m "fix: normalize onlyoffice binary realm handling"
```

## Task 2: Make Save Failure Semantics Honest

- [ ] **Step 1: Add failing risk/smoke assertions**

Update smoke diagnostics to record the callback status emitted by the local download bridge. Extend `pdf-block-docx` so it requires an error callback status and rejects `status: ok` for blocked PDF.

Run:

```bash
timeout 360 node bin/smoke_onlyoffice_9_3_browser.mjs --scenario pdf-block-docx --timeout-ms 90000
```

Expected: FAIL because current bridge reports `ok` after `handleLocalSaveDocument()` catches the PDF error.

- [ ] **Step 2: Return explicit save result**

Change `handleLocalSaveDocument()` in `lib/onlyoffice-compat/save.ts` to return:

```ts
type LocalSaveResult =
  | { ok: true }
  | { ok: false; error: string };
```

On conversion failure, return `{ ok: false, error: message }` after sending `asc_onSaveCallback(editor, message)`.

- [ ] **Step 3: Route bridge callback by result**

In `installLocalDownloadBridge()`, call the internal callback with `status: 'error'` when `handleLocalSaveDocument()` returns `{ ok: false }`. Do not send `status: 'ok'` for PDF block or conversion failure.

- [ ] **Step 4: Move user-visible error out of adapter**

Replace direct `alert(message)` in `save.ts` with injected `onError(message)`. Pass `onError: (message) => alert(message)` from `lib/onlyoffice-editor.ts`.

- [ ] **Step 5: Verify**

Run:

```bash
timeout 60 node bin/check_onlyoffice_9_3_risks.mjs
timeout 60 node bin/check_onlyoffice_bridge_contract.mjs
timeout 360 node bin/smoke_onlyoffice_9_3_browser.mjs --scenario input-save-docx,pdf-block-docx --timeout-ms 90000
```

Expected: all exit 0; `input-save-docx` reports success callback; `pdf-block-docx` reports error callback and no PDF download anchor.

- [ ] **Step 6: Commit**

```bash
git add lib/onlyoffice-compat/save.ts lib/onlyoffice-editor.ts bin/onlyoffice-smoke bin/smoke_onlyoffice_9_3_browser.mjs docs/onlyoffice-9.3-progress.md
git commit -m "fix: report onlyoffice local save failures honestly"
```

## Task 3: Close Unsupported PPTX Entry Points

- [ ] **Step 1: Add failing risk gate**

Update `bin/check_onlyoffice_9_3_risks.mjs` to fail if:

- `lib/document.ts` accepts `.pptx` or `.ppt`,
- `lib/ui.ts` calls `onCreateNew('.pptx')`,
- final docs claim PPTX unsupported while UI still exposes PPTX create/open.

Run:

```bash
timeout 60 node bin/check_onlyoffice_9_3_risks.mjs
```

Expected: FAIL on current PPT/PPTX entry points.

- [ ] **Step 2: Block PPTX in product boundary**

Change `lib/document.ts` file input accept string to:

```ts
fileInput.accept = '.docx,.xlsx,.doc,.xls,.csv';
```

In `openDocumentFromUrl()` and the file-input open path, reject PPT/PPTX by extension with a visible unsupported error before `initX2T()`.

- [ ] **Step 3: Disable or remove new PPTX UI action**

In `lib/ui.ts`, remove the `onCreateNew('.pptx')` action or replace it with a visible unsupported message. Keep the docs wording: PPTX is not claimed.

- [ ] **Step 4: Gate legacy empty bin**

Either remove `.pptx` from `g_sEmpty_bin` or add a risk gate that fails if `g_sEmpty_bin['.pptx']` is reachable from UI/open paths. Prefer removal if TypeScript and existing non-PPT smoke remain green.

- [ ] **Step 5: Verify**

Run:

```bash
timeout 60 node bin/check_onlyoffice_9_3_risks.mjs
timeout 60 pnpm run lint:ts
timeout 360 node bin/smoke_onlyoffice_9_3_browser.mjs --scenario new-docx,new-xlsx,open-docx,open-xlsx,open-csv --timeout-ms 90000
```

Expected: all exit 0; no PPTX scenario added.

- [ ] **Step 6: Commit**

```bash
git add lib/document.ts lib/ui.ts lib/empty_bin.ts bin/check_onlyoffice_9_3_risks.mjs docs/onlyoffice-9.3-progress.md docs/onlyoffice-9.3-upgrade-notes.md
git commit -m "fix: close unsupported onlyoffice pptx entry points"
```

## Task 4: Document and Gate Minified Runtime Shims

- [ ] **Step 1: Add shim contract docs**

Create or extend docs with a section named `Local Runtime Shim Contract`. It must include:

- `AscCommon.T7c`: observed in 9.3.1 download-as path; intercepted to prevent `/downloadas/{documentId}`.
- `asyncServerIdEndLoaded` and minified aliases: observed local binary readiness hooks for 9.3.1; failure means adapter must be re-audited.
- `asc_getBuildVersion/asc_getBuildNumber`: simulated 9.3.1 permission response for local editor acceptance, not a real DocumentServer.

- [ ] **Step 2: Add failing risk gate for undocumented shims**

Update `bin/check_onlyoffice_9_3_risks.mjs` so any occurrence of `AscCommon.T7c`, `n1f`, `Mmg`, or `NOf` must have corresponding documentation in `docs/onlyoffice-9.3-upgrade-notes.md`.

Run:

```bash
timeout 60 node bin/check_onlyoffice_9_3_risks.mjs
```

Expected: FAIL before documentation is present, PASS after Step 1.

- [ ] **Step 3: Refactor local hook candidates**

In `lib/onlyoffice-compat/local-binary.ts`, replace inline fallback expression with a named constant:

```ts
const LOCAL_BINARY_READY_HOOK_CANDIDATES = [
  'asyncServerIdEndLoaded',
  'n1f',
  'Mmg',
  'NOf',
] as const;
```

The thrown error must include the candidate list.

- [ ] **Step 4: Verify**

Run:

```bash
timeout 60 node bin/check_onlyoffice_9_3_risks.mjs
timeout 60 node bin/check_onlyoffice_bridge_contract.mjs
timeout 360 node bin/smoke_onlyoffice_9_3_browser.mjs --scenario new-docx,input-save-docx,pdf-block-docx --timeout-ms 90000
```

Expected: all exit 0.

- [ ] **Step 5: Commit**

```bash
git add lib/onlyoffice-compat/local-binary.ts bin/check_onlyoffice_9_3_risks.mjs docs/onlyoffice-9.3-upgrade-notes.md docs/onlyoffice-9.3-progress.md
git commit -m "docs: record onlyoffice local runtime shim contract"
```

## Task 5: Stabilize Smoke Port Allocation

- [ ] **Step 1: Add failing gate for random strict port**

Update `bin/check_onlyoffice_9_3_risks.mjs` to reject `Math.random()` in `bin/onlyoffice-smoke/processes.mjs`.

Run:

```bash
timeout 60 node bin/check_onlyoffice_9_3_risks.mjs
```

Expected: FAIL on current random port selection.

- [ ] **Step 2: Implement bounded Vite port retry**

Change `startViteAppServer()` to try deterministic ports in a small range derived from process id, or to ask the OS for a free port before spawning Vite. Keep `--strictPort`; on collision, retry with a different port and include Vite output in diagnostics.

- [ ] **Step 3: Verify**

Run:

```bash
timeout 60 node bin/check_onlyoffice_9_3_risks.mjs
timeout 360 node bin/smoke_onlyoffice_9_3_browser.mjs --scenario new-docx,new-xlsx,open-docx,open-xlsx,open-csv,input-save-docx,pdf-block-docx --timeout-ms 90000
```

Expected: all exit 0.

- [ ] **Step 4: Commit**

```bash
git add bin/onlyoffice-smoke/processes.mjs bin/check_onlyoffice_9_3_risks.mjs docs/onlyoffice-9.3-progress.md
git commit -m "test: stabilize onlyoffice smoke port allocation"
```

## Task 6: Cleanup Low-Severity Adapter Smells

- [ ] **Step 1: Add binary header preservation comment**

In `lib/onlyoffice-compat/binary.ts`, add a short comment above the string path explaining that ONLYOFFICE expects the complete `DOCY/XLSY/PPTY;vX;len;base64` header text.

- [ ] **Step 2: Extract cleanup delay helper**

In `lib/onlyoffice-editor.ts`, replace duplicated presentation delay logic with named constants and:

```ts
function getEditorCleanupDelayMs(hasExistingEditor: boolean, fileType: string): number {
  if (!hasExistingEditor) return EDITOR_CLEANUP_DELAY_MS;
  return isPresentationFileType(fileType) ? PRESENTATION_CLEANUP_DELAY_MS : EDITOR_SWITCH_CLEANUP_DELAY_MS;
}
```

- [ ] **Step 3: Tighten postMessage target origin**

Use `window.location.origin` for same-origin parent/frame messages where possible. If any call must stay `'*'`, add a comment explaining why.

- [ ] **Step 4: Give `fonts.ts` a real owner or remove it from adapter requirement**

Preferred: import `isInvalidOnlyOfficeFontPath()` in `bin/check_onlyoffice_9_3_risks.mjs` only if the script can consume it without TypeScript transpilation. Otherwise remove `fonts.ts` from `REQUIRED_ADAPTER_FILES` and document font checks as gate-owned, not runtime-owned.

- [ ] **Step 5: Verify**

Run:

```bash
timeout 60 node bin/check_onlyoffice_bridge_contract.mjs
timeout 60 node bin/check_onlyoffice_9_3_risks.mjs
timeout 60 pnpm run lint:ts
timeout 60 pnpm run build
timeout 360 node bin/smoke_onlyoffice_9_3_browser.mjs --scenario new-docx,new-xlsx,open-docx,open-xlsx,open-csv,input-save-docx,pdf-block-docx --timeout-ms 90000
```

Expected: all exit 0; build may retain recorded non-fatal Vite/shell warnings.

- [ ] **Step 6: Commit**

```bash
git add lib/onlyoffice-compat lib/onlyoffice-editor.ts bin/check_onlyoffice_9_3_risks.mjs docs/onlyoffice-9.3-progress.md docs/onlyoffice-9.3-upgrade-notes.md
git commit -m "refactor: tighten onlyoffice adapter boundaries"
```

## Final Verification

- [ ] **Step 1: Run full fresh verification**

```bash
timeout 60 node bin/check_onlyoffice_bridge_contract.mjs
timeout 60 node bin/check_onlyoffice_9_3_risks.mjs
timeout 60 pnpm run lint:ts
timeout 60 pnpm run build
timeout 360 node bin/smoke_onlyoffice_9_3_browser.mjs --scenario new-docx,new-xlsx,open-docx,open-xlsx,open-csv,input-save-docx,pdf-block-docx --timeout-ms 90000
```

- [ ] **Step 2: Update review docs**

Mark each finding in `docs/onlyoffice-9.3-gcd-review.md` as fixed, accepted-risk, or deferred with evidence.

- [ ] **Step 3: Commit final docs**

```bash
git add docs/onlyoffice-9.3-gcd-review.md docs/onlyoffice-9.3-progress.md docs/onlyoffice-9.3-upgrade-notes.md
git commit -m "docs: record onlyoffice gcd review fixes"
```

