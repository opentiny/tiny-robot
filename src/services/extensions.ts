import { notify } from "../ui.js";
import { useSettings } from "./settings.js";
import { ref, watch } from "vue";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
export type Skill = { id: string; name: string; content: string; enabled: boolean };
export type McpServer = { id: string; name: string; url: string; enabled: boolean };
export type McpTool = { name: string; description?: string; inputSchema: Record<string, unknown> };
function read(key: string): unknown[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
export const skills = ref<Skill[]>(
  read("deepseek-vue-chat:skills").filter(
    (s): s is Skill =>
      isRecord(s) &&
      typeof s.id === "string" &&
      typeof s.name === "string" &&
      typeof s.content === "string" &&
      typeof s.enabled === "boolean",
  ),
);
export const servers = ref<McpServer[]>(
  read("deepseek-vue-chat:mcp").filter(
    (s): s is McpServer =>
      isRecord(s) &&
      typeof s.id === "string" &&
      typeof s.name === "string" &&
      typeof s.url === "string" &&
      typeof s.enabled === "boolean",
  ),
);
function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    notify(
      useSettings.getState().locale === "zh-CN"
        ? "扩展设置未能保存到本机，刷新后可能丢失。"
        : "Extension settings could not be saved locally and may be lost on reload.",
    );
  }
}
watch(skills, (v) => persist("deepseek-vue-chat:skills", v), { deep: true });
watch(servers, (v) => persist("deepseek-vue-chat:mcp", v), { deep: true });
export function skillContext() {
  return skills.value
    .filter((s) => s.enabled)
    .map((s) => `\n\n<skill name=${JSON.stringify(s.name)}>\n${s.content}\n</skill>`)
    .join("");
}
/** The SDK owns JSON-RPC, initialization, session headers, SSE and cancellation. */
export class McpConnection {
  private client = new Client({ name: "tinyrobot-deepseek-vue-chat", version: "0.1.0" });
  constructor(readonly server: McpServer) {}
  async connect(signal: AbortSignal) {
    const url = new URL(this.server.url);
    if (
      url.protocol !== "https:" &&
      !(url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
    )
      throw new Error("MCP requires HTTPS (or local HTTP).");
    signal.addEventListener("abort", () => void this.client.close(), { once: true });
    await this.client.connect(new StreamableHTTPClientTransport(url), { signal });
    const tools: McpTool[] = [],
      seen = new Set<string>();
    let cursor: string | undefined;
    do {
      const result = await this.client.listTools({ cursor }, { signal });
      tools.push(...result.tools);
      cursor = result.nextCursor;
      if (cursor && seen.has(cursor)) throw new Error("Repeated MCP pagination cursor");
      if (cursor) seen.add(cursor);
    } while (cursor);
    return tools;
  }
  call(name: string, args: Record<string, unknown>, signal: AbortSignal) {
    return this.client.callTool({ name, arguments: args }, undefined, { signal });
  }
  close() {
    return this.client.close();
  }
}
