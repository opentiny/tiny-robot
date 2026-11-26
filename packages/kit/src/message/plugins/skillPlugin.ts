import { createSkillResourceInstructions, createSkillResourceRuntimeTools } from '../../skills/capabilities/resources'
import { createSkillSelectionInstructions, createSkillSelectionRuntimeTools } from '../../skills/capabilities/selection'
import type { SkillCandidate, SkillDefinition } from '../../skills/types'
import { getUniqueStringArray } from '../../utils'
import type { BasePluginContext, MessageEnginePlugin } from '../types'
import type { RuntimeTool, ToolProvider } from './toolPlugin'

import { createSessionSkillPlugin } from './sessionSkillPlugin'
import type {
  LegacySkillPluginOptions,
  SessionSkillPluginOptions,
  SkillPluginOptions,
  SkillPluginHooks,
  SkillRequestContext,
  SkillSelection,
  SkillSelectionStatus,
  SkillResolver,
  AutoSkillSelection,
} from './skillPlugin.types'
export type {
  LegacySkillPluginOptions,
  SkillPluginOptions,
  SessionSkillPluginOptions,
  SkillRequestContext,
  SkillSelection,
} from './skillPlugin.types'

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

type ReadySkillSelection = Extract<SkillSelectionStatus, { phase: 'ready' }>
type SelectingSkillSelection = Extract<SkillSelectionStatus, { phase: 'selecting' }>

const createReadySkillContext = (
  skills: SkillDefinition[],
  requestedSkillNames: string[],
  unresolvedSkillNames: string[],
  selection: ReadySkillSelection,
): SkillRequestContext => ({
  skills,
  skillNames: skills.map((skill) => skill.name),
  requestedSkillNames,
  unresolvedSkillNames,
  instructions: createResolvedSkillInstructions(skills),
  selection,
})

const createSelectingSkillContext = (
  candidates: SkillCandidate[],
  preferredSkillNames: string[] | undefined,
  maxSelectedSkills: number | undefined,
): SkillRequestContext => ({
  skills: [],
  skillNames: [],
  requestedSkillNames: [],
  unresolvedSkillNames: [],
  instructions: candidates.length ? [createSkillSelectionInstructions({ candidates, preferredSkillNames })] : [],
  selection: {
    mode: 'auto',
    phase: 'selecting',
    candidates,
    preferredSkillNames,
    maxSelectedSkills,
  } satisfies SelectingSkillSelection,
})

const collectPendingSkillNames = (context: BasePluginContext) => {
  const skillNames = new Set<string>()
  const messages = [...context.currentTurn, ...context.getState().messages]

  for (const message of messages) {
    if (message.role !== 'assistant' || !Array.isArray(message.tool_calls)) {
      continue
    }

    const toolCallState = (message.state?.toolCall as Record<string, { status?: string }> | undefined) ?? {}
    for (const toolCall of message.tool_calls) {
      if (toolCallState[toolCall.id]?.status !== 'awaiting-approval') {
        continue
      }

      if (toolCall.type !== 'function' || !('function' in toolCall)) {
        continue
      }

      if (toolCall.function.name !== 'list_skill_files' && toolCall.function.name !== 'read_skill_file') {
        continue
      }

      try {
        const rawArguments = toolCall.function.arguments
        const argumentsValue = typeof rawArguments === 'string' ? JSON.parse(rawArguments || '{}') : rawArguments
        const skillName =
          argumentsValue && typeof argumentsValue === 'object' && 'skillName' in argumentsValue
            ? argumentsValue.skillName
            : undefined

        if (typeof skillName === 'string' && skillName.length > 0) {
          skillNames.add(skillName)
        }
      } catch {
        // The tool handler will report malformed arguments after the turn is resumed.
      }
    }
  }

  return [...skillNames]
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
  applyReadySkillContext,
}: {
  selection: AutoSkillSelection
  getSkillByName: SkillResolver['getSkillByName']
  candidates: SkillCandidate[]
  preferredSkillNames?: string[]
  onInstructionsResolved: SkillPluginHooks['onInstructionsResolved']
  onSkillsResolved: SkillPluginHooks['onSkillsResolved']
  onSkillSelectionResolved: SkillPluginHooks['onSkillSelectionResolved']
  applyReadySkillContext: (
    context: BasePluginContext,
    skills: SkillDefinition[],
    requestedSkillNames: string[],
    unresolvedSkillNames: string[],
    selection: ReadySkillSelection,
  ) => SkillRequestContext
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

      const skillContext = applyReadySkillContext(toolContext, skills, requestedSkillNames, unresolvedSkillNames, {
        mode: 'auto',
        phase: 'ready',
        candidates,
        preferredSkillNames,
        maxSelectedSkills: selection.maxSelectedSkills,
      })
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

const createLegacySkillPlugin = <S extends SkillSelection = SkillSelection>(
  options: LegacySkillPluginOptions<S>,
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

  let runtimeTools: RuntimeTool[] = []
  let runtimeToolsReady = false

  const setRuntimeTools = (nextRuntimeTools: RuntimeTool[]) => {
    runtimeTools = nextRuntimeTools
    runtimeToolsReady = true
  }

  const applyReadySkillContext = (
    context: BasePluginContext,
    skills: SkillDefinition[],
    requestedSkillNames: string[],
    unresolvedSkillNames: string[],
    selection: ReadySkillSelection,
  ) => {
    setRuntimeTools(createSkillResourceRuntimeTools(skills))
    const skillContext = createReadySkillContext(skills, requestedSkillNames, unresolvedSkillNames, selection)
    setSkillContext(context, skillContext)
    return skillContext
  }

  const resolveRestoredSkills = async (skillContext: SkillRequestContext, context: BasePluginContext) => {
    const selectionOptions = typeof selection === 'function' ? await selection(context) : selection

    if (skillContext.selection.mode === 'manual' && selectionOptions.mode === 'manual' && selectionOptions.skills) {
      const persistedSkillNames = new Set(skillContext.skillNames)
      const skills = normalizeSkills(selectionOptions.skills).filter((skill) => persistedSkillNames.has(skill.name))
      const pendingSkills = await resolvePendingSkills(
        context,
        skills.map((skill) => skill.name),
      )
      const restoredSkills = normalizeSkills([...skills, ...pendingSkills])
      assertPendingSkillsRestored(restoredSkills, context)
      return restoredSkills
    }

    let skills: SkillDefinition[] = []
    if (skillContext.skillNames.length > 0) {
      if (!getSkillByName) {
        throw new Error('getSkillByName is required to restore selected skills')
      }

      const result = await resolveSkillsByNames(skillContext.skillNames, getSkillByName, context)
      if (result.unresolvedSkillNames.length > 0) {
        throw new Error(`Unable to restore selected skills: ${result.unresolvedSkillNames.join(', ')}`)
      }
      skills = result.skills
    }

    const pendingSkills = await resolvePendingSkills(
      context,
      skills.map((skill) => skill.name),
    )
    const restoredSkills = normalizeSkills([...skills, ...pendingSkills])
    assertPendingSkillsRestored(restoredSkills, context)
    return restoredSkills
  }

  const resolvePendingSkills = async (context: BasePluginContext, excludedSkillNames: string[] = []) => {
    const excludedNames = new Set(excludedSkillNames)
    const pendingSkillNames = collectPendingSkillNames(context).filter((name) => !excludedNames.has(name))
    if (pendingSkillNames.length === 0 || !getSkillByName) {
      return []
    }

    const result = await resolveSkillsByNames(pendingSkillNames, getSkillByName, context)
    return result.skills
  }

  const assertPendingSkillsRestored = (skills: SkillDefinition[], context: BasePluginContext) => {
    const restoredSkillNames = new Set(skills.map((skill) => skill.name))
    const missingSkillNames = collectPendingSkillNames(context).filter(
      (skillName) => !restoredSkillNames.has(skillName),
    )

    if (missingSkillNames.length > 0) {
      throw new Error(`Unable to restore pending skill tools: ${missingSkillNames.join(', ')}`)
    }
  }

  const rebuildManualRuntimeTools = async (
    selectionOptions: Extract<SkillSelection, { mode: 'manual' }>,
    context: BasePluginContext,
  ) => {
    let skills: SkillDefinition[]
    let requestedSkillNames: string[]
    let unresolvedSkillNames: string[]

    if (selectionOptions.skills) {
      skills = normalizeSkills(selectionOptions.skills)
      requestedSkillNames = skills.map((skill) => skill.name)
      unresolvedSkillNames = []
    } else {
      requestedSkillNames = getUniqueStringArray(selectionOptions.skillNames) ?? []
      if (!getSkillByName && requestedSkillNames.length > 0) {
        setRuntimeTools([])
        return
      }

      const result = getSkillByName
        ? await resolveSkillsByNames(requestedSkillNames, getSkillByName, context)
        : { skills: [], unresolvedSkillNames: [] }
      skills = result.skills
      unresolvedSkillNames = result.unresolvedSkillNames
    }

    applyReadySkillContext(context, skills, requestedSkillNames, unresolvedSkillNames, {
      mode: 'manual',
      phase: 'ready',
    })
  }

  const rebuildRuntimeTools = async (context: BasePluginContext) => {
    const skillContext = getSkillRequestContext(context)
    const selectionOptions = typeof selection === 'function' ? await selection(context) : selection

    if (!skillContext) {
      if (selectionOptions.mode === 'manual') {
        await rebuildManualRuntimeTools(selectionOptions, context)
      } else if (selectionOptions.mode === 'auto') {
        if (!getSkillCandidates || !getSkillByName) {
          setRuntimeTools([])
          return
        }

        const candidates = normalizeCandidates(await getSkillCandidates(context))
        const candidateNameSet = new Set(candidates.map((candidate) => candidate.name))
        const preferredSkillNames = getUniqueStringArray(selectionOptions.preferredSkillNames)?.filter((name) =>
          candidateNameSet.has(name),
        )
        const runtimeTools = createAutoSelectionRuntimeTools({
          selection: selectionOptions,
          getSkillByName,
          candidates,
          preferredSkillNames,
          onInstructionsResolved,
          onSkillsResolved,
          onSkillSelectionResolved,
          applyReadySkillContext,
        })
        setRuntimeTools(runtimeTools)
        setSkillContext(
          context,
          createSelectingSkillContext(candidates, preferredSkillNames, selectionOptions.maxSelectedSkills),
        )
      } else {
        setRuntimeTools(createSkillResourceRuntimeTools(await resolvePendingSkills(context)))
      }
      return
    }

    if (skillContext.selection.mode === 'none') {
      const pendingSkills = await resolvePendingSkills(context)
      assertPendingSkillsRestored(pendingSkills, context)
      applyReadySkillContext(
        context,
        pendingSkills,
        pendingSkills.map((skill) => skill.name),
        [],
        skillContext.selection,
      )
      return
    }

    if (skillContext.selection.mode === 'auto' && skillContext.selection.phase === 'selecting') {
      const autoSelection: AutoSkillSelection =
        selectionOptions.mode === 'auto'
          ? selectionOptions
          : {
              mode: 'auto',
              preferredSkillNames: skillContext.selection.preferredSkillNames,
              maxSelectedSkills: skillContext.selection.maxSelectedSkills,
            }

      if (!getSkillByName) {
        throw new Error('getSkillByName is required when restoring auto skill selection')
      }

      const nextRuntimeTools = createAutoSelectionRuntimeTools({
        selection: autoSelection,
        getSkillByName,
        candidates: skillContext.selection.candidates,
        preferredSkillNames: skillContext.selection.preferredSkillNames,
        onInstructionsResolved,
        onSkillsResolved,
        onSkillSelectionResolved,
        applyReadySkillContext,
      })
      setRuntimeTools(nextRuntimeTools)
      return
    }

    const skills = await resolveRestoredSkills(skillContext, context)
    applyReadySkillContext(
      context,
      skills,
      skillContext.requestedSkillNames,
      skillContext.requestedSkillNames.filter((skillName) => !skills.some((skill) => skill.name === skillName)),
      skillContext.selection,
    )
  }

  return {
    name: 'skill',
    ...restOptions,
    provideTools: async (context: BasePluginContext) => {
      if (!runtimeToolsReady) {
        await rebuildRuntimeTools(context)
      }

      return runtimeTools
    },
    onTurnStart: async (context) => {
      setRuntimeTools([])
      const selectionOptions: SkillSelection = typeof selection === 'function' ? await selection(context) : selection

      if (selectionOptions.mode === 'none') {
        setSkillContext(
          context,
          createReadySkillContext([], [], [], {
            mode: 'none',
            phase: 'ready',
          }),
        )

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

        const skillContext = applyReadySkillContext(context, skills, requestedSkillNames, unresolvedSkillNames, {
          mode: 'manual',
          phase: 'ready',
        })
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
      const runtimeTools = createAutoSelectionRuntimeTools({
        selection: selectionOptions,
        getSkillByName: resolveSkillByName,
        candidates,
        preferredSkillNames,
        onInstructionsResolved,
        onSkillsResolved,
        onSkillSelectionResolved,
        applyReadySkillContext,
      })
      setRuntimeTools(runtimeTools)
      const skillContext = createSelectingSkillContext(
        candidates,
        preferredSkillNames,
        selectionOptions.maxSelectedSkills,
      )

      setSkillContext(context, skillContext)
      await onInstructionsResolved?.(skillContext, context)

      return restOptions.onTurnStart?.(context)
    },
    onTurnResume: async (context) => {
      if (!runtimeToolsReady) {
        await rebuildRuntimeTools(context)
      }
      return restOptions.onTurnResume?.(context)
    },
  } satisfies MessageEnginePlugin & ToolProvider
}

export const skillPlugin = <S extends SkillSelection = SkillSelection>(
  options: SkillPluginOptions<S> | SessionSkillPluginOptions,
): MessageEnginePlugin & ToolProvider => {
  if (options.scope === 'session') return createSessionSkillPlugin(options)
  if (options.scope !== undefined && options.scope !== 'turn') throw new TypeError('Invalid skill scope')
  if (
    options.sessionId !== undefined ||
    options.deduplication !== undefined ||
    options.explicitSkillLoading !== undefined
  )
    throw new TypeError('Session skill settings require scope: session')
  return createLegacySkillPlugin(options)
}
