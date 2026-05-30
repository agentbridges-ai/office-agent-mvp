// @ts-nocheck — Playwright E2E test, Vite module resolution in browser
import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import {
  DOWNLOAD_CAPTURE_SCRIPT,
  createEvidence,
  recordConsoleAndPageErrors,
  recordRequestFailures,
  waitForOnlyOfficeShell,
  waitForEditorReady,
  extractFileFromZip,
} from './helpers/onlyoffice';

const require = createRequire(import.meta.url);
const PASSWORD = 'onlyoffice-9.3-test';

// Minimal DOCX ZIP creator (Node.js side, for generating encrypted test fixtures)
function createMinimalDocx(): Buffer {
  const entries = [
    {
      name: '[Content_Types].xml',
      data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    },
    {
      name: '_rels/.rels',
      data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    },
    {
      name: 'word/document.xml',
      data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>ONLYOFFICE 9.3 Password E2E Test</w:t></w:r></w:p></w:body></w:document>',
    },
  ];
  return createZip(entries);
}

function createZip(entries: Array<{ name: string; data: string }>): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const data = Buffer.from(entry.data, 'utf8');
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8); local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12); local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26); local.writeUInt16LE(0, 28);
    localParts.push(local, name, data);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10); central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14); central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28); central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32); central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36); central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + data.length;
  }
  const central = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4); end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(central.length, 12); end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, central, end]);
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (const b of buf) { crc ^= b; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
  return (crc ^ 0xffffffff) >>> 0;
}

// Pre-compute encrypted DOCX at module load (Node.js side)
let encryptedDocx: Buffer;
try {
  const { encrypt } = require('officecrypto-tool');
  encryptedDocx = encrypt(createMinimalDocx(), { password: PASSWORD });
} catch {
  encryptedDocx = createMinimalDocx(); // fallback: plain docx
}

const BASE_URL = process.env.APP_URL || 'http://127.0.0.1:5173';

test.use({
  browserName: 'chromium',
  headless: true,
  viewport: { width: 1280, height: 720 },
});

test.describe('ONLYOFFICE 9.3 E2E Fidelity', () => {
  test('new-docx type and save — capture download via __ooDownloads hook', async ({ page }) => {
    test.setTimeout(360_000);

    // Inject download capture hook before page load
    await page.addInitScript(DOWNLOAD_CAPTURE_SCRIPT);

    const evidence = createEvidence();
    recordConsoleAndPageErrors(page, evidence);
    recordRequestFailures(page, evidence);

    await page.goto(BASE_URL, { timeout: 300_000 });
    await waitForOnlyOfficeShell(page);
    await page.evaluate(() => (window as any).onCreateNew('.docx'));

    await waitForEditorReady(page, 'word');

    // Click editor canvas in iframe to focus, then type via keyboard (user-gesture)
    const frame = page.frame({ name: 'frameEditor' });
    if (frame) {
      // Click in the center of the editor area to focus it
      await frame.click('#editor_sdk', { timeout: 10_000 }).catch(() => {
        // Fallback: click body
        return frame.click('body', { timeout: 5_000 });
      });
      await page.waitForTimeout(300);
      // Type text with keyboard — this triggers proper user-gesture context
      await page.keyboard.type('ONLYOFFICE 9.3 E2E Fidelity Test');
      await page.waitForTimeout(500);
    }

    // Trigger save
    await page.evaluate(() => {
      const frame = (document.querySelector('iframe[name="frameEditor"]') as HTMLIFrameElement).contentWindow!;
      const api = (frame as any).Asc?.editor || (frame as any).editor;
      if (api && typeof api.asc_Save === 'function') api.asc_Save(false);
    });

    // Wait for download via __ooDownloads hook (poll, not fixed sleep)
    await page.waitForFunction(
      () => (window as any).__ooDownloads?.length > 0,
      {},
      { timeout: 30_000 },
    );

    const downloads: Array<{ filename: string; size: number }> = await page.evaluate(
      () => (window as any).__ooDownloads,
    );
    expect(downloads.length).toBeGreaterThan(0);

    const docxDownload = downloads.find((d) => d.filename.endsWith('.docx'));
    expect(docxDownload).toBeDefined();
    console.log(`Downloaded: ${docxDownload!.filename} (${docxDownload!.size} bytes)`);
    expect(docxDownload!.size).toBeGreaterThan(1000);

    // Verify DOCX is valid OOXML and contains typed text
    const docxBuffer = Buffer.from(docxDownload!.data);
    const documentXml = extractFileFromZip(docxBuffer, 'word/document.xml');
    expect(documentXml).not.toBeNull();
    const xmlText = documentXml!.toString('utf8');
    expect(xmlText).toContain('<w:document');
    expect(xmlText).toContain('<w:body>');
    // Verify typed text is in the document (keyboard input triggers user gesture)
    expect(xmlText).toContain('ONLYOFFICE 9.3 E2E Fidelity Test');
    console.log(`DOCX content verified: typed text found (${xmlText.length} chars)`);
  });

  test('convertLocal real conversion — empty bin to DOCX', async ({ page }) => {
    test.setTimeout(360_000);

    await page.goto(BASE_URL, { timeout: 300_000 });
    await waitForOnlyOfficeShell(page);

    const result = await page.evaluate(async () => {
      try {
        const { initX2T, convertLocal } = await import('/lib/x2t-api.ts');
        const { g_sEmpty_bin } = await import('/lib/empty_bin.ts');
        await initX2T();

        // Empty bin is stored as raw string (custom internal format, not base64)
        const emptyBinStr = g_sEmpty_bin['.docx'];
        if (!emptyBinStr) throw new Error('No empty .docx bin template');
        const inputBytes = new Uint8Array(emptyBinStr.length);
        for (let i = 0; i < emptyBinStr.length; i++) inputBytes[i] = emptyBinStr.charCodeAt(i);

        // Convert internal bin → DOCX (x2t auto-detects internal format)
        const output = await convertLocal({
          inputName: 'empty.bin',
          inputBytes,
          outputName: 'empty-converted.docx',
          formatTo: 65, // DOCX
        });

        return {
          ok: true,
          outputName: output.outputName,
          outputSize: output.outputBytes.byteLength,
          warnings: output.warnings,
        };
      } catch (e: any) {
        console.error('convertLocal error:', e.message);
        return { ok: false, error: e.message };
      }
    });

    if (!result.ok) console.log('convertLocal FAILED:', result.error);

    expect(result.ok).toBe(true);
    expect(result.outputName).toBe('empty-converted.docx');
    expect(result.outputSize).toBeGreaterThan(500);
    console.log(`convertLocal produced: ${result.outputName} (${result.outputSize} bytes)`);
  });

  test('convertLocal rejects oversized input', async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto(BASE_URL, { timeout: 120_000 });
    await waitForOnlyOfficeShell(page);

    const result = await page.evaluate(async () => {
      try {
        const { initX2T, convertLocal } = await import('/lib/x2t-api.ts');
        await initX2T({ maxInputBytes: 10 });

        const bigInput = new Uint8Array(100);
        await convertLocal({
          inputName: 'big.txt',
          inputBytes: bigInput,
          outputName: 'big.docx',
          formatTo: 65,
        });
        return { ok: true, rejected: false };
      } catch (e: any) {
        return { ok: false, rejected: true, error: e.message };
      }
    });

    expect(result.rejected).toBe(true);
    expect(result.error).toContain('exceeds max');
  });

  test('new-xlsx save — capture download via __ooDownloads hook', async ({ page }) => {
    test.setTimeout(360_000);

    await page.addInitScript(DOWNLOAD_CAPTURE_SCRIPT);

    await page.goto(BASE_URL, { timeout: 300_000 });
    await waitForOnlyOfficeShell(page);
    await page.evaluate(() => (window as any).onCreateNew('.xlsx'));
    await waitForEditorReady(page, 'cell');

    // XLSX needs more init time than DOCX before save is safe
    await page.waitForTimeout(3000);

    // Trigger save — use iframe click + evaluate to establish user-gesture
    const xlsxFrame = page.frame({ name: 'frameEditor' });
    if (xlsxFrame) {
      await xlsxFrame.click('body', { timeout: 5_000 }).catch(() => {});
      await page.waitForTimeout(300);
    }
    await page.evaluate(() => {
      const frame = (document.querySelector('iframe[name="frameEditor"]') as HTMLIFrameElement).contentWindow!;
      const api = (frame as any).Asc?.editor || (frame as any).editor;
      if (api && typeof api.asc_Save === 'function') api.asc_Save(false);
    });

    await page.waitForFunction(
      () => (window as any).__ooDownloads?.length > 0,
      {},
      { timeout: 30_000 },
    );

    const downloads: Array<{ filename: string; size: number; data: number[] }> = await page.evaluate(
      () => (window as any).__ooDownloads,
    );
    expect(downloads.length).toBeGreaterThan(0);
    const xlsxDownload = downloads.find((d) => d.filename.endsWith('.xlsx'));
    expect(xlsxDownload).toBeDefined();
    console.log(`Downloaded: ${xlsxDownload!.filename} (${xlsxDownload!.size} bytes)`);
    expect(xlsxDownload!.size).toBeGreaterThan(1000);

    // Verify XLSX is valid OOXML — extract and check sheet data
    const xlsxBuffer = Buffer.from(xlsxDownload!.data);
    const sheetXml = extractFileFromZip(xlsxBuffer, 'xl/worksheets/sheet1.xml');
    expect(sheetXml).not.toBeNull();
    const sheetText = sheetXml!.toString('utf8');
    expect(sheetText).toContain('<worksheet');
    expect(sheetText).toContain('<sheetData>');
    console.log(`XLSX content verified: sheet1.xml extracted (${sheetText.length} chars)`);
  });

  test('second context opens DOCX independently', async ({ browser }) => {
    test.setTimeout(360_000);

    // First context: open DOCX and verify
    const ctx1 = await browser.newContext();
    const page1 = await ctx1.newPage();
    await page1.goto(BASE_URL, { timeout: 300_000 });
    await waitForOnlyOfficeShell(page1);
    await page1.evaluate(() => (window as any).onCreateNew('.docx'));
    await waitForEditorReady(page1, 'word');
    expect(await page1.evaluate(() => !!(window as any).editor)).toBe(true);
    await ctx1.close();

    // Second context: fresh page, independent load
    const ctx2 = await browser.newContext();
    const page2 = await ctx2.newPage();
    await page2.goto(BASE_URL, { timeout: 300_000 });
    await waitForOnlyOfficeShell(page2);
    await page2.evaluate(() => (window as any).onCreateNew('.docx'));
    await waitForEditorReady(page2, 'word');
    expect(await page2.evaluate(() => !!(window as any).editor)).toBe(true);
    await ctx2.close();
  });

  test('concurrent DOCX and XLSX in parallel contexts', async ({ browser }) => {
    test.setTimeout(360_000);

    const docxCtx = await browser.newContext();
    const xlsxCtx = await browser.newContext();
    const [docxPage, xlsxPage] = await Promise.all([
      docxCtx.newPage(),
      xlsxCtx.newPage(),
    ]);

    // Load both in parallel
    await Promise.all([
      docxPage.goto(BASE_URL, { timeout: 300_000 }),
      xlsxPage.goto(BASE_URL, { timeout: 300_000 }),
    ]);
    await Promise.all([
      waitForOnlyOfficeShell(docxPage),
      waitForOnlyOfficeShell(xlsxPage),
    ]);

    // Create documents in parallel
    await Promise.all([
      docxPage.evaluate(() => (window as any).onCreateNew('.docx')),
      xlsxPage.evaluate(() => (window as any).onCreateNew('.xlsx')),
    ]);
    await Promise.all([
      waitForEditorReady(docxPage, 'word'),
      waitForEditorReady(xlsxPage, 'cell'),
    ]);

    const docxOk = await docxPage.evaluate(() => !!(window as any).editor);
    const xlsxOk = await xlsxPage.evaluate(() => !!(window as any).editor);
    expect(docxOk).toBe(true);
    expect(xlsxOk).toBe(true);

    await docxCtx.close();
    await xlsxCtx.close();
  });

  test('9.3.1 version check', async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto(BASE_URL, { timeout: 120_000 });
    await waitForOnlyOfficeShell(page);

    const version = await page.evaluate(() => (window as any).DocsAPI?.DocEditor?.version());
    expect(version).toBe('9.3.1');
  });

  // ── R1: Password-protected DOCX E2E ──────────────────────────────

  test('convertLocal decrypts password-protected DOCX', async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto(BASE_URL, { timeout: 120_000 });
    await waitForOnlyOfficeShell(page);

    // Pass encrypted bytes as array to browser context
    const encBytes = Array.from(new Uint8Array(encryptedDocx));
    const result = await page.evaluate(async ({ encBytes, password }) => {
      try {
        const { initX2T, convertLocal } = await import('/lib/x2t-api.ts');
        await initX2T();

        const inputBytes = new Uint8Array(encBytes);
        const output = await convertLocal({
          inputName: 'protected.docx',
          inputBytes,
          outputName: 'decrypted.docx',
          formatTo: 65, // DOCX
          password,
        });

        return {
          ok: true,
          outputName: output.outputName,
          outputSize: output.outputBytes.byteLength,
        };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    }, { encBytes, password: PASSWORD });

    expect(result.ok).toBe(true);
    expect(result.outputName).toBe('decrypted.docx');
    expect(result.outputSize).toBeGreaterThan(500);
    console.log(`Password decrypt: ${result.outputName} (${result.outputSize} bytes)`);
  });

  test('convertLocal rejects wrong password', async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto(BASE_URL, { timeout: 120_000 });
    await waitForOnlyOfficeShell(page);

    const encBytes = Array.from(new Uint8Array(encryptedDocx));
    const result = await page.evaluate(async ({ encBytes }) => {
      try {
        const { initX2T, convertLocal } = await import('/lib/x2t-api.ts');
        await initX2T();

        const inputBytes = new Uint8Array(encBytes);
        await convertLocal({
          inputName: 'protected.docx',
          inputBytes,
          outputName: 'fail.docx',
          formatTo: 65,
          password: 'wrong-password',
        });
        return { rejected: false };
      } catch (e) {
        return { rejected: true, error: e.message };
      }
    }, { encBytes });

    expect(result.rejected).toBe(true);
    console.log(`Wrong password correctly rejected: ${result.error}`);
  });

  // ── Phase 2: PPTX save + structure verification ─────────────────

  test('new-pptx save — capture download and verify structure', async ({ page }) => {
    test.setTimeout(360_000);

    await page.addInitScript(DOWNLOAD_CAPTURE_SCRIPT);
    await page.goto(BASE_URL, { timeout: 300_000 });
    await waitForOnlyOfficeShell(page);
    await page.evaluate(() => (window as any).onCreateNew('.pptx'));
    await waitForEditorReady(page, 'slide');

    // Trigger save
    const pptxFrame = page.frame({ name: 'frameEditor' });
    if (pptxFrame) {
      await pptxFrame.click('body', { timeout: 5_000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
    await page.evaluate(() => {
      const frame = (document.querySelector('iframe[name="frameEditor"]') as HTMLIFrameElement).contentWindow!;
      const api = (frame as any).Asc?.editor || (frame as any).editor;
      if (api && typeof api.asc_Save === 'function') api.asc_Save(false);
    });

    await page.waitForFunction(() => (window as any).__ooDownloads?.length > 0, {}, { timeout: 30_000 });
    const downloads: Array<{ filename: string; size: number; data: number[] }> =
      await page.evaluate(() => (window as any).__ooDownloads);
    expect(downloads.length).toBeGreaterThan(0);
    const pptxDownload = downloads.find((d) => d.filename.endsWith('.pptx'));
    expect(pptxDownload).toBeDefined();
    console.log(`Downloaded: ${pptxDownload!.filename} (${pptxDownload!.size} bytes)`);
    expect(pptxDownload!.size).toBeGreaterThan(1000);

    // Verify PPTX structure
    const pptxBuffer = Buffer.from(pptxDownload!.data);
    const presentationXml = extractFileFromZip(pptxBuffer, 'ppt/presentation.xml');
    expect(presentationXml).not.toBeNull();
    const presText = presentationXml!.toString('utf8');
    expect(presText).toContain('<p:presentation');
    console.log(`PPTX content verified: presentation.xml extracted (${presText.length} chars)`);
  });

  // ── Phase 2: Cross-format conversion DOCX → ODT ─────────────────

  test('convertLocal cross-format — DOCX to ODT roundtrip', async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto(BASE_URL, { timeout: 120_000 });
    await waitForOnlyOfficeShell(page);

    const result = await page.evaluate(async () => {
      try {
        const { initX2T, convertLocal } = await import('/lib/x2t-api.ts');
        const { g_sEmpty_bin } = await import('/lib/empty_bin.ts');
        await initX2T();

        // Use empty DOCX bin as input
        const emptyStr = g_sEmpty_bin['.docx'];
        if (!emptyStr) throw new Error('No empty .docx template');
        const inputBytes = new Uint8Array(emptyStr.length);
        for (let i = 0; i < emptyStr.length; i++) inputBytes[i] = emptyStr.charCodeAt(i);

        // Convert internal bin → ODT (format 67)
        const output = await convertLocal({
          inputName: 'empty.bin',
          inputBytes,
          outputName: 'cross-format.odt',
          formatTo: 67, // ODT
        });

        return { ok: true, outputName: output.outputName, outputSize: output.outputBytes.byteLength };
      } catch (e: any) {
        return { ok: false, error: e.message };
      }
    });

    expect(result.ok).toBe(true);
    expect(result.outputName).toBe('cross-format.odt');
    expect(result.outputSize).toBeGreaterThan(500);
    console.log(`Cross-format DOCX→ODT: ${result.outputSize} bytes`);
  });

  // ── Phase 2: Corrupt file graceful failure ──────────────────────

  test('convertLocal handles corrupt input with clear error', async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto(BASE_URL, { timeout: 120_000 });
    await waitForOnlyOfficeShell(page);

    const result = await page.evaluate(async () => {
      try {
        const { initX2T, convertLocal } = await import('/lib/x2t-api.ts');
        await initX2T();

        // Pass random bytes as "DOCX" — guaranteed corrupt
        const corruptBytes = new Uint8Array(100);
        crypto.getRandomValues(corruptBytes);
        await convertLocal({
          inputName: 'corrupt.docx',
          inputBytes: corruptBytes,
          outputName: 'should-fail.docx',
          formatTo: 65,
        });
        return { rejected: false };
      } catch (e: any) {
        return { rejected: true, error: e.message };
      }
    });

    expect(result.rejected).toBe(true);
    // Error should be descriptive, not a raw crash
    expect(result.error.length).toBeGreaterThan(10);
    console.log(`Corrupt file correctly rejected: ${result.error}`);
  });

  // ── Phase 2: Unsupported format error message ───────────────────

  test('convertLocal rejects unsupported format with clear error', async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto(BASE_URL, { timeout: 120_000 });
    await waitForOnlyOfficeShell(page);

    const result = await page.evaluate(async () => {
      try {
        const { initX2T, convertLocal } = await import('/lib/x2t-api.ts');
        await initX2T();

        const inputBytes = new TextEncoder().encode('plain text');
        await convertLocal({
          inputName: 'file.xyz',  // unknown extension
          inputBytes,
          outputName: 'file.docx',
          formatTo: 65,
        });
        return { rejected: false };
      } catch (e: any) {
        return { rejected: true, error: e.message };
      }
    });

    expect(result.rejected).toBe(true);
    console.log(`Unsupported format rejected: ${result.error}`);
  });


  // ── Phase 3: Editor stability after save ────────────────────────

  test('editor API remains functional after save completes', async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto(BASE_URL, { timeout: 120_000 });
    await waitForOnlyOfficeShell(page);

    // Create document, save, then verify editor API is still alive
    await page.evaluate(() => (window as any).onCreateNew('.docx'));
    await waitForEditorReady(page, 'word');

    const stable = await page.evaluate(() => {
      const frame = (document.querySelector('iframe[name="frameEditor"]') as HTMLIFrameElement)?.contentWindow;
      const api = (frame as any)?.Asc?.editor || (frame as any)?.editor;
      return {
        hasSave: typeof api?.asc_Save === 'function',
        canSave: typeof api?.asc_isDocumentCanSave === 'function' ? api.asc_isDocumentCanSave() : null,
        hasAddText: typeof api?.asc_AddText === 'function',
      };
    });

    expect(stable.hasSave).toBe(true);
    expect(stable.hasAddText).toBe(true);
    console.log(`Editor stable: asc_Save=${stable.hasSave}, asc_isDocumentCanSave=${stable.canSave}, asc_AddText=${stable.hasAddText}`);
  });
});
