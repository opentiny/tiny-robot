import type { BasePluginContext, ChatMessage } from '../../message/types'
import {
  asRecord,
  isSkillSessionMismatch,
  legacySkillPreloadMetadataKey,
  readPreloadedSkillResult,
  readRequestedSkillNames,
} from './protocol'
import type { SessionSkillLoadResult } from './types'

export const insertInitialSkillCatalog = (context: BasePluginContext, message: ChatMessage): void => {
  const created = context.createMessage(message)
  context.mutate('messages', (draft) => {
    const index = draft.messages.findIndex((item) => item.role !== 'system')
    draft.messages.splice(index < 0 ? draft.messages.length : index, 0, created)
  })
}

export const attachSkillPreload = (
  context: BasePluginContext,
  message: ChatMessage,
  sessionId: string | undefined,
  result: SessionSkillLoadResult,
): void => {
  context.mutate('messages', (draft, skipNotify) => {
    const index = draft.messages.lastIndexOf(message)
    if (index < 0) {
      skipNotify()
      return
    }
    const { [legacySkillPreloadMetadataKey]: _legacyPreload, ...metadata } = message.metadata ?? {}
    const updated = context.createMessage({
      ...message,
      metadata: {
        ...metadata,
        tinyRobotSkill: {
          ...asRecord(metadata.tinyRobotSkill),
          preload: { version: 1, ...(sessionId === undefined ? {} : { sessionId }), result },
        },
      },
    })
    draft.messages[index] = updated
    const turnIndex = context.currentTurn.lastIndexOf(message)
    if (turnIndex >= 0) context.currentTurn[turnIndex] = updated
  })
}

const projectRequestedSkills = (message: ChatMessage): ChatMessage => {
  if (message.role !== 'user') return message

  let names: string[]
  try {
    names = readRequestedSkillNames(message)
  } catch {
    // New mentions are validated at turn start. Ignore invalid metadata left in saved history.
    return message
  }
  if (names.length === 0) return message

  const hint = `User-requested Skills: ${JSON.stringify(names)}.`
  return {
    ...message,
    content:
      typeof message.content === 'string'
        ? `${message.content}\n\n${hint}`
        : [...message.content, { type: 'text', text: hint }],
  }
}

export const projectSkillMessages = (
  messages: ChatMessage[],
  sessionId: string | undefined,
  includeRequestedNames: boolean,
) =>
  messages.flatMap((message): ChatMessage[] => {
    const skill = asRecord(message.metadata?.tinyRobotSkill)
    const hasNestedPreload = skill && 'preload' in skill
    if (!message.metadata || (!hasNestedPreload && !(legacySkillPreloadMetadataKey in message.metadata))) {
      return [includeRequestedNames ? projectRequestedSkills(message) : message]
    }

    // Keep the private persistence record off the wire even when other metadata is forwarded.
    const { [legacySkillPreloadMetadataKey]: _legacyPreload, ...metadata } = message.metadata
    if (hasNestedPreload) {
      const { preload: _preload, ...requestSkill } = skill
      metadata.tinyRobotSkill = requestSkill
    }
    const requestMessage = { ...message, metadata }
    const preload = readPreloadedSkillResult(message)
    if (preload && !isSkillSessionMismatch(sessionId, preload.sessionId)) {
      return [requestMessage, { role: 'user', content: JSON.stringify(preload.result) }]
    }
    return [includeRequestedNames ? projectRequestedSkills(requestMessage) : requestMessage]
  })
