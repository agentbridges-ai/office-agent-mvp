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

    // Type text via editor API
    await page.evaluate(() => {
      const frame = (document.querySelector('iframe[name="frameEditor"]') as HTMLIFrameElement).contentWindow!;
      const api = (frame as any).Asc?.editor || (frame as any).editor;
      if (api && typeof api.asc_AddText === 'function') {
        api.asc_AddText('ONLYOFFICE 9.3 E2E Fidelity Test');
      }
    });
    await page.waitForTimeout(500);

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

    // Verify typed text is in the DOCX by extracting word/document.xml
    const docxBuffer = Buffer.from(docxDownload!.data);
    const documentXml = extractFileFromZip(docxBuffer, 'word/document.xml');
    expect(documentXml).not.toBeNull();
    const xmlText = documentXml!.toString('utf8');
    expect(xmlText).toContain('ONLYOFFICE 9.3 E2E Fidelity Test');
    console.log('DOCX content verified: typed text found in word/document.xml');
  });

  test('convertLocal real conversion — TXT to DOCX via x2t-api.ts wrapper', async ({ page }) => {
    test.setTimeout(360_000);

    await page.goto(BASE_URL, { timeout: 300_000 });
    await waitForOnlyOfficeShell(page);

    const result = await page.evaluate(async () => {
      try {
        const { initX2T, convertLocal } = await import('/lib/x2t-api.ts');
        await initX2T();

        const inputBytes = new TextEncoder().encode('ONLYOFFICE 9.3 E2E x2t-api.ts wrapper test');
        const output = await convertLocal({
          inputName: 'e2e-test.txt',
          inputBytes,
          outputName: 'e2e-test.docx',
          formatFrom: 69, // TXT — explicit, don't rely on auto-detect
          formatTo: 65,  // DOCX
        });

        return {
          ok: true,
          outputName: output.outputName,
          outputSize: output.outputBytes.byteLength,
          warnings: output.warnings,
        };
      } catch (e: any) {
        return { ok: false, error: e.message };
      }
    });

    expect(result.ok).toBe(true);
    expect(result.outputName).toBe('e2e-test.docx');
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

  test('concurrent open — DOCX and XLSX in parallel contexts', async ({ browser }) => {
    test.setTimeout(360_000);

    const docxContext = await browser.newContext();
    const xlsxContext = await browser.newContext();
    const [docxPage, xlsxPage] = await Promise.all([
      docxContext.newPage(),
      xlsxContext.newPage(),
    ]);

    await docxPage.goto(BASE_URL, { timeout: 300_000 });
    await waitForOnlyOfficeShell(docxPage);
    await docxPage.evaluate(() => (window as any).onCreateNew('.docx'));
    await waitForEditorReady(docxPage, 'word');

    await xlsxPage.goto(BASE_URL, { timeout: 300_000 });
    await waitForOnlyOfficeShell(xlsxPage);
    await xlsxPage.evaluate(() => (window as any).onCreateNew('.xlsx'));
    await waitForEditorReady(xlsxPage, 'cell');

    const docxHasEditor = await docxPage.evaluate(() => !!(window as any).editor);
    const xlsxHasEditor = await xlsxPage.evaluate(() => !!(window as any).editor);
    expect(docxHasEditor).toBe(true);
    expect(xlsxHasEditor).toBe(true);

    await docxContext.close();
    await xlsxContext.close();
  });

  test('9.3.1 version check', async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto(BASE_URL, { timeout: 120_000 });
    await waitForOnlyOfficeShell(page);

    const version = await page.evaluate(() => (window as any).DocsAPI?.DocEditor?.version());
    expect(version).toBe('9.3.1');
  });
});
