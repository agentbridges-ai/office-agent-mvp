import { describe, expect, it } from 'vitest';
import {
  createPptTools,
  executePptAddSlide,
  executePptAddTextBox,
  pptAddSlideSchema,
  pptAddTextBoxSchema,
} from '../lib/agent/ppt-tools';
import type { OperationLogger } from '../lib/agent/types';

describe('PPT Agent tools', () => {
  it('validates add slide input', () => {
    const input = pptAddSlideSchema.parse({ layoutIndex: 0 });

    expect(input.layoutIndex).toBe(0);
  });

  it('validates text box input', () => {
    const input = pptAddTextBoxSchema.parse({
      text: 'Hello PPT Agent',
      x: 1,
      y: 1,
      width: 4,
      height: 1,
    });

    expect(input.text).toBe('Hello PPT Agent');
    expect(input.width).toBe(4);
  });

  it('reports unsupported when adding slides without a browser bridge', async () => {
    const result = await executePptAddSlide({});

    expect(result.ok).toBe(false);
    expect(result.supportLevel).toBe('unsupported');
    expect(result.error).toContain('Trusted Office plugin bridge is not ready');
  });

  it('does not pretend text insertion succeeded without a bridge', async () => {
    const result = await executePptAddTextBox({ text: 'Hello PPT Agent' });

    expect(result.ok).toBe(false);
    expect(result.supportLevel).toBe('unsupported');
  });

  it('requires approval before mutating the presentation', async () => {
    const approvalRequests: unknown[] = [];
    const log: OperationLogger = () => ({
      id: 'log-ppt-denied',
      at: new Date(0).toISOString(),
      toolName: 'ppt_add_text_box',
      summary: 'add text box',
      ok: false,
      supportLevel: 'partial',
    });
    const tools = createPptTools(log, {
      async request(input) {
        approvalRequests.push(input);
        return false;
      },
    });

    const result = await (tools.ppt_add_text_box as any).execute({ text: 'Blocked PPT edit' }, {});

    expect(approvalRequests).toHaveLength(1);
    expect(approvalRequests[0]).toMatchObject({ toolName: 'ppt_add_text_box', summary: 'add text box' });
    expect(result.ok).toBe(false);
    expect(result.supportLevel).toBe('partial');
    expect(result.error).toContain('未批准');
  });
});
