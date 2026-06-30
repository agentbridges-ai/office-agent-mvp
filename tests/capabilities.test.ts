import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseCapabilityWorkbook } from '../scripts/capability-parser';
import { excelCapabilities } from '../lib/agent/capabilities';

describe('Excel capability registry', () => {
  const referenceWorkbookPath = resolve(process.cwd(), 'chatgpt-ms-office-api文档参考.xlsx');
  const itIfReferenceWorkbookExists = existsSync(referenceWorkbookPath) ? it : it.skip;

  itIfReferenceWorkbookExists('parses the reference workbook into a full registry', () => {
    const capabilities = parseCapabilityWorkbook(referenceWorkbookPath);
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
