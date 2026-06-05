import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const X2T_FILES = [
  'public/wasm/x2t/x2t.js',
  'public/wasm/x2t/x2t.wasm',
  'public/wasm/x2t/x2t.wasm.br',
  'public/wasm/x2t/x2t.wasm.gz',
];

const STALE_STATUS_NEEDLES = [
  'Still active',
  'not applied',
  'Old artifact active',
  'CryptPad 9.3 artifact staged',
  'Remaining target: x2t WASM',
  'Format ID coverage is complete',
  'WASM FS paths are fully sandboxed',
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
  return existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';
}

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function checkArtifactFacts(root, notes, failures) {
  for (const relativePath of X2T_FILES) {
    const filePath = join(root, relativePath);
    if (!existsSync(filePath)) {
      failures.push(`${relativePath}: missing`);
      continue;
    }
    const size = String(statSync(filePath).size);
    const hash = sha256(filePath);
    if (!notes.includes(size)) failures.push(`docs/onlyoffice-9.3-upgrade-notes.md: missing current size ${size} for ${relativePath}`);
    if (!notes.includes(hash)) failures.push(`docs/onlyoffice-9.3-upgrade-notes.md: missing current sha256 ${hash} for ${relativePath}`);
  }
}

function checkNoStaleStatus(docs, failures) {
  for (const [relativePath, text] of Object.entries(docs)) {
    for (const needle of STALE_STATUS_NEEDLES) {
      if (text.includes(needle)) failures.push(`${relativePath}: stale 9.3 status text remains: ${needle}`);
    }
  }
}

function checkX2tLoader(root, failures) {
  const js = readText(root, 'public/wasm/x2t/x2t.js');
  for (const needle of ['main1', 'ccall', 'FS', 'Module.locateFile']) {
    if (!js.includes(needle)) failures.push(`public/wasm/x2t/x2t.js: missing ${needle}`);
  }
  // The Emscripten boilerplate uses document.currentScript?.src for Node detection
  // (safe, behind optional chain). Only reject the CryptPad pre-js.js pattern that
  // caused URL construction failure.
  if (js.includes('document.currentScript.getAttribute')) {
    failures.push('public/wasm/x2t/x2t.js: must not use document.currentScript.getAttribute for URL construction');
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = resolve(args.root);
  const failures = [];
  const docs = {
    'docs/onlyoffice-9.3-progress.md': readText(root, 'docs/onlyoffice-9.3-progress.md'),
    'docs/onlyoffice-9.3-upgrade-notes.md': readText(root, 'docs/onlyoffice-9.3-upgrade-notes.md'),
    'docs/onlyoffice-9.3-impact-boundary.md': readText(root, 'docs/onlyoffice-9.3-impact-boundary.md'),
  };

  checkArtifactFacts(root, docs['docs/onlyoffice-9.3-upgrade-notes.md'], failures);
  checkNoStaleStatus(docs, failures);
  checkX2tLoader(root, failures);

  if (failures.length > 0) {
    console.error('ONLYOFFICE 9.3 docs/artifact consistency check failed');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(`ONLYOFFICE 9.3 docs/artifact consistency check passed for ${root}`);
}

main();
