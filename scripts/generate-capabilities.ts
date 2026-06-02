import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseCapabilityWorkbook } from './capability-parser';

const workbookPath = resolve(process.cwd(), 'chatgpt-ms-office-api文档参考.xlsx');
const outputPath = resolve(process.cwd(), 'lib/agent/generated/excel-capabilities.ts');
const capabilities = parseCapabilityWorkbook(workbookPath);

const output = `import type { ExcelCapability } from '../types';

export const excelCapabilities: ExcelCapability[] = ${JSON.stringify(capabilities, null, 2)};
`;

writeFileSync(outputPath, output);
console.log(`Generated ${capabilities.length} Excel capabilities at ${outputPath}`);

