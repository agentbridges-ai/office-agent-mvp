import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkModelConnection, maskApiKey, parseModelConfigText } from '../lib/agent/settings';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('AI settings parsing', () => {
  it('parses local model.txt without changing key text', () => {
    const parsed = parseModelConfigText(
      [
        'OPENAI_API_URL=https://api.deepseek.com/v1',
        'OPENAI_API_KEY=sk-secret-value',
        'MODEL_ID=deepseek-v4-flash',
      ].join('\n'),
    );
    expect(parsed).toEqual({
      baseURL: 'https://api.deepseek.com/v1',
      apiKey: 'sk-secret-value',
      modelId: 'deepseek-v4-flash',
    });
  });

  it('masks API keys for display', () => {
    expect(maskApiKey('sk-1234567890')).toBe('sk-1...7890');
    expect(maskApiKey('short')).toBe('********');
  });

  it('tests model connectivity with the configured model id', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await checkModelConnection({
      baseURL: 'https://example.test/v1/',
      apiKey: 'sk-secret-value',
      modelId: 'deepseek-v4-flash',
      includeUsage: true,
    });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"model":"deepseek-v4-flash"'),
      }),
    );
  });
});
