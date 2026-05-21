import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REQUIRED_ADAPTER_FILES = [
  'lib/onlyoffice-compat/binary.ts',
  'lib/onlyoffice-compat/runtime.ts',
  'lib/onlyoffice-compat/local-binary.ts',
  'lib/onlyoffice-compat/save.ts',
  'lib/onlyoffice-compat/media.ts',
  'lib/onlyoffice-compat/pdf.ts',
  'lib/onlyoffice-compat/fonts.ts',
];

const UNCLAIMED_VENDOR_PATHS = [
  'public/sdkjs/pdf',
  'public/sdkjs/visio',
  'public/web-apps/apps/pdfeditor',
  'public/web-apps/apps/visioeditor',
  'public/web-apps/vendor/monaco',
];

function parseArgs(argv) {
  const result = { root: process.cwd() };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') {
      result.root = argv[index + 1];
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return result;
}

function readText(root, relativePath) {
  const filePath = join(root, relativePath);
  if (!existsSync(filePath)) return '';
  return readFileSync(filePath, 'utf8');
}

function requireNeedle(source, needle, label, failures) {
  if (!source.includes(needle)) failures.push(label);
}

function rejectNeedle(source, needle, label, failures) {
  if (source.includes(needle)) failures.push(label);
}

function checkAdapterFiles(root, failures) {
  for (const relativePath of REQUIRED_ADAPTER_FILES) {
    if (!existsSync(join(root, relativePath))) {
      failures.push(`${relativePath}: missing first-party ONLYOFFICE compatibility adapter`);
    }
  }
}

function checkEditorBoundary(root, failures) {
  const editor = readText(root, 'lib/onlyoffice-editor.ts');
  requireNeedle(
    editor,
    './onlyoffice-compat/',
    'lib/onlyoffice-editor.ts: compatibility behavior must be delegated to lib/onlyoffice-compat/**',
    failures,
  );
  rejectNeedle(
    editor,
    "command: 'asc_openDocument'",
    'lib/onlyoffice-editor.ts: 9.3 binary open must not use legacy asc_openDocument JSON command',
    failures,
  );
  rejectNeedle(
    editor,
    'new Blob([imageData as unknown as BlobPart]',
    'lib/onlyoffice-editor.ts: media object URL handling must live in lib/onlyoffice-compat/media.ts',
    failures,
  );
  rejectNeedle(
    editor,
    'await convertBinToDocumentAndDownloadFn(',
    'lib/onlyoffice-editor.ts: save/download conversion must live in lib/onlyoffice-compat/save.ts',
    failures,
  );
}

function checkRuntimeVersion(root, failures) {
  const api = readText(root, 'public/web-apps/apps/api/documents/api.js');
  requireNeedle(
    api,
    "return '9.3.1'",
    'public/web-apps/apps/api/documents/api.js: DocsAPI version must be generated as 9.3.1',
    failures,
  );

  for (const editor of ['documenteditor', 'spreadsheeteditor', 'presentationeditor']) {
    const source = readText(root, `public/web-apps/apps/${editor}/main/app.js`);
    requireNeedle(
      source,
      'Version: 9.3.1 (build:10)',
      `public/web-apps/apps/${editor}/main/app.js: editor runtime must be 9.3.1 build 10`,
      failures,
    );
  }

  for (const app of ['word', 'cell', 'slide']) {
    const source = readText(root, `public/sdkjs/${app}/sdk-all.js`);
    requireNeedle(
      source,
      'Version: 9.3.1 (build:10)',
      `public/sdkjs/${app}/sdk-all.js: sdkjs runtime must be 9.3.1 build 10`,
      failures,
    );
  }
}

function checkVendorMinimization(root, failures) {
  const notes = readText(root, 'docs/onlyoffice-9.3-upgrade-notes.md');
  for (const relativePath of UNCLAIMED_VENDOR_PATHS) {
    const documented = notes.includes(`${relativePath}: loaded`);
    if (existsSync(join(root, relativePath)) && !documented) {
      failures.push(`${relativePath}: unclaimed vendor subtree must not be present without browser load evidence`);
    }
  }
}

function checkX2tHonesty(root, failures) {
  const notes = readText(root, 'docs/onlyoffice-9.3-upgrade-notes.md');
  if (!notes.includes('existing browser x2t') || !notes.includes('CONTROLLED RISK')) {
    failures.push('docs/onlyoffice-9.3-upgrade-notes.md: must state existing browser x2t is a CONTROLLED RISK');
  }
}

function checkPdfGuard(root, failures) {
  const pdf = readText(root, 'lib/onlyoffice-compat/pdf.ts');
  requireNeedle(pdf, '%PDF', 'lib/onlyoffice-compat/pdf.ts: must validate PDF header', failures);
  requireNeedle(pdf, '0 pages', 'lib/onlyoffice-compat/pdf.ts: must reject zero-page PDF output', failures);
  requireNeedle(
    pdf,
    'server-side conversion',
    'lib/onlyoffice-compat/pdf.ts: PDF failure must explain server-side conversion requirement',
    failures,
  );
}

function checkDownloadAs(root, failures) {
  const save = readText(root, 'lib/onlyoffice-compat/save.ts');
  requireNeedle(save, 'asc_onSaveCallback', 'lib/onlyoffice-compat/save.ts: must notify editor save completion', failures);
  requireNeedle(save, 'sync_EndAction', 'lib/onlyoffice-compat/save.ts: must end download overlay through SDK action', failures);

  for (const relativePath of [
    'lib/onlyoffice-editor.ts',
    'lib/onlyoffice-compat/save.ts',
    'public/web-apps/apps/documenteditor/main/app.js',
    'public/web-apps/apps/spreadsheeteditor/main/app.js',
    'public/web-apps/apps/presentationeditor/main/app.js',
  ]) {
    const source = readText(root, relativePath);
    if (source.includes('/downloadas/')) {
      failures.push(`${relativePath}: /downloadas must not be a successful browser-local save path`);
    }
  }
}

function checkBrowserFonts(root, failures) {
  const allFonts = readText(root, 'public/sdkjs/common/AllFonts.js');
  for (const needle of ['C:\\\\Windows\\\\Fonts', 'core-fonts', '/fonts//fonts']) {
    rejectNeedle(allFonts, needle, `public/sdkjs/common/AllFonts.js: forbidden font path ${needle}`, failures);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = resolve(args.root);
  const failures = [];

  checkAdapterFiles(root, failures);
  checkEditorBoundary(root, failures);
  checkRuntimeVersion(root, failures);
  checkVendorMinimization(root, failures);
  checkX2tHonesty(root, failures);
  checkPdfGuard(root, failures);
  checkDownloadAs(root, failures);
  checkBrowserFonts(root, failures);

  if (failures.length > 0) {
    console.error('ONLYOFFICE 9.3 GCD risk check failed');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(`ONLYOFFICE 9.3 GCD risk check passed for ${root}`);
}

main();
