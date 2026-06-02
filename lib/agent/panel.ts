import {
  maybeAskUserQuestion,
  runExcelAgent,
  summarizeSessionTitle,
  type ChatToolCall,
  type ChatTurn,
  type ChatTurnPart,
  type PendingQuestion,
  type ReasoningEffort,
} from './agent';
import { excelBridge } from './bridge';
import { executeExcelCall, executeExcelGetContext } from './excel-tools';
import { createTextFileRuntime, type RuntimeTextFile } from './file-tools';
import { operationLogStore } from './operation-log';
import {
  checkModelConnection,
  hasUsableAiSettings,
  loadAiSettings,
  saveAiSettings,
} from './settings';
import type { AiSettings } from './types';
import type { ToolApprovalInput, ToolApprovalRuntime } from './approval';
import { createGeistIcon, type GeistIconName } from '../geist-icons';
import {
  createWorkbookCheckpoint,
  deleteWorkbookCheckpoint,
  listWorkbookCheckpoints,
  restoreWorkbookCheckpoint,
  type WorkbookCheckpoint,
} from '../checkpoints';

interface ChatSession {
  id: string;
  title: string;
  turns: ChatTurn[];
  createdAt: string;
  updatedAt: string;
}

interface PanelState {
  settings: AiSettings;
  behavior: AgentBehaviorSettings;
  sessions: ChatSession[];
  currentSessionId: string;
  turns: ChatTurn[];
  abortController?: AbortController;
  busy: boolean;
  checkpointBusy: boolean;
  sheets: string[];
  activeSheetName?: string;
}

interface AgentBehaviorSettings {
  toolApproval: boolean;
  reasoningEffort: ReasoningEffort;
}

interface PendingTextFile {
  id: string;
  fileId: string;
  name: string;
  size: number;
  lineCount: number;
}

interface ExcelAnchor {
  sheetName?: string;
  address: string;
  label: string;
}

interface PendingApprovalRequest extends ToolApprovalInput {
  id: string;
  createdAt: string;
  resolve: (approved: boolean) => void;
}

interface SendMessageOptions {
  skipQuestion?: boolean;
  displayTextOverride?: string;
}

const CHAT_SESSIONS_STORAGE_KEY = 'office-agent.chat-sessions.v1';
const BEHAVIOR_SETTINGS_STORAGE_KEY = 'office-agent.behavior-settings.v1';
const DEFAULT_SESSION_TITLE = '新聊天';
const TOKEN_METER_LIMIT = 1_000_000;
const TEXT_UPLOAD_EXTENSIONS = new Set([
  'txt',
  'md',
  'markdown',
  'csv',
  'tsv',
  'json',
  'jsonl',
  'yaml',
  'yml',
  'xml',
  'html',
  'css',
  'js',
  'jsx',
  'ts',
  'tsx',
  'log',
  'ini',
  'sql',
]);

function createButton(label: string, title: string, className = 'agent-icon-button'): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.title = title;
  button.className = className;
  return button;
}

function createIconButton(
  iconName: GeistIconName,
  title: string,
  className = 'agent-icon-button',
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.title = title;
  button.setAttribute('aria-label', title);
  button.className = className;
  button.appendChild(createGeistIcon(iconName));
  return button;
}

function createChatTurn(role: ChatTurn['role'], content: string): ChatTurn {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

function createChatSession(title = DEFAULT_SESSION_TITLE, turns: ChatTurn[] = []): ChatSession {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title,
    turns,
    createdAt: now,
    updatedAt: now,
  };
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined;
}

function isChatTurn(value: unknown): value is ChatTurn {
  const record = asRecord(value);
  return (
    !!record &&
    (record.role === 'user' || record.role === 'assistant') &&
    typeof record.content === 'string' &&
    typeof record.createdAt === 'string' &&
    typeof record.id === 'string'
  );
}

function loadChatSessions(): ChatSession[] {
  try {
    const raw = window.localStorage.getItem(CHAT_SESSIONS_STORAGE_KEY);
    if (!raw) return [createChatSession()];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [createChatSession()];
    const sessions = parsed
      .map((item): ChatSession | undefined => {
        const record = asRecord(item);
        if (!record || typeof record.id !== 'string') return undefined;
        const turns = Array.isArray(record.turns) ? record.turns.filter(isChatTurn) : [];
        return {
          id: record.id,
          title: typeof record.title === 'string' && record.title.trim() ? record.title : DEFAULT_SESSION_TITLE,
          turns,
          createdAt: typeof record.createdAt === 'string' ? record.createdAt : new Date().toISOString(),
          updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : new Date().toISOString(),
        };
      })
      .filter((session): session is ChatSession => !!session)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return sessions.length ? sessions : [createChatSession()];
  } catch {
    return [createChatSession()];
  }
}

function saveChatSessions(sessions: ChatSession[]): void {
  try {
    window.localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, JSON.stringify(sessions.slice(0, 24)));
  } catch {
    // Chat history is a convenience layer; the agent remains usable without localStorage.
  }
}

function loadBehaviorSettings(): AgentBehaviorSettings {
  const defaults: AgentBehaviorSettings = {
    toolApproval: false,
    reasoningEffort: 'auto',
  };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(BEHAVIOR_SETTINGS_STORAGE_KEY) || '{}') as unknown;
    const record = asRecord(parsed);
    if (!record) return defaults;
    return {
      toolApproval: false,
      reasoningEffort:
        record.reasoningEffort === 'low' || record.reasoningEffort === 'medium' || record.reasoningEffort === 'high'
          ? record.reasoningEffort
          : defaults.reasoningEffort,
    };
  } catch {
    return defaults;
  }
}

function saveBehaviorSettings(settings: AgentBehaviorSettings): AgentBehaviorSettings {
  try {
    window.localStorage.setItem(BEHAVIOR_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Behavior switches are optional local preferences.
  }
  return settings;
}

function compactLine(value: string, max = 88): string {
  const line = value.replace(/\s+/g, ' ').trim();
  return line.length > max ? `${line.slice(0, max - 1)}…` : line;
}

async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
  } finally {
    textarea.remove();
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function estimateTokens(text: string): number {
  const cjk = text.match(/[\u3400-\u9fff]/g)?.length || 0;
  const rest = Math.max(0, text.length - cjk);
  return Math.ceil(cjk * 1.15 + rest / 4);
}

function numericField(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
}

function getUsageTotalTokens(usage: unknown): number | undefined {
  const record = asRecord(usage);
  if (!record) return undefined;
  const direct = numericField(record, ['totalTokens', 'total_tokens', 'totalUsage', 'total_usage']);
  if (direct !== undefined) return direct;
  const input = numericField(record, ['inputTokens', 'input_tokens', 'promptTokens', 'prompt_tokens']);
  const output = numericField(record, ['outputTokens', 'output_tokens', 'completionTokens', 'completion_tokens']);
  return input !== undefined || output !== undefined ? (input || 0) + (output || 0) : undefined;
}

function formatTokenCount(tokens: number): string {
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(tokens >= 10_000 ? 0 : 1)}k`;
  return String(tokens);
}

function formatTokenDetailCount(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(2)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(tokens >= 10_000 ? 0 : 1)}K`;
  return String(tokens);
}

function formatTokenPercent(value: number): string {
  const percent = value * 100;
  if (percent > 0 && percent < 0.1) return '<0.1%';
  return `${percent.toFixed(percent >= 10 ? 0 : 1)}%`;
}

function isTextFile(file: File): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return file.type.startsWith('text/') || file.type === 'application/json' || TEXT_UPLOAD_EXTENSIONS.has(extension);
}

function formatSessionTime(value: string): string {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return '';
  const days = Math.floor((Date.now() - time) / 86_400_000);
  if (days <= 0) return '今天';
  if (days === 1) return '昨天';
  if (days === 2) return '前天';
  if (days < 7) return `${days} 天前`;
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(new Date(time));
}

function formatCheckpointTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function stripSheetPrefix(address: string): string {
  const bang = address.lastIndexOf('!');
  return (bang >= 0 ? address.slice(bang + 1) : address).replace(/\$/g, '').replace(/^'|'$/g, '');
}

function formatSelectionAddress(address?: string): string {
  const clean = stripSheetPrefix(address || '').trim().toUpperCase();
  if (!clean) return 'selection';
  const columns = clean.match(/^([A-Z]+):([A-Z]+)$/i);
  if (columns) {
    const start = columns[1];
    const end = columns[2];
    return start === end ? `Col ${start}` : `Cols ${start}:${end}`;
  }
  const rows = clean.match(/^(\d+):(\d+)$/);
  if (rows) {
    return rows[1] === rows[2] ? `Row ${rows[1]}` : `Rows ${rows[1]}:${rows[2]}`;
  }
  const fullColumns = clean.match(/^([A-Z]+)1:([A-Z]+)1048576$/);
  if (fullColumns) {
    return fullColumns[1] === fullColumns[2]
      ? `Col ${fullColumns[1]}`
      : `Cols ${fullColumns[1]}:${fullColumns[2]}`;
  }
  const fullRows = clean.match(/^A(\d+):XFD(\d+)$/);
  if (fullRows) {
    return fullRows[1] === fullRows[2] ? `Row ${fullRows[1]}` : `Rows ${fullRows[1]}:${fullRows[2]}`;
  }
  return clean.toUpperCase();
}

function normalizeExcelAddress(address?: string): string {
  return stripSheetPrefix(address || '').trim().replace(/\$/g, '');
}

function extractSheetNames(result: unknown): string[] {
  const record = asRecord(result);
  const sheets = record?.sheets;
  if (!Array.isArray(sheets)) return [];
  return sheets
    .map((sheet) => {
      if (typeof sheet === 'string') return sheet;
      const sheetRecord = asRecord(sheet);
      return typeof sheetRecord?.name === 'string' ? sheetRecord.name : '';
    })
    .filter((sheet) => sheet.length > 0);
}

function compactJson(value: unknown, max = 1600): string {
  let text: string;
  if (typeof value === 'string') {
    text = value;
  } else {
    try {
      text = JSON.stringify(value, null, 2);
    } catch {
      text = String(value);
    }
  }
  return text.length > max ? `${text.slice(0, max)}\n…` : text;
}

function formatDuration(startAt: string, endAt?: string): string {
  const start = new Date(startAt).getTime();
  const end = endAt ? new Date(endAt).getTime() : Date.now();
  const seconds = Math.max(0, Math.round((end - start) / 1000));
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function formatToolName(name: string): string {
  const labels: Record<string, string> = {
    excel_get_context: '读取上下文',
    excel_call: '执行 Excel',
    excel_batch: '批量执行',
    excel_capabilities: '查询能力',
    office_api_catalog: 'Office API 目录',
    office_api_call: '调用 Office API',
    read_file: '读取文件',
    write_file: '写入文件',
  };
  return labels[name] || name;
}

function formatTarget(input: Record<string, unknown>): string {
  const target = asRecord(input.target);
  if (!target) return '';
  const sheetName = typeof target.sheetName === 'string' ? target.sheetName : '';
  const address = typeof target.address === 'string' ? target.address : '';
  if (sheetName && address) return `${sheetName}!${address}`;
  return address || sheetName;
}

function summarizeToolInput(tool: ChatToolCall): string {
  const input = asRecord(tool.input);
  if (!input) return tool.inputText ? compactLine(tool.inputText) : '';
  if (tool.name === 'excel_call') {
    const objectName = typeof input.objectName === 'string' ? input.objectName : 'Excel';
    const memberName = typeof input.memberName === 'string' ? input.memberName : 'call';
    const target = formatTarget(input);
    return compactLine(`${objectName}.${memberName}${target ? ` · ${target}` : ''}`);
  }
  if (tool.name === 'excel_batch') {
    const calls = Array.isArray(input.calls) ? input.calls.length : 0;
    return `${calls || '多'} 次操作`;
  }
  if (tool.name === 'excel_get_context') {
    const scope = typeof input.scope === 'string' ? input.scope : 'context';
    const target = formatTarget(input);
    return compactLine(`${scope}${target ? ` · ${target}` : ''}`);
  }
  if (tool.name === 'excel_capabilities') {
    return compactLine(
      [input.objectName, input.memberName, input.query, input.supportLevel]
        .filter((part): part is string => typeof part === 'string' && part.length > 0)
        .join(' ') || 'capabilities',
    );
  }
  if (tool.name === 'office_api_catalog') {
    return compactLine(
      [input.view, input.category, input.subcategory, input.objectType, input.query]
        .filter((part): part is string => typeof part === 'string' && part.length > 0)
        .join(' ') || 'overview',
    );
  }
  if (tool.name === 'office_api_call') {
    const target = asRecord(input.target);
    const root = typeof target?.root === 'string' ? target.root : 'editor';
    const memberName = typeof input.memberName === 'string' ? input.memberName : 'call';
    return compactLine(`${root}.${memberName}`);
  }
  if (tool.name === 'read_file') {
    const mode = typeof input.mode === 'string' ? input.mode : input.query ? 'search' : 'read';
    const file = typeof input.fileName === 'string' ? input.fileName : typeof input.fileId === 'string' ? input.fileId : 'files';
    const range = typeof input.startLine === 'number' ? `L${input.startLine}` : '';
    return compactLine([mode, file, input.query, range].filter(Boolean).join(' · '));
  }
  if (tool.name === 'write_file') {
    return compactLine(typeof input.fileName === 'string' ? input.fileName : 'output file');
  }
  return compactLine(compactJson(input, 240), 88);
}

function getLatestToolFinishAt(tools: ChatToolCall[]): string | undefined {
  return tools
    .map((tool) => tool.finishedAt)
    .filter((value): value is string => typeof value === 'string')
    .sort()
    .at(-1);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function highlightJson(value: string): string {
  const tokenPattern =
    /("(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"\s*:?)|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
  let html = '';
  let index = 0;
  value.replace(tokenPattern, (match, _string, _boolean, offset: number) => {
    html += escapeHtml(value.slice(index, offset));
    const className = match.endsWith(':')
      ? 'json-key'
      : /^"/.test(match)
        ? 'json-string'
        : match === 'true' || match === 'false'
          ? 'json-boolean'
          : match === 'null'
            ? 'json-null'
            : 'json-number';
    html += `<span class="${className}">${escapeHtml(match)}</span>`;
    index = offset + match.length;
    return match;
  });
  html += escapeHtml(value.slice(index));
  return html;
}

function parseExcelHref(href: string): Omit<ExcelAnchor, 'label'> | undefined {
  const clean = href.trim().replace(/^excel:\/\//i, '').replace(/^excel:/i, '');
  let decoded = clean;
  try {
    decoded = decodeURIComponent(clean);
  } catch {
    decoded = clean;
  }
  const bang = decoded.lastIndexOf('!');
  if (bang >= 0) {
    const sheetName = decoded.slice(0, bang).replace(/^'|'$/g, '').trim();
    const address = normalizeExcelAddress(decoded.slice(bang + 1));
    return address ? { sheetName: sheetName || undefined, address } : undefined;
  }
  const slash = decoded.lastIndexOf('/');
  if (slash > 0) {
    const sheetName = decoded.slice(0, slash).trim();
    const address = normalizeExcelAddress(decoded.slice(slash + 1));
    return address ? { sheetName: sheetName || undefined, address } : undefined;
  }
  const address = normalizeExcelAddress(decoded);
  return address ? { address } : undefined;
}

function renderExcelAnchorHtml(labelHtml: string, anchor: Omit<ExcelAnchor, 'label'>): string {
  const sheetAttr = escapeHtml(anchor.sheetName || '');
  const addressAttr = escapeHtml(anchor.address);
  return `<button type="button" class="agent-excel-anchor" data-sheet="${sheetAttr}" data-address="${addressAttr}">${labelHtml}</button>`;
}

function renderInlineMarkdown(value: string): string {
  let html = escapeHtml(value);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\((excel:[^)]+)\)/gi, (match, label: string, href: string) => {
    const anchor = parseExcelHref(href);
    return anchor ? renderExcelAnchorHtml(label, anchor) : match;
  });
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
  );
  return html;
}

function isMarkdownTableSeparator(line: string): boolean {
  const cells = line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isMarkdownTableStart(lines: string[], index: number): boolean {
  return /\|/.test(lines[index] || '') && index + 1 < lines.length && isMarkdownTableSeparator(lines[index + 1]);
}

function splitMarkdownTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function appendMarkdown(container: HTMLElement, markdown: string): void {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let index = 0;

  function appendParagraph(parts: string[]): void {
    const paragraph = document.createElement('p');
    paragraph.innerHTML = renderInlineMarkdown(parts.join(' '));
    container.appendChild(paragraph);
  }

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      index += 1;
      const codeLines: string[] = [];
      while (index < lines.length && !lines[index].startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      const pre = document.createElement('pre');
      pre.className = 'agent-markdown-code';
      const code = document.createElement('code');
      code.textContent = codeLines.join('\n');
      pre.appendChild(code);
      container.appendChild(pre);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = Math.min(3, heading[1].length);
      const title = document.createElement(`h${level + 2}`);
      title.innerHTML = renderInlineMarkdown(heading[2]);
      container.appendChild(title);
      index += 1;
      continue;
    }

    if (isMarkdownTableStart(lines, index)) {
      const headers = splitMarkdownTableRow(lines[index]);
      index += 2;
      const wrapper = document.createElement('div');
      wrapper.className = 'agent-markdown-table-wrap';
      const table = document.createElement('table');
      table.className = 'agent-markdown-table';
      const thead = document.createElement('thead');
      const headRow = document.createElement('tr');
      for (const header of headers) {
        const cell = document.createElement('th');
        cell.innerHTML = renderInlineMarkdown(header);
        headRow.appendChild(cell);
      }
      thead.appendChild(headRow);
      table.appendChild(thead);
      const tbody = document.createElement('tbody');
      while (index < lines.length && /\|/.test(lines[index]) && lines[index].trim()) {
        const row = document.createElement('tr');
        const cells = splitMarkdownTableRow(lines[index]);
        for (let cellIndex = 0; cellIndex < headers.length; cellIndex += 1) {
          const cell = document.createElement('td');
          cell.innerHTML = renderInlineMarkdown(cells[cellIndex] || '');
          row.appendChild(cell);
        }
        tbody.appendChild(row);
        index += 1;
      }
      table.appendChild(tbody);
      wrapper.appendChild(table);
      container.appendChild(wrapper);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const list = document.createElement('ul');
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        const item = document.createElement('li');
        item.innerHTML = renderInlineMarkdown(lines[index].replace(/^\s*[-*]\s+/, ''));
        list.appendChild(item);
        index += 1;
      }
      container.appendChild(list);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const list = document.createElement('ol');
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        const item = document.createElement('li');
        item.innerHTML = renderInlineMarkdown(lines[index].replace(/^\s*\d+\.\s+/, ''));
        list.appendChild(item);
        index += 1;
      }
      container.appendChild(list);
      continue;
    }

    if (/^\s*>\s+/.test(line)) {
      const quote = document.createElement('blockquote');
      const quoteLines: string[] = [];
      while (index < lines.length && /^\s*>\s+/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^\s*>\s+/, ''));
        index += 1;
      }
      quote.innerHTML = renderInlineMarkdown(quoteLines.join(' '));
      container.appendChild(quote);
      continue;
    }

    const paragraphLines = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^```/.test(lines[index]) &&
      !/^(#{1,3})\s+/.test(lines[index]) &&
      !isMarkdownTableStart(lines, index) &&
      !/^\s*[-*]\s+/.test(lines[index]) &&
      !/^\s*\d+\.\s+/.test(lines[index]) &&
      !/^\s*>\s+/.test(lines[index])
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    appendParagraph(paragraphLines);
  }
}

export function createAgentPanel(): void {
  const panelRoot = document.querySelector<HTMLElement>('#agent-panel');
  if (!panelRoot) return;
  const root = panelRoot;
  const sessions = loadChatSessions();

  const state: PanelState = {
    settings: loadAiSettings(),
    behavior: loadBehaviorSettings(),
    sessions,
    currentSessionId: sessions[0].id,
    turns: sessions[0].turns,
    busy: false,
    checkpointBusy: false,
    sheets: [],
  };

  root.innerHTML = '';
  root.className = 'agent-panel';

  const header = document.createElement('header');
  header.className = 'agent-header';

  const titleBlock = document.createElement('div');
  titleBlock.className = 'agent-header-main';
  const title = document.createElement('button');
  title.type = 'button';
  title.className = 'agent-chat-tab active';
  title.textContent = state.sessions[0].title;
  titleBlock.append(title);

  const headerActions = document.createElement('div');
  headerActions.className = 'agent-header-actions';
  const newSessionButton = createIconButton('Plus', '新建会话');
  const sessionsButton = createIconButton('HistoryClock', '会话管理');
  const checkpointsButton = createIconButton('CheckpointSearch', '文件检查点');
  const settingsButton = createIconButton('SettingsGearSix', '模型设置');
  headerActions.append(newSessionButton, sessionsButton, checkpointsButton, settingsButton);
  header.append(titleBlock, headerActions);

  const sessionPopover = document.createElement('div');
  sessionPopover.className = 'agent-session-popover';
  sessionPopover.hidden = true;

  const checkpointPopover = document.createElement('div');
  checkpointPopover.className = 'agent-checkpoint-popover';
  checkpointPopover.hidden = true;

  const selectionChip = document.createElement('button');
  selectionChip.type = 'button';
  selectionChip.className = 'agent-selection-chip agent-composer-selection-chip';
  const selectionChipText = document.createElement('span');
  selectionChipText.className = 'agent-selection-chip-text';
  selectionChipText.textContent = '未连接工作簿';
  selectionChip.append(createGeistIcon('GridSquare'), selectionChipText);

  const messages = document.createElement('div');
  messages.className = 'agent-messages';

  const composer = document.createElement('form');
  composer.className = 'agent-composer';
  const composerBox = document.createElement('div');
  composerBox.className = 'agent-composer-box';
  const composerInput = document.createElement('div');
  composerInput.className = 'agent-composer-input';
  const input = document.createElement('textarea');
  input.rows = 1;
  input.placeholder = 'Enter换行，Shift+Enter发送';
  const attachmentList = document.createElement('div');
  attachmentList.className = 'agent-attachment-list';
  attachmentList.hidden = true;
  composerInput.append(selectionChip, attachmentList, input);
  const composerToolbar = document.createElement('div');
  composerToolbar.className = 'agent-composer-toolbar';
  const composerTools = document.createElement('div');
  composerTools.className = 'agent-composer-tools';
  const uploadButton = createIconButton('Plus', '上传文本文件', 'agent-composer-tool-button');
  const uploadInput = document.createElement('input');
  uploadInput.type = 'file';
  uploadInput.accept =
    '.txt,.md,.markdown,.csv,.tsv,.json,.jsonl,.yaml,.yml,.xml,.html,.css,.js,.jsx,.ts,.tsx,.log,.ini,.sql,text/*,application/json';
  uploadInput.multiple = true;
  uploadInput.className = 'agent-upload-input';
  const tokenMeter = document.createElement('div');
  tokenMeter.className = 'agent-token-meter';
  tokenMeter.dataset.usageDetail = `0.0% · 0 / ${formatTokenDetailCount(TOKEN_METER_LIMIT)} 已使用上下文`;
  tokenMeter.setAttribute('role', 'img');
  tokenMeter.setAttribute('aria-label', tokenMeter.dataset.usageDetail);
  const tokenMeterValue = document.createElement('span');
  tokenMeterValue.className = 'agent-token-meter-value';
  tokenMeterValue.textContent = '0';
  tokenMeter.appendChild(tokenMeterValue);
  const composerModes = document.createElement('div');
  composerModes.className = 'agent-composer-modes';
  const reasoningModeControl = document.createElement('label');
  reasoningModeControl.className = 'agent-reasoning-mode-control';
  reasoningModeControl.title = 'DeepSeek 默认开启 thinking；选择推理关闭时会显式发送 thinking.disabled';
  const reasoningModeSelect = document.createElement('select');
  reasoningModeSelect.className = 'agent-reasoning-mode-select';
  const reasoningOptions: Array<{ value: ReasoningEffort; label: string }> = [
    { value: 'auto', label: '推理关闭' },
    { value: 'low', label: '推理 低' },
    { value: 'medium', label: '推理 中' },
    { value: 'high', label: '推理 高' },
  ];
  for (const option of reasoningOptions) {
    const item = document.createElement('option');
    item.value = option.value;
    item.textContent = option.label;
    reasoningModeSelect.appendChild(item);
  }
  reasoningModeControl.appendChild(reasoningModeSelect);
  composerModes.appendChild(reasoningModeControl);
  composerTools.append(uploadButton, uploadInput, composerModes);
  const composerActions = document.createElement('div');
  composerActions.className = 'agent-composer-actions';
  const sendButton = createIconButton('ArrowUp', '发送', 'agent-send-button');
  sendButton.type = 'submit';
  const stopButton = createIconButton('Stop', '停止', 'agent-icon-button');
  stopButton.classList.add('agent-stop-button');
  stopButton.disabled = true;
  stopButton.hidden = true;
  composerActions.append(tokenMeter, sendButton, stopButton);
  composerToolbar.append(composerTools, composerActions);
  composerBox.append(composerInput, composerToolbar);
  const approvalDock = document.createElement('div');
  approvalDock.className = 'agent-approval-dock';
  approvalDock.hidden = true;
  const sheetPopover = document.createElement('div');
  sheetPopover.className = 'agent-sheet-popover';
  sheetPopover.hidden = true;
  composer.append(approvalDock, composerBox, sheetPopover);

  root.append(header, sessionPopover, checkpointPopover, messages, composer);

  const fileRuntime = createTextFileRuntime();
  let messagesRenderTimer: number | undefined;
  let busyTicker: number | undefined;
  let pendingTextFiles: PendingTextFile[] = [];
  let pendingApprovalRequests: PendingApprovalRequest[] = [];
  let editingSessionId: string | undefined;
  let checkpoints: WorkbookCheckpoint[] = [];
  const titleGenerationSessionIds = new Set<string>();

  function updateBehaviorControls(): void {
    reasoningModeSelect.value = state.behavior.reasoningEffort;
    reasoningModeControl.dataset.mode = state.behavior.reasoningEffort;
  }

  function saveBehaviorPatch(patch: Partial<AgentBehaviorSettings>): void {
    state.behavior = saveBehaviorSettings({
      ...state.behavior,
      ...patch,
    });
    updateBehaviorControls();
  }

  updateBehaviorControls();

  function getCurrentSession(): ChatSession {
    const session = state.sessions.find((item) => item.id === state.currentSessionId);
    if (session) return session;
    state.currentSessionId = state.sessions[0].id;
    state.turns = state.sessions[0].turns;
    return state.sessions[0];
  }

  function isUnusedSession(session: ChatSession): boolean {
    return session.turns.length === 0;
  }

  function persistCurrentSession(): void {
    const session = getCurrentSession();
    session.turns = state.turns;
    session.updatedAt = new Date().toISOString();
    state.sessions = [
      session,
      ...state.sessions.filter((item) => item.id !== session.id),
    ];
    saveChatSessions(state.sessions);
    renderSessionPopover();
  }

  async function maybeGenerateSessionTitle(sessionId: string): Promise<void> {
    if (titleGenerationSessionIds.has(sessionId) || !hasUsableAiSettings(state.settings)) return;
    const session = state.sessions.find((item) => item.id === sessionId);
    if (!session || session.title !== DEFAULT_SESSION_TITLE || !session.turns.some((turn) => turn.role === 'user')) {
      return;
    }
    titleGenerationSessionIds.add(sessionId);
    try {
      const nextTitle = await summarizeSessionTitle(state.settings, session.turns);
      const latest = state.sessions.find((item) => item.id === sessionId);
      if (!nextTitle || !latest || latest.title !== DEFAULT_SESSION_TITLE) return;
      latest.title = compactLine(nextTitle, 24) || DEFAULT_SESSION_TITLE;
      latest.updatedAt = new Date().toISOString();
      if (latest.id === state.currentSessionId) {
        title.textContent = latest.title;
      }
      saveChatSessions(state.sessions);
      renderSessionPopover();
    } catch {
      // Title generation is a convenience layer; chat should never fail because it did.
    } finally {
      titleGenerationSessionIds.delete(sessionId);
    }
  }

  function switchSession(sessionId: string): void {
    if (state.busy) return;
    const session = state.sessions.find((item) => item.id === sessionId);
    if (!session) return;
    state.currentSessionId = session.id;
    state.turns = session.turns;
    title.textContent = session.title;
    sessionPopover.hidden = true;
    renderMessages();
    renderSessionPopover();
    updateComposerState();
  }

  function createNewSession(): void {
    if (state.busy) return;
    const unusedSession = state.sessions.find(isUnusedSession);
    if (unusedSession) {
      if (unusedSession.id !== state.currentSessionId) {
        switchSession(unusedSession.id);
      }
      sessionPopover.hidden = true;
      return;
    }
    const session = createChatSession();
    state.sessions = [session, ...state.sessions];
    state.currentSessionId = session.id;
    state.turns = session.turns;
    operationLogStore.clear();
    title.textContent = session.title;
    saveChatSessions(state.sessions);
    sessionPopover.hidden = true;
    renderMessages();
    renderSessionPopover();
    updateComposerState();
  }

  const approvalRuntime: ToolApprovalRuntime = {
    request(input: ToolApprovalInput) {
      return new Promise<boolean>((resolve) => {
        pendingApprovalRequests.push({
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          resolve,
          ...input,
        });
        renderApprovalDock();
      });
    },
  };

  function resolveApproval(id: string, approved: boolean): void {
    const request = pendingApprovalRequests.find((item) => item.id === id);
    if (!request) return;
    pendingApprovalRequests = pendingApprovalRequests.filter((item) => item.id !== id);
    request.resolve(approved);
    renderApprovalDock();
  }

  function resolveAllApprovals(approved: boolean): void {
    const requests = pendingApprovalRequests;
    pendingApprovalRequests = [];
    for (const request of requests) request.resolve(approved);
    renderApprovalDock();
  }

  function renderApprovalDock(): void {
    approvalDock.innerHTML = '';
    approvalDock.hidden = pendingApprovalRequests.length === 0;
    if (!pendingApprovalRequests.length) return;
    for (const request of pendingApprovalRequests) {
      const card = document.createElement('div');
      card.className = 'agent-approval-card';
      const main = document.createElement('div');
      main.className = 'agent-approval-main';
      const heading = document.createElement('div');
      heading.className = 'agent-approval-title';
      heading.textContent = '等待工具审批';
      const summary = document.createElement('div');
      summary.className = 'agent-approval-summary';
      summary.textContent = `${formatToolName(request.toolName)} · ${request.summary}`;
      main.append(heading, summary);
      const actions = document.createElement('div');
      actions.className = 'agent-approval-actions';
      const deny = createButton('拒绝', '拒绝执行', 'agent-approval-button secondary');
      const approve = createButton('批准', '批准执行', 'agent-approval-button primary');
      deny.addEventListener('click', () => resolveApproval(request.id, false));
      approve.addEventListener('click', () => resolveApproval(request.id, true));
      actions.append(deny, approve);
      card.append(main, actions);
      approvalDock.appendChild(card);
    }
  }

  function renderPendingTextFiles(): void {
    attachmentList.innerHTML = '';
    attachmentList.hidden = pendingTextFiles.length === 0;
    for (const file of pendingTextFiles) {
      const chip = document.createElement('span');
      chip.className = 'agent-attachment-chip';
      const label = document.createElement('span');
      label.className = 'agent-attachment-label';
      label.textContent = `${file.name} · ${formatBytes(file.size)} · ${file.lineCount} 行`;
      const remove = createIconButton('CrossSmall', `移除 ${file.name}`, 'agent-attachment-remove');
      remove.addEventListener('click', () => {
        fileRuntime.removeFile(file.fileId);
        pendingTextFiles = pendingTextFiles.filter((item) => item.id !== file.id);
        renderPendingTextFiles();
        updateComposerState();
      });
      chip.append(label, remove);
      attachmentList.appendChild(chip);
    }
  }

  function resizeComposerInput(): void {
    input.style.height = 'auto';
    const maxHeight = Math.max(120, Math.min(240, Math.floor(window.innerHeight * 0.3)));
    const nextHeight = Math.min(input.scrollHeight, maxHeight);
    input.style.height = `${nextHeight}px`;
    input.style.overflowY = input.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  function metadataForPendingFile(file: PendingTextFile): RuntimeTextFile {
    const stored = fileRuntime.getFile(file.fileId);
    if (stored) {
      const { content: _content, lines: _lines, objectUrl: _objectUrl, ...metadata } = stored;
      return metadata;
    }
    return {
      id: file.fileId,
      name: file.name,
      size: file.size,
      mimeType: 'text/plain;charset=utf-8',
      lineCount: file.lineCount,
      createdAt: new Date().toISOString(),
      source: 'upload',
    };
  }

  function buildUserText(text: string): {
    agentText: string;
    displayText: string;
    attachments?: RuntimeTextFile[];
  } {
    const cleanText = text.trim();
    if (!pendingTextFiles.length) {
      return { agentText: cleanText, displayText: cleanText };
    }
    const attachments = pendingTextFiles.map(metadataForPendingFile);
    const fileReferences = pendingTextFiles
      .map(
        (file) =>
          `- ${file.name} (fileId: ${file.fileId}, ${formatBytes(file.size)}, ${file.lineCount} 行)`,
      )
      .join('\n');
    const fallbackPrompt = '请阅读我上传的文本文件，并结合当前 Excel 上下文继续处理。';
    const prompt = cleanText || fallbackPrompt;
    return {
      agentText: `${prompt}\n\n用户上传了以下浏览器本地文本文件，内容未内嵌且未截断。请使用 read_file 工具按行读取或搜索：\n${fileReferences}`,
      displayText: prompt,
      attachments,
    };
  }

  async function addTextFiles(files: FileList | File[]): Promise<void> {
    const nextFiles = Array.from(files);
    if (!nextFiles.length) return;
    const rejected: string[] = [];
    for (const file of nextFiles) {
      if (!isTextFile(file)) {
        rejected.push(file.name);
        continue;
      }
      const rawText = await file.text();
      const registered = fileRuntime.addFile({
        name: file.name,
        size: file.size,
        mimeType: file.type || 'text/plain;charset=utf-8',
        content: rawText,
        source: 'upload',
      });
      pendingTextFiles.push({
        id: crypto.randomUUID(),
        fileId: registered.id,
        name: registered.name,
        size: registered.size,
        lineCount: registered.lineCount,
      });
    }
    if (rejected.length) {
      window.alert(`只支持文本文件，已跳过：${rejected.join('、')}`);
    }
    renderPendingTextFiles();
    updateComposerState();
  }

  function renameSession(sessionId: string): void {
    if (state.busy) return;
    const session = state.sessions.find((item) => item.id === sessionId);
    if (!session) return;
    editingSessionId = session.id;
    renderSessionPopover();
    window.requestAnimationFrame(() => {
      const editor = sessionPopover.querySelector<HTMLInputElement>(
        `.agent-session-edit-input[data-session-id="${CSS.escape(session.id)}"]`,
      );
      editor?.focus();
      editor?.select();
    });
  }

  function commitSessionRename(sessionId: string, rawTitle: string): void {
    const session = state.sessions.find((item) => item.id === sessionId);
    if (!session) return;
    const nextTitle = compactLine(rawTitle.trim(), 36) || session.title || DEFAULT_SESSION_TITLE;
    editingSessionId = undefined;
    if (nextTitle === session.title) {
      renderSessionPopover();
      return;
    }
    session.title = nextTitle;
    session.updatedAt = new Date().toISOString();
    if (session.id === state.currentSessionId) {
      title.textContent = session.title;
    }
    saveChatSessions(state.sessions);
    renderSessionPopover();
  }

  function cancelSessionRename(): void {
    editingSessionId = undefined;
    renderSessionPopover();
  }

  function deleteSession(sessionId: string): void {
    if (state.busy) return;
    state.sessions = state.sessions.filter((session) => session.id !== sessionId);
    if (!state.sessions.length) state.sessions = [createChatSession()];
    if (state.currentSessionId === sessionId) {
      state.currentSessionId = state.sessions[0].id;
      state.turns = state.sessions[0].turns;
      title.textContent = state.sessions[0].title;
      renderMessages();
    }
    saveChatSessions(state.sessions);
    renderSessionPopover();
  }

  function renderSessionPopover(): void {
    sessionPopover.innerHTML = '';
    for (const session of state.sessions) {
      const row = document.createElement('div');
      row.className = `agent-session-row${session.id === state.currentSessionId ? ' active' : ''}${
        editingSessionId === session.id ? ' editing' : ''
      }`;
      if (editingSessionId === session.id) {
        const form = document.createElement('form');
        form.className = 'agent-session-edit-form';
        const editor = document.createElement('input');
        editor.className = 'agent-session-edit-input';
        editor.dataset.sessionId = session.id;
        editor.value = session.title;
        editor.maxLength = 48;
        form.appendChild(editor);
        form.addEventListener('submit', (event) => {
          event.preventDefault();
          commitSessionRename(session.id, editor.value);
        });
        editor.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            cancelSessionRename();
          }
        });
        editor.addEventListener('blur', () => {
          commitSessionRename(session.id, editor.value);
        });
        row.appendChild(form);
      } else {
        const open = document.createElement('button');
        open.type = 'button';
        open.className = 'agent-session-open';
        const name = document.createElement('span');
        name.className = 'agent-session-title';
        name.textContent = session.title;
        const time = document.createElement('span');
        time.className = 'agent-session-time';
        time.textContent = formatSessionTime(session.updatedAt);
        open.append(name, time);
        open.addEventListener('click', () => switchSession(session.id));
        row.appendChild(open);
      }
      const actions = document.createElement('div');
      actions.className = 'agent-session-actions';
      const rename = createIconButton('Pencil', '重命名会话', 'agent-session-action agent-session-rename');
      rename.addEventListener('click', (event) => {
        event.stopPropagation();
        renameSession(session.id);
      });
      actions.appendChild(rename);
      if (state.sessions.length > 1) {
        const remove = createIconButton('CrossSmall', '删除会话', 'agent-session-action agent-session-delete');
        remove.addEventListener('click', (event) => {
          event.stopPropagation();
          deleteSession(session.id);
        });
        actions.appendChild(remove);
      }
      row.appendChild(actions);
      sessionPopover.appendChild(row);
    }
  }

  async function refreshCheckpoints(): Promise<void> {
    try {
      checkpoints = await listWorkbookCheckpoints();
    } catch {
      checkpoints = [];
    }
    renderCheckpointPopover();
  }

  function setCheckpointBusy(busy: boolean): void {
    state.checkpointBusy = busy;
    checkpointsButton.disabled = busy;
    renderCheckpointPopover();
  }

  async function createNamedCheckpoint(name: string): Promise<void> {
    if (state.busy || state.checkpointBusy) return;
    setCheckpointBusy(true);
    try {
      await createWorkbookCheckpoint(name);
      await refreshCheckpoints();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : String(error));
    } finally {
      setCheckpointBusy(false);
    }
  }

  async function restoreCheckpoint(id: string): Promise<void> {
    if (state.busy || state.checkpointBusy) return;
    setCheckpointBusy(true);
    try {
      await restoreWorkbookCheckpoint(id);
      checkpointPopover.hidden = true;
      await refreshCheckpoints();
      await refreshSelection();
      queueTaskPanePlacement();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : String(error));
    } finally {
      setCheckpointBusy(false);
    }
  }

  async function removeCheckpoint(id: string): Promise<void> {
    if (state.checkpointBusy) return;
    setCheckpointBusy(true);
    try {
      await deleteWorkbookCheckpoint(id);
      await refreshCheckpoints();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : String(error));
    } finally {
      setCheckpointBusy(false);
    }
  }

  function renderCheckpointPopover(): void {
    checkpointPopover.innerHTML = '';
    const form = document.createElement('form');
    form.className = 'agent-checkpoint-form';
    const inputName = document.createElement('input');
    inputName.className = 'agent-checkpoint-name';
    inputName.placeholder = '检查点名称';
    inputName.maxLength = 80;
    inputName.disabled = state.checkpointBusy || !excelBridge.isReady();
    const create = createButton(
      state.checkpointBusy ? '处理中' : '创建',
      '创建当前文件检查点',
      'agent-checkpoint-create',
    );
    create.type = 'submit';
    create.disabled = state.checkpointBusy || !excelBridge.isReady();
    form.append(inputName, create);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const fallback = `检查点 ${new Intl.DateTimeFormat('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date())}`;
      void createNamedCheckpoint(inputName.value.trim() || fallback);
    });
    checkpointPopover.appendChild(form);

    const list = document.createElement('div');
    list.className = 'agent-checkpoint-list';
    if (!excelBridge.isReady()) {
      const empty = document.createElement('div');
      empty.className = 'agent-checkpoint-empty';
      empty.textContent = '打开 Excel 后可创建检查点';
      list.appendChild(empty);
    } else if (!checkpoints.length) {
      const empty = document.createElement('div');
      empty.className = 'agent-checkpoint-empty';
      empty.textContent = '暂无检查点';
      list.appendChild(empty);
    } else {
      for (const checkpoint of checkpoints) {
        const row = document.createElement('div');
        row.className = 'agent-checkpoint-row';
        const main = document.createElement('div');
        main.className = 'agent-checkpoint-main';
        const name = document.createElement('div');
        name.className = 'agent-checkpoint-title';
        name.textContent = checkpoint.name;
        const meta = document.createElement('div');
        meta.className = 'agent-checkpoint-meta';
        meta.textContent = `${formatCheckpointTime(checkpoint.createdAt)} · ${formatBytes(checkpoint.size)}`;
        main.append(name, meta);
        const actions = document.createElement('div');
        actions.className = 'agent-checkpoint-actions';
        const rollback = createButton('回滚', `回滚到 ${checkpoint.name}`, 'agent-checkpoint-action primary');
        rollback.disabled = state.busy || state.checkpointBusy;
        rollback.addEventListener('click', () => void restoreCheckpoint(checkpoint.id));
        const remove = createIconButton('CrossSmall', '删除检查点', 'agent-checkpoint-action');
        remove.disabled = state.checkpointBusy;
        remove.addEventListener('click', () => void removeCheckpoint(checkpoint.id));
        actions.append(rollback, remove);
        row.append(main, actions);
        list.appendChild(row);
      }
    }
    checkpointPopover.appendChild(list);
  }

  function updateStatus(): void {
    root.classList.toggle('is-excel-ready', excelBridge.isReady());
    updateComposerState();
    updateTaskPanePlacement();
  }

  function updateTaskPanePlacement(): void {
    const editorPane = document.querySelector<HTMLElement>('#editor-pane');
    const frame = document.querySelector<HTMLIFrameElement>('#iframe iframe, #editor-pane > iframe');
    if (!editorPane || !excelBridge.isReady() || !frame?.contentDocument) return;

    try {
      const frameRect = frame.getBoundingClientRect();
      const paneRect = editorPane.getBoundingClientRect();
      const frameDocument = frame.contentDocument;
      const gridRoot =
        frameDocument.getElementById('editor_sdk') ||
        frameDocument.getElementById('viewport-hbox-layout');
      const statusbar = frameDocument.getElementById('statusbar');

      if (gridRoot) {
        const gridRect = gridRoot.getBoundingClientRect();
        const top = Math.max(0, Math.round(frameRect.top - paneRect.top + gridRect.top));
        editorPane.style.setProperty('--agent-panel-ready-top', `${top}px`);
      }

      if (statusbar) {
        const statusRect = statusbar.getBoundingClientRect();
        const bottom = Math.max(0, Math.round(frameRect.height - statusRect.top));
        editorPane.style.setProperty('--agent-panel-ready-bottom', `${bottom}px`);
      }
    } catch {
      // Keep the CSS fallback until the embedded editor finishes laying itself out.
    }
  }

  function queueTaskPanePlacement(): void {
    window.requestAnimationFrame(() => {
      updateTaskPanePlacement();
      window.setTimeout(updateTaskPanePlacement, 250);
    });
  }

  function renderThinkingBlock(
    thinking: string,
    options: {
      streaming?: boolean;
      expanded?: boolean;
      waiting?: boolean;
      onToggle?: (expanded: boolean) => void;
    } = {},
  ): HTMLElement {
    const streaming = options.streaming ?? false;
    const waiting = options.waiting ?? false;
    const details = document.createElement('details');
    details.className = `agent-thinking-block${streaming ? ' streaming' : ''}${waiting ? ' waiting' : ''}`;
    details.open = streaming || options.expanded === true;
    if (options.onToggle) {
      details.addEventListener('toggle', () => {
        options.onToggle?.(details.open);
      });
    }
    const summary = document.createElement('summary');
    summary.append(document.createTextNode(streaming ? '正在思考' : '已思考'));
    if (waiting) {
      const spinner = document.createElement('span');
      spinner.className = 'agent-thinking-spinner';
      summary.appendChild(spinner);
    }
    details.appendChild(summary);
    if (thinking.trim()) {
      const body = document.createElement('pre');
      body.textContent = thinking;
      details.appendChild(body);
    }
    return details;
  }

  function renderLoadingDots(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'agent-loading-dots';
    wrapper.setAttribute('aria-label', '等待回复');
    wrapper.setAttribute('role', 'status');
    for (let index = 0; index < 3; index += 1) {
      const dot = document.createElement('span');
      dot.className = 'agent-loading-dot';
      wrapper.appendChild(dot);
    }
    return wrapper;
  }

  function renderPendingQuestion(question: PendingQuestion): HTMLElement {
    const card = document.createElement('div');
    card.className = `agent-hitl-card${question.status && question.status !== 'pending' ? ` ${question.status}` : ''}`;
    const titleElement = document.createElement('div');
    titleElement.className = 'agent-hitl-title';
    titleElement.textContent = question.status === 'answered' ? '已补充信息' : '需要澄清';
    const body = document.createElement('p');
    body.className = 'agent-hitl-question';
    body.textContent = question.question;
    card.append(titleElement, body);
    if (!question.status || question.status === 'pending') {
      const selectionMode = question.selectionMode === 'multiple' ? 'multiple' : 'single';
      const optionInputs: HTMLInputElement[] = [];
      const answerInput = document.createElement('textarea');
      answerInput.className = 'agent-hitl-answer';
      answerInput.rows = 2;
      answerInput.placeholder = question.options?.length ? '自定义补充（可选）' : '输入回答后继续';
      const options = document.createElement('div');
      options.className = 'agent-hitl-options';
      const optionGroupName = `agent-hitl-question-${question.id}`;
      for (const option of question.options || []) {
        const optionLabel = document.createElement('label');
        optionLabel.className = 'agent-hitl-option-choice';
        const optionInput = document.createElement('input');
        optionInput.type = selectionMode === 'multiple' ? 'checkbox' : 'radio';
        optionInput.name = optionGroupName;
        optionInput.value = option;
        const optionText = document.createElement('span');
        optionText.className = 'agent-hitl-option-text';
        optionText.textContent = option;
        optionInputs.push(optionInput);
        optionInput.addEventListener('change', syncContinueState);
        optionLabel.append(optionInput, optionText);
        options.appendChild(optionLabel);
      }
      const actions = document.createElement('div');
      actions.className = 'agent-hitl-actions';
      const cancel = createButton('取消', '取消澄清', 'agent-hitl-button secondary');
      const continueButton = createButton('继续', '带回答继续执行', 'agent-hitl-button primary');
      continueButton.disabled = true;
      function collectAnswer(): string {
        const selected = optionInputs.filter((optionInput) => optionInput.checked).map((optionInput) => optionInput.value);
        const customAnswer = answerInput.value.trim();
        const answerParts: string[] = [];
        if (selected.length) answerParts.push(`选择：${selected.join('；')}`);
        if (customAnswer) answerParts.push(`补充：${customAnswer}`);
        return answerParts.join('\n');
      }
      function syncContinueState(): void {
        continueButton.disabled = !collectAnswer();
      }
      answerInput.addEventListener('input', syncContinueState);
      cancel.addEventListener('click', () => {
        question.status = 'dismissed';
        persistCurrentSession();
        renderMessages({ preserveScroll: true });
      });
      continueButton.addEventListener('click', () => {
        const answer = collectAnswer();
        if (!answer) return;
        question.status = 'answered';
        persistCurrentSession();
        renderMessages({ preserveScroll: true });
        void sendMessage(`${question.originalUserText}\n\n用户补充回答：${answer}`, {
          skipQuestion: true,
          displayTextOverride: `补充回答：${compactLine(answer, 80)}`,
        });
      });
      actions.append(cancel, continueButton);
      if (question.options?.length) card.appendChild(options);
      card.append(answerInput, actions);
    }
    return card;
  }

  function renderTurnText(content: string, streaming = false): HTMLElement {
    const text = document.createElement('div');
    text.className = 'agent-message-text';
    if (content) {
      appendMarkdown(text, content);
    }
    if (streaming) {
      const cursor = document.createElement('span');
      cursor.className = 'agent-stream-cursor';
      cursor.textContent = ' ';
      text.appendChild(cursor);
    }
    return text;
  }

  function renderTurnParts(turn: ChatTurn, outputFiles: RuntimeTextFile[]): HTMLElement[] {
    const elements: HTMLElement[] = [];
    const parts = turn.parts || [];
    for (let index = 0; index < parts.length; index += 1) {
      const part = parts[index];
      if (part.type === 'thinking') {
        const isStreamingThinking = Boolean(turn.streaming && part.streaming);
        if (part.content.trim() || isStreamingThinking) {
          elements.push(
            renderThinkingBlock(part.content, {
              streaming: isStreamingThinking,
              expanded: part.expanded,
              waiting: part.waiting,
              onToggle: (expanded) => {
                part.expanded = expanded;
                persistCurrentSession();
              },
            }),
          );
        }
        continue;
      }
      if (part.type === 'loading') {
        if (turn.streaming && part.streaming) {
          elements.push(renderLoadingDots());
        }
        continue;
      }
      if (part.type === 'tool') {
        const toolCall = (turn.tools || []).find((tool) => tool.id === part.toolId);
        if (!toolCall) continue;
        const wrapper = document.createElement('div');
        wrapper.className = 'agent-tool-list agent-tool-list-inline';
        wrapper.appendChild(renderToolCall(toolCall));
        elements.push(wrapper);
        continue;
      }
      if (part.type === 'text') {
        const isLastPart = index === parts.length - 1;
        const isStreamingText = Boolean(turn.streaming && isLastPart);
        if (part.content || isStreamingText) {
          elements.push(renderTurnText(part.content, isStreamingText));
        }
      }
    }
    if (outputFiles.length) {
      const text = document.createElement('div');
      text.className = 'agent-message-text';
      text.appendChild(renderFileCards(outputFiles));
      elements.push(text);
    }
    return elements;
  }

  function renderMessages(options: { preserveScroll?: boolean } = {}): void {
    const previousScrollTop = messages.scrollTop;
    messages.innerHTML = '';
    if (state.turns.length === 0) {
      return;
    }
    for (const turn of state.turns) {
      const item = document.createElement('article');
      item.className = `agent-message ${turn.role}${turn.streaming ? ' streaming' : ''}`;
      if (turn.role === 'assistant' && turn.pendingQuestion) {
        item.appendChild(renderPendingQuestion(turn.pendingQuestion));
      }
      const attachedFiles = turn.role === 'user' ? turn.attachments || [] : [];
      const outputFiles = turn.role === 'assistant' ? getWrittenFilesFromTurn(turn) : [];
      const hasOrderedParts = turn.role === 'assistant' && Boolean(turn.parts?.length);
      if (hasOrderedParts) {
        for (const element of renderTurnParts(turn, outputFiles)) {
          item.appendChild(element);
        }
      } else {
        if (turn.role === 'assistant' && turn.thinking?.trim()) {
          item.appendChild(renderThinkingBlock(turn.thinking.trim()));
        }
        if (turn.role === 'assistant' && turn.tools?.length) {
          item.appendChild(renderToolSummary(turn));
          if (turn.toolsExpanded ?? false) {
            item.appendChild(renderToolList(turn));
          }
        }
      }
      if (
        !hasOrderedParts &&
        (turn.role === 'user' || turn.content || outputFiles.length || attachedFiles.length)
      ) {
        const text = document.createElement('div');
        text.className = 'agent-message-text';
        if (turn.role === 'assistant') {
          if (turn.content) {
            appendMarkdown(text, turn.content);
          }
        } else {
          text.textContent = turn.displayContent || turn.content;
        }
        if (attachedFiles.length) {
          text.appendChild(renderFileCards(attachedFiles));
        }
        if (outputFiles.length) {
          text.appendChild(renderFileCards(outputFiles));
        }
        if (turn.streaming) {
          const cursor = document.createElement('span');
          cursor.className = 'agent-stream-cursor';
          cursor.textContent = ' ';
          text.appendChild(cursor);
        }
        item.appendChild(text);
      }
      if (item.childElementCount > 0) {
        messages.appendChild(item);
      }
    }
    scrollStreamingThinkingToLatest();
    if (options.preserveScroll) {
      messages.scrollTop = previousScrollTop;
    } else {
      messages.scrollTop = messages.scrollHeight;
    }
  }

  function scrollStreamingThinkingToLatest(): void {
    messages.querySelectorAll<HTMLPreElement>('.agent-thinking-block.streaming pre').forEach((body) => {
      body.scrollTop = body.scrollHeight;
    });
  }

  function scheduleRenderMessages(): void {
    if (messagesRenderTimer !== undefined) return;
    messagesRenderTimer = window.setTimeout(() => {
      messagesRenderTimer = undefined;
      window.requestAnimationFrame(() => renderMessages());
    }, 90);
  }

  function createTurnPart<T extends ChatTurnPart['type']>(
    type: T,
    patch: Omit<Extract<ChatTurnPart, { type: T }>, 'id' | 'type'>,
  ): Extract<ChatTurnPart, { type: T }> {
    return {
      id: crypto.randomUUID(),
      type,
      ...patch,
    } as Extract<ChatTurnPart, { type: T }>;
  }

  function ensureTurnParts(turn: ChatTurn): ChatTurnPart[] {
    if (!turn.parts) turn.parts = [];
    return turn.parts;
  }

  function getLastTurnPart(turn: ChatTurn): ChatTurnPart | undefined {
    const parts = ensureTurnParts(turn);
    return parts[parts.length - 1];
  }

  function finishActiveThinking(turn: ChatTurn): void {
    const parts = ensureTurnParts(turn);
    const last = getLastTurnPart(turn);
    if (last?.type === 'loading') {
      parts.pop();
      return;
    }
    if (last?.type === 'thinking') {
      if (last.waiting && !last.content.trim()) {
        parts.pop();
        return;
      }
      last.expanded = last.expanded ?? Boolean(last.content.trim());
      last.waiting = false;
      last.streaming = false;
    }
  }

  function appendThinkingDelta(turn: ChatTurn, delta: string): void {
    const parts = ensureTurnParts(turn);
    const last = parts[parts.length - 1];
    let thinkingPart: Extract<ChatTurnPart, { type: 'thinking' }> | undefined;
    if (last?.type === 'thinking' && last.streaming) {
      thinkingPart = last;
    } else {
      thinkingPart = createTurnPart('thinking', {
        content: '',
        streaming: true,
        expanded: true,
      });
      parts.push(thinkingPart);
    }
    thinkingPart.content += delta;
    thinkingPart.expanded = true;
    thinkingPart.waiting = false;
    turn.thinking = `${turn.thinking || ''}${delta}`;
  }

  function startThinkingPart(turn: ChatTurn, waiting = false): void {
    const parts = ensureTurnParts(turn);
    const last = parts[parts.length - 1];
    if (last?.type === 'thinking' && last.streaming) {
      last.expanded = true;
      last.waiting = waiting ? true : last.waiting;
      return;
    }
    parts.push(
      createTurnPart('thinking', {
        content: '',
        streaming: true,
        expanded: true,
        waiting,
      }),
    );
  }

  function startLoadingPart(turn: ChatTurn): void {
    const parts = ensureTurnParts(turn);
    const last = parts[parts.length - 1];
    if (last?.type === 'loading' && last.streaming) return;
    parts.push(
      createTurnPart('loading', {
        streaming: true,
      }),
    );
  }

  function appendTextDelta(turn: ChatTurn, delta: string): void {
    finishActiveThinking(turn);
    const parts = ensureTurnParts(turn);
    const last = parts[parts.length - 1];
    if (last?.type === 'text') {
      last.content += delta;
    } else {
      parts.push(createTurnPart('text', { content: delta }));
    }
    turn.content += delta;
  }

  function appendToolPart(turn: ChatTurn, toolId: string): void {
    finishActiveThinking(turn);
    const parts = ensureTurnParts(turn);
    if (parts.some((part) => part.type === 'tool' && part.toolId === toolId)) return;
    parts.push(createTurnPart('tool', { toolId }));
  }

  function getWrittenFilesFromTurn(turn: ChatTurn): RuntimeTextFile[] {
    const files: RuntimeTextFile[] = [];
    const seen = new Set<string>();
    for (const toolCall of turn.tools || []) {
      if (toolCall.name !== 'write_file' || toolCall.status !== 'ok') continue;
      const output = asRecord(toolCall.output);
      const result = asRecord(output?.result);
      const file = asRecord(result?.file);
      const id = typeof file?.id === 'string' ? file.id : '';
      if (!id || seen.has(id)) continue;
      seen.add(id);
      const stored = fileRuntime.getFile(id);
      if (stored) {
        const { content: _content, lines: _lines, objectUrl: _objectUrl, ...metadata } = stored;
        files.push(metadata);
      } else {
        files.push({
          id,
          name: typeof file?.name === 'string' ? file.name : 'output.txt',
          size: typeof file?.size === 'number' ? file.size : 0,
          mimeType: typeof file?.mimeType === 'string' ? file.mimeType : 'text/plain;charset=utf-8',
          lineCount: typeof file?.lineCount === 'number' ? file.lineCount : 0,
          createdAt: typeof file?.createdAt === 'string' ? file.createdAt : new Date().toISOString(),
          source: 'generated',
          description: typeof file?.description === 'string' ? file.description : undefined,
        });
      }
    }
    return files;
  }

  function renderFileCards(files: RuntimeTextFile[]): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'agent-file-cards';
    for (const file of files) {
      const card = document.createElement('details');
      card.className = 'agent-file-card';
      const summary = document.createElement('summary');
      summary.className = 'agent-file-card-summary';
      const main = document.createElement('div');
      main.className = 'agent-file-card-main';
      const name = document.createElement('div');
      name.className = 'agent-file-card-name';
      name.textContent = file.name;
      const meta = document.createElement('div');
      meta.className = 'agent-file-card-meta';
      meta.textContent = `${formatBytes(file.size)} · ${file.lineCount} 行`;
      main.append(name, meta);

      const downloadUrl = fileRuntime.getDownloadUrl(file.id);
      const download = document.createElement('a');
      download.className = 'agent-file-card-download';
      download.textContent = downloadUrl ? '下载' : '不可用';
      if (downloadUrl) {
        download.href = downloadUrl;
        download.download = file.name;
      }
      download.addEventListener('click', (event) => event.stopPropagation());
      summary.append(main, download);
      card.append(summary, renderFilePreview(file));
      wrap.appendChild(card);
    }
    return wrap;
  }

  function renderFilePreview(file: RuntimeTextFile): HTMLElement {
    const preview = document.createElement('div');
    preview.className = 'agent-file-preview';
    const stored = fileRuntime.getFile(file.id);
    if (!stored) {
      preview.textContent = '文件内容仅在当前浏览器会话中可用。';
      return preview;
    }
    const maxLines = 100;
    const previewLines = stored.lines.slice(0, maxLines);
    const truncated = stored.lines.length > previewLines.length;
    const previewText = previewLines.join('\n');
    if (isMarkdownFile(stored.name, stored.mimeType)) {
      const markdown = document.createElement('div');
      markdown.className = 'agent-file-preview-markdown';
      appendMarkdown(markdown, previewText || ' ');
      preview.appendChild(markdown);
    } else {
      preview.appendChild(renderCodePreview(previewLines, isJsonLikeFile(stored.name, stored.mimeType)));
    }
    if (truncated) {
      const note = document.createElement('div');
      note.className = 'agent-file-preview-note';
      note.textContent = `仅预览前 ${maxLines} 行，可下载查看完整文件。`;
      preview.appendChild(note);
    }
    return preview;
  }

  function renderCodePreview(lines: string[], highlightJsonLines: boolean): HTMLElement {
    const code = document.createElement('div');
    code.className = 'agent-file-preview-code';
    lines.forEach((lineText, index) => {
      const line = document.createElement('div');
      line.className = 'agent-file-code-line';
      const number = document.createElement('span');
      number.className = 'agent-file-code-line-number';
      number.textContent = String(index + 1);
      const content = document.createElement('span');
      content.className = 'agent-file-code-line-content';
      if (highlightJsonLines) {
        content.innerHTML = highlightJson(lineText || ' ');
      } else {
        content.textContent = lineText || ' ';
      }
      line.append(number, content);
      code.appendChild(line);
    });
    return code;
  }

  function isMarkdownFile(fileName: string, mimeType: string): boolean {
    return /(^text\/markdown\b)|(\.(md|markdown|mdown|mkdn)$)/i.test(`${mimeType} ${fileName}`);
  }

  function isJsonLikeFile(fileName: string, mimeType: string): boolean {
    return /(^application\/json\b)|(\.(json|jsonl|code-workspace|babelrc|eslintrc|prettierrc)$)/i.test(
      `${mimeType} ${fileName}`,
    );
  }

  function renderToolSummary(turn: ChatTurn): HTMLElement {
    const tools = turn.tools || [];
    const attentionCount = tools.filter(
      (tool) => tool.status === 'error' || tool.status === 'unsupported',
    ).length;
    const successCount = tools.filter((tool) => tool.status === 'ok').length;
    const summary = document.createElement('button');
    summary.type = 'button';
    summary.className = `agent-tool-summary${turn.toolsExpanded ?? false ? ' expanded' : ''}${
      attentionCount ? ' attention' : successCount ? ' success' : ''
    }`;
    const label = document.createElement('span');
    label.className = 'agent-tool-summary-label';
    const durationEnd = turn.streaming ? undefined : getLatestToolFinishAt(tools) || turn.createdAt;
    label.textContent = `${tools.length} 个工具 · ${formatDuration(turn.createdAt, durationEnd)}`;
    summary.append(label);
    summary.addEventListener('click', () => {
      turn.toolsExpanded = !(turn.toolsExpanded ?? false);
      renderMessages({ preserveScroll: true });
    });
    return summary;
  }

  function renderToolList(turn: ChatTurn): HTMLElement {
    const list = document.createElement('div');
    list.className = 'agent-tool-list';
    for (const toolCall of turn.tools || []) {
      list.appendChild(renderToolCall(toolCall));
    }
    return list;
  }

  function renderToolCall(toolCall: ChatToolCall): HTMLElement {
    const details = document.createElement('details');
    details.className = `agent-tool-call ${toolCall.status}`;
    details.open = toolCall.expanded ?? false;
    details.addEventListener('toggle', () => {
      toolCall.expanded = details.open;
    });
    const summary = document.createElement('summary');
    summary.className = 'agent-tool-call-summary';
    const name = document.createElement('span');
    name.className = 'agent-tool-name';
    name.textContent = formatToolName(toolCall.name);
    const detail = document.createElement('span');
    detail.className = 'agent-tool-brief';
    detail.textContent = summarizeToolInput(toolCall);
    summary.append(name, detail);

    const body = document.createElement('div');
    body.className = 'agent-tool-body';
    body.appendChild(renderToolJsonPreview(toolCall));
    details.append(summary, body);
    return details;
  }

  function renderToolJsonPreview(toolCall: ChatToolCall): HTMLElement {
    const payload = buildToolPreviewJson(toolCall);
    const tree = document.createElement('div');
    tree.className = 'agent-tool-json agent-tool-json-preview';
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'agent-tool-json-copy';
    copy.textContent = '复制';
    copy.title = '复制工具调用 JSON';
    copy.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const originalLabel = copy.textContent || '复制';
      void copyTextToClipboard(JSON.stringify(payload, null, 2)).then(() => {
        copy.textContent = '已复制';
        window.setTimeout(() => {
          copy.textContent = originalLabel;
        }, 1000);
      });
    });
    tree.appendChild(copy);
    tree.appendChild(renderJsonRoot(payload));
    return tree;
  }

  function buildToolPreviewJson(toolCall: ChatToolCall): Record<string, unknown> {
    const inputValue = toolCall.input ?? toolCall.inputText;
    const payload: Record<string, unknown> = {
      input: inputValue ?? null,
      output: toolCall.output ?? (toolCall.error ? { error: toolCall.error } : null),
    };
    return normalizeJsonPreview(payload) as Record<string, unknown>;
  }

  function normalizeJsonPreview(value: unknown, depth = 0): unknown {
    if (value === undefined) return '[undefined]';
    if (value === null || typeof value === 'number' || typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.length > 1200 ? `${value.slice(0, 1200)}…` : value;
    }
    if (Array.isArray(value)) {
      if (depth >= 5) return `[Array(${value.length})]`;
      const items = value.slice(0, 60).map((item) => normalizeJsonPreview(item, depth + 1));
      if (value.length > 60) items.push(`… ${value.length - 60} more items`);
      return items;
    }
    if (value && typeof value === 'object') {
      if (depth >= 5) return '[Object]';
      const output: Record<string, unknown> = {};
      const entries = Object.entries(value as Record<string, unknown>);
      for (const [key, child] of entries.slice(0, 80)) {
        output[key] = normalizeJsonPreview(child, depth + 1);
      }
      if (entries.length > 80) output['…'] = `${entries.length - 80} more keys`;
      return output;
    }
    return String(value);
  }

  function renderJsonRoot(value: Record<string, unknown>): HTMLElement {
    const root = document.createElement('div');
    root.className = 'agent-json-root';
    root.appendChild(renderJsonLine('{', 0));
    root.appendChild(renderTopLevelJsonProperty('input', value.input, true));
    root.appendChild(renderTopLevelJsonProperty('output', value.output, false));
    root.appendChild(renderJsonLine('}', 0));
    return root;
  }

  function renderTopLevelJsonProperty(key: string, value: unknown, trailingComma: boolean): HTMLElement {
    if (isJsonContainer(value)) {
      const details = document.createElement('details');
      details.className = 'agent-json-property agent-json-top-property';
      details.open = key === 'input';
      const summary = document.createElement('summary');
      summary.className = 'agent-json-line';
      summary.style.setProperty('--agent-json-depth', '1');
      summary.appendChild(renderJsonKey(key));
      summary.append(document.createTextNode(': '));
      const preview = document.createElement('span');
      preview.className = 'agent-json-collapsed-preview';
      preview.textContent = `${Array.isArray(value) ? '[…]' : '{…}'}${trailingComma ? ',' : ''}`;
      summary.appendChild(preview);
      const children = document.createElement('div');
      children.className = 'agent-json-children';
      renderStaticJsonValue(children, value, 2, trailingComma);
      details.append(summary, children);
      return details;
    }
    return renderJsonScalarProperty(key, value, 1, trailingComma);
  }

  function renderStaticJsonValue(root: HTMLElement, value: unknown, depth: number, trailingComma: boolean): void {
    if (Array.isArray(value)) {
      root.appendChild(renderJsonLine('[', depth));
      value.forEach((item, index) => {
        renderStaticJsonEntry(root, undefined, item, depth + 1, index < value.length - 1, true);
      });
      root.appendChild(renderJsonLine(`]${trailingComma ? ',' : ''}`, depth));
      return;
    }
    if (value && typeof value === 'object') {
      root.appendChild(renderJsonLine('{', depth));
      const entries = Object.entries(value as Record<string, unknown>);
      entries.forEach(([childKey, childValue], index) => {
        renderStaticJsonEntry(root, childKey, childValue, depth + 1, index < entries.length - 1, false);
      });
      root.appendChild(renderJsonLine(`}${trailingComma ? ',' : ''}`, depth));
      return;
    }
    const line = document.createElement('div');
    line.className = 'agent-json-line';
    line.style.setProperty('--agent-json-depth', String(depth));
    line.appendChild(renderJsonScalar(value));
    if (trailingComma) line.append(document.createTextNode(','));
    root.appendChild(line);
  }

  function renderStaticJsonEntry(
    root: HTMLElement,
    key: string | undefined,
    value: unknown,
    depth: number,
    trailingComma: boolean,
    arrayItem: boolean,
  ): void {
    if (arrayItem) {
      renderStaticJsonValue(root, value, depth, trailingComma);
      return;
    }
    if (isJsonContainer(value)) {
      const line = document.createElement('div');
      line.className = 'agent-json-line';
      line.style.setProperty('--agent-json-depth', String(depth));
      line.appendChild(renderJsonKey(key || ''));
      line.append(document.createTextNode(': '));
      root.appendChild(line);
      renderStaticJsonValue(root, value, depth + 1, trailingComma);
      return;
    }
    root.appendChild(renderJsonScalarProperty(key || '', value, depth, trailingComma));
  }

  function renderJsonProperty(key: string, value: unknown, depth: number, trailingComma: boolean): HTMLElement {
    if (isJsonContainer(value)) {
      const details = document.createElement('details');
      details.className = 'agent-json-property';
      const summary = document.createElement('summary');
      summary.className = 'agent-json-line';
      summary.style.setProperty('--agent-json-depth', String(depth));
      summary.appendChild(renderJsonKey(key));
      summary.append(document.createTextNode(': '));
      const preview = document.createElement('span');
      preview.className = 'agent-json-collapsed-preview';
      preview.textContent = `${Array.isArray(value) ? '[…]' : '{…}'}${trailingComma ? ',' : ''}`;
      summary.appendChild(preview);

      const children = document.createElement('div');
      children.className = 'agent-json-children';
      const opener = Array.isArray(value) ? '[' : '{';
      const closer = `${Array.isArray(value) ? ']' : '}'}${trailingComma ? ',' : ''}`;
      children.appendChild(renderJsonLine(opener, depth + 1));
      const entries = Array.isArray(value)
        ? value.map((child, index) => [String(index), child] as const)
        : Object.entries(value as Record<string, unknown>);
      entries.forEach(([childKey, childValue], index) => {
        rootAppendJsonEntry(children, childKey, childValue, depth + 2, index < entries.length - 1, Array.isArray(value));
      });
      children.appendChild(renderJsonLine(closer, depth + 1));

      details.append(summary, children);
      return details;
    }
    return renderJsonScalarProperty(key, value, depth, trailingComma);
  }

  function rootAppendJsonEntry(
    root: HTMLElement,
    key: string,
    value: unknown,
    depth: number,
    trailingComma: boolean,
    arrayItem: boolean,
  ): void {
    if (arrayItem) {
      root.appendChild(renderJsonArrayItem(value, depth, trailingComma));
    } else {
      root.appendChild(renderJsonProperty(key, value, depth, trailingComma));
    }
  }

  function renderJsonArrayItem(value: unknown, depth: number, trailingComma: boolean): HTMLElement {
    if (isJsonContainer(value)) {
      const details = document.createElement('details');
      details.className = 'agent-json-property';
      const summary = document.createElement('summary');
      summary.className = 'agent-json-line agent-json-array-summary';
      summary.style.setProperty('--agent-json-depth', String(depth));
      summary.textContent = `${Array.isArray(value) ? '[…]' : '{…}'}${trailingComma ? ',' : ''}`;
      const children = document.createElement('div');
      children.className = 'agent-json-children';
      const opener = Array.isArray(value) ? '[' : '{';
      const closer = `${Array.isArray(value) ? ']' : '}'}${trailingComma ? ',' : ''}`;
      children.appendChild(renderJsonLine(opener, depth + 1));
      const entries = Array.isArray(value)
        ? value.map((child, index) => [String(index), child] as const)
        : Object.entries(value as Record<string, unknown>);
      entries.forEach(([childKey, childValue], index) => {
        rootAppendJsonEntry(children, childKey, childValue, depth + 2, index < entries.length - 1, Array.isArray(value));
      });
      children.appendChild(renderJsonLine(closer, depth + 1));
      details.append(summary, children);
      return details;
    }
    const line = document.createElement('div');
    line.className = 'agent-json-line';
    line.style.setProperty('--agent-json-depth', String(depth));
    line.appendChild(renderJsonScalar(value));
    if (trailingComma) line.append(document.createTextNode(','));
    return line;
  }

  function renderJsonScalarProperty(key: string, value: unknown, depth: number, trailingComma: boolean): HTMLElement {
    const line = document.createElement('div');
    line.className = 'agent-json-line';
    line.style.setProperty('--agent-json-depth', String(depth));
    line.appendChild(renderJsonKey(key));
    line.append(document.createTextNode(': '));
    line.appendChild(renderJsonScalar(value));
    if (trailingComma) line.append(document.createTextNode(','));
    return line;
  }

  function renderJsonLine(text: string, depth: number): HTMLElement {
    const line = document.createElement('div');
    line.className = 'agent-json-line';
    line.style.setProperty('--agent-json-depth', String(depth));
    line.textContent = text;
    return line;
  }

  function renderJsonKey(key: string): HTMLElement {
    const span = document.createElement('span');
    span.className = 'json-key';
    span.textContent = JSON.stringify(key);
    return span;
  }

  function renderJsonScalar(value: unknown): HTMLElement {
    const span = document.createElement('span');
    if (typeof value === 'string') {
      span.className = 'json-string';
      span.textContent = JSON.stringify(value);
      return span;
    }
    if (typeof value === 'number') {
      span.className = 'json-number';
      span.textContent = Number.isFinite(value) ? String(value) : JSON.stringify(String(value));
      return span;
    }
    if (typeof value === 'boolean') {
      span.className = 'json-boolean';
      span.textContent = String(value);
      return span;
    }
    span.className = 'json-null';
    span.textContent = value === null ? 'null' : JSON.stringify(String(value));
    return span;
  }

  function isJsonContainer(value: unknown): value is Record<string, unknown> | unknown[] {
    return value !== null && typeof value === 'object';
  }

  async function selectExcelAnchor(anchor: ExcelAnchor): Promise<void> {
    if (!anchor.address || !excelBridge.isReady()) return;
    await excelBridge.execute('call', {
      objectName: 'Excel.Range',
      memberName: 'select',
      memberKind: 'method',
      target: {
        sheetName: anchor.sheetName,
        address: anchor.address,
      },
    });
    await refreshSelection();
  }

  function setBusy(busy: boolean): void {
    state.busy = busy;
    sendButton.hidden = busy;
    uploadButton.disabled = busy;
    stopButton.hidden = !busy;
    stopButton.disabled = !busy;
    root.classList.toggle('is-busy', busy);
    updateComposerState();
    if (busy && busyTicker === undefined) {
      busyTicker = window.setInterval(renderMessages, 1000);
    }
    if (!busy && busyTicker !== undefined) {
      window.clearInterval(busyTicker);
      busyTicker = undefined;
    }
  }

  function updateSelectionChipFromResult(result: unknown): void {
    const record = asRecord(result);
    if (!record) {
      selectionChipText.textContent = '选区不可读';
      return;
    }
    const sheetName = typeof record.sheetName === 'string' ? record.sheetName : state.activeSheetName || 'Sheet';
    const address = typeof record.address === 'string' ? record.address : undefined;
    state.activeSheetName = sheetName;
    selectionChipText.textContent = `${sheetName} ${formatSelectionAddress(address)} selected`;
  }

  function renderSheetPopover(statusText?: string): void {
    sheetPopover.innerHTML = '';
    const heading = document.createElement('div');
    heading.className = 'agent-sheet-popover-heading';
    heading.textContent = 'Sheets';
    sheetPopover.appendChild(heading);
    if (statusText) {
      const status = document.createElement('div');
      status.className = 'agent-sheet-popover-status';
      status.textContent = statusText;
      sheetPopover.appendChild(status);
      return;
    }
    if (!state.sheets.length) {
      const empty = document.createElement('div');
      empty.className = 'agent-sheet-popover-status';
      empty.textContent = '暂无工作表';
      sheetPopover.appendChild(empty);
      return;
    }
    for (const sheetName of state.sheets) {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = `agent-sheet-option${sheetName === state.activeSheetName ? ' active' : ''}`;
      option.textContent = sheetName;
      option.addEventListener('click', async () => {
        await executeExcelCall({
          objectName: 'Excel.Worksheet',
          memberName: 'activate',
          memberKind: 'method',
          target: { sheetName },
          args: { sheetName },
        });
        sheetPopover.hidden = true;
        await refreshSelection();
      });
      sheetPopover.appendChild(option);
    }
  }

  async function toggleSheetPopover(): Promise<void> {
    if (!sheetPopover.hidden) {
      sheetPopover.hidden = true;
      return;
    }
    sheetPopover.hidden = false;
    if (!excelBridge.isReady()) {
      renderSheetPopover('等待 Excel 连接');
      return;
    }
    renderSheetPopover('正在读取工作表...');
    const context = await executeExcelGetContext({
      scope: 'workbook',
      includeValues: false,
      includeFormulas: false,
      maxCells: 1,
    });
    if (!context.ok) {
      renderSheetPopover(context.error || '工作表不可读');
      return;
    }
    state.sheets = extractSheetNames(context.result);
    const record = asRecord(context.result);
    state.activeSheetName =
      (typeof record?.activeSheetName === 'string' && record.activeSheetName) ||
      (typeof record?.sheetName === 'string' && record.sheetName) ||
      state.sheets[0];
    renderSheetPopover();
  }

  async function refreshSelection(): Promise<void> {
    if (!excelBridge.isReady()) {
      selectionChipText.textContent = '未连接工作簿';
      return;
    }
    const context = await executeExcelGetContext({
      scope: 'selection',
      includeValues: false,
      includeFormulas: false,
      maxCells: 1,
    });
    if (!context.ok || !context.result || typeof context.result !== 'object') {
      selectionChipText.textContent = '选区不可读';
      return;
    }
    updateSelectionChipFromResult(context.result);
  }

  async function sendMessage(text: string, options: SendMessageOptions = {}): Promise<void> {
    const { agentText: userText, displayText, attachments } = buildUserText(text);
    if ((!userText || !displayText) || state.busy) return;
    if (!hasUsableAiSettings(state.settings)) {
      openSettingsDialog(state, updateStatus);
      return;
    }
    const sessionId = state.currentSessionId;
    const previousTurns = state.turns.slice();
    state.turns.push({
      ...createChatTurn('user', userText),
      displayContent: options.displayTextOverride || displayText,
      attachments,
    });
    persistCurrentSession();
    renderMessages();
    input.value = '';
    resizeComposerInput();
    pendingTextFiles = [];
    renderPendingTextFiles();
    updateComposerState();

    const assistantTurn: ChatTurn = {
      ...createChatTurn('assistant', ''),
      streaming: true,
      tools: [],
      toolsExpanded: false,
      parts: [],
    };
    const shouldRenderReasoning = state.behavior.reasoningEffort !== 'auto';
    if (shouldRenderReasoning) {
      startThinkingPart(assistantTurn, true);
    } else {
      startLoadingPart(assistantTurn);
    }
    state.turns.push(assistantTurn);
    setBusy(true);
    persistCurrentSession();
    renderMessages();

    if (!options.skipQuestion) {
      try {
        const question = await maybeAskUserQuestion(state.settings, previousTurns, userText);
        if (question) {
          assistantTurn.streaming = false;
          assistantTurn.parts = [];
          assistantTurn.thinking = '';
          assistantTurn.pendingQuestion = {
            id: crypto.randomUUID(),
            originalUserText: userText,
            displayText,
            question: question.question,
            options: question.options,
            selectionMode: question.selectionMode,
            createdAt: new Date().toISOString(),
            status: 'pending',
          };
          persistCurrentSession();
          renderMessages();
          return;
        }
      } catch (error) {
        console.warn('Failed to prepare clarification question', error);
      } finally {
        if (assistantTurn.pendingQuestion) {
          setBusy(false);
        }
      }
    }

    state.abortController = new AbortController();
    try {
      const result = await runExcelAgent({
        settings: state.settings,
        turns: state.turns.slice(0, -2),
        userText,
        log: operationLogStore.createLogger(),
        fileRuntime,
        approvalRuntime: undefined,
        reasoningEffort: state.behavior.reasoningEffort,
        abortSignal: state.abortController.signal,
        onTextDelta: (delta) => {
          appendTextDelta(assistantTurn, delta);
          scheduleRenderMessages();
        },
        onReasoningStart: () => {
          if (!shouldRenderReasoning) return;
          startThinkingPart(assistantTurn);
          scheduleRenderMessages();
        },
        onReasoningDelta: (delta) => {
          if (!shouldRenderReasoning) return;
          appendThinkingDelta(assistantTurn, delta);
          scheduleRenderMessages();
        },
        onReasoningEnd: () => {
          if (!shouldRenderReasoning) return;
          finishActiveThinking(assistantTurn);
          scheduleRenderMessages();
        },
        onToolEvent: (tool) => {
          upsertToolCall(assistantTurn, tool);
          appendToolPart(assistantTurn, tool.id);
          persistCurrentSession();
          scheduleRenderMessages();
        },
      });
      if (!assistantTurn.content.trim()) {
        assistantTurn.content = result.text;
        if (result.text.trim() && !assistantTurn.parts?.some((part) => part.type === 'text')) {
          finishActiveThinking(assistantTurn);
          ensureTurnParts(assistantTurn).push(createTurnPart('text', { content: result.text }));
        }
      }
      assistantTurn.usage = result.usage;
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === 'AbortError'
          ? '已停止。'
          : `执行失败：${error instanceof Error ? error.message : String(error)}`;
      assistantTurn.content =
        assistantTurn.content.trim().length > 0 ? `${assistantTurn.content}\n\n${message}` : message;
      finishActiveThinking(assistantTurn);
      ensureTurnParts(assistantTurn).push(createTurnPart('text', { content: message }));
    } finally {
      finishActiveThinking(assistantTurn);
      assistantTurn.streaming = false;
      state.abortController = undefined;
      resolveAllApprovals(false);
      setBusy(false);
      persistCurrentSession();
      renderMessages();
      void refreshSelection();
      void maybeGenerateSessionTitle(sessionId);
    }
  }

  function upsertToolCall(turn: ChatTurn, tool: ChatToolCall): void {
    const tools = turn.tools || [];
    const index = tools.findIndex((item) => item.id === tool.id);
    if (index === -1) {
      tools.push({ ...tool, expanded: false });
    } else {
      tools[index] = {
        ...tool,
        expanded: tools[index].expanded ?? false,
      };
    }
    turn.tools = tools;
  }

  composer.addEventListener('submit', (event) => {
    event.preventDefault();
    void sendMessage(input.value);
  });

  input.addEventListener('input', () => {
    resizeComposerInput();
    updateComposerState();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      void sendMessage(input.value);
    }
  });

  reasoningModeSelect.addEventListener('change', () => {
    saveBehaviorPatch({ reasoningEffort: reasoningModeSelect.value as ReasoningEffort });
  });

  stopButton.addEventListener('click', () => {
    resolveAllApprovals(false);
    state.abortController?.abort();
  });

  uploadButton.addEventListener('click', () => {
    uploadInput.value = '';
    uploadInput.click();
  });

  uploadInput.addEventListener('change', () => {
    const files = Array.from(uploadInput.files || []);
    uploadInput.value = '';
    if (!files.length) return;
    void addTextFiles(files);
  });

  input.addEventListener('keyup', (event) => {
    if (event.key === '@') {
      void toggleSheetPopover();
    }
  });

  newSessionButton.addEventListener('click', createNewSession);

  sessionsButton.addEventListener('click', () => {
    renderSessionPopover();
    sessionPopover.hidden = !sessionPopover.hidden;
    if (!sessionPopover.hidden) checkpointPopover.hidden = true;
  });

  checkpointsButton.addEventListener('click', () => {
    void refreshCheckpoints();
    checkpointPopover.hidden = !checkpointPopover.hidden;
    if (!checkpointPopover.hidden) sessionPopover.hidden = true;
  });

  settingsButton.addEventListener('click', () => openSettingsDialog(state, updateStatus));
  selectionChip.addEventListener('click', () => void refreshSelection());
  messages.addEventListener('click', (event) => {
    const anchorButton = (event.target as HTMLElement).closest<HTMLButtonElement>('.agent-excel-anchor');
    if (!anchorButton) return;
    event.preventDefault();
    void selectExcelAnchor({
      sheetName: anchorButton.dataset.sheet || undefined,
      address: anchorButton.dataset.address || '',
      label: anchorButton.textContent || anchorButton.dataset.address || '',
    });
  });
  messages.addEventListener(
    'wheel',
    (event) => {
      const target = event.target as HTMLElement;
      const scroller = target.closest<HTMLElement>(
        '.agent-tool-json, .agent-markdown-code, .agent-file-preview-code, .agent-file-preview-markdown',
      );
      if (!scroller) return;
      const maxScroll = scroller.scrollHeight - scroller.clientHeight;
      if (maxScroll <= 0) return;
      const nextScroll = Math.max(0, Math.min(maxScroll, scroller.scrollTop + event.deltaY));
      if (nextScroll === scroller.scrollTop) return;
      scroller.scrollTop = nextScroll;
      event.preventDefault();
      event.stopPropagation();
    },
    { passive: false },
  );
  root.addEventListener('click', (event) => {
    const target = event.target as Node;
    if (!sheetPopover.hidden && !sheetPopover.contains(target)) {
      sheetPopover.hidden = true;
    }
    if (
      !sessionPopover.hidden &&
      !sessionPopover.contains(target) &&
      !sessionsButton.contains(target)
    ) {
      sessionPopover.hidden = true;
    }
    if (
      !checkpointPopover.hidden &&
      !checkpointPopover.contains(target) &&
      !checkpointsButton.contains(target)
    ) {
      checkpointPopover.hidden = true;
    }
  });
  window.addEventListener('office-agent:bridge-ready', () => {
    updateStatus();
    queueTaskPanePlacement();
    void refreshCheckpoints();
    void refreshSelection();
  });
  window.addEventListener('office-agent:document-ready', () => {
    void refreshCheckpoints();
  });
  window.addEventListener('office-agent:selection', (event) => {
    updateSelectionChipFromResult((event as CustomEvent<unknown>).detail);
  });
  window.addEventListener('resize', queueTaskPanePlacement);
  window.addEventListener('resize', resizeComposerInput);

  updateStatus();
  renderSessionPopover();
  renderCheckpointPopover();
  void refreshCheckpoints();
  renderMessages();
  resizeComposerInput();
  if (!hasUsableAiSettings(state.settings)) {
    openSettingsDialog(state, updateStatus);
  }
  window.setInterval(() => {
    updateStatus();
    void refreshSelection();
  }, 3500);

  function updateComposerState(): void {
    sendButton.disabled = state.busy || (!input.value.trim() && pendingTextFiles.length === 0);
    updateTokenMeter();
  }

  function updateTokenMeter(): void {
    const exactUsage = [...state.turns]
      .reverse()
      .map((turn) => getUsageTotalTokens(turn.usage))
      .find((value): value is number => typeof value === 'number');
    const estimated = state.turns.reduce((total, turn) => total + estimateTokens(turn.content), 0);
    const tokens = exactUsage ?? estimated;
    const percent = Math.max(0, Math.min(1, tokens / TOKEN_METER_LIMIT));
    const detail = `${formatTokenPercent(percent)} · ${formatTokenDetailCount(tokens)} / ${formatTokenDetailCount(
      TOKEN_METER_LIMIT,
    )} 已使用上下文`;
    tokenMeter.style.setProperty('--agent-token-progress', `${Math.round(percent * 360)}deg`);
    tokenMeter.dataset.level = percent >= 0.9 ? 'critical' : percent >= 0.7 ? 'high' : percent >= 0.4 ? 'medium' : 'low';
    tokenMeterValue.textContent = formatTokenCount(tokens);
    tokenMeter.dataset.usageDetail = detail;
    tokenMeter.removeAttribute('title');
    tokenMeter.setAttribute('aria-label', detail);
  }
}

function openSettingsDialog(state: PanelState, onSave: () => void): void {
  const existing = document.querySelector('.agent-modal-backdrop');
  existing?.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'agent-modal-backdrop';
  const modal = document.createElement('form');
  modal.className = 'agent-modal';

  const title = document.createElement('h2');
  title.textContent = '模型设置';

  const baseURL = createField('Base URL', state.settings.baseURL, false);
  const apiKey = createField(
    'API Key',
    state.settings.apiKey,
    true,
    '浏览器直连会让 API Key 暴露在本机浏览器环境中，请只在可信设备使用。',
  );
  const modelId = createField('Model ID', state.settings.modelId, false);

  const includeUsageLabel = document.createElement('label');
  includeUsageLabel.className = 'agent-check-row';
  const includeUsage = document.createElement('input');
  includeUsage.type = 'checkbox';
  includeUsage.checked = state.settings.includeUsage;
  includeUsageLabel.append(includeUsage, document.createTextNode('在流式/工具响应中请求 usage 信息'));

  const feedback = document.createElement('div');
  feedback.className = 'agent-settings-feedback';

  const actions = document.createElement('div');
  actions.className = 'agent-modal-actions';
  const testButton = createButton('测试', '测试模型连接', 'agent-secondary-button');
  const cancelButton = createButton('取消', '关闭设置', 'agent-secondary-button');
  const saveButton = createButton('保存', '保存模型设置', 'agent-primary-button');
  saveButton.type = 'submit';
  actions.append(testButton, cancelButton, saveButton);

  modal.append(title, baseURL.wrap, apiKey.wrap, modelId.wrap, includeUsageLabel, feedback, actions);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  cancelButton.addEventListener('click', () => backdrop.remove());

  testButton.addEventListener('click', async () => {
    feedback.textContent = '正在测试...';
    const draft = collectSettings();
    const result = await checkModelConnection(draft);
    feedback.textContent = result.message;
    feedback.className = `agent-settings-feedback ${result.ok ? 'ok' : 'fail'}`;
    if (result.ok && result.checkedAt) {
      state.settings = saveAiSettings({ ...draft, corsCheckedAt: result.checkedAt });
      onSave();
    }
  });

  modal.addEventListener('submit', (event) => {
    event.preventDefault();
    state.settings = saveAiSettings(collectSettings());
    onSave();
    backdrop.remove();
  });

  function collectSettings(): AiSettings {
    return {
      baseURL: baseURL.input.value,
      apiKey: apiKey.input.value,
      modelId: modelId.input.value,
      includeUsage: includeUsage.checked,
      corsCheckedAt: state.settings.corsCheckedAt,
    };
  }
}

function createField(labelText: string, value: string, secret: boolean, tip?: string): {
  wrap: HTMLLabelElement;
  input: HTMLInputElement;
} {
  const wrap = document.createElement('label');
  wrap.className = 'agent-field';
  const label = document.createElement('span');
  label.className = 'agent-field-label';
  const labelTextNode = document.createElement('span');
  labelTextNode.textContent = labelText;
  label.appendChild(labelTextNode);
  if (tip) {
    const tipTrigger = document.createElement('span');
    tipTrigger.className = 'agent-field-tip';
    tipTrigger.tabIndex = 0;
    tipTrigger.setAttribute('role', 'button');
    tipTrigger.setAttribute('aria-label', tip);
    tipTrigger.appendChild(createGeistIcon('Information'));
    const tooltip = document.createElement('span');
    tooltip.className = 'agent-field-tooltip';
    tooltip.textContent = tip;
    tipTrigger.appendChild(tooltip);
    label.appendChild(tipTrigger);
  }
  const input = document.createElement('input');
  input.type = secret ? 'password' : 'text';
  input.value = value;
  input.autocomplete = 'off';
  wrap.append(label, input);
  return { wrap, input };
}
