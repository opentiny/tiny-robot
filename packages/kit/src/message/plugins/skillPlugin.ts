import { createSkillResourceInstructions, createSkillResourceRuntimeTools } from '../../skills/capabilities/resources'
import { createSkillSelectionInstructions, createSkillSelectionRuntimeTools } from '../../skills/capabilities/selection'
import type { SkillCandidate, SkillDefinition } from '../../skills/types'
import type { MaybePromise } from '../../types'
import { getUniqueStringArray } from '../../utils'
import type { BasePluginContext, MessageEnginePlugin } from '../types'
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
   * User-preferred skill names as an automatic selection preference.
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
  /**
   * Instructions generated for the current skill selection state.
   */
  instructions: string[]
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
   * Called immediately after new skill instructions are resolved and stored in the skill context.
   */
  onInstructionsResolved?: (skillContext: SkillRequestContext, context: BasePluginContext) => MaybePromise<void>
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

type StaticSkillPluginOptions<S extends SkillSelection> = S extends SkillSelection
  ? SkillPluginHooks &
      RequireResolver<S> &
      RequireCandidateProvider<S> & {
        selection: S
      }
  : never

type DynamicSkillPluginOptions<S extends SkillSelection> = SkillPluginHooks &
  RequireResolver<S> &
  RequireCandidateProvider<S> & {
    selection: (context: BasePluginContext) => MaybePromise<S>
  }

export type SkillPluginOptions<S extends SkillSelection = SkillSelection> =
  | StaticSkillPluginOptions<S>
  | DynamicSkillPluginOptions<S>

const skillPluginContextKey = '__tiny_robot_skill'

const createSkillInstructions = (skills: SkillDefinition[]): string | undefined => {
  const instructions: string[] = []

  for (const skill of skills) {
    const instruction = skill.instructions?.trim()
    if (instruction) {
      instructions.push(`## ${skill.name}\n\n${instruction}`)
    }
  }

  if (instructions.length === 0) {
    return undefined
  }

  return ['Apply these skill instructions when generating the response.', ...instructions].join('\n\n')
}

const createResolvedSkillInstructions = (skills: SkillDefinition[]): string[] => {
  const instructions: string[] = []
  const skillInstructions = createSkillInstructions(skills)
  const resourceInstructions = createSkillResourceInstructions(skills)

  if (skillInstructions) {
    instructions.push(skillInstructions)
  }
  if (resourceInstructions) {
    instructions.push(resourceInstructions)
  }

  return instructions
}

const normalizeSkills = (skills: SkillDefinition[]) => {
  const skillMap = new Map<string, SkillDefinition>()

  for (const skill of skills) {
    if (!skillMap.has(skill.name)) {
      skillMap.set(skill.name, skill)
    }
  }

  return [...skillMap.values()]
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

/** Reads the skill context attached to a plugin lifecycle context. */
export const getSkillRequestContext = (context: Pick<BasePluginContext, 'customContext'>) => {
  return context.customContext[skillPluginContextKey] as SkillRequestContext | undefined
}

const setSkillContext = (context: BasePluginContext, skillContext: SkillRequestContext) => {
  context.setCustomContext({ [skillPluginContextKey]: skillContext })
}

const hasEnabledToolPlugin = (context: BasePluginContext) => {
  return context.plugins.some((plugin) => {
    if (plugin.name !== 'tool') {
      return false
    }

    return typeof plugin.disabled === 'function' ? !plugin.disabled(context) : !plugin.disabled
  })
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

  const skillMap = new Map<string, SkillDefinition>()
  const unresolvedSkillNames: string[] = []

  for (const result of results) {
    if (result.failed || !result.skill || result.skill.name !== result.name) {
      unresolvedSkillNames.push(result.name)
      continue
    }

    if (!skillMap.has(result.skill.name)) {
      skillMap.set(result.skill.name, result.skill)
    }
  }

  return {
    skills: [...skillMap.values()],
    unresolvedSkillNames,
  }
}

const createAutoSelectionRuntimeTools = ({
  selection,
  getSkillByName,
  candidates,
  preferredSkillNames,
  onInstructionsResolved,
  onSkillsResolved,
  onSkillSelectionResolved,
}: {
  selection: AutoSkillSelection
  getSkillByName: SkillResolver['getSkillByName']
  candidates: SkillCandidate[]
  preferredSkillNames?: string[]
  onInstructionsResolved: SkillPluginHooks['onInstructionsResolved']
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

      const instructions = createResolvedSkillInstructions(skills)
      const skillContext: SkillRequestContext = {
        skills,
        skillNames: skills.map((skill) => skill.name),
        requestedSkillNames,
        unresolvedSkillNames,
        instructions,
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
      await onInstructionsResolved?.(skillContext, toolContext)

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
  const {
    selection,
    getSkillCandidates,
    getSkillByName,
    onInstructionsResolved,
    onSkillsResolved,
    onSkillSelectionResolved,
    ...restOptions
  } = options

  return {
    name: 'skill',
    ...restOptions,
    provideTools: async (context: BasePluginContext) => {
      return getSkillRequestContext(context)?.runtimeTools ?? []
    },
    onTurnStart: async (context) => {
      const selectionOptions: SkillSelection = typeof selection === 'function' ? await selection(context) : selection

      if (selectionOptions.mode === 'none') {
        setSkillContext(context, {
          skills: [],
          skillNames: [],
          requestedSkillNames: [],
          unresolvedSkillNames: [],
          instructions: [],
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
          skills = normalizeSkills(selectionOptions.skills)
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

        const instructions = createResolvedSkillInstructions(skills)
        const skillContext: SkillRequestContext = {
          skills,
          skillNames: skills.map((skill) => skill.name),
          requestedSkillNames,
          unresolvedSkillNames,
          instructions,
          runtimeTools: createSkillResourceRuntimeTools(skills),
          selection: {
            mode: 'manual',
            phase: 'ready',
          },
        }

        setSkillContext(context, skillContext)
        await onSkillsResolved?.(skillContext, context)
        await onInstructionsResolved?.(skillContext, context)

        return restOptions.onTurnStart?.(context)
      }

      // mode: 'auto'
      if (!hasEnabledToolPlugin(context)) {
        throw new Error('skillPlugin auto mode requires an enabled toolPlugin')
      }

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
      const instructions =
        candidates.length > 0 ? [createSkillSelectionInstructions({ candidates, preferredSkillNames })] : []
      const skillContext: SkillRequestContext = {
        skills: [],
        skillNames: [],
        requestedSkillNames: [],
        unresolvedSkillNames: [],
        instructions,
        runtimeTools: createAutoSelectionRuntimeTools({
          selection: selectionOptions,
          getSkillByName: resolveSkillByName,
          candidates,
          preferredSkillNames,
          onInstructionsResolved,
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
      await onInstructionsResolved?.(skillContext, context)

      return restOptions.onTurnStart?.(context)
    },
  } satisfies MessageEnginePlugin & ToolProvider
}
