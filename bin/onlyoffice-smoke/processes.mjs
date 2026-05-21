import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { waitFor } from './utils.mjs';

export function startViteAppServer() {
  const port = 20_000 + Math.floor(Math.random() * 20_000);
  const child = spawn('pnpm', ['exec', 'vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
  let output = '';
  const append = (chunk) => {
    output += chunk.toString();
  };
  child.stdout.on('data', append);
  child.stderr.on('data', append);

  const ready = waitFor(
    () => {
      if (output.includes(`http://127.0.0.1:${port}/`) || output.includes(`http://localhost:${port}/`)) {
        return `http://127.0.0.1:${port}/`;
      }
      if (child.exitCode !== null) {
        throw new Error(`Vite exited before readiness: ${output}`);
      }
      return '';
    },
    { timeoutMs: 30_000, message: 'Timed out waiting for Vite dynamic port' },
  );
  return { child, ready, output: () => output };
}

export function startChrome(chromePath) {
  if (!existsSync(chromePath)) {
    throw new Error(`Chromium binary not found: ${chromePath}`);
  }

  const userDataDir = mkdtempSync(join(tmpdir(), 'onlyoffice-9-3-smoke-'));
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ];
  const child = spawn(chromePath, args, { stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  return { child, userDataDir, stderr: () => stderr };
}
