# Word/PPT Agent MVP Completion Audit

Date: 2026-06-03

This audit maps the active `/goal` Done when items to current evidence. It is not a completion claim: two hard gates remain open.

## Status Summary

- Machine-verified Word/PPT Agent MVP path: closed.
- Full smoke command: run, but not green because PDF x2t conversion still fails.
- Manual `/goal` review: not signed off.
- Goal status: active.

## Done When Audit

| # | Requirement | Current status | Evidence |
| --- | --- | --- | --- |
| 1 | Conflict marker scan has no real markers. | Achieved | Latest scans recorded no matches for the active goal command. |
| 2 | Spreadsheet 9.3 HTML keeps `office-agent-frame-bridge.js` injection. | Achieved | `tests/agent-frame-bridges.test.ts`; `pnpm test` passed. |
| 3 | `lib/onlyoffice-editor.ts` no longer has fixed Excel-only XLSX save logic. | Achieved | `tests/save-format.test.ts`; `pnpm test` passed. |
| 4 | Checkpoints use document-level naming/scope. | Achieved | `tests/checkpoints.test.ts`; checkpoint save shortcut removed in `ddf70f91`. |
| 5 | Office/Excel/Word/PPT agent layers are clear, Excel entry remains compatible. | Achieved | `tests/office-agent-contracts.test.ts`; `pnpm test` passed. |
| 6 | Word Agent creates DOCX, inserts text, saves, and E2E asserts `word/document.xml`. | Achieved | Focused E2E: `2 passed` at 2026-06-03 17:08 +08:00. |
| 7 | PPT Agent creates PPTX, adds slide/text box, saves, and E2E asserts slide XML. | Achieved | Focused E2E: `2 passed` at 2026-06-03 17:08 +08:00. |
| 8 | Unit tests cover Word/PPT schema, unsupported, approval, save target format. | Achieved | `pnpm test`: 12 files / 62 tests passed. |
| 9 | `pnpm run tsc` passes. | Achieved | Last run passed after `a1b69fbf`. |
| 10 | `pnpm test` passes. | Achieved | Last run: 12 files / 62 tests passed. |
| 11 | `pnpm run gate:onlyoffice` passes. | Achieved | Last run: 7/7 gate checks passed. |
| 12 | Focused Playwright Agent E2E passes. | Achieved | `APP_URL=http://127.0.0.1:5173 timeout 900s pnpm exec playwright test tests/e2e/agent-word-ppt.spec.ts --reporter=line --workers=1 --retries=0`: 2 passed. |
| 13 | `pnpm run test:e2e:smoke` has been run and failures are classified. | Not green | Latest run: 14 passed / 1 failed. Remaining failure is `convertLocal produces PDF with LiberationSans font preload`. |
| 14 | `.cse-residual-risks.md` records unresolved residual risks. | Achieved | Ledger includes WSL/dev-server limits, PDF x2t boundary probes, binary DOC/XLS/PPT boundary, vendor bridge rationale, manual review limits. |
| 15 | Manual `/goal` review is complete and recorded. | Not achieved | `2026-06-03-word-ppt-agent-mvp-review.md` has machine evidence, but human sign-off checkboxes remain unchecked. |

## Open Gates

### Full Smoke PDF Failure

Latest smoke result:

```bash
APP_URL=http://127.0.0.1:5173 timeout 900s pnpm run test:e2e:smoke
```

Result: `14 passed`, `1 failed`.

Remaining failed test:

```text
convertLocal produces PDF with LiberationSans font preload
```

Boundary probes show:

- `inputName` and explicit `formatFrom` changes do not fix the failure.
- `LiberationSans-Regular.ttf` exists in the Emscripten FS.
- Adding `AllFonts.js` and LiberationSans regular/bold/italic/bold-italic still fails.
- Empty bin -> DOCX succeeds, but generated DOCX -> PDF still returns `[x2t:80]`.

This points at x2t/PDF/font-runtime scope, which is outside the Word/PPT Agent MVP and must not be soft-passed.

### Manual Review

Machine evidence is available at:

```text
/tmp/document-e2e-run/test-results/manual-review-current/
```

Regenerate it with:

```bash
APP_URL=http://127.0.0.1:5173 pnpm exec playwright test tests/e2e/agent-manual-review.spec.ts --reporter=line --workers=1 --retries=0
```

Latest run at 2026-06-03 17:25 +08:00 passed and wrote:

- `excel-current.png`
- `word-current.png`
- `ppt-current.png`
- `evidence.json`

Human sign-off is still required for:

- Excel UI/UX no obvious regression.
- Word visible edit is present and readable in browser.
- PPT slide/text box edit is present and readable in browser.
- Downloaded DOCX/PPTX open manually with correct format.
- Unsupported or missing runtime API errors are observable.
