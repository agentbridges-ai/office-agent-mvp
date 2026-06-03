import type { SupportLevel, ToolResult } from './types';

type RequiredSource = 'plugin' | 'frame';

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
  target?: RequiredSource;
}

interface BridgeRequestMessage {
  source: string;
  type: 'request';
  id: string;
  action: string;
  payload: Record<string, unknown>;
  target?: RequiredSource;
}

const HOST_SOURCE = 'office-agent-host';
const BRIDGE_SOURCE = 'office-agent-bridge';
const FRAME_BRIDGE_SOURCE = 'office-agent-frame-bridge';
const BRIDGE_CHANNEL = 'office-agent-excel-bridge';
const DOCUMENT_READY_EVENT = 'office-agent:document-ready';
const hasWindow = (): boolean => typeof window !== 'undefined';

export class OfficePluginBridge extends EventTarget {
  private pluginWindow: Window | null = null;
  private frameWindow: Window | null = null;
  private pluginReady = false;
  private frameReady = false;
  private ready = false;
  private channelReady = false;
  private channel: BroadcastChannel | null = null;
  private pending = new Map<string, PendingRequest>();

  constructor() {
    super();
    if (hasWindow()) {
      window.addEventListener('message', this.handleMessage);
      window.addEventListener(DOCUMENT_READY_EVENT, this.handleDocumentReady);
      if ('BroadcastChannel' in window) {
        this.channel = new BroadcastChannel(BRIDGE_CHANNEL);
        this.channel.addEventListener('message', this.handleMessage);
        this.pingBridge();
      }
    }
  }

  isReady(): boolean {
    return this.ready || this.channelReady;
  }

  async waitUntilReady(timeoutMs = 15000, requiredSource?: RequiredSource): Promise<boolean> {
    if (this.isTransportReady(requiredSource)) return true;
    if (!hasWindow()) return false;
    return new Promise((resolve) => {
      const timeout = window.setTimeout(() => {
        cleanup();
        resolve(this.isTransportReady(requiredSource));
      }, timeoutMs);
      const onReady = () => {
        if (!this.isTransportReady(requiredSource)) return;
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
    const requiredSource = getRequiredSource(action);
    const ready = await this.waitUntilReady(5000, requiredSource);
    const targetWindow = this.getTargetWindow(requiredSource);
    const useChannelTransport = this.shouldUseChannelTransport(requiredSource);
    if (!ready || (!useChannelTransport && !targetWindow)) {
      return {
        ok: false,
        supportLevel: 'unsupported',
        error: this.getNotReadyMessage(requiredSource),
      };
    }

    const id = crypto.randomUUID();
    const message: BridgeRequestMessage = {
      source: HOST_SOURCE,
      type: 'request',
      id,
      action,
      payload,
      target: requiredSource,
    };

    return new Promise<ToolResult<T>>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        this.pending.delete(id);
        resolve({
          ok: false,
          supportLevel: 'partial',
          error: `Office bridge request timed out: ${action}`,
        });
      }, timeoutMs);

      this.pending.set(id, { resolve: resolve as (value: ToolResult) => void, reject, timeout });
      this.sendRequestMessage(requiredSource, targetWindow, message);
    });
  }

  private handleMessage = (event: MessageEvent<BridgeMessage>): void => {
    const data = event.data;
    if (!data || (data.source !== BRIDGE_SOURCE && data.source !== FRAME_BRIDGE_SOURCE)) return;

    if (data.type === 'ready') {
      const wasReady = this.isReady();
      if (event.source) {
        if (data.source === BRIDGE_SOURCE) {
          this.pluginWindow = event.source as Window;
          this.pluginReady = true;
        } else {
          this.frameWindow = event.source as Window;
          this.frameReady = true;
        }
      } else {
        this.channelReady = true;
        if (data.source === BRIDGE_SOURCE) this.pluginReady = true;
        if (data.source === FRAME_BRIDGE_SOURCE) this.frameReady = true;
      }
      this.ready = true;
      if (wasReady) {
        this.dispatchEvent(new CustomEvent('ready'));
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

  private handleDocumentReady = (): void => {
    this.resetTransportState();
    this.pingBridge();
  };

  private resetTransportState(): void {
    this.pluginWindow = null;
    this.frameWindow = null;
    this.pluginReady = false;
    this.frameReady = false;
    this.ready = false;
    this.channelReady = false;
    this.resolvePendingAfterDocumentSwitch();
  }

  private resolvePendingAfterDocumentSwitch(): void {
    for (const pending of this.pending.values()) {
      window.clearTimeout(pending.timeout);
      pending.resolve({
        ok: false,
        supportLevel: 'partial',
        error: 'Office bridge reset while opening another document.',
      });
    }
    this.pending.clear();
  }

  private pingBridge(): void {
    this.channel?.postMessage({
      source: HOST_SOURCE,
      type: 'ping',
    });
  }

  private sendRequestMessage(
    requiredSource: RequiredSource | undefined,
    targetWindow: Window | null,
    message: BridgeRequestMessage,
  ): void {
    if (this.shouldUseChannelTransport(requiredSource) && this.channel) {
      this.channel.postMessage(message);
      return;
    }
    targetWindow?.postMessage(message, '*');
  }

  private shouldUseChannelTransport(requiredSource?: RequiredSource): boolean {
    return requiredSource === 'plugin' && Boolean(this.channel);
  }

  private isTransportReady(requiredSource?: RequiredSource): boolean {
    if (requiredSource === 'plugin') return this.pluginReady && Boolean(this.pluginWindow || this.channel);
    if (requiredSource === 'frame') return this.frameReady || this.channelReady;
    return this.isReady();
  }

  private getTargetWindow(requiredSource?: RequiredSource): Window | null {
    if (requiredSource === 'plugin') return this.pluginWindow;
    if (requiredSource === 'frame') return this.frameWindow;
    return this.pluginWindow || this.frameWindow;
  }

  private getNotReadyMessage(requiredSource?: RequiredSource): string {
    if (requiredSource === 'plugin') {
      return 'Trusted Office plugin bridge is not ready. Open or create a document first.';
    }
    if (requiredSource === 'frame') {
      return 'Office frame bridge is not ready. Open or create a document first.';
    }
    return 'Office bridge is not ready. Open or create a document first.';
  }
}

function getRequiredSource(action: string): RequiredSource | undefined {
  if (action.startsWith('word') || action.startsWith('ppt')) return 'plugin';
  return undefined;
}

export class ExcelPluginBridge extends OfficePluginBridge {}

export const officeBridge = new OfficePluginBridge();
export const excelBridge = officeBridge;
