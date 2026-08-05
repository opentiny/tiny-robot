import type { RuntimeTool, ToolCallContext } from '../../message/plugins/toolPlugin'
import type { MaybePromise } from '../../types'
import { getUniqueStringArray } from '../../utils'
import type { SkillCandidate } from '../types'
import { parseToolArguments } from './utils'

const skillSelectionToolName = 'select_skills'

const normalizeMaxSelectedSkills = (value: number | undefined, candidateCount: number) => {
  const integerValue = typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : candidateCount

  return Math.min(candidateCount, Math.max(0, integerValue))
}

export const createSkillSelectionInstructions = ({
  candidates,
  preferredSkillNames,
}: {
  candidates: SkillCandidate[]
  preferredSkillNames?: string[]
}): string => {
  const lines = [
    'Select the skills that should be enabled for this request.',
    'Use the select_skills tool before answering.',
    'Only choose skill names from the provided candidates.',
    '',
    'Candidates:',
    ...candidates.map((candidate) => {
      const metadata = candidate.metadata ? ` Metadata: ${JSON.stringify(candidate.metadata)}` : ''
      return `- ${candidate.name}: ${candidate.description}${metadata}`
    }),
  ]

  if (preferredSkillNames?.length) {
    lines.push('', `Preferred skill names: ${preferredSkillNames.join(', ')}`)
  }

  return lines.join('\n')
}

export function createSkillSelectionRuntimeTools(
  candidates: SkillCandidate[],
  options: {
    maxSelectedSkills?: number
    resolveSelection?: (
      result: {
        requestedSkillNames: string[]
      },
      context: ToolCallContext,
    ) => MaybePromise<Record<string, unknown> | void>
  } = {},
): RuntimeTool[] {
  if (candidates.length === 0) {
    return []
  }

  const candidateNames = candidates.map((candidate) => candidate.name)
  const candidateNameSet = new Set(candidateNames)
  const maxSelectedSkills = normalizeMaxSelectedSkills(options.maxSelectedSkills, candidateNames.length)
  let selectionStarted = false

  return [
    {
      tool: {
        type: 'function',
        function: {
          name: skillSelectionToolName,
          description: 'Select the skills that should be enabled for the next execution turn.',
          parameters: {
            type: 'object',
            properties: {
              skillNames: {
                type: 'array',
                description: 'Skill names to enable. Only choose from the provided candidates.',
                items: {
                  type: 'string',
                  enum: candidateNames,
                },
                maxItems: maxSelectedSkills,
              },
            },
            required: ['skillNames'],
            additionalProperties: false,
          },
        },
      },
      handler: async (toolCall, context) => {
        const toolArguments = parseToolArguments(toolCall)
        const requestedSkillNames = getUniqueStringArray(toolArguments.skillNames)

        if (!requestedSkillNames) {
          return {
            error: 'skill_names_required',
            candidateSkillNames: candidateNames,
          }
        }

        const invalidSkillNames = requestedSkillNames.filter((name) => !candidateNameSet.has(name))
        if (invalidSkillNames.length > 0) {
          return {
            error: 'invalid_skill_names',
            invalidSkillNames,
            candidateSkillNames: candidateNames,
          }
        }

        if (requestedSkillNames.length > maxSelectedSkills) {
          return {
            error: 'too_many_skills_selected',
            maxSelectedSkills,
            requestedSkillNames,
          }
        }

        if (selectionStarted) {
          return {
            error: 'skill_selection_already_resolved',
          }
        }

        selectionStarted = true

        const result = {
          requestedSkillNames,
        }
        const selectionResult = await options.resolveSelection?.(result, context)

        return {
          requestedSkillNames: result.requestedSkillNames,
          ...selectionResult,
        }
      },
    },
  ]
}
