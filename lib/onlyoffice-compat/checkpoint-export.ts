import { getDocmentObj } from '../../store';
import { downloadLocalDataFromCurrentEditor } from './local-download';
import { exportNativeDataFromCurrentEditor, resolveNativeSaveTarget } from './save';

export interface OnlyOfficeCheckpointData {
  bin: Uint8Array;
  fileName: string;
  outputFormat: number;
  targetFormat: string;
}

export async function exportCurrentOnlyOfficeCheckpointData(): Promise<OnlyOfficeCheckpointData> {
  const { fileName } = getDocmentObj() || {};
  if (!fileName) throw new Error('Current document file name is unavailable for checkpoint export.');

  const target = resolveNativeSaveTarget(fileName);
  if (target.targetFormat !== 'XLSX') {
    return {
      ...target,
      fileName,
      bin: exportNativeDataFromCurrentEditor(),
    };
  }

  return exportSpreadsheetCheckpointData(fileName, target);
}

async function exportSpreadsheetCheckpointData(
  fileName: string,
  target: { outputFormat: number; targetFormat: string },
): Promise<OnlyOfficeCheckpointData> {
  let captured: Uint8Array | null = null;
  await downloadLocalDataFromCurrentEditor({
    editor: window.editor as DocEditor | undefined,
    outputFormat: target.outputFormat,
    targetFormat: target.targetFormat,
    convert: async (bin) => {
      captured = copyBytes(bin);
    },
  });
  if (!captured) throw new Error('ONLYOFFICE spreadsheet checkpoint export did not return binary data.');
  return { ...target, fileName, bin: captured };
}

function copyBytes(bytes: Uint8Array): Uint8Array {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy;
}
