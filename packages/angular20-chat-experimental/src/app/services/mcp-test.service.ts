import { signal } from '@angular/core';
import type { McpCallRecord } from '../models/mcp-call-record';

interface McpTestServiceOptions {
  delayMs: number;
  timeoutMs: number;
}

const TOOL_NAMES = ['search_project_code', 'get_weather', 'inspect_image'] as const;
type ToolName = (typeof TOOL_NAMES)[number];

export class McpTestService {
  readonly records = signal<McpCallRecord[]>([]);
  private readonly enabled = new Map<ToolName, boolean>(TOOL_NAMES.map((name) => [name, true]));
  private delayMs: number;
  private readonly timeoutMs: number;
  private sequence = 0;

  constructor(options: Partial<McpTestServiceOptions> = {}) {
    this.delayMs = options.delayMs ?? 120;
    this.timeoutMs = options.timeoutMs ?? 2_000;
  }

  async call(toolName: string, args: Record<string, unknown>): Promise<string> {
    const startedAt = performance.now();
    const record: McpCallRecord = {
      id: `mcp-call-${++this.sequence}`,
      toolName,
      arguments: structuredClone(args),
      status: 'running',
    };
    this.records.update((records) => [...records, record]);

    try {
      const name = this.assertTool(toolName);
      if (!this.enabled.get(name)) throw new Error(`MCP 工具已禁用：${name}`);
      this.validate(name, args);
      await this.withTimeout(new Promise<void>((resolve) => setTimeout(resolve, this.delayMs)));
      const result = this.execute(name, args);
      this.finish(record.id, {
        status: 'success',
        result,
        durationMs: performance.now() - startedAt,
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.finish(record.id, {
        status: 'error',
        error: message,
        durationMs: performance.now() - startedAt,
      });
      throw error;
    }
  }

  setToolEnabled(toolName: ToolName, enabled: boolean): void {
    this.enabled.set(toolName, enabled);
  }

  setDelay(delayMs: number): void {
    this.delayMs = Math.max(0, delayMs);
  }

  clear(): void {
    this.records.set([]);
  }

  private assertTool(toolName: string): ToolName {
    if (!TOOL_NAMES.includes(toolName as ToolName)) throw new Error(`未知 MCP 工具：${toolName}`);
    return toolName as ToolName;
  }

  private validate(toolName: ToolName, args: Record<string, unknown>): void {
    const key =
      toolName === 'get_weather' ? 'city' : toolName === 'inspect_image' ? 'name' : 'query';
    if (typeof args[key] !== 'string' || !args[key].trim()) {
      throw new Error(`${toolName} 需要字符串参数 ${key}`);
    }
    if (Object.values(args).includes('force-error')) throw new Error('模拟 MCP 服务错误');
  }

  private execute(toolName: ToolName, args: Record<string, unknown>): string {
    if (toolName === 'get_weather') return `${String(args['city'])}：晴，26°C（确定性测试数据）`;
    if (toolName === 'inspect_image') return `${String(args['name'])}：1024×768，包含测试界面`;
    return `在项目中找到与“${String(args['query'])}”相关的 3 处代码`;
  }

  private withTimeout(task: Promise<void>): Promise<void> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(
        () => reject(new Error(`MCP 调用超时（${this.timeoutMs}ms）`)),
        this.timeoutMs,
      );
    });
    return Promise.race([task, timeout]).finally(() => {
      if (timer) clearTimeout(timer);
    });
  }

  private finish(id: string, patch: Partial<McpCallRecord>): void {
    this.records.update((records) =>
      records.map((record) => (record.id === id ? { ...record, ...patch } : record)),
    );
  }
}

export const defaultMcpTestService = new McpTestService();
