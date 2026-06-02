import { tool } from 'ai';
import { z } from 'zod';
import { createApprovalDeniedResult, type ToolApprovalRuntime } from './approval';
import type { OperationLogger, ToolResult } from './types';

export interface RuntimeTextFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  lineCount: number;
  createdAt: string;
  source: 'upload' | 'generated';
  description?: string;
}

export interface StoredTextFile extends RuntimeTextFile {
  content: string;
  lines: string[];
  objectUrl?: string;
}

export interface TextFileRuntime {
  addFile(input: {
    name: string;
    size?: number;
    mimeType?: string;
    content: string;
    source: RuntimeTextFile['source'];
    description?: string;
  }): RuntimeTextFile;
  removeFile(fileId: string): void;
  listFiles(): RuntimeTextFile[];
  getFile(fileId: string): StoredTextFile | undefined;
  getDownloadUrl(fileId: string): string | undefined;
  readFile(input: ReadFileInput, log?: OperationLogger): ToolResult;
  writeFile(input: WriteFileInput, log?: OperationLogger): ToolResult;
}

const MAX_READ_LINES = 300;
const DEFAULT_READ_LINES = 120;
const MAX_SEARCH_MATCHES = 80;
const DEFAULT_SEARCH_MATCHES = 20;
const MAX_CONTEXT_LINES = 10;
const MAX_TOOL_TEXT_CHARS = 24_000;
const MAX_WRITE_CHARS = 1_000_000;
const TEXT_EXTENSIONS = new Set([
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

const textFileMetadataSchema = z.object({
  fileId: z.string().optional(),
  fileName: z.string().optional(),
});

export const readFileSchema = textFileMetadataSchema.extend({
  mode: z.enum(['metadata', 'read', 'search']).optional(),
  startLine: z.number().int().positive().optional(),
  lineCount: z.number().int().positive().max(MAX_READ_LINES).optional(),
  query: z.string().optional(),
  regex: z.boolean().optional(),
  caseSensitive: z.boolean().optional(),
  contextLines: z.number().int().min(0).max(MAX_CONTEXT_LINES).optional(),
  maxMatches: z.number().int().positive().max(MAX_SEARCH_MATCHES).optional(),
});

export const writeFileSchema = z.object({
  fileName: z.string().min(1).max(160),
  content: z.string().max(MAX_WRITE_CHARS),
  mimeType: z.string().optional(),
  description: z.string().max(500).optional(),
});

export type ReadFileInput = z.infer<typeof readFileSchema>;
export type WriteFileInput = z.infer<typeof writeFileSchema>;

function toLineArray(content: string): string[] {
  return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
}

function metadataOf(file: StoredTextFile): RuntimeTextFile {
  const { content: _content, lines: _lines, objectUrl: _objectUrl, ...metadata } = file;
  return metadata;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

function getExtension(fileName: string): string {
  const match = /\.([^.]+)$/.exec(fileName.trim());
  return match ? match[1].toLowerCase() : '';
}

function normalizeOutputFileName(fileName: string): string | undefined {
  const trimmed = fileName.trim();
  if (!trimmed || /[/\\]/.test(trimmed) || trimmed.includes('..')) return undefined;
  const safe = trimmed.replace(/[^\w .()[\]{}@+-]/g, '_').replace(/\s+/g, ' ').slice(0, 140).trim();
  if (!safe) return undefined;
  return getExtension(safe) ? safe : `${safe}.txt`;
}

function isTextName(fileName: string): boolean {
  const extension = getExtension(fileName);
  return !extension || TEXT_EXTENSIONS.has(extension);
}

function supportedResult<T>(result: T): ToolResult<T> {
  return {
    ok: true,
    supportLevel: 'supported',
    result,
  };
}

function errorResult(error: string): ToolResult {
  return {
    ok: false,
    supportLevel: 'supported',
    error,
  };
}

function findFile(files: Map<string, StoredTextFile>, input: ReadFileInput): StoredTextFile | ToolResult {
  if (input.fileId) {
    const file = files.get(input.fileId);
    return file || errorResult(`File not found: ${input.fileId}. Use read_file mode="metadata" to list available files.`);
  }
  if (input.fileName) {
    const exact = [...files.values()].filter((file) => file.name.toLowerCase() === input.fileName?.toLowerCase());
    if (exact.length === 1) return exact[0];
    if (exact.length > 1) {
      return errorResult(`Multiple files are named "${input.fileName}". Retry with fileId.`);
    }
    const fuzzy = [...files.values()].filter((file) =>
      file.name.toLowerCase().includes((input.fileName || '').toLowerCase()),
    );
    if (fuzzy.length === 1) return fuzzy[0];
    return errorResult(`File not found: ${input.fileName}. Use read_file mode="metadata" to list available files.`);
  }
  if (files.size === 1) return [...files.values()][0];
  return errorResult('Specify fileId or fileName. Use read_file mode="metadata" to list available files.');
}

function collectLineWindow(file: StoredTextFile, startLine: number, requestedLineCount: number) {
  const startIndex = Math.max(0, startLine - 1);
  const endIndex = Math.min(file.lines.length, startIndex + requestedLineCount);
  let chars = 0;
  const lines: Array<{ line: number; text: string }> = [];
  let truncatedByChars = false;
  for (let index = startIndex; index < endIndex; index += 1) {
    const text = file.lines[index] ?? '';
    chars += text.length + 12;
    if (chars > MAX_TOOL_TEXT_CHARS) {
      truncatedByChars = true;
      break;
    }
    lines.push({ line: index + 1, text });
  }
  const nextStartLine = startIndex + lines.length < file.lines.length ? startIndex + lines.length + 1 : undefined;
  return {
    lines,
    startLine: lines[0]?.line,
    endLine: lines.at(-1)?.line,
    nextStartLine,
    truncated: truncatedByChars || endIndex < file.lines.length,
  };
}

function searchFile(file: StoredTextFile, input: ReadFileInput): ToolResult {
  const query = input.query || '';
  if (!query) return errorResult('read_file mode="search" requires query.');
  const maxMatches = Math.min(input.maxMatches || DEFAULT_SEARCH_MATCHES, MAX_SEARCH_MATCHES);
  const contextLines = Math.min(input.contextLines || 0, MAX_CONTEXT_LINES);
  let matcher: (line: string) => boolean;
  if (input.regex) {
    try {
      const flags = input.caseSensitive ? '' : 'i';
      const regex = new RegExp(query, flags);
      matcher = (line) => regex.test(line);
    } catch (error) {
      return errorResult(`Invalid regular expression: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    const needle = input.caseSensitive ? query : query.toLowerCase();
    matcher = (line) => (input.caseSensitive ? line : line.toLowerCase()).includes(needle);
  }

  const matches: Array<{
    line: number;
    text: string;
    before?: Array<{ line: number; text: string }>;
    after?: Array<{ line: number; text: string }>;
  }> = [];
  let totalMatches = 0;
  let chars = 0;
  for (let index = 0; index < file.lines.length; index += 1) {
    const text = file.lines[index] ?? '';
    if (!matcher(text)) continue;
    totalMatches += 1;
    if (matches.length >= maxMatches || chars > MAX_TOOL_TEXT_CHARS) continue;
    const beforeStart = Math.max(0, index - contextLines);
    const afterEnd = Math.min(file.lines.length, index + contextLines + 1);
    const before = file.lines.slice(beforeStart, index).map((line, offset) => ({
      line: beforeStart + offset + 1,
      text: line,
    }));
    const after = file.lines.slice(index + 1, afterEnd).map((line, offset) => ({
      line: index + offset + 2,
      text: line,
    }));
    chars += text.length + before.reduce((sum, item) => sum + item.text.length, 0) + after.reduce((sum, item) => sum + item.text.length, 0);
    matches.push({
      line: index + 1,
      text,
      ...(before.length ? { before } : {}),
      ...(after.length ? { after } : {}),
    });
  }

  return supportedResult({
    file: metadataOf(file),
    mode: 'search',
    query,
    totalMatches,
    returnedMatches: matches.length,
    truncated: matches.length < totalMatches,
    matches,
  });
}

export function createTextFileRuntime(): TextFileRuntime {
  const files = new Map<string, StoredTextFile>();

  function addFile(input: {
    name: string;
    size?: number;
    mimeType?: string;
    content: string;
    source: RuntimeTextFile['source'];
    description?: string;
  }): RuntimeTextFile {
    const content = input.content;
    const file: StoredTextFile = {
      id: `file_${crypto.randomUUID()}`,
      name: input.name,
      size: input.size ?? byteLength(content),
      mimeType: input.mimeType || 'text/plain;charset=utf-8',
      lineCount: toLineArray(content).length,
      createdAt: new Date().toISOString(),
      source: input.source,
      description: input.description,
      content,
      lines: toLineArray(content),
    };
    files.set(file.id, file);
    return metadataOf(file);
  }

  function removeFile(fileId: string): void {
    const file = files.get(fileId);
    if (file?.objectUrl) URL.revokeObjectURL(file.objectUrl);
    files.delete(fileId);
  }

  function listFiles(): RuntimeTextFile[] {
    return [...files.values()].map(metadataOf);
  }

  function getFile(fileId: string): StoredTextFile | undefined {
    return files.get(fileId);
  }

  function getDownloadUrl(fileId: string): string | undefined {
    const file = files.get(fileId);
    if (!file) return undefined;
    if (!file.objectUrl) {
      file.objectUrl = URL.createObjectURL(new Blob([file.content], { type: file.mimeType || 'text/plain;charset=utf-8' }));
    }
    return file.objectUrl;
  }

  function readFile(input: ReadFileInput, log?: OperationLogger): ToolResult {
    const mode = input.mode || (input.query ? 'search' : 'read');
    if (mode === 'metadata') {
      const target = input.fileId || input.fileName ? findFile(files, input) : undefined;
      const result =
        target && 'ok' in target
          ? target
          : supportedResult({
              files: target ? [metadataOf(target as StoredTextFile)] : listFiles(),
              count: target ? 1 : files.size,
              note: 'Use mode="read" with startLine/lineCount for line windows, or mode="search" with query for targeted lookup.',
            });
      log?.('read_file', input.fileId || input.fileName || 'metadata', result);
      return result;
    }

    const file = findFile(files, input);
    if ('ok' in file) {
      log?.('read_file', input.fileId || input.fileName || mode, file);
      return file;
    }

    if (mode === 'search') {
      const result = searchFile(file, input);
      log?.('read_file', `${file.name} search ${input.query || ''}`, result);
      return result;
    }

    const lineCount = Math.min(input.lineCount || DEFAULT_READ_LINES, MAX_READ_LINES);
    const startLine = Math.max(1, input.startLine || 1);
    const window = collectLineWindow(file, startLine, lineCount);
    const result = supportedResult({
      file: metadataOf(file),
      mode: 'read',
      requested: { startLine, lineCount },
      ...window,
    });
    log?.('read_file', `${file.name} ${window.startLine || startLine}:${window.endLine || startLine}`, result);
    return result;
  }

  function writeFile(input: WriteFileInput, log?: OperationLogger): ToolResult {
    const safeName = normalizeOutputFileName(input.fileName);
    if (!safeName) {
      const result = errorResult('fileName must be a simple text file name without path separators or "..".');
      log?.('write_file', input.fileName, result);
      return result;
    }
    if (!isTextName(safeName)) {
      const result = errorResult('write_file only supports text-oriented file extensions.');
      log?.('write_file', safeName, result);
      return result;
    }
    const file = addFile({
      name: safeName,
      content: input.content,
      mimeType: input.mimeType || 'text/plain;charset=utf-8',
      source: 'generated',
      description: input.description,
    });
    const result = supportedResult({
      file,
      summary: `${safeName} created (${formatBytes(file.size)}, ${file.lineCount} lines).`,
    });
    log?.('write_file', safeName, result);
    return result;
  }

  return {
    addFile,
    removeFile,
    listFiles,
    getFile,
    getDownloadUrl,
    readFile,
    writeFile,
  };
}

export function createFileTools(runtime: TextFileRuntime, log: OperationLogger, approvalRuntime?: ToolApprovalRuntime) {
  return {
    read_file: tool({
      description:
        'Read browser-local text files by metadata, bounded line ranges, or search. Use this instead of asking for full uploaded file content.',
      inputSchema: readFileSchema,
      execute: async (input) => runtime.readFile(input, log),
    }),
    write_file: tool({
      description:
        'Create a browser-local downloadable text file for the user. Use simple text file names only; no paths.',
      inputSchema: writeFileSchema,
      execute: async (input) => {
        if (approvalRuntime) {
          const approved = await approvalRuntime.request({
            toolName: 'write_file',
            summary: `生成文本文件 ${input.fileName}`,
            input,
          });
          if (!approved) {
            const result = createApprovalDeniedResult();
            log('write_file', input.fileName, result);
            return result;
          }
        }
        return runtime.writeFile(input, log);
      },
    }),
  };
}
