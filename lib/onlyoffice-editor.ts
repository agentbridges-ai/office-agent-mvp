import 'ranui/message';
import { getOnlyOfficeLang, t } from './i18n';
import type { SaveEvent } from './document-types';
import { prepareOnlyOfficeBuffer, type OnlyOfficeBinData } from './onlyoffice-compat/binary';
import {
  createLocalOnlyOfficeDocument,
  createSingleUserEditorConfig,
  ensureOnlyOfficeHostSizing,
  openLocalDocument,
} from './onlyoffice-compat/runtime';
import { installLocalBinaryBridge } from './onlyoffice-compat/local-binary';
import { handleLocalSaveDocument, installLocalDownloadBridge } from './onlyoffice-compat/save';
import {
  sendOnlyOfficeImageUrlsAfterReady,
  sendWriteFileCallback,
  sendWriteFileFailure,
  writeImageToMediaMap,
} from './onlyoffice-compat/media';

// Import converter function to avoid circular dependency
let convertBinToDocumentAndDownloadFn:
  | ((bin: Uint8Array, fileName: string, targetExt?: string) => Promise<any>)
  | null = null;

export function setConverterCallback(
  callback: (bin: Uint8Array, fileName: string, targetExt?: string) => Promise<any>,
): void {
  convertBinToDocumentAndDownloadFn = callback;
}

// Global media mapping object
const media: Record<string, string> = {};

// Editor operation queue to prevent concurrent operations
let editorOperationQueue: Promise<void> = Promise.resolve();

const DOWNLOAD_BRIDGE_INSTALL_TIMEOUT_MS = 10000;
const DOWNLOAD_BRIDGE_INSTALL_INTERVAL_MS = 50;

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
    const result = await writeImageToMediaMap(event, media);
    sendOnlyOfficeImageUrlsAfterReady(window.editor, media);
    sendWriteFileCallback(window.editor, result);
    console.log(`Successfully processed image: ${result.fileName}, URL: ${media}`);
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error('Unknown writeFile error');
    console.error('Error handling writeFile:', error);
    sendWriteFileFailure(window.editor, event, normalizedError);
  }
}

async function handleSaveDocument(event: SaveEvent) {
  console.log('Save document event:', event);
  await handleLocalSaveDocument({
    event,
    editor: window.editor,
    convert: convertBinToDocumentAndDownloadFn,
    onError: showLocalSaveError,
  });
}

function showLocalSaveError(message: string): void {
  alert(message);
}

function installLocalDownloadBridgeWhenReady(): void {
  const started = Date.now();
  const tryInstall = () => {
    try {
      installLocalDownloadBridge({
        editor: window.editor,
        convert: convertBinToDocumentAndDownloadFn,
        onError: showLocalSaveError,
      });
    } catch (error) {
      if (Date.now() - started >= DOWNLOAD_BRIDGE_INSTALL_TIMEOUT_MS) {
        throw error;
      }
      window.setTimeout(tryInstall, DOWNLOAD_BRIDGE_INSTALL_INTERVAL_MS);
    }
  };
  tryInstall();
}

// Public editor creation method
export function createEditorInstance(config: {
  fileName: string;
  fileType: string;
  binData: OnlyOfficeBinData;
  media?: Record<string, string>;
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
    console.log('Creating new editor instance for:', fileName, 'type:', fileType);

    try {
      ensureOnlyOfficeHostSizing();
      window.editor = new window.DocsAPI.DocEditor('iframe', {
        document: createLocalOnlyOfficeDocument(fileName, fileType),
        editorConfig: createSingleUserEditorConfig(editorLang),
        events: {
          onAppReady: () => {
            installLocalBinaryBridge();
            openLocalDocument(window.editor, prepareOnlyOfficeBuffer(binData));
            installLocalDownloadBridgeWhenReady();
          },
          onDocumentReady: () => {
            console.log(`${t('documentLoaded')}${fileName}`);
            // Note: For CSV files, the save dialog may show XLSX format,
            // but the actual save will be forced to CSV format in handleSaveDocument
            sendOnlyOfficeImageUrlsAfterReady(window.editor, mediaUrls);
          },
          onSave: handleSaveDocument,
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
    script.src = './web-apps/apps/api/documents/api.js';
    script.onload = () => resolve();
    script.onerror = (error) => {
      console.error('Failed to load OnlyOffice API:', error);
      alert(t('failedToLoadEditor'));
      reject(error);
    };
    document.head.appendChild(script);
  });
}
