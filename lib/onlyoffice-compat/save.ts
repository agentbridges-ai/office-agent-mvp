import { getDocmentObj } from '../../store';
import { c_oAscFileType2, oAscFileType } from '../file-types';
import type { SaveEvent } from '../document-types';
import { prepareOnlyOfficeBuffer, toUint8Array } from './binary';

export type ConvertBinAndDownload = (bin: Uint8Array, fileName: string, targetExt?: string) => Promise<unknown>;
type LocalSaveResult = { ok: true } | { ok: false; error: string };
const LOCAL_DOWNLOAD_BRIDGE_FLAG = '__onlyofficeLocalDownloadBridgeInstalled';
const LOCAL_DOWNLOAD_HANDLER = '__onlyofficeHandleLocalDownloadAs';
const BLOCKING_ACTION_TYPE = 1;
const DOWNLOAD_ACTION_ID = 6;
const SAME_ORIGIN_TARGET = window.location.origin;
const NATIVE_SAVE_TARGETS = {
  csv: { targetFormat: 'CSV', outputFormat: oAscFileType.CSV },
  docx: { targetFormat: 'DOCX', outputFormat: oAscFileType.DOCX },
  pptx: { targetFormat: 'PPTX', outputFormat: oAscFileType.PPTX },
  xlsx: { targetFormat: 'XLSX', outputFormat: oAscFileType.XLSX },
} as const;

const SAVE_HOOKS = [
  { name: 'T7c', label: 'word' },
  { name: 'Iid', label: 'cell' },
  { name: 'zWc', label: 'slide' },
] as const;

type SaveHookName = (typeof SAVE_HOOKS)[number]['name'];

export function resolveLocalSaveTargetFormat(outputFormat: number, fileName?: string): string {
  if (fileName?.toLowerCase().endsWith('.csv')) return 'CSV';

  const targetFormat = c_oAscFileType2[outputFormat];
  if (!targetFormat || targetFormat === 'UNKNOWN') {
    throw new Error(`Unsupported ONLYOFFICE local save output format: ${outputFormat}`);
  }
  return targetFormat;
}

export function resolveNativeSaveTargetFormat(fileName: string): string {
  return resolveNativeSaveTarget(fileName).targetFormat;
}

export function resolveNativeSaveTarget(fileName: string): { targetFormat: string; outputFormat: number } {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const target = NATIVE_SAVE_TARGETS[extension as keyof typeof NATIVE_SAVE_TARGETS];
  if (!target) {
    throw new Error(`Unsupported browser-local native save target extension: ${extension || 'empty'}`);
  }
  return target;
}

type OnlyOfficeFrameWindow = Window & {
  Asc?: {
    editor?: LocalExportApi;
  };
  AscCommon?: Record<string, Function | undefined>;
  editor?: LocalExportApi;
};

type LocalExportApi = {
  asc_nativeGetFile2?: () => unknown;
  asc_nativeGetFile?: () => unknown;
  sync_EndAction?: (type: number, id: number) => void;
  Lsi?: () => { data?: unknown };
};

export function endOnlyOfficeDownloadAction(editor: DocEditor | undefined): void {
  if (typeof editor?.sendCommand !== 'function') return;
  editor.sendCommand({
    command: 'asc_endDownloadAction',
    data: {},
  });
}

export function sendOnlyOfficeSaveCallback(editor: DocEditor | undefined, error?: string): void {
  if (typeof editor?.sendCommand !== 'function') return;
  editor.sendCommand({
    command: 'asc_onSaveCallback',
    data: error ? { err_code: 1, error } : { err_code: 0 },
  });
}

export async function handleLocalSaveDocument(options: {
  event: SaveEvent;
  editor: DocEditor | undefined;
  convert: ConvertBinAndDownload | null;
  onError?: (message: string) => void;
}): Promise<LocalSaveResult> {
  const { event, editor, convert, onError } = options;

  try {
    if (!event.data?.data) return { ok: true };
    if (!convert) throw new Error('Converter callback not set');

    const { data, option } = event.data;
    const { fileName } = getDocmentObj() || {};
    const targetFormat = resolveLocalSaveTargetFormat(option.outputformat, fileName);

    await convert(data.data, fileName, targetFormat);
    sendOnlyOfficeSaveCallback(editor);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown save error';
    console.error('Save document failed:', error);
    onError?.(message);
    sendOnlyOfficeSaveCallback(editor, message);
    return { ok: false, error: message };
  } finally {
    endOnlyOfficeDownloadAction(editor);
  }
}

function findAvailableSaveHook(frame: OnlyOfficeFrameWindow): SaveHookName | null {
  for (const hook of SAVE_HOOKS) {
    if (typeof frame.AscCommon?.[hook.name] === 'function') {
      return hook.name;
    }
  }
  return null;
}

export function installLocalDownloadBridge(options: {
  editor: DocEditor | undefined;
  convert: ConvertBinAndDownload | null;
  onError?: (message: string) => void;
}): void {
  const frame = getEditorFrameWindow();
  if (!frame) throw new Error('ONLYOFFICE editor iframe is unavailable for download bridge');

  const hookName = findAvailableSaveHook(frame);
  if (!hookName) throw new Error('ONLYOFFICE download bridge target is unavailable: no T7c/Iid/zWc hook found');

  (window as any)[LOCAL_DOWNLOAD_HANDLER] = (event: SaveEvent) =>
    handleLocalSaveDocument({
      event,
      editor: options.editor,
      convert: options.convert,
      onError: options.onError,
    });

  const state = frame as unknown as Record<string, unknown>;
  if (state[LOCAL_DOWNLOAD_BRIDGE_FLAG]) return;

  const original = frame.AscCommon![hookName];
  frame.AscCommon![hookName] = function localDownloadAsBridge(...args: unknown[]) {
    const callback = findCallback(args);
    const event = createSaveEvent(frame, args);
    frame.parent?.postMessage(
      { event: 'onlyofficeLocalDownloadBridge', data: { outputformat: event.data.option.outputformat } },
      SAME_ORIGIN_TARGET,
    );

    Promise.resolve((frame.parent as any)[LOCAL_DOWNLOAD_HANDLER](event))
      .then((result: LocalSaveResult) => {
        endFrameDownloadAction(frame);
        if (result.ok) {
          callback?.({ status: 'ok', data: 'local-adapter-save' }, true);
          return;
        }
        callback?.({ status: 'error', error: result.error }, true, result.error);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Unknown local download error';
        endFrameDownloadAction(frame);
        callback?.({ status: 'error', error: message }, true, message);
      });
  };
  state[LOCAL_DOWNLOAD_BRIDGE_FLAG] = { original, hookName };
}

export function exportNativeDataFromCurrentEditor(): Uint8Array {
  const frame = getEditorFrameWindow();
  if (!frame) throw new Error('ONLYOFFICE editor iframe is unavailable for native export');
  return exportLocalBinaryFromEditor(frame);
}

function getEditorFrameWindow(): OnlyOfficeFrameWindow | null {
  const iframe = document.querySelector<HTMLIFrameElement>('iframe[name="frameEditor"]');
  return (iframe?.contentWindow as OnlyOfficeFrameWindow | null) || null;
}

function createSaveEvent(frame: OnlyOfficeFrameWindow, args: unknown[]): SaveEvent {
  const data = extractPayloadData(frame, args);
  const outputformat = extractOutputFormat(args);
  return { data: { data: { data }, option: { outputformat } } };
}

function findCallback(args: unknown[]): Function | undefined {
  return args.find((arg): arg is Function => typeof arg === 'function');
}

function extractPayloadData(frame: OnlyOfficeFrameWindow, args: unknown[]): Uint8Array {
  const value = args.map((arg) => extractPayloadCandidate(arg)).find((candidate) => candidate !== null) ?? null;
  const bytes = toUint8Array(value);
  if (bytes) return bytes;
  if (typeof value === 'string') return new TextEncoder().encode(value);
  return exportLocalBinaryFromEditor(frame);
}

function extractPayloadCandidate(value: unknown): unknown {
  if (toUint8Array(value) || typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return null;

  const candidate = (value as { e$?: unknown; data?: unknown }).e$ ?? (value as { data?: unknown }).data;
  if (toUint8Array(candidate) || typeof candidate === 'string') return candidate;
  return null;
}

function extractOutputFormat(args: unknown[]): number {
  const option = args.find((arg) => Boolean(arg && typeof arg === 'object' && 'outputformat' in arg));
  const outputformat = option && typeof option === 'object' ? (option as { outputformat?: unknown }).outputformat : null;
  if (Number.isSafeInteger(outputformat)) return outputformat as number;
  throw new Error('ONLYOFFICE local download output format is unavailable');
}

function exportLocalBinaryFromEditor(frame: OnlyOfficeFrameWindow): Uint8Array {
  const api = frame.Asc?.editor || frame.editor;
  if (!api) throw new Error('ONLYOFFICE editor API is unavailable for local export');

  const exported = callLocalExport(api);
  const bytes = toUint8Array(exported);
  if (bytes) return bytes;
  if (typeof exported === 'string') return new Uint8Array(prepareOnlyOfficeBuffer(exported));
  throw new Error('ONLYOFFICE local export did not return binary data');
}

function callLocalExport(api: LocalExportApi): unknown {
  if (typeof api.asc_nativeGetFile === 'function') return api.asc_nativeGetFile();
  if (typeof api.asc_nativeGetFile2 === 'function') return api.asc_nativeGetFile2();
  if (typeof api.Lsi === 'function') return api.Lsi()?.data;
  throw new Error('ONLYOFFICE local export API is unavailable');
}

function endFrameDownloadAction(frame: OnlyOfficeFrameWindow): void {
  const api = frame.Asc?.editor || frame.editor;
  if (typeof api?.sync_EndAction !== 'function') return;
  api.sync_EndAction(BLOCKING_ACTION_TYPE, DOWNLOAD_ACTION_ID);
}
