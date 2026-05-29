import { getExtensions } from 'ranuts/utils';
import { g_sEmpty_bin } from './empty_bin';
import { t } from './i18n';
import { createEditorInstance, loadEditorApi, setConverterCallback } from './onlyoffice-editor';
import { getDocumentType } from './document-utils';
import type { BinConversionResult, ConversionResult, EmscriptenModule, DocumentType } from './document-types';
import { toStandaloneArrayBuffer, type OnlyOfficeBinData } from './onlyoffice-compat/binary';
import { initX2T as x2tInit, convertLocal, type X2TConvertOptions } from './x2t-api';
import type { BinConversionResult as _BinConversionResult } from './document-types';
import { X2TConverter } from './document-converter';

// Export types
export type {
  ConversionResult,
  BinConversionResult,
  EmscriptenModule,
  DocumentType,
  SaveEvent,
} from './document-types';

// Export constants
export { oAscFileType, c_oAscFileType2 } from './file-types';

// Export utilities
export { getDocumentType, getBasePath, BASE_PATH, DOCUMENT_TYPE_MAP } from './document-utils';

// Keep X2TConverter for backward-compatible .bin save path
const x2tConverter = new X2TConverter();

// Export converter methods via x2t-api.ts
export const loadScript = (): Promise<void> => x2tConverter.loadScript();
export const initX2T = (): Promise<EmscriptenModule> => {
  x2tInit(); // init the x2t-api
  return x2tConverter.initialize();
};

export async function convertDocument(file: File): Promise<ConversionResult> {
  const fileName = file.name;
  const fileExt = getExtensions(file?.type || '')[0] || fileName.split('.').pop() || '';
  const documentType = getDocumentType(fileExt) as DocumentType;
  if (!documentType) throw new Error(`${t('unsupportedFileType')}${fileExt}`);

  const arrayBuffer = await file.arrayBuffer();
  const inputBytes = new Uint8Array(arrayBuffer);
  const outputName = `${fileName}.bin`;

  const result = await convertLocal({
    inputName: fileName,
    inputBytes,
    outputName,
  });

  return {
    fileName,
    type: documentType,
    bin: result.outputBytes,
    media: {},
  };
}

export async function convertBinToDocumentAndDownload(
  bin: Uint8Array,
  fileName: string,
  targetExt?: string,
): Promise<BinConversionResult> {
  // .bin → format conversion still uses X2TConverter for its save/CSV paths
  return x2tConverter.convertBinToDocumentAndDownload(bin, fileName, targetExt);
}

// Export editor functions
export { createEditorInstance, loadEditorApi };

// Set up converter callback for editor
setConverterCallback(convertBinToDocumentAndDownload);

type NewDocumentData = { bin: string; media?: Record<string, string> };
type DocumentOperationData = ConversionResult | NewDocumentData;

function isConversionResult(data: DocumentOperationData): data is ConversionResult {
  return 'fileName' in data && 'type' in data;
}

function getOnlyOfficeBinData(data: DocumentOperationData): OnlyOfficeBinData {
  if (!isConversionResult(data)) return data.bin;
  return toStandaloneArrayBuffer(data.bin);
}

// Merged file operation method
export async function handleDocumentOperation(options: {
  isNew: boolean;
  fileName: string;
  file?: File;
}): Promise<void> {
  try {
    const { isNew, fileName, file } = options;
    const fileType = getExtensions(file?.type || '')[0] || fileName.split('.').pop() || '';
    const _docType = getDocumentType(fileType);

    // Get document content
    let documentData: DocumentOperationData;

    if (isNew) {
      // New document uses empty template
      const emptyBin = g_sEmpty_bin[`.${fileType}`];
      if (!emptyBin) {
        throw new Error(`${t('unsupportedFileType')}${fileType}`);
      }
      documentData = { bin: emptyBin };
    } else {
      // Opening existing document requires conversion via x2t-api.ts
      if (!file) throw new Error(t('invalidFileObject'));
      documentData = await convertDocument(file);
    }

    // Create editor instance
    await createEditorInstance({
      fileName,
      fileType,
      binData: getOnlyOfficeBinData(documentData),
      media: documentData.media,
    });
  } catch (error: any) {
    console.error(`${t('documentOperationFailed')}`, error);
    alert(`${t('documentOperationFailed')}${error.message}`);
    throw error;
  }
}
