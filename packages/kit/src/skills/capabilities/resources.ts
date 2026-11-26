import { makeAbortable } from '../../message/utils'
import type { RuntimeTool } from '../../message/plugins/toolPlugin'
import type { SkillDefinition, SkillResourceDescriptor } from '../types'
import { parseToolArguments } from './utils'
import type { SessionSkillPluginOptions } from '../../message/plugins/skillPlugin.types'

const skillResourceToolNames = {
  listSkillFiles: 'list_skill_files',
  readSkillFile: 'read_skill_file',
} as const

const skillResourceTools: Array<RuntimeTool['tool']> = [
  {
    type: 'function',
    function: {
      name: skillResourceToolNames.listSkillFiles,
      description: 'List files available from the current skills.',
      parameters: {
        type: 'object',
        properties: {
          skillName: {
            type: 'string',
            description: 'Optional skill name. When omitted, files from all current skills are listed.',
          },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: skillResourceToolNames.readSkillFile,
      description: 'Read a file from a current skill by skill name and relative path.',
      parameters: {
        type: 'object',
        properties: {
          skillName: {
            type: 'string',
            description: 'Skill name that owns the file.',
          },
          path: {
            type: 'string',
            description: 'File path relative to the skill root.',
          },
        },
        required: ['skillName', 'path'],
        additionalProperties: false,
      },
    },
  },
]

const getSkillFileSummary = (skillName: string, file: SkillResourceDescriptor) => ({
  skillName,
  path: file.path,
  kind: file.kind,
  mimeType: file.mimeType,
  size: file.size,
  lastModified: file.lastModified,
})

const readSkillResourceText = async (resource: SkillResourceDescriptor) => {
  if (resource.text !== undefined) {
    return resource.text
  }

  return resource.readText?.()
}

export const hasSkillResources = (skills: SkillDefinition[]) => {
  return skills.some((skill) => Boolean(skill.resources?.length))
}

export const createSkillResourceInstructions = (skills: SkillDefinition[]): string | undefined => {
  if (!hasSkillResources(skills)) {
    return undefined
  }

  return [
    'Some enabled skills include resource files.',
    'Start by calling list_skill_files before reading skill resources, unless the needed file path is already known from the current conversation.',
    'Use read_skill_file with a skillName and relative path when you need file details.',
    'For large files or unknown locations, inspect the file list first and prefer targeted reads instead of reading unrelated files.',
    'Do not guess file paths. Binary files cannot be read as text through read_skill_file.',
  ].join('\n')
}

export const createSkillResourceRuntimeTools = (skills: SkillDefinition[]): RuntimeTool[] => {
  if (!hasSkillResources(skills)) {
    return []
  }

  const findSkill = (skillName?: unknown) => {
    if (typeof skillName !== 'string' || !skillName) {
      return undefined
    }

    return skills.find((skill) => skill.name === skillName)
  }

  return [
    {
      tool: skillResourceTools[0],
      handler: (toolCall) => {
        const toolArguments = parseToolArguments(toolCall)
        const hasSkillName = typeof toolArguments.skillName === 'string' && toolArguments.skillName.length > 0
        const skill = findSkill(toolArguments.skillName)

        if (hasSkillName && !skill) {
          return { error: 'skill_not_found', skillName: toolArguments.skillName }
        }

        const skillList = skill ? [skill] : skills

        return {
          files: skillList.flatMap((currentSkill) =>
            (currentSkill.resources ?? []).map((file) => getSkillFileSummary(currentSkill.name, file)),
          ),
        }
      },
    },
    {
      tool: skillResourceTools[1],
      handler: async (toolCall) => {
        const toolArguments = parseToolArguments(toolCall)
        const skill = findSkill(toolArguments.skillName)
        const path = typeof toolArguments.path === 'string' ? toolArguments.path : undefined

        if (!skill) {
          return { error: 'skill_not_found' }
        }

        if (!path) {
          return { error: 'file_path_required', skillName: skill.name }
        }

        const file = skill.resources?.find((skillFile) => skillFile.path === path)
        if (!file) {
          return { error: 'file_not_found', skillName: skill.name, path }
        }

        if (file.kind === 'binary') {
          return {
            error: 'binary_file_not_readable',
            file: getSkillFileSummary(skill.name, file),
          }
        }

        const content = await readSkillResourceText(file)

        if (content === undefined) {
          return {
            error: 'text_file_not_readable',
            file: getSkillFileSummary(skill.name, file),
          }
        }

        return {
          file: getSkillFileSummary(skill.name, file),
          content,
        }
      },
    },
  ]
}

/** Session resources resolve their source at execution time, including after approval. */
export const createSessionSkillResourceRuntimeTools = (
  getSkillByName: SessionSkillPluginOptions['getSkillByName'],
): RuntimeTool[] =>
  skillResourceTools.map((tool) => ({
    tool: {
      ...tool,
      function: {
        ...tool.function,
        parameters: {
          ...tool.function.parameters,
          properties: {
            ...(tool.function.parameters?.properties as Record<string, unknown>),
            skillName: { type: 'string', description: 'Required skill name that owns the resource files.' },
          },
          required:
            tool.function.name === skillResourceToolNames.listSkillFiles ? ['skillName'] : ['skillName', 'path'],
        },
      },
    },
    handler: async (call, context) => {
      try {
        context.abortSignal.throwIfAborted()
        const args = parseToolArguments(call)
        if (typeof args.skillName !== 'string' || !args.skillName) return { error: 'skill_name_required' }
        const skill = await makeAbortable(Promise.resolve(getSkillByName(args.skillName, context)), context.abortSignal)
        context.abortSignal.throwIfAborted()
        if (!skill) return { error: 'skill_unavailable', skillName: args.skillName }
        if (skill.name !== args.skillName) return { error: 'skill_load_failed', skillName: args.skillName }
        if (tool.function.name === skillResourceToolNames.listSkillFiles) {
          return { files: (skill.resources ?? []).map((file) => getSkillFileSummary(skill.name, file)) }
        }
        if (typeof args.path !== 'string' || !args.path) return { error: 'file_path_required', skillName: skill.name }
        const resource = skill.resources?.find((file) => file.path === args.path)
        if (!resource) return { error: 'file_not_found', skillName: skill.name, path: args.path }
        const file = getSkillFileSummary(skill.name, resource)
        if (resource.kind === 'binary') return { error: 'binary_file_not_readable', file }
        const content = await makeAbortable(Promise.resolve(readSkillResourceText(resource)), context.abortSignal)
        context.abortSignal.throwIfAborted()
        return content === undefined ? { error: 'text_file_not_readable', file } : { file, content }
      } catch (error) {
        if (context.abortSignal.aborted) throw error
        return { error: 'skill_load_failed', message: error instanceof Error ? error.message : String(error) }
      }
    },
  }))
