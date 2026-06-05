import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function readProjectFile(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

describe('Agent panel document routing', () => {
  it('routes chat execution through runOfficeAgent with the current document kind', () => {
    const source = readProjectFile('lib/agent/panel.ts');

    expect(source).toContain('runOfficeAgent');
    expect(source).toContain('documentKind: state.documentKind');
    expect(source).not.toContain('runExcelAgent({');
  });

  it('maps editor file types into Office document kinds', () => {
    const source = readProjectFile('lib/agent/panel.ts');

    expect(source).toContain("return 'word'");
    expect(source).toContain("return 'presentation'");
    expect(source).toContain("return 'spreadsheet'");
    expect(source).toContain('office-agent:document-ready');
  });

  it('keeps shared menu guidance document-neutral', () => {
    const source = readProjectFile('lib/i18n.ts');
    const indexSource = readProjectFile('index.html');

    expect(source).not.toContain('Excel Office Agent');
    expect(source).not.toContain('opening or creating Excel workbooks');
    expect(source).not.toContain('可打开或新建 Excel');
    expect(indexSource).not.toContain('<title>Excel Office Agent</title>');
  });
});
