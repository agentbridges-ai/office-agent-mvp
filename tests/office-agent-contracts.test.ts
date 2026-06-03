import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

function readProjectFile(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

class FakeBroadcastChannel extends EventTarget {
  static instances: FakeBroadcastChannel[] = [];
  readonly messages: unknown[] = [];

  constructor(readonly name: string) {
    super();
    FakeBroadcastChannel.instances.push(this);
  }

  postMessage(message: unknown): void {
    this.messages.push(message);
  }

  close(): void {}
}

afterEach(() => {
  FakeBroadcastChannel.instances = [];
  vi.resetModules();
  vi.unstubAllGlobals();
});

describe('Office Agent contracts', () => {
  it('defines shared Office document and low-level API contracts', () => {
    const typesSource = readProjectFile('lib/agent/types.ts');

    expect(typesSource).toContain("export type OfficeDocumentKind = 'word' | 'spreadsheet' | 'presentation'");
    expect(typesSource).toContain('export interface OfficeApiCatalogInput');
    expect(typesSource).toContain('export interface OfficeApiCallInput');
    expect(typesSource).toContain('export interface ExcelCallInput');
  });

  it('keeps Excel bridge as a compatibility alias over the Office bridge', () => {
    const bridgeSource = readProjectFile('lib/agent/bridge.ts');

    expect(bridgeSource).toContain('export class OfficePluginBridge');
    expect(bridgeSource).toContain('export class ExcelPluginBridge extends OfficePluginBridge');
    expect(bridgeSource).toContain('export const officeBridge = new OfficePluginBridge()');
    expect(bridgeSource).toContain('export const excelBridge = officeBridge');
    expect(bridgeSource).toContain("const BRIDGE_CHANNEL = 'office-agent-excel-bridge'");
  });

  it('routes trusted plugin commands through a single channel transport', () => {
    const bridgeSource = readProjectFile('lib/agent/bridge.ts');

    expect(bridgeSource).toContain('shouldUseChannelTransport');
    expect(bridgeSource).toContain("requiredSource === 'plugin'");
    expect(bridgeSource).toContain('target: requiredSource');
    expect(bridgeSource).toContain('this.channel.postMessage(message)');
  });

  it('resets trusted plugin readiness when the host opens another document', async () => {
    const fakeWindow = new EventTarget() as Window & typeof globalThis;
    Object.assign(fakeWindow, {
      BroadcastChannel: FakeBroadcastChannel,
      setTimeout,
      clearTimeout,
      crypto,
    });
    vi.stubGlobal('window', fakeWindow);
    vi.stubGlobal('BroadcastChannel', FakeBroadcastChannel);

    const { officeBridge } = await import('../lib/agent/bridge');
    fakeWindow.dispatchEvent(new MessageEvent('message', { data: { source: 'office-agent-bridge', type: 'ready' } }));
    expect(await officeBridge.waitUntilReady(1, 'plugin')).toBe(true);

    const channel = FakeBroadcastChannel.instances[0];
    const initialMessageCount = channel.messages.length;
    fakeWindow.dispatchEvent(new CustomEvent('office-agent:document-ready', { detail: { fileType: 'pptx' } }));

    expect(await officeBridge.waitUntilReady(1, 'plugin')).toBe(false);
    expect(channel.messages.slice(initialMessageCount)).toContainEqual({
      source: 'office-agent-host',
      type: 'ping',
    });
  });

  it('keeps channel request recipients explicit to avoid frame/plugin result races', () => {
    const hostSource = readProjectFile('lib/agent/bridge.ts');
    const pluginSource = readProjectFile('public/office-agent-plugin/scripts/bridge.js');
    const wordFrameSource = readProjectFile('public/web-apps/apps/documenteditor/main/office-agent-frame-bridge.js');
    const pptFrameSource = readProjectFile(
      'public/web-apps/apps/presentationeditor/main/office-agent-frame-bridge.js',
    );

    expect(hostSource).toContain('target: requiredSource');
    expect(pluginSource).toContain("data.target === 'frame'");
    expect(wordFrameSource).toContain("data.target === 'plugin'");
    expect(pptFrameSource).toContain("data.target === 'plugin'");
  });

  it('moves generic office_api tools out of excel-tools', () => {
    expect(existsSync(resolve(process.cwd(), 'lib/agent/office-tools.ts'))).toBe(true);

    const excelToolsSource = readProjectFile('lib/agent/excel-tools.ts');
    const officeToolsSource = readProjectFile('lib/agent/office-tools.ts');

    expect(excelToolsSource).toContain("import { createOfficeApiTools } from './office-tools'");
    expect(excelToolsSource).toContain('...createOfficeApiTools(log, approvalRuntime)');
    expect(excelToolsSource).not.toContain('const officeApiCatalogSchema = z.object');
    expect(excelToolsSource).not.toContain('const officeApiCallSchema = z.object');
    expect(officeToolsSource).toContain('export function createOfficeApiTools');
    expect(officeToolsSource).toContain('office_api_catalog');
    expect(officeToolsSource).toContain('office_api_call');
  });

  it('adds an Office Agent entrypoint while preserving runExcelAgent', () => {
    const agentSource = readProjectFile('lib/agent/agent.ts');

    expect(agentSource).toContain('export async function runOfficeAgent');
    expect(agentSource).toContain('export async function runExcelAgent');
    expect(agentSource).toContain("documentKind: 'spreadsheet'");
    expect(agentSource).toContain('createSystemPrompt({');
  });

  it('routes ONLYOFFICE editor type from the current file type', () => {
    const editorSource = readProjectFile('lib/onlyoffice-editor.ts');

    expect(editorSource).toContain("import { getDocumentType, getMimeTypeFromExtension } from './document-utils'");
    expect(editorSource).toContain('documentType: getDocumentType(fileType)');
  });

  it('hides expanded FAB menus when opening documents programmatically', () => {
    const uiSource = readProjectFile('lib/ui.ts');

    expect(uiSource).toContain("document.querySelector('#fab-menu')");
    expect(uiSource).toContain("fabMenu.style.display = 'none'");
    expect(uiSource).toContain("fabMenu.style.pointerEvents = 'none'");
  });

  it('keeps focused Word/PPT E2E on the wired application create path', () => {
    const e2eSource = readProjectFile('tests/e2e/agent-word-ppt.spec.ts');

    expect(e2eSource).toContain('(window as any).onCreateNew');
    expect(e2eSource).toContain('expectFabMenuHidden');
    expect(e2eSource).not.toContain('/lib/document.ts?t=');
  });

  it('opens browser-local documents through the ONLYOFFICE binary bridge', () => {
    const editorSource = readProjectFile('lib/onlyoffice-editor.ts');

    expect(editorSource).toContain("import { prepareOnlyOfficeBuffer } from './onlyoffice-compat/binary'");
    expect(editorSource).toContain("import { installLocalBinaryBridge } from './onlyoffice-compat/local-binary'");
    expect(editorSource).toContain("import { ensureOnlyOfficeHostSizing, openLocalDocument } from './onlyoffice-compat/runtime'");
    expect(editorSource).toContain('const localDocumentBuffer = prepareOnlyOfficeBuffer(binData)');
    expect(editorSource).toContain('installLocalBinaryBridge()');
    expect(editorSource).toMatch(/openLocalDocument\(window\.editor(?: as DocEditor \| undefined)?, localDocumentBuffer\)/);
    expect(editorSource).not.toContain('data: { buf: binData }');
  });

  it('registers the ONLYOFFICE 9.3 binary save event', () => {
    const editorSource = readProjectFile('lib/onlyoffice-editor.ts');

    expect(editorSource).toContain('onSaveDocument: handleSaveDocument');
    expect(editorSource).not.toContain('onSave: handleSaveDocument');
  });
});
