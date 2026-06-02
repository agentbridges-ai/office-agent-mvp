export interface ToolApprovalInput {
  toolName: string;
  summary: string;
  input: unknown;
}

export interface ToolApprovalRuntime {
  request(input: ToolApprovalInput): Promise<boolean>;
}

export function createApprovalDeniedResult(reason = '用户未批准工具执行。') {
  return {
    ok: false,
    supportLevel: 'partial' as const,
    error: reason,
  };
}
