import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { waitFor } from './utils.mjs';

const VITE_PORT_BASE = 20_000;
const VITE_PORT_RANGE = 20_000;
const VITE_PORT_CANDIDATE_COUNT = 12;

export function startViteAppServer() {
  const ports = createVitePortCandidates();
  let attempt = null;
  const ready = startViteWithRetry(ports, (current) => {
    attempt = current;
  });
  return {
    child: {
      get pid() {
        return attempt?.child.pid;
      },
      get exitCode() {
        return attempt?.child.exitCode ?? null;
      },
      get signalCode() {
        return attempt?.child.signalCode ?? null;
      },
      kill(signal) {
        return attempt?.child.kill(signal);
      },
      once(eventName, listener) {
        return attempt?.child.once(eventName, listener);
      },
    },
    ready,
    output: () => attempt?.output() || '',
  };
}

function createVitePortCandidates() {
  const start = VITE_PORT_BASE + ((process.pid * 37) % (VITE_PORT_RANGE - VITE_PORT_CANDIDATE_COUNT));
  return Array.from({ length: VITE_PORT_CANDIDATE_COUNT }, (_, index) => start + index);
}

async function startViteWithRetry(ports, setAttempt) {
  let lastError = null;
  for (const port of ports) {
    const attempt = spawnViteAttempt(port);
    setAttempt(attempt);
    try {
      return await attempt.ready;
    } catch (error) {
      lastError = error;
      terminateViteAttempt(attempt);
      if (!isPortCollision(error, attempt.output())) break;
    }
  }
  throw new Error(`Vite failed to start on candidate ports ${ports.join(', ')}: ${lastError?.message || 'unknown error'}`);
}

function spawnViteAttempt(port) {
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

function terminateViteAttempt(attempt) {
  if (!attempt?.child || attempt.child.exitCode !== null || attempt.child.signalCode !== null) return;
  try {
    process.kill(-attempt.child.pid, 'SIGTERM');
  } catch {
    attempt.child.kill('SIGTERM');
  }
}

function isPortCollision(error, output) {
  return /EADDRINUSE|Port \d+ is already in use|strictPort/i.test(`${error?.message || ''}\n${output}`);
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
