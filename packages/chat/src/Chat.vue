<script setup lang="ts">
import { computed, shallowRef, toRef, watch } from 'vue'
import ChatUI from './ChatUI.vue'
import { useChatInput } from '@/composables/useChatInput'
import type {
  ChatMcpServerView,
  ChatMcpToolView,
  ChatMcpView,
  ChatModelView,
  ChatRuntime,
  ChatSubmitPayload,
  ChatUIData,
  ChatUIOptions,
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
const attemptedToolLoadServerIds = shallowRef<ReadonlySet<string>>(new Set())
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

const data = computed<ChatUIData>(() => ({
  conversation: {
    items: conversationItems.value,
    activeId: activeConversation.value?.id ?? null,
    title: currentTitle.value,
  },
  bubble: {
    messages: activeMessages.value,
  },
  sender: {
    inputValue: input.inputValue.value,
    loading: requestState.value === 'processing',
    disabled: senderDisabled.value,
    submitDisabled: false,
  },
  model: modelView.value,
  mcp: mcpView.value,
}))

const adapterUI = computed<ChatUIOptions>(() => {
  const callerUi = props.ui
  const callerSender = callerUi?.sender === false ? undefined : callerUi?.sender
  const callerModel = callerUi?.model === false ? undefined : callerUi?.model
  const callerMcp = callerUi?.mcp === false ? undefined : callerUi?.mcp

  return {
    ...(callerUi ?? {}),
    sender:
      callerUi?.sender === false
        ? false
        : {
            ...(callerSender ?? {}),
            onInput: (value: string) => {
              input.setInputValue(value)
              callerSender?.onInput?.(value)
            },
          },
    model:
      callerUi?.model === false
        ? false
        : {
            ...(callerModel ?? {}),
            onSelect: (payload) => {
              handleSelectModel(payload)
              callerModel?.onSelect?.(payload)
            },
            onFeatureChange: (payload) => {
              handleUpdateModelFeature(payload)
              callerModel?.onFeatureChange?.(payload)
            },
          },
    mcp:
      callerUi?.mcp === false
        ? false
        : {
            ...(callerMcp ?? {}),
            onAddServer: (payload) => {
              handleAddMcpServer(payload)
              callerMcp?.onAddServer?.(payload)
            },
            onRemoveServer: (payload) => {
              handleRemoveMcpServer(payload)
              callerMcp?.onRemoveServer?.(payload)
            },
            onServerEnabledChange: (payload) => {
              handleUpdateMcpServerEnabled(payload)
              callerMcp?.onServerEnabledChange?.(payload)
            },
            onToolEnabledChange: (payload) => {
              handleUpdateMcpToolEnabled(payload)
              callerMcp?.onToolEnabledChange?.(payload)
            },
          },
  }
})

const toolLoadCandidateIds = computed(() => {
  const mcp = getRuntimeMcp()

  if (!mcp) {
    return []
  }

  return mcp.servers.value
    .filter(
      (server) =>
        server.installed &&
        server.enabled &&
        !server.loading &&
        !Object.prototype.hasOwnProperty.call(mcp.tools.value, server.id),
    )
    .map((server) => server.id)
})

watch(
  toolLoadCandidateIds,
  (candidateIds) => {
    const candidateSet = new Set(candidateIds)
    attemptedToolLoadServerIds.value = new Set(
      [...attemptedToolLoadServerIds.value].filter((serverId) => candidateSet.has(serverId)),
    )

    for (const serverId of candidateIds) {
      if (attemptedToolLoadServerIds.value.has(serverId)) {
        continue
      }

      setToolLoadAttempt(serverId, true)
      runAdapterAction(`load MCP tools for "${serverId}"`, () => loadMcpToolsIfNeeded(serverId))
    }
  },
  { immediate: true },
)

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

function setToolLoadAttempt(serverId: string, attempted: boolean) {
  const next = new Set(attemptedToolLoadServerIds.value)

  if (attempted) {
    next.add(serverId)
  } else {
    next.delete(serverId)
  }

  attemptedToolLoadServerIds.value = next
}

function getRuntimeMcp(): ChatRuntime['composer']['mcp'] {
  return runtimeRef.value.composer.mcp
}

function getToolKey(serverId: string, toolId: string) {
  return `${serverId}:${toolId}`
}

function setPendingId(target: { value: ReadonlySet<string> }, id: string, pending: boolean) {
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

async function withMcpServerPending(
  id: string,
  action: () => Promise<void> | void,
  options: { allowExisting?: boolean } = {},
) {
  const alreadyPending = pendingMcpServerIds.value.has(id)

  if (alreadyPending && !options.allowExisting) {
    return
  }

  if (!alreadyPending) {
    setPendingId(pendingMcpServerIds, id, true)
  }

  try {
    await action()
  } finally {
    if (!alreadyPending) {
      setPendingId(pendingMcpServerIds, id, false)
    }
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

async function loadMcpToolsIfNeeded(serverId: string, options: { allowPending?: boolean } = {}) {
  const mcp = getRuntimeMcp()

  if (!mcp) {
    return
  }

  const server = mcp.servers.value.find((item) => item.id === serverId)

  if (!server || !server.installed || !server.enabled || server.loading) {
    return
  }

  if (Object.prototype.hasOwnProperty.call(mcp.tools.value, serverId)) {
    return
  }

  await withMcpServerPending(serverId, () => mcp.loadTools(serverId), { allowExisting: options.allowPending })
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

  let currentTools = mcp.tools.value[id] ?? []

  if (currentTools.length === 0) {
    setToolLoadAttempt(id, false)
    await loadMcpToolsIfNeeded(id, { allowPending: true })
    currentTools = mcp.tools.value[id] ?? []
  }

  const snapshot = mcpToolSnapshots.value[id]

  if (snapshot?.length) {
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

  if (!model || model.selectedId.value === payload.id) {
    return
  }

  runAdapterAction('select model', () => withModelSelecting(() => model.select(payload.id)))
}

function handleUpdateModelFeature(payload: { id: string; enabled: boolean }) {
  const model: ChatRuntime['composer']['model'] = runtimeRef.value.composer.model

  if (!model || model.features.value[payload.id] === payload.enabled) {
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
  setToolLoadAttempt(payload.id, false)
  runAdapterAction(`add MCP server "${payload.id}"`, () =>
    withMcpServerPending(payload.id, async () => {
      await mcp.addServer(payload.id)
      await loadMcpToolsIfNeeded(payload.id, { allowPending: true })
    }),
  )
}

function handleRemoveMcpServer(payload: { id: string }) {
  const mcp = getRuntimeMcp()

  if (!mcp) {
    return
  }

  clearServerToolSnapshot(payload.id)
  setToolLoadAttempt(payload.id, false)
  runAdapterAction(`remove MCP server "${payload.id}"`, () =>
    withMcpServerPending(payload.id, () => mcp.removeServer(payload.id)),
  )
}

function handleUpdateMcpServerEnabled(payload: { id: string; enabled: boolean }) {
  const mcp = getRuntimeMcp()
  const server = mcp?.servers.value.find((item) => item.id === payload.id)

  if (!server || server.enabled === payload.enabled) {
    return
  }

  if (payload.enabled) {
    setToolLoadAttempt(payload.id, false)
  }

  runAdapterAction(`update MCP server "${payload.id}"`, () =>
    withMcpServerPending(payload.id, () => setServerEnabled(payload.id, payload.enabled)),
  )
}

function handleUpdateMcpToolEnabled(payload: { serverId: string; toolId: string; enabled: boolean }) {
  const mcp = getRuntimeMcp()
  const tool = mcp?.tools.value[payload.serverId]?.find((item) => item.id === payload.toolId)

  if (!mcp || !tool || tool.enabled === payload.enabled) {
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
    :data="data"
    :ui="adapterUI"
    @create-conversation="handleCreateConversation"
    @switch-conversation="handleSwitchConversation"
    @rename-conversation="handleRenameConversation"
    @delete-conversation="handleDeleteConversation"
    @submit="handleSubmit"
    @cancel="handleCancel"
    @clear="handleClear"
  >
    <template v-if="$slots['layout-left-aside']" #layout-left-aside>
      <slot name="layout-left-aside" />
    </template>

    <template v-if="$slots['layout-header']" #layout-header>
      <slot name="layout-header" />
    </template>

    <template v-if="$slots['layout-main']" #layout-main>
      <slot name="layout-main" />
    </template>

    <template v-if="$slots['layout-footer']" #layout-footer>
      <slot name="layout-footer" />
    </template>

    <template v-if="$slots['header-notice']" #header-notice>
      <slot name="header-notice" />
    </template>

    <template v-if="$slots['welcome-footer']" #welcome-footer>
      <slot name="welcome-footer" />
    </template>

    <template v-if="$slots['prompts-footer']" #prompts-footer>
      <slot name="prompts-footer" />
    </template>

    <template v-if="$slots['bubble-prefix']" #bubble-prefix>
      <slot name="bubble-prefix" />
    </template>

    <template v-if="$slots['bubble-suffix']" #bubble-suffix>
      <slot name="bubble-suffix" />
    </template>

    <template v-if="$slots['bubble-after']" #bubble-after>
      <slot name="bubble-after" />
    </template>

    <template v-if="$slots['bubble-content-footer']" #bubble-content-footer>
      <slot name="bubble-content-footer" />
    </template>

    <template v-if="$slots['sender-footer']" #sender-footer>
      <slot name="sender-footer" />
    </template>

    <template v-if="$slots['sender-footer-right']" #sender-footer-right>
      <slot name="sender-footer-right" />
    </template>

    <template v-if="$slots['layout-right-aside-title']" #layout-right-aside-title>
      <slot name="layout-right-aside-title" />
    </template>

    <template v-if="$slots['layout-right-aside']" #layout-right-aside>
      <slot name="layout-right-aside" />
    </template>
  </ChatUI>
</template>
