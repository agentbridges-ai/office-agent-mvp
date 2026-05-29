// Default full matrix: new-docx,new-xlsx,new-pptx,open-docx,open-xlsx,open-pptx,open-csv,
//   input-save-docx,input-save-xlsx,input-save-pptx,pdf-block-docx
import { rmSync } from 'node:fs';
import { parseArgs } from './onlyoffice-smoke/config.mjs';
import { startSampleServer } from './onlyoffice-smoke/samples.mjs';
import { startChrome, startViteAppServer } from './onlyoffice-smoke/processes.mjs';
import { closeServer, terminateChild } from './onlyoffice-smoke/utils.mjs';
import { getDebuggerUrl } from './onlyoffice-smoke/cdp.mjs';
import { runScenarioWithPage } from './onlyoffice-smoke/scenario.mjs';
import { collectFailures } from './onlyoffice-smoke/diagnostics.mjs';

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
    console.log(JSON.stringify(buildReport(entries, appUrl, sample.baseUrl, failures), null, 2));
    if (failures.length > 0) process.exitCode = 1;
  } finally {
    await closeServer(sample.server);
    await terminateChild(app?.child);
    await terminateChild(chrome.child);
    rmSync(chrome.userDataDir, { recursive: true, force: true });
  }
}

function buildReport(entries, appUrl, sampleBaseUrl, failures) {
  return {
    results: entries.map((entry) => entry.result),
    appUrl,
    sampleBaseUrl,
    scenarioDiagnostics: entries.map(({ result, analysis }) => ({ name: result.name, ...analysis })),
    failures,
  };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
