export function createSmokeState() {
  return {
    console: [],
    logs: [],
    requests: [],
    requestDetails: new Map(),
    responses: [],
    exceptions: [],
    events: [],
  };
}

export function hookSource() {
  return `
    (() => {
      const emit = (event) => {
        const payload = { ...event, time: Date.now() };
        window.__ooSmokeEvents = window.__ooSmokeEvents || [];
        window.__ooSmokeEvents.push(payload);
        try { window.__ooSmokeRecord(JSON.stringify(payload)); } catch (_) {}
      };
      window.__ooSmokeEvents = [];
      window.__ooSmokeState = { created: false, downloadHookInstalled: false };
      window.alert = (message) => emit({ type: 'alert', message: String(message) });
      window.showSaveFilePicker = undefined;
      const originalAnchorClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function() {
        emit({
          type: 'download:anchor',
          download: this.download || '',
          hrefPrefix: String(this.href || '').slice(0, 32),
        });
        return originalAnchorClick.apply(this, arguments);
      };
      window.addEventListener('message', (event) => {
        const data = event.data;
        if (data && typeof data === 'object' && data.command) {
          const payload = data.data;
          emit({
            type: 'frame:message',
            command: data.command,
            payloadType: Object.prototype.toString.call(payload),
            byteLength: payload && (payload.byteLength || payload.length || 0),
          });
          return;
        }
        if (data && typeof data === 'object' && data.event) {
          emit({
            type: 'frame:event',
            event: data.event,
            hasData: Boolean(data.data),
            dataType: Object.prototype.toString.call(data.data),
            outputformat: data.data && data.data.outputformat,
          });
          return;
        }
        if (typeof data === 'string' && data.includes('openDocument')) {
          emit({ type: 'frame:message:string', sample: data.slice(0, 120) });
        }
      });
      const install = () => {
        const DocsAPI = window.DocsAPI;
        if (!DocsAPI || !DocsAPI.DocEditor || DocsAPI.DocEditor.__ooSmokeWrapped) return false;
        const Original = DocsAPI.DocEditor;
        function WrappedDocEditor(id, config) {
          emit({ type: 'docEditor:create', id, fileType: config && config.document && config.document.fileType });
          const events = (config && config.events) || {};
          ['onAppReady', 'onDocumentReady', 'onSave', 'onSaveDocument', 'writeFile'].forEach((name) => {
            if (typeof events[name] !== 'function') return;
            const original = events[name];
            events[name] = function(event) {
              emit({
                type: 'event:' + name,
                fileType: config.document && config.document.fileType,
                hasBinaryData: Boolean(event && event.data && event.data.data && event.data.data.data),
              });
              return original.apply(this, arguments);
            };
          });
          const editor = new Original(id, config);
          const originalSendCommand = editor.sendCommand && editor.sendCommand.bind(editor);
          if (originalSendCommand) {
            editor.sendCommand = (command) => {
              emit({ type: 'sendCommand', command: command && command.command });
              return originalSendCommand(command);
            };
          }
          const originalOpenDocument = editor.openDocument && editor.openDocument.bind(editor);
          if (originalOpenDocument) {
            editor.openDocument = (doc) => {
              const buffer = doc && doc.buffer;
              emit({
                type: 'openDocument',
                byteLength: buffer && (buffer.byteLength || buffer.length || 0),
                bufferType: buffer && Object.prototype.toString.call(buffer),
              });
              return originalOpenDocument(doc);
            };
          }
          window.__ooSmokeState.created = true;
          return editor;
        }
        Object.setPrototypeOf(WrappedDocEditor, Original);
        WrappedDocEditor.prototype = Original.prototype;
        Object.keys(Original).forEach((key) => { WrappedDocEditor[key] = Original[key]; });
        WrappedDocEditor.__ooSmokeWrapped = true;
        DocsAPI.DocEditor = WrappedDocEditor;
        emit({ type: 'hook:installed', version: Original.version && Original.version() });
        return true;
      };
      const installFrameGateway = () => {
        if (!window.Common || !window.Common.Gateway || window.Common.Gateway.__ooSmokeWrapped) return false;
        const gateway = window.Common.Gateway;
        const originalDocumentReady = gateway.documentReady && gateway.documentReady.bind(gateway);
        if (originalDocumentReady) {
          gateway.documentReady = function() {
            emit({ type: 'frame:gatewayDocumentReady' });
            return originalDocumentReady.apply(this, arguments);
          };
        }
        const originalOn = gateway.on && gateway.on.bind(gateway);
        if (originalOn) {
          gateway.on = (eventName, handler) => {
            if ((eventName === 'opendocumentfrombinary' || eventName === 'documentready') && typeof handler === 'function') {
              const wrapped = function(payload) {
                emit({
                  type: 'frame:gateway',
                  eventName,
                  payloadType: Object.prototype.toString.call(payload),
                  byteLength: payload && (payload.byteLength || payload.length || 0),
                });
                return handler.apply(this, arguments);
              };
              return originalOn(eventName, wrapped);
            }
            return originalOn(eventName, handler);
          };
        }
        window.Common.Gateway.__ooSmokeWrapped = true;
        emit({ type: 'frame:gatewayHook' });
        return true;
      };
      const installFrameSdk = () => {
        const ApiCtor = window.Asc && window.Asc.asc_docs_api;
        if (!ApiCtor || !ApiCtor.prototype || ApiCtor.prototype.__ooSmokeWrapped) return false;
        const prototype = ApiCtor.prototype;
        const wrapMethod = (name) => {
          const original = prototype[name];
          if (typeof original !== 'function') return;
          prototype[name] = function() {
            const first = arguments[0];
            emit({
              type: 'frame:sdkMethod',
              name,
              firstType: Object.prototype.toString.call(first),
              byteLength: first && (first.byteLength || first.length || 0),
            });
            return original.apply(this, arguments);
          };
        };
        [
          'asc_openDocumentFromBytes',
          'asc_getEditorPermissions',
          'asc_LoadDocument',
          'asc_setDocInfo',
          'asyncServerIdEndLoaded',
          '_openDocumentEndCallback',
        ].forEach(wrapMethod);
        const originalRegister = prototype.asc_registerCallback;
        if (typeof originalRegister === 'function') {
          prototype.asc_registerCallback = function(name, callback) {
            if (typeof callback === 'function') {
              const wrapped = function() {
                emit({
                  type: 'frame:sdkCallback',
                  name,
                  args: Array.from(arguments).map((value) => {
                    if (value === null || value === undefined) return value;
                    if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') return value;
                    if (typeof value === 'object') {
                      const summary = { valueType: Object.prototype.toString.call(value) };
                      ['id', 'level', 'err', 'code', 'message', 'description'].forEach((key) => {
                        if (key in value) summary[key] = value[key];
                      });
                      return summary;
                    }
                    return typeof value;
                  }),
                });
                return callback.apply(this, arguments);
              };
              return originalRegister.call(this, name, wrapped);
            }
            return originalRegister.apply(this, arguments);
          };
        }
        prototype.__ooSmokeWrapped = true;
        emit({ type: 'frame:sdkHook' });
        return true;
      };
      const installFrameDownloadHook = () => {
        const ascCommon = window.AscCommon;
        const current = ascCommon && ascCommon.T7c;
        if (typeof current !== 'function' || current.__ooSmokeWrapped) return false;
        const wrappedDownload = function() {
          const args = Array.from(arguments).map((arg) => {
            if (typeof arg !== 'function') return arg;
            return function() {
              const first = arguments[0];
              emit({
                type: 'frame:downloadCallback',
                status: first && first.status,
                error: first && first.error,
                data: first && first.data,
              });
              return arg.apply(this, arguments);
            };
          });
          return current.apply(this, args);
        };
        wrappedDownload.__ooSmokeWrapped = true;
        wrappedDownload.__ooSmokeOriginal = current;
        ascCommon.T7c = wrappedDownload;
        window.__ooSmokeState.downloadHookInstalled = true;
        emit({ type: 'frame:downloadHook' });
        return true;
      };
      const timer = setInterval(() => {
        install();
        installFrameGateway();
        installFrameSdk();
        installFrameDownloadHook();
        if (
          window.DocsAPI &&
          window.DocsAPI.DocEditor &&
          window.DocsAPI.DocEditor.__ooSmokeWrapped &&
          window.__ooSmokeState.downloadHookInstalled
        ) {
          clearInterval(timer);
        }
      }, 25);
      install();
      installFrameGateway();
      installFrameSdk();
      installFrameDownloadHook();
    })();
  `;
}
