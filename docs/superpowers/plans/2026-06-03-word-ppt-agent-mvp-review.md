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

Observed machine evidence:

- Excel editor loaded an XLSX with the Agent menu visible; screenshot was nonblank and the shared menu guidance was Office-neutral.
- Word tool insertion returned `ok: true`, saved `New_Document.docx`, and produced a DOCX download.
- PPT add-slide/add-text-box returned `ok: true`, saved `New_Document.pptx`, and produced a PPTX download.

Manual review limits:

- Word screenshot showed the editor loaded, but the inserted text was not visibly readable in the screenshot.
- PPT screenshot showed a text box region, but rendered glyphs were boxes in the screenshot.
- Therefore this machine sampling does not close the human-visible edit review gate.

## Human Sign-Off Checklist

- [ ] Excel UI/UX has no obvious regression after the final build.
- [ ] Word edit is visibly present in the browser editor, not only in OOXML output.
- [ ] PPT slide/text box edit is visibly present and readable in the browser editor, not only in OOXML output.
- [ ] Downloaded DOCX/PPTX file formats are correct when opened manually.
- [ ] Unsupported/missing runtime API errors are observable and not silently swallowed.
