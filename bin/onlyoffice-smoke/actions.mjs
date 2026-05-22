import { summarizeException } from './cdp.mjs';
import { waitFor } from './utils.mjs';
import { summarizeSelectedEvents } from './diagnostics.mjs';

export async function evaluate(page, expression, awaitPromise = true) {
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

export async function runInputSaveAction(page, scenario, timeoutMs, state) {
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

export async function runPdfBlockAction(page, scenario, timeoutMs, state) {
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
    events.some((event) => event.type === 'frame:downloadCallback' && event.status === 'ok') &&
    events.some((event) => event.type === 'frame:sdkCallback' && event.name === 'asc_onEndAction')
  );
}

function isPdfBlockComplete(events) {
  return (
    events.some((event) => event.type === 'alert' && /server-side conversion|PDF export requires/i.test(event.message || '')) &&
    events.some((event) => event.type === 'frame:event' && event.event === 'onlyofficeLocalDownloadBridge') &&
    events.some((event) => event.type === 'frame:downloadCallback' && event.status === 'error') &&
    events.some((event) => event.type === 'frame:sdkCallback' && event.name === 'asc_onEndAction') &&
    !events.some((event) => event.type === 'download:anchor' && String(event.download || '').endsWith('.pdf'))
  );
}
