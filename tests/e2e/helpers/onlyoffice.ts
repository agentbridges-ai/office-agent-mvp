import { inflateRawSync } from 'node:zlib';
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
window.showSaveFilePicker = undefined;
(function() {
  // Trap URL.createObjectURL to capture blobs before the anchor.click→revoke race
  const _blobs = new Map();
  const _origCreateObjectURL = URL.createObjectURL.bind(URL);
  URL.createObjectURL = function(blob) {
    const url = _origCreateObjectURL(blob);
    _blobs.set(url, blob);
    return url;
  };
  // Neutralize URL.revokeObjectURL so blobs stay alive for capture
  URL.revokeObjectURL = function(url) {
    // Keep blob alive for 5s, then clean up
    setTimeout(() => { _blobs.delete(url); _origRevoke(url); }, 5000);
  };
  const _origRevoke = URL.revokeObjectURL.bind(URL);

  const _origClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function() {
    const href = this.href || '';
    const download = this.getAttribute('download');
    if (download && href.startsWith('blob:')) {
      const blob = _blobs.get(href);
      if (blob) {
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
      } else {
        window.__ooDownloads.push({
          filename: download,
          error: 'blob not found in URL.createObjectURL trap',
          timestamp: Date.now(),
        });
      }
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

  // Wait for editor API to be available in the iframe.
  // All editor types expose Asc.editor with asc_Save. Word additionally has
  // asc_AddText; cell/slide have it too but we check the common asc_Save.
  // Note: frame.Api (capital A) is NOT reliably available for cell/slide
  // in all load scenarios — use Asc.editor as the common denominator.
  if (editorType === 'word') {
    await page.waitForFunction(
      () => {
        try {
          const frame = (document.querySelector('iframe[name="frameEditor"]') as HTMLIFrameElement)?.contentWindow;
          const api = (frame as any)?.Asc?.editor || (frame as any)?.editor;
          return api && typeof api.asc_AddText === 'function';
        } catch { return false; }
      },
      {},
      { timeout },
    );
  } else {
    // cell or slide: check asc_Save as the common readiness signal
    await page.waitForFunction(
      () => {
        try {
          const frame = (document.querySelector('iframe[name="frameEditor"]') as HTMLIFrameElement)?.contentWindow;
          const api = (frame as any)?.Asc?.editor || (frame as any)?.editor;
          return api && typeof api.asc_Save === 'function';
        } catch { return false; }
      },
      {},
      { timeout },
    );
  }
}

// ── DOCX content verification ────────────────────────────────────

/**
 * Minimal ZIP reader: extract a single file from a ZIP buffer.
 * Used to verify DOCX content (word/document.xml) in E2E tests.
 */
export function extractFileFromZip(zipBuffer: Buffer, targetPath: string): Buffer | null {
  // Find EOCD signature (0x06054b50)
  let eocdOffset = zipBuffer.length - 22;
  while (eocdOffset >= 0) {
    if (zipBuffer.readUInt32LE(eocdOffset) === 0x06054b50) break;
    eocdOffset--;
  }
  if (eocdOffset < 0) return null;

  const cdOffset = zipBuffer.readUInt32LE(eocdOffset + 16);
  const cdSize = zipBuffer.readUInt32LE(eocdOffset + 12);

  // Scan central directory for targetPath
  let pos = cdOffset;
  const cdEnd = cdOffset + cdSize;
  while (pos < cdEnd) {
    if (zipBuffer.readUInt32LE(pos) !== 0x02014b50) break;

    const compMethod = zipBuffer.readUInt16LE(pos + 10);
    const nameLen = zipBuffer.readUInt16LE(pos + 28);
    const extraLen = zipBuffer.readUInt16LE(pos + 30);
    const commentLen = zipBuffer.readUInt16LE(pos + 32);
    const localHeaderOffset = zipBuffer.readUInt32LE(pos + 42);
    const name = zipBuffer.toString('utf8', pos + 46, pos + 46 + nameLen);

    if (name === targetPath) {
      // Read local file header at localHeaderOffset
      const lhNameLen = zipBuffer.readUInt16LE(localHeaderOffset + 26);
      const lhExtraLen = zipBuffer.readUInt16LE(localHeaderOffset + 28);
      const compSize = zipBuffer.readUInt32LE(localHeaderOffset + 20);
      const dataOffset = localHeaderOffset + 30 + lhNameLen + lhExtraLen;
      const compData = zipBuffer.slice(dataOffset, dataOffset + compSize);

      if (compMethod === 0) return compData; // stored
      if (compMethod === 8) return inflateRawSync(compData); // deflated
      return null;
    }
    pos += 46 + nameLen + extraLen + commentLen;
  }
  return null;
}

export function findZipEntries(zipBuffer: Buffer): string[] {
  let eocdOffset = zipBuffer.length - 22;
  while (eocdOffset >= 0) {
    if (zipBuffer.readUInt32LE(eocdOffset) === 0x06054b50) break;
    eocdOffset -= 1;
  }
  if (eocdOffset < 0) return [];

  const cdOffset = zipBuffer.readUInt32LE(eocdOffset + 16);
  const cdSize = zipBuffer.readUInt32LE(eocdOffset + 12);
  const entries: string[] = [];
  let pos = cdOffset;
  const cdEnd = cdOffset + cdSize;
  while (pos < cdEnd && zipBuffer.readUInt32LE(pos) === 0x02014b50) {
    const nameLen = zipBuffer.readUInt16LE(pos + 28);
    const extraLen = zipBuffer.readUInt16LE(pos + 30);
    const commentLen = zipBuffer.readUInt16LE(pos + 32);
    entries.push(zipBuffer.toString('utf8', pos + 46, pos + 46 + nameLen));
    pos += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
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
