import 'ranui/message';
import { createObjectURL } from 'ranuts/utils';
import { getDocmentObj } from '../store';
import { getOnlyOfficeLang, t } from './i18n';
import type { SaveEvent } from './document-types';
import { getDocumentType, getMimeTypeFromExtension } from './document-utils';
import { prepareOnlyOfficeBuffer } from './onlyoffice-compat/binary';
import { installLocalBinaryBridge } from './onlyoffice-compat/local-binary';
import { downloadLocalDataFromCurrentEditor } from './onlyoffice-compat/local-download';
import { ensureOnlyOfficeHostSizing, openLocalDocument } from './onlyoffice-compat/runtime';
import {
  exportNativeDataFromCurrentEditor,
  resolveLocalSaveTargetFormat,
  resolveNativeSaveTarget,
} from './onlyoffice-compat/save';

function getEditorCleanupDelayMs(hasExistingEditor: boolean, fileType: string): number {
  const isPresentation = fileType === 'pptx' || fileType === 'ppt';
  return hasExistingEditor && isPresentation ? 400 : hasExistingEditor ? 250 : 150;
}
// Import converter function to avoid circular dependency
type ConverterCallback = (bin: Uint8Array, fileName: string, targetExt?: string) => Promise<any>;
let convertBinToDocumentAndDownloadFn: ConverterCallback | null = null;

interface PendingSaveCapture {
  resolve: (value: { bin: Uint8Array; fileName: string; outputFormat: number }) => void;
  reject: (error: Error) => void;
  timeout: number;
}

export interface SaveCompletion {
  fileName: string;
  outputFormat: number;
  targetFormat: string;
}

interface PendingSaveCompletion {
  resolve: (value: SaveCompletion) => void;
  reject: (error: Error) => void;
  timeout: number;
}

let pendingSaveCapture: PendingSaveCapture | null = null;
let pendingSaveCompletion: PendingSaveCompletion | null = null;

export function setConverterCallback(
  callback: ConverterCallback,
): void {
  convertBinToDocumentAndDownloadFn = callback;
}

async function getConverterCallback(): Promise<ConverterCallback> {
  if (convertBinToDocumentAndDownloadFn) return convertBinToDocumentAndDownloadFn;
  const converter = await import('./converter');
  setConverterCallback(converter.convertBinToDocumentAndDownload);
  if (convertBinToDocumentAndDownloadFn) return convertBinToDocumentAndDownloadFn;
  throw new Error('Converter callback not set');
}

export function captureNextSaveAsBin(timeoutMs = 20000): Promise<{
  bin: Uint8Array;
  fileName: string;
  outputFormat: number;
}> {
  cancelPendingSaveCapture(new Error('A newer save capture request replaced this one.'));
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      pendingSaveCapture = null;
      reject(new Error('Timed out while waiting for document checkpoint data.'));
    }, timeoutMs);
    pendingSaveCapture = { resolve, reject, timeout };
  });
}

export function cancelPendingSaveCapture(error = new Error('Save capture cancelled.')): void {
  if (!pendingSaveCapture) return;
  window.clearTimeout(pendingSaveCapture.timeout);
  pendingSaveCapture.reject(error);
  pendingSaveCapture = null;
}

export function waitForNextSaveCompletion(timeoutMs = 60000): Promise<SaveCompletion> {
  cancelPendingSaveCompletion(new Error('A newer save completion request replaced this one.'));
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      pendingSaveCompletion = null;
      reject(new Error('Timed out while waiting for ONLYOFFICE save completion.'));
    }, timeoutMs);
    pendingSaveCompletion = { resolve, reject, timeout };
  });
}

export function cancelPendingSaveCompletion(error = new Error('Save completion cancelled.')): void {
  if (!pendingSaveCompletion) return;
  window.clearTimeout(pendingSaveCompletion.timeout);
  pendingSaveCompletion.reject(error);
  pendingSaveCompletion = null;
}

function resolvePendingSaveCompletion(value: SaveCompletion): void {
  if (!pendingSaveCompletion) return;
  const completion = pendingSaveCompletion;
  pendingSaveCompletion = null;
  window.clearTimeout(completion.timeout);
  completion.resolve(value);
}

function rejectPendingSaveCompletion(error: Error): void {
  if (!pendingSaveCompletion) return;
  const completion = pendingSaveCompletion;
  pendingSaveCompletion = null;
  window.clearTimeout(completion.timeout);
  completion.reject(error);
}

// Global media mapping object
const media: Record<string, string> = {};

// Editor operation queue to prevent concurrent operations
let editorOperationQueue: Promise<void> = Promise.resolve();

function forceOfficeLightTheme(): void {
  try {
    window.localStorage.setItem('ui-theme-id', 'theme-classic-light');
    window.localStorage.setItem('content-theme', 'light');
    window.localStorage.removeItem('ui-theme');
  } catch (error) {
    console.warn('Unable to persist ONLYOFFICE light theme preference:', error);
  }
}

/**
 * Queue editor operations to prevent concurrent editor creation/destruction
 */
async function queueEditorOperation<T>(operation: () => Promise<T>): Promise<T> {
  // Wait for previous operations to complete
  // Add a timeout to prevent infinite waiting
  try {
    await Promise.race([
      editorOperationQueue,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Editor operation queue timeout')), 30000)),
    ]);
  } catch (error) {
    // If timeout, log warning but continue (previous operation may have failed)
    if (error instanceof Error && error.message === 'Editor operation queue timeout') {
      console.warn('Editor operation queue timeout, proceeding anyway');
    } else {
      // Re-throw other errors
      throw error;
    }
  }

  // Create a new promise for this operation
  let resolveOperation: () => void;
  let rejectOperation: (error: any) => void;
  const operationPromise = new Promise<void>((resolve, reject) => {
    resolveOperation = resolve;
    rejectOperation = reject;
  });

  // Update the queue
  editorOperationQueue = operationPromise;

  try {
    const result = await operation();
    resolveOperation!();
    return result;
  } catch (error) {
    rejectOperation!(error);
    throw error;
  }
}

/**
 * Handle file write request (mainly for handling pasted images)
 * @param event - OnlyOffice editor file write event
 */
async function handleWriteFile(event: any) {
  try {
    console.log('Write file event:', event);

    const { data: eventData } = event;
    if (!eventData) {
      console.warn('No data provided in writeFile event');
      return;
    }

    const {
      data: imageData, // Uint8Array image data
      file: fileName, // File name, e.g., "display8image-174799443357-0.png"
      _target, // Target object containing frameOrigin and other info
    } = eventData;

    // Validate data
    if (!imageData || !(imageData instanceof Uint8Array)) {
      throw new Error('Invalid image data: expected Uint8Array');
    }

    if (!fileName || typeof fileName !== 'string') {
      throw new Error('Invalid file name');
    }

    // Extract extension from file name
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'png';
    const mimeType = getMimeTypeFromExtension(fileExtension);

    // Create Blob object
    const blob = new Blob([imageData as unknown as BlobPart], { type: mimeType });

    // Create object URL
    const objectUrl = await createObjectURL(blob);
    // Add image URL to media mapping using original file name as key
    media[`media/${fileName}`] = objectUrl;
    ;(window.editor as any).sendCommand({
      command: 'asc_setImageUrls',
      data: {
        urls: media,
      },
    });

    ;(window.editor as any).sendCommand({
      command: 'asc_writeFileCallback',
      data: {
        // Image base64
        path: objectUrl,
        imgName: fileName,
      },
    });
    console.log(`Successfully processed image: ${fileName}, URL: ${media}`);
  } catch (error: any) {
    console.error('Error handling writeFile:', error);

    // Notify editor that file processing failed
    if (window.editor && typeof window.editor.sendCommand === 'function') {
      window.editor.sendCommand({
        command: 'asc_writeFileCallback',
        data: {
          success: false,
          error: error.message,
        },
      });
    }

    if (event.callback && typeof event.callback === 'function') {
      event.callback({
        success: false,
        error: error.message,
      });
    }
  }
}

async function handleSaveDocument(event: SaveEvent) {
  console.log('Save document event:', event);

  try {
    if (event.data && event.data.data) {
      await processSaveDocumentData(event);
    }
    sendEditorSaveCallback();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown save error';
    rejectPendingSaveCompletion(new Error(message));
    sendEditorSaveCallback(message);
    throw error;
  }
}

async function processSaveDocumentData(event: SaveEvent): Promise<void> {
  const { data, option } = event.data!;
  const { fileName } = getDocmentObj() || {};
  const targetFormat = resolveLocalSaveTargetFormat(option.outputformat, fileName);

  if (pendingSaveCapture) {
    resolvePendingSaveCapture(data.data, fileName, option.outputformat);
    resolvePendingSaveCompletion({ fileName, outputFormat: option.outputformat, targetFormat });
    return;
  }

  console.log(`Saving as ${targetFormat} format (original file: ${fileName}, editor format: ${option.outputformat})`);
  const convert = await getConverterCallback();
  await convert(data.data, fileName, targetFormat);
  resolvePendingSaveCompletion({ fileName, outputFormat: option.outputformat, targetFormat });
}

export async function saveCurrentOnlyOfficeDocument(): Promise<SaveCompletion> {
  const convert = await getConverterCallback();

  const { fileName } = getDocmentObj() || {};
  if (!fileName) throw new Error('Current document file name is unavailable for native save.');

  const { outputFormat, targetFormat } = resolveNativeSaveTarget(fileName);
  if (targetFormat === 'XLSX') {
    await downloadLocalDataFromCurrentEditor({
      editor: window.editor as DocEditor | undefined,
      convert,
      outputFormat,
      targetFormat,
    });
    const completion = { fileName, outputFormat, targetFormat };
    resolvePendingSaveCompletion(completion);
    return completion;
  }

  const nativeData = exportNativeDataFromCurrentEditor();
  await convert(nativeData, fileName, targetFormat);

  const completion = { fileName, outputFormat, targetFormat };
  resolvePendingSaveCompletion(completion);
  return completion;
}

function resolvePendingSaveCapture(data: unknown, fileName: string, outputFormat: number): void {
  if (!pendingSaveCapture) return;
  const capture = pendingSaveCapture;
  pendingSaveCapture = null;
  window.clearTimeout(capture.timeout);
  capture.resolve({
    bin: data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBufferLike),
    fileName,
    outputFormat,
  });
}

function sendEditorSaveCallback(error?: string): void {
  ;(window.editor as any).sendCommand({
    command: 'asc_onSaveCallback',
    data: error ? { err_code: 1, error } : { err_code: 0 },
  });
}

// Public editor creation method
export function createEditorInstance(config: {
  fileName: string;
  fileType: string;
  binData: ArrayBuffer | string;
  media?: any;
}): Promise<void> {
  return queueEditorOperation(async () => {
    const { fileName, fileType, binData, media: mediaUrls } = config;

    // Check if there's an existing editor that needs cleanup
    const hasExistingEditor = !!window.editor;

    // Clean up old editor instance properly
    if (window.editor) {
      try {
        console.log('Destroying previous editor instance...');
        window.editor.destroyEditor();

        // When switching between document types, especially from/to PPT,
        // we need more time for cleanup. PPT editors are particularly resource-intensive.
        // Use longer delay when switching editors or when dealing with presentations
        const isPresentation = fileType === 'pptx' || fileType === 'ppt';
        const destroyDelay = hasExistingEditor && isPresentation ? 400 : hasExistingEditor ? 250 : 150;

        // Wait a bit for destroy to complete
        await new Promise((resolve) => setTimeout(resolve, destroyDelay));
      } catch (error) {
        console.warn('Error destroying previous editor:', error);
      }
      window.editor = undefined;
    }

    // Clean up iframe container to ensure clean state
    const iframeContainer = document.getElementById('iframe');
    if (iframeContainer) {
      // Remove all child elements
      while (iframeContainer.firstChild) {
        iframeContainer.removeChild(iframeContainer.firstChild);
      }
    }

    // Additional delay to ensure cleanup completes before creating new editor
    // This is especially important when switching between different document types
    // When switching editors, especially involving PPT, we need more time
    const isPresentation = fileType === 'pptx' || fileType === 'ppt';
    const cleanupDelay = hasExistingEditor && isPresentation ? 400 : hasExistingEditor ? 250 : 150;
    await new Promise((resolve) => setTimeout(resolve, cleanupDelay));

    const editorLang = getOnlyOfficeLang();
    const localDocumentBuffer = prepareOnlyOfficeBuffer(binData);
    console.log('Creating new editor instance for:', fileName, 'type:', fileType);
    forceOfficeLightTheme();
    ensureOnlyOfficeHostSizing();

    try {
      window.editor = new window.DocsAPI.DocEditor('iframe', {
        documentType: getDocumentType(fileType),
        document: {
          title: fileName,
          url: fileName, // Use file name as identifier
          fileType: fileType,
          permissions: {
            edit: true,
            chat: false,
            protect: false,
          },
        },
        editorConfig: {
          lang: editorLang,
          plugins: {
            autostart: ['asc.{A11CE0FF-1CE0-4A6E-8E11-B0A000000001}'],
            pluginsData: ['/office-agent-plugin/config.json'],
          },
          customization: {
            uiTheme: 'theme-classic-light',
            help: false,
            about: false,
            hideRightMenu: false,
            plugins: true,
            features: {
              spellcheck: {
                change: false,
              },
            },
            anonymous: {
              request: false,
              label: 'Guest',
	            },
	          },
	        },
        events: {
          onAppReady: () => {
            // Set media resources
            if (mediaUrls) {
              ;(window.editor as any).sendCommand({
                command: 'asc_setImageUrls',
                data: { urls: mediaUrls },
              });
            }

            installLocalBinaryBridge();
            openLocalDocument(window.editor as DocEditor | undefined, localDocumentBuffer);
          },
	          onDocumentReady: () => {
	            console.log(`${t('documentLoaded')}${fileName}`);
	            window.dispatchEvent(new CustomEvent('office-agent:document-ready', { detail: { fileName, fileType } }));
	            // Note: CSV files are saved with the original CSV target format.
          },
          onSaveDocument: handleSaveDocument,
          // writeFile
          // TODO: writeFile - handle when pasting images from external sources
          writeFile: handleWriteFile,
        },
      });
    } catch (error) {
      console.error('Error creating editor instance:', error);
      throw error;
    }
  });
}

export function loadEditorApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.DocsAPI) {
      resolve();
      return;
    }

    // Load editor API
    const script = document.createElement('script');
    script.src = './web-apps/apps/api/documents/api.js?v=office-agent-align-fix-1';
    script.onload = () => resolve();
    script.onerror = (error) => {
      console.error('Failed to load OnlyOffice API:', error);
      alert(t('failedToLoadEditor'));
      reject(error);
    };
    document.head.appendChild(script);
  });
}
