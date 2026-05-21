import { REQUIRED_REQUESTS } from './config.mjs';

export function analyzeState(state) {
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

export function summarizeSelectedEvents(events) {
  return events
    .filter((event) =>
      event.type === 'download:anchor' ||
      event.type === 'alert' ||
      event.type === 'event:onSaveDocument' ||
      event.type === 'frame:downloadCallback' ||
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
      status: event.status || (event.data && event.data.status),
      byteLength: event.data && event.data.byteLength,
      message: event.message,
      error: event.error,
    }));
}

export function collectFailures(entries) {
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
