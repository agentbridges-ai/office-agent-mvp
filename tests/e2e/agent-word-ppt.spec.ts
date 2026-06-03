// @ts-nocheck - Playwright E2E test, Vite module imports run in browser context.
import { test, expect } from '@playwright/test';
import {
  DOWNLOAD_CAPTURE_SCRIPT,
  extractFileFromZip,
  waitForEditorReady,
  waitForOnlyOfficeShell,
} from './helpers/onlyoffice';

const BASE_URL = process.env.APP_URL || 'http://127.0.0.1:5173';
const WORD_TEXT = 'WORD_AGENT_E2E_INSERTED_TEXT_20260603';
const PPT_TEXT = 'PPT_AGENT_E2E_TEXTBOX_TEXT_20260603';

test.use({
  browserName: 'chromium',
  headless: true,
  viewport: { width: 1280, height: 720 },
});

async function waitForDownloads(page) {
  await page.waitForFunction(() => (window as any).__ooDownloads?.length > 0, {}, { timeout: 60_000 });
  return page.evaluate(() => (window as any).__ooDownloads);
}

async function createNewDocument(page, extension: '.docx' | '.pptx') {
  await page.evaluate(async (ext) => {
    const version = `agent-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const { onCreateNew } = await import(`/lib/document.ts?t=${version}`);
    await onCreateNew(ext);
  }, extension);
}

function zipEntries(zipBuffer: Buffer): string[] {
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

async function runWordAgentTools(page) {
  return page.evaluate(async (text) => {
    const {
      executeWordGetContext,
      executeWordInsertText,
      executeWordSaveDocument,
    } = await import('/lib/agent/word-tools.ts');
    const context = await executeWordGetContext();
    if (!context.ok) return { ok: false, phase: 'context', context };
    const insert = await executeWordInsertText({ text });
    if (!insert.ok) return { ok: false, phase: 'insert', context, insert };
    const save = await executeWordSaveDocument();
    return { ok: save.ok, phase: 'save', context, insert, save };
  }, WORD_TEXT);
}

async function runPptAgentTools(page) {
  return page.evaluate(async (text) => {
    const {
      executePptAddSlide,
      executePptAddTextBox,
      executePptGetContext,
      executePptSaveDocument,
    } = await import('/lib/agent/ppt-tools.ts');
    const context = await executePptGetContext();
    if (!context.ok) return { ok: false, phase: 'context', context };
    const slide = await executePptAddSlide({});
    if (!slide.ok) return { ok: false, phase: 'add-slide', context, slide };
    const textBox = await executePptAddTextBox({ text, x: 1, y: 1, width: 5, height: 1 });
    if (!textBox.ok) return { ok: false, phase: 'add-text-box', context, slide, textBox };
    const save = await executePptSaveDocument();
    return { ok: save.ok, phase: 'save', context, slide, textBox, save };
  }, PPT_TEXT);
}

function expectAgentSaveOk(result: unknown) {
  expect(result, JSON.stringify(result, null, 2)).toMatchObject({ ok: true, phase: 'save' });
}

test.describe('Word/PPT Agent MVP E2E', () => {
  test('Word Agent inserts text and saves DOCX with OOXML evidence', async ({ page }) => {
    test.setTimeout(360_000);
    await page.addInitScript(DOWNLOAD_CAPTURE_SCRIPT);
    await page.goto(BASE_URL, { timeout: 300_000 });
    await waitForOnlyOfficeShell(page);
    await createNewDocument(page, '.docx');
    await waitForEditorReady(page, 'word');

    const result = await runWordAgentTools(page);
    expectAgentSaveOk(result);

    const downloads = await waitForDownloads(page);
    const docxDownload = downloads.find((download) => download.filename.endsWith('.docx'));
    expect(docxDownload).toBeDefined();

    const documentXml = extractFileFromZip(Buffer.from(docxDownload.data), 'word/document.xml');
    expect(documentXml).not.toBeNull();
    expect(documentXml!.toString('utf8')).toContain(WORD_TEXT);
  });

  test('PPT Agent adds slide text and saves PPTX with OOXML evidence', async ({ page }) => {
    test.setTimeout(360_000);
    await page.addInitScript(DOWNLOAD_CAPTURE_SCRIPT);
    await page.goto(BASE_URL, { timeout: 300_000 });
    await waitForOnlyOfficeShell(page);
    await createNewDocument(page, '.pptx');
    await waitForEditorReady(page, 'slide');

    const result = await runPptAgentTools(page);
    expectAgentSaveOk(result);

    const downloads = await waitForDownloads(page);
    const pptxDownload = downloads.find((download) => download.filename.endsWith('.pptx'));
    expect(pptxDownload).toBeDefined();

    const pptxBuffer = Buffer.from(pptxDownload.data);
    const slidePaths = zipEntries(pptxBuffer).filter((entry) => /^ppt\/slides\/slide\d+\.xml$/.test(entry));
    expect(slidePaths.length).toBeGreaterThan(0);
    const slideXml = slidePaths
      .map((entry) => extractFileFromZip(pptxBuffer, entry)?.toString('utf8') || '')
      .join('\n');
    expect(slideXml).toContain(PPT_TEXT);
  });
});
