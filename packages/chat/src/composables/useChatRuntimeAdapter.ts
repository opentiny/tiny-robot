import { computed, nextTick, shallowRef, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useChatDraft } from './useChatDraft'
import { getChatModelFeatureValues, getChatModelFields } from '../modelFeatures'
import { canSetModelFieldValue } from '@opentiny/tiny-robot'
import type {
  ChatMcpServerView,
  ChatMcpToolView,
  ChatMcpView,
  ChatModelView,
  ChatModelFeatureValueUpdate,
  ChatHistoryData,
  ChatRuntime,
  ChatRuntimeActionErrorPayload,
  ChatSendPayload,
  ChatUIData,
} from '../types'

export interface UseChatRuntimeAdapterOptions {
  runtime: MaybeRefOrGetter<ChatRuntime>
  title?: MaybeRefOrGetter<string | undefined>
  historyData?: MaybeRefOrGetter<ChatHistoryData | undefined>
  onActionError: (payload: ChatRuntimeActionErrorPayload) => void
}

export function useChatRuntimeAdapter(options: UseChatRuntimeAdapterOptions) {
  const runtime = computed(() => toValue(options.runtime))
  const activeConversation = computed(() => runtime.value.activeConversation.value)
  const activeConversationId = computed(() => activeConversation.value?.id ?? null)
  const conversationNavigationRevision = computed(() => runtime.value.conversationNavigationRevision?.value)
  const pendingModelSelecting = shallowRef(false)
  const pendingModelFields = shallowRef<ReadonlySet<string>>(new Set())
  const pendingMcpServerIds = shallowRef<ReadonlySet<string>>(new Set())
  const pendingMcpToolIds = shallowRef<ReadonlyMap<string, ReadonlySet<string>>>(new Map())
  const emptyConversationSendSnapshots = new Set<Set<string>>()
  const pendingAborts = new WeakMap<ChatRuntime, Set<string | null>>()

  watch(
    runtime,
    () => {
      pendingModelSelecting.value = false
      pendingModelFields.value = new Set()
      pendingMcpServerIds.value = new Set()
      pendingMcpToolIds.value = new Map()
      emptyConversationSendSnapshots.clear()
      invalidateDraftForNavigation()
    },
    { flush: 'sync' },
  )

  function prepareSend() {
    const actionRuntime = runtime.value
    const conversationId = actionRuntime.activeConversation.value?.id ?? null
    const navigationRevision = actionRuntime.conversationNavigationRevision?.value
    const emptySendSnapshot =
      conversationId === null ? new Set(actionRuntime.conversations.value.map((item) => item.id)) : undefined
    return async (payload: ChatSendPayload) => {
      const currentConversationId = actionRuntime.activeConversation.value?.id ?? null
      if (
        runtime.value !== actionRuntime ||
        currentConversationId !== conversationId ||
        actionRuntime.conversationNavigationRevision?.value !== navigationRevision
      ) {
        return false
      }
      try {
        if (emptySendSnapshot) emptyConversationSendSnapshots.add(emptySendSnapshot)
        return await actionRuntime.actions.send(payload)
      } catch (error) {
        options.onActionError({ action: 'send', payload, error })
        return false
      } finally {
        await nextTick()
        if (emptySendSnapshot) emptyConversationSendSnapshots.delete(emptySendSnapshot)
      }
    }
  }

  const input = useChatDraft({
    allowEmptyText: true,
    send: (payload) => prepareSend()(payload),
    prepareSend,
  })

  function invalidateDraftForNavigation() {
    input.invalidate()
    if (input.inputValue.value !== '') {
      input.setInputValue('')
    }
  }

  watch(
    activeConversationId,
    (nextId, previousId) => {
      if (
        conversationNavigationRevision.value === undefined &&
        nextId !== previousId &&
        runtime.value.conversationNavigationRevision === undefined
      ) {
        const creationSnapshot =
          nextId === null ? undefined : [...emptyConversationSendSnapshots].find((snapshot) => !snapshot.has(nextId))
        if (previousId === null && nextId !== null && creationSnapshot) {
          emptyConversationSendSnapshots.delete(creationSnapshot)
          return
        }
        invalidateDraftForNavigation()
      }
    },
    { flush: 'sync' },
  )

  watch(
    conversationNavigationRevision,
    (nextRevision, previousRevision) => {
      if (nextRevision !== undefined && previousRevision !== undefined && nextRevision !== previousRevision) {
        invalidateDraftForNavigation()
      }
    },
    { flush: 'sync' },
  )

  const data = computed<ChatUIData>(() => {
    const active = activeConversation.value
    const model = runtime.value.composer.model
    const mcp = runtime.value.composer.mcp
    const tools: Record<string, ChatMcpToolView[]> = {}

    for (const [serverId, serverTools] of Object.entries(mcp?.tools.value ?? {})) {
      if (serverTools) {
        tools[serverId] = serverTools.map((tool): ChatMcpToolView => ({
          ...tool,
          loading: isMcpToolPending(serverId, tool.id),
        }))
      }
    }

    const modelView: ChatModelView | undefined = model
      ? {
          options: model.options.value,
          selectedId: model.selectedId.value,
          featureValues: getChatModelFeatureValues(model),
          featureValuesDisabled: !model.setFeatureValue,
          pendingFeatureKeys: getChatModelFields(
            model.options.value.find((option) => option.id === model.selectedId.value),
          )
            .filter((field) => pendingModelFields.value.has(JSON.stringify([model.selectedId.value, field.key])))
            .map((field) => field.key),
          selecting: pendingModelSelecting.value,
        }
      : undefined
    const mcpView: ChatMcpView | undefined = mcp
      ? {
          servers: mcp.servers.value.map((server): ChatMcpServerView => ({
            ...server,
            icon: typeof server.icon === 'string' ? server.icon : undefined,
            loading: Boolean(server.loading || pendingMcpServerIds.value.has(server.id)),
          })),
          tools,
        }
      : undefined

    return {
      conversation: {
        items: runtime.value.conversations.value,
        activeId: active?.id ?? null,
        title: toValue(options.title) || active?.title,
        history: toValue(options.historyData),
      },
      bubble: { messages: active?.messages ?? [] },
      sender: {
        loading:
          active?.requestState === 'processing' ||
          (active?.requestState === 'paused' && typeof runtime.value.actions.abort === 'function'),
        disabled: Boolean(runtime.value.composer.disabled?.value),
        submitDisabled: Boolean(runtime.value.composer.submitDisabled?.value),
      },
      request: active
        ? {
            state: active.requestState,
            processingState: active.processingState,
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

  function isMcpToolPending(serverId: string, toolId: string) {
    return pendingMcpToolIds.value.get(serverId)?.has(toolId) ?? false
  }

  function setMcpToolPending(serverId: string, toolId: string, pending: boolean) {
    const next = new Map(pendingMcpToolIds.value)
    const toolIds = new Set(next.get(serverId) ?? [])

    if (pending) {
      toolIds.add(toolId)
      next.set(serverId, toolIds)
    } else {
      toolIds.delete(toolId)
      if (toolIds.size === 0) {
        next.delete(serverId)
      } else {
        next.set(serverId, toolIds)
      }
    }

    pendingMcpToolIds.value = next
  }

  async function withPendingMcpTool(serverId: string, toolId: string, task: () => Promise<void> | void) {
    const actionRuntime = runtime.value
    if (isMcpToolPending(serverId, toolId)) return
    setMcpToolPending(serverId, toolId, true)
    try {
      await task()
    } finally {
      if (runtime.value === actionRuntime) {
        setMcpToolPending(serverId, toolId, false)
      }
    }
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
    const actionRuntime = runtime.value
    if (target.value.has(id)) return
    setPendingId(target, id, true)
    try {
      await task()
    } finally {
      if (runtime.value === actionRuntime) {
        setPendingId(target, id, false)
      }
    }
  }

  async function selectModel(id: string | null) {
    const actionRuntime = runtime.value
    const model = actionRuntime.composer.model
    if (!model || model.selectedId.value === id || pendingModelSelecting.value) return
    pendingModelSelecting.value = true
    try {
      await runAction('select-model', { modelId: id }, () => model.select(id))
    } finally {
      if (runtime.value === actionRuntime) {
        pendingModelSelecting.value = false
      }
    }
  }

  async function setModelFeatureValue(change: ChatModelFeatureValueUpdate) {
    const model = runtime.value.composer.model
    const option = model?.options.value.find((item) => item.id === change.modelId)
    const field = getChatModelFields(option).find((item) => item.key === change.key)
    if (!model?.setFeatureValue || !option || option.disabled || !field || !canSetModelFieldValue(field, change.value))
      return
    if (model.selectedId.value === change.modelId && getChatModelFeatureValues(model)[change.key] === change.value)
      return
    const pendingKey = JSON.stringify([change.modelId, change.key])
    await withPending(pendingModelFields, pendingKey, () =>
      runAction('set-model-feature-value', change, () => model.setFeatureValue!({ ...change })),
    )
  }

  async function addMcpServer(id: string) {
    const mcp = runtime.value.composer.mcp
    if (mcp)
      await withPending(pendingMcpServerIds, id, () =>
        runAction('add-mcp-server', { serverId: id }, () => mcp.addServer(id)),
      )
  }

  async function removeMcpServer(id: string) {
    const mcp = runtime.value.composer.mcp
    if (mcp)
      await withPending(pendingMcpServerIds, id, () =>
        runAction('remove-mcp-server', { serverId: id }, () => mcp.removeServer(id)),
      )
  }

  async function setMcpServerEnabled(id: string, enabled: boolean) {
    const mcp = runtime.value.composer.mcp
    const server = mcp?.servers.value.find((item) => item.id === id)
    if (mcp && server && server.enabled !== enabled) {
      await withPending(pendingMcpServerIds, id, () =>
        runAction('set-mcp-server-enabled', { serverId: id, enabled }, () => mcp.setServerEnabled(id, enabled)),
      )
    }
  }

  async function setMcpToolEnabled(serverId: string, toolId: string, enabled: boolean) {
    const mcp = runtime.value.composer.mcp
    const tool = mcp?.tools.value[serverId]?.find((item) => item.id === toolId)
    if (mcp && tool && tool.enabled !== enabled) {
      await withPendingMcpTool(serverId, toolId, () =>
        runAction('set-mcp-tool-enabled', { serverId, toolId, enabled }, () =>
          mcp.setToolEnabled(serverId, toolId, enabled),
        ),
      )
    }
  }

  async function abort() {
    const actionRuntime = runtime.value
    const conversationId = actionRuntime.activeConversation.value?.id ?? null
    const pending = pendingAborts.get(actionRuntime) ?? new Set<string | null>()
    if (!actionRuntime.actions.abort || pending.has(conversationId)) return

    pending.add(conversationId)
    pendingAborts.set(actionRuntime, pending)
    try {
      await runAction('abort', undefined, () => actionRuntime.actions.abort?.())
    } finally {
      pending.delete(conversationId)
    }
  }

  async function clearActiveConversation() {
    input.invalidate()
    await runAction('clear-active-conversation', undefined, () => runtime.value.actions.clearActiveConversation())
  }

  async function createConversation() {
    input.invalidate()
    await runAction('create-conversation', undefined, () => runtime.value.actions.createConversation())
  }

  async function switchConversation(id: string) {
    if (activeConversation.value?.id !== id) {
      input.invalidate()
    }
    await runAction('switch-conversation', { conversationId: id }, () => runtime.value.actions.switchConversation(id))
  }

  async function deleteConversation(id: string) {
    if (activeConversation.value?.id === id) {
      input.invalidate()
    }
    await runAction('delete-conversation', { conversationId: id }, () => runtime.value.actions.deleteConversation(id))
  }

  return {
    data,
    inputValue: input.inputValue,
    setInputValue: input.setInputValue,
    setModelFeatureValue,
    send: (payload: ChatSendPayload) => input.send(payload),
    abort,
    clearActiveConversation,
    createConversation,
    switchConversation,
    renameConversation: (id: string, title: string) =>
      runAction('rename-conversation', { conversationId: id, title }, () =>
        runtime.value.actions.renameConversation(id, title),
      ),
    deleteConversation,
    selectModel,
    addMcpServer,
    removeMcpServer,
    setMcpServerEnabled,
    setMcpToolEnabled,
  }
}
