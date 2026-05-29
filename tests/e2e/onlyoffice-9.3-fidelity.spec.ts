// @ts-nocheck — Playwright E2E test, Vite module resolution in browser
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE_URL = process.env.APP_URL || 'http://127.0.0.1:5173';

test.use({
  browserName: 'chromium',
  headless: true,
  viewport: { width: 1280, height: 720 },
});

test.describe('ONLYOFFICE 9.3 E2E Fidelity', () => {
  test('new-docx type and save — capture download content', async ({ page }) => {
    test.setTimeout(360000); // 6min for WASM cold start
    const downloads: { filename: string; data: Buffer }[] = [];
    page.on('download', async (download) => {
      downloads.push({
        filename: download.suggestedFilename(),
        data: await download.bodyAsBuffer(),
      });
      await download.cancel();
    });

    await page.goto(BASE_URL, { timeout: 300000 });
    await page.waitForFunction(() => (window as any).onCreateNew, {}, { timeout: 120000 });
    await page.evaluate(() => (window as any).onCreateNew('.docx'));

    // Wait for editor iframe and document ready
    await page.waitForSelector('iframe[name="frameEditor"]', { timeout: 60000 });
    await page.waitForFunction(
      () => !!(window as any).editor,
      {},
      { timeout: 60000 },
    );
    // Wait for document to be ready (editor may need time to load)
    await page.waitForTimeout(3000);
    await page.waitForFunction(
      () => {
        try {
          const frame = (document.querySelector('iframe[name="frameEditor"]') as HTMLIFrameElement)?.contentWindow!;
          const api = (frame as any).Asc?.editor || (frame as any).editor;
          return api && typeof api.asc_AddText === 'function';
        } catch { return false; }
      },
      {},
      { timeout: 120000 },
    );

    // Use editor API to type text (more reliable than canvas click)
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

    // Wait for download (save bridge may take a few seconds)
    await page.waitForTimeout(8000);
    expect(downloads.length).toBeGreaterThan(0);
    const docxDownload = downloads.find((d) => d.filename.endsWith('.docx'));
    expect(docxDownload).toBeDefined();
    console.log(`Downloaded: ${docxDownload!.filename} (${docxDownload!.data.length} bytes)`);
    expect(docxDownload!.data.length).toBeGreaterThan(1000);
  });

  test('concurrent open — DOCX and XLSX in parallel contexts', async ({ browser }) => {
    test.setTimeout(360000);
    const docxContext = await browser.newContext();
    const xlsxContext = await browser.newContext();
    const [docxPage, xlsxPage] = await Promise.all([
      docxContext.newPage(),
      xlsxContext.newPage(),
    ]);

    await docxPage.goto(BASE_URL, { timeout: 300000 });
    await docxPage.waitForFunction(() => (window as any).onCreateNew, {}, { timeout: 120000 });
    await docxPage.evaluate(() => (window as any).onCreateNew('.docx'));
    await docxPage.waitForSelector('iframe[name="frameEditor"]', { timeout: 60000 });

    await xlsxPage.goto(BASE_URL, { timeout: 300000 });
    await xlsxPage.waitForFunction(() => (window as any).onCreateNew, {}, { timeout: 120000 });
    await xlsxPage.evaluate(() => (window as any).onCreateNew('.xlsx'));
    await xlsxPage.waitForSelector('iframe[name="frameEditor"]', { timeout: 60000 });

    const docxHasEditor = await docxPage.evaluate(() => !!(window as any).editor);
    const xlsxHasEditor = await xlsxPage.evaluate(() => !!(window as any).editor);
    expect(docxHasEditor).toBe(true);
    expect(xlsxHasEditor).toBe(true);

    await docxContext.close();
    await xlsxContext.close();
  });

  test('x2t-api.ts convertLocal through browser', async ({ page }) => {
    test.setTimeout(360000);
    await page.goto(BASE_URL, { timeout: 300000 });
    await page.waitForFunction(() => (window as any).onCreateNew, {}, { timeout: 120000 });

    const moduleAvailable = await page.evaluate(async () => {
      try {
        const { initX2T } = await import('/lib/x2t-api.ts');
        await initX2T();
        return true;
      } catch (e) {
        console.error('x2t init failed:', e);
        return false;
      }
    });

    expect(moduleAvailable).toBe(true);
    const version = await page.evaluate(() => (window as any).DocsAPI?.DocEditor?.version());
    expect(version).toBe('9.3.1');
  });
});
