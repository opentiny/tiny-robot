import type { AskUserContent, ChatMessageContent, ToolCall } from '../index.type'

const QUESTION_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,99}$/
const MAX_HEADING_LENGTH = 200
const MAX_QUESTION_SUMMARY_LENGTH = 100
const MAX_QUESTION_LENGTH = 1000
const MAX_QUESTION_COUNT = 20
const MAX_OPTION_COUNT = 50
const MAX_OPTION_LABEL_LENGTH = 200
const MAX_OPTION_DESCRIPTION_LENGTH = 500

const hasOnlyKeys = (value: Record<string, unknown>, keys: readonly string[]) => {
  const allowed = new Set(keys)
  return Object.keys(value).every((key) => allowed.has(key))
}

const isAskUserQuestion = (value: unknown) => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const question = value as Record<string, unknown>
  if (
    !hasOnlyKeys(question, ['id', 'summary', 'question', 'options', 'multiSelect', 'allowCustom']) ||
    typeof question.id !== 'string' ||
    !QUESTION_ID_PATTERN.test(question.id) ||
    (question.summary !== undefined &&
      (typeof question.summary !== 'string' ||
        question.summary.trim().length === 0 ||
        question.summary.trim().length > MAX_QUESTION_SUMMARY_LENGTH)) ||
    typeof question.question !== 'string' ||
    question.question.trim().length === 0 ||
    question.question.trim().length > MAX_QUESTION_LENGTH
  ) {
    return false
  }

  if (question.options === undefined) {
    return question.multiSelect === undefined && question.allowCustom === undefined
  }

  const optionLabels = new Set<string>()
  const hasValidOptions =
    Array.isArray(question.options) &&
    question.options.length > 0 &&
    question.options.length <= MAX_OPTION_COUNT &&
    question.options.every((option) => {
      if (!option || typeof option !== 'object') {
        return false
      }
      const choice = option as Record<string, unknown>
      if (
        !hasOnlyKeys(choice, ['label', 'description']) ||
        typeof choice.label !== 'string' ||
        choice.label.trim().length === 0 ||
        choice.label.trim().length > MAX_OPTION_LABEL_LENGTH ||
        (choice.description !== undefined &&
          (typeof choice.description !== 'string' ||
            choice.description.trim().length === 0 ||
            choice.description.trim().length > MAX_OPTION_DESCRIPTION_LENGTH))
      ) {
        return false
      }

      const normalizedLabel = choice.label.trim()
      if (optionLabels.has(normalizedLabel)) {
        return false
      }
      optionLabels.add(normalizedLabel)
      return true
    })

  return hasValidOptions && typeof question.multiSelect === 'boolean' && typeof question.allowCustom === 'boolean'
}

export const isAskUserContent = (value: unknown): value is AskUserContent => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const content = value as Record<string, unknown>
  return (
    content.type === 'ask_user' &&
    hasOnlyKeys(content, ['type', 'id', 'heading', 'questions']) &&
    (content.id === undefined || (typeof content.id === 'string' && content.id.trim().length > 0)) &&
    (content.heading === undefined ||
      (typeof content.heading === 'string' &&
        content.heading.trim().length > 0 &&
        content.heading.trim().length <= MAX_HEADING_LENGTH)) &&
    Array.isArray(content.questions) &&
    content.questions.length > 0 &&
    content.questions.length <= MAX_QUESTION_COUNT &&
    content.questions.every(isAskUserQuestion) &&
    new Set((content.questions as Array<{ id: string }>).map((question) => question.id)).size ===
      content.questions.length
  )
}

export const getAskUserContentFromToolCall = (toolCall: ToolCall | undefined): AskUserContent | undefined => {
  if (
    toolCall?.function?.name !== 'ask_user' ||
    typeof toolCall.id !== 'string' ||
    typeof toolCall.function.arguments !== 'string'
  ) {
    return undefined
  }

  try {
    const argumentsValue: unknown = JSON.parse(toolCall.function.arguments)
    if (
      !argumentsValue ||
      typeof argumentsValue !== 'object' ||
      Array.isArray(argumentsValue) ||
      !hasOnlyKeys(argumentsValue as Record<string, unknown>, ['heading', 'questions'])
    ) {
      return undefined
    }

    const content = { ...(argumentsValue as Record<string, unknown>), type: 'ask_user', id: toolCall.id }
    return isAskUserContent(content) ? content : undefined
  } catch {
    return undefined
  }
}

export const resolveBubbleMessageContent = (message: {
  content?: ChatMessageContent
  tool_calls?: ToolCall[]
  state?: Record<string, unknown>
}): ChatMessageContent | undefined => {
  const askUserRuntime = message.state?.askUserRuntime as { toolCallId?: unknown } | undefined
  const toolCallStates = message.state?.toolCall as Record<string, { status?: unknown }> | undefined
  const askUserContents =
    message.tool_calls?.flatMap((toolCall) => {
      const toolCallStatus = toolCallStates?.[toolCall.id]?.status
      if (
        toolCallStatus !== 'awaiting-approval' ||
        (typeof askUserRuntime?.toolCallId === 'string' && askUserRuntime.toolCallId !== toolCall.id)
      ) {
        return []
      }

      const content = getAskUserContentFromToolCall(toolCall)
      return content ? [content] : []
    }) ?? []

  if (askUserContents.length === 0) {
    return message.content
  }

  if (Array.isArray(message.content) && message.content.some(isAskUserContent)) {
    return message.content
  }

  if (Array.isArray(message.content)) {
    return [...message.content, ...askUserContents]
  }

  if (typeof message.content === 'string' && message.content.length > 0) {
    return [{ type: 'text', text: message.content }, ...askUserContents]
  }

  return askUserContents
}

export const toUniqueCustomOptionValue = (questionId: string, optionLabels: Set<string>) => {
  let value = `__ask_user_custom_${questionId}__`
  while (optionLabels.has(value)) {
    value += '_'
  }
  return value
}

export const getAskUserInteractionId = (
  content: Pick<AskUserContent, 'id'>,
  contentIndex: number,
  messageId?: string,
) => {
  return content.id ?? `ask-user-${messageId ?? 'message'}-${contentIndex}`
}

export const hasUniqueAskUserIds = (value: unknown, messageId?: string): boolean => {
  if (!Array.isArray(value)) {
    return true
  }

  const askUserIds = value.flatMap((content, index) =>
    isAskUserContent(content) ? [getAskUserInteractionId(content, index, messageId)] : [],
  )
  return new Set(askUserIds).size === askUserIds.length
}
