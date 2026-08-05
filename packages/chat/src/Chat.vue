<script setup lang="ts">
import { computed, shallowRef, toRef } from 'vue'
import ChatUI from './ChatUI.vue'
import { useChatInput } from '@/composables/useChatInput'
import type {
  ChatMcpServerView,
  ChatMcpToolView,
  ChatMcpView,
  ChatModelView,
  ChatRuntime,
  ChatSubmitPayload,
  ChatUIOptions,
  ChatViewState,
} from '@/types'

const props = defineProps<{
  runtime: ChatRuntime
  ui?: ChatUIOptions
  title?: string
}>()

const runtimeRef = toRef(() => props.runtime)
const input = useChatInput(runtimeRef)

const activeConversation = computed(() => runtimeRef.value.activeConversation.value)
const conversationItems = computed(() => runtimeRef.value.conversations.value)
const activeMessages = computed(() => activeConversation.value?.messages ?? [])
const requestState = computed(() => activeConversation.value?.requestState ?? 'idle')
const senderDisabled = computed(() => runtimeRef.value.composer.disabled.value)
const currentTitle = computed(() => props.title || activeConversation.value?.title)
const mcpToolSnapshots = shallowRef<Record<string, readonly string[]>>({})
const modelSelecting = shallowRef(false)
const pendingModelFeatureIds = shallowRef<ReadonlySet<string>>(new Set())
const pendingMcpServerIds = shallowRef<ReadonlySet<string>>(new Set())
const pendingMcpToolIds = shallowRef<ReadonlySet<string>>(new Set())

const modelView = computed<ChatModelView | undefined>(() => {
  const model: ChatRuntime['composer']['model'] = runtimeRef.value.composer.model

  if (!model) {
    return undefined
  }

  return {
    options: model.options.value,
    selectedId: model.selectedId.value,
    features: model.features.value,
    selecting: modelSelecting.value,
    pendingFeatureIds: [...pendingModelFeatureIds.value],
  }
})

const mcpView = computed<ChatMcpView | undefined>(() => {
  const mcp: ChatRuntime['composer']['mcp'] = runtimeRef.value.composer.mcp

  if (!mcp) {
    return undefined
  }

  const tools: Record<string, ChatMcpToolView[]> = {}

  for (const [serverId, serverTools] of Object.entries(mcp.tools.value)) {
    if (!serverTools) {
      continue
    }

    tools[serverId] = serverTools.map(
      (tool): ChatMcpToolView => ({
        ...tool,
        loading: pendingMcpToolIds.value.has(getToolKey(serverId, tool.id)),
      }),
    )
  }

  return {
    servers: mcp.servers.value.map(
      (server): ChatMcpServerView => ({
        ...server,
        loading: Boolean(server.loading || pendingMcpServerIds.value.has(server.id)),
      }),
    ),
    tools,
  }
})

const state = computed<ChatViewState>(() => ({
  conversation: {
    items: conversationItems.value,
    activeId: activeConversation.value?.id ?? null,
    title: currentTitle.value,
  },
  messages: activeMessages.value,
  composer: {
    loading: requestState.value === 'processing',
    disabled: senderDisabled.value,
    submitDisabled: input.submitDisabled.value,
  },
  model: modelView.value,
  mcp: mcpView.value,
}))

function setServerToolSnapshot(serverId: string, toolIds: readonly string[]) {
  mcpToolSnapshots.value = {
    ...mcpToolSnapshots.value,
    [serverId]: toolIds,
  }
}

function clearServerToolSnapshot(serverId: string) {
  const { [serverId]: _removedSnapshot, ...rest } = mcpToolSnapshots.value
  mcpToolSnapshots.value = rest
}

function getRuntimeMcp(): ChatRuntime['composer']['mcp'] {
  return runtimeRef.value.composer.mcp
}

function getToolKey(serverId: string, toolId: string) {
  return `${serverId}:${toolId}`
}

function setPendingId(target: typeof pendingModelFeatureIds, id: string, pending: boolean) {
  const next = new Set(target.value)

  if (pending) {
    next.add(id)
  } else {
    next.delete(id)
  }

  target.value = next
}

function runAdapterAction(label: string, action: () => Promise<void> | void) {
  void Promise.resolve()
    .then(action)
    .catch((error) => {
      console.error(`[TrChat] Failed to ${label}:`, error)
    })
}

async function withModelSelecting(action: () => Promise<void> | void) {
  if (modelSelecting.value) {
    return
  }

  modelSelecting.value = true

  try {
    await action()
  } finally {
    modelSelecting.value = false
  }
}

async function withModelFeaturePending(id: string, action: () => Promise<void> | void) {
  if (pendingModelFeatureIds.value.has(id)) {
    return
  }

  setPendingId(pendingModelFeatureIds, id, true)

  try {
    await action()
  } finally {
    setPendingId(pendingModelFeatureIds, id, false)
  }
}

async function withMcpServerPending(id: string, action: () => Promise<void> | void) {
  if (pendingMcpServerIds.value.has(id)) {
    return
  }

  setPendingId(pendingMcpServerIds, id, true)

  try {
    await action()
  } finally {
    setPendingId(pendingMcpServerIds, id, false)
  }
}

async function withMcpToolPending(serverId: string, toolId: string, action: () => Promise<void> | void) {
  const key = getToolKey(serverId, toolId)

  if (pendingMcpToolIds.value.has(key)) {
    return
  }

  setPendingId(pendingMcpToolIds, key, true)

  try {
    await action()
  } finally {
    setPendingId(pendingMcpToolIds, key, false)
  }
}

async function setServerEnabled(id: string, enabled: boolean) {
  const mcp = getRuntimeMcp()

  if (!mcp) {
    return
  }

  if (!enabled) {
    const currentTools = mcp.tools.value[id] ?? []
    const enabledToolIds = currentTools.filter((tool) => tool.enabled).map((tool) => tool.id)

    if (enabledToolIds.length > 0) {
      setServerToolSnapshot(id, enabledToolIds)
    } else {
      clearServerToolSnapshot(id)
    }

    for (const tool of currentTools) {
      if (tool.enabled) {
        await mcp.setToolEnabled(id, tool.id, false)
      }
    }

    await mcp.setServerEnabled(id, false)
    return
  }

  await mcp.setServerEnabled(id, true)

  const snapshot = mcpToolSnapshots.value[id]
  let currentTools = mcp.tools.value[id] ?? []

  if (snapshot?.length) {
    if (currentTools.length === 0) {
      await mcp.loadTools(id)
      currentTools = mcp.tools.value[id] ?? []
    }

    const snapshotSet = new Set(snapshot)

    for (const tool of currentTools) {
      if (snapshotSet.has(tool.id) && !tool.enabled) {
        await mcp.setToolEnabled(id, tool.id, true)
      }
    }

    clearServerToolSnapshot(id)
    return
  }

  if (currentTools.length > 0 && currentTools.every((tool) => !tool.enabled)) {
    for (const tool of currentTools) {
      await mcp.setToolEnabled(id, tool.id, true)
    }
  }
}

function handleCreateConversation() {
  runtimeRef.value.actions.createConversation()
}

function handleSwitchConversation(payload: { id: string }) {
  runtimeRef.value.actions.switchConversation(payload.id)
}

function handleRenameConversation(payload: { id: string; title: string }) {
  runtimeRef.value.actions.renameConversation(payload.id, payload.title)
}

function handleDeleteConversation(payload: { id: string }) {
  runtimeRef.value.actions.deleteConversation(payload.id)
}

function handleSubmit(payload: ChatSubmitPayload) {
  input.send(payload)
}

function handleCancel() {
  input.abort?.()
}

function handleClear() {
  input.setInputValue('')
}

function handleSelectModel(payload: { id: string | null }) {
  const model: ChatRuntime['composer']['model'] = runtimeRef.value.composer.model

  if (!model) {
    return
  }

  runAdapterAction('select model', () => withModelSelecting(() => model.select(payload.id)))
}

function handleUpdateModelFeature(payload: { id: string; enabled: boolean }) {
  const model: ChatRuntime['composer']['model'] = runtimeRef.value.composer.model

  if (!model) {
    return
  }

  runAdapterAction(`update model feature "${payload.id}"`, () =>
    withModelFeaturePending(payload.id, () => model.setFeature(payload.id, payload.enabled)),
  )
}

function handleAddMcpServer(payload: { id: string }) {
  const mcp = getRuntimeMcp()

  if (!mcp) {
    return
  }

  clearServerToolSnapshot(payload.id)
  runAdapterAction(`add MCP server "${payload.id}"`, () =>
    withMcpServerPending(payload.id, () => mcp.addServer(payload.id)),
  )
}

function handleRemoveMcpServer(payload: { id: string }) {
  const mcp = getRuntimeMcp()

  if (!mcp) {
    return
  }

  clearServerToolSnapshot(payload.id)
  runAdapterAction(`remove MCP server "${payload.id}"`, () =>
    withMcpServerPending(payload.id, () => mcp.removeServer(payload.id)),
  )
}

function handleLoadMcpTools(payload: { serverId: string }) {
  const mcp = getRuntimeMcp()

  if (!mcp) {
    return
  }

  runAdapterAction(`load MCP tools for "${payload.serverId}"`, () =>
    withMcpServerPending(payload.serverId, () => mcp.loadTools(payload.serverId)),
  )
}

function handleUpdateMcpServerEnabled(payload: { id: string; enabled: boolean }) {
  runAdapterAction(`update MCP server "${payload.id}"`, () =>
    withMcpServerPending(payload.id, () => setServerEnabled(payload.id, payload.enabled)),
  )
}

function handleUpdateMcpToolEnabled(payload: { serverId: string; toolId: string; enabled: boolean }) {
  const mcp = getRuntimeMcp()

  if (!mcp) {
    return
  }

  runAdapterAction(`update MCP tool "${payload.toolId}" for "${payload.serverId}"`, () =>
    withMcpToolPending(payload.serverId, payload.toolId, () =>
      mcp.setToolEnabled(payload.serverId, payload.toolId, payload.enabled),
    ),
  )
}
</script>

<template>
  <ChatUI
    :state="state"
    :ui="ui"
    :composer-value="input.inputValue.value"
    @update:composer-value="input.setInputValue"
    @create-conversation="handleCreateConversation"
    @switch-conversation="handleSwitchConversation"
    @rename-conversation="handleRenameConversation"
    @delete-conversation="handleDeleteConversation"
    @submit="handleSubmit"
    @cancel="handleCancel"
    @clear="handleClear"
    @select-model="handleSelectModel"
    @update-model-feature="handleUpdateModelFeature"
    @add-mcp-server="handleAddMcpServer"
    @remove-mcp-server="handleRemoveMcpServer"
    @load-mcp-tools="handleLoadMcpTools"
    @update-mcp-server-enabled="handleUpdateMcpServerEnabled"
    @update-mcp-tool-enabled="handleUpdateMcpToolEnabled"
  >
    <template v-if="$slots['left-aside']" #left-aside="slotProps">
      <slot name="left-aside" v-bind="slotProps" />
    </template>

    <template v-if="$slots.header" #header="slotProps">
      <slot name="header" v-bind="slotProps" />
    </template>

    <template v-if="$slots.main" #main="slotProps">
      <slot name="main" v-bind="slotProps" />
    </template>

    <template v-if="$slots.footer" #footer="slotProps">
      <slot name="footer" v-bind="slotProps" />
    </template>

    <template v-if="$slots.notice" #notice>
      <slot name="notice" />
    </template>

    <template v-if="$slots['welcome-footer']" #welcome-footer>
      <slot name="welcome-footer" />
    </template>

    <template v-if="$slots['prompts-footer']" #prompts-footer>
      <slot name="prompts-footer" />
    </template>

    <template v-if="$slots.prefix" #prefix="slotProps">
      <slot name="prefix" v-bind="slotProps" />
    </template>

    <template v-if="$slots.suffix" #suffix="slotProps">
      <slot name="suffix" v-bind="slotProps" />
    </template>

    <template v-if="$slots.after" #after="slotProps">
      <slot name="after" v-bind="slotProps" />
    </template>

    <template v-if="$slots['content-footer']" #content-footer="slotProps">
      <slot name="content-footer" v-bind="slotProps" />
    </template>

    <template v-if="$slots['sender-footer']" #sender-footer="slotProps">
      <slot name="sender-footer" v-bind="slotProps" />
    </template>

    <template v-if="$slots['sender-footer-right']" #sender-footer-right="slotProps">
      <slot name="sender-footer-right" v-bind="slotProps" />
    </template>

    <template v-if="$slots['right-aside']" #right-aside>
      <slot name="right-aside" />
    </template>
  </ChatUI>
</template>
