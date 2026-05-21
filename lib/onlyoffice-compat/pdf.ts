const ZERO_PAGE_PDF_TEXT = '0 pages';

export function assertValidPdfOutput(data: Uint8Array, fileName: string): void {
  const header = new TextDecoder('ascii').decode(data.slice(0, 8));
  if (!header.startsWith('%PDF-')) {
    throw new Error(`${fileName} is not a valid PDF output. PDF export requires server-side conversion.`);
  }

  const sample = new TextDecoder('latin1').decode(data.slice(0, Math.min(data.length, 4096)));
  if (/\/Count\s+0\b/.test(sample) || /0\s+pages/i.test(sample)) {
    throw new Error(`${fileName} contains ${ZERO_PAGE_PDF_TEXT}. PDF export requires server-side conversion.`);
  }
}
