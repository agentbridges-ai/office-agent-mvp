import { tool } from 'ai';
import { z } from 'zod';
import { createApprovalDeniedResult, type ToolApprovalRuntime } from './approval';
import { officeBridge } from './bridge';
import { createOfficeApiTools } from './office-tools';
import { executeOfficeSaveDocument } from './save-tools';
import type { OperationLogger, ToolResult } from './types';

const MAX_WORD_TEXT_LENGTH = 10000;
const MIN_FONT_SIZE = 1;
const MAX_FONT_SIZE = 400;

export const wordContextSchema = z.object({
  includeSelection: z.boolean().optional(),
});

export const wordInsertTextSchema = z.object({
  text: z.string().min(1).max(MAX_WORD_TEXT_LENGTH),
});

export const wordFormatSelectionSchema = z.object({
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  fontSize: z.number().int().min(MIN_FONT_SIZE).max(MAX_FONT_SIZE).optional(),
});

const wordSaveDocumentSchema = z.object({});

type WordInsertTextInput = z.infer<typeof wordInsertTextSchema>;
type WordFormatSelectionInput = z.infer<typeof wordFormatSelectionSchema>;

async function requestWordApproval(
  approvalRuntime: ToolApprovalRuntime | undefined,
  toolName: string,
  summary: string,
  input: unknown,
  log: OperationLogger | undefined,
): Promise<ToolResult | undefined> {
  if (!approvalRuntime) return undefined;
  const approved = await approvalRuntime.request({ toolName, summary, input });
  if (approved) return undefined;
  const result = createApprovalDeniedResult();
  log?.(toolName, summary, result);
  return result;
}

export async function executeWordGetContext(
  input: z.infer<typeof wordContextSchema> = {},
  log?: OperationLogger,
): Promise<ToolResult> {
  const result = await officeBridge.execute('wordGetContext', input);
  log?.('word_get_context', 'current document', result);
  return result;
}

export async function executeWordInsertText(input: WordInsertTextInput, log?: OperationLogger): Promise<ToolResult> {
  const result = await officeBridge.execute('wordInsertText', input);
  log?.('word_insert_text', `${input.text.length} chars`, result);
  return result;
}

export async function executeWordFormatSelection(
  input: WordFormatSelectionInput,
  log?: OperationLogger,
): Promise<ToolResult> {
  const result = await officeBridge.execute('wordFormatSelection', input);
  log?.('word_format_selection', Object.keys(input).join(', ') || 'none', result);
  return result;
}

export async function executeWordSaveDocument(log?: OperationLogger): Promise<ToolResult> {
  return executeOfficeSaveDocument('word_save_document', 'save current document', log);
}

export function createWordTools(log: OperationLogger, approvalRuntime?: ToolApprovalRuntime) {
  return {
    word_get_context: tool({
      description: 'Read basic context from the current browser Word document.',
      inputSchema: wordContextSchema,
      execute: async (input) => executeWordGetContext(input, log),
    }),
    word_insert_text: tool({
      description: 'Insert text into the current browser Word document using the real ONLYOFFICE runtime.',
      inputSchema: wordInsertTextSchema,
      execute: async (input) => {
        const denied = await requestWordApproval(approvalRuntime, 'word_insert_text', 'insert text', input, log);
        return denied || executeWordInsertText(input, log);
      },
    }),
    word_format_selection: tool({
      description: 'Apply basic formatting to the current Word selection.',
      inputSchema: wordFormatSelectionSchema,
      execute: async (input) => {
        const denied = await requestWordApproval(approvalRuntime, 'word_format_selection', 'format selection', input, log);
        return denied || executeWordFormatSelection(input, log);
      },
    }),
    word_save_document: tool({
      description: 'Save the current Word document through the browser-local save bridge.',
      inputSchema: wordSaveDocumentSchema,
      execute: async () => {
        const denied = await requestWordApproval(approvalRuntime, 'word_save_document', 'save document', {}, log);
        return denied || executeWordSaveDocument(log);
      },
    }),
    ...createOfficeApiTools(log, approvalRuntime),
  };
}
