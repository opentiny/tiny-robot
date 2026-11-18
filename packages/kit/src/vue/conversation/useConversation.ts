import { computed, effectScope, onScopeDispose, ref, watch, WatchStopHandle, type EffectScope } from 'vue'
import { localStorageStrategyFactory } from '../../storage/factories'
import { ChatMessage } from '../../types'
import { UseMessageOptions, UseMessagePlugin, UseMessageReturn } from '../message/types'
import { useOwnedMessage } from '../message/useMessage'
import { Conversation, ConversationInfo, UseConversationOptions, UseConversationReturn } from './types'
import { useThrottleFn } from './useThrottleFn'

export const useConversation = (
  options: UseConversationOptions,
): UseConversationReturn & { dispose(): Promise<void> } => {
  let disposed = false
  let closing: Promise<void> | undefined
  const assertActive = () => {
    if (disposed) throw new Error('Conversation has been disposed.')
  }
  const engineScopes = new Map<string, EffectScope>()
  const pendingTurns = new Set<Promise<unknown>>()
  const activeTurns = new Map<string, number>()
  const trackTurn = <T>(id: string, operation: () => Promise<T>): Promise<T> => {
    assertActive()
    const pending = operation()
    activeTurns.set(id, (activeTurns.get(id) ?? 0) + 1)
    pendingTurns.add(pending)
    const done = () => {
      pendingTurns.delete(pending)
      const remaining = (activeTurns.get(id) ?? 1) - 1
      if (remaining) activeTurns.set(id, remaining)
      else activeTurns.delete(id)
    }
    void pending.then(done, done)
    return pending
  }
  // 如果没有提供存储策略，使用默认的 LocalStorage 策略
  const storage = options.storage || localStorageStrategyFactory()
  /**
   * All conversations.
   */
  const conversations = ref<ConversationInfo[]>([])

  /**
   * Runtime engines cache, only keeps active and background-running conversations.
   */
  const workingEngines = new Map<string, UseMessageReturn>()

  /**
   * Watch stop handles for each engine's messages, used for auto-save.
   */
  const watchers = new Map<string, WatchStopHandle>()

  /**
   * Serialize persistence per conversation so saves and deletion cannot
   * complete out of order.
   */
  const persistenceQueues = new Map<string, Promise<void>>()

  const enqueuePersistence = (id: string, operation: () => Promise<void>): Promise<void> => {
    const previousOperation = persistenceQueues.get(id)
    const currentOperation = previousOperation ? previousOperation.catch(() => undefined).then(operation) : operation()
    persistenceQueues.set(id, currentOperation)

    const clearCompletedOperation = () => {
      if (persistenceQueues.get(id) === currentOperation) {
        persistenceQueues.delete(id)
      }
    }
    void currentOperation.then(clearCompletedOperation, clearCompletedOperation)

    return currentOperation
  }

  /**
   * Currently active conversation id.
   */
  const activeConversationId = ref<string | null>(null)

  /**
   * Get current active conversation object.
   * Computed from activeConversationId, automatically syncs with state changes.
   */
  const activeConversation = computed<Conversation | null>(() => {
    const id = activeConversationId.value
    if (!id) return null

    const info = conversations.value.find((c) => c.id === id)
    if (!info) return null

    const engine = workingEngines.get(id)
    if (!engine) return null

    return { ...info, engine }
  })

  /**
   * 保存指定会话的消息到存储层。
   *
   * 注意：此函数只会对已加载到内存中的会话生效。如果会话尚未被打开或切换过，
   * 其消息引擎不在内存中，调用此函数不会有任何效果。
   *
   * @param id - 会话 ID，如果不提供则使用当前活跃会话
   */
  const saveConversationMessages = (id: string, messages: ChatMessage[]): Promise<void> => {
    return enqueuePersistence(id, async () => {
      if (!storage?.saveMessages) return

      const conversation = conversations.value.find((item) => item.id === id)
      if (!conversation) return

      conversation.updatedAt = Date.now()
      await storage.saveConversation?.(conversation)
      await storage.saveMessages(id, messages)
    })
  }

  const saveMessages = async (id?: string): Promise<void> => {
    assertActive()
    if (!storage?.saveMessages) return
    const conversationId = id || activeConversationId.value

    if (!conversationId) return

    const engine = workingEngines.get(conversationId)
    if (!engine) return

    await saveConversationMessages(conversationId, engine.messages.value)
  }

  /**
   * 为引擎设置自动保存监听器
   */
  const setupAutoSave = (id: string, engine: UseMessageReturn) => {
    if (!options.autoSaveMessages || !storage?.saveMessages) return

    // 停止已存在的监听器（如果有）
    const existingWatcher = watchers.get(id)
    if (existingWatcher) {
      existingWatcher()
    }

    // 创建节流保存函数
    const throttleTime = options.autoSaveThrottle ?? 1000
    const throttledSave = useThrottleFn(
      () => {
        void saveMessages(id).catch((error) => console.error('[useConversation] save messages failed:', error))
      },
      throttleTime,
      true, // trailing: 在节流周期结束时执行
      true, // leading: 在节流周期开始时执行
    )

    // 监听消息变化并自动保存
    const stopMessageWatcher = watch(engine.messages, throttledSave, { deep: true })
    watchers.set(id, () => {
      stopMessageWatcher()
      throttledSave.cancel()
    })
  }

  /**
   * 停止引擎的自动保存监听器
   */
  const stopAutoSave = (id: string) => {
    const watcher = watchers.get(id)
    if (watcher) {
      watcher()
      watchers.delete(id)
    }
  }

  const createConversationEngine = (id: string, messageOptions: UseMessageOptions): UseMessageReturn => {
    const plugins = messageOptions.plugins ?? []
    const pausePersistencePlugin: UseMessagePlugin = {
      onTurnPause: (context) => saveConversationMessages(id, context.getState().messages),
    }

    const scope = effectScope(true)
    const lifetime = new AbortController()
    try {
      const engine = scope.run(() => {
        onScopeDispose(() => lifetime.abort())
        return useOwnedMessage(
          {
            ...messageOptions,
            plugins: options.autoSaveMessages ? [pausePersistencePlugin, ...plugins] : plugins,
          },
          lifetime.signal,
        )
      })!
      engineScopes.get(id)?.stop()
      engineScopes.set(id, scope)
      return {
        ...engine,
        send: (...args) => trackTurn(id, () => engine.send(...args)),
        sendMessage: (...args) => trackTurn(id, () => engine.sendMessage(...args)),
        dispatchCommand: (...args) => trackTurn(id, () => engine.dispatchCommand(...args)),
      }
    } catch (error) {
      scope.stop()
      throw error
    }
  }

  /**
   * Load initial conversation list from storage (if provided).
   */
  if (storage?.loadConversations) {
    Promise.resolve(storage.loadConversations())
      .then((list) => {
        if (disposed) return
        // 存储为空时仍返回加载期间创建的内存会话
        if (!list?.length) {
          return conversations.value
        }

        // 如果当前内存中的会话列表为空，直接使用加载的列表
        if (conversations.value.length === 0) {
          conversations.value = list
          return conversations.value
        }

        // 合并策略：内存数据优先于存储数据
        // 1. 保留内存中已存在的会话（不会被存储数据覆盖）
        // 2. 添加存储中存在但内存中不存在的会话
        // 这样可以避免覆盖在 loadConversations 完成之前通过 createConversation 创建的会话
        const merged = new Map(conversations.value.map((c) => [c.id, c]))
        list.forEach((c) => {
          if (!merged.has(c.id)) {
            merged.set(c.id, c)
          }
        })
        conversations.value = Array.from(merged.values())

        // 确保 activeConversation 对应的会话在合并后的列表中
        // 如果 activeConversationId 存在但对应的会话不在列表中，说明可能被意外删除
        // 这种情况下，activeConversation 会自动变为 null（通过 computed 属性）
        return conversations.value
      })
      .then((loadedList) => {
        if (!disposed && loadedList) options.onLoad?.(loadedList)
      })
      .catch((error) => {
        console.error('[useConversation] loadConversations failed:', error)
      })
  }

  /**
   * Ensure an engine instance exists for the given conversation id.
   * If not, it will be created using stored messages (when storage is available).
   */
  const ensureEngine = async (id: string, overrideOptions?: UseMessageOptions): Promise<UseMessageReturn> => {
    assertActive()
    const existing = workingEngines.get(id)
    if (existing) return existing

    let initialMessages: ChatMessage[] =
      overrideOptions?.initialMessages ?? options.useMessageOptions.initialMessages ?? []

    if (storage?.loadMessages) {
      try {
        initialMessages = await storage.loadMessages(id)
      } catch (error) {
        console.error('[useConversation] loadMessages failed:', error)
      }
    }

    assertActive()
    const loadedEngine = workingEngines.get(id)
    if (loadedEngine) return loadedEngine
    const engine = createConversationEngine(id, {
      ...options.useMessageOptions,
      ...overrideOptions,
      initialMessages,
    })

    workingEngines.set(id, engine)
    setupAutoSave(id, engine)

    return engine
  }

  /**
   * 生成唯一ID
   */
  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
  }

  const createConversation = (params?: {
    id?: string
    title?: string
    metadata?: Record<string, unknown>
    useMessageOptions?: Partial<UseMessageOptions>
  }): Conversation => {
    assertActive()
    const { id = generateId(), title, metadata, useMessageOptions } = params || {}

    const now = Date.now()
    const info: ConversationInfo = {
      id,
      title,
      createdAt: now,
      updatedAt: now,
      metadata,
    }
    conversations.value.unshift(info)

    const engine = createConversationEngine(id, {
      ...options.useMessageOptions,
      ...useMessageOptions,
    })
    workingEngines.set(id, engine)
    setupAutoSave(id, engine)

    // Persist new conversation and its initial messages.
    void saveConversationMessages(id, engine.messages.value).catch((error) => {
      console.error('[useConversation] save initial messages failed:', error)
    })

    activeConversationId.value = id

    return activeConversation.value!
  }

  const clearInactiveEngines = (cleanupOptions?: { excludeId?: string }) => {
    const { excludeId } = cleanupOptions || {}

    workingEngines.forEach((engine, key) => {
      if (excludeId && key === excludeId) return

      if (engine.canStartTurn.value && !activeTurns.has(key)) {
        // Preserve the latest auto-saved state before cancelling its trailing timer.
        if (options.autoSaveMessages)
          void saveMessages(key).catch((error) => console.error('[useConversation] save messages failed:', error))
        stopAutoSave(key)
        engineScopes.get(key)?.stop()
        engineScopes.delete(key)
        workingEngines.delete(key)
      }
    })
  }

  /**
   * Switch active conversation by id.
   */
  const switchConversation = async (id: string): Promise<Conversation | null> => {
    assertActive()
    if (!id) return null

    if (activeConversationId.value === id) return activeConversation.value

    const conversation = conversations.value.find((c) => c.id === id)
    if (!conversation) return null

    // Ensure active conversation has an engine (lazy creation from storage).
    await ensureEngine(id)
    assertActive()

    // Cleanup engines that are not active and not processing.
    // This helps to release memory for engines that are no longer in use.
    clearInactiveEngines({ excludeId: id })

    activeConversationId.value = id

    return activeConversation.value
  }

  /**
   * Close a conversation and optionally fall back to another one.
   */
  const deleteConversation = async (id: string) => {
    assertActive()
    const idx = conversations.value.findIndex((c) => c.id === id)
    if (idx === -1) return

    // Abort running request when closing this conversation.
    const engine = workingEngines.get(id)
    await engine?.abortRequest()
    assertActive()

    // Stop auto-save watcher before removing engine
    stopAutoSave(id)
    engineScopes.get(id)?.stop()
    engineScopes.delete(id)
    workingEngines.delete(id)

    conversations.value.splice(idx, 1)

    // Clear active state before waiting for persistence so consumers never
    // observe an active id whose conversation has already been removed.
    if (activeConversationId.value === id) {
      activeConversationId.value = null
      clearInactiveEngines()
    }

    // Serialize deletion with both pending and later saves for this id. A new
    // conversation with the same id can then persist only after deletion.
    const deletion = enqueuePersistence(id, async () => {
      await storage?.deleteConversation?.(id)
    })

    await deletion
  }

  /**
   * Clear all conversations and their messages.
   */
  const clear = () => {
    assertActive()
    const ids = conversations.value.map((c) => c.id)
    ids.forEach((id) => {
      storage?.deleteConversation?.(id)
    })
    workingEngines.forEach((engine, id) => {
      const scope = engineScopes.get(id)
      void engine
        .abortRequest()
        .finally(() => scope?.stop())
        .catch((error) => {
          console.error('[useConversation] abort failed:', error)
        })
    })
    watchers.forEach((watcher) => {
      watcher()
    })
    conversations.value = []
    workingEngines.clear()
    watchers.clear()
    engineScopes.clear()
    activeConversationId.value = null
  }

  /**
   * Update conversation title and persist it via storage.
   */
  const updateConversationTitle = (id: string, title?: string) => {
    assertActive()
    const info = conversations.value.find((c) => c.id === id)
    if (!info) return

    info.title = title
    info.updatedAt = Date.now()
    void enqueuePersistence(id, async () => {
      await storage?.saveConversation?.(info)
    }).catch((error) => {
      console.error('[useConversation] update title failed:', error)
    })
  }

  /**
   * Convenience method: send message to active conversation.
   */
  const sendMessage = async (content: string): Promise<void> => {
    assertActive()
    return activeConversation.value?.engine.sendMessage(content) ?? Promise.resolve()
  }

  /**
   * Convenience method: abort request of active conversation.
   */
  const abortActiveRequest = async () => {
    await activeConversation.value?.engine.abortRequest()
  }

  const dispose = (): Promise<void> => {
    if (closing) return closing
    disposed = true
    watchers.forEach((stop) => stop())
    watchers.clear()
    const engines = [...workingEngines]
    closing = Promise.resolve().then(async () => {
      const failures: unknown[] = []
      try {
        const stopped = await Promise.allSettled(engines.map(([, engine]) => engine.abortRequest()))
        stopped.forEach((result) => {
          if (result.status === 'rejected') failures.push(result.reason)
        })
        // A turn can still be running asynchronous plugin hooks after its request state changes.
        await Promise.allSettled([...pendingTurns])
        engineScopes.forEach((scope) => scope.stop())
        if (options.autoSaveMessages) {
          const saved = await Promise.allSettled(
            engines.map(([id, engine]) => saveConversationMessages(id, engine.messages.value)),
          )
          saved.forEach((result) => {
            if (result.status === 'rejected') failures.push(result.reason)
          })
        }
        const pending = await Promise.allSettled([...persistenceQueues.values()])
        pending.forEach((result) => {
          if (result.status === 'rejected') failures.push(result.reason)
        })
      } finally {
        engineScopes.forEach((scope) => scope.stop())
        engineScopes.clear()
      }
      if (failures.length) throw Object.assign(new Error('Conversation disposal failed.'), { errors: failures })
    })
    return closing
  }

  return {
    dispose,
    conversations,
    activeConversationId,
    activeConversation,

    createConversation,
    switchConversation,
    deleteConversation,
    clear,
    updateConversationTitle,
    saveMessages,

    sendMessage,
    abortActiveRequest,
  }
}
