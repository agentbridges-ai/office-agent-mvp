import type { OperationLogEntry, OperationLogger, ToolResult } from './types';

export class OperationLogStore extends EventTarget {
  private entries: OperationLogEntry[] = [];

  getEntries(): OperationLogEntry[] {
    return [...this.entries];
  }

  createLogger(): OperationLogger {
    return (toolName: string, summary: string, result: ToolResult): OperationLogEntry => {
      const entry: OperationLogEntry = {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        toolName,
        summary,
        ok: result.ok,
        supportLevel: result.supportLevel,
        error: result.error,
      };
      result.operationLogId = entry.id;
      this.entries = [entry, ...this.entries].slice(0, 80);
      this.dispatchEvent(new CustomEvent('change', { detail: entry }));
      return entry;
    };
  }

  clear(): void {
    this.entries = [];
    this.dispatchEvent(new CustomEvent('change'));
  }
}

export const operationLogStore = new OperationLogStore();

