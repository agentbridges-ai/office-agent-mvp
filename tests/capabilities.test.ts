import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseCapabilityWorkbook } from '../scripts/capability-parser';
import { excelCapabilities } from '../lib/agent/capabilities';

describe('Excel capability registry', () => {
  it('parses the reference workbook into a full registry', () => {
    const capabilities = parseCapabilityWorkbook(resolve(process.cwd(), 'chatgpt-ms-office-api文档参考.xlsx'));
    expect(capabilities.length).toBeGreaterThan(600);
    expect(
      capabilities.some(
        (capability) =>
          capability.objectName === 'Excel.Range' &&
          capability.memberName === 'values' &&
          capability.memberKind === 'property',
      ),
    ).toBe(true);
  });

  it('ships generated capabilities with support labels', () => {
    expect(excelCapabilities.length).toBeGreaterThan(600);
    expect(excelCapabilities.some((capability) => capability.supportLevel === 'unsupported')).toBe(true);
    expect(
      excelCapabilities.find(
        (capability) =>
          capability.objectName === 'Excel.Range' &&
          capability.memberName === 'values' &&
          capability.memberKind === 'property',
      )?.supportLevel,
    ).toBe('supported');
    expect(
      excelCapabilities.find(
        (capability) =>
          capability.objectName === 'Excel.Range Format' &&
          capability.memberName === 'horizontalAlignment' &&
          capability.memberKind === 'property',
      )?.supportLevel,
    ).toBe('supported');
  });
});
