import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const API_FILE = 'lib/x2t-api.ts';

const REQUIRED_EXPORTS = [
  'export async function initX2T',
  'export async function convertLocal',
  'X2TInitOptions',
  'X2TConvertOptions',
  'X2TConvertResult',
];

const API_GUARANTEES = [
  { needle: 'sanitizeX2TFileName', label: 'must sanitize file names via x2t-paths' },
  { needle: '/working/input', label: 'must use controlled input path under /working/input' },
  { needle: '/working/output', label: 'must use controlled output path under /working/output' },
  { needle: 'escapeXml', label: 'must escape XML special chars in params' },
  { needle: 'm_sFileFrom', label: 'must construct XML with m_sFileFrom' },
  { needle: 'm_sFileTo', label: 'must construct XML with m_sFileTo' },
];

const BOUNDARY_FILES = [
  'lib/document.ts',
  'lib/onlyoffice-editor.ts',
  'lib/converter.ts',
];

function parseArgs(argv) {
  const result = { root: process.cwd() };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') { result.root = argv[index + 1]; index += 1; continue; }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return result;
}

function readText(root, relativePath) {
  const filePath = join(root, relativePath);
  return existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = resolve(args.root);
  const api = readText(root, API_FILE);
  const failures = [];

  if (!api) {
    failures.push(`${API_FILE}: missing`);
    console.error('ONLYOFFICE x2t API boundary check failed');
    for (const f of failures) console.error(`- ${f}`);
    process.exit(1);
  }

  for (const needle of REQUIRED_EXPORTS) {
    if (!api.includes(needle)) {
      failures.push(`${API_FILE}: missing required export ${needle}`);
    }
  }

  for (const { needle, label } of API_GUARANTEES) {
    if (!api.includes(needle)) {
      failures.push(`${API_FILE}: ${label}`);
    }
  }

  // Boundary files must not use raw FS/ccall — they should go through x2t-api or document-converter
  for (const relativePath of BOUNDARY_FILES) {
    const source = readText(root, relativePath);
    if (!source) continue;
    if (source.includes("FS.writeFile") || source.includes("FS.readFile")) {
      failures.push(`${relativePath}: raw FS access — must use x2t-api.ts or document-converter.ts`);
    }
    if (source.includes("ccall('main1'") || source.includes('ccall("main1"')) {
      failures.push(`${relativePath}: raw ccall main1 — must use x2t-api.ts or document-converter.ts`);
    }
  }

  if (failures.length > 0) {
    console.error('ONLYOFFICE x2t API boundary check failed');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(`ONLYOFFICE x2t API boundary check passed for ${root}`);
}

main();
