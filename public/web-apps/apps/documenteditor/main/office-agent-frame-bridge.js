(function () {
  var SOURCE = 'office-agent-frame-bridge';
  var HOST_SOURCE = 'office-agent-host';
  var BRIDGE_CHANNEL = 'office-agent-excel-bridge';
  var READY_INTERVAL_MS = 1000;
  var bridgeChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(BRIDGE_CHANNEL) : null;
  var systemPluginsDiscovered = false;
  var systemPluginsStarted = false;
  var pluginDiagnosticPosted = false;

  function ok(result, supportLevel) {
    return { ok: true, supportLevel: supportLevel || 'supported', result: result || null };
  }

  function fail(error, supportLevel, result) {
    return { ok: false, supportLevel: supportLevel || 'unsupported', error: error, result: result || null };
  }

  function getEditor() {
    var asc = window.Asc || {};
    return asc.editor || window.editor || null;
  }

  function hasMethod(obj, names) {
    if (!obj) return false;
    for (var i = 0; i < names.length; i += 1) {
      if (typeof obj[names[i]] === 'function') return true;
    }
    return false;
  }

  function post(message) {
    window.parent.postMessage(Object.assign({ source: SOURCE }, message), '*');
    if (bridgeChannel) bridgeChannel.postMessage(Object.assign({ source: SOURCE }, message));
  }

  function postPluginDiagnostic(message) {
    if (pluginDiagnosticPosted) return;
    pluginDiagnosticPosted = true;
    post({ type: 'diagnostic', result: { pluginLoadError: message } });
  }

  function discoverSystemPlugins(editor) {
    if (systemPluginsDiscovered) return;
    if (!window.Asc || typeof window.Asc.Pok !== 'function') {
      throw new Error('Word system plugin loader is unavailable.');
    }
    window.Asc.Pok(editor);
    systemPluginsDiscovered = true;
  }

  function startSystemPlugins() {
    if (!window.zf || typeof window.zf.roj !== 'function') {
      throw new Error('Word system plugin starter is unavailable.');
    }
    if (!window.zf.YOb || !window.zf.YOb.length) return false;
    window.zf.roj();
    return true;
  }

  function ensureSystemPlugins(editor) {
    if (systemPluginsStarted || !editor) return;
    try {
      discoverSystemPlugins(editor);
      systemPluginsStarted = startSystemPlugins();
    } catch (error) {
      postPluginDiagnostic(error instanceof Error ? error.message : String(error));
    }
  }

  function dispatchOfficeApiCall(editor, payload) {
    var root = (payload.target && payload.target.root) || 'editor';
    var target = root === 'Asc' ? window.Asc : root === 'AscCommon' ? window.AscCommon : editor;
    var memberName = String(payload.memberName || '').trim();
    if (!target || !memberName || typeof target[memberName] !== 'function') {
      return fail('Office API method is unavailable on target: ' + memberName, 'unsupported');
    }
    return ok({ result: target[memberName].apply(target, payload.args || []) }, 'partial');
  }

  function dispatch(action, payload) {
    var editor = getEditor();
    if (!editor) return fail('ONLYOFFICE document editor is not ready yet.', 'partial');
    if (action === 'wordGetContext') return ok({ documentType: 'word', canSave: hasMethod(editor, ['asc_Save']) });
    if (action === 'officeApiCatalog') return ok({ roots: ['editor', 'Asc', 'AscCommon'] }, 'partial');
    if (action === 'officeApiCall') return dispatchOfficeApiCall(editor, payload || {});
    return fail('Unknown bridge action: ' + action, 'unsupported');
  }

  function handleMessage(event) {
    var data = event.data;
    if (!data || data.source !== HOST_SOURCE) return;
    if (data.target === 'plugin') return;
    if (data.type === 'ping') {
      announceReady();
      return;
    }
    if (data.type !== 'request' || !data.id) return;
    try {
      post(Object.assign({ type: 'result', id: data.id }, dispatch(data.action, data.payload)));
    } catch (error) {
      post(Object.assign({ type: 'result', id: data.id }, fail(String(error), 'partial')));
    }
  }

  function announceReady() {
    var editor = getEditor();
    if (!editor) return;
    ensureSystemPlugins(editor);
    post({ type: 'ready', result: { documentType: 'word', canSave: hasMethod(editor, ['asc_Save']) } });
  }

  window.addEventListener('message', handleMessage);
  if (bridgeChannel) bridgeChannel.addEventListener('message', handleMessage);
  window.setInterval(announceReady, READY_INTERVAL_MS);
  announceReady();
})();
