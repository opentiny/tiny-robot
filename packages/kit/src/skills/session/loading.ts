import type { BasePluginContext, ChatMessage } from '../../message/types'
import type { SessionSkillPluginOptions } from '../../message/plugins/skillPlugin.types'
import { makeAbortable } from '../../message/utils'
import { readCommittedSkillPayloads } from './protocol'
import type { SessionSkillLoadItem, SessionSkillLoadResult, SkillResourceSummary } from './types'

export const summarizeSkillResources = (resources: SkillResourceSummary[]): SkillResourceSummary[] =>
  resources.map(({ path, kind, mimeType, size, lastModified }) => ({ path, kind, mimeType, size, lastModified }))

const contentKey = (item: Extract<SessionSkillLoadItem, { status: 'loaded' }>) =>
  JSON.stringify({
    name: item.name,
    instructions: item.instructions,
    resources: item.resources?.length ? summarizeSkillResources(item.resources) : undefined,
  })

const getDeduplicationHistory = (context: BasePluginContext, replacingPreloads?: ReadonlySet<ChatMessage>) => {
  if (!replacingPreloads?.size) return context.getState().messages

  let history: ChatMessage[] = []
  context.mutate('messages', (draft, skipNotify) => {
    // The Vue adapter clones getState() messages, so compare the live message identities.
    skipNotify()
    history = draft.messages.filter((message) => !replacingPreloads.has(message))
  })
  return history
}

export const createSessionSkillLoader = (
  options: Pick<SessionSkillPluginOptions, 'sessionId' | 'deduplication' | 'getSkillByName'>,
) => ({
  async load(
    names: string[],
    context: BasePluginContext,
    replacingPreloads?: ReadonlySet<ChatMessage>,
  ): Promise<SessionSkillLoadResult> {
    context.abortSignal.throwIfAborted()
    if (!Array.isArray(names) || !names.length || names.some((name) => typeof name !== 'string' || !name.trim())) {
      return {
        skills: [],
        error: { code: 'invalid_skill_names', message: 'Provide a non-empty array of skill names.' },
      }
    }
    const skills = await Promise.all(
      [...new Set(names)].map(async (name): Promise<SessionSkillLoadItem> => {
        try {
          const definition = await makeAbortable(
            Promise.resolve(options.getSkillByName(name, context)),
            context.abortSignal,
          )
          context.abortSignal.throwIfAborted()
          if (!definition) return { name, status: 'failed', error: { code: 'skill_unavailable' } }
          if (definition.name !== name || typeof definition.instructions !== 'string')
            throw new Error('Invalid skill definition')
          const item: Extract<SessionSkillLoadItem, { status: 'loaded' }> = {
            name,
            status: 'loaded',
            instructions: definition.instructions,
            ...(definition.resources?.length ? { resources: summarizeSkillResources(definition.resources) } : {}),
          }
          if (
            options.deduplication === 'context' &&
            readCommittedSkillPayloads(getDeduplicationHistory(context, replacingPreloads), options.sessionId).some(
              (previous) => contentKey(previous) === contentKey(item),
            )
          ) {
            return {
              name,
              status: 'already_loaded',
              message: 'Instructions are already in the current conversation. Use the previously loaded content.',
            }
          }
          return item
        } catch (error) {
          if (context.abortSignal.aborted) throw error
          return {
            name,
            status: 'failed',
            error: { code: 'skill_load_failed', message: error instanceof Error ? error.message : String(error) },
          }
        }
      }),
    )
    return { skills }
  },
})
