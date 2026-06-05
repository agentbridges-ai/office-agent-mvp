import { tool } from 'ai';
import { z } from 'zod';
import { createApprovalDeniedResult, type ToolApprovalRuntime } from './approval';
import { officeBridge } from './bridge';
import { createOfficeApiTools } from './office-tools';
import { executeOfficeSaveDocument } from './save-tools';
import type { OperationLogger, ToolResult } from './types';

const MAX_PPT_TEXT_LENGTH = 10000;
const MIN_BOX_SIZE = 0.1;
const MAX_BOX_SIZE = 20;

export const pptContextSchema = z.object({
  includeSelection: z.boolean().optional(),
});

export const pptAddSlideSchema = z.object({
  layoutIndex: z.number().int().min(0).optional(),
});

export const pptAddTextBoxSchema = z.object({
  text: z.string().min(1).max(MAX_PPT_TEXT_LENGTH),
  x: z.number().min(0).max(MAX_BOX_SIZE).optional(),
  y: z.number().min(0).max(MAX_BOX_SIZE).optional(),
  width: z.number().min(MIN_BOX_SIZE).max(MAX_BOX_SIZE).optional(),
  height: z.number().min(MIN_BOX_SIZE).max(MAX_BOX_SIZE).optional(),
});

const pptSaveDocumentSchema = z.object({});

type PptAddSlideInput = z.infer<typeof pptAddSlideSchema>;
type PptAddTextBoxInput = z.infer<typeof pptAddTextBoxSchema>;

async function requestPptApproval(
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

export async function executePptGetContext(
  input: z.infer<typeof pptContextSchema> = {},
  log?: OperationLogger,
): Promise<ToolResult> {
  const result = await officeBridge.execute('pptGetContext', input);
  log?.('ppt_get_context', 'current presentation', result);
  return result;
}

export async function executePptAddSlide(input: PptAddSlideInput, log?: OperationLogger): Promise<ToolResult> {
  const result = await officeBridge.execute('pptAddSlide', input);
  log?.('ppt_add_slide', input.layoutIndex === undefined ? 'default layout' : `layout ${input.layoutIndex}`, result);
  return result;
}

export async function executePptAddTextBox(input: PptAddTextBoxInput, log?: OperationLogger): Promise<ToolResult> {
  const result = await officeBridge.execute('pptAddTextBox', input);
  log?.('ppt_add_text_box', `${input.text.length} chars`, result);
  return result;
}

export async function executePptSaveDocument(log?: OperationLogger): Promise<ToolResult> {
  return executeOfficeSaveDocument('ppt_save_document', 'save current presentation', log);
}

export function createPptTools(log: OperationLogger, approvalRuntime?: ToolApprovalRuntime) {
  return {
    ppt_get_context: tool({
      description: 'Read basic context from the current browser PowerPoint presentation.',
      inputSchema: pptContextSchema,
      execute: async (input) => executePptGetContext(input, log),
    }),
    ppt_add_slide: tool({
      description: 'Add a slide to the current browser presentation using the real ONLYOFFICE runtime.',
      inputSchema: pptAddSlideSchema,
      execute: async (input) => {
        const denied = await requestPptApproval(approvalRuntime, 'ppt_add_slide', 'add slide', input, log);
        return denied || executePptAddSlide(input, log);
      },
    }),
    ppt_add_text_box: tool({
      description: 'Add a text box to the current browser presentation slide.',
      inputSchema: pptAddTextBoxSchema,
      execute: async (input) => {
        const denied = await requestPptApproval(approvalRuntime, 'ppt_add_text_box', 'add text box', input, log);
        return denied || executePptAddTextBox(input, log);
      },
    }),
    ppt_save_document: tool({
      description: 'Save the current presentation through the browser-local save bridge.',
      inputSchema: pptSaveDocumentSchema,
      execute: async () => {
        const denied = await requestPptApproval(approvalRuntime, 'ppt_save_document', 'save presentation', {}, log);
        return denied || executePptSaveDocument(log);
      },
    }),
    ...createOfficeApiTools(log, approvalRuntime),
  };
}
