import { sanitizeX2TFileName } from './x2t-paths';
import { toUint8Array } from './onlyoffice-compat/binary';
import { X2TConverter } from './document-converter';

// ── Public API types ────────────────────────────────────────────

export interface X2TInitOptions {
  /** Fonts manifest path for PDF/rendering (maps to m_sAllFontsPath). */
  fontsManifestPath?: string;
  /** Fonts directory for PDF/rendering (maps to m_sFontDir). */
  fontsDir?: string;
  /** Reject input larger than this (bytes). */
  maxInputBytes?: number;
}

export interface X2TConvertOptions {
  inputName: string;
  inputBytes: Uint8Array;
  outputName: string;
  /** Numeric format ID (e.g. 65=DOCX, 257=XLSX, 513=PDF) or undefined for auto-detect. */
  formatFrom?: number;
  /** Numeric format ID for output or undefined for auto-detect. */
  formatTo?: number;
  password?: string;
  codePage?: string | number;
  delimiter?: string | number;
}

export interface X2TConvertResult {
  outputName: string;
  outputBytes: Uint8Array;
  warnings: string[];
}

// ── Internal singleton ──────────────────────────────────────────

let _converter: X2TConverter | null = null;
let _fontsManifestPath: string | undefined;
let _fontsDir: string | undefined;
let _maxInputBytes: number | undefined;

function getConverter(): X2TConverter {
  if (!_converter) _converter = new X2TConverter();
  return _converter;
}

// ── Public API ──────────────────────────────────────────────────

export async function initX2T(options: X2TInitOptions = {}): Promise<void> {
  const x2t = getConverter();
  await x2t.loadScript();
  await x2t.initialize();
  _fontsManifestPath = options.fontsManifestPath;
  _fontsDir = options.fontsDir;
  _maxInputBytes = options.maxInputBytes;

  // Preload fonts if fontsDir is set (needed for PDF export)
  if (_fontsDir) {
    await preloadFonts(x2t, _fontsDir);
  }
}

/**
 * Preload TTF font files from the server into the Emscripten virtual filesystem.
 * Required for PDF export — x2t needs physical font files accessible at m_sFontDir.
 */
async function preloadFonts(x2t: X2TConverter, fontsDir: string): Promise<void> {
  const module = await x2t.initialize();
  const fontList = [
    'LiberationSans-Regular.ttf',
    'LiberationSans-Bold.ttf',
    'LiberationSans-Italic.ttf',
    'LiberationSans-BoldItalic.ttf',
  ];

  try { module.FS.mkdir(fontsDir); } catch { /* exists */ }

  for (const fontFile of fontList) {
    try {
      const response = await fetch(`/fonts/${fontFile}`);
      if (!response.ok) {
        console.warn(`x2t: font ${fontFile} not found at /fonts/${fontFile}, PDF export may fail`);
        continue;
      }
      const data = await response.arrayBuffer();
      module.FS.writeFile(`${fontsDir}/${fontFile}`, new Uint8Array(data));
    } catch (e) {
      console.warn(`x2t: failed to preload font ${fontFile}:`, e);
    }
  }
}

/**
 * Convert a local byte buffer using x2t. All FS paths are controlled internally —
 * callers must NOT pass raw FS paths.
 */
export async function convertLocal(request: X2TConvertOptions): Promise<X2TConvertResult> {
  const x2t = getConverter();
  const module = await x2t.initialize();
  const warnings: string[] = [];
  const safeInput = sanitizeX2TFileName(request.inputName);
  const safeOutput = sanitizeX2TFileName(request.outputName);

  // Enforce maxInputBytes if configured
  if (_maxInputBytes && request.inputBytes.byteLength > _maxInputBytes) {
    throw new Error(`x2t input size ${request.inputBytes.byteLength} exceeds max ${_maxInputBytes} bytes`);
  }

  // Validate font paths (must be under /working/ or /fonts/)
  for (const [label, value] of [['fontsDir', _fontsDir], ['fontsManifestPath', _fontsManifestPath]] as const) {
    if (value && !value.startsWith('/working') && !value.startsWith('/fonts')) {
      throw new Error(`x2t ${label} must be under /working/ or /fonts/: ${value}`);
    }
  }

  // Ensure working dirs
  const inputDir = '/working/input';
  try { module.FS.mkdir(inputDir); } catch { /* exists */ }
  const outputDir = '/working/output';
  try { module.FS.mkdir(outputDir); } catch { /* exists */ }
  const inputFile = `${inputDir}/${safeInput}`;
  const outputFile = `${outputDir}/${safeOutput}`;
  module.FS.writeFile(inputFile, request.inputBytes);

  // Build params XML
  let additionalParams = '';
  if (request.formatFrom) additionalParams += `<m_nFormatFrom>${request.formatFrom}</m_nFormatFrom>\n`;
  if (request.formatTo) additionalParams += `<m_nFormatTo>${request.formatTo}</m_nFormatTo>\n`;
  if (request.password) additionalParams += `<m_sPassword>${escapeXml(request.password)}</m_sPassword>\n`;
  if (_fontsDir) additionalParams += `<m_sFontDir>${_fontsDir}</m_sFontDir>\n`;
  if (_fontsManifestPath) additionalParams += `<m_sAllFontsPath>${_fontsManifestPath}</m_sAllFontsPath>\n`;
  if (request.delimiter !== undefined) {
    additionalParams += `<m_nCsvDelimiter>${request.delimiter}</m_nCsvDelimiter>\n`;
  }
  if (request.codePage !== undefined) {
    additionalParams += `<m_nCodePage>${request.codePage}</m_nCodePage>\n`;
  }

  const paramsXml = `<?xml version="1.0" encoding="utf-8"?>
<TaskQueueDataConvert xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <m_sFileFrom>${inputFile}</m_sFileFrom>
  <m_sFileTo>${outputFile}</m_sFileTo>
  <m_bIsNoBase64>false</m_bIsNoBase64>
  ${additionalParams}
</TaskQueueDataConvert>`;

  const paramsPath = '/working/params.xml';
  module.FS.writeFile(paramsPath, paramsXml);

  // Execute
  const resultCode = module.ccall('main1', 'number', ['string'], [paramsPath]);
  if (resultCode !== 0) {
    const errMsg = x2tErrorMessage(resultCode);
    try {
      const debugXml = module.FS.readFile(paramsPath, { encoding: 'binary' });
      console.error(`x2t error ${resultCode}: ${errMsg}`, 'params:', debugXml);
    } catch { /* debug read failed */ }
    throw new Error(`[x2t:${resultCode}] ${errMsg}`);
  }

  // Read output
  const rawOutput = module.FS.readFile(outputFile);
  const outputBytes = toUint8Array(rawOutput);
  if (!outputBytes) {
    throw new Error('x2t conversion produced no output — the document may be empty or in an unsupported format');
  }

  return { outputName: safeOutput, outputBytes, warnings };
}

// ── Error code mapping ────────────────────────────────────────────

/**
 * Map x2t return codes to human-readable messages.
 * ONLYOFFICE x2t uses non-zero codes for specific failure modes.
 * These are NOT DocumentServer's -1..-10 error codes — they're x2t binary exit codes.
 */
function x2tErrorMessage(code: number): string {
  const map: Record<number, string> = {
    0: 'Success',
    // Known x2t exit codes (observed in testing)
    88: 'This file format is not supported. The document may be in a format that cannot be opened.',
    89: 'The file could not be converted. It may be corrupted, password-protected without providing a password, or in an unrecognized binary format.',
    91: 'Incorrect password. The document is encrypted and the provided password does not match.',
  };
  return map[code] || `Conversion failed with code ${code}. The document may be damaged or in an unsupported format.`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
