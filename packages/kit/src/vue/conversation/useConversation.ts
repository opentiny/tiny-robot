import { computed, ref } from 'vue'
import { ChatMessage, UseMessageOptions, UseMessageReturn } from '../message/types'
import { useMessage } from '../message/useMessage'
import { Conversation, ConversationInfo, UseConversationOptions, UseConversationReturn } from './types'

export const useConversation = (options: UseConversationOptions): UseConversationReturn => {
  /**
   * All conversations.
   */
  const conversations = ref<ConversationInfo[]>([])

  /**
   * Runtime engines cache, only keeps active and background-running conversations.
   */
  const engines = new Map<string, UseMessageReturn>()

  /**
   * Currently active conversation id.
   */
  const activeConversationId = ref<string | null>(null)

  /**
   * Load initial conversation list from storage (if provided).
   */
  if (options.storage) {
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
    const existing = engines.get(id)
    if (existing) return existing

    let initialMessages: ChatMessage[] =
      overrideOptions?.initialMessages ?? options.useMessageOptions.initialMessages ?? []

    if (options.storage) {
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

    engines.set(id, engine)

    return engine
  }

  const createConversation = (params?: {
    id?: string
    title?: string
    useMessageOptions?: UseMessageOptions
  }): Conversation => {
    const { id = crypto.randomUUID(), title, useMessageOptions } = params || {}

    const info: ConversationInfo = {
      id,
      title,
    }
    conversations.value.push(info)

    const engine = useMessage({
      ...options.useMessageOptions,
      ...useMessageOptions,
    })
    engines.set(id, engine)

    // Persist new conversation and its initial messages.
    options.storage?.saveConversation(info)
    options.storage?.saveMessages(id, engine.messages.value)

    activeConversationId.value = id

    return {
      ...info,
      engine,
    }
  }

  /**
   * Get current active conversation object.
   */
  const activeConversation = computed<Conversation | null>(() => {
    const id = activeConversationId.value
    if (!id) return null

    const info = conversations.value.find((c) => c.id === id)
    if (!info) return null

    const engine = engines.get(id)
    if (!engine) return null

    return {
      ...info,
      engine,
    }
  })

  /**
   * Switch active conversation by id.
   */
  const switchConversation = async (id: string) => {
    activeConversationId.value = id

    // Ensure active conversation has an engine (lazy creation from storage).
    await ensureEngine(id)

    // Cleanup engines that are not active and not processing.
    // This helps to release memory for engines that are no longer in use.
    engines.forEach((engine, key) => {
      if (key === id) return

      const isProcessing = engine.isProcessing?.value
      if (!isProcessing) {
        engines.delete(key)
      }
    })
  }

  /**
   * Close a conversation and optionally fall back to another one.
   */
  const deleteConversation = (id: string) => {
    const idx = conversations.value.findIndex((c) => c.id === id)
    if (idx === -1) return

    // Abort running request when closing this conversation.
    const engine = engines.get(id)
    engine?.abortRequest()

    engines.delete(id)

    conversations.value.splice(idx, 1)

    options.storage?.deleteConversation?.(id)

    if (activeConversationId.value === id) {
      activeConversationId.value = conversations.value[0]?.id ?? null
    }
  }

  /**
   * Update conversation title and persist it via storage.
   */
  const updateConversationTitle = (id: string, title?: string) => {
    const info = conversations.value.find((c) => c.id === id)
    if (!info) return

    info.title = title
    options.storage?.saveConversation(info)
  }

  /**
   * Persist messages for a given conversation using current engine state.
   */
  const saveConversationMessages = (id: string) => {
    if (!options.storage) return
    const engine = engines.get(id)
    if (!engine) return

    options.storage.saveMessages(id, engine.messages.value)
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
  const abortActiveRequest = () => {
    activeConversation.value?.engine.abortRequest()
  }

  return {
    conversations,
    activeConversationId,
    activeConversation,

    createConversation,
    switchConversation,
    deleteConversation,
    updateConversationTitle,
    saveConversationMessages,

    sendMessage,
    abortActiveRequest,
  }
}
