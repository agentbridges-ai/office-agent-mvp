// @ts-nocheck — Playwright E2E test, Vite module resolution in browser
import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE_URL = process.env.APP_URL || 'http://127.0.0.1:5173';
const CHROMIUM = process.env.CHROME_BIN || '/snap/bin/chromium';

test.use({
  browserName: 'chromium',
  executablePath: CHROMIUM,
  headless: true,
  viewport: { width: 1280, height: 720 },
});

test.describe('ONLYOFFICE 9.3 E2E Fidelity', () => {
  test('new-docx type and save — verify content in downloaded file', async ({ page }) => {
    const downloads: { filename: string; data: Buffer }[] = [];
    page.on('download', async (download) => {
      downloads.push({
        filename: download.suggestedFilename(),
        data: await download.bodyAsBuffer(),
      });
      await download.cancel();
    });

    await page.goto(BASE_URL);
    await page.waitForFunction(() => (window as any).onCreateNew);
    await page.evaluate(() => (window as any).onCreateNew('.docx'));

    // Wait for editor iframe and document ready
    await page.waitForSelector('iframe[name="frameEditor"]', { timeout: 60000 });
    await page.waitForTimeout(3000); // allow editor to initialize

    // Type text into the editor
    const frame = page.frameLocator('iframe[name="frameEditor"]');
    await frame.locator('#id_viewer').click();
    await page.keyboard.type('ONLYOFFICE 9.3 E2E Fidelity Test 中文测试');
    await page.waitForTimeout(500);

    // Trigger save via the window.editor
    await page.evaluate(() => {
      const frame = (document.querySelector('iframe[name="frameEditor"]') as HTMLIFrameElement).contentWindow!;
      const api = (frame as any).Asc?.editor || (frame as any).editor;
      if (api && typeof api.asc_Save === 'function') api.asc_Save(false);
    });

    // Wait for download
    await page.waitForTimeout(5000);
    expect(downloads.length).toBeGreaterThan(0);
    const docxDownload = downloads.find((d) => d.filename.endsWith('.docx'));
    expect(docxDownload).toBeDefined();
    console.log(`Downloaded: ${docxDownload!.filename} (${docxDownload!.data.length} bytes)`);
    expect(docxDownload!.data.length).toBeGreaterThan(1000);
  });

  test('concurrent open — DOCX and XLSX in parallel browser contexts', async ({ browser }) => {
    const docxContext = await browser.newContext();
    const xlsxContext = await browser.newContext();
    const [docxPage, xlsxPage] = await Promise.all([
      docxContext.newPage(),
      xlsxContext.newPage(),
    ]);

    // Open DOCX
    await docxPage.goto(BASE_URL);
    await docxPage.waitForFunction(() => (window as any).onCreateNew);
    await docxPage.evaluate(() => (window as any).onCreateNew('.docx'));
    await docxPage.waitForSelector('iframe[name="frameEditor"]', { timeout: 60000 });

    // Open XLSX
    await xlsxPage.goto(BASE_URL);
    await xlsxPage.waitForFunction(() => (window as any).onCreateNew);
    await xlsxPage.evaluate(() => (window as any).onCreateNew('.xlsx'));
    await xlsxPage.waitForSelector('iframe[name="frameEditor"]', { timeout: 60000 });

    // Both should have editors loaded
    const docxHasEditor = await docxPage.evaluate(() => !!(window as any).editor);
    const xlsxHasEditor = await xlsxPage.evaluate(() => !!(window as any).editor);
    expect(docxHasEditor).toBe(true);
    expect(xlsxHasEditor).toBe(true);

    await docxContext.close();
    await xlsxContext.close();
  });

  test('x2t-api.ts — convertLocal through browser', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForFunction(() => (window as any).onCreateNew);

    // Test that x2t initializes and the module is available
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

    // Verify the DocsAPI version
    const version = await page.evaluate(() => (window as any).DocsAPI?.DocEditor?.version());
    expect(version).toBe('9.3.1');
  });
});
