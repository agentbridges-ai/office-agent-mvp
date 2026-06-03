# Word/PPT Agent MVP Review Ledger

Date: 2026-06-03

## Hard Gate Status

- Automated gates: collected in `.cse-residual-risks.md`.
- Manual `/goal` review: not complete.

## Machine-Collected Visual Evidence

Command context:

```bash
APP_URL=http://127.0.0.1:5173
node manual browser sampling against /tmp/document-e2e-run
```

Artifacts:

- `/tmp/document-e2e-run/test-results/manual-review/excel-ui.png`
- `/tmp/document-e2e-run/test-results/manual-review/word-edited.png`
- `/tmp/document-e2e-run/test-results/manual-review/ppt-edited.png`
- `/tmp/document-e2e-run/test-results/manual-review/manual-review-evidence.json`
- `/tmp/document-e2e-run/test-results/agent-visual-current/word-current.png`
- `/tmp/document-e2e-run/test-results/agent-visual-current/ppt-current.png`
- `/tmp/document-e2e-run/test-results/agent-visual-current/evidence.json`
- `/tmp/document-e2e-run/test-results/manual-review-current/excel-current.png`
- `/tmp/document-e2e-run/test-results/manual-review-current/word-current.png`
- `/tmp/document-e2e-run/test-results/manual-review-current/ppt-current.png`
- `/tmp/document-e2e-run/test-results/manual-review-current/evidence.json`

Observed machine evidence:

- Excel editor loaded an XLSX with the Agent menu visible; screenshot was nonblank and the shared menu guidance was Office-neutral.
- Word tool insertion returned `ok: true`, saved `New_Document.docx`, and produced a DOCX download.
- PPT add-slide/add-text-box returned `ok: true`, saved `New_Document.pptx`, and produced a PPTX download.
- After the visible-edit fix, Word insertion uses trusted plugin `Asc.plugin.executeMethod('PasteText')`; the current Word screenshot shows a visible inserted glyph run instead of a blank document canvas.
- The current PPT screenshot shows a visible selected text region on the slide.
- The host FAB menu is hidden in the current evidence JSON: `display: none`, `pointer-events: none`, `opacity: 0`.
- After the plugin readiness reset, same-page Excel -> Word -> PPT sampling returned `ok: true` for Word insert/save and PPT add-slide/add-text-box/save.
- The refreshed current evidence JSON recorded `New_Document.docx` and `New_Document.pptx` downloads, and no `Cannot read properties` or `bridge is not ready` host text.

Manual review limits:

- WSL/headless Chromium renders inserted ASCII text as square glyphs in both Word/PPT editor canvases.
- Therefore this machine sampling proves visible mutation, but does not close the human-readable edit review gate.

## Human Sign-Off Checklist

- [ ] Excel UI/UX has no obvious regression after the final build.
- [ ] Word edit is visibly present in the browser editor, not only in OOXML output.
- [ ] PPT slide/text box edit is visibly present and readable in the browser editor, not only in OOXML output.
- [ ] Downloaded DOCX/PPTX file formats are correct when opened manually.
- [ ] Unsupported/missing runtime API errors are observable and not silently swallowed.
