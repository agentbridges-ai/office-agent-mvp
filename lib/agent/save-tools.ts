import type { SaveCompletion } from '../onlyoffice-editor';
import type { OperationLogger, ToolResult } from './types';

export async function executeOfficeSaveDocument(
  toolName: string,
  summary: string,
  log?: OperationLogger,
): Promise<ToolResult<SaveCompletion>> {
  try {
    const { saveCurrentOnlyOfficeDocument } = await import('../onlyoffice-editor');
    const saved = await saveCurrentOnlyOfficeDocument();
    const result: ToolResult<SaveCompletion> = { ok: true, supportLevel: 'supported', result: saved };
    log?.(toolName, summary, result);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown ONLYOFFICE save error';
    const result: ToolResult<SaveCompletion> = { ok: false, supportLevel: 'partial', error: message };
    log?.(toolName, summary, result);
    return result;
  }
}
