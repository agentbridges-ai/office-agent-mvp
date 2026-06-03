import { installLocalDownloadBridge, type ConvertBinAndDownload } from './save';

const LOCAL_DOWNLOAD_TIMEOUT_MS = 60000;
const LOCAL_DOWNLOAD_READY_POLL_MS = 50;

type DownloadOptions = {
  asc_setFileType?: (format: number) => void;
  asc_setIsDownloadEvent?: (isDownloadEvent: boolean) => void;
};

type LocalDownloadApi = {
  asc_DownloadAs?: (options: DownloadOptions) => unknown;
  wa?: {
    Pxg?: unknown;
  };
};

type LocalDownloadFrameWindow = Window & {
  Asc?: {
    asc_CDownloadOptions?: new (format: number) => DownloadOptions;
    editor?: LocalDownloadApi;
  };
  AscCommon?: {
    lQj?: (editorType: string, onLoad: () => void, onError?: () => void) => unknown;
  };
  AscCommonExcel?: {
    Cl?: unknown;
  };
  editor?: LocalDownloadApi;
};

export async function downloadLocalDataFromCurrentEditor(options: {
  editor: DocEditor | undefined;
  convert: ConvertBinAndDownload;
  outputFormat: number;
  targetFormat: string;
  timeoutMs?: number;
  onError?: (message: string) => void;
}): Promise<void> {
  const frame = getEditorFrameWindow();
  if (!frame) throw new Error('ONLYOFFICE editor iframe is unavailable for local download');
  if (typeof getLocalDownloadApi(frame)?.asc_DownloadAs !== 'function') {
    throw new Error('ONLYOFFICE download API is unavailable');
  }
  const DownloadOptionsCtor = frame.Asc?.asc_CDownloadOptions;
  if (typeof DownloadOptionsCtor !== 'function') throw new Error('ONLYOFFICE download options API is unavailable');

  await waitForFullSpreadsheetSdk(frame, options.timeoutMs ?? LOCAL_DOWNLOAD_TIMEOUT_MS);
  await waitForSpreadsheetNativeDownloadApi(frame, options.timeoutMs ?? LOCAL_DOWNLOAD_TIMEOUT_MS);
  const api = getLocalDownloadApi(frame);
  if (typeof api?.asc_DownloadAs !== 'function') throw new Error('ONLYOFFICE download API is unavailable');
  const completion = waitForLocalDownload(options);
  const downloadOptions = createDownloadOptions(DownloadOptionsCtor, options.outputFormat);
  api.asc_DownloadAs(downloadOptions);
  await completion;
}

async function waitForFullSpreadsheetSdk(frame: LocalDownloadFrameWindow, timeoutMs: number): Promise<void> {
  const startedAt = Date.now();
  const loadPromise = requestFullSpreadsheetSdk(frame);
  let loadError = '';
  while (Date.now() - startedAt < timeoutMs) {
    if (hasFullSpreadsheetSdk(frame)) return;
    try {
      await Promise.race([loadPromise, delay(LOCAL_DOWNLOAD_READY_POLL_MS)]);
    } catch (error) {
      loadError = error instanceof Error ? error.message : String(error);
      break;
    }
  }
  if (hasFullSpreadsheetSdk(frame)) return;
  const errorSuffix = loadError ? `, loaderError=${loadError}` : '';
  throw new Error(
    `ONLYOFFICE spreadsheet full SDK was not ready after ${timeoutMs}ms ` +
      `(AscCommonExcel.Cl=${typeof frame.AscCommonExcel?.Cl}${errorSuffix}).`,
  );
}

function hasFullSpreadsheetSdk(frame: LocalDownloadFrameWindow): boolean {
  return typeof frame.AscCommonExcel?.Cl === 'function';
}

async function waitForSpreadsheetNativeDownloadApi(frame: LocalDownloadFrameWindow, timeoutMs: number): Promise<void> {
  const startedAt = Date.now();
  let api = getLocalDownloadApi(frame);
  while (Date.now() - startedAt < timeoutMs) {
    api = getLocalDownloadApi(frame);
    if (api && hasSpreadsheetNativeDownloadApi(api)) return;
    await delay(LOCAL_DOWNLOAD_READY_POLL_MS);
  }
  throw new Error(
    `ONLYOFFICE spreadsheet native download API was not ready after ${timeoutMs}ms ` +
      `(api.wa.Pxg=${typeof api?.wa?.Pxg}).`,
  );
}

function hasSpreadsheetNativeDownloadApi(api: LocalDownloadApi): boolean {
  return typeof api.wa?.Pxg === 'function';
}

function requestFullSpreadsheetSdk(frame: LocalDownloadFrameWindow): Promise<void> {
  if (hasFullSpreadsheetSdk(frame)) return Promise.resolve();
  const loadFullSdk = frame.AscCommon?.lQj;
  if (typeof loadFullSdk !== 'function') {
    return Promise.reject(new Error('ONLYOFFICE spreadsheet full SDK loader is unavailable'));
  }
  return new Promise((resolve, reject) => {
    const onLoad = () => {
      if (hasFullSpreadsheetSdk(frame)) {
        resolve();
        return;
      }
      reject(new Error('ONLYOFFICE spreadsheet full SDK loaded without AscCommonExcel.Cl'));
    };
    loadFullSdk('cell', onLoad, () => reject(new Error('ONLYOFFICE spreadsheet full SDK failed to load')));
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getEditorFrameWindow(): LocalDownloadFrameWindow | null {
  const iframe = document.querySelector<HTMLIFrameElement>('iframe[name="frameEditor"]');
  return (iframe?.contentWindow as LocalDownloadFrameWindow | null) || null;
}

function getLocalDownloadApi(frame: LocalDownloadFrameWindow): LocalDownloadApi | undefined {
  return frame.Asc?.editor || frame.editor;
}

function createDownloadOptions(
  DownloadOptionsCtor: new (format: number) => DownloadOptions,
  outputFormat: number,
): DownloadOptions {
  const downloadOptions = new DownloadOptionsCtor(outputFormat);
  downloadOptions.asc_setIsDownloadEvent?.(true);
  downloadOptions.asc_setFileType?.(outputFormat);
  return downloadOptions;
}

function waitForLocalDownload(options: {
  editor: DocEditor | undefined;
  convert: ConvertBinAndDownload;
  targetFormat: string;
  timeoutMs?: number;
  onError?: (message: string) => void;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    let timeout = 0;
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      error ? reject(error) : resolve();
    };
    timeout = window.setTimeout(
      () => finish(new Error('Timed out while waiting for ONLYOFFICE local download.')),
      options.timeoutMs ?? LOCAL_DOWNLOAD_TIMEOUT_MS,
    );
    try {
      installLocalDownloadBridge({
        editor: options.editor,
        onError: options.onError,
        convert: async (bin, fileName, targetExt) => {
          try {
            await options.convert(bin, fileName, targetExt || options.targetFormat);
            finish();
          } catch (error) {
            finish(error instanceof Error ? error : new Error(String(error)));
            throw error;
          }
        },
      });
    } catch (error) {
      finish(error instanceof Error ? error : new Error(String(error)));
    }
  });
}
