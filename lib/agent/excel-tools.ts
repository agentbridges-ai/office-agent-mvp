import { tool } from 'ai';
import { z } from 'zod';
import { getCapability, isExecutableCapability, queryCapabilities } from './capabilities';
import { excelBridge } from './bridge';
import { createApprovalDeniedResult, type ToolApprovalRuntime } from './approval';
import { createOfficeApiTools } from './office-tools';
import type {
  CapabilityMemberKind,
  ExcelCallInput,
  ExcelContextInput,
  OperationLogger,
  ToolResult,
} from './types';

const targetSchema = z
  .object({
    sheetName: z.string().optional(),
    address: z.string().optional(),
  })
  .optional();

export const excelContextSchema = z.object({
  scope: z.enum(['workbook', 'worksheet', 'selection', 'range']),
  sheetName: z.string().optional(),
  address: z.string().optional(),
  includeValues: z.boolean().optional(),
  includeFormulas: z.boolean().optional(),
  maxCells: z.number().int().positive().max(2000).optional(),
});

export const excelCallSchema = z.object({
  objectName: z.string(),
  memberName: z.string(),
  memberKind: z.enum(['method', 'property', 'event', 'field']),
  target: targetSchema,
  args: z.record(z.string(), z.unknown()).optional(),
});

const capabilityQuerySchema = z.object({
  query: z.string().optional(),
  objectName: z.string().optional(),
  supportLevel: z.enum(['supported', 'partial', 'unsupported']).optional(),
});

const batchSchema = z.object({
  calls: z.array(excelCallSchema).min(1).max(20),
});

function unsupported(message: string): ToolResult {
  return {
    ok: false,
    supportLevel: 'unsupported',
    error: message,
  };
}

function summarizeCall(input: ExcelCallInput): string {
  const target = input.target?.address
    ? `${input.target.sheetName ? `${input.target.sheetName}!` : ''}${input.target.address}`
    : input.target?.sheetName || 'current selection';
  return `${input.objectName}.${input.memberName} on ${target}`;
}

function needsExcelApproval(input: ExcelCallInput): boolean {
  const member = input.memberName.toLowerCase();
  const objectName = input.objectName.toLowerCase();
  if (member === 'select' || member === 'activate' || member === 'address') return false;
  if (member.startsWith('get') || member.startsWith('load')) return false;
  if (objectName.includes('range') && ['values', 'formulas'].includes(member)) return true;
  return [
    'add',
    'apply',
    'autofitcolumns',
    'autofitrows',
    'bold',
    'clear',
    'color',
    'delete',
    'format',
    'insert',
    'merge',
    'name',
    'numberformat',
    'set',
    'size',
    'sort',
    'unmerge',
  ].some((keyword) => member.includes(keyword));
}

export async function executeExcelGetContext(
  input: ExcelContextInput,
  log?: OperationLogger,
): Promise<ToolResult> {
  const result = await excelBridge.execute('getContext', { ...input });
  log?.('excel_get_context', `${input.scope}${input.address ? ` ${input.address}` : ''}`, result);
  return result;
}

export async function executeExcelCall(input: ExcelCallInput, log?: OperationLogger): Promise<ToolResult> {
  const capability = getCapability(input.objectName, input.memberName, input.memberKind);
  if (!capability) {
    const result = unsupported(
      `Unknown Excel capability: ${input.objectName}.${input.memberName} (${input.memberKind}).`,
    );
    log?.('excel_call', summarizeCall(input), result);
    return result;
  }

  if (!isExecutableCapability(capability)) {
    const result = unsupported(
      capability.notes ||
        `Capability is registered but not executable in the browser bridge yet: ${capability.id}.`,
    );
    log?.('excel_call', summarizeCall(input), result);
    return result;
  }

  const result = await excelBridge.execute('call', {
    ...input,
    capabilityId: capability.id,
  });
  result.supportLevel = result.supportLevel || capability.supportLevel;
  log?.('excel_call', summarizeCall(input), result);
  return result;
}

export async function executeExcelBatch(
  calls: ExcelCallInput[],
  log?: OperationLogger,
): Promise<ToolResult<{ results: ToolResult[] }>> {
  const results: ToolResult[] = [];
  for (const call of calls) {
    results.push(await executeExcelCall(call, log));
  }
  const ok = results.every((result) => result.ok);
  const result: ToolResult<{ results: ToolResult[] }> = {
    ok,
    supportLevel: ok ? 'supported' : 'partial',
    result: { results },
    error: ok ? undefined : 'One or more Excel operations failed.',
  };
  log?.('excel_batch', `${calls.length} calls`, result);
  return result;
}

async function requestExcelApproval(
  approvalRuntime: ToolApprovalRuntime | undefined,
  input: ExcelCallInput,
  log: OperationLogger,
): Promise<ToolResult | undefined> {
  if (!approvalRuntime || !needsExcelApproval(input)) return undefined;
  const approved = await approvalRuntime.request({
    toolName: 'excel_call',
    summary: summarizeCall(input),
    input,
  });
  if (approved) return undefined;
  const result = createApprovalDeniedResult();
  log('excel_call', summarizeCall(input), result);
  return result;
}

export function createExcelTools(log: OperationLogger, approvalRuntime?: ToolApprovalRuntime) {
  return {
    excel_get_context: tool({
      description:
        'Read workbook, worksheet, selection, or range context from the current browser Excel workbook.',
      inputSchema: excelContextSchema,
      execute: async (input) => executeExcelGetContext(input, log),
    }),
    excel_call: tool({
      description:
        'Execute one mapped Excel API operation. Use excel_capabilities first if unsure whether a member is supported.',
      inputSchema: excelCallSchema,
      execute: async (input) => {
        const denied = await requestExcelApproval(approvalRuntime, input, log);
        return denied || executeExcelCall(input, log);
      },
    }),
    excel_batch: tool({
      description: 'Execute up to 20 Excel operations in sequence.',
      inputSchema: batchSchema,
      execute: async ({ calls }) => {
        if (approvalRuntime && calls.some(needsExcelApproval)) {
          const approved = await approvalRuntime.request({
            toolName: 'excel_batch',
            summary: `${calls.length} 个 Excel 操作`,
            input: { calls },
          });
          if (!approved) {
            const result = createApprovalDeniedResult();
            log('excel_batch', `${calls.length} calls`, result);
            return result;
          }
        }
        return executeExcelBatch(calls, log);
      },
    }),
    excel_capabilities: tool({
      description:
        'Search the complete Excel API capability registry, including supported, partial, and unsupported entries.',
      inputSchema: capabilityQuerySchema,
      execute: async (input) => {
        const capabilities = queryCapabilities({
          ...input,
          limit: 80,
        });
        const result: ToolResult = {
          ok: true,
          supportLevel: 'supported',
          result: {
            count: capabilities.length,
            capabilities,
          },
        };
        log(
          'excel_capabilities',
          [input.query, input.objectName, input.supportLevel].filter(Boolean).join(' ') || 'all',
          result,
        );
        return result;
      },
    }),
    ...createOfficeApiTools(log, approvalRuntime),
  };
}

export function normalizeMemberKind(value: string): CapabilityMemberKind {
  if (value === 'property' || value === 'event' || value === 'field') return value;
  return 'method';
}
