const MAX_BASENAME_LENGTH = 200;

export function sanitizeX2TFileName(input: string): string {
  if (typeof input !== 'string' || !input.trim()) {
    return 'file.bin';
  }

  const normalized = input.trim();
  rejectPathSemanticName(normalized);

  const parts = normalized.split('.');
  const ext = parts.pop() || 'bin';
  const name = parts.join('.');
  const sanitized = sanitizeBaseName(name) || 'file';

  return `${sanitized.slice(0, MAX_BASENAME_LENGTH)}.${ext}`;
}

function rejectPathSemanticName(name: string): void {
  if (name.includes('..')) {
    throw new Error(`x2t filename rejected: path traversal "${name}"`);
  }
  if (name.startsWith('/') || name.startsWith('\\')) {
    throw new Error(`x2t filename rejected: absolute path "${name}"`);
  }
  if (/^[a-zA-Z]:[/\\]/.test(name)) {
    throw new Error(`x2t filename rejected: Windows drive prefix "${name}"`);
  }
  if (/^(file|https?|data|ftp):\/\//i.test(name)) {
    throw new Error(`x2t filename rejected: protocol prefix "${name}"`);
  }
  if (name.includes('\0')) {
    throw new Error('x2t filename rejected: NUL byte');
  }
}

function sanitizeBaseName(name: string): string {
  return name
    .replace(/[/?<>\\:*|"]/g, '')
    .split('')
    .filter((char) => !isControlCharacter(char))
    .join('')
    .replace(/^\.+$/, '')
    .replace(/[&'%!"{}[\]]/g, '')
    .trim();
}

function isControlCharacter(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= 1 && code <= 31) || (code >= 128 && code <= 159);
}
