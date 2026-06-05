import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import XLSX from 'xlsx';
import { parseCapabilityWorkbook } from '../scripts/capability-parser';
import { excelCapabilities } from '../lib/agent/capabilities';

function createCapabilityWorkbook(): string {
  const dir = mkdtempSync(join(tmpdir(), 'office-agent-capabilities-'));
  const filePath = join(dir, 'capabilities.xlsx');
  const rows = [
    ['header 1'],
    ['header 2'],
    ['header 3'],
    ['header 4'],
    ['工作簿', 'Excel.Workbook', 'getActiveWorksheet()', '', '', ''],
    ['单元格', 'Excel.Range', 'clear(); select()', 'values; address', '', ''],
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), 'Sheet1');
  XLSX.writeFile(workbook, filePath);
  return filePath;
}

describe('Excel capability registry', () => {
  it('parses workbook rows into capability records', () => {
    const filePath = createCapabilityWorkbook();
    try {
      const capabilities = parseCapabilityWorkbook(filePath);

      expect(capabilities.length).toBeGreaterThan(7);
      expect(
        capabilities.some(
          (capability) =>
            capability.objectName === 'Excel.Workbook' &&
            capability.memberName === 'getActiveWorksheet' &&
            capability.memberKind === 'method',
        ),
      ).toBe(true);
      expect(
        capabilities.find(
          (capability) =>
            capability.objectName === 'Excel.Range' &&
            capability.memberName === 'values' &&
            capability.memberKind === 'property',
        )?.supportLevel,
      ).toBe('supported');
    } finally {
      rmSync(join(filePath, '..'), { recursive: true, force: true });
    }
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
