import { DEFAULT_TIMEOUT } from './config.mjs';

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function waitForExit(child, timeoutMs = 5_000) {
  if (!child || child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

export async function terminateChild(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;

  const targetPid = child.pid ? -child.pid : child.pid;
  try {
    process.kill(targetPid, 'SIGTERM');
  } catch {
    child.kill('SIGTERM');
  }

  await waitForExit(child, 3_000);
  if (child.exitCode !== null || child.signalCode !== null) return;

  try {
    process.kill(targetPid, 'SIGKILL');
  } catch {
    child.kill('SIGKILL');
  }
  await waitForExit(child, 3_000);
}

export function closeServer(server) {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}

export async function waitFor(check, options = {}) {
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT;
  const intervalMs = options.intervalMs || 250;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const value = await check();
    if (value) return value;
    await wait(intervalMs);
  }
  throw new Error(options.message || `Timed out after ${timeoutMs}ms`);
}
