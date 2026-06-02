import { describe, expect, it } from 'vitest';
import { createTextFileRuntime } from '../lib/agent/file-tools';

describe('Browser text file tools', () => {
  it('reads uploaded text by bounded line windows without truncating stored content', () => {
    const runtime = createTextFileRuntime();
    const content = Array.from({ length: 420 }, (_, index) => `line ${index + 1}`).join('\n');
    const file = runtime.addFile({
      name: 'large.txt',
      content,
      source: 'upload',
    });

    const result = runtime.readFile({ fileId: file.id, mode: 'read', startLine: 399, lineCount: 5 });

    expect(result.ok).toBe(true);
    expect(runtime.getFile(file.id)?.content).toBe(content);
    expect(result.result).toMatchObject({
      mode: 'read',
      startLine: 399,
      endLine: 403,
    });
  });

  it('searches files with line numbers and context', () => {
    const runtime = createTextFileRuntime();
    const file = runtime.addFile({
      name: 'notes.md',
      content: ['alpha', 'target row', 'beta', 'another target'].join('\n'),
      source: 'upload',
    });

    const result = runtime.readFile({
      fileName: file.name,
      mode: 'search',
      query: 'target',
      contextLines: 1,
    });

    expect(result.ok).toBe(true);
    expect(result.result).toMatchObject({
      totalMatches: 2,
      returnedMatches: 2,
      matches: [
        {
          line: 2,
          text: 'target row',
          before: [{ line: 1, text: 'alpha' }],
          after: [{ line: 3, text: 'beta' }],
        },
        {
          line: 4,
          text: 'another target',
        },
      ],
    });
  });

  it('writes browser-local text files with metadata instead of echoing content', () => {
    const runtime = createTextFileRuntime();
    const result = runtime.writeFile({
      fileName: 'report.md',
      content: '# Report\n\nDone',
      description: 'summary report',
    });

    expect(result.ok).toBe(true);
    expect(result.result).toMatchObject({
      file: {
        name: 'report.md',
        lineCount: 3,
        source: 'generated',
        description: 'summary report',
      },
    });
    expect(JSON.stringify(result.result)).not.toContain('# Report');
  });
});
