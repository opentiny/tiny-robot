import type { ChatCompletionSystemMessageParam } from 'openai/resources'
import type { RuntimeTool } from '../message/plugins/toolPlugin'
import type { MaybePromise } from '../types'
import type { SkillDefinition, SkillFileResource } from './types'

const skillFileToolNames = {
  listSkillFiles: 'list_skill_files',
  readSkillFile: 'read_skill_file',
} as const

const skillCommandToolName = 'execute_skill_command'

export type SkillCommandRequest = {
  skillName: string
  command: string
  args: string[]
  skill: SkillDefinition
}

export type SkillCommandResult = string | Record<string, unknown>

export type SkillCommandExecutor = (request: SkillCommandRequest) => MaybePromise<SkillCommandResult>

export type SkillRuntimeToolsOptions = {
  /**
   * @experimental 该 API 仍在设计和验证中，命令协议、返回结构和安全边界后续可能调整。
   */
  executeSkillCommand?: SkillCommandExecutor
}

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

const skillCommandTool: RuntimeTool['tool'] = {
  type: 'function',
  function: {
    name: skillCommandToolName,
    description: 'Execute a command in the backend runtime environment for a selected skill.',
    parameters: {
      type: 'object',
      properties: {
        skillName: {
          type: 'string',
          description: 'Name of the current skill that provides the command instructions.',
        },
        command: {
          type: 'string',
          description: 'Command name to execute in the skill backend runtime.',
        },
        args: {
          type: 'array',
          description: 'Command arguments passed as argv items.',
          items: {
            type: 'string',
          },
        },
      },
      required: ['skillName', 'command', 'args'],
      additionalProperties: false,
    },
  },
}

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

const normalizeStringArray = (value: unknown) => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : undefined
}

/**
 * 创建基础的 skill 文件工具，用于列出和读取 skill 携带的文件资源。
 */
const createSkillFileRuntimeTools = (skills: SkillDefinition[]): RuntimeTool[] => {
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

/**
 * 创建 skill 命令执行工具，用于把模型规划的命令转交给应用侧后端运行环境。
 */
const createSkillCommandRuntimeTools = (
  skills: SkillDefinition[],
  executeSkillCommand?: SkillCommandExecutor,
): RuntimeTool[] => {
  if (!executeSkillCommand || skills.length === 0) {
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
      tool: skillCommandTool,
      handler: async (toolCall) => {
        const toolArguments = parseSkillToolArguments(toolCall)
        const skill = findSkill(toolArguments.skillName)
        const command = typeof toolArguments.command === 'string' ? toolArguments.command : undefined
        const args = normalizeStringArray(toolArguments.args)

        if (!skill) {
          return { error: 'skill_not_found' }
        }

        if (!command) {
          return { error: 'command_required', skillName: skill.name }
        }

        if (!args) {
          return { error: 'args_required', skillName: skill.name, command }
        }

        return executeSkillCommand({
          skill,
          skillName: skill.name,
          command,
          args,
        })
      },
    },
  ]
}

/**
 * 创建 skill 运行时工具。
 *
 * 默认只根据 skill 文件创建基础文件工具；传入 executeSkillCommand 时会额外创建命令执行工具。
 */
export const createSkillRuntimeTools = (
  skills: SkillDefinition[],
  options: SkillRuntimeToolsOptions = {},
): RuntimeTool[] => {
  return [
    ...createSkillFileRuntimeTools(skills),
    ...createSkillCommandRuntimeTools(skills, options.executeSkillCommand),
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
