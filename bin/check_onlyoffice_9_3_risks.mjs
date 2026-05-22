import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REQUIRED_ADAPTER_FILES = [
  'lib/onlyoffice-compat/binary.ts',
  'lib/onlyoffice-compat/runtime.ts',
  'lib/onlyoffice-compat/local-binary.ts',
  'lib/onlyoffice-compat/save.ts',
  'lib/onlyoffice-compat/media.ts',
  'lib/onlyoffice-compat/pdf.ts',
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

function checkLocalRuntimeShimContract(root, failures) {
  const notes = readText(root, 'docs/onlyoffice-9.3-upgrade-notes.md');
  const save = readText(root, 'lib/onlyoffice-compat/save.ts');
  const localBinary = readText(root, 'lib/onlyoffice-compat/local-binary.ts');
  const shimCode = `${save}\n${localBinary}`;
  const shimNeedles = ['AscCommon.T7c', 'asyncServerIdEndLoaded', 'n1f', 'Mmg', 'NOf'];

  for (const needle of shimNeedles) {
    if (shimCode.includes(needle) && !notes.includes(needle)) {
      failures.push(`docs/onlyoffice-9.3-upgrade-notes.md: Local Runtime Shim Contract must document ${needle}`);
    }
  }

  if (
    shimCode.includes('asc_getBuildVersion') &&
    (!notes.includes('asc_getBuildVersion/asc_getBuildNumber') || !notes.includes('not a real DocumentServer'))
  ) {
    failures.push('docs/onlyoffice-9.3-upgrade-notes.md: must document fake 9.3.1 permission version as a local shim, not a real DocumentServer');
  }
}

function checkBrowserFonts(root, failures) {
  const allFonts = readText(root, 'public/sdkjs/common/AllFonts.js');
  const fontContract = readText(root, 'lib/onlyoffice-compat/fonts.ts');
  requireNeedle(
    fontContract,
    'ONLYOFFICE_INVALID_FONT_PATH_NEEDLES',
    'lib/onlyoffice-compat/fonts.ts: font boundary must own invalid font path needles used by risk gate',
    failures,
  );
  for (const needle of ['C:\\\\Windows\\\\Fonts', 'core-fonts', '/fonts//fonts']) {
    rejectNeedle(allFonts, needle, `public/sdkjs/common/AllFonts.js: forbidden font path ${needle}`, failures);
  }
}

function checkAdapterCleanupSmells(root, failures) {
  const editor = readText(root, 'lib/onlyoffice-editor.ts');
  if (!editor.includes('getEditorCleanupDelayMs')) {
    failures.push('lib/onlyoffice-editor.ts: editor cleanup timing must be centralized in getEditorCleanupDelayMs');
  }

  for (const relativePath of [
    'lib/onlyoffice-compat/save.ts',
    'lib/onlyoffice-compat/runtime.ts',
    'lib/onlyoffice-compat/local-binary.ts',
  ]) {
    const source = readText(root, relativePath);
    if (source.includes("postMessage(") && source.includes(", '*'")) {
      failures.push(`${relativePath}: adapter postMessage target origin must not default to '*'`);
    }
  }
}

function checkEmptyBins(root, failures) {
  const emptyBins = readText(root, 'lib/empty_bin.ts');
  requireNeedle(emptyBins, 'DOCY;v4;8985;', 'lib/empty_bin.ts: DOCX empty bin must come from trusted 9.3 word empty.js', failures);
  requireNeedle(emptyBins, 'XLSY;v2;5958;', 'lib/empty_bin.ts: XLSX empty bin must come from trusted 9.3 cell empty.js', failures);
  rejectNeedle(emptyBins, 'DOCY;v5;7372;', 'lib/empty_bin.ts: must not keep old DOCX empty bin', failures);
  rejectNeedle(emptyBins, 'XLSY;v2;6160;', 'lib/empty_bin.ts: must not keep old XLSX empty bin', failures);

  const notes = readText(root, 'docs/onlyoffice-9.3-upgrade-notes.md');
  requireNeedle(
    notes,
    'PPTX empty bin is not claimed',
    'docs/onlyoffice-9.3-upgrade-notes.md: must state PPTX empty bin is not claimed',
    failures,
  );
}

function checkUnsupportedPresentationBoundary(root, failures) {
  const documentSource = readText(root, 'lib/document.ts');
  const uiSource = readText(root, 'lib/ui.ts');
  const notes = readText(root, 'docs/onlyoffice-9.3-upgrade-notes.md');

  if (notes.includes('PPTX empty bin is not claimed')) {
    for (const needle of ['.pptx', '.ppt']) {
      if (documentSource.includes(`fileInput.accept =`) && documentSource.includes(needle)) {
        failures.push(`lib/document.ts: ${needle} must not be accepted while PPTX is not claimed`);
      }
    }
    if (uiSource.includes("onCreateNew('.pptx')")) {
      failures.push('lib/ui.ts: new PPTX UI action must not be reachable while PPTX is not claimed');
    }
    if (!documentSource.includes('isUnsupportedPresentationFileName')) {
      failures.push('lib/document.ts: PPT/PPTX open paths must be explicitly blocked before x2t initialization');
    }
  }
}

function checkSmokeHarness(root, failures) {
  const relativePath = 'bin/smoke_onlyoffice_9_3_browser.mjs';
  const moduleDir = 'bin/onlyoffice-smoke';
  const smoke = readText(root, relativePath);
  if (!smoke) {
    failures.push(`${relativePath}: browser smoke harness is missing`);
    return;
  }

  const processes = readText(root, `${moduleDir}/processes.mjs`);
  const samples = readText(root, `${moduleDir}/samples.mjs`);
  const diagnostics = readText(root, `${moduleDir}/diagnostics.mjs`);
  const combined = [smoke, processes, samples, diagnostics].join('\n');

  requireNeedle(samples, 'server.listen(0', `${moduleDir}/samples.mjs: sample server must use a dynamic port`, failures);
  requireNeedle(smoke, 'scenarioDiagnostics', `${relativePath}: output must include per-scenario diagnostics`, failures);
  requireNeedle(samples, 'createGeneratedSamples', `${moduleDir}/samples.mjs: samples must be generated or repo-local`, failures);
  requireNeedle(processes, 'startViteAppServer', `${moduleDir}/processes.mjs: app server must use a dynamic port helper`, failures);
  rejectNeedle(processes, 'Math.random()', `${moduleDir}/processes.mjs: Vite strict port selection must not rely on Math.random()`, failures);
  requireNeedle(processes, 'VITE_PORT_CANDIDATE_COUNT', `${moduleDir}/processes.mjs: Vite strict port startup must have bounded retry candidates`, failures);
  rejectNeedle(combined, '/Users/', `${relativePath}: must not depend on machine-specific /Users paths`, failures);
  rejectNeedle(combined, '/mnt/z/', `${relativePath}: must not depend on machine-specific /mnt/z paths`, failures);
  rejectNeedle(combined, '127.0.0.1:5174', `${relativePath}: must not hard-code Vite port 5174`, failures);
  rejectNeedle(combined, '127.0.0.1:5184', `${relativePath}: must not hard-code Vite port 5184`, failures);
  rejectNeedle(combined, 'new-pptx', `${relativePath}: PPTX is not in the claimed final smoke matrix`, failures);
}

function checkRuntimeRootResources(root, failures) {
  const themes = readText(root, 'public/themes.json');
  requireNeedle(themes, '"themes"', 'public/themes.json: 9.3 editor root theme config must be served', failures);
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
  checkLocalRuntimeShimContract(root, failures);
  checkBrowserFonts(root, failures);
  checkAdapterCleanupSmells(root, failures);
  checkEmptyBins(root, failures);
  checkUnsupportedPresentationBoundary(root, failures);
  checkSmokeHarness(root, failures);
  checkRuntimeRootResources(root, failures);

  if (failures.length > 0) {
    console.error('ONLYOFFICE 9.3 GCD risk check failed');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(`ONLYOFFICE 9.3 GCD risk check passed for ${root}`);
}

main();
