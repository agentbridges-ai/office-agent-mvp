export type SupportLevel = 'supported' | 'partial' | 'unsupported';
export type OfficeDocumentKind = 'word' | 'spreadsheet' | 'presentation';

export interface AiSettings {
  baseURL: string;
  apiKey: string;
  modelId: string;
  includeUsage: boolean;
  corsCheckedAt?: string;
}

export type CapabilityMemberKind = 'method' | 'property' | 'event' | 'field';

export interface ExcelCapability {
  id: string;
  category: string;
  objectName: string;
  memberName: string;
  memberKind: CapabilityMemberKind;
  signature?: string;
  argumentSchema?: Record<string, unknown>;
  supportLevel: SupportLevel;
  onlyOfficeMapping?: string;
  notes?: string;
}

export interface ExcelTarget {
  sheetName?: string;
  address?: string;
}

export interface ExcelCallInput {
  objectName: string;
  memberName: string;
  memberKind: CapabilityMemberKind;
  target?: ExcelTarget;
  args?: Record<string, unknown>;
}

export interface ExcelContextInput {
  scope: 'workbook' | 'worksheet' | 'selection' | 'range';
  sheetName?: string;
  address?: string;
  includeValues?: boolean;
  includeFormulas?: boolean;
  maxCells?: number;
}

export interface OfficeApiCatalogInput {
  view?: 'overview' | 'category' | 'object' | 'search' | 'detail';
  category?: string;
  subcategory?: string;
  objectType?: string;
  memberName?: string;
  query?: string;
  limit?: number;
}

export interface OfficeApiCallInput {
  target?: {
    root: 'editor' | 'Editor' | 'Asc' | 'AscCommon' | 'AscCommonExcel' | 'Common' | 'cellInfo' | 'CellInfo';
  };
  memberName: string;
  args?: unknown[];
}

export interface ToolResult<T = unknown> {
  ok: boolean;
  supportLevel: SupportLevel;
  result?: T;
  error?: string;
  operationLogId?: string;
}

export interface OperationLogEntry {
  id: string;
  at: string;
  toolName: string;
  summary: string;
  ok: boolean;
  supportLevel: SupportLevel;
  error?: string;
}

export type OperationLogger = (
  toolName: string,
  summary: string,
  result: ToolResult,
) => OperationLogEntry;
