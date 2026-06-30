import { X2TConverter } from './document-converter';
import { t } from './i18n';
import {
  createEditorInstance,
  downloadActiveEditor,
  loadEditorApi,
  saveActiveEditor,
  type CreateEditorInstanceConfig,
} from './onlyoffice-editor';
import { getDocumentType } from './document-utils';
import type { BinConversionResult, ConversionResult, EmscriptenModule } from './document-types';

export type {
  ConversionResult,
  BinConversionResult,
  EmscriptenModule,
  DocumentType,
  SaveEvent,
} from './document-types';

export { oAscFileType, c_oAscFileType2 } from './file-types';
export { getDocumentType, getBasePath, BASE_PATH, DOCUMENT_TYPE_MAP } from './document-utils';
export { createEditorInstance, downloadActiveEditor, loadEditorApi, saveActiveEditor };

const x2tConverter = new X2TConverter();
let conversionQueue: Promise<unknown> = Promise.resolve();

function queueConversion<T>(operation: () => Promise<T>): Promise<T> {
  const next = conversionQueue.then(operation, operation);
  conversionQueue = next.catch(() => {});
  return next;
}

function normalizeFileType(fileName: string, explicitType?: string): string {
  return (explicitType || fileName.split('.').pop() || '').replace(/^\./, '').toLowerCase();
}

function toEmptyType(fileType: string): CreateEditorInstanceConfig['emptyType'] {
  if (fileType === 'docx' || fileType === 'xlsx' || fileType === 'pptx' || fileType === 'csv') {
    return fileType;
  }
  return undefined;
}

export const loadScript = (): Promise<void> => x2tConverter.loadScript();
export const initX2T = (): Promise<EmscriptenModule> => x2tConverter.initialize();
export const convertDocument = (file: File): Promise<ConversionResult> =>
  queueConversion(() => x2tConverter.convertDocument(file));
export const convertBinToDocument = (
  bin: Uint8Array,
  fileName: string,
  targetExt?: string,
): Promise<BinConversionResult> => queueConversion(() => x2tConverter.convertBinToDocument(bin, fileName, targetExt));
export const convertBinToDocumentAndDownload = (
  bin: Uint8Array,
  fileName: string,
  targetExt?: string,
): Promise<BinConversionResult> =>
  queueConversion(() => x2tConverter.convertBinToDocumentAndDownload(bin, fileName, targetExt));

export async function handleDocumentOperation(options: {
  isNew: boolean;
  fileName: string;
  file?: File;
}): Promise<void> {
  try {
    const { isNew, fileName, file } = options;
    const fileType = normalizeFileType(fileName, file?.name.split('.').pop());
    if (!getDocumentType(fileType)) {
      throw new Error(`${t('unsupportedFileType')}${fileType}`);
    }

    await loadEditorApi();
    if (isNew) {
      const emptyType = toEmptyType(fileType);
      if (!emptyType) {
        throw new Error(`${t('unsupportedFileType')}${fileType}`);
      }
      await createEditorInstance({ fileName, fileType, emptyType });
      return;
    }

    if (!file) throw new Error(t('invalidFileObject'));
    await createEditorInstance({ fileName, fileType, file });
  } catch (error: any) {
    console.error(`${t('documentOperationFailed')}`, error);
    alert(`${t('documentOperationFailed')}${error.message}`);
    throw error;
  }
}
