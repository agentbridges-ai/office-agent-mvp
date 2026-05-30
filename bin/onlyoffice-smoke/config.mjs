export const DEFAULT_CHROME = '/snap/bin/chromium';
export const DEFAULT_TIMEOUT = 120_000;

export const REQUIRED_REQUESTS = [
  '/web-apps/apps/api/documents/api.js',
  '/sdkjs/common/AllFonts.js',
  '/wasm/x2t/x2t.js',
];

export const DEFAULT_SCENARIOS = [
  { name: 'new-docx', kind: 'new', ext: '.docx', expectDocumentReady: true },
  { name: 'new-xlsx', kind: 'new', ext: '.xlsx', expectDocumentReady: true },
  {
    name: 'input-save-docx',
    kind: 'new',
    ext: '.docx',
    expectDocumentReady: true,
    action: 'input-save',
  },
  {
    name: 'pdf-block-docx',
    kind: 'new',
    ext: '.docx',
    expectDocumentReady: true,
    action: 'pdf-block',
  },
  {
    name: 'open-docx',
    kind: 'generated',
    ext: '.docx',
    fileName: 'generated-smoke.docx',
    expectDocumentReady: true,
  },
  {
    name: 'open-xlsx',
    kind: 'generated',
    ext: '.xlsx',
    fileName: 'generated-smoke.xlsx',
    expectDocumentReady: true,
  },
  {
    name: 'open-csv',
    kind: 'generated',
    ext: '.csv',
    fileName: 'generated-smoke.csv',
    expectDocumentReady: true,
  },
  {
    name: 'input-save-xlsx',
    kind: 'new',
    ext: '.xlsx',
    expectDocumentReady: true,
    action: 'input-save',
  },
  {
    name: 'input-save-pptx',
    kind: 'new',
    ext: '.pptx',
    expectDocumentReady: true,
    action: 'input-save',
  },
  { name: 'new-pptx', kind: 'new', ext: '.pptx', expectDocumentReady: true },
  {
    name: 'open-pptx',
    kind: 'generated',
    ext: '.pptx',
    fileName: 'generated-smoke.pptx',
    expectDocumentReady: true,
  },
  {
    name: 'open-password-docx',
    kind: 'generated',
    ext: '.protected.docx',
    fileName: 'generated-smoke-password.docx',
    expectDocumentReady: false,
  },
  {
    name: 'open-large-docx',
    kind: 'generated',
    ext: '.large.docx',
    fileName: 'generated-smoke-large.docx',
    expectDocumentReady: true,
  },
  // ── Phase 1: ODF formats ──────────────────────────────────
  {
    name: 'open-odt',
    kind: 'generated',
    ext: '.odt',
    fileName: 'generated-smoke.odt',
    expectDocumentReady: true,
  },
  {
    name: 'open-ods',
    kind: 'generated',
    ext: '.ods',
    fileName: 'generated-smoke.ods',
    expectDocumentReady: true,
  },
  {
    name: 'open-odp',
    kind: 'generated',
    ext: '.odp',
    fileName: 'generated-smoke.odp',
    expectDocumentReady: true,
  },
  // ── Phase 1: Text formats ─────────────────────────────────
  {
    name: 'open-rtf',
    kind: 'generated',
    ext: '.rtf',
    fileName: 'generated-smoke.rtf',
    expectDocumentReady: true,
  },
  {
    name: 'open-txt',
    kind: 'generated',
    ext: '.txt',
    fileName: 'generated-smoke.txt',
    expectDocumentReady: true,
  },
  {
    name: 'open-html',
    kind: 'generated',
    ext: '.html',
    fileName: 'generated-smoke.html',
    expectDocumentReady: true,
  },
  // ── Phase 1 continued: Binary formats (OLE2) ───────────────
  {
    name: 'open-doc',
    kind: 'generated',
    ext: '.doc',
    fileName: 'generated-smoke.doc',
    expectDocumentReady: true,
  },
  {
    name: 'open-xls',
    kind: 'generated',
    ext: '.xls',
    fileName: 'generated-smoke.xls',
    expectDocumentReady: true,
  },
  {
    name: 'open-ppt',
    kind: 'generated',
    ext: '.ppt',
    fileName: 'generated-smoke.ppt',
    expectDocumentReady: true,
  },
];

export function parseArgs(argv) {
  const args = {
    appUrl: process.env.APP_URL || '',
    chrome: process.env.CHROME_BIN || DEFAULT_CHROME,
    timeoutMs: Number(process.env.SMOKE_TIMEOUT_MS || DEFAULT_TIMEOUT),
    scenarios: DEFAULT_SCENARIOS,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--app-url') {
      args.appUrl = argv[++index];
    } else if (arg === '--chrome') {
      args.chrome = argv[++index];
    } else if (arg === '--timeout-ms') {
      args.timeoutMs = Number(argv[++index]);
    } else if (arg === '--scenario') {
      const names = argv[++index].split(',').map((name) => name.trim()).filter(Boolean);
      args.scenarios = DEFAULT_SCENARIOS.filter((scenario) => names.includes(scenario.name));
      if (args.scenarios.length === 0) throw new Error(`No scenarios matched: ${names.join(', ')}`);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs <= 0) {
    throw new Error('--timeout-ms must be a positive number');
  }
  return args;
}
