#!/usr/bin/env node
// Generate valid XLS and PPT binary fixtures using x2t WASM in browser.
// Avoids hand-crafting BIFF8/MS-PPT by using x2t's own conversion: XLSX→XLS, PPTX→PPT.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE_URL = process.env.APP_URL || 'http://127.0.0.1:5173';
const FIXTURE_DIR = join(import.meta.dirname, '..', 'bin', 'onlyoffice-smoke', 'fixtures');

async function main() {
  mkdirSync(FIXTURE_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL, { timeout: 120_000 });
    await page.waitForFunction(() => typeof (window).onCreateNew === 'function', {}, { timeout: 60_000 });

    // Generate XLSX→XLS
    console.log('Generating XLS binary fixture...');
    const xlsResult = await page.evaluate(async () => {
      const { initX2T, convertLocal } = await import('/lib/x2t-api.ts');
      const { g_sEmpty_bin } = await import('/lib/empty_bin.ts');
      await initX2T();

      // Convert empty XLSX bin to actual XLSX, then to XLS
      const emptyBin = g_sEmpty_bin['.xlsx'];
      const inputBytes = new Uint8Array(emptyBin.length);
      for (let i = 0; i < emptyBin.length; i++) inputBytes[i] = emptyBin.charCodeAt(i);

      const xlsOutput = await convertLocal({
        inputName: 'empty.bin',
        inputBytes,
        outputName: 'fixture.xls',
        formatTo: 258, // XLS (Excel 97-2003)
      });
      return { ok: true, size: xlsOutput.outputBytes.byteLength, data: Array.from(xlsOutput.outputBytes) };
    });
    if (xlsResult.ok) {
      writeFileSync(join(FIXTURE_DIR, 'generated-smoke.xls'), Buffer.from(xlsResult.data));
      console.log(`  XLS fixture: ${xlsResult.size} bytes ✅`);
    } else {
      console.log('  XLS conversion FAILED — hand-crafted BIFF8 fallback needed');
    }

    // Generate PPTX→PPT
    console.log('Generating PPT binary fixture...');
    const pptResult = await page.evaluate(async () => {
      const { initX2T, convertLocal } = await import('/lib/x2t-api.ts');
      const { g_sEmpty_bin } = await import('/lib/empty_bin.ts');
      await initX2T();

      const emptyBin = g_sEmpty_bin['.pptx'];
      const inputBytes = new Uint8Array(emptyBin.length);
      for (let i = 0; i < emptyBin.length; i++) inputBytes[i] = emptyBin.charCodeAt(i);

      const pptOutput = await convertLocal({
        inputName: 'empty.bin',
        inputBytes,
        outputName: 'fixture.ppt',
        formatTo: 130, // PPT (PowerPoint 97-2003)
      });
      return { ok: true, size: pptOutput.outputBytes.byteLength, data: Array.from(pptOutput.outputBytes) };
    });
    if (pptResult.ok) {
      writeFileSync(join(FIXTURE_DIR, 'generated-smoke.ppt'), Buffer.from(pptResult.data));
      console.log(`  PPT fixture: ${pptResult.size} bytes ✅`);
    } else {
      console.log('  PPT conversion FAILED — hand-crafted MS-PPT fallback needed');
    }

  } catch (e) {
    console.error('Fixture generation failed:', e.message);
  } finally {
    await browser.close();
  }
}

main();
