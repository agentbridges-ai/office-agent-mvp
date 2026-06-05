# Word/PPT Agent MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair the current ONLYOFFICE 9.3 + Excel Agent baseline, then add Word and PPT Agent MVP editing and save loops without regressing Excel Agent UI/UX or existing 9.3 gates.

**Architecture:** Treat this as a staged control problem. First restore a clean spreadsheet editor entrypoint and save-format truth source. Then introduce shared Office Agent contracts while preserving Excel compatibility. Word/PPT tools should be small, explicit adapters over real browser ONLYOFFICE APIs, with no mock success path.

**Tech Stack:** TypeScript, Vite, Vitest, Playwright, ONLYOFFICE 9.3 browser runtime, x2t WASM, Vercel AI SDK tools, IndexedDB checkpoints.

---

## Control Contract

| Field | Contract |
| --- | --- |
| Primary Setpoint | Word/PPT Agent can create, edit, and save DOCX/PPTX in the browser while Excel Agent and ONLYOFFICE 9.3 gates remain intact. |
| Acceptance | Conflict scan, `pnpm run tsc`, `pnpm test`, `pnpm run gate:onlyoffice`, focused Word/PPT Agent E2E, and `pnpm run test:e2e:smoke` are run and reported. |
| Guardrails | No main-branch work, no silent fallback, no mock success, no default XLSX save for DOCX/PPTX, no x2t/font/hash churn, no Excel UI/UX regression. |
| Boundary | Allowed files match the active `/goal` scope. Vendor changes are limited to the spreadsheet entrypoint conflict repair and minimal bridge injection. |
| Rollback Trigger | Stop if a required edit touches x2t patches, font hash locks, broad vendor content, new production dependencies, or fake Word/PPT runtime behavior. |
| Risks | Word/PPT runtime APIs may be thinner than spreadsheet APIs; WSL E2E may time out; Agent UI text may accidentally remain Excel-specific. |

## Task 0: P0 Spreadsheet Entrypoint Baseline

**Files:**
- Modify: `public/web-apps/apps/spreadsheeteditor/main/index.html`
- Verify: conflict scan command from the active goal

- [ ] **Step 1: Verify RED**

Run:

```bash
rg -n "^(<<<<<<<|=======$|>>>>>>>)" index.html package.json lib tests bin docs scripts public/office-agent-plugin office-agent-plugin public/web-apps/apps/{documenteditor,presentationeditor,spreadsheeteditor}/main/index.html public/web-apps/apps/spreadsheeteditor/main/office-agent-frame-bridge.js --glob '!**/*.map'
```

Expected before repair: matches in `public/web-apps/apps/spreadsheeteditor/main/index.html`.

- [ ] **Step 2: Repair the file**

Keep the 9.3 spreadsheet HTML side and remove conflict markers plus the stale main-side HTML. Add this bridge script after the existing spreadsheet `require(['app'])` block and before the stylesheet/body close:

```html
    <script src="office-agent-frame-bridge.js"></script>
```

- [ ] **Step 3: Verify GREEN**

Run the same conflict scan.

Expected after repair: no output and non-zero `rg` exit from no matches.

## Task 1: Save Format Truth Source

**Files:**
- Modify: `lib/onlyoffice-editor.ts`
- Modify: `lib/onlyoffice-compat/save.ts`
- Test: `tests/save-format.test.ts`

- [ ] **Step 1: Add characterization tests**

Create tests that prove DOCX, XLSX, PPTX, and CSV resolve to their own target formats and never default to XLSX for non-cell documents.

- [ ] **Step 2: Remove fixed XLSX save path**

Replace the `Phase 1 is Excel-only` branch in `handleSaveDocument` with a shared target-format resolver that uses ONLYOFFICE `outputformat` and CSV filename override.

- [ ] **Step 3: Run focused tests**

Run:

```bash
pnpm exec vitest run tests/save-format.test.ts
```

Expected: all save-format tests pass.

## Task 2: Document-Level Checkpoints

**Files:**
- Modify: `lib/checkpoints.ts`
- Modify: `lib/agent/panel.ts`
- Test: `tests/checkpoints.test.ts`

- [ ] **Step 1: Lock existing checkpoint behavior**

Add tests for scope, filename, file type, and metadata behavior using document-neutral names.

- [ ] **Step 2: Rename public semantics safely**

Introduce document-level checkpoint aliases while preserving Excel-compatible exports until panel wiring is migrated.

- [ ] **Step 3: Verify**

Run:

```bash
pnpm exec vitest run tests/checkpoints.test.ts
pnpm run tsc
```

Expected: tests pass and TypeScript has 0 errors.

## Task 3: Shared Office Agent Contracts

**Files:**
- Modify: `lib/agent/types.ts`
- Modify: `lib/agent/agent.ts`
- Modify: `lib/agent/bridge.ts`
- Modify: `lib/agent/excel-tools.ts`
- Create: `lib/agent/office-tools.ts`
- Test: `tests/office-agent-contracts.test.ts`

- [ ] **Step 1: Add shared types**

Add document type, shared target/context input, and generic capability/tool result contracts without deleting Excel-compatible names.

- [ ] **Step 2: Add shared bridge alias**

Add an Office Agent bridge class or wrapper while keeping `excelBridge` as a compatibility export.

- [ ] **Step 3: Split generic office API tools**

Move office API catalog/call schema into `office-tools.ts`; keep Excel tools focused on spreadsheet operations.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm exec vitest run tests/office-agent-contracts.test.ts tests/excel-tools.test.ts
pnpm run tsc
```

Expected: shared contracts pass, existing Excel tests pass, TypeScript has 0 errors.

## Task 4: Word Agent MVP

**Files:**
- Create: `lib/agent/word-tools.ts`
- Modify: `lib/agent/agent.ts`
- Add bridge injection or lightweight bridge under `public/web-apps/apps/documenteditor/main/` if runtime access requires it
- Test: `tests/word-tools.test.ts`
- E2E: `tests/e2e/agent-word-ppt.spec.ts`

- [ ] **Step 1: Add Word tool schemas**

Add `word_get_context`, `word_insert_text`, `word_format_selection`, and `word_save_document` schemas with explicit unsupported errors when runtime APIs are missing.

- [ ] **Step 2: Add real browser execution path**

Use real ONLYOFFICE word editor APIs such as readiness checks and text insertion APIs discovered from the runtime. Do not simulate success.

- [ ] **Step 3: Add focused E2E**

Create DOCX, invoke Agent/bridge operation, save, extract `word/document.xml`, and assert the inserted text exists.

## Task 5: PPT Agent MVP

**Files:**
- Create: `lib/agent/ppt-tools.ts`
- Modify: `lib/agent/agent.ts`
- Add bridge injection or lightweight bridge under `public/web-apps/apps/presentationeditor/main/` if runtime access requires it
- Test: `tests/ppt-tools.test.ts`
- E2E: `tests/e2e/agent-word-ppt.spec.ts`

- [ ] **Step 1: Add PPT tool schemas**

Add `ppt_get_context`, `ppt_add_slide`, `ppt_add_text_box`, and `ppt_save_document` schemas with explicit unsupported errors when runtime APIs are missing.

- [ ] **Step 2: Add real browser execution path**

Use real ONLYOFFICE presentation editor APIs discovered from the runtime. Do not simulate success.

- [ ] **Step 3: Add focused E2E**

Create PPTX, invoke Agent/bridge operation, save, extract `ppt/slides/slide*.xml`, and assert the inserted text exists.

## Task 6: Final Verification and Residual Risk Ledger

**Files:**
- Modify: `.cse-residual-risks.md`

- [ ] **Step 1: Run L0/L1 checks**

Run:

```bash
pnpm run tsc
pnpm test
pnpm run gate:onlyoffice
pnpm exec playwright test tests/e2e/agent-word-ppt.spec.ts --reporter=list
```

- [ ] **Step 2: Run L2 smoke**

Run:

```bash
pnpm run test:e2e:smoke
```

Expected: pass in native Linux/Docker. If WSL times out, record exact test name, timestamp, timeout duration, and why it is sensor limitation rather than code pass.

- [ ] **Step 3: Record manual `/goal` review**

Update `.cse-residual-risks.md` with manual review evidence for Excel UI/UX, Word/PPT visible edits, save format correctness, and observable error states.
