#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { brotliCompressSync } from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const fontsDir = path.join(publicDir, 'fonts');
const allFontsPath = path.join(publicDir, 'sdkjs/common/AllFonts.js');

const keepFonts = [
  'Comic Neue',
  'DejaVu Sans',
  'DejaVu Sans Mono',
  'Liberation Sans',
  'Noto Sans JP',
  'Noto Sans KR',
  'Noto Sans SC',
  'Noto Sans TC',
  'Noto Serif JP',
  'Noto Serif KR',
  'Noto Serif SC',
  'Noto Serif TC',
];

const args = [
  'exec',
  'onlyoffice-browser-generate-font-assets',
  '--input',
  fontsDir,
  '--output',
  publicDir,
  '--font-set',
  'zh-core',
];

for (const fontFamily of keepFonts) {
  args.push('--keep-font', fontFamily);
}

const result = spawnSync('pnpm', args, {
  cwd: root,
  stdio: 'inherit',
});

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  process.exitCode = result.status ?? 1;
} else {
  fs.writeFileSync(`${allFontsPath}.br`, brotliCompressSync(fs.readFileSync(allFontsPath)));
}
