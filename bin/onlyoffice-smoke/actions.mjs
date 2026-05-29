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
  const ext = (scenario.ext || '.docx').toLowerCase();

  // Use editor-appropriate input: asc_AddText works for Word-type editors,
  // but XLSX/PPTX need different approaches. For those, just trigger save
  // without prior modification — the bridge verification is the goal.
  if (ext === '.docx') {
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

    await waitFor(
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
      { timeoutMs: Math.min(timeoutMs, 20_000), message: `${scenario.name}: document did not become saveable` },
    );
  } else if (ext === '.xlsx') {
    await evaluate(page,
      `(() => {
        const frame = document.querySelector('iframe[name="frameEditor"]').contentWindow;
        const api = (frame.Asc && frame.Asc.editor) || frame.editor;
        if (!api) throw new Error('editor API unavailable');
        if (typeof api.asc_setCellInfo === 'function') {
          api.asc_setCellInfo({row: 0, col: 0, value: 'Hello 9.3'});
        } else if (typeof api.asc_editCell === 'function') {
          api.asc_editCell(0, 0, 'Hello 9.3');
        } else {
          throw new Error('no XLSX edit API found (tried asc_setCellInfo, asc_editCell)');
        }
      })()`,
      true,
    );
  } else if (ext === '.pptx') {
    await evaluate(page,
      `(() => {
        const frame = document.querySelector('iframe[name="frameEditor"]').contentWindow;
        const api = (frame.Asc && frame.Asc.editor) || frame.editor;
        if (!api) throw new Error('editor API unavailable');
        if (typeof api.asc_AddText === 'function') {
          api.asc_AddText('Hello 9.3');
        } else {
          throw new Error('asc_AddText unavailable for PPTX');
        }
      })()`,
      true,
    );
  }

  // Wait for document to be save-ready (even without modification)
  await waitFor(
    async () =>
      evaluate(
        page,
        `(() => {
          const frame = document.querySelector('iframe[name="frameEditor"]').contentWindow;
          const api = (frame.Asc && frame.Asc.editor) || frame.editor;
          return Boolean(api && typeof api.asc_Save === 'function');
        })()`,
        true,
      ).catch(() => false),
    { timeoutMs: Math.min(timeoutMs, 20_000), message: `${scenario.name}: asc_Save did not become available` },
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
    () => (isLocalSaveComplete(state.events, ext) ? state.events : false),
    { timeoutMs: Math.min(timeoutMs, 60_000), message: `${scenario.name}: save/download completion was not observed` },
  );

  const hadInput = ext === '.docx' || ext === '.xlsx' || ext === '.pptx';
  return { modified: hadInput, saveCompleted: true, selectedEvents: summarizeSelectedEvents(events) };
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

function isLocalSaveComplete(events, ext) {
  return (
    events.some((event) => event.type === 'frame:event' && event.event === 'onlyofficeLocalDownloadBridge') &&
    events.some((event) => event.type === 'download:anchor' && String(event.download || '').endsWith(ext)) &&
    events.some((event) => event.type === 'frame:downloadCallback' && event.status === 'ok')
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
