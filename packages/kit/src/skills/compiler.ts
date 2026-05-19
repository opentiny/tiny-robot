import type { ChatCompletionSystemMessageParam } from 'openai/resources'
import type { RuntimeTool } from '../message/plugins/toolPlugin'
import type { SkillDefinition, SkillFileResource } from './types'

const skillFileToolNames = {
  listSkillFiles: 'list_skill_files',
  readSkillFile: 'read_skill_file',
} as const

const skillFileTools: Array<RuntimeTool['tool']> = [
  {
    type: 'function',
    function: {
      name: skillFileToolNames.listSkillFiles,
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
      name: skillFileToolNames.readSkillFile,
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

const getSkillFileSummary = (skillName: string, file: SkillFileResource) => ({
  skillName,
  id: file.id,
  path: file.path,
  kind: file.kind,
  mimeType: file.mimeType,
  size: file.size,
  lastModified: file.lastModified,
})

const parseSkillToolArguments = (toolCall: Parameters<RuntimeTool['handler']>[0]): Record<string, unknown> => {
  const rawArguments = toolCall.function.arguments

  if (!rawArguments) {
    return {}
  }

  try {
    const parsed = JSON.parse(rawArguments)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * 创建基础的 skill 文件工具，用于列出和读取 skill 携带的文件资源。
 */
export const createSkillFileRuntimeTools = (skills: SkillDefinition[]): RuntimeTool[] => {
  const hasSkillFiles = skills.some((skill) => Boolean(skill.files?.length))

  if (!hasSkillFiles) {
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
      tool: skillFileTools[0],
      handler: (toolCall) => {
        const toolArguments = parseSkillToolArguments(toolCall)
        const skill = findSkill(toolArguments.skillName)
        const skillList = skill ? [skill] : skills

        return {
          files: skillList.flatMap((currentSkill) =>
            (currentSkill.files ?? []).map((file) => getSkillFileSummary(currentSkill.name, file)),
          ),
        }
      },
    },
    {
      tool: skillFileTools[1],
      handler: (toolCall) => {
        const toolArguments = parseSkillToolArguments(toolCall)
        const skill = findSkill(toolArguments.skillName)
        const path = typeof toolArguments.path === 'string' ? toolArguments.path : undefined

        if (!skill) {
          return { error: 'skill_not_found' }
        }

        if (!path) {
          return { error: 'file_path_required', skillName: skill.name }
        }

        const file = skill.files?.find((skillFile) => skillFile.path === path)
        if (!file) {
          return { error: 'file_not_found', skillName: skill.name, path }
        }

        if (file.kind === 'binary') {
          return {
            error: 'binary_file_not_readable',
            file: getSkillFileSummary(skill.name, file),
          }
        }

        return {
          file: getSkillFileSummary(skill.name, file),
          content: file.content,
        }
      },
    },
  ]
}

export const compileSkillInstructions = async (
  skills: SkillDefinition[],
): Promise<ChatCompletionSystemMessageParam | undefined> => {
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

  return {
    role: 'system',
    content: ['Apply these skill instructions when generating the response.', ...instructions].join('\n\n'),
  }
}
