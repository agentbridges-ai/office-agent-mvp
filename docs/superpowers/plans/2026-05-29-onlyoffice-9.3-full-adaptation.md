# ONLYOFFICE 9.3 Full Adaptation Closed Plan

> **For agentic workers:** This plan is closed. Do not execute it as a pending checklist. Current facts live in `docs/onlyoffice-9.3-progress.md` and `docs/onlyoffice-9.3-upgrade-notes.md`.

**Goal:** Complete the browser-local ONLYOFFICE 9.3 adaptation by aligning the editor runtime, adapter bridge, and x2t WASM converter with verifiable DOCX/XLSX/PPTX/CSV open behavior and DOCX/XLSX/PPTX save bridge behavior.

**Architecture:** The project owns the adapter, gates, and smoke harness. `web-apps`/`sdkjs` are full DocumentServer 9.3.1 runtime assets, and x2t is a CryptPad `v9.3.0+0` artifact aligned to upstream `ONLYOFFICE/core v9.3.0.140`.

**Tech Stack:** TypeScript, Vite, pnpm, Node `.mjs` verification scripts, Chromium/CDP smoke harness, ONLYOFFICE DocumentServer 9.3.1 runtime assets, CryptPad x2t WASM artifact.

---

## Final Baseline

- Branch: `onlyoffice-9-3-adaption`
- Runtime: DocumentServer `9.3.1 (build:10)` full-vendor `web-apps` and `sdkjs`
- x2t: CryptPad `onlyoffice-x2t-wasm v9.3.0+0`, upstream `ONLYOFFICE/core v9.3.0.140`
- Save hooks: `AscCommon.T7c`, `AscCommon.Iid`, `AscCommon.zWc`
- Static gates: bridge contract, risk gate, format table gate, FS sandbox gate, path behavior gate, docs/artifact consistency gate
- Runtime sensor: 11-scenario browser smoke harness

## Completed Tasks

### Task 1: Align Docs And Risk Gate With Full-Vendor Target

Status: completed.

Evidence:

```bash
node bin/check_onlyoffice_9_3_risks.mjs --root .
```

Expected current result: PASS. The gate now treats full-vendor `pdf`, `visio`, and `monaco` resources as intentional when documented, while still rejecting fake local save success and unsafe adapter smells.

### Task 2: Make Save Hook Contract Enforce Word, Spreadsheet, Presentation

Status: completed.

Evidence:

```bash
node bin/check_onlyoffice_bridge_contract.mjs --root .
```

Expected current result: PASS. `lib/onlyoffice-compat/save.ts` installs a hook table for `T7c`, `Iid`, and `zWc`.

### Task 3: Add XLSX And PPTX Save Smoke Scenarios

Status: completed.

Evidence:

```bash
node bin/smoke_onlyoffice_9_3_browser.mjs --chrome /snap/bin/chromium --timeout-ms 240000
```

Expected current result: PASS for `input-save-docx`, `input-save-xlsx`, and `input-save-pptx`.

### Task 4: Replace x2t With CryptPad 9.3.0+0 Artifact

Status: completed.

Active artifact facts:

| File | Size | sha256 |
| --- | ---: | --- |
| `public/wasm/x2t/x2t.js` | 135767 | `e0abb59942bf4bf3734e04208107e88aeab243f26ca4b689b4c193bc96e58eeb` |
| `public/wasm/x2t/x2t.wasm` | 35985703 | `e166c252adbd603e5e3abf65cf3b37bf0424a33edd9ae1b4b791176ce7fd2caa` |
| `public/wasm/x2t/x2t.wasm.br` | 6806135 | `8dfeb638225fff59547eaca1ae6d24e0123aa90a2688c73d246e2ba1127d689e` |
| `public/wasm/x2t/x2t.wasm.gz` | 9629242 | `9bd91c02ab5d8b25c1bdfdde145b89a6b87b20d53d77c3f44e571f67094663dd` |

`x2t.js` includes a local `Module.locateFile = function(path, prefix) { return prefix + path; };` patch for this standalone Vite loading model.

### Task 5: Run x2t Open/Save Browser Regression

Status: completed.

Required scenarios:

- `new-docx`
- `new-xlsx`
- `new-pptx`
- `input-save-docx`
- `pdf-block-docx`
- `open-docx`
- `open-xlsx`
- `open-csv`
- `input-save-xlsx`
- `input-save-pptx`
- `open-pptx`

Expected current result: 11/11 PASS, 0 failures, 0 exceptions.

### Task 6: Gate 9.3 Format IDs

Status: completed.

Evidence:

```bash
node bin/check_onlyoffice_format_table.mjs --root .
```

Expected current result: PASS. This is a required-ID gate, not a full generated copy of every upstream format constant.

### Task 7: Add WASM FS Path Sandbox

Status: completed.

Evidence:

```bash
node bin/check_x2t_fs_sandbox.mjs --root .
node bin/check_x2t_path_behavior.mjs --root .
```

Expected current result: PASS. The behavior gate verifies rejection of traversal, absolute paths, URL/protocol paths, Windows drive prefixes, and NUL bytes.

### Task 8: Final Verification And Handoff

Status: completed when these commands all exit 0 in the current worktree:

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

## Explicit Non-Claims

- No independent x2t source-build pipeline is owned by this repo yet.
- No full conversion-quality, visual-layout, CJK/RTL/font, large-file, concurrency, or password-document regression suite is claimed.
- XLSX/PPTX save smoke verifies the download bridge and callback, not content editing persistence through Cell/Slide-specific edit APIs.
- CSV open is covered; native x2t CSV save replacement is not claimed.
