import { excelCapabilities } from './generated/excel-capabilities';
import type { ExcelCapability, SupportLevel } from './types';

export { excelCapabilities };

export function getCapability(
  objectName: string,
  memberName: string,
  memberKind?: string,
): ExcelCapability | undefined {
  const normalizedObject = objectName.trim().toLowerCase();
  const normalizedMember = memberName.trim().toLowerCase();
  const normalizedKind = memberKind?.trim().toLowerCase();
  return excelCapabilities.find((capability) => {
    return (
      capability.objectName.toLowerCase() === normalizedObject &&
      capability.memberName.toLowerCase() === normalizedMember &&
      (!normalizedKind || capability.memberKind === normalizedKind)
    );
  });
}

export function queryCapabilities(options: {
  query?: string;
  objectName?: string;
  supportLevel?: SupportLevel;
  limit?: number;
}): ExcelCapability[] {
  const query = options.query?.trim().toLowerCase();
  const objectName = options.objectName?.trim().toLowerCase();
  const limit = options.limit ?? 80;

  return excelCapabilities
    .filter((capability) => {
      if (options.supportLevel && capability.supportLevel !== options.supportLevel) return false;
      if (objectName && capability.objectName.toLowerCase() !== objectName) return false;
      if (!query) return true;
      const haystack = [
        capability.category,
        capability.objectName,
        capability.memberName,
        capability.memberKind,
        capability.signature,
        capability.onlyOfficeMapping,
        capability.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    })
    .slice(0, limit);
}

export function isExecutableCapability(capability: ExcelCapability | undefined): boolean {
  return Boolean(
    capability &&
      capability.supportLevel !== 'unsupported' &&
      capability.onlyOfficeMapping &&
      !capability.onlyOfficeMapping.startsWith('unsupported'),
  );
}

