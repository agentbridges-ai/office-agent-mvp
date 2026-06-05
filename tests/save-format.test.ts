import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { oAscFileType } from '../lib/file-types';

async function loadSaveModule() {
  vi.stubGlobal('window', { location: { origin: 'http://localhost' } });
  return import('../lib/onlyoffice-compat/save');
}

afterEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
});

describe('ONLYOFFICE local save format resolution', () => {
  it('prefers the header-preserving native export API for browser-local saves', () => {
    const source = readFileSync(resolve(process.cwd(), 'lib/onlyoffice-compat/save.ts'), 'utf8');

    expect(source).toContain("if (typeof api.asc_nativeGetFile === 'function') return api.asc_nativeGetFile();");
    expect(source.indexOf('api.asc_nativeGetFile ===')).toBeLessThan(source.indexOf('api.asc_nativeGetFile2 ==='));
  });

  it('routes spreadsheet save through the local download bridge', () => {
    const editorSource = readFileSync(resolve(process.cwd(), 'lib/onlyoffice-editor.ts'), 'utf8');
    const localDownloadSource = readFileSync(resolve(process.cwd(), 'lib/onlyoffice-compat/local-download.ts'), 'utf8');

    expect(editorSource).toContain('downloadLocalDataFromCurrentEditor');
    expect(editorSource).toContain("targetFormat === 'XLSX'");
    expect(localDownloadSource).toContain('asc_CDownloadOptions');
    expect(localDownloadSource).toContain('api.asc_DownloadAs');
  });

  it('waits for the full spreadsheet SDK constructor before local XLSX download', () => {
    const source = readFileSync(resolve(process.cwd(), 'lib/onlyoffice-compat/local-download.ts'), 'utf8');

    expect(source).toContain('AscCommonExcel?.Cl');
    expect(source).toContain('frame.AscCommon?.lQj');
    expect(source).toContain("loadFullSdk('cell'");
    expect(source).toContain('waitForSpreadsheetNativeDownloadApi');
    expect(source).toContain('getLocalDownloadApi(frame)');
    expect(source).toContain('api.wa?.Pxg');
    expect(source).not.toContain('api.MHa === true');
  });

  it('resolves DOCX output format without falling back to XLSX', async () => {
    const { resolveLocalSaveTargetFormat } = await loadSaveModule();

    const targetFormat = resolveLocalSaveTargetFormat(oAscFileType.DOCX, 'draft.docx');

    expect(targetFormat).toBe('DOCX');
  });

  it('resolves spreadsheet output formats by ONLYOFFICE outputformat', async () => {
    const { resolveLocalSaveTargetFormat } = await loadSaveModule();

    expect(resolveLocalSaveTargetFormat(oAscFileType.XLSX, 'budget.xlsx')).toBe('XLSX');
    expect(resolveLocalSaveTargetFormat(oAscFileType.CSV, 'budget.xlsx')).toBe('CSV');
  });

  it('uses CSV filename override for ONLYOFFICE spreadsheet save events', async () => {
    const { resolveLocalSaveTargetFormat } = await loadSaveModule();

    const targetFormat = resolveLocalSaveTargetFormat(oAscFileType.XLSX, 'export.csv');

    expect(targetFormat).toBe('CSV');
  });

  it('resolves PPTX output format without falling back to XLSX', async () => {
    const { resolveLocalSaveTargetFormat } = await loadSaveModule();

    const targetFormat = resolveLocalSaveTargetFormat(oAscFileType.PPTX, 'deck.pptx');

    expect(targetFormat).toBe('PPTX');
  });

  it('resolves native export save target from the current OOXML filename', async () => {
    const { resolveNativeSaveTargetFormat } = await loadSaveModule();

    expect(resolveNativeSaveTargetFormat('draft.docx')).toBe('DOCX');
    expect(resolveNativeSaveTargetFormat('budget.xlsx')).toBe('XLSX');
    expect(resolveNativeSaveTargetFormat('deck.pptx')).toBe('PPTX');
  });

  it('rejects native export save targets that are outside the browser-local OOXML contract', async () => {
    const { resolveNativeSaveTargetFormat } = await loadSaveModule();

    expect(() => resolveNativeSaveTargetFormat('legacy.doc')).toThrow(
      'Unsupported browser-local native save target extension: doc',
    );
  });

  it('rejects unknown output formats with an observable error', async () => {
    const { resolveLocalSaveTargetFormat } = await loadSaveModule();

    expect(() => resolveLocalSaveTargetFormat(999999, 'draft.docx')).toThrow(
      'Unsupported ONLYOFFICE local save output format: 999999',
    );
  });
});
