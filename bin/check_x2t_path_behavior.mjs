import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import ts from 'typescript';

const VALID_CASES = [
  ['report.docx', 'report.docx'],
  ['  spaced name.xlsx  ', 'spaced name.xlsx'],
  ['unsafe&quote".pptx', 'unsafequote.pptx'],
  ['', 'file.bin'],
];

const REJECTED_CASES = [
  '../escape.docx',
  'a/../escape.docx',
  '/etc/passwd',
  '\\windows\\path.docx',
  'C:\\Windows\\Fonts\\arial.ttf',
  'file:///tmp/a.docx',
  'https://example.test/a.docx',
  'data://payload',
  'nul\u0000byte.docx',
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

async function importTypeScriptModule(root, relativePath) {
  const sourcePath = join(root, relativePath);
  if (!existsSync(sourcePath)) throw new Error(`${relativePath}: missing`);

  const transpiled = ts.transpileModule(readFileSync(sourcePath, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const workDir = mkdtempSync(join(tmpdir(), 'x2t-path-gate-'));
  const modulePath = join(workDir, 'module.mjs');
  writeFileSync(modulePath, transpiled.outputText);
  try {
    return await import(`file://${modulePath}?t=${Date.now()}`);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected "${expected}", got "${actual}"`);
}

function assertRejects(fn, label) {
  try {
    fn();
  } catch {
    return;
  }
  throw new Error(`${label}: expected rejection`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = resolve(args.root);
  const module = await importTypeScriptModule(root, 'lib/x2t-paths.ts');

  if (typeof module.sanitizeX2TFileName !== 'function') {
    throw new Error('lib/x2t-paths.ts: sanitizeX2TFileName must be exported');
  }

  for (const [input, expected] of VALID_CASES) {
    assertEqual(module.sanitizeX2TFileName(input), expected, `sanitizeX2TFileName(${JSON.stringify(input)})`);
  }

  for (const input of REJECTED_CASES) {
    assertRejects(() => module.sanitizeX2TFileName(input), `sanitizeX2TFileName(${JSON.stringify(input)})`);
  }

  console.log(`ONLYOFFICE x2t path behavior check passed for ${root}`);
}

main().catch((error) => {
  console.error('ONLYOFFICE x2t path behavior check failed');
  console.error(`- ${error.message}`);
  process.exit(1);
});
