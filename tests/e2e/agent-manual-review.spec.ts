// @ts-nocheck - Playwright E2E test, Vite module imports run in browser context.
import { mkdir, writeFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';
import {
  DOWNLOAD_CAPTURE_SCRIPT,
  waitForEditorReady,
  waitForOnlyOfficeShell,
} from './helpers/onlyoffice';

const BASE_URL = process.env.APP_URL || 'http://127.0.0.1:5173';
const OUTPUT_DIR = 'test-results/manual-review-current';
const WORD_TEXT = 'WORD_MANUAL_REVIEW_CURRENT_20260603';
const PPT_TEXT = 'PPT_MANUAL_REVIEW_CURRENT_20260603';

test.use({
  browserName: 'chromium',
  headless: true,
  viewport: { width: 1280, height: 720 },
});

const DOCUMENT_READY_TYPES = {
  '.docx': 'docx',
  '.pptx': 'pptx',
  '.xlsx': 'xlsx',
} as const;

async function createNewDocument(page, extension: '.xlsx' | '.docx' | '.pptx') {
  await page.evaluate(async (ext) => {
    const expectedFileType = {
      '.docx': 'docx',
      '.pptx': 'pptx',
      '.xlsx': 'xlsx',
    }[ext];
    const ready = new Promise<void>((resolve) => {
      const onReady = (event: Event) => {
        const detail = (event as CustomEvent).detail || {};
        if (detail.fileType !== expectedFileType) return;
        window.removeEventListener('office-agent:document-ready', onReady);
        resolve();
      };
      window.addEventListener('office-agent:document-ready', onReady);
    });
    await (window as any).onCreateNew(ext);
    await ready;
  }, extension);
  expect(DOCUMENT_READY_TYPES[extension]).toBeDefined();
}

async function captureHostState(page) {
  return page.evaluate(() => {
    const menu = document.querySelector('#fab-menu') as HTMLElement | null;
    const menuStyle = menu ? window.getComputedStyle(menu) : null;
    const bodyText = document.body.innerText || '';
    return {
      downloads: ((window as any).__ooDownloads || []).map((item) => ({
        filename: item.filename,
        size: item.size,
      })),
      fab: menuStyle
        ? {
            display: menuStyle.display,
            opacity: menuStyle.opacity,
            pointerEvents: menuStyle.pointerEvents,
          }
        : null,
      hasCannotReadProperties: bodyText.includes('Cannot read properties'),
      hasOfficeBridgeNotReady: bodyText.includes('bridge is not ready'),
      bodyTextSample: bodyText.slice(0, 500),
    };
  });
}

async function writeEvidence(outputDir: string, evidence: unknown) {
  await mkdir(outputDir, { recursive: true });
  await writeFile(`${outputDir}/evidence.json`, JSON.stringify(evidence, null, 2));
}

async function collectExcelEvidence(page) {
  await createNewDocument(page, '.xlsx');
  await waitForEditorReady(page, 'cell');
  await page.screenshot({ path: `${OUTPUT_DIR}/excel-current.png`, fullPage: true });
  return { host: await captureHostState(page) };
}

async function collectWordEvidence(page) {
  await createNewDocument(page, '.docx');
  await waitForEditorReady(page, 'word');
  const word = await page.evaluate(async (text) => {
    const { executeWordInsertText, executeWordSaveDocument } = await import('/lib/agent/word-tools.ts');
    const insert = await executeWordInsertText({ text });
    const save = await executeWordSaveDocument();
    return { insert, save };
  }, WORD_TEXT);
  await page.screenshot({ path: `${OUTPUT_DIR}/word-current.png`, fullPage: true });
  return { ...word, host: await captureHostState(page) };
}

async function collectPptEvidence(page) {
  await createNewDocument(page, '.pptx');
  await waitForEditorReady(page, 'slide');
  const ppt = await page.evaluate(async (text) => {
    const {
      executePptAddSlide,
      executePptAddTextBox,
      executePptSaveDocument,
    } = await import('/lib/agent/ppt-tools.ts');
    const slide = await executePptAddSlide({});
    const textBox = await executePptAddTextBox({ text, x: 1, y: 1, width: 6, height: 1 });
    const save = await executePptSaveDocument();
    return { slide, textBox, save };
  }, PPT_TEXT);
  await page.screenshot({ path: `${OUTPUT_DIR}/ppt-current.png`, fullPage: true });
  return { ...ppt, host: await captureHostState(page) };
}

test.describe('Word/PPT Agent manual review evidence', () => {
  test('collects current Excel Word PPT machine evidence for human sign-off', async ({ page }) => {
    test.setTimeout(360_000);
    await page.addInitScript(DOWNLOAD_CAPTURE_SCRIPT);
    await page.goto(BASE_URL, { timeout: 300_000 });
    await waitForOnlyOfficeShell(page);
    await mkdir(OUTPUT_DIR, { recursive: true });

    const evidence = { generatedAt: new Date().toISOString(), samples: {} };

    evidence.samples.excel = await collectExcelEvidence(page);
    const word = await collectWordEvidence(page);
    evidence.samples.word = word;
    const ppt = await collectPptEvidence(page);
    evidence.samples.ppt = ppt;
    await writeEvidence(OUTPUT_DIR, evidence);

    expect(word.insert.ok, JSON.stringify(word, null, 2)).toBe(true);
    expect(word.save.ok, JSON.stringify(word, null, 2)).toBe(true);
    expect(ppt.slide.ok, JSON.stringify(ppt, null, 2)).toBe(true);
    expect(ppt.textBox.ok, JSON.stringify(ppt, null, 2)).toBe(true);
    expect(ppt.save.ok, JSON.stringify(ppt, null, 2)).toBe(true);
  });
});
