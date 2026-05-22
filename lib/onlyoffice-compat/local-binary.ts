const LOCAL_BINARY_BRIDGE_FLAG = '__onlyofficeLocalBinaryBridgeInstalled';
const LOCAL_BINARY_READY_HOOK_CANDIDATES = [
  'asyncServerIdEndLoaded',
  'n1f',
  'Mmg',
  'NOf',
] as const;
const SAME_ORIGIN_TARGET = window.location.origin;

type OnlyOfficeFrameWindow = Window & {
  Asc?: any;
  DE?: any;
  SSE?: any;
  PE?: any;
  frameEditorId?: string;
};

export function installLocalBinaryBridge(): void {
  const frame = getEditorFrameWindow();
  if (!frame) {
    throw new Error('ONLYOFFICE editor iframe is unavailable for local binary bridge');
  }

  const state = frame as unknown as Record<string, unknown>;
  if (state[LOCAL_BINARY_BRIDGE_FLAG]) return;
  state[LOCAL_BINARY_BRIDGE_FLAG] = true;

  frame.addEventListener(
    'message',
    (event) => {
      const message = parseFrameMessage(event.data);
      if (message?.command !== 'openDocumentFromBinary') return;
      frame.setTimeout(() => completeLocalBinaryOpen(frame), 0);
    },
    true,
  );
}

function getEditorFrameWindow(): OnlyOfficeFrameWindow | null {
  const iframe = document.querySelector<HTMLIFrameElement>('iframe[name="frameEditor"]');
  return (iframe?.contentWindow as OnlyOfficeFrameWindow | null) || null;
}

function parseFrameMessage(data: unknown): { command?: string } | null {
  if (data && typeof data === 'object') return data as { command?: string };
  if (typeof data !== 'string') return null;

  try {
    return JSON.parse(data) as { command?: string };
  } catch {
    return null;
  }
}

function completeLocalBinaryOpen(frame: OnlyOfficeFrameWindow): void {
  const controller = getMainController(frame);
  if (!controller?.api || typeof controller.onEditorPermissions !== 'function') {
    reportLocalBinaryBridge(frame, 'controller-unavailable');
    return;
  }

  const api = controller.api;
  const originalLoadDocument = api.asc_LoadDocument;
  api.asc_LoadDocument = function localBinaryLoadDocument() {
    const ready = getLocalBinaryReadyHook(this);
    ready.call(this, Date.now());
  };

  try {
    controller.onEditorPermissions(createLocalBinaryPermissions(frame));
    reportLocalBinaryBridge(frame, 'permissions-applied');
  } finally {
    api.asc_LoadDocument = originalLoadDocument;
  }
}

function getMainController(frame: OnlyOfficeFrameWindow): any | null {
  const app = frame.DE || frame.SSE || frame.PE;
  if (app && typeof app.getController === 'function') {
    return app.getController('Main') || null;
  }
  return null;
}

function getLocalBinaryReadyHook(api: any): Function {
  for (const hookName of LOCAL_BINARY_READY_HOOK_CANDIDATES) {
    const ready = api[hookName];
    if (typeof ready === 'function') return ready;
  }
  throw new Error(`ONLYOFFICE local binary ready hook not found. Checked: ${LOCAL_BINARY_READY_HOOK_CANDIDATES.join(', ')}`);
}

function createLocalBinaryPermissions(frame: OnlyOfficeFrameWindow) {
  const Asc = frame.Asc;
  if (!Asc) throw new Error('ONLYOFFICE Asc namespace is unavailable');

  return {
    asc_getLicenseType: () => Asc.c_oLicenseResult.Success,
    asc_getCanBranding: () => true,
    asc_getCustomization: () => true,
    asc_getIsAnalyticsEnable: () => false,
    asc_getIsLight: () => false,
    asc_getRights: () => Asc.c_oRights.Edit,
    asc_getBuildVersion: () => '9.3.1',
    asc_getBuildNumber: () => '10',
    asc_getLiveViewerSupport: () => false,
    asc_getLicenseMode: () => Asc.c_oLicenseMode.None,
    asc_getIsBeta: () => false,
  };
}

function reportLocalBinaryBridge(frame: OnlyOfficeFrameWindow, status: string): void {
  frame.parent?.postMessage(
    {
      event: 'onlyofficeLocalBinaryBridge',
      data: { status },
    },
    SAME_ORIGIN_TARGET,
  );
}
