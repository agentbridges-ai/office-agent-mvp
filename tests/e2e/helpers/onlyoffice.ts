import type { Page, ConsoleMessage, Request } from '@playwright/test';

// ── Download capture hook (injected via addInitScript) ────────────

/**
 * Script to inject before page load. Patches HTMLAnchorElement.prototype.click
 * to capture blob-URL downloads into window.__ooDownloads.
 *
 * Playwright's page.on('download') cannot intercept downloads triggered by
 * URL.createObjectURL + anchor.click(), which is the save bridge's download path
 * when showSaveFilePicker is unavailable (e.g. headless Chromium).
 */
export const DOWNLOAD_CAPTURE_SCRIPT = `
window.__ooDownloads = [];
(function() {
  const _origClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function() {
    const href = this.href || '';
    const download = this.getAttribute('download');
    if (download && href.startsWith('blob:')) {
      const anchor = this;
      // Defer to allow the blob URL to be resolved
      setTimeout(async () => {
        try {
          const response = await fetch(href);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onload = function() {
            window.__ooDownloads.push({
              filename: download,
              data: Array.from(new Uint8Array(reader.result)),
              size: blob.size,
              mimeType: blob.type || 'application/octet-stream',
              timestamp: Date.now(),
            });
          };
          reader.readAsArrayBuffer(blob);
        } catch (e) {
          window.__ooDownloads.push({
            filename: download,
            error: e.message,
            timestamp: Date.now(),
          });
        }
      }, 0);
    }
    return _origClick.apply(this, arguments);
  };
})();
`;

// ── Evidence types ─────────────────────────────────────────────────

export interface Evidence {
  downloadCount: number;
  downloads: Array<{ filename: string; size: number }>;
  consoleErrors: string[];
  failedRequests: string[];
  pageErrors: string[];
}

export function createEvidence(): Evidence {
  return {
    downloadCount: 0,
    downloads: [],
    consoleErrors: [],
    failedRequests: [],
    pageErrors: [],
  };
}

// ── Recording helpers ──────────────────────────────────────────────

export function recordConsoleAndPageErrors(page: Page, evidence: Evidence): void {
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      evidence.consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', (err: Error) => {
    evidence.pageErrors.push(err.message);
  });
}

export function recordRequestFailures(page: Page, evidence: Evidence): void {
  page.on('requestfailed', (req: Request) => {
    evidence.failedRequests.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText || 'unknown'}`);
  });
}

export function writeEvidence(evidence: Evidence): void {
  Object.assign(evidence, {
    downloadCount: evidence.downloads.length,
  });
}

// ── ONLYOFFICE-specific wait helpers ───────────────────────────────

export async function waitForOnlyOfficeShell(page: Page, timeout = 120_000): Promise<void> {
  await page.waitForFunction(() => typeof (window as any).onCreateNew === 'function', {}, { timeout });
}

export async function waitForEditorReady(
  page: Page,
  editorType: 'word' | 'cell' | 'slide' = 'word',
  timeout = 120_000,
): Promise<void> {
  // Wait for iframe
  await page.waitForSelector('iframe[name="frameEditor"]', { timeout: 60_000 });

  // Wait for editor API to be available in the iframe
  const apiMethod = editorType === 'cell' ? 'GetActiveSheet' :
    editorType === 'slide' ? 'GetPresentation' : 'asc_AddText';

  await page.waitForFunction(
    ({ apiMethod }) => {
      try {
        const frame = (document.querySelector('iframe[name="frameEditor"]') as HTMLIFrameElement)?.contentWindow;
        const api = (frame as any)?.Asc?.editor || (frame as any)?.editor;
        return api && typeof api[apiMethod] === 'function';
      } catch { return false; }
    },
    { apiMethod },
    { timeout },
  );
}

export async function getEditorFrameWindow(page: Page): Promise<any> {
  return page.evaluate(() => {
    const frame = (document.querySelector('iframe[name="frameEditor"]') as HTMLIFrameElement)?.contentWindow;
    return {
      hasAsc: !!(frame as any)?.Asc,
      hasEditor: !!(frame as any)?.editor,
      hasApi: !!(frame as any)?.Api,
    };
  });
}
