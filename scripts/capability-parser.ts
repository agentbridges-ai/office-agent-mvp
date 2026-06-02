import XLSX from 'xlsx';
import type { CapabilityMemberKind, ExcelCapability, SupportLevel } from '../lib/agent/types';

const KIND_BY_COLUMN: Array<{
  columnIndex: number;
  kind: CapabilityMemberKind;
}> = [
  { columnIndex: 2, kind: 'method' },
  { columnIndex: 3, kind: 'property' },
  { columnIndex: 4, kind: 'event' },
  { columnIndex: 5, kind: 'field' },
];

const EXACT_MAPPINGS: Record<string, { supportLevel: SupportLevel; onlyOfficeMapping: string; notes?: string }> = {
  'excel.application.calculate:method': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'Api.RecalculateAllFormulas()',
  },
  'excel.workbook.getactivecell:method': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'Api.GetSelection()',
  },
  'excel.workbook.getactiveworksheet:method': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'Api.GetActiveSheet()',
  },
  'excel.workbook.focus:method': {
    supportLevel: 'partial',
    onlyOfficeMapping: 'Editor already focused by the browser UI',
  },
  'excel.worksheet.activate:method': {
    supportLevel: 'partial',
    onlyOfficeMapping: 'Api.GetSheet(name).SetActive()/Active',
  },
  'excel.worksheet.calculate:method': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'Api.RecalculateAllFormulas()',
  },
  'excel.worksheet.delete:method': {
    supportLevel: 'partial',
    onlyOfficeMapping: 'ApiWorksheet.Delete()',
  },
  'excel.worksheet.getrange:method': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'ApiWorksheet.GetRange(address)',
  },
  'excel.worksheet.getusedrange:method': {
    supportLevel: 'partial',
    onlyOfficeMapping: 'ApiWorksheet.GetUsedRange() when present',
  },
  'excel.worksheet.name:property': {
    supportLevel: 'partial',
    onlyOfficeMapping: 'ApiWorksheet.GetName()/SetName()',
  },
  'excel.worksheet collection.add:method': {
    supportLevel: 'partial',
    onlyOfficeMapping: 'Api.AddSheet(name)',
  },
  'excel.range.calculate:method': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'Api.RecalculateAllFormulas()',
  },
  'excel.range.clear:method': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'ApiRange.Clear()/ClearContents()/ClearFormats()',
  },
  'excel.range.clearorresetcontents:method': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'ApiRange.ClearContents()',
  },
  'excel.range.delete:method': {
    supportLevel: 'partial',
    onlyOfficeMapping: 'ApiRange.Delete(shift)',
  },
  'excel.range.insert:method': {
    supportLevel: 'partial',
    onlyOfficeMapping: 'ApiRange.Insert(shift)',
  },
  'excel.range.merge:method': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'ApiRange.Merge()',
  },
  'excel.range.select:method': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'ApiRange.Select()',
  },
  'excel.range.unmerge:method': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'ApiRange.UnMerge()',
  },
  'excel.range.replace:method': {
    supportLevel: 'partial',
    onlyOfficeMapping: 'ApiRange.Replace(find, replace)',
  },
  'excel.range.address:property': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'ApiRange.GetAddress()',
  },
  'excel.range.formulas:property': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'ApiRange.GetFormula()/SetFormula()',
  },
  'excel.range.values:property': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'ApiRange.GetValue()/SetValue()',
  },
  'excel.range.text:property': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'ApiRange.GetText()',
  },
  'excel.range.numberformat:property': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'ApiRange.GetNumberFormat()/SetNumberFormat()',
  },
  'excel.range.format:property': {
    supportLevel: 'partial',
    onlyOfficeMapping: 'ApiRange formatting setters',
  },
  'excel.range.columnwidth:property': {
    supportLevel: 'partial',
    onlyOfficeMapping: 'ApiRange.SetColumnWidth()/internal asc_setColumnWidth()',
  },
  'excel.range.rowheight:property': {
    supportLevel: 'partial',
    onlyOfficeMapping: 'ApiRange.SetRowHeight()/internal asc_setRowHeight()',
  },
  'excel.range rowhidden:property': {
    supportLevel: 'partial',
    onlyOfficeMapping: 'ApiRange.SetHidden()/GetHidden() on rows',
  },
  'excel.range columnhidden:property': {
    supportLevel: 'partial',
    onlyOfficeMapping: 'ApiRange.SetHidden()/GetHidden() on columns',
  },
  'excel.range format.autofitcolumns:method': {
    supportLevel: 'partial',
    onlyOfficeMapping: 'ApiRange.AutoFit()',
  },
  'excel.range format.autofitrows:method': {
    supportLevel: 'partial',
    onlyOfficeMapping: 'ApiRange.AutoFit()',
  },
  'excel.range font.bold:property': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'ApiRange.SetBold()',
  },
  'excel.range font.color:property': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'ApiRange.SetFontColor()',
  },
  'excel.range font.italic:property': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'ApiRange.SetItalic()',
  },
  'excel.range font.size:property': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'ApiRange.SetFontSize()',
  },
  'excel.range fill.color:property': {
    supportLevel: 'supported',
    onlyOfficeMapping: 'ApiRange.SetFillColor()',
  },
  'excel.chart collection.add:method': {
    supportLevel: 'partial',
    onlyOfficeMapping: 'ApiWorksheet.AddChart() when available',
  },
};

const PARTIAL_OBJECTS = [
  'excel.application',
  'excel.workbook',
  'excel.worksheet',
  'excel.worksheet collection',
  'excel.range',
  'excel.range format',
  'excel.range font',
  'excel.range fill',
  'excel.chart collection',
  'excel.chart',
  'excel.table collection',
  'excel.table',
  'excel.comment collection',
  'excel.comment',
];

const EXTRA_CORE_MEMBERS: Array<{
  category: string;
  objectName: string;
  memberName: string;
  memberKind: CapabilityMemberKind;
  signature: string;
}> = [
  {
    category: '区域',
    objectName: 'Excel.Range',
    memberName: 'values',
    memberKind: 'property',
    signature: 'values',
  },
  {
    category: '区域',
    objectName: 'Excel.Range',
    memberName: 'formulas',
    memberKind: 'property',
    signature: 'formulas',
  },
  {
    category: '区域',
    objectName: 'Excel.Range',
    memberName: 'numberFormat',
    memberKind: 'property',
    signature: 'numberFormat',
  },
  {
    category: '格式',
    objectName: 'Excel.Range',
    memberName: 'format',
    memberKind: 'property',
    signature: 'format',
  },
  {
    category: '格式',
    objectName: 'Excel.Range',
    memberName: 'columnWidth',
    memberKind: 'property',
    signature: 'columnWidth',
  },
  {
    category: '格式',
    objectName: 'Excel.Range',
    memberName: 'rowHeight',
    memberKind: 'property',
    signature: 'rowHeight',
  },
  {
    category: '工作表',
    objectName: 'Excel.Worksheet',
    memberName: 'getUsedRange',
    memberKind: 'method',
    signature: 'getUsedRange(valuesOnly)',
  },
];

function splitMembers(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return value
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !/^\.\.\.\+\d+$/.test(item));
}

function parseMemberName(signature: string, kind: CapabilityMemberKind): string {
  if (kind === 'method') return signature.replace(/\(.*/, '').trim();
  return signature.trim();
}

function parseArguments(signature: string): Record<string, unknown> | undefined {
  const match = signature.match(/\((.*)\)/);
  if (!match) return undefined;
  const args = match[1]
    .split(',')
    .map((arg) => arg.trim())
    .filter(Boolean);
  if (!args.length) return undefined;
  return {
    type: 'object',
    properties: Object.fromEntries(args.map((arg) => [arg, { type: 'unknown' }])),
  };
}

function keyFor(objectName: string, memberName: string, kind: CapabilityMemberKind): string {
  return `${objectName}.${memberName}:${kind}`.toLowerCase();
}

function inferSupport(
  objectName: string,
  memberName: string,
  kind: CapabilityMemberKind,
): Pick<ExcelCapability, 'supportLevel' | 'onlyOfficeMapping' | 'notes'> {
  const exact = EXACT_MAPPINGS[keyFor(objectName, memberName, kind)];
  if (exact) return exact;

  const lowerObject = objectName.toLowerCase();
  if (PARTIAL_OBJECTS.some((item) => lowerObject === item)) {
    return {
      supportLevel: 'partial',
      onlyOfficeMapping: 'partial object coverage through the Office Agent bridge',
      notes: 'Registered from the Office.js reference table; bridge support is best-effort for this member.',
    };
  }

  return {
    supportLevel: 'unsupported',
    onlyOfficeMapping: 'unsupported',
    notes:
      'Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1.',
  };
}

export function parseCapabilityWorkbook(filePath: string): ExcelCapability[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
    header: 1,
    blankrows: false,
  });
  const capabilities: ExcelCapability[] = [];

  for (const row of rows.slice(4)) {
    const category = String(row[0] || '').trim();
    const objectName = String(row[1] || '').trim();
    if (!category || !objectName || category === '汇总') continue;

    for (const { columnIndex, kind } of KIND_BY_COLUMN) {
      for (const signature of splitMembers(row[columnIndex])) {
        const memberName = parseMemberName(signature, kind);
        if (!memberName) continue;
        const support = inferSupport(objectName, memberName, kind);
        capabilities.push({
          id: `${objectName}.${memberName}.${kind}`.replace(/\s+/g, '_'),
          category,
          objectName,
          memberName,
          memberKind: kind,
          signature,
          argumentSchema: parseArguments(signature),
          ...support,
        });
      }
    }
  }

  for (const extra of EXTRA_CORE_MEMBERS) {
    if (
      capabilities.some(
        (capability) =>
          capability.objectName === extra.objectName &&
          capability.memberName === extra.memberName &&
          capability.memberKind === extra.memberKind,
      )
    ) {
      continue;
    }
    capabilities.push({
      id: `${extra.objectName}.${extra.memberName}.${extra.memberKind}`.replace(/\s+/g, '_'),
      category: extra.category,
      objectName: extra.objectName,
      memberName: extra.memberName,
      memberKind: extra.memberKind,
      signature: extra.signature,
      argumentSchema: parseArguments(extra.signature),
      ...inferSupport(extra.objectName, extra.memberName, extra.memberKind),
    });
  }

  return capabilities;
}
