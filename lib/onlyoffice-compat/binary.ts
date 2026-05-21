const SUPPORTED_BIN_STRING_PREFIXES = new Set(['DOCY', 'XLSY', 'PPTY']);

export type OnlyOfficeBinData = ArrayBuffer | Uint8Array | string;

export function prepareOnlyOfficeBuffer(binData: OnlyOfficeBinData): ArrayBuffer {
  if (isArrayBufferView(binData)) {
    const bytes = new Uint8Array(binData.buffer, binData.byteOffset, binData.byteLength);
    return bytes.slice().buffer;
  }

  if (isArrayBuffer(binData)) {
    return binData;
  }

  const parts = binData.split(';');
  const [prefix, _version, byteLengthText] = parts;
  if (parts.length < 4 || !SUPPORTED_BIN_STRING_PREFIXES.has(prefix)) {
    throw new Error(`Unsupported OnlyOffice binary string format: ${prefix || 'empty'}`);
  }

  const expectedByteLength = Number(byteLengthText);
  if (!Number.isSafeInteger(expectedByteLength) || expectedByteLength < 0) {
    throw new Error(`Invalid OnlyOffice binary byte length: ${byteLengthText}`);
  }

  const payload = parts.slice(3).join(';');
  const decodedLength = atob(payload).length;
  if (decodedLength !== expectedByteLength) {
    throw new Error(`OnlyOffice binary length mismatch: expected ${expectedByteLength}, got ${decodedLength}`);
  }

  return new TextEncoder().encode(binData).buffer;
}

function isArrayBuffer(value: unknown): value is ArrayBuffer {
  return Object.prototype.toString.call(value) === '[object ArrayBuffer]';
}

function isArrayBufferView(value: unknown): value is ArrayBufferView {
  return Boolean(value) && ArrayBuffer.isView(value as ArrayBufferView);
}
