import { tool } from 'ai';
import { z } from 'zod';
import { createApprovalDeniedResult, type ToolApprovalRuntime } from './approval';
import { officeBridge } from './bridge';
import type { OfficeApiCallInput, OperationLogger, ToolResult } from './types';

const OFFICE_API_TIMEOUT_MS = 30000;

export const officeApiCatalogSchema = z.object({
  view: z.enum(['overview', 'category', 'object', 'search', 'detail']).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  objectType: z.string().optional(),
  memberName: z.string().optional(),
  query: z.string().optional(),
  limit: z.number().int().positive().max(5000).optional(),
});

export const officeApiCallSchema = z.object({
  target: z
    .object({
      root: z.enum(['editor', 'Editor', 'Asc', 'AscCommon', 'AscCommonExcel', 'Common', 'cellInfo', 'CellInfo']),
    })
    .optional(),
  memberName: z.string(),
  args: z.array(z.unknown()).max(20).optional(),
});

function needsOfficeApiApproval(memberName: string): boolean {
  const member = memberName.toLowerCase();
  if (/^(asc_)?(get|is|can|has|find|query|read)/.test(member)) return false;
  return true;
}

function summarizeOfficeApiCall(input: OfficeApiCallInput): string {
  return `${input.target?.root || 'editor'}.${input.memberName}`;
}

async function requestOfficeApiApproval(
  approvalRuntime: ToolApprovalRuntime | undefined,
  input: OfficeApiCallInput,
  log: OperationLogger,
): Promise<ToolResult | undefined> {
  if (!approvalRuntime || !needsOfficeApiApproval(input.memberName)) return undefined;
  const summary = summarizeOfficeApiCall(input);
  const approved = await approvalRuntime.request({
    toolName: 'office_api_call',
    summary,
    input,
  });
  if (approved) return undefined;
  const result = createApprovalDeniedResult();
  log('office_api_call', summary, result);
  return result;
}

export function createOfficeApiTools(log: OperationLogger, approvalRuntime?: ToolApprovalRuntime) {
  return {
    office_api_catalog: tool({
      description:
        'Progressively inspect every ONLYOFFICE API exposed by the current browser editor. Start with view="overview", then use category/object/search/detail to drill down without flooding context.',
      inputSchema: officeApiCatalogSchema,
      execute: async (input) => {
        const result = await officeBridge.execute('officeApiCatalog', input, OFFICE_API_TIMEOUT_MS);
        log(
          'office_api_catalog',
          [input.view || 'overview', input.category, input.objectType, input.query].filter(Boolean).join(' '),
          result,
        );
        return result;
      },
    }),
    office_api_call: tool({
      description:
        'Call a discovered ONLYOFFICE runtime API method. Discover available target roots and methods with office_api_catalog first. Arguments must be JSON-serializable.',
      inputSchema: officeApiCallSchema,
      execute: async (input) => {
        const denied = await requestOfficeApiApproval(approvalRuntime, input, log);
        if (denied) return denied;
        const result = await officeBridge.execute('officeApiCall', input, OFFICE_API_TIMEOUT_MS);
        log('office_api_call', summarizeOfficeApiCall(input), result);
        return result;
      },
    }),
  };
}
