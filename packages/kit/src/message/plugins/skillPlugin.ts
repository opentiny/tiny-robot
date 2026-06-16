import { compileSkillInstructions } from '../../skills/instructions'
import {
  createSkillResourceInstructionsMessage,
  createSkillResourceRuntimeTools,
} from '../../skills/capabilities/resources'
import {
  createSkillSelectionInstructionsMessage,
  createSkillSelectionRuntimeTools,
} from '../../skills/capabilities/selection'
import type { SkillCandidate, SkillDefinition } from '../../skills/types'
import type { MaybePromise } from '../../types'
import { getUniqueStringArray } from '../../utils'
import type { BasePluginContext, ChatMessage, MessageEnginePlugin } from '../types'
import type { RuntimeTool, ToolProvider } from './toolPlugin'

type ManualSkillSelection =
  | {
      mode: 'manual'
      /**
       * Inline skill definitions.
       */
      skills: SkillDefinition[]
      skillNames?: never
    }
  | {
      mode: 'manual'
      /**
       * Final skill names to resolve via getSkillByName.
       */
      skillNames: string[]
      skills?: never
    }

interface AutoSkillSelection {
  mode: 'auto'
  /**
   * User-preferred skill names as an automatic selection bias.
   * These are not final selected skills; the selector still decides the final skill set.
   */
  preferredSkillNames?: string[]
  /**
   * Maximum number of skills the selector may enable.
   */
  maxSelectedSkills?: number
}

interface NoSkillSelection {
  mode: 'none'
}

export type SkillSelection = ManualSkillSelection | AutoSkillSelection | NoSkillSelection

type SkillSelectionStatus =
  | {
      mode: 'manual' | 'none'
      phase: 'ready'
    }
  | {
      mode: 'auto'
      phase: 'selecting'
      candidates: SkillCandidate[]
      preferredSkillNames?: string[]
    }
  | {
      mode: 'auto'
      phase: 'ready'
      candidates: SkillCandidate[]
      preferredSkillNames?: string[]
    }

/**
 * Current request skill context.
 *
 * This context is written to customContext.__tiny_robot_skill so hooks and callbacks
 * can read the same request-level skill state.
 */
export interface SkillRequestContext {
  /**
   * Successfully enabled full skill definitions.
   */
  skills: SkillDefinition[]
  /**
   * Successfully enabled skill names.
   */
  skillNames: string[]
  /**
   * Skill names requested by manual selection or auto select_skills.
   */
  requestedSkillNames: string[]
  /**
   * Requested skill names that could not be resolved into enabled skills.
   */
  unresolvedSkillNames: string[]
  runtimeTools: RuntimeTool[]
  selection: SkillSelectionStatus
}

interface SkillResolver {
  /**
   * Resolve full definition by name.
   */
  getSkillByName(name: string, context: BasePluginContext): MaybePromise<SkillDefinition | undefined>
}

interface SkillCandidateProvider {
  /**
   * Returns candidate summaries for automatic selection.
   */
  getSkillCandidates(context: BasePluginContext): MaybePromise<SkillCandidate[]>
}

type ResolverRequiredSelection =
  | AutoSkillSelection
  | Extract<
      ManualSkillSelection,
      {
        skillNames: string[]
      }
    >

type RequireResolver<T extends SkillSelection> =
  Extract<T, ResolverRequiredSelection> extends never ? Partial<SkillResolver> : SkillResolver

type RequireCandidateProvider<T extends SkillSelection> =
  Extract<T, AutoSkillSelection> extends never ? Partial<SkillCandidateProvider> : SkillCandidateProvider

interface SkillPluginHooks extends MessageEnginePlugin {
  /**
   * Called after skills are resolved into their full definitions.
   */
  onSkillsResolved?: (skillContext: SkillRequestContext, context: BasePluginContext) => MaybePromise<void>
  /**
   * Called when the automatic selector chooses skill names.
   */
  onSkillSelectionResolved?: (
    event: {
      mode: 'auto'
      candidates: SkillCandidate[]
      preferredSkillNames?: string[]
      requestedSkillNames: string[]
    },
    context: BasePluginContext,
  ) => MaybePromise<void>
}

type SelectionInput<T extends SkillSelection> = T | ((context: BasePluginContext) => MaybePromise<T>)

export type SkillPluginOptions<S extends SkillSelection = SkillSelection> = SkillPluginHooks &
  RequireResolver<S> &
  RequireCandidateProvider<S> & {
    selection: SelectionInput<S>
  }

const skillPluginContextKey = '__tiny_robot_skill'

const appendSystemInstructions = (messages: ChatMessage[], instructions: ChatMessage[]): ChatMessage[] => {
  if (instructions.length === 0) {
    return messages
  }

  const content = instructions
    .map((message) => (typeof message.content === 'string' ? message.content : ''))
    .filter((item) => item.length > 0)
    .join('\n\n')

  if (!content) {
    return messages
  }

  const [firstMessage, ...restMessages] = messages
  if (firstMessage?.role === 'system' && typeof firstMessage.content === 'string') {
    return [
      {
        ...firstMessage,
        content: [firstMessage.content, content].filter((item) => item.trim().length > 0).join('\n\n'),
      },
      ...restMessages,
    ]
  }

  const systemMessage: ChatMessage = {
    role: 'system',
    content,
  }

  return [systemMessage, ...messages]
}

const normalizeCandidates = (candidates: SkillCandidate[]) => {
  const candidateMap = new Map<string, SkillCandidate>()

  for (const candidate of candidates) {
    if (candidateMap.has(candidate.name)) {
      continue
    }

    candidateMap.set(candidate.name, {
      name: candidate.name,
      description: candidate.description,
      metadata: candidate.metadata,
    })
  }

  return [...candidateMap.values()]
}

const getSkillContext = (context: BasePluginContext) => {
  return context.customContext[skillPluginContextKey] as SkillRequestContext | undefined
}

const setSkillContext = (context: BasePluginContext, skillContext: SkillRequestContext) => {
  context.setCustomContext({ [skillPluginContextKey]: skillContext })
}

const resolveSkillsByNames = async (
  skillNames: string[],
  getSkillByName: SkillResolver['getSkillByName'],
  context: BasePluginContext,
) => {
  const results = await Promise.all(
    skillNames.map(async (name) => {
      try {
        return { name, skill: await getSkillByName(name, context) }
      } catch {
        return { name, failed: true }
      }
    }),
  )

  const skills = results.map((result) => result.skill).filter((skill): skill is SkillDefinition => Boolean(skill))
  const resolvedSkillNameSet = new Set(skills.map((skill) => skill.name))

  return {
    skills,
    unresolvedSkillNames: results
      .filter((result) => result.failed || !result.skill || !resolvedSkillNameSet.has(result.name))
      .map((result) => result.name),
  }
}

const createAutoSelectionRuntimeTools = ({
  selection,
  getSkillByName,
  candidates,
  preferredSkillNames,
  onSkillsResolved,
  onSkillSelectionResolved,
}: {
  selection: AutoSkillSelection
  getSkillByName: SkillResolver['getSkillByName']
  candidates: SkillCandidate[]
  preferredSkillNames?: string[]
  onSkillsResolved: SkillPluginHooks['onSkillsResolved']
  onSkillSelectionResolved: SkillPluginHooks['onSkillSelectionResolved']
}): RuntimeTool[] => {
  return createSkillSelectionRuntimeTools(candidates, {
    maxSelectedSkills: selection.maxSelectedSkills,
    resolveSelection: async (result, toolContext) => {
      const requestedSkillNames = result.requestedSkillNames
      const event = {
        mode: 'auto' as const,
        candidates,
        preferredSkillNames,
        requestedSkillNames,
      }

      await onSkillSelectionResolved?.(event, toolContext)

      const { skills, unresolvedSkillNames } = await resolveSkillsByNames(
        requestedSkillNames,
        getSkillByName,
        toolContext,
      )

      const skillContext: SkillRequestContext = {
        skills,
        skillNames: skills.map((skill) => skill.name),
        requestedSkillNames,
        unresolvedSkillNames,
        runtimeTools: createSkillResourceRuntimeTools(skills),
        selection: {
          mode: 'auto',
          phase: 'ready',
          candidates,
          preferredSkillNames,
        },
      }

      setSkillContext(toolContext, skillContext)
      await onSkillsResolved?.(skillContext, toolContext)

      return {
        requestedSkillNames,
        enabledSkillNames: skills.map((skill) => skill.name),
        unresolvedSkillNames,
      }
    },
  })
}

export const skillPlugin = <S extends SkillSelection = SkillSelection>(
  options: SkillPluginOptions<S>,
): MessageEnginePlugin & ToolProvider => {
  const { selection, getSkillCandidates, getSkillByName, onSkillsResolved, onSkillSelectionResolved, ...restOptions } =
    options

  return {
    name: 'skill',
    ...restOptions,
    provideTools: async (context: BasePluginContext) => {
      return getSkillContext(context)?.runtimeTools ?? []
    },
    onTurnStart: async (context) => {
      const selectionOptions: SkillSelection = typeof selection === 'function' ? await selection(context) : selection

      if (selectionOptions.mode === 'none') {
        setSkillContext(context, {
          skills: [],
          skillNames: [],
          requestedSkillNames: [],
          unresolvedSkillNames: [],
          runtimeTools: [],
          selection: {
            mode: 'none',
            phase: 'ready',
          },
        })

        return restOptions.onTurnStart?.(context)
      }

      if (selectionOptions.mode === 'manual') {
        let skills: SkillDefinition[]
        let requestedSkillNames: string[]
        let unresolvedSkillNames: string[]

        if (selectionOptions.skills) {
          skills = selectionOptions.skills
          requestedSkillNames = skills.map((skill) => skill.name)
          unresolvedSkillNames = []
        } else {
          requestedSkillNames = getUniqueStringArray(selectionOptions.skillNames) ?? []
          const resolveSkillByName = getSkillByName
          if (!resolveSkillByName && requestedSkillNames.length > 0) {
            throw new Error('getSkillByName is required when manual mode uses skillNames')
          }
          const resolveResult = resolveSkillByName
            ? await resolveSkillsByNames(requestedSkillNames, resolveSkillByName, context)
            : { skills: [], unresolvedSkillNames: [] }
          skills = resolveResult.skills
          unresolvedSkillNames = resolveResult.unresolvedSkillNames
        }

        const skillContext: SkillRequestContext = {
          skills,
          skillNames: skills.map((skill) => skill.name),
          requestedSkillNames,
          unresolvedSkillNames,
          runtimeTools: createSkillResourceRuntimeTools(skills),
          selection: {
            mode: 'manual',
            phase: 'ready',
          },
        }

        setSkillContext(context, skillContext)
        await onSkillsResolved?.(skillContext, context)

        return restOptions.onTurnStart?.(context)
      }

      // mode: 'auto'
      const getCandidates = getSkillCandidates
      if (!getCandidates) {
        throw new Error('getSkillCandidates is required when auto mode is enabled')
      }
      const candidates = normalizeCandidates(await getCandidates(context))
      const candidateNameSet = new Set(candidates.map((candidate) => candidate.name))
      const preferredSkillNames = getUniqueStringArray(selectionOptions.preferredSkillNames)?.filter((name) =>
        candidateNameSet.has(name),
      )
      const resolveSkillByName = getSkillByName
      if (!resolveSkillByName) {
        throw new Error('getSkillByName is required when auto mode is enabled')
      }
      const skillContext: SkillRequestContext = {
        skills: [],
        skillNames: [],
        requestedSkillNames: [],
        unresolvedSkillNames: [],
        runtimeTools: createAutoSelectionRuntimeTools({
          selection: selectionOptions,
          getSkillByName: resolveSkillByName,
          candidates,
          preferredSkillNames,
          onSkillsResolved,
          onSkillSelectionResolved,
        }),
        selection: {
          mode: 'auto',
          phase: 'selecting',
          candidates,
          preferredSkillNames,
        },
      }

      setSkillContext(context, skillContext)

      return restOptions.onTurnStart?.(context)
    },
    onBeforeRequest: async (context) => {
      const skillContext = getSkillContext(context)

      if (
        skillContext?.selection.mode === 'auto' &&
        skillContext.selection.phase === 'selecting' &&
        skillContext.selection.candidates.length > 0
      ) {
        context.requestBody.messages = appendSystemInstructions(context.requestBody.messages, [
          createSkillSelectionInstructionsMessage({
            candidates: skillContext.selection.candidates,
            preferredSkillNames: skillContext.selection.preferredSkillNames,
          }),
        ])
      } else if (skillContext?.skills.length) {
        const skillInstructions = await compileSkillInstructions(skillContext.skills)
        const resourceInstructions = createSkillResourceInstructionsMessage(skillContext.skills)
        const instructions: ChatMessage[] = []
        if (skillInstructions) {
          instructions.push(skillInstructions as ChatMessage)
        }
        if (resourceInstructions) {
          instructions.push(resourceInstructions as ChatMessage)
        }
        if (instructions.length > 0) {
          context.requestBody.messages = appendSystemInstructions(context.requestBody.messages, instructions)
        }
      }

      return restOptions.onBeforeRequest?.(context)
    },
  } satisfies MessageEnginePlugin & ToolProvider
}
