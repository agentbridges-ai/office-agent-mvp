import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText, streamText, stepCountIs } from 'ai';
import type { ModelMessage } from 'ai';
import { createExcelTools } from './excel-tools';
import { createFileTools, type RuntimeTextFile, type TextFileRuntime } from './file-tools';
import type { AiSettings, OperationLogger, ToolResult } from './types';
import { normalizeBaseURL } from './settings';
import type { ToolApprovalRuntime } from './approval';

export type ChatToolStatus = 'running' | 'ok' | 'error' | 'unsupported';
export type ReasoningEffort = 'auto' | 'low' | 'medium' | 'high';

export interface ChatToolCall {
  id: string;
  name: string;
  status: ChatToolStatus;
  input?: unknown;
  inputText?: string;
  output?: unknown;
  error?: string;
  operationLogId?: string;
  startedAt: string;
  finishedAt?: string;
  expanded?: boolean;
}

export type ChatTurnPart =
  | {
      id: string;
      type: 'text';
      content: string;
    }
  | {
      id: string;
      type: 'thinking';
      content: string;
      streaming?: boolean;
      expanded?: boolean;
      waiting?: boolean;
    }
  | {
      id: string;
      type: 'loading';
      streaming?: boolean;
    }
  | {
      id: string;
      type: 'tool';
      toolId: string;
    };

export interface PendingPlan {
  id: string;
  originalUserText: string;
  displayText: string;
  steps: string[];
  risks?: string[];
  thinking?: string;
  createdAt: string;
  status?: 'pending' | 'approved' | 'dismissed';
}

export interface PendingQuestion {
  id: string;
  originalUserText: string;
  displayText: string;
  question: string;
  options?: string[];
  selectionMode?: 'single' | 'multiple';
  createdAt: string;
  status?: 'pending' | 'answered' | 'dismissed';
}

export interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  displayContent?: string;
  thinking?: string;
  parts?: ChatTurnPart[];
  attachments?: RuntimeTextFile[];
  usage?: unknown;
  createdAt: string;
  streaming?: boolean;
  tools?: ChatToolCall[];
  toolsExpanded?: boolean;
  pendingPlan?: PendingPlan;
  pendingQuestion?: PendingQuestion;
}

export interface RunAgentOptions {
  settings: AiSettings;
  turns: ChatTurn[];
  userText: string;
  log: OperationLogger;
  fileRuntime?: TextFileRuntime;
  approvalRuntime?: ToolApprovalRuntime;
  reasoningEffort?: ReasoningEffort;
  abortSignal?: AbortSignal;
  onTextDelta?: (delta: string) => void;
  onReasoningStart?: () => void;
  onReasoningDelta?: (delta: string) => void;
  onReasoningEnd?: () => void;
  onToolEvent?: (tool: ChatToolCall) => void;
}

const BASE_SYSTEM_PROMPT = `你是浏览器内 Excel Office-Agent。
你通过工具直接读取和修改当前 ONLYOFFICE 电子表格。
优先使用 excel_get_context 理解当前工作簿、工作表或选区；需要确认接口能力时使用 excel_capabilities。
执行修改时使用 excel_call 或 excel_batch。工具结果中的 unsupported 是可信边界，请解释替代方案，不要假装已经完成。
所有当前 ONLYOFFICE runtime 暴露的 Office API 都可通过 office_api_catalog / office_api_call 使用。为了节省上下文，必须按渐进式披露查询：先 office_api_catalog view="overview"，再按 category/object/search/detail 缩小范围。优先使用稳定的 excel_* 工具；当 excel_* 没有覆盖或用户需要底层 ONLYOFFICE API 时，再调用 office_api_call。
用户上传的文本文件不会直接放进上下文；需要读取文件时使用 read_file。优先用 metadata 查看文件列表和行数，用 search 定位相关内容，再用 read 按 startLine/lineCount 分页读取；不要一次请求整份大文件。
需要生成或导出文本文件时使用 write_file，并在回答中说明生成的文件名和用途；不要把大段文件内容直接粘贴到聊天中。
常用调用约定：
- 写值：objectName="Excel.Range", memberName="values", memberKind="property", target.address="A1:B2", args.values=[[...]]
- 写公式：objectName="Excel.Range", memberName="formulas", memberKind="property", args.formulas=[["=SUM(A1:A3)"]]
- 基础格式：objectName="Excel.Range Font"/"Excel.Range Fill", memberName="bold"/"color"/"size", memberKind="property", args.value=true 或 "#1f6feb"
- 单元格对齐：objectName="Excel.Range Format", memberName="horizontalAlignment"/"verticalAlignment", memberKind="property", args.value="left|center|right" 或 "top|center|bottom"；也可以用 objectName="Excel.Range", memberName="format", args.format.horizontalAlignment="center"。
- 新增工作表：objectName="Excel.Worksheet Collection", memberName="add", memberKind="method", args.name="SheetName"
写公式时使用 Excel/ONLYOFFICE 常规公式语法，保留用户原有表格结构，除非用户明确要求重排。
不要用前导空格、尾随空格或填充字符来模拟单元格对齐；对齐必须通过格式工具设置，原始单元格值应保持为真实数据。
回答保持简洁，说明已完成的实际改动、失败的操作及原因。
非必要不要添加 emoji；只有用户明确要求、原文需要保留，或 emoji 本身是任务内容时才使用。
当你实际修改了单元格或区域时，只输出与本次任务最关键的变更位置，不要罗列所有工具调用区域。使用 Markdown 锚点格式 [简短说明 工作表!区域](excel:工作表!区域)，并在锚点旁附上一句相关说明；如果只是读取、解释或没有关键修改位置，则不要输出锚点。`;

function createSystemPrompt(options: { approvalEnabled: boolean }): string {
  const executionPolicy = options.approvalEnabled
    ? '当前开启了工具审批：你仍然按需调用工具，浏览器会在敏感写入工具真正执行前暂停并等待用户批准。'
    : '用户已经选择“全部自动执行”，无需再次请求确认。';
  return `${BASE_SYSTEM_PROMPT}\n${executionPolicy}`;
}

type AgentStreamPart = {
  type: string;
  id?: unknown;
  toolCallId?: unknown;
  toolName?: unknown;
  input?: unknown;
  output?: unknown;
  error?: unknown;
  text?: unknown;
  delta?: unknown;
  reason?: unknown;
  totalUsage?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

const OPENAI_COMPATIBLE_PROVIDER_OPTIONS_KEY = 'browserOpenaiCompatible';

function isDeepSeekRequest(settings: AiSettings): boolean {
  return /\bdeepseek\b/i.test(`${settings.baseURL} ${settings.modelId}`);
}

function getReasoningProviderOptions(
  settings: AiSettings,
  reasoningEffort?: ReasoningEffort,
): Record<string, Record<string, any>> | undefined {
  const options: Record<string, unknown> = {};
  if (isDeepSeekRequest(settings)) {
    if (!reasoningEffort || reasoningEffort === 'auto') {
      options.thinking = { type: 'disabled' };
    } else {
      options.thinking = { type: 'enabled' };
      options.reasoningEffort = reasoningEffort;
    }
  } else if (reasoningEffort && reasoningEffort !== 'auto') {
    options.reasoningEffort = reasoningEffort;
  }

  if (!Object.keys(options).length) return undefined;
  return {
    [OPENAI_COMPATIBLE_PROVIDER_OPTIONS_KEY]: options,
  };
}

function stringifyError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function getStreamToolId(part: AgentStreamPart): string | undefined {
  return asString(part.toolCallId) || asString(part.id);
}

function getToolResultStatus(output: unknown): ChatToolStatus {
  const result = asRecord(output) as ToolResult | undefined;
  if (!result || typeof result.ok !== 'boolean') return 'ok';
  if (result.ok) return 'ok';
  return result.supportLevel === 'unsupported' ? 'unsupported' : 'error';
}

function getToolResultError(output: unknown): string | undefined {
  const result = asRecord(output) as ToolResult | undefined;
  return typeof result?.error === 'string' ? result.error : undefined;
}

function getOperationLogId(output: unknown): string | undefined {
  const result = asRecord(output) as ToolResult | undefined;
  return typeof result?.operationLogId === 'string' ? result.operationLogId : undefined;
}

function createAbortError(reason?: string): Error {
  if (typeof DOMException !== 'undefined') {
    return new DOMException(reason || 'The request was aborted.', 'AbortError');
  }
  const error = new Error(reason || 'The request was aborted.');
  error.name = 'AbortError';
  return error;
}

export async function runExcelAgent(options: RunAgentOptions): Promise<{
  text: string;
  usage?: unknown;
}> {
  const provider = createOpenAICompatible({
    name: 'browser-openai-compatible',
    baseURL: normalizeBaseURL(options.settings.baseURL),
    apiKey: options.settings.apiKey,
    includeUsage: options.settings.includeUsage,
  });

  const history: ModelMessage[] = options.turns.slice(-12).map((turn) => ({
    role: turn.role,
    content: turn.content,
  }));

  const toolCalls = new Map<string, ChatToolCall>();
  const rawInputs = new Map<string, string>();

  function emitTool(
    id: string,
    patch: Partial<Omit<ChatToolCall, 'id' | 'startedAt'>> & { name?: string },
  ): void {
    const previous = toolCalls.get(id);
    const next: ChatToolCall = {
      id,
      name: patch.name || previous?.name || 'tool',
      status: patch.status || previous?.status || 'running',
      input: patch.input ?? previous?.input,
      inputText: patch.inputText ?? previous?.inputText,
      output: patch.output ?? previous?.output,
      error: patch.error ?? previous?.error,
      operationLogId: patch.operationLogId ?? previous?.operationLogId,
      startedAt: previous?.startedAt || new Date().toISOString(),
      finishedAt: patch.finishedAt ?? previous?.finishedAt,
      expanded: patch.expanded ?? previous?.expanded,
    };
    if (!next.finishedAt && next.status !== 'running') {
      next.finishedAt = new Date().toISOString();
    }
    toolCalls.set(id, next);
    options.onToolEvent?.({ ...next });
  }

  const providerOptions = getReasoningProviderOptions(options.settings, options.reasoningEffort);
  const result = streamText({
    model: provider.chatModel(options.settings.modelId),
    system: createSystemPrompt({ approvalEnabled: Boolean(options.approvalRuntime) }),
    messages: [...history, { role: 'user', content: options.userText }],
    tools: {
      ...createExcelTools(options.log, options.approvalRuntime),
      ...(options.fileRuntime ? createFileTools(options.fileRuntime, options.log, options.approvalRuntime) : {}),
    },
    stopWhen: stepCountIs(8),
    temperature: 0.1,
    ...(providerOptions ? { providerOptions } : {}),
    abortSignal: options.abortSignal,
  });

  let text = '';
  let usage: unknown;
  let streamError: string | undefined;
  let aborted = false;

  for await (const part of result.fullStream as AsyncIterable<AgentStreamPart>) {
    switch (part.type) {
      case 'text-delta': {
        const delta = asString(part.text) || asString(part.delta) || '';
        if (!delta) break;
        text += delta;
        options.onTextDelta?.(delta);
        break;
      }
      case 'reasoning-start': {
        options.onReasoningStart?.();
        break;
      }
      case 'reasoning-delta': {
        const delta = asString(part.text) || asString(part.delta) || '';
        if (!delta) break;
        options.onReasoningDelta?.(delta);
        break;
      }
      case 'reasoning-end': {
        options.onReasoningEnd?.();
        break;
      }
      case 'tool-input-start': {
        const id = getStreamToolId(part);
        if (!id) break;
        emitTool(id, {
          name: asString(part.toolName),
          status: 'running',
          inputText: '',
          expanded: true,
        });
        break;
      }
      case 'tool-input-delta': {
        const id = getStreamToolId(part);
        if (!id) break;
        const nextInput = `${rawInputs.get(id) || ''}${asString(part.delta) || ''}`;
        rawInputs.set(id, nextInput);
        emitTool(id, { inputText: nextInput, status: 'running' });
        break;
      }
      case 'tool-call': {
        const id = getStreamToolId(part);
        if (!id) break;
        emitTool(id, {
          name: asString(part.toolName),
          status: 'running',
          input: part.input,
          inputText: rawInputs.get(id),
          expanded: true,
        });
        break;
      }
      case 'tool-result': {
        const id = getStreamToolId(part);
        if (!id) break;
        const status = getToolResultStatus(part.output);
        emitTool(id, {
          name: asString(part.toolName),
          status,
          input: part.input,
          output: part.output,
          error: getToolResultError(part.output),
          operationLogId: getOperationLogId(part.output),
          expanded: status !== 'ok' ? true : undefined,
        });
        break;
      }
      case 'tool-error': {
        const id = getStreamToolId(part);
        if (!id) break;
        emitTool(id, {
          name: asString(part.toolName),
          status: 'error',
          input: part.input,
          error: stringifyError(part.error),
          expanded: true,
        });
        break;
      }
      case 'tool-output-denied':
      case 'tool-approval-request': {
        const id = getStreamToolId(part);
        if (!id) break;
        emitTool(id, {
          name: asString(part.toolName),
          status: 'error',
          error: 'The model requested a tool flow that this browser agent does not support.',
          expanded: true,
        });
        break;
      }
      case 'finish': {
        usage = part.totalUsage;
        break;
      }
      case 'abort': {
        aborted = true;
        throw createAbortError(asString(part.reason));
      }
      case 'error': {
        streamError = stringifyError(part.error);
        break;
      }
      default:
        break;
    }
  }

  if (streamError) {
    throw new Error(streamError);
  }
  if (aborted) {
    throw createAbortError();
  }
  if (!usage) {
    try {
      usage = await result.totalUsage;
    } catch {
      usage = undefined;
    }
  }

  return {
    text: text || '已完成。',
    usage,
  };
}

function extractJsonObject(text: string): Record<string, unknown> | undefined {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const candidates = [trimmed];
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) candidates.push(trimmed.slice(start, end + 1));
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      return asRecord(parsed);
    } catch {
      // Try the next candidate.
    }
  }
  return undefined;
}

function compactTranscript(turns: ChatTurn[], limit = 6): string {
  return turns
    .slice(-limit)
    .map((turn) => {
      const role = turn.role === 'user' ? '用户' : '助手';
      const content = (turn.displayContent || turn.content || '').replace(/\s+/g, ' ').trim();
      return content ? `${role}: ${content.slice(0, 500)}` : '';
    })
    .filter(Boolean)
    .join('\n');
}

function getStringArray(value: unknown, maxItems: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, maxItems);
}

function extractThinkingBlock(text: string): { text: string; thinking?: string } {
  const thoughts: string[] = [];
  const cleaned = text.replace(/<think(?:ing)?>([\s\S]*?)<\/think(?:ing)?>/gi, (_match, thought: string) => {
    const trimmed = thought.trim();
    if (trimmed) thoughts.push(trimmed);
    return '';
  });
  return {
    text: cleaned.trim(),
    ...(thoughts.length ? { thinking: thoughts.join('\n\n') } : {}),
  };
}

function parsePlanStepsFromText(text: string): string[] {
  const { text: cleanText } = extractThinkingBlock(text);
  return cleanText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .split(/\n+/)
    .map((line) =>
      line
        .replace(/^\s*(?:[-*•]|\d+[.)]|步骤\s*\d+[：:、-]?)\s*/i, '')
        .trim(),
    )
    .filter((line) => line && !/^(执行计划|计划|steps?|risks?)[:：]?$/i.test(line))
    .slice(0, 6);
}

export async function proposeExecutionPlan(
  settings: AiSettings,
  turns: ChatTurn[],
  userText: string,
  reasoningEffort?: ReasoningEffort,
): Promise<{ steps: string[]; risks?: string[]; thinking?: string }> {
  const provider = createOpenAICompatible({
    name: 'browser-openai-compatible',
    baseURL: normalizeBaseURL(settings.baseURL),
    apiKey: settings.apiKey,
    includeUsage: false,
  });
  const providerOptions = getReasoningProviderOptions(settings, reasoningEffort);
  const result = await generateText({
    model: provider.chatModel(settings.modelId),
    system:
      '你只负责为浏览器 Excel Agent 编写等待用户批准的执行计划，不调用工具，不执行修改。最终响应必须只输出 JSON，不要 Markdown、emoji 或解释。',
    prompt: `请先根据最近会话和用户请求推理需要做什么，再给出具体、非模板化、可执行的 Excel 操作计划。JSON 结构为 {"steps":["..."],"risks":["..."]}，steps 2-6 条，risks 可为空。每条步骤必须贴合用户这次请求，不要输出“理解当前工作簿”“按用户要求执行”这类泛化占位文本。\n\n最近会话：\n${compactTranscript(turns)}\n\n用户请求：\n${userText}`,
    maxOutputTokens: 520,
    temperature: 0.1,
    ...(providerOptions ? { providerOptions } : {}),
  });
  const extracted = extractThinkingBlock(result.text);
  const parsed = extractJsonObject(extracted.text);
  const steps = getStringArray(parsed?.steps, 6);
  const risks = getStringArray(parsed?.risks, 4);
  const thinking =
    result.reasoningText?.trim() ||
    (typeof parsed?.thinking === 'string' ? parsed.thinking.trim() : '') ||
    extracted.thinking;
  const fallbackSteps = steps.length ? steps : parsePlanStepsFromText(extracted.text);
  if (!fallbackSteps.length) {
    throw new Error('模型没有返回可展示的执行计划。');
  }
  return {
    steps: fallbackSteps,
    ...(risks.length ? { risks } : {}),
    ...(thinking ? { thinking } : {}),
  };
}

export async function maybeAskUserQuestion(
  settings: AiSettings,
  turns: ChatTurn[],
  userText: string,
): Promise<{ question: string; options?: string[]; selectionMode?: 'single' | 'multiple' } | undefined> {
  const provider = createOpenAICompatible({
    name: 'browser-openai-compatible',
    baseURL: normalizeBaseURL(settings.baseURL),
    apiKey: settings.apiKey,
    includeUsage: false,
  });
  const result = await generateText({
    model: provider.chatModel(settings.modelId),
    system:
      '你只判断是否需要向用户澄清问题。只有缺少关键信息且继续执行可能改错表格时才提问。只输出 JSON，不要 Markdown、emoji 或解释。',
    prompt: `如果必须澄清，输出 {"question":"...","options":["..."],"selectionMode":"single"} 或 {"question":"...","options":["..."],"selectionMode":"multiple"}；如果可以直接继续，输出 {"question":null}。只有多个选项可以同时成立时才使用 multiple，否则使用 single。options 最多 5 个，也可以为空。\n\n最近会话：\n${compactTranscript(turns)}\n\n用户请求：\n${userText}`,
    maxOutputTokens: 300,
    temperature: 0,
  });
  const parsed = extractJsonObject(result.text);
  const question = typeof parsed?.question === 'string' ? parsed.question.trim() : '';
  if (!question) return undefined;
  const options = getStringArray(parsed?.options, 5);
  const rawMode = typeof parsed?.selectionMode === 'string' ? parsed.selectionMode : '';
  const selectionMode = rawMode === 'multiple' ? 'multiple' : 'single';
  return {
    question,
    ...(options.length ? { options } : {}),
    selectionMode,
  };
}

export async function summarizeSessionTitle(settings: AiSettings, turns: ChatTurn[]): Promise<string> {
  const provider = createOpenAICompatible({
    name: 'browser-openai-compatible',
    baseURL: normalizeBaseURL(settings.baseURL),
    apiKey: settings.apiKey,
    includeUsage: false,
  });
  const transcript = turns
    .slice(0, 8)
    .map((turn) => {
      const role = turn.role === 'user' ? '用户' : '助手';
      const content = (turn.displayContent || turn.content || '').replace(/\s+/g, ' ').trim();
      return content ? `${role}: ${content.slice(0, 600)}` : '';
    })
    .filter(Boolean)
    .join('\n');
  if (!transcript) return '';
  const result = await generateText({
    model: provider.chatModel(settings.modelId),
    system:
      '你只负责为 Excel Office-Agent 会话生成短标题。输出 4 到 16 个中文字符或短语，不要引号、标点、emoji、编号、解释。',
    prompt: `请根据下面会话生成一个简短标题：\n${transcript}`,
    maxOutputTokens: 24,
    temperature: 0.1,
  });
  return sanitizeSessionTitle(result.text);
}

function sanitizeSessionTitle(value: string): string {
  return value
    .replace(/^["'“”‘’\s]+|["'“”‘’\s]+$/g, '')
    .replace(/^[#*\-\d.、\s]+/, '')
    .replace(/\s+/g, ' ')
    .slice(0, 24)
    .trim();
}
