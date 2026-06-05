const ONLYOFFICE_HOST_STYLE_ID = 'onlyoffice-9-3-host-sizing';
const SAME_ORIGIN_TARGET = window.location.origin;

export function ensureOnlyOfficeHostSizing(): void {
  if (document.getElementById(ONLYOFFICE_HOST_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = ONLYOFFICE_HOST_STYLE_ID;
  style.textContent = `
    #app,
    #iframe,
    #iframe iframe {
      width: 100%;
      height: 100%;
      min-height: 100vh;
    }

    #iframe {
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);
}

export function createLocalOnlyOfficeDocument(fileName: string, fileType: string) {
  return {
    title: fileName,
    url: fileName,
    fileType,
    permissions: {
      edit: true,
      chat: false,
      protect: false,
    },
    options: {
      onlyofficeLocalBinary: true,
    },
  };
}

export function createSingleUserEditorConfig(lang: string) {
  return {
    lang,
    canCoAuthoring: false,
    coEditing: {
      mode: 'strict',
      change: false,
    },
    customization: {
      help: false,
      about: false,
      hideRightMenu: true,
      plugins: false,
      features: {
        spellcheck: {
          change: false,
        },
      },
      anonymous: {
        request: false,
        label: 'Guest',
      },
    },
  };
}

export function openLocalDocument(editor: DocEditor | undefined, buffer: ArrayBuffer): void {
  const frame = document.querySelector<HTMLIFrameElement>('iframe[name="frameEditor"]')?.contentWindow;
  if (!frame) {
    throw new Error('ONLYOFFICE editor iframe is unavailable for local binary open');
  }
  window.postMessage(
    {
      event: 'onlyofficeLocalBinaryOpen',
      data: { byteLength: buffer.byteLength },
    },
    SAME_ORIGIN_TARGET,
  );
  frame.postMessage({ command: 'openDocumentFromBinary', data: buffer }, SAME_ORIGIN_TARGET, [buffer]);
}
