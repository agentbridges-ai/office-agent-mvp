import { getDocmentObj, setDocmentObj } from '../store';
import { excelBridge } from './agent/bridge';
import { cancelPendingSaveCapture, captureNextSaveAsBin, createEditorInstance, loadEditorApi } from './onlyoffice-editor';

export interface WorkbookCheckpoint {
  id: string;
  scope: string;
  name: string;
  fileName: string;
  fileType: string;
  createdAt: string;
  size: number;
}

interface WorkbookCheckpointRecord extends WorkbookCheckpoint {
  bin: ArrayBuffer;
}

const DB_NAME = 'office-agent-checkpoints';
const DB_VERSION = 1;
const STORE_NAME = 'workbook-checkpoints';

let dbPromise: Promise<IDBDatabase> | undefined;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open checkpoint storage.'));
  });
  return dbPromise;
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | Promise<IDBRequest<T>>,
): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    let request: IDBRequest<T>;
    transaction.onerror = () => reject(transaction.error || new Error('Checkpoint storage transaction failed.'));
    transaction.onabort = () => reject(transaction.error || new Error('Checkpoint storage transaction aborted.'));
    Promise.resolve(run(store))
      .then((nextRequest) => {
        request = nextRequest;
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('Checkpoint storage request failed.'));
      })
      .catch(reject);
  });
}

function currentDocumentScope(): string {
  const document = getDocmentObj();
  return document.fileName || 'New_Document.xlsx';
}

function currentFileType(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || 'xlsx';
}

function toStoredBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function metadataOf(record: WorkbookCheckpointRecord): WorkbookCheckpoint {
  const { bin: _bin, ...metadata } = record;
  return metadata;
}

export function getCurrentCheckpointScope(): string {
  return currentDocumentScope();
}

export async function listWorkbookCheckpoints(scope = currentDocumentScope()): Promise<WorkbookCheckpoint[]> {
  const records = await withStore<WorkbookCheckpointRecord[]>('readonly', (store) => store.getAll());
  return records
    .filter((record) => record.scope === scope)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(metadataOf);
}

export async function createWorkbookCheckpoint(name: string): Promise<WorkbookCheckpoint> {
  const cleanName = name.trim();
  if (!cleanName) throw new Error('请输入检查点名称。');
  const ready = await excelBridge.waitUntilReady(5000);
  if (!ready) throw new Error('Excel 尚未连接，无法创建检查点。');

  const capture = captureNextSaveAsBin(25000);
  const saveRequest = await excelBridge.execute('saveDocument', {}, 5000);
  if (!saveRequest.ok) {
    cancelPendingSaveCapture(new Error(saveRequest.error || '无法触发工作簿保存。'));
    throw new Error(saveRequest.error || '无法触发工作簿保存。');
  }

  const captured = await capture;
  const fileName = captured.fileName || currentDocumentScope();
  const bin = toStoredBuffer(captured.bin);
  const record: WorkbookCheckpointRecord = {
    id: crypto.randomUUID(),
    scope: currentDocumentScope(),
    name: cleanName.slice(0, 80),
    fileName,
    fileType: currentFileType(fileName),
    createdAt: new Date().toISOString(),
    size: bin.byteLength,
    bin,
  };
  await withStore<IDBValidKey>('readwrite', (store) => store.put(record));
  return metadataOf(record);
}

export async function restoreWorkbookCheckpoint(id: string): Promise<WorkbookCheckpoint> {
  const record = await withStore<WorkbookCheckpointRecord | undefined>('readonly', (store) => store.get(id));
  if (!record) throw new Error('检查点不存在或已被删除。');
  await loadEditorApi();
  setDocmentObj({
    fileName: record.fileName,
    file: undefined,
  });
  await createEditorInstance({
    fileName: record.fileName,
    fileType: record.fileType,
    binData: record.bin,
  });
  return metadataOf(record);
}

export async function deleteWorkbookCheckpoint(id: string): Promise<void> {
  await withStore<undefined>('readwrite', (store) => store.delete(id));
}
