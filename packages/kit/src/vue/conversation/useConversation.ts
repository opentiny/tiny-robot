import { computed, ref, watch, WatchStopHandle } from 'vue'
import { ChatMessage, UseMessageOptions, UseMessageReturn } from '../message/types'
import { useMessage } from '../message/useMessage'
import { Conversation, ConversationInfo, UseConversationOptions, UseConversationReturn } from './types'
import { useThrottleFn } from './useThrottleFn'

export const useConversation = (options: UseConversationOptions): UseConversationReturn => {
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
  const saveMessages = (id?: string) => {
    if (!options.storage?.saveMessages) return
    const conversationId = id || activeConversationId.value

    const conversation = conversations.value.find((c) => c.id === conversationId)
    if (!conversation) return

    conversation.updatedAt = Date.now()
    options.storage?.saveConversation?.(conversation)

    const engine = workingEngines.get(conversation.id)
    if (!engine) return

    options.storage.saveMessages(conversation.id, engine.messages.value)
  }

  /**
   * 为引擎设置自动保存监听器
   */
  const setupAutoSave = (id: string, engine: UseMessageReturn) => {
    if (!options.autoSaveMessages || !options.storage?.saveMessages) return

    // 停止已存在的监听器（如果有）
    const existingWatcher = watchers.get(id)
    if (existingWatcher) {
      existingWatcher()
    }

    // 创建节流保存函数
    const throttleTime = options.autoSaveThrottle ?? 1000
    const throttledSave = useThrottleFn(
      () => {
        saveMessages(id)
      },
      throttleTime,
      true, // trailing: 在节流周期结束时执行
      true, // leading: 在节流周期开始时执行
    )

    // 监听消息变化并自动保存
    const stopHandle = watch(engine.messages, throttledSave, { deep: true })

    watchers.set(id, stopHandle)
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

  /**
   * Load initial conversation list from storage (if provided).
   */
  if (options.storage?.loadConversations) {
    Promise.resolve(options.storage.loadConversations())
      .then((list) => {
        conversations.value = list
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
    const existing = workingEngines.get(id)
    if (existing) return existing

    let initialMessages: ChatMessage[] =
      overrideOptions?.initialMessages ?? options.useMessageOptions.initialMessages ?? []

    if (options.storage?.loadMessages) {
      try {
        initialMessages = await options.storage.loadMessages(id)
      } catch (error) {
        console.error('[useConversation] loadMessages failed:', error)
      }
    }

    const engine = useMessage({
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

    const engine = useMessage({
      ...options.useMessageOptions,
      ...useMessageOptions,
    })
    workingEngines.set(id, engine)
    setupAutoSave(id, engine)

    // Persist new conversation and its initial messages.
    options.storage?.saveConversation?.(info)
    options.storage?.saveMessages?.(id, engine.messages.value)

    activeConversationId.value = id

    return activeConversation.value!
  }

  /**
   * Switch active conversation by id.
   */
  const switchConversation = async (id: string): Promise<Conversation | null> => {
    if (!id) return null

    if (activeConversationId.value === id) return activeConversation.value

    const conversation = conversations.value.find((c) => c.id === id)
    if (!conversation) return null

    // Ensure active conversation has an engine (lazy creation from storage).
    await ensureEngine(id)

    // Cleanup engines that are not active and not processing.
    // This helps to release memory for engines that are no longer in use.
    workingEngines.forEach((engine, key) => {
      if (key === id) return

      const isProcessing = engine.isProcessing?.value
      if (!isProcessing) {
        stopAutoSave(key)
        workingEngines.delete(key)
      }
    })

    activeConversationId.value = id

    return activeConversation.value
  }

  /**
   * Close a conversation and optionally fall back to another one.
   */
  const deleteConversation = async (id: string) => {
    const idx = conversations.value.findIndex((c) => c.id === id)
    if (idx === -1) return

    // Abort running request when closing this conversation.
    const engine = workingEngines.get(id)
    await engine?.abortRequest()

    // Stop auto-save watcher before removing engine
    stopAutoSave(id)
    workingEngines.delete(id)

    conversations.value.splice(idx, 1)

    options.storage?.deleteConversation?.(id)

    // If deleting the active conversation, switch to another or clear
    if (activeConversationId.value === id) {
      const nextConversation = conversations.value[0]
      if (nextConversation) {
        await switchConversation(nextConversation.id)
      } else {
        activeConversationId.value = null
      }
    }
  }

  /**
   * Update conversation title and persist it via storage.
   */
  const updateConversationTitle = (id: string, title?: string) => {
    const info = conversations.value.find((c) => c.id === id)
    if (!info) return

    info.title = title
    info.updatedAt = Date.now()
    options.storage?.saveConversation?.(info)
  }

  /**
   * Convenience method: send message to active conversation.
   */
  const sendMessage = (content: string) => {
    activeConversation.value?.engine.sendMessage(content)
  }

  /**
   * Convenience method: abort request of active conversation.
   */
  const abortActiveRequest = async () => {
    await activeConversation.value?.engine.abortRequest()
  }

  return {
    conversations,
    activeConversationId,
    activeConversation,

    createConversation,
    switchConversation,
    deleteConversation,
    updateConversationTitle,
    saveMessages,

    sendMessage,
    abortActiveRequest,
  }
}
