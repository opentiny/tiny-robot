import type { ChatCompletionFunctionTool } from 'openai/resources'
import type { BasePluginContext, BeforeRequestContext } from '../message/types'
import type { RuntimeTool, ToolProviderItem } from '../message/plugins/toolPlugin'
import type { SkillDefinition, SkillFileResource, SkillRuntimeContext } from './types'

export interface SkillCompilerState {
  /**
   * 当前 turn 的 skill 定义。
   */
  skills: SkillDefinition[]
  /**
   * 当前 turn 的 skill 名称。便于展示、日志和序列化。
   */
  skillNames: string[]
  /**
   * 当前 turn 的运行时工具。
   */
  runtimeTools?: RuntimeTool[]
}

export const uniqueSkills = (skills: SkillDefinition[]) => {
  const result: SkillDefinition[] = []
  const names = new Set<string>()

  for (const skill of skills) {
    if (names.has(skill.name)) {
      continue
    }

    names.add(skill.name)
    result.push(skill)
  }

  return result
}

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

const hasSkillFiles = (skills: SkillDefinition[]) => skills.some((skill) => Boolean(skill.files?.length))

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

export const createSkillFileRuntimeTools = (skills: SkillDefinition[]): RuntimeTool[] => {
  if (!hasSkillFiles(skills)) {
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

export const createSkillCompilerState = (skills: SkillDefinition[]): SkillCompilerState => {
  const uniqueSkillList = uniqueSkills(skills)
  const runtimeTools = createSkillFileRuntimeTools(uniqueSkillList)

  return {
    skills: uniqueSkillList,
    skillNames: uniqueSkillList.map((skill) => skill.name),
    runtimeTools: runtimeTools.length ? runtimeTools : undefined,
  }
}

const resolveSkillInstructions = async (skill: SkillDefinition, context: SkillRuntimeContext) => {
  if (!skill.instructions) {
    return ''
  }

  const instructions = typeof skill.instructions === 'function' ? await skill.instructions(context) : skill.instructions
  return instructions.trim()
}

const resolveSkillTools = async (skill: SkillDefinition, context: SkillRuntimeContext) => {
  if (!skill.tools) {
    return []
  }

  return typeof skill.tools === 'function' ? await skill.tools(context) : skill.tools
}

export const compileSkillInstructions = async (
  state: Pick<SkillCompilerState, 'skills'>,
  context: BeforeRequestContext,
) => {
  const instructions: string[] = []

  for (const skill of state.skills) {
    const runtimeContext: SkillRuntimeContext = {
      ...context,
      skill,
      skills: state.skills,
    }

    const instruction = await resolveSkillInstructions(skill, runtimeContext)
    if (instruction) {
      instructions.push(`## ${skill.name}\n\n${instruction}`)
    }
  }

  if (instructions.length > 0) {
    context.requestBody.messages = [
      {
        role: 'system',
        content: ['Apply these skill instructions when generating the response.', ...instructions].join('\n\n'),
      },
      ...context.requestBody.messages,
    ]
  }
}

export const compileSkillTools = async (
  state: Pick<SkillCompilerState, 'skills' | 'runtimeTools'>,
  context: BasePluginContext,
): Promise<ToolProviderItem[]> => {
  const skillTools: ChatCompletionFunctionTool[] = []

  for (const skill of state.skills) {
    const runtimeContext: SkillRuntimeContext = {
      ...context,
      skill,
      skills: state.skills,
    }

    skillTools.push(...(await resolveSkillTools(skill, runtimeContext)))
  }

  return [...(state.runtimeTools ?? []), ...skillTools]
}
