import type { SupportLevel, ToolResult } from './types';

interface PendingRequest {
  resolve: (value: ToolResult) => void;
  reject: (reason?: unknown) => void;
  timeout: number;
}

interface BridgeMessage {
  source?: string;
  type?: string;
  id?: string;
  ok?: boolean;
  result?: unknown;
  error?: string;
  supportLevel?: SupportLevel;
}

const HOST_SOURCE = 'office-agent-host';
const BRIDGE_SOURCE = 'office-agent-bridge';
const FRAME_BRIDGE_SOURCE = 'office-agent-frame-bridge';
const BRIDGE_CHANNEL = 'office-agent-excel-bridge';
const hasWindow = (): boolean => typeof window !== 'undefined';

export class ExcelPluginBridge extends EventTarget {
  private pluginWindow: Window | null = null;
  private bridgeSource: typeof BRIDGE_SOURCE | typeof FRAME_BRIDGE_SOURCE | null = null;
  private ready = false;
  private channelReady = false;
  private channel: BroadcastChannel | null = null;
  private pending = new Map<string, PendingRequest>();

  constructor() {
    super();
    if (hasWindow()) {
      window.addEventListener('message', this.handleMessage);
      if ('BroadcastChannel' in window) {
        this.channel = new BroadcastChannel(BRIDGE_CHANNEL);
        this.channel.addEventListener('message', this.handleMessage);
        this.channel.postMessage({
          source: HOST_SOURCE,
          type: 'ping',
        });
      }
    }
  }

  isReady(): boolean {
    return this.ready || this.channelReady;
  }

  async waitUntilReady(timeoutMs = 15000): Promise<boolean> {
    if (this.isReady()) return true;
    if (!hasWindow()) return false;
    return new Promise((resolve) => {
      const timeout = window.setTimeout(() => {
        cleanup();
        resolve(false);
      }, timeoutMs);
      const onReady = () => {
        cleanup();
        resolve(true);
      };
      const cleanup = () => {
        window.clearTimeout(timeout);
        this.removeEventListener('ready', onReady);
      };
      this.addEventListener('ready', onReady);
    });
  }

  async execute<T = unknown>(
    action: string,
    payload: Record<string, unknown> = {},
    timeoutMs = 30000,
  ): Promise<ToolResult<T>> {
    const ready = await this.waitUntilReady(3000);
    if (!ready || (!this.pluginWindow && !this.channelReady)) {
      return {
        ok: false,
        supportLevel: 'unsupported',
        error: 'Excel bridge is not ready. Open or create an Excel workbook first.',
      };
    }

    const id = crypto.randomUUID();
    const message = {
      source: HOST_SOURCE,
      type: 'request',
      id,
      action,
      payload,
    };

    return new Promise<ToolResult<T>>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        this.pending.delete(id);
        resolve({
          ok: false,
          supportLevel: 'partial',
          error: `Excel bridge request timed out: ${action}`,
        });
      }, timeoutMs);

      this.pending.set(id, { resolve: resolve as (value: ToolResult) => void, reject, timeout });
      if (this.pluginWindow) {
        this.pluginWindow.postMessage(message, '*');
      } else {
        this.channel?.postMessage(message);
      }
    });
  }

  private handleMessage = (event: MessageEvent<BridgeMessage>): void => {
    const data = event.data;
    if (!data || (data.source !== BRIDGE_SOURCE && data.source !== FRAME_BRIDGE_SOURCE)) return;

    if (data.type === 'ready') {
      const wasReady = this.isReady();
      if (event.source) {
        if (this.bridgeSource === BRIDGE_SOURCE && data.source === FRAME_BRIDGE_SOURCE) {
          return;
        }
        this.pluginWindow = event.source as Window;
        this.bridgeSource = data.source;
      } else {
        this.channelReady = true;
        this.bridgeSource = data.source;
      }
      this.ready = true;
      if (wasReady) {
        return;
      }
      this.dispatchEvent(new CustomEvent('ready'));
      window.dispatchEvent(new CustomEvent('office-agent:bridge-ready'));
      return;
    }

    if (data.type === 'selection') {
      window.dispatchEvent(new CustomEvent('office-agent:selection', { detail: data.result }));
      return;
    }

    if (data.type !== 'result' || !data.id) return;
    const pending = this.pending.get(data.id);
    if (!pending) return;
    window.clearTimeout(pending.timeout);
    this.pending.delete(data.id);
    pending.resolve({
      ok: Boolean(data.ok),
      supportLevel: data.supportLevel || (data.ok ? 'supported' : 'partial'),
      result: data.result,
      error: data.error,
    });
  };
}

export const excelBridge = new ExcelPluginBridge();
