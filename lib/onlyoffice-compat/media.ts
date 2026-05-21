import { createObjectURL } from 'ranuts/utils';
import { getMimeTypeFromExtension } from '../document-utils';
import { toUint8Array } from './binary';

export type MediaMap = Record<string, string>;

export function sendOnlyOfficeImageUrlsAfterReady(editor: DocEditor | undefined, mediaUrls: MediaMap | undefined): void {
  if (!mediaUrls || Object.keys(mediaUrls).length === 0) return;
  if (typeof editor?.sendCommand !== 'function') return;
  editor.sendCommand({
    command: 'asc_setImageUrls',
    data: { urls: mediaUrls },
  });
}

export async function writeImageToMediaMap(event: WriteFileEvent, media: MediaMap): Promise<{ objectUrl: string; fileName: string }> {
  const eventData = event.data;
  if (!eventData) throw new Error('No data provided in writeFile event');

  const { data: imageData, file: fileName } = eventData;
  const imageBytes = toUint8Array(imageData);
  if (!imageBytes) {
    throw new Error('Invalid image data: expected Uint8Array');
  }
  if (!fileName || typeof fileName !== 'string') {
    throw new Error('Invalid file name');
  }

  const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'png';
  const mimeType = getMimeTypeFromExtension(fileExtension);
  const blob = new Blob([imageBytes as unknown as BlobPart], { type: mimeType });
  const objectUrl = await createObjectURL(blob);
  media[`media/${fileName}`] = objectUrl;
  return { objectUrl, fileName };
}

export function sendWriteFileCallback(editor: DocEditor | undefined, result: { objectUrl: string; fileName: string }): void {
  if (typeof editor?.sendCommand === 'function') {
    editor.sendCommand({
    command: 'asc_writeFileCallback',
    data: {
      path: result.objectUrl,
      imgName: result.fileName,
    },
  });
  }
}

export function sendWriteFileFailure(editor: DocEditor | undefined, event: WriteFileEvent, error: Error): void {
  if (typeof editor?.sendCommand === 'function') {
    editor.sendCommand({
      command: 'asc_writeFileCallback',
      data: {
        success: false,
        error: error.message,
      },
    });
  }
  event.callback?.({ success: false, error: error.message });
}
