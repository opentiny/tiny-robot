<template>
  <div class="session-skill-demo">
    <div class="session-skill-controls">
      <label>
        显式指定
        <select v-model="requested" :disabled="busy">
          <option value="">由模型选择</option>
          <option value="weather">@weather</option>
        </select>
      </label>
      <label>
        @ 指定方式
        <select v-model="explicitSkillLoading" :disabled="busy || !requested" @change="reopen">
          <option value="preload">直接加载正文</option>
          <option value="model">交给模型加载</option>
        </select>
      </label>
      <label><input v-model="available" type="checkbox" :disabled="busy" @change="reopen" /> weather 可用</label>
      <label>
        正文去重
        <select v-model="deduplication" :disabled="busy || !available" @change="reopen">
          <option value="none">none：每次加载都返回全文</option>
          <option value="context">context：有历史正文时复用</option>
        </select>
      </label>
      <button :disabled="busy" @click="restore">模拟保存并恢复</button>
      <button :disabled="busy" @click="reset">新对话</button>
    </div>
    <p v-if="!requested || !available" class="session-skill-hints">
      <span v-if="!requested">选择 @weather 后可调整 @ 指定方式。</span>
      <span v-if="!available">停用后，新的 weather 加载会失败。已加载的正文仍留在历史中。</span>
    </p>
    <form class="session-skill-send" @submit.prevent="send">
      <input v-model="input" aria-label="消息" :disabled="busy" />
      <button :disabled="busy || !input.trim()">发送</button>
      <button v-if="provider && busy" type="button" @click="active?.abortRequest()">停止</button>
    </form>
    <p v-if="error" role="alert">{{ error }}</p>
    <p v-if="restored" role="status" class="session-skill-hints">已恢复会话。再发一次可查看加载结果。</p>
    <slot name="messages" :messages="visibleMessages">
      <ol v-if="dialogue.length" class="session-skill-messages" aria-label="对话记录" aria-live="polite">
        <li v-for="(message, index) in dialogue" :key="index">
          <strong>{{ message.role === 'user' ? '你' : '助手' }}</strong>
          <p>{{ message.content }}</p>
        </li>
      </ol>
    </slot>
    <ol v-if="requests.length" class="session-skill-trace" aria-label="本轮请求过程" aria-live="polite">
      <li v-for="(request, index) in requests" :key="index">
        <strong>请求 {{ index + 1 }}</strong> {{ request.summary }}
      </li>
    </ol>
    <details v-if="requests.length">
      <summary>查看本轮模型请求（{{ requests.length }} 次）</summary>
      <div v-for="(request, index) in requests" :key="index">
        <strong>请求 {{ index + 1 }}</strong>
        <pre>{{ request.json }}</pre>
      </div>
    </details>
    <details v-if="visibleMessages.length">
      <summary>查看 Kit 消息</summary>
      <pre>{{ kitMessages }}</pre>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed, effectScope, onBeforeUnmount, ref, shallowRef } from 'vue'
import { isSkillContextMessage, skillPlugin, toolPlugin, useMessage } from '@opentiny/tiny-robot-kit'
import type {
  ChatCompletion,
  ChatMessage,
  MessageRequestBody,
  ResponseProvider,
  SessionSkillLoadResult,
  SkillDeduplication,
  SkillDefinition,
  UseMessageReturn,
  UseMessageSessionSkillPluginOptions,
} from '@opentiny/tiny-robot-kit'

const props = defineProps<{ provider?: ResponseProvider; initialPrompt?: string }>()
defineSlots<{ messages?: (props: { messages: ChatMessage[] }) => unknown }>()

const weather: SkillDefinition = {
  name: 'weather',
  description: '查询天气和出行建议。',
  instructions: '先确认城市，再参考 references/format.md 整理天气与出行建议。',
  resources: [
    {
      path: 'references/format.md',
      resourceId: 'references/format.md',
      kind: 'text',
      text: '先给天气结论，再给一条出行建议。',
    },
  ],
}
const deduplication = ref<SkillDeduplication>('none')
const explicitSkillLoading = ref<NonNullable<UseMessageSessionSkillPluginOptions['explicitSkillLoading']>>('preload')
const available = ref(true)
const requested = ref('')
const input = ref(props.initialPrompt ?? '杭州今天适合骑车吗？')
const requests = shallowRef<Array<{ summary: string; json: string }>>([])
const restored = ref(false)
const error = ref('')
const active = shallowRef<UseMessageReturn>()
let scope = effectScope()
let callId = 0
const busy = computed(() => active.value?.isProcessing.value ?? false)
defineExpose({ busy })
const visibleMessages = computed(() =>
  (active.value?.messages.value ?? []).filter((message) => !isSkillContextMessage(message)),
)
const dialogue = computed(() =>
  visibleMessages.value.filter(({ role, content }) => (role === 'user' || role === 'assistant') && content),
)
const kitMessages = computed(() => JSON.stringify(active.value?.messages.value ?? [], null, 2))

type MockToolName = 'load_skills' | 'list_skill_files' | 'read_skill_file'
type ToolResult = SessionSkillLoadResult | { files?: Array<{ path: string }>; content?: string; error?: string }

const completion = (content: string, tool?: { name: MockToolName; arguments: string }): ChatCompletion => ({
  id: 'session-demo',
  object: 'chat.completion',
  created: 1,
  model: 'mock',
  system_fingerprint: null,
  choices: [
    {
      index: 0,
      delta: undefined,
      logprobs: null,
      finish_reason: tool ? 'tool_calls' : 'stop',
      message: {
        role: 'assistant',
        content,
        ...(tool
          ? {
              tool_calls: [
                {
                  index: 0,
                  id: `load-${++callId}`,
                  type: 'function',
                  function: tool,
                },
              ],
            }
          : {}),
      },
    },
  ],
})

const callTool = (name: MockToolName, args: object) => completion('', { name, arguments: JSON.stringify(args) })

const readResult = (message?: ChatMessage): ToolResult | undefined => {
  const content = message?.content
  const item = Array.isArray(content) ? content.at(-1) : undefined
  const text = typeof content === 'string' ? content : item?.type === 'text' ? item.text : undefined
  if (!text) return
  const preloadMarker = '\n\nSkill preload result:\n'
  const preloadIndex = text.lastIndexOf(preloadMarker)
  const json =
    message?.role === 'tool'
      ? text
      : message?.role === 'user' && preloadIndex >= 0
        ? text.slice(preloadIndex + preloadMarker.length)
        : undefined
  if (!json) return
  try {
    const result: unknown = JSON.parse(json)
    if (result && typeof result === 'object') return result as ToolResult
  } catch {
    // Most messages contain plain text.
  }
}

const loadStatus = (result: ToolResult | undefined) => {
  if (!result || !('skills' in result) || !Array.isArray(result.skills)) return
  const skill = result.skills[0]
  return skill?.status === 'failed' ? skill.error?.code : (skill?.status ?? result.error?.code)
}

const statusLabels: Record<string, string> = {
  loaded: '已加载正文',
  already_loaded: '复用历史正文',
  skill_unavailable: 'Skill 不可用',
  skill_load_failed: '加载失败',
}

const describeStatus = (status: string) => (statusLabels[status] ? `${statusLabels[status]}（${status}）` : status)

const describeRequest = (
  messages: MessageRequestBody['messages'],
  toolName: string | undefined,
  result: ToolResult | undefined,
) => {
  const status = loadStatus(result) ?? (typeof result?.error === 'string' ? result.error : undefined)
  if (toolName) {
    const outcome = status
      ? describeStatus(status)
      : toolName === 'list_skill_files'
        ? '参考文件列表'
        : toolName === 'read_skill_file'
          ? '文件正文'
          : '工具结果'
    return `${toolName} 返回 ${outcome}`
  }

  const last = messages.at(-1)
  const includesCatalog = messages.some(
    (message) =>
      message.role === 'system' && String(message.content).startsWith('Available skills (discovery snapshot):'),
  )
  const parts = ['用户问题']
  if (includesCatalog) parts.unshift('Skill 目录')
  if (status) parts.push(`预加载：${describeStatus(status)}`)
  if (typeof last?.content === 'string' && last.content.includes('\n\nUser-requested Skills:')) {
    parts.push('@weather 名称提示')
  }
  return parts.join('、')
}

const mockResponse = (toolName: string | undefined, result: ToolResult | undefined): ChatCompletion => {
  if (toolName === 'list_skill_files') {
    const file = result && 'files' in result ? result.files?.[0] : undefined
    return file
      ? callTool('read_skill_file', { skillName: weather.name, path: file.path })
      : completion('无法读取 weather 的参考文件。')
  }
  if (toolName === 'read_skill_file') {
    const content = result && 'content' in result ? result.content : undefined
    return completion(content ? `参考文件要求：${content}` : '无法读取 weather 的参考文件。')
  }
  if (input.value.trim() === '读取参考文件') return callTool('list_skill_files', { skillName: weather.name })
  if (loadStatus(result)) return completion('出发前先确认当地天气。如果有小雨，可以缩短路线，并预留提前返程的方案。')
  return callTool('load_skills', { skillNames: [weather.name] })
}

const responseProvider: ResponseProvider = (body, signal) => {
  const last = body.messages.at(-1)
  const toolName =
    last?.role === 'tool'
      ? body.messages
          .findLast((message) => message.tool_calls?.some((call) => call.id === last.tool_call_id))
          ?.tool_calls?.find((call) => call.id === last.tool_call_id)?.function.name
      : undefined
  const result = readResult(last)
  requests.value = [
    ...requests.value,
    {
      summary: describeRequest(body.messages, toolName, result),
      json: JSON.stringify(body, null, 2),
    },
  ]
  return props.provider ? props.provider(body, signal) : Promise.resolve(mockResponse(toolName, result))
}

const open = (messages: ChatMessage[] = []) => {
  scope.stop()
  scope = effectScope()
  active.value = scope.run(() =>
    useMessage({
      initialMessages: messages,
      responseProvider,
      plugins: [
        toolPlugin({
          getTools: () => [],
          callTool: () => 'Tool not found.',
          maxToolRounds: 6,
        }),
        skillPlugin({
          scope: 'session',
          deduplication: deduplication.value,
          explicitSkillLoading: explicitSkillLoading.value,
          getSkillCandidates: () => (available.value ? [weather] : []),
          getSkillByName: (name) => (available.value && name === weather.name ? weather : undefined),
        }),
      ],
    }),
  )
}

const reset = () => {
  requests.value = []
  restored.value = false
  error.value = ''
  open()
}

const reopen = () => {
  restored.value = false
  open(JSON.parse(JSON.stringify(active.value?.messages.value ?? [])))
}
const restore = () => {
  reopen()
  restored.value = true
}
const send = async () => {
  requests.value = []
  restored.value = false
  error.value = ''
  try {
    await active.value?.send({
      role: 'user',
      content: `${requested.value ? `@${requested.value} ` : ''}${input.value}`,
      ...(requested.value ? { metadata: { tinyRobotSkill: { requestedSkillNames: [requested.value] } } } : {}),
    })
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  }
}
open()
onBeforeUnmount(() => {
  void active.value?.abortRequest()
  scope.stop()
})
</script>

<style scoped>
.session-skill-demo {
  display: grid;
  gap: 16px;
  min-width: 0;
}
.session-skill-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.session-skill-controls label {
  display: flex;
  align-items: center;
  gap: 6px;
}
.session-skill-demo select,
.session-skill-demo button,
.session-skill-send input {
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
}
.session-skill-demo :disabled {
  opacity: 0.5;
}
.session-skill-hints {
  margin: 0;
  font-size: 0.875em;
}
.session-skill-send {
  display: flex;
  gap: 8px;
}
.session-skill-send input {
  flex: 1;
  min-width: 0;
}
.session-skill-messages,
.session-skill-trace {
  margin: 0;
  padding-left: 24px;
}
.session-skill-messages p {
  margin: 0 0 8px;
  overflow-wrap: anywhere;
}
.session-skill-demo pre {
  max-height: 18rem;
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 12px;
}
</style>
