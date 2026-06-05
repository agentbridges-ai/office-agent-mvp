import { describe, expect, it } from 'vitest';
import {
  createWordTools,
  executeWordFormatSelection,
  executeWordInsertText,
  wordFormatSelectionSchema,
  wordInsertTextSchema,
} from '../lib/agent/word-tools';
import type { OperationLogger } from '../lib/agent/types';

describe('Word Agent tools', () => {
  it('validates insert text input', () => {
    const input = wordInsertTextSchema.parse({ text: 'Hello Word Agent' });

    expect(input.text).toBe('Hello Word Agent');
  });

  it('validates basic formatting input', () => {
    const input = wordFormatSelectionSchema.parse({ bold: true, fontSize: 14 });

    expect(input.bold).toBe(true);
    expect(input.fontSize).toBe(14);
  });

  it('reports unsupported when the browser editor bridge is unavailable', async () => {
    const result = await executeWordInsertText({ text: 'Hello Word Agent' });

    expect(result.ok).toBe(false);
    expect(result.supportLevel).toBe('unsupported');
    expect(result.error).toContain('Trusted Office plugin bridge is not ready');
  });

  it('does not pretend formatting succeeded without a bridge', async () => {
    const result = await executeWordFormatSelection({ bold: true });

    expect(result.ok).toBe(false);
    expect(result.supportLevel).toBe('unsupported');
  });

  it('requires approval before mutating the document', async () => {
    const approvalRequests: unknown[] = [];
    const log: OperationLogger = () => ({
      id: 'log-word-denied',
      at: new Date(0).toISOString(),
      toolName: 'word_insert_text',
      summary: 'insert text',
      ok: false,
      supportLevel: 'partial',
    });
    const tools = createWordTools(log, {
      async request(input) {
        approvalRequests.push(input);
        return false;
      },
    });

    const result = await (tools.word_insert_text as any).execute({ text: 'Blocked Word edit' }, {});

    expect(approvalRequests).toHaveLength(1);
    expect(approvalRequests[0]).toMatchObject({ toolName: 'word_insert_text', summary: 'insert text' });
    expect(result.ok).toBe(false);
    expect(result.supportLevel).toBe('partial');
    expect(result.error).toContain('未批准');
  });
});
