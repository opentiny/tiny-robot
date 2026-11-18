<script setup lang="ts">
import { ref, onBeforeUnmount, computed } from "vue";
import { TrSkillImportForm } from "@opentiny/tiny-robot";
import Modal from "./Modal.vue";
import { skills, servers, McpConnection, type McpTool } from "../services/extensions.js";
import { createId } from "../utils/id.js";
import { useChatStore } from "../services/chat/store.js";
import { getDraft, setDraftText } from "../services/chat/drafts.js";
import { extensionsOpen, notify, confirmAction } from "../ui.js";
import { useSettings } from "../services/settings.js";
const zh = computed(() => useSettings.state.value.locale === "zh-CN");
const advancedImport = ref(false);
const name = ref(""),
  url = ref(""),
  tools = ref<McpTool[]>([]),
  chosen = ref(""),
  args = ref("{}"),
  result = ref<{ server: string; tool: string; args: unknown; text: string }>(),
  busy = ref(false),
  selected = ref(""),
  error = ref("");
let connection: McpConnection | undefined, controller: AbortController | undefined;
onBeforeUnmount(() => {
  controller?.abort();
  void connection?.close();
});
async function importSkill(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  try {
    const content = await file.text();
    if (!content.trim()) throw new Error("Empty skill");
    skills.value.push({
      id: createId(),
      name: file.name.replace(/\.md$/i, ""),
      content,
      enabled: false,
    });
  } catch (e) {
    notify(String(e));
  }
}
function add() {
  try {
    const parsed = new URL(url.value);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Invalid URL");
    servers.value.push({
      id: createId(),
      name: name.value.trim() || parsed.hostname,
      url: parsed.href,
      enabled: true,
    });
    name.value = "";
    url.value = "";
  } catch (e) {
    error.value = String(e);
  }
}
async function connect(id: string) {
  controller?.abort();
  selected.value = id;
  tools.value = [];
  result.value = undefined;
  error.value = "";
  const server = servers.value.find((s) => s.id === id);
  if (!server) return;
  void connection?.close();
  connection = new McpConnection(server);
  controller = new AbortController();
  busy.value = true;
  try {
    tools.value = await connection.connect(controller.signal);
    chosen.value = tools.value[0]?.name || "";
  } catch (e) {
    error.value = String(e);
  } finally {
    busy.value = false;
  }
}
async function run() {
  if (!connection || !servers.value.find((s) => s.id === selected.value)?.enabled) return;
  result.value = undefined;
  const activeConnection = connection;
  const tool = chosen.value;
  let input;
  try {
    input = JSON.parse(args.value);
    if (!input || Array.isArray(input) || typeof input !== "object")
      throw new Error("Arguments must be an object");
  } catch (e) {
    error.value = String(e);
    return;
  }
  if (
    !(await confirmAction(
      `${zh.value ? "允许调用远程工具？" : "Allow remote tool call?"}\n${activeConnection.server.name} / ${tool}\n${JSON.stringify(input)}`,
    ))
  )
    return;
  controller = new AbortController();
  busy.value = true;
  error.value = "";
  try {
    const response = await activeConnection.call(tool, input, controller.signal);
    result.value = {
      server: activeConnection.server.name,
      tool,
      args: input,
      text: JSON.stringify(response, null, 2),
    };
  } catch (e) {
    error.value = String(e);
  } finally {
    busy.value = false;
  }
}
function attach() {
  if (!result.value) return;
  const id = useChatStore.getState().activeId;
  const snapshot = result.value;
  setDraftText(
    id,
    getDraft(id).text +
      `\n\nMCP ${snapshot.tool}:\nServer: ${snapshot.server}\nArguments: ${JSON.stringify(snapshot.args)}\n${snapshot.text}`,
  );
  extensionsOpen.value = false;
}
</script>
<template>
  <Modal :title="zh ? '扩展管理' : 'Extensions'" @close="extensionsOpen = false"
    ><div class="extension-body">
      <h3>Skills</h3>
      <button @click="advancedImport = !advancedImport">
        {{ zh ? "从文件夹 / GitHub 导入" : "Import folder / GitHub" }}</button
      ><TrSkillImportForm
        v-if="advancedImport"
        @cancel="advancedImport = false"
        @submit="
          (definition) => {
            skills.push({
              id: createId(),
              name: definition.name,
              content: definition.instructions,
              enabled: false,
            });
            advancedImport = false;
          }
        "
      />
      <p>
        {{
          zh
            ? "导入 Markdown 指令；启用后会加入后续请求上下文。"
            : "Import Markdown instructions. Enabled skills are included in subsequent requests."
        }}
      </p>
      <label class="button"
        >{{ zh ? "导入 Skill (.md)" : "Import Skill (.md)"
        }}<input type="file" accept=".md,text/markdown,text/plain" hidden @change="importSkill"
      /></label>
      <div v-for="skill in skills" :key="skill.id" class="extension-card">
        <label><input v-model="skill.enabled" type="checkbox" />{{ skill.name }}</label
        ><button @click="skills = skills.filter((s) => s.id !== skill.id)">
          {{ zh ? "删除" : "Delete" }}
        </button>
        <details>
          <summary>{{ zh ? "查看指令" : "View instructions" }}</summary>
          <pre>{{ skill.content }}</pre>
        </details>
      </div>
      <h3>MCP</h3>
      <p>
        {{
          zh
            ? "连接支持 CORS 的 Streamable HTTP 服务，发现并调用工具，将结果加入对话。stdio 服务需自行运行 HTTP 桥接。"
            : "Connect to a CORS-enabled Streamable HTTP service, invoke tools and add results to chat. stdio requires an HTTP bridge."
        }}
      </p>
      <form class="mcp-form" @submit.prevent="add">
        <input
          v-model="name"
          :placeholder="zh ? '服务名称' : 'Server name'"
          aria-label="MCP name"
        /><input
          v-model="url"
          required
          type="url"
          placeholder="https://…/mcp"
          aria-label="MCP URL"
        /><button>{{ zh ? "添加" : "Add" }}</button>
      </form>
      <div v-for="server in servers" class="extension-card">
        <label><input v-model="server.enabled" type="checkbox" />{{ server.name }}</label
        ><button :disabled="busy || !server.enabled" @click="connect(server.id)">
          {{ zh ? "连接 / 发现工具" : "Connect / discover tools" }}</button
        ><button
          :disabled="busy"
          @click="
            servers = servers.filter((s) => s.id !== server.id);
            selected === server.id && ((tools = []), (connection = undefined));
          "
        >
          {{ zh ? "删除" : "Delete" }}</button
        ><small>{{ server.url }}</small>
      </div>
      <template v-if="tools.length"
        ><select v-model="chosen" aria-label="MCP tool">
          <option v-for="tool in tools" :value="tool.name">{{ tool.name }}</option>
        </select>
        <p>{{ tools.find((t) => t.name === chosen)?.description }}</p>
        <details>
          <summary>JSON Schema</summary>
          <pre>{{
            JSON.stringify(tools.find((t) => t.name === chosen)?.inputSchema, null, 2)
          }}</pre>
        </details>
        <textarea v-model="args" aria-label="MCP arguments" spellcheck="false" /><button
          :disabled="busy"
          @click="run"
        >
          {{ zh ? "调用工具" : "Call tool" }}
        </button></template
      ><button v-if="busy" @click="controller?.abort()">{{ zh ? "取消" : "Cancel" }}</button>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <template v-if="result">
        <p>{{ result.server }} / {{ result.tool }}</p>
        <pre class="mcp-result">{{ result.text }}</pre>
        <button @click="attach">
          {{ zh ? "将结果加入输入框" : "Add result to composer" }}
        </button></template
      >
    </div></Modal
  >
</template>
