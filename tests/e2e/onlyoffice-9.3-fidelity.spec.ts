// @ts-nocheck — Playwright E2E test, Vite module resolution in browser
import { test, expect } from '@playwright/test';
import {
  DOWNLOAD_CAPTURE_SCRIPT,
  createEvidence,
  recordConsoleAndPageErrors,
  recordRequestFailures,
  waitForOnlyOfficeShell,
  waitForEditorReady,
  extractFileFromZip,
} from './helpers/onlyoffice';

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

    const downloads: Array<{ filename: string; size: number }> = await page.evaluate(
      () => (window as any).__ooDownloads,
    );
    expect(downloads.length).toBeGreaterThan(0);
    const xlsxDownload = downloads.find((d) => d.filename.endsWith('.xlsx'));
    expect(xlsxDownload).toBeDefined();
    console.log(`Downloaded: ${xlsxDownload!.filename} (${xlsxDownload!.size} bytes)`);
    expect(xlsxDownload!.size).toBeGreaterThan(1000);
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

  test('9.3.1 version check', async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto(BASE_URL, { timeout: 120_000 });
    await waitForOnlyOfficeShell(page);

    const version = await page.evaluate(() => (window as any).DocsAPI?.DocEditor?.version());
    expect(version).toBe('9.3.1');
  });
});
