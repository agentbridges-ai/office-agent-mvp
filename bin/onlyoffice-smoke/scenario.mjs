import { analyzeState } from './diagnostics.mjs';
import { createPage, setupPage } from './cdp.mjs';
import { evaluate, runInputSaveAction, runPdfBlockAction } from './actions.mjs';
import { createSmokeState } from './hooks.mjs';
import { waitFor } from './utils.mjs';

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

export async function runScenarioWithPage(browserUrl, scenario, sampleBaseUrl, appUrl, timeoutMs) {
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
