import { createSkillResourceInstructions, createSkillResourceRuntimeTools } from '../../skills/capabilities/resources'
import { createSkillSelectionInstructions, createSkillSelectionRuntimeTools } from '../../skills/capabilities/selection'
import type { SkillCandidate, SkillDefinition } from '../../skills/types'
import type { MaybePromise } from '../../types'
import { getUniqueStringArray } from '../../utils'
import type { BasePluginContext, BeforeRequestContext, MessageEnginePlugin } from '../types'
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
  /**
   * Whether the current instructions should be delivered before the next request.
   */
  instructionsPending: boolean
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
   * Called once before the next model request after new skill instructions are resolved.
   * The request body is available and may be modified directly.
   */
  onInstructionsResolved?: (skillContext: SkillRequestContext, context: BeforeRequestContext) => MaybePromise<void>
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

  return {
    skills,
    unresolvedSkillNames: results.filter((result) => result.failed || !result.skill).map((result) => result.name),
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

      const instructions = createResolvedSkillInstructions(skills)
      const skillContext: SkillRequestContext = {
        skills,
        skillNames: skills.map((skill) => skill.name),
        requestedSkillNames,
        unresolvedSkillNames,
        instructions,
        instructionsPending: true,
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
          instructionsPending: false,
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

        const instructions = createResolvedSkillInstructions(skills)
        const skillContext: SkillRequestContext = {
          skills,
          skillNames: skills.map((skill) => skill.name),
          requestedSkillNames,
          unresolvedSkillNames,
          instructions,
          instructionsPending: true,
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
      const instructions =
        candidates.length > 0 ? [createSkillSelectionInstructions({ candidates, preferredSkillNames })] : []
      const skillContext: SkillRequestContext = {
        skills: [],
        skillNames: [],
        requestedSkillNames: [],
        unresolvedSkillNames: [],
        instructions,
        instructionsPending: true,
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
      const skillContext = getSkillRequestContext(context)

      if (skillContext?.instructionsPending) {
        await onInstructionsResolved?.(skillContext, context)
        setSkillContext(context, { ...skillContext, instructionsPending: false })
      }

      return restOptions.onBeforeRequest?.(context)
    },
  } satisfies MessageEnginePlugin & ToolProvider
}
