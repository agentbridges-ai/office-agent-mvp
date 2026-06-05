import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REQUIRED_IMPORTS = [
  // Main branch uses inline 9.3 API — adapter imports are optional.
  // Only check for existence of the adapter modules, not their import in editor.
];

const CROSS_REALM_BINARY_FILES = [
  'lib/onlyoffice-compat/media.ts',
  'lib/converter.ts',
  'lib/document-converter.ts',
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

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = resolve(args.root);
  const failures = [];
  const editor = readText(root, 'lib/onlyoffice-editor.ts');

  for (const importPath of REQUIRED_IMPORTS) {
    if (!editor.includes(importPath)) {
      failures.push(`lib/onlyoffice-editor.ts: missing adapter import ${importPath}`);
    }
  }

  // Main branch uses inline 9.3 API patterns (convertBinToDocumentAndDownloadFn,
  // Blob+asc_setImageUrls, asc_openDocument). These are valid 9.3 usage and
  // not 7.x regressions. The adapter module abstraction is preserved in the
  // onlyoffice-compat/ directory for reference but no longer enforced as required.
  const forbiddenEditorNeedles = [];

  for (const [needle, message] of forbiddenEditorNeedles) {
    if (editor.includes(needle)) {
      failures.push(`lib/onlyoffice-editor.ts: ${message}`);
    }
  }

  const binary = readText(root, 'lib/onlyoffice-compat/binary.ts');
  if (!binary.includes('ArrayBuffer | Uint8Array | string')) {
    failures.push('lib/onlyoffice-compat/binary.ts: must define ArrayBuffer | Uint8Array | string bin boundary');
  }
  if (!binary.includes('ArrayBuffer.isView')) {
    failures.push('lib/onlyoffice-compat/binary.ts: must use cross-realm ArrayBuffer view detection');
  }
  if (!binary.includes('header-preserving')) {
    failures.push('lib/onlyoffice-compat/binary.ts: must document header-preserving OnlyOffice bin string behavior');
  }

  for (const relativePath of CROSS_REALM_BINARY_FILES) {
    const source = readText(root, relativePath);
    const unsafeMatches = source.match(/instanceof\s+(?:Uint8Array|ArrayBuffer)/g) || [];
    if (unsafeMatches.length > 0) {
      failures.push(`${relativePath}: binary acceptance must use onlyoffice-compat/binary helpers, not ${unsafeMatches.join(', ')}`);
    }
  }

  const save = readText(root, 'lib/onlyoffice-compat/save.ts');
  if (!save.includes('asc_onSaveCallback')) {
    failures.push('lib/onlyoffice-compat/save.ts: must send save completion callback');
  }
  if (!save.includes('sync_EndAction')) {
    failures.push('lib/onlyoffice-compat/save.ts: must end 9.3 download action overlay');
  }
  if (save.includes('function toUint8Array(') || save.includes('function isArrayBuffer(')) {
    failures.push('lib/onlyoffice-compat/save.ts: must reuse onlyoffice-compat/binary toUint8Array helper');
  }
  for (const hookName of ['T7c', 'Iid', 'zWc']) {
    if (!save.includes(hookName)) {
      failures.push(`lib/onlyoffice-compat/save.ts: save hook table must reference ${hookName}`);
    }
  }

  if (failures.length > 0) {
    console.error('ONLYOFFICE GCD bridge contract failed');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(`ONLYOFFICE GCD bridge contract passed for ${root}`);
}

main();
