import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function readProjectFile(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

describe('Document checkpoints', () => {
  it('exports document-level checkpoint APIs while preserving workbook aliases', () => {
    const source = readProjectFile('lib/checkpoints.ts');

    expect(source).toContain('export interface DocumentCheckpoint');
    expect(source).toContain('export async function listDocumentCheckpoints');
    expect(source).toContain('export async function createDocumentCheckpoint');
    expect(source).toContain('export async function restoreDocumentCheckpoint');
    expect(source).toContain('export async function deleteDocumentCheckpoint');
    expect(source).toContain('export const listWorkbookCheckpoints = listDocumentCheckpoints');
    expect(source).toContain('export const createWorkbookCheckpoint = createDocumentCheckpoint');
    expect(source).toContain('export const restoreWorkbookCheckpoint = restoreDocumentCheckpoint');
    expect(source).toContain('export const deleteWorkbookCheckpoint = deleteDocumentCheckpoint');
  });

  it('keeps checkpoint user-facing copy document-neutral', () => {
    const source = readProjectFile('lib/checkpoints.ts');
    const panelSource = readProjectFile('lib/agent/panel.ts');
    const editorSource = readProjectFile('lib/onlyoffice-editor.ts');

    expect(source).not.toContain('Excel 尚未连接');
    expect(source).not.toContain('无法触发工作簿保存');
    expect(panelSource).not.toContain('打开 Excel 后可创建检查点');
    expect(editorSource).not.toContain('workbook checkpoint');
  });
});
