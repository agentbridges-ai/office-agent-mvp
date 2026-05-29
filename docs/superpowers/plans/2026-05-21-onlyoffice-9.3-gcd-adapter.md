# Superseded: ONLYOFFICE 9.3 GCD Adapter Plan

This historical plan is superseded by:

- `docs/superpowers/plans/2026-05-29-onlyoffice-9.3-full-adaptation.md`
- `docs/onlyoffice-9.3-progress.md`
- `docs/onlyoffice-9.3-upgrade-notes.md`

Do not execute this file. It describes the earlier GCD/minimal-vendor route. The current target is full DocumentServer 9.3.1 editor runtime plus a first-party adapter layer plus x2t 9.3.0.140 WASM alignment.

Known obsolete assumptions:

- Blocks or avoids PPTX in parts of the product boundary.
- Treats broad vendor resources such as `pdf`, `visio`, and `monaco` as unclaimed by default.
- Keeps existing browser x2t as the honest final target rather than a temporary controlled risk.
- Does not include full save coverage for Word, Spreadsheet, and Presentation.
