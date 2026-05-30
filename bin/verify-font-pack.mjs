#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.argv[2] || '.');

function parseArgs(argv) {
  const result = { root: ROOT };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--root') { result.root = resolve(argv[++i]); continue; }
    throw new Error(`Unknown argument: ${argv[i]}`);
  }
  return result;
}

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function main() {
  const args = parseArgs(process.argv);
  const root = args.root;
  const failures = [];
  const fontDir = join(root, 'public/fonts');
  const manifestPath = join(root, 'fonts/manifest.json');
  const lockPath = join(root, 'fonts/hash-lock.json');
  const allFontsPath = join(root, 'public/sdkjs/common/AllFonts.js');

  // 1. Check manifest exists and is valid JSON
  if (!existsSync(manifestPath)) {
    failures.push('fonts/manifest.json: missing');
  } else {
    let manifest;
    try { manifest = JSON.parse(readFileSync(manifestPath, 'utf8')); } catch (e) {
      failures.push(`fonts/manifest.json: invalid JSON — ${e.message}`);
      manifest = null;
    }
    if (manifest) {
      // 2. Check all manifest fonts exist on disk
      for (const font of manifest.fonts || []) {
        const fontFile = join(fontDir, font.file);
        if (!existsSync(fontFile)) {
          failures.push(`fonts/manifest.json: ${font.file} declared but file missing`);
        }
      }
      console.log(`manifest.json: ${manifest.fonts?.length || 0} fonts declared`);
    }
  }

  // 3. Check hash-lock exists
  if (!existsSync(lockPath)) {
    failures.push('fonts/hash-lock.json: missing');
  } else {
    let lock;
    try { lock = JSON.parse(readFileSync(lockPath, 'utf8')); } catch (e) {
      failures.push(`fonts/hash-lock.json: invalid JSON — ${e.message}`);
      lock = null;
    }
    if (lock && lock.files) {
      // 4. Verify each font hash
      let match = 0, mismatch = 0;
      for (const [name, expectedHash] of Object.entries(lock.files)) {
        if (name === 'AllFonts.js') continue;
        if (!expectedHash) continue;
        const fontFile = join(fontDir, name);
        if (!existsSync(fontFile)) {
          failures.push(`fonts/hash-lock.json: ${name} locked but file missing`);
          continue;
        }
        const actualHash = sha256(fontFile);
        if (actualHash === expectedHash) {
          match++;
        } else {
          mismatch++;
          failures.push(`fonts/hash-lock.json: ${name} hash mismatch\n  expected: ${expectedHash}\n  actual:   ${actualHash}`);
        }
      }
      console.log(`hash-lock.json: ${match} match, ${mismatch} mismatch`);
    }
  }

  // 5. Check AllFonts.js exists and references fonts that exist
  if (!existsSync(allFontsPath)) {
    failures.push('public/sdkjs/common/AllFonts.js: missing');
  } else {
    const allFontsContent = readFileSync(allFontsPath, 'utf8');
    // Extract font filenames from __fonts_files array
    const fontMatch = allFontsContent.match(/__fonts_files\s*=\s*\[([\s\S]*?)\]/);
    if (fontMatch) {
      const fontNames = fontMatch[1]
        .split(',')
        .map(s => s.trim().replace(/['"]/g, ''))
        .filter(Boolean);
      let found = 0, missing = 0;
      for (const name of fontNames) {
        if (existsSync(join(fontDir, name))) {
          found++;
        } else {
          missing++;
          failures.push(`AllFonts.js: references "${name}" but file not in public/fonts/`);
        }
      }
      console.log(`AllFonts.js: ${found} fonts found, ${missing} missing`);
    } else {
      failures.push('AllFonts.js: could not parse __fonts_files array');
    }
  }

  // Result
  if (failures.length > 0) {
    console.error('Font pack verification FAILED:');
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log('Font pack verification PASSED');
}

main();
