import type { AiSettings } from './types';

const SETTINGS_KEY = 'office-agent.ai-settings.v1';

export const DEFAULT_AI_SETTINGS: AiSettings = {
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: '',
  modelId: 'deepseek-v4-flash',
  includeUsage: true,
};

export function normalizeBaseURL(baseURL: string): string {
  return baseURL.trim().replace(/\/+$/, '');
}

export function loadAiSettings(): AiSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_AI_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AiSettings>;
    return {
      ...DEFAULT_AI_SETTINGS,
      ...parsed,
      baseURL: normalizeBaseURL(parsed.baseURL || DEFAULT_AI_SETTINGS.baseURL),
      apiKey: parsed.apiKey || '',
      modelId: parsed.modelId || DEFAULT_AI_SETTINGS.modelId,
      includeUsage: parsed.includeUsage ?? true,
    };
  } catch {
    return { ...DEFAULT_AI_SETTINGS };
  }
}

export function saveAiSettings(settings: AiSettings): AiSettings {
  const normalized: AiSettings = {
    ...settings,
    baseURL: normalizeBaseURL(settings.baseURL),
    apiKey: settings.apiKey.trim(),
    modelId: settings.modelId.trim(),
  };
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
  return normalized;
}

export function hasUsableAiSettings(settings: AiSettings): boolean {
  return Boolean(settings.baseURL && settings.apiKey && settings.modelId);
}

export function parseModelConfigText(text: string): Partial<AiSettings> {
  const values: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/i);
    if (!match) continue;
    values[match[1].toUpperCase()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }

  return {
    baseURL: values.OPENAI_API_URL,
    apiKey: values.OPENAI_API_KEY,
    modelId: values.MODEL_ID,
  };
}

export function maskApiKey(apiKey: string): string {
  if (!apiKey) return '';
  if (apiKey.length <= 8) return '********';
  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}

export async function checkModelConnection(settings: AiSettings): Promise<{
  ok: boolean;
  message: string;
  checkedAt?: string;
}> {
  const baseURL = normalizeBaseURL(settings.baseURL);
  const modelId = settings.modelId.trim();
  try {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
        stream: false,
      }),
    });
    if (!response.ok) {
      return {
        ok: false,
        message: `模型连接失败：HTTP ${response.status}${modelId ? `（model: ${modelId}）` : ''}`,
      };
    }
    const checkedAt = new Date().toISOString();
    return {
      ok: true,
      checkedAt,
      message: `模型连接和浏览器 CORS 检查通过。`,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof TypeError
          ? '浏览器无法直连该模型接口，通常是 CORS 或网络限制。'
          : `模型连接失败：${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
