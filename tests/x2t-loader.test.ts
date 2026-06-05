import { afterEach, describe, expect, it, vi } from 'vitest';

const scriptOnLoadMock = vi.hoisted(() => vi.fn());

vi.mock('ranuts/utils', () => ({
  createObjectURL: vi.fn(),
  getCookie: vi.fn(() => null),
  getExtensions: vi.fn(() => ['docx']),
  getMime: vi.fn(() => 'application/octet-stream'),
  getQuery: vi.fn(() => ({})),
  localStorageGetItem: vi.fn(() => null),
  scriptOnLoad: scriptOnLoadMock,
}));

function installWindow(module: Record<string, unknown> = {}) {
  vi.stubGlobal('window', {
    Module: module,
    location: { href: 'http://127.0.0.1:5173/editor', pathname: '/editor' },
  });
}

describe('x2t loader', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    scriptOnLoadMock.mockReset();
  });

  it('resolves the x2t script to an absolute URL for the wasm loader pre-js', async () => {
    const { resolveX2TScriptUrl } = await import('../lib/document-converter');

    expect(resolveX2TScriptUrl('/', 'http://127.0.0.1:5173/editor')).toBe(
      'http://127.0.0.1:5173/wasm/x2t/x2t.js',
    );
    expect(resolveX2TScriptUrl('/document/', 'https://example.github.io/document/index.html')).toBe(
      'https://example.github.io/document/wasm/x2t/x2t.js',
    );
  });

  it('installs the runtime callback before loading the x2t script', async () => {
    installWindow({});
    let callbackWasReady = false;
    scriptOnLoadMock.mockImplementation(async () => {
      const module = (window as any).Module;
      callbackWasReady = typeof module.onRuntimeInitialized === 'function';
      if (!callbackWasReady) throw new Error('x2t runtime callback was not installed before script load');

      module.FS = {
        mkdir: vi.fn(),
        readdir: vi.fn(),
        readFile: vi.fn(() => new Uint8Array([0])),
        writeFile: vi.fn(),
      };
      module.ccall = vi.fn();
      module.onRuntimeInitialized();
    });

    const { X2TConverter } = await import('../lib/document-converter');
    const converter = new X2TConverter();

    await expect(converter.initialize()).resolves.toBe((window as any).Module);
    expect(callbackWasReady).toBe(true);
    expect((window as any).Module.FS.writeFile).toHaveBeenCalled();
    expect(scriptOnLoadMock).toHaveBeenCalledWith(['http://127.0.0.1:5173/wasm/x2t/x2t.js']);
  });
});
