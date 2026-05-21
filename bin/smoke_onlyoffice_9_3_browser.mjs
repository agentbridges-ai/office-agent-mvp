import { createServer } from 'node:http';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { spawn } from 'node:child_process';

const DEFAULT_CHROME = '/snap/bin/chromium';
const DEFAULT_TIMEOUT = 120_000;

const REQUIRED_REQUESTS = [
  '/web-apps/apps/api/documents/api.js',
  '/sdkjs/common/AllFonts.js',
  '/wasm/x2t/x2t.js',
];

const DEFAULT_SCENARIOS = [
  { name: 'new-docx', kind: 'new', ext: '.docx', expectDocumentReady: true },
  { name: 'new-xlsx', kind: 'new', ext: '.xlsx', expectDocumentReady: true },
  {
    name: 'input-save-docx',
    kind: 'new',
    ext: '.docx',
    expectDocumentReady: true,
    action: 'input-save',
  },
  {
    name: 'pdf-block-docx',
    kind: 'new',
    ext: '.docx',
    expectDocumentReady: true,
    action: 'pdf-block',
  },
  {
    name: 'open-docx',
    kind: 'generated',
    ext: '.docx',
    fileName: 'generated-smoke.docx',
    expectDocumentReady: true,
  },
  {
    name: 'open-xlsx',
    kind: 'generated',
    ext: '.xlsx',
    fileName: 'generated-smoke.xlsx',
    expectDocumentReady: true,
  },
  {
    name: 'open-csv',
    kind: 'generated',
    ext: '.csv',
    fileName: 'generated-smoke.csv',
    expectDocumentReady: true,
  },
];

function parseArgs(argv) {
  const args = {
    appUrl: process.env.APP_URL || '',
    chrome: process.env.CHROME_BIN || DEFAULT_CHROME,
    timeoutMs: Number(process.env.SMOKE_TIMEOUT_MS || DEFAULT_TIMEOUT),
    scenarios: DEFAULT_SCENARIOS,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--app-url') {
      args.appUrl = argv[++index];
    } else if (arg === '--chrome') {
      args.chrome = argv[++index];
    } else if (arg === '--timeout-ms') {
      args.timeoutMs = Number(argv[++index]);
    } else if (arg === '--scenario') {
      const names = argv[++index].split(',').map((name) => name.trim()).filter(Boolean);
      args.scenarios = DEFAULT_SCENARIOS.filter((scenario) => names.includes(scenario.name));
  if (args.scenarios.length === 0) {
    throw new Error(`No scenarios matched: ${names.join(', ')}`);
  }
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs <= 0) {
    throw new Error('--timeout-ms must be a positive number');
  }
  return args;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForExit(child, timeoutMs = 5_000) {
  if (!child || child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

async function terminateChild(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;

  const targetPid = child.pid ? -child.pid : child.pid;
  try {
    process.kill(targetPid, 'SIGTERM');
  } catch {
    child.kill('SIGTERM');
  }

  await waitForExit(child, 3_000);
  if (child.exitCode !== null || child.signalCode !== null) return;

  try {
    process.kill(targetPid, 'SIGKILL');
  } catch {
    child.kill('SIGKILL');
  }
  await waitForExit(child, 3_000);
}

function closeServer(server) {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}

async function waitFor(check, options = {}) {
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT;
  const intervalMs = options.intervalMs || 250;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const value = await check();
    if (value) return value;
    await wait(intervalMs);
  }
  throw new Error(options.message || `Timed out after ${timeoutMs}ms`);
}

function createGeneratedSamples() {
  return new Map([
    ['.docx', createDocxSample()],
    ['.xlsx', createXlsxSample()],
    ['.csv', Buffer.from('Name,Value\nOnlyOffice 9.3,中文输入\n', 'utf8')],
  ]);
}

function startSampleServer(scenarios) {
  const generatedSamples = createGeneratedSamples();
  const files = new Map();
  for (const scenario of scenarios) {
    if (scenario.kind !== 'generated') continue;
    const sample = generatedSamples.get(scenario.ext);
    if (sample) {
      files.set(`/${encodeURIComponent(scenario.name)}${scenario.ext}`, {
        data: sample,
        fileName: scenario.fileName,
        ext: scenario.ext,
      });
    }
  }

  const server = createServer((req, res) => {
    const pathname = new URL(req.url || '/', 'http://127.0.0.1').pathname;
    const sample = files.get(pathname);
    if (!sample) {
      res.writeHead(404);
      res.end('not found');
      return;
    }

    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Content-Length': String(sample.data.length),
      'Content-Type': contentType(sample.ext),
      'Content-Disposition': `inline; filename="${sample.fileName}"; filename*=UTF-8''${encodeURIComponent(sample.fileName)}`,
    });
    res.end(sample.data);
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Sample server did not expose a TCP port'));
        return;
      }
      resolve({ server, files, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
}

function contentType(filePath) {
  const ext = filePath.startsWith('.') ? filePath.toLowerCase() : extname(filePath).toLowerCase();
  if (ext === '.docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (ext === '.xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (ext === '.pptx') return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  if (ext === '.csv') return 'text/csv; charset=utf-8';
  return 'application/octet-stream';
}

function createDocxSample() {
  return createZip([
    {
      name: '[Content_Types].xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`),
    },
    {
      name: '_rels/.rels',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`),
    },
    {
      name: 'word/document.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>ONLYOFFICE 9.3 smoke DOCX 中文段落</w:t></w:r>
    </w:p>
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`),
    },
    {
      name: 'word/styles.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei" w:hAnsi="Arial"/></w:rPr>
  </w:style>
</w:styles>`),
    },
  ]);
}

function createXlsxSample() {
  return createZip([
    {
      name: '[Content_Types].xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`),
    },
    {
      name: '_rels/.rels',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`),
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`),
    },
    {
      name: 'xl/workbook.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Smoke" sheetId="1" r:id="rId1"/></sheets>
</workbook>`),
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">
      <c r="A1" t="inlineStr"><is><t>ONLYOFFICE 9.3</t></is></c>
      <c r="B1" t="inlineStr"><is><t>中文单元格</t></is></c>
    </row>
  </sheetData>
</worksheet>`),
    },
  ]);
}

function xml(content) {
  return Buffer.from(content.replace(/\n\s*/g, ''), 'utf8');
}

function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const data = Buffer.from(entry.data);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + data.length;
  }

  const central = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, central, end]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function startViteAppServer() {
  const port = 20_000 + Math.floor(Math.random() * 20_000);
  const child = spawn('pnpm', ['exec', 'vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
  let output = '';
  const append = (chunk) => {
    output += chunk.toString();
  };
  child.stdout.on('data', append);
  child.stderr.on('data', append);

  const ready = waitFor(
    () => {
      if (output.includes(`http://127.0.0.1:${port}/`) || output.includes(`http://localhost:${port}/`)) {
        return `http://127.0.0.1:${port}/`;
      }
      if (child.exitCode !== null) {
        throw new Error(`Vite exited before readiness: ${output}`);
      }
      return '';
    },
    { timeoutMs: 30_000, message: 'Timed out waiting for Vite dynamic port' },
  );
  return { child, ready, output: () => output };
}

function startChrome(chromePath) {
  if (!existsSync(chromePath)) {
    throw new Error(`Chromium binary not found: ${chromePath}`);
  }

  const userDataDir = mkdtempSync(join(tmpdir(), 'onlyoffice-9-3-smoke-'));
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ];
  const child = spawn(chromePath, args, { stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  return { child, userDataDir, stderr: () => stderr };
}

function summarizeStackTrace(stackTrace) {
  if (!stackTrace?.callFrames) return [];
  return stackTrace.callFrames.slice(0, 5).map((frame) => ({
    functionName: frame.functionName,
    url: frame.url,
    lineNumber: frame.lineNumber,
    columnNumber: frame.columnNumber,
  }));
}

function summarizeException(details) {
  const exception = details.exception || {};
  return {
    text: details.text,
    message: exception.description || exception.value || details.text,
    url: details.url,
    lineNumber: details.lineNumber,
    columnNumber: details.columnNumber,
    stack: summarizeStackTrace(details.stackTrace),
  };
}

async function getDebuggerUrl(chrome) {
  const pattern = /DevTools listening on (ws:\/\/[^\s]+)/;
  return waitFor(
    () => {
      const match = chrome.stderr().match(pattern);
      return match?.[1];
    },
    { timeoutMs: 15_000, message: 'Timed out waiting for Chrome DevTools URL' },
  );
}

class CdpClient {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.handlers = new Map();
    socket.addEventListener('message', (event) => this.onMessage(event));
  }

  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });
    return new CdpClient(socket);
  }

  on(eventName, handler) {
    const handlers = this.handlers.get(eventName) || [];
    handlers.push(handler);
    this.handlers.set(eventName, handlers);
  }

  send(method, params = {}, sessionId = undefined) {
    const id = this.nextId++;
    const payload = sessionId ? { id, method, params, sessionId } : { id, method, params };
    this.socket.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
    });
  }

  onMessage(event) {
    const message = JSON.parse(event.data);
    if (message.id) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) {
        pending.reject(new Error(`${pending.method}: ${message.error.message}`));
      } else {
        pending.resolve(message.result);
      }
      return;
    }

    const handlers = this.handlers.get(message.method) || [];
    for (const handler of handlers) {
      handler(message.params);
    }
  }

  close() {
    for (const pending of this.pending.values()) {
      pending.reject(new Error('CDP socket closed'));
    }
    this.pending.clear();
    this.socket.close();
  }
}

async function createPage(browserUrl) {
  const browser = await CdpClient.connect(browserUrl);
  const target = await browser.send('Target.createTarget', { url: 'about:blank' });
  const attached = await browser.send('Target.attachToTarget', {
    targetId: target.targetId,
    flatten: true,
  });

  const sessionId = attached.sessionId;
  const send = (method, params = {}) => browser.send(method, params, sessionId);
  return { browser, send };
}

async function setupPage(page, state) {
  page.browser.on('Runtime.consoleAPICalled', (params) => {
    const text = params.args.map((arg) => arg.value ?? arg.description ?? '').join(' ');
    state.console.push({ type: params.type, text });
  });
  page.browser.on('Log.entryAdded', (params) => {
    state.logs.push({ level: params.entry.level, text: params.entry.text, url: params.entry.url });
  });
  page.browser.on('Network.requestWillBeSent', (params) => {
    state.requests.push(params.request.url);
    state.requestDetails.set(params.requestId, {
      url: params.request.url,
      method: params.request.method,
      initiator: params.initiator
        ? {
            type: params.initiator.type,
            url: params.initiator.url,
            lineNumber: params.initiator.lineNumber,
            columnNumber: params.initiator.columnNumber,
            stack: summarizeStackTrace(params.initiator.stack),
          }
        : undefined,
    });
  });
  page.browser.on('Network.responseReceived', (params) => {
    const request = state.requestDetails.get(params.requestId);
    state.responses.push({
      url: params.response.url,
      status: params.response.status,
      request,
    });
  });
  page.browser.on('Runtime.exceptionThrown', (params) => {
    state.exceptions.push(summarizeException(params.exceptionDetails));
  });

  await page.send('Runtime.enable');
  await page.send('Log.enable');
  await page.send('Network.enable');
  await page.send('Page.enable');
  await page.send('Runtime.addBinding', { name: '__ooSmokeRecord' });
  page.browser.on('Runtime.bindingCalled', (params) => {
    if (params.name !== '__ooSmokeRecord') return;
    state.events.push(JSON.parse(params.payload));
  });
  await page.send('Page.addScriptToEvaluateOnNewDocument', { source: hookSource() });
}

function createSmokeState() {
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

function hookSource() {
  return `
    (() => {
      const emit = (event) => {
        const payload = { ...event, time: Date.now() };
        window.__ooSmokeEvents = window.__ooSmokeEvents || [];
        window.__ooSmokeEvents.push(payload);
        try { window.__ooSmokeRecord(JSON.stringify(payload)); } catch (_) {}
      };
      window.__ooSmokeEvents = [];
      window.__ooSmokeState = { created: false };
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
      const timer = setInterval(() => {
        install();
        installFrameGateway();
        installFrameSdk();
        if (window.DocsAPI && window.DocsAPI.DocEditor && window.DocsAPI.DocEditor.__ooSmokeWrapped) {
          clearInterval(timer);
        }
      }, 25);
      install();
      installFrameGateway();
      installFrameSdk();
    })();
  `;
}

async function evaluate(page, expression, awaitPromise = true) {
  const result = await page.send('Runtime.evaluate', {
    expression,
    awaitPromise,
    returnByValue: true,
    userGesture: true,
  });
  if (result.exceptionDetails) {
    const exception = summarizeException(result.exceptionDetails);
    throw new Error(exception.message || exception.text || 'Runtime.evaluate failed');
  }
  return result.result?.value;
}

async function runInputSaveAction(page, scenario, timeoutMs, state) {
  await evaluate(
    page,
    `(() => {
      const frame = document.querySelector('iframe[name="frameEditor"]').contentWindow;
      const api = (frame.Asc && frame.Asc.editor) || frame.editor;
      if (!api || typeof api.asc_AddText !== 'function') throw new Error('asc_AddText is unavailable');
      api.asc_AddText(${JSON.stringify('Hello 中文 9.3')});
    })()`,
    true,
  );

  const modified = await waitFor(
    async () =>
      evaluate(
        page,
        `(() => {
          const frame = document.querySelector('iframe[name="frameEditor"]').contentWindow;
          const api = (frame.Asc && frame.Asc.editor) || frame.editor;
          return Boolean(api && api.asc_isDocumentCanSave && api.asc_isDocumentCanSave()
            && api.isDocumentModified && api.isDocumentModified());
        })()`,
        true,
      ).catch(() => false),
    { timeoutMs: Math.min(timeoutMs, 20_000), message: `${scenario.name}: document did not become saveable after input` },
  );

  await evaluate(
    page,
    `(() => {
      const frame = document.querySelector('iframe[name="frameEditor"]').contentWindow;
      const api = (frame.Asc && frame.Asc.editor) || frame.editor;
      if (!api || typeof api.asc_Save !== 'function') throw new Error('asc_Save is unavailable');
      api.asc_Save(false);
    })()`,
    true,
  );

  const events = await waitFor(
    () => (isDocxSaveComplete(state.events) ? state.events : false),
    { timeoutMs: Math.min(timeoutMs, 60_000), message: `${scenario.name}: save/download completion was not observed` },
  );

  return { modified: Boolean(modified), saveCompleted: true, selectedEvents: summarizeSelectedEvents(events) };
}

async function runPdfBlockAction(page, scenario, timeoutMs, state) {
  await evaluate(
    page,
    `(() => {
      const frame = document.querySelector('iframe[name="frameEditor"]').contentWindow;
      const api = (frame.Asc && frame.Asc.editor) || frame.editor;
      if (!api || typeof api.asc_AddText !== 'function') throw new Error('asc_AddText is unavailable');
      api.asc_AddText(${JSON.stringify('PDF 阻断 9.3')});
    })()`,
    true,
  );

  await waitFor(
    async () =>
      evaluate(
        page,
        `(() => {
          const frame = document.querySelector('iframe[name="frameEditor"]').contentWindow;
          const api = (frame.Asc && frame.Asc.editor) || frame.editor;
          return Boolean(api && api.asc_isDocumentCanSave && api.asc_isDocumentCanSave());
        })()`,
        true,
      ).catch(() => false),
    { timeoutMs: Math.min(timeoutMs, 20_000), message: `${scenario.name}: document did not become saveable before PDF export` },
  );

  await evaluate(
    page,
    `(() => {
      const frame = document.querySelector('iframe[name="frameEditor"]').contentWindow;
      const api = (frame.Asc && frame.Asc.editor) || frame.editor;
      const Asc = frame.Asc;
      if (!api || typeof api.asc_DownloadAs !== 'function') throw new Error('asc_DownloadAs is unavailable');
      const options = new Asc.asc_CDownloadOptions();
      options.asc_setFileType(Asc.c_oAscFileType.PDF);
      options.asc_setIsDownloadEvent(true);
      api.asc_DownloadAs(options);
    })()`,
    true,
  );

  const events = await waitFor(
    () => (isPdfBlockComplete(state.events) ? state.events : false),
    { timeoutMs: Math.min(timeoutMs, 60_000), message: `${scenario.name}: PDF block was not observed` },
  );

  return { pdfBlocked: true, selectedEvents: summarizeSelectedEvents(events) };
}

function isDocxSaveComplete(events) {
  return (
    events.some((event) => event.type === 'frame:event' && event.event === 'onlyofficeLocalDownloadBridge') &&
    events.some((event) => event.type === 'download:anchor' && String(event.download || '').endsWith('.docx')) &&
    events.some((event) => event.type === 'frame:sdkCallback' && event.name === 'asc_onEndAction')
  );
}

function isPdfBlockComplete(events) {
  return (
    events.some((event) => event.type === 'alert' && /server-side conversion|PDF export requires/i.test(event.message || '')) &&
    events.some((event) => event.type === 'frame:event' && event.event === 'onlyofficeLocalDownloadBridge') &&
    events.some((event) => event.type === 'frame:sdkCallback' && event.name === 'asc_onEndAction') &&
    !events.some((event) => event.type === 'download:anchor' && String(event.download || '').endsWith('.pdf'))
  );
}

async function runScenario(page, scenario, sampleBaseUrl, appUrl, timeoutMs, state) {
  const started = Date.now();
  await page.send('Page.navigate', { url: appUrl });
  await waitFor(
    async () => evaluate(page, 'Boolean(window.onCreateNew && window.DocsAPI && window.DocsAPI.DocEditor)', true),
    { timeoutMs, message: `${scenario.name}: app did not initialize` },
  );

  const version = await evaluate(page, 'window.DocsAPI.DocEditor.version()', true);
  if (!String(version).startsWith('9.3.')) {
    throw new Error(`${scenario.name}: expected DocsAPI 9.3.x, got ${version}`);
  }

  if (scenario.kind === 'new') {
    await evaluate(page, `window.onCreateNew(${JSON.stringify(scenario.ext)})`, true);
  } else {
    const sampleUrl = `${sampleBaseUrl}/${encodeURIComponent(scenario.name)}${scenario.ext}`;
    await evaluate(
      page,
      `import('/lib/document.ts').then((m) => m.openDocumentFromUrl(${JSON.stringify(sampleUrl)}, ${JSON.stringify(scenario.fileName)}))`,
      true,
    );
  }

  const frameCount = await waitFor(
    async () => evaluate(page, 'document.querySelectorAll("iframe[name=\\"frameEditor\\"]").length', true),
    { timeoutMs, message: `${scenario.name}: editor iframe was not created` },
  );
  const iframeBox = await evaluate(
    page,
    `(() => {
      const iframe = document.querySelector('iframe[name="frameEditor"]');
      const rect = iframe && iframe.getBoundingClientRect();
      return rect ? { width: rect.width, height: rect.height } : null;
    })()`,
    true,
  );

  const ready = await waitFor(
    async () =>
      evaluate(
        page,
        `Boolean((window.__ooSmokeState && window.__ooSmokeState.created) || window.editor)`,
        true,
      ),
    { timeoutMs, message: `${scenario.name}: DocEditor was not constructed` },
  );

      const documentReady = await waitFor(
    async () =>
      evaluate(
        page,
        `Boolean(window.__ooSmokeEvents && window.__ooSmokeEvents.some((event) =>
          event.type === 'event:onDocumentReady'
          || event.type === 'frame:gatewayDocumentReady'
          || (event.type === 'frame:sdkCallback' && event.name === 'asc_onDocumentContentReady')
        ))`,
        true,
      ).catch(() => false),
    { timeoutMs: Math.min(timeoutMs, 45_000), message: `${scenario.name}: document ready was not observed` },
  ).catch(() => false);

  if (scenario.expectDocumentReady && !documentReady) {
    throw new Error(`${scenario.name}: document ready was not observed`);
  }

  let actionResult = null;
  if (scenario.action === 'input-save') {
    actionResult = await runInputSaveAction(page, scenario, timeoutMs, state);
  } else if (scenario.action === 'pdf-block') {
    actionResult = await runPdfBlockAction(page, scenario, timeoutMs, state);
  }

  const commands = await evaluate(
    page,
    `(window.__ooSmokeEvents || []).filter((event) => event.type === 'sendCommand').map((event) => event.command)`,
    true,
  );
  return {
    name: scenario.name,
    status: 'PASS',
    version,
    ready: Boolean(ready),
    documentReady,
    frameCount,
    iframeBox,
    commands,
    actionResult,
    elapsedMs: Date.now() - started,
  };
}

async function runScenarioWithPage(browserUrl, scenario, sampleBaseUrl, appUrl, timeoutMs) {
  const state = createSmokeState();
  const page = await createPage(browserUrl);
  await setupPage(page, state);

  try {
    const result = await runScenario(page, scenario, sampleBaseUrl, appUrl, timeoutMs, state);
    return { result, analysis: analyzeState(state) };
  } catch (error) {
    return {
      result: {
        name: scenario.name,
        status: 'FAIL',
        error: error.message,
        recentEvents: state.events.slice(-40),
        recentConsole: state.console.slice(-12),
        recentLogs: state.logs.slice(-12),
      },
      analysis: analyzeState(state),
    };
  } finally {
    page.browser.close();
  }
}

function analyzeState(state) {
  const failedResponses = state.responses.filter((response) => response.status >= 400);
  const badFontRequests = state.requests.filter((url) => url.includes('/fonts//fonts'));
  const documentServerDownloadRequests = state.requests.filter((url) => url.includes('/downloadas/'));
  const missingRequests = REQUIRED_REQUESTS.filter((path) => !state.requests.some((url) => url.includes(path)));
  const serviceWorkerObserved =
    state.requests.some((url) => url.includes('/document_editor_service_worker.js')) ||
    state.console.some((entry) => entry.text.includes('SW registered'));

  return {
    requestSummary: summarizeRequests(state.requests),
    failedResponses,
    badFontRequests,
    documentServerDownloadRequests,
    missingRequests,
    serviceWorkerObserved,
    exceptions: state.exceptions,
    selectedEvents: summarizeSelectedEvents(state.events),
  };
}

function summarizeSelectedEvents(events) {
  return events
    .filter((event) =>
      event.type === 'download:anchor' ||
      event.type === 'alert' ||
      event.type === 'event:onSaveDocument' ||
      event.event === 'onlyofficeLocalDownloadBridge' ||
      event.event === 'onlyofficeLocalBinaryBridge' ||
      event.event === 'onlyofficeLocalBinaryOpen' ||
      (event.type === 'frame:sdkCallback' && ['asc_onStartAction', 'asc_onEndAction'].includes(event.name)),
    )
    .map((event) => ({
      type: event.type,
      event: event.event,
      name: event.name,
      args: event.args,
      download: event.download,
      hasBinaryData: event.hasBinaryData,
      outputformat: event.outputformat,
      status: event.data && event.data.status,
      byteLength: event.data && event.data.byteLength,
      message: event.message,
    }));
}

function collectFailures(entries) {
  return entries.flatMap(({ result, analysis }) => [
    ...(result.status === 'FAIL' ? [`${result.name}: ${result.error}`] : []),
    ...analysis.failedResponses.map((response) => `${result.name}: HTTP ${response.status}: ${response.url}`),
    ...analysis.badFontRequests.map((url) => `${result.name}: bad font URL: ${url}`),
    ...analysis.documentServerDownloadRequests.map(
      (url) => `${result.name}: unexpected DocumentServer download request: ${url}`,
    ),
    ...analysis.missingRequests.map((path) => `${result.name}: missing required browser request: ${path}`),
    ...(analysis.serviceWorkerObserved ? [] : [`${result.name}: service worker was not observed`]),
    ...analysis.exceptions.map((exception) => `${result.name}: browser exception: ${exception.message}`),
  ]);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sample = await startSampleServer(args.scenarios);
  const app = args.appUrl ? null : startViteAppServer();
  const appUrl = args.appUrl || (await app.ready);
  const chrome = startChrome(args.chrome);

  try {
    const browserUrl = await getDebuggerUrl(chrome);
    const entries = [];

    for (const scenario of args.scenarios) {
      entries.push(await runScenarioWithPage(browserUrl, scenario, sample.baseUrl, appUrl, args.timeoutMs));
    }

    const failures = collectFailures(entries);

    console.log(
      JSON.stringify(
        {
          results: entries.map((entry) => entry.result),
          appUrl,
          sampleBaseUrl: sample.baseUrl,
          scenarioDiagnostics: entries.map(({ result, analysis }) => ({ name: result.name, ...analysis })),
          failures,
        },
        null,
        2,
      ),
    );
    if (failures.length > 0) process.exitCode = 1;
  } finally {
    await closeServer(sample.server);
    await terminateChild(app?.child);
    await terminateChild(chrome.child);
    rmSync(chrome.userDataDir, { recursive: true, force: true });
  }
}

function summarizeRequests(requests) {
  const interesting = [
    'api.js',
    'x2t.js',
    'x2t.wasm',
    'AllFonts.js',
    'sdk-all',
    'app.js',
    'index.html',
    'document_editor_service_worker.js',
  ];
  return interesting.reduce((summary, needle) => {
    summary[needle] = requests.filter((url) => url.includes(needle)).length;
    return summary;
  }, {});
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
