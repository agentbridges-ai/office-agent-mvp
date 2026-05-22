import { waitFor } from './utils.mjs';
import { hookSource } from './hooks.mjs';

export function summarizeStackTrace(stackTrace) {
  if (!stackTrace?.callFrames) return [];
  return stackTrace.callFrames.slice(0, 5).map((frame) => ({
    functionName: frame.functionName,
    url: frame.url,
    lineNumber: frame.lineNumber,
    columnNumber: frame.columnNumber,
  }));
}

export function summarizeException(details) {
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

export async function getDebuggerUrl(chrome) {
  const pattern = /DevTools listening on (ws:\/\/[^\s]+)/;
  return waitFor(
    () => {
      const match = chrome.stderr().match(pattern);
      return match?.[1];
    },
    { timeoutMs: 15_000, message: 'Timed out waiting for Chrome DevTools URL' },
  );
}

export class CdpClient {
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

export async function createPage(browserUrl) {
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

export async function setupPage(page, state) {
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
