import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REQUIRED_9_3_IDS = {
  // Documents
  DOCX: 65, DOC: 66, ODT: 67, RTF: 68, TXT: 69, HTML: 70, EPUB: 72, FB2: 73,
  DOCY: 4097, MD: 92, HWP: 89, HWPX: 90, HWPML: 91, OFORM: 85, DOCXF: 86,
  // Spreadsheets
  XLSX: 257, XLS: 258, ODS: 259, CSV: 260, XLSM: 261, XLSB: 264, XLSY: 4098,
  TSV: 276, SCSV: 292,
  // Presentations
  PPTX: 129, PPT: 130, ODP: 131, PPTY: 4099, ODG: 140, KEY: 141,
  // PDF / OFD
  PDF: 513, OFD: 522,
  // Images
  IMG: 1024, JPG: 1025, PNG: 1029, GIF: 1028, BMP: 1032,
  // Diagram
  VSDX: 16385,
};

function parseArgs(argv) {
  const result = { root: process.cwd() };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') { result.root = argv[index + 1]; index += 1; continue; }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return result;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = resolve(args.root);
  const sourcePath = join(root, 'lib/file-types.ts');
  const failures = [];

  if (!existsSync(sourcePath)) {
    console.error('lib/file-types.ts: missing');
    process.exit(1);
  }

  const source = readFileSync(sourcePath, 'utf8');

  for (const [name, expectedId] of Object.entries(REQUIRED_9_3_IDS)) {
    const pattern = new RegExp(`${name}\\s*[:=]\\s*${expectedId}\\b`);
    if (!pattern.test(source)) {
      failures.push(`lib/file-types.ts: missing or incorrect format ID ${name}=${expectedId}`);
    }
  }

  if (!source.includes('c_oAscFileType2')) {
    failures.push('lib/file-types.ts: c_oAscFileType2 reverse mapping must exist');
  }

  if (failures.length > 0) {
    console.error('ONLYOFFICE 9.3 format table check failed');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(`ONLYOFFICE 9.3 format table check passed for ${root}`);
}

main();
