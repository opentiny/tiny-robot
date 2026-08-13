import { computed, shallowRef, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useChatDraft } from './useChatDraft'
import type {
  ChatMcpServerView,
  ChatMcpToolView,
  ChatMcpView,
  ChatModelView,
  ChatBuiltInModelFeature,
  ChatRuntime,
  ChatRuntimeActionErrorPayload,
  ChatSendPayload,
  ChatUIData,
} from '../types'

export interface UseChatRuntimeAdapterOptions {
  runtime: MaybeRefOrGetter<ChatRuntime>
  title?: MaybeRefOrGetter<string | undefined>
  onActionError: (payload: ChatRuntimeActionErrorPayload) => void
}

export function useChatRuntimeAdapter(options: UseChatRuntimeAdapterOptions) {
  const runtime = computed(() => toValue(options.runtime))
  const activeConversation = computed(() => runtime.value.activeConversation.value)
  const pendingModelSelecting = shallowRef(false)
  const pendingModelFeatureIds = shallowRef<ReadonlySet<ChatBuiltInModelFeature>>(new Set())
  const pendingMcpServerIds = shallowRef<ReadonlySet<string>>(new Set())
  const pendingMcpToolIds = shallowRef<ReadonlySet<string>>(new Set())

  const input = useChatDraft({
    send: async (payload) => (await runAction('send', payload, () => runtime.value.actions.send(payload))) ?? false,
  })

  const data = computed<ChatUIData>(() => {
    const active = activeConversation.value
    const model = runtime.value.composer.model
    const mcp = runtime.value.composer.mcp
    const tools: Record<string, ChatMcpToolView[]> = {}

    for (const [serverId, serverTools] of Object.entries(mcp?.tools.value ?? {})) {
      if (serverTools) {
        tools[serverId] = serverTools.map(
          (tool): ChatMcpToolView => ({
            ...tool,
            loading: pendingMcpToolIds.value.has(getToolKey(serverId, tool.id)),
          }),
        )
      }
    }

    const modelView: ChatModelView | undefined = model
      ? {
          options: model.options.value,
          selectedId: model.selectedId.value,
          features: model.features.value,
          selecting: pendingModelSelecting.value,
          pendingFeatureIds: [...pendingModelFeatureIds.value],
        }
      : undefined
    const mcpView: ChatMcpView | undefined = mcp
      ? {
          servers: mcp.servers.value.map(
            (server): ChatMcpServerView => ({
              ...server,
              loading: Boolean(server.loading || pendingMcpServerIds.value.has(server.id)),
            }),
          ),
          tools,
        }
      : undefined

    return {
      conversation: {
        items: runtime.value.conversations.value,
        activeId: active?.id ?? null,
        title: toValue(options.title) || active?.title,
      },
      bubble: { messages: active?.messages ?? [] },
      sender: {
        loading: active?.requestState === 'processing',
        disabled: Boolean(runtime.value.composer.disabled?.value),
        submitDisabled: Boolean(runtime.value.composer.submitDisabled?.value),
      },
      request: active
        ? {
            state: active.requestState,
            processingState: active.processingState,
            error: active.lastError ?? undefined,
          }
        : undefined,
      model: modelView,
      mcp: mcpView,
    }
  })

  function setPendingId<T extends string>(target: { value: ReadonlySet<T> }, id: T, pending: boolean) {
    const next = new Set(target.value)

    if (pending) {
      next.add(id)
    } else {
      next.delete(id)
    }

    target.value = next
  }

  function getToolKey(serverId: string, toolId: string) {
    return `${serverId}:${toolId}`
  }

  async function runAction<T>(
    action: ChatRuntimeActionErrorPayload['action'],
    payload: unknown,
    task: () => Promise<T> | T,
  ): Promise<T | undefined> {
    try {
      return await task()
    } catch (error) {
      options.onActionError({ action, payload, error })
      return undefined
    }
  }

  async function withPending<T extends string>(
    target: { value: ReadonlySet<T> },
    id: T,
    task: () => Promise<void> | void,
  ) {
    if (target.value.has(id)) return
    setPendingId(target, id, true)
    try {
      await task()
    } finally {
      setPendingId(target, id, false)
    }
  }

  async function selectModel(id: string | null) {
    const model = runtime.value.composer.model
    if (!model || model.selectedId.value === id || pendingModelSelecting.value) return
    pendingModelSelecting.value = true
    try {
      await runAction('select-model', { id }, () => model.select(id))
    } finally {
      pendingModelSelecting.value = false
    }
  }

  async function setModelFeature(id: ChatBuiltInModelFeature, enabled: boolean) {
    const model = runtime.value.composer.model
    if (!model || model.features.value[id] === enabled) return
    await withPending(pendingModelFeatureIds, id, () =>
      runAction('set-model-feature', { id, enabled }, () => model.setFeature(id, enabled)),
    )
  }

  async function addMcpServer(id: string) {
    const mcp = runtime.value.composer.mcp
    if (mcp)
      await withPending(pendingMcpServerIds, id, () => runAction('add-mcp-server', { id }, () => mcp.addServer(id)))
  }

  async function removeMcpServer(id: string) {
    const mcp = runtime.value.composer.mcp
    if (mcp)
      await withPending(pendingMcpServerIds, id, () =>
        runAction('remove-mcp-server', { id }, () => mcp.removeServer(id)),
      )
  }

  async function setMcpServerEnabled(id: string, enabled: boolean) {
    const mcp = runtime.value.composer.mcp
    const server = mcp?.servers.value.find((item) => item.id === id)
    if (mcp && server && server.enabled !== enabled) {
      await withPending(pendingMcpServerIds, id, () =>
        runAction('set-mcp-server-enabled', { id, enabled }, () => mcp.setServerEnabled(id, enabled)),
      )
    }
  }

  async function setMcpToolEnabled(serverId: string, toolId: string, enabled: boolean) {
    const mcp = runtime.value.composer.mcp
    const tool = mcp?.tools.value[serverId]?.find((item) => item.id === toolId)
    const key = getToolKey(serverId, toolId)
    if (mcp && tool && tool.enabled !== enabled) {
      await withPending(pendingMcpToolIds, key, () =>
        runAction('set-mcp-tool-enabled', { serverId, toolId, enabled }, () =>
          mcp.setToolEnabled(serverId, toolId, enabled),
        ),
      )
    }
  }

  return {
    data,
    inputValue: input.inputValue,
    setInputValue: input.setInputValue,
    send: (payload: ChatSendPayload) => input.send(payload),
    abort: () => runAction('abort', undefined, () => runtime.value.actions.abort?.()),
    createConversation: () =>
      runAction('create-conversation', undefined, () => runtime.value.actions.createConversation()),
    switchConversation: (id: string) =>
      runAction('switch-conversation', { id }, () => runtime.value.actions.switchConversation(id)),
    renameConversation: (id: string, title: string) =>
      runAction('rename-conversation', { id, title }, () => runtime.value.actions.renameConversation(id, title)),
    deleteConversation: (id: string) =>
      runAction('delete-conversation', { id }, () => runtime.value.actions.deleteConversation(id)),
    selectModel,
    setModelFeature,
    addMcpServer,
    removeMcpServer,
    setMcpServerEnabled,
    setMcpToolEnabled,
  }
}
