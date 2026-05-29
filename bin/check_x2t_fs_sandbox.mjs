import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REJECTED_CONSTRUCTS = [
  // Path traversal and unsafe path semantics (exclude XML namespace URLs)
  { pattern: /['"]\.\.[\\/]/g, label: 'path traversal "../" in string literal' },
  { pattern: /[^w]file:\/\//gi, label: 'file:// protocol in string literal (non-w3c)' },
  { pattern: /['"][a-zA-Z]:[/\\]/g, label: 'Windows drive prefix in string literal' },
];

const REQUIRED_CONSTRUCTS = [
  // sanitizeFileName must reject path-semantic inputs
  { needle: 'path traversal', label: 'sanitizeFileName must reject path traversal' },
  { needle: 'absolute path', label: 'sanitizeFileName must reject absolute paths' },
  { needle: 'Windows drive prefix', label: 'sanitizeFileName must reject Windows drive prefixes' },
  { needle: 'protocol prefix', label: 'sanitizeFileName must reject protocol prefixes' },
  { needle: 'NUL byte', label: 'sanitizeFileName must reject NUL bytes' },
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
  const converter = readText(root, 'lib/document-converter.ts');
  const failures = [];

  if (!converter) {
    failures.push('lib/document-converter.ts: missing');
    console.error('ONLYOFFICE x2t FS sandbox check failed');
    for (const f of failures) console.error(`- ${f}`);
    process.exit(1);
  }

  // 1. No unsafe path constructs in converter
  for (const { pattern, label } of REJECTED_CONSTRUCTS) {
    if (pattern.test(converter)) {
      failures.push(`lib/document-converter.ts: contains ${label}`);
    }
  }

  // 2. sanitizeFileName must have rejection rules
  for (const { needle, label } of REQUIRED_CONSTRUCTS) {
    if (!converter.includes(needle)) {
      failures.push(`lib/document-converter.ts: ${label}`);
    }
  }

  // 3. FS paths must be under /working/
  const fsWrites = converter.match(/FS\.writeFile\(['"]([^'"]+)['"]/g) || [];
  for (const writeCall of fsWrites) {
    const pathMatch = writeCall.match(/FS\.writeFile\(['"]([^'"]+)['"]/);
    if (pathMatch && !pathMatch[1].startsWith('/working/')) {
      failures.push(`lib/document-converter.ts: FS.writeFile path outside /working/: ${pathMatch[1]}`);
    }
  }

  // 4. params.xml must be fixed path
  if (!converter.includes("'/working/params.xml'") && !converter.includes('"/working/params.xml"')) {
    failures.push('lib/document-converter.ts: params.xml path must be fixed as /working/params.xml');
  }

  // 5. User-derived paths must go through sanitizeFileName
  const userDerivedPaths = converter.match(/\/working\/\$\{[^}]*fileName[^}]*\}/g) || [];
  const sanitizeCalls = converter.match(/sanitizeFileName\(/g) || [];
  if (userDerivedPaths.length > 0 && sanitizeCalls.length < 2) {
    failures.push('lib/document-converter.ts: user-derived fileName paths must be wrapped in sanitizeFileName');
  }

  if (failures.length > 0) {
    console.error('ONLYOFFICE x2t FS sandbox check failed');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(`ONLYOFFICE x2t FS sandbox check passed for ${root}`);
}

main();
