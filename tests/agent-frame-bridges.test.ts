import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function readProjectFile(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

describe('Word/PPT Agent frame bridges', () => {
  it('loads the trusted agent plugin for all office editor types', () => {
    const config = JSON.parse(readProjectFile('public/office-agent-plugin/config.json'));
    const pluginManifest = JSON.parse(readProjectFile('public/plugins.json'));
    const editorSource = readProjectFile('lib/onlyoffice-editor.ts');
    const variation = config.variations?.[0];

    expect(pluginManifest.pluginsData).toContain('/office-agent-plugin/config.json');
    expect(variation?.EditorsSupport).toEqual(['word', 'cell', 'slide']);
    expect(variation?.type).toBe('system');
    expect(editorSource).toContain('pluginsData');
    expect(editorSource).toContain('/office-agent-plugin/config.json');
    expect(editorSource).toContain('plugins: true');
  });

  it('implements Word/PPT mutations in the trusted plugin bridge', () => {
    const source = readProjectFile('public/office-agent-plugin/scripts/bridge.js');

    expect(source).toContain("action === 'wordGetContext'");
    expect(source).toContain("action === 'wordInsertText'");
    expect(source).toContain("action === 'wordFormatSelection'");
    expect(source).toContain("action === 'pptGetContext'");
    expect(source).toContain("action === 'pptAddSlide'");
    expect(source).toContain("action === 'pptAddTextBox'");
    expect(source).toContain('Asc.plugin.callCommand');
  });

  it('uses visible editor APIs for Word/PPT Agent mutations', () => {
    const source = readProjectFile('public/office-agent-plugin/scripts/bridge.js');

    expect(source).toContain("executeMethod('PasteText'");
    expect(source).not.toContain("call(doc, ['Push']");
    expect(source).not.toContain("call(doc, ['InsertContent']");
    expect(source).not.toContain("call(paragraph, ['Select']");
    expect(source).toContain("call(presentation, ['GetCurrentVisibleSlide']");
    expect(source).toContain("call(shape, ['Select']");
    expect(source).toContain("call(content, ['GetElementsCount']");
    expect(source).toContain("call(content, ['GetElement']");
  });

  it('executes trusted plugin commands through interface mode', () => {
    const source = readProjectFile('public/office-agent-plugin/scripts/bridge.js');

    expect(source).toContain('window.Asc.plugin.info.interface = true');
    expect(source).toContain('finishCommand');
    expect(source).not.toContain('return dispatch(window.Asc.scope.__agentAction, window.Asc.scope.__agentPayload)');
  });

  it('returns trusted plugin command results through editor callback managers', () => {
    const source = readProjectFile('public/office-agent-plugin/scripts/bridge.js');

    expect(source).toContain('zf.PIa');
    expect(source).toContain('mg.f_a');
    expect(source).toContain('Lh.Pbb');
  });

  it('saves Word/PPT through host native export instead of bridge requested flags', () => {
    const wordSource = readProjectFile('lib/agent/word-tools.ts');
    const pptSource = readProjectFile('lib/agent/ppt-tools.ts');
    const saveSource = readProjectFile('lib/agent/save-tools.ts');

    expect(saveSource).toContain('saveCurrentOnlyOfficeDocument');
    expect(saveSource).not.toContain("officeBridge.execute('saveDocument'");
    expect(wordSource).toContain('executeOfficeSaveDocument');
    expect(pptSource).toContain('executeOfficeSaveDocument');
    expect(wordSource).not.toContain("officeBridge.execute('saveDocument', {})");
    expect(pptSource).not.toContain("officeBridge.execute('saveDocument', {})");
  });

  it('does not expose spreadsheet frame save requested flags', () => {
    const bridgePath = 'public/web-apps/apps/spreadsheeteditor/main/office-agent-frame-bridge.js';
    const source = readProjectFile(bridgePath);

    expect(source).not.toContain("action === 'saveDocument'");
    expect(source).not.toContain('requested: true');
  });

  it('lets late-loaded host bridges discover the trusted plugin bridge', () => {
    const source = readProjectFile('public/office-agent-plugin/scripts/bridge.js');

    expect(source).toContain('BroadcastChannel');
    expect(source).toContain("data.type === 'ping'");
    expect(source).toContain("post({ type: 'ready' })");
  });

  it('announces trusted plugin readiness only after callCommand can return callbacks', () => {
    const source = readProjectFile('public/office-agent-plugin/scripts/bridge.js');

    expect(source).toContain('agentBridgeReadyProbe');
    expect(source).toContain('readyProbeInFlight');
    expect(source).toContain('markReadyAfterProbe');
    expect(source).toContain('pluginReadyProbeError');
    expect(source).not.toContain('window.Asc.plugin.init = function () {\n    announceReady();\n  };');
  });

  it('injects document and presentation frame bridges', () => {
    const documentIndex = readProjectFile('public/web-apps/apps/documenteditor/main/index.html');
    const presentationIndex = readProjectFile('public/web-apps/apps/presentationeditor/main/index.html');

    expect(documentIndex).toContain('<script src="office-agent-frame-bridge.js"></script>');
    expect(presentationIndex).toContain('<script src="office-agent-frame-bridge.js"></script>');
  });

  it('starts the Word system plugin without exposing frame mutation shortcuts', () => {
    const bridgePath = 'public/web-apps/apps/documenteditor/main/office-agent-frame-bridge.js';
    expect(existsSync(resolve(process.cwd(), bridgePath))).toBe(true);

    const source = readProjectFile(bridgePath);
    expect(source).toContain('Asc.Pok');
    expect(source).toContain('window.zf.roj');
    expect(source).not.toContain("action === 'wordInsertText'");
    expect(source).not.toContain("action === 'wordFormatSelection'");
    expect(source).not.toContain("action === 'saveDocument'");
    expect(source).not.toContain('requested: true');
    expect(source).not.toContain('editor.callCommand');
  });

  it('starts the PPT system plugin without exposing frame mutation shortcuts', () => {
    const bridgePath = 'public/web-apps/apps/presentationeditor/main/office-agent-frame-bridge.js';
    expect(existsSync(resolve(process.cwd(), bridgePath))).toBe(true);

    const source = readProjectFile(bridgePath);
    expect(source).toContain('Asc.eak');
    expect(source).toContain('window.mg.z9i');
    expect(source).not.toContain("action === 'pptAddSlide'");
    expect(source).not.toContain("action === 'pptAddTextBox'");
    expect(source).not.toContain("action === 'saveDocument'");
    expect(source).not.toContain('requested: true');
    expect(source).not.toContain('editor.callCommand');
  });
});
