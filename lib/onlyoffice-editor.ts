import {
  createOfficeEditor,
  loadOfficeEditorApi,
  type CreateOfficeEditorOptions,
  type OfficeEditorInstance,
  type OfficeEditorMode,
  type OfficeHostUrlContext,
} from '@agentbridges-ai/onlyoffice-browser';
import { getOnlyOfficeLang, t } from './i18n';

type OfficeEmptyType = 'docx' | 'xlsx' | 'pptx' | 'csv';
type SaveTargetExt = 'XLSX' | 'CSV';

const HOST_SAVE_SOURCE = 'office-agent-host-save';
const DEFAULT_SAVE_TARGET: SaveTargetExt = 'XLSX';

let activeEditor: OfficeEditorInstance | null = null;
let editorOperationQueue: Promise<void> = Promise.resolve();
let nativeSaveListenerInstalled = false;

export interface CreateEditorInstanceConfig {
  fileName: string;
  fileType?: string;
  file?: File | Blob;
  buffer?: ArrayBuffer | Uint8Array;
  url?: string;
  emptyType?: OfficeEmptyType;
  mode?: OfficeEditorMode;
  readonly?: boolean;
  fetchOptions?: RequestInit;
  // Backward-compatible alias for callers that already hold document bytes.
  binData?: ArrayBuffer | Uint8Array | string;
}

interface NativeSaveMessage {
  source?: string;
  fileName?: string;
  mimeType?: string;
  buffer?: ArrayBuffer;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function forceOfficeLightTheme(): void {
  try {
    window.localStorage.setItem('ui-theme-id', 'theme-classic-light');
    window.localStorage.setItem('content-theme', 'light');
    window.localStorage.removeItem('ui-theme');
  } catch (error) {
    console.warn('Unable to persist ONLYOFFICE light theme preference:', error);
  }
}

async function queueEditorOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    await Promise.race([
      editorOperationQueue,
      new Promise((_, reject) => window.setTimeout(() => reject(new Error('Editor operation queue timeout')), 30000)),
    ]);
  } catch (error) {
    if (error instanceof Error && error.message === 'Editor operation queue timeout') {
      console.warn('Editor operation queue timeout, proceeding anyway');
    } else {
      throw error;
    }
  }

  let release: () => void;
  let fail: (error: unknown) => void;
  editorOperationQueue = new Promise<void>((resolve, reject) => {
    release = resolve;
    fail = reject;
  });

  try {
    const result = await operation();
    release!();
    return result;
  } catch (error) {
    fail!(error);
    throw error;
  }
}

function getEditorContainer(): HTMLElement {
  const container = document.getElementById('iframe');
  if (!container) {
    throw new Error('Editor container #iframe was not found.');
  }
  return container;
}

function resolveDefaultHostUrl(): string {
  const current = new URL(window.location.href);
  const localHostnames = new Set(['localhost', '127.0.0.1', '0.0.0.0']);
  if (localHostnames.has(current.hostname) || current.hostname.endsWith('.localhost')) {
    current.hostname = 'host.localhost';
  } else {
    current.hostname = `office-host.${current.hostname}`;
  }
  current.pathname = `${current.pathname.replace(/\/[^/]*$/, '/') || '/'}office-host.html`;
  current.search = '';
  current.hash = '';
  return current.href;
}

function resolveConfiguredHostUrl(context: OfficeHostUrlContext): string {
  const configured = import.meta.env.VITE_ONLYOFFICE_HOST_URL?.trim();
  if (!configured) return resolveDefaultHostUrl();
  return configured.replaceAll('{sessionId}', encodeURIComponent(context.sessionId));
}

function toEditorBuffer(input: ArrayBuffer | Uint8Array | string): ArrayBuffer | Uint8Array {
  if (typeof input === 'string') {
    return new TextEncoder().encode(input);
  }
  return input;
}

function makeEditorOptions(config: CreateEditorInstanceConfig): CreateOfficeEditorOptions {
  const options: CreateOfficeEditorOptions = {
    hostUrl: resolveConfiguredHostUrl,
    fileName: config.fileName,
    mode: config.mode || 'edit',
    readonly: config.readonly ?? false,
    spellcheck: false,
    lang: getOnlyOfficeLang(),
    fetchOptions: config.fetchOptions,
    onReady: (instance) => {
      const state = instance.getState();
      console.log(`${t('documentLoaded')}${state.fileName}`);
      window.dispatchEvent(
        new CustomEvent('office-agent:document-ready', {
          detail: { fileName: state.fileName, fileType: state.fileType },
        }),
      );
    },
    onError: (error) => {
      console.error('OnlyOffice editor error:', error);
    },
  };

  if (config.emptyType) {
    options.emptyType = config.emptyType;
  } else if (config.file) {
    options.file = config.file;
  } else if (config.url) {
    options.url = config.url;
  } else if (config.buffer) {
    options.buffer = config.buffer;
  } else if (config.binData) {
    options.buffer = toEditorBuffer(config.binData);
  } else {
    throw new Error('createEditorInstance requires file, buffer, url, emptyType, or binData.');
  }

  return options;
}

async function downloadFile(file: File): Promise<void> {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 100);
}

function installNativeSaveListener(): void {
  if (nativeSaveListenerInstalled) return;
  nativeSaveListenerInstalled = true;
  window.addEventListener('message', (event: MessageEvent<NativeSaveMessage>) => {
    const data = event.data;
    if (!data || data.source !== HOST_SAVE_SOURCE || !(data.buffer instanceof ArrayBuffer)) return;
    const fileName = data.fileName || 'workbook.xlsx';
    const file = new File([data.buffer], fileName, { type: data.mimeType || 'application/octet-stream' });
    void downloadFile(file).catch((error) => {
      console.error('Failed to download saved workbook:', error);
    });
  });
}

export function getActiveEditor(): OfficeEditorInstance | null {
  return activeEditor;
}

export async function destroyActiveEditor(): Promise<void> {
  await queueEditorOperation(async () => {
    const editor = activeEditor;
    activeEditor = null;
    try {
      await editor?.destroy();
    } finally {
      getEditorContainer().replaceChildren();
    }
  });
}

export function createEditorInstance(config: CreateEditorInstanceConfig): Promise<void> {
  installNativeSaveListener();
  return queueEditorOperation(async () => {
    const container = getEditorContainer();
    const previousEditor = activeEditor;
    activeEditor = null;
    if (previousEditor) {
      await previousEditor.destroy();
    }
    container.replaceChildren();
    forceOfficeLightTheme();

    try {
      activeEditor = await createOfficeEditor(container, makeEditorOptions(config));
    } catch (error) {
      const normalized = toError(error);
      alert(`${t('failedToLoadEditor')}\n${normalized.message}`);
      throw normalized;
    }
  });
}

export async function saveActiveEditor(targetExt: SaveTargetExt = DEFAULT_SAVE_TARGET): Promise<File> {
  const editor = activeEditor;
  if (!editor) {
    throw new Error('Excel 尚未连接，无法保存工作簿。');
  }
  return editor.save(targetExt);
}

export async function downloadActiveEditor(targetExt: SaveTargetExt = DEFAULT_SAVE_TARGET): Promise<File> {
  const file = await saveActiveEditor(targetExt);
  await downloadFile(file);
  return file;
}

export function loadEditorApi(): Promise<void> {
  return loadOfficeEditorApi();
}
