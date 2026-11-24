import type { ChatMessage } from '../../message/types'
import type { SkillCandidate } from '../types'
import type { SessionSkillLoadItem, SkillProtocolMarker } from './types'

export const legacySkillPreloadMetadataKey = 'tinyRobotSkillPreload'

export const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined

export const isOptionalSkillSessionId = (value: unknown): value is string | undefined =>
  value === undefined || (typeof value === 'string' && value.trim().length > 0)

export const isSkillSessionMismatch = (sessionId: string | undefined, storedId: string | undefined): boolean =>
  sessionId !== undefined && storedId !== undefined && sessionId !== storedId

export const readSkillMarker = (message: { metadata?: object }): SkillProtocolMarker | undefined => {
  const marker = asRecord(asRecord(message.metadata)?.tinyRobotSkillContext)
  if (marker?.version !== 1 || !isOptionalSkillSessionId(marker.sessionId)) return undefined
  if (marker.kind !== 'catalog' && marker.kind !== 'load-result') return undefined
  if (marker.kind === 'load-result' && marker.source !== 'auto' && marker.source !== 'explicit') return undefined
  return marker as unknown as SkillProtocolMarker
}

export const isSkillContextMessage = (message: { role: string; content?: unknown; metadata?: object }): boolean => {
  const marker = readSkillMarker(message)
  return Boolean(
    marker &&
    ((marker.kind === 'catalog' && message.role === 'system') ||
      (marker.kind === 'load-result' && marker.source === 'explicit' && message.role === 'user')),
  )
}

export const readPreloadedSkillResult = (message: ChatMessage) => {
  if (message.role !== 'user' || isSkillContextMessage(message)) return undefined
  const skill = asRecord(message.metadata?.tinyRobotSkill)
  const record = asRecord(skill?.preload ?? message.metadata?.[legacySkillPreloadMetadataKey])
  if (record?.version !== 1 || !isOptionalSkillSessionId(record.sessionId)) return undefined
  const result = asRecord(record.result)
  if (!result || !Array.isArray(result.skills)) return undefined
  return { sessionId: record.sessionId, result }
}

const assertSession = (messages: readonly ChatMessage[], sessionId?: string) => {
  if (sessionId === undefined) return
  if (
    messages.some((message) => {
      const storedSessionId = readSkillMarker(message)?.sessionId ?? readPreloadedSkillResult(message)?.sessionId
      return isSkillSessionMismatch(sessionId, storedSessionId)
    })
  )
    throw new Error('Skill session does not match the restored messages')
}

export const createSkillCatalogMessage = (sessionId: string | undefined, candidates: SkillCandidate[]): ChatMessage => {
  const summaries = [
    ...new Map(candidates.map(({ name, description }) => [name, { name, description }])).values(),
  ].sort((a, b) => a.name.localeCompare(b.name))
  return {
    role: 'system',
    content: [
      'Available skills (discovery snapshot):',
      JSON.stringify(summaries),
      'When a skill is relevant, call load_skills to read its instructions. You may load more skills as needed.',
      'Reuse earlier instructions when sufficient. Use list_skill_files and read_skill_file for supporting resources.',
      'Availability is checked when tools run; handle unavailable skills using the returned result.',
    ].join('\n'),
    metadata: {
      tinyRobotSkillContext: {
        version: 1,
        kind: 'catalog',
        ...(sessionId === undefined ? {} : { sessionId }),
        candidates: summaries,
      },
    },
  }
}

export const readRequestedSkillNames = (message: ChatMessage): string[] => {
  if (message.role !== 'user' || isSkillContextMessage(message)) return []
  const request = asRecord(message.metadata?.tinyRobotSkill)
  if (!request || request.requestedSkillNames === undefined) return []
  const names = request.requestedSkillNames
  if (!Array.isArray(names) || names.some((name) => typeof name !== 'string' || !name.trim())) {
    throw new TypeError('Invalid skill request metadata: requestedSkillNames must be a string array')
  }
  return [...new Set(names as string[])]
}

export const readSessionCatalog = (
  messages: readonly ChatMessage[],
  sessionId?: string,
): SkillCandidate[] | undefined => {
  assertSession(messages, sessionId)
  for (const message of messages) {
    if (message.role !== 'system' || readSkillMarker(message)?.kind !== 'catalog') continue
    const marker = asRecord(message.metadata?.tinyRobotSkillContext)
    const candidates = marker?.candidates
    if (
      typeof message.content === 'string' &&
      message.content.trim().length > 0 &&
      message.content.includes(JSON.stringify(candidates)) &&
      Array.isArray(candidates) &&
      candidates.every((item) => {
        const value = asRecord(item)
        return typeof value?.name === 'string' && typeof value.description === 'string'
      })
    )
      return candidates as SkillCandidate[]
  }
}

const readCommittedResult = (message: ChatMessage, index: number, messages: readonly ChatMessage[]) => {
  const preload = readPreloadedSkillResult(message)
  if (preload) return preload.result

  const marker = readSkillMarker(message)
  if (marker?.kind !== 'load-result' || typeof message.content !== 'string') return undefined
  if (marker.source === 'explicit') {
    // Older histories store preloads as standalone user messages.
    if (message.role !== 'user') return undefined
  } else {
    if (message.role !== 'tool') return undefined
    const assistant = messages
      .slice(0, index)
      .findLast(
        (item) =>
          item.role === 'assistant' &&
          item.tool_calls?.some(
            (call) =>
              call.id === message.tool_call_id && call.type === 'function' && call.function.name === 'load_skills',
          ),
      )
    const state = asRecord(asRecord(assistant?.state?.toolCall)?.[message.tool_call_id])
    if (state?.status !== 'success') return undefined
  }
  try {
    return asRecord(JSON.parse(message.content))
  } catch {
    return undefined
  }
}

export const readCommittedSkillPayloads = (
  messages: readonly ChatMessage[],
  sessionId?: string,
): Extract<SessionSkillLoadItem, { status: 'loaded' }>[] => {
  assertSession(messages, sessionId)
  const payloads: Extract<SessionSkillLoadItem, { status: 'loaded' }>[] = []
  for (const [index, message] of messages.entries()) {
    const skills = readCommittedResult(message, index, messages)?.skills
    if (!Array.isArray(skills)) continue
    for (const item of skills) {
      const value = asRecord(item)
      if (value?.status !== 'loaded' || typeof value.name !== 'string' || typeof value.instructions !== 'string')
        continue
      if (
        value.resources !== undefined &&
        (!Array.isArray(value.resources) ||
          !value.resources.every((resource) => {
            const file = asRecord(resource)
            return typeof file?.path === 'string' && (file.kind === 'text' || file.kind === 'binary')
          }))
      )
        continue
      payloads.push(value as unknown as Extract<SessionSkillLoadItem, { status: 'loaded' }>)
    }
  }
  return payloads
}
