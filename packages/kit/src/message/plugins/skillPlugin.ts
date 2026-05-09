import type { ChatCompletionFunctionTool } from 'openai/resources'
import type { MaybePromise } from '../../types'
import type { BasePluginContext, BeforeRequestContext, MessageEnginePlugin } from '../types'
import type { SkillFileResource } from '../skills/types'
import type { RuntimeTool, ToolProvider } from './toolPlugin'

/**
 * TODO(skillPlugin):
 * 1. 为 read_skill_file 增加长度限制和可配置截断策略，避免超长文件一次性进入上下文。
 *    Add size limits and configurable truncation for read_skill_file to avoid injecting
 *    oversized files into context in one call.
 * 2. 实现 skill files 消费策略：支持文件选择、去重、上下文格式化与长度控制。
 *    Implement skill files consumption strategy: file selection, deduplication,
 *    context formatting, and length control.
 * 3. 增加 Vue 层状态暴露封装：将当前 active skills 同步给 UI 展示或调试面板。
 *    Expose Vue-side state for active skills so UI/debug panels can display them.
 * 4. 补充测试：覆盖 getActiveSkills、customContext 写入、compileSkills 调用、
 *    重名 skill 去重、未知 skill 忽略以及和其他插件的 hook 顺序。
 *    Add tests for getActiveSkills, customContext state, compileSkills,
 *    duplicate skill deduplication, unknown skill ignoring, and plugin hook ordering.
 */

/**
 * Skill 解析上下文。
 *
 * 用于由业务侧通过统一入口决定当前 turn 应激活哪些 skills。
 * 具体激活来源可以是 UI 勾选、规则匹配、模型选择、后端策略或 skills 管理工具。
 */
export interface SkillResolveContext extends BasePluginContext {
  /**
   * 当前插件持有的全部 skill 定义。
   */
  skills: SkillDefinition[]
}

/**
 * 单个 Skill 的运行时上下文。
 *
 * 用于动态生成 instructions、tools，或在回调中读取当前已激活的 skill 列表。
 */
export interface SkillRuntimeContext extends BasePluginContext {
  /**
   * 当前正在处理的 skill。
   */
  skill: SkillDefinition
  /**
   * 当前 turn 已激活的全部 skills。
   */
  activeSkills: SkillDefinition[]
}

/**
 * Skill 定义。
 *
 * Skill 是一组提示词、工具和文件上下文的能力包。它最终通常会被编译为：
 * - system/developer prompt
 * - requestBody.tools
 * - 可按需读取的文件上下文
 *
 * 当前插件先提供类型和生命周期框架，具体编译策略后续再实现。
 */
export interface SkillDefinition {
  /**
   * Skill 唯一名称。用于激活、去重、调试和持久化。
   */
  name: string
  /**
   * Skill 能力描述。可用于自动匹配，也可作为模型选择 skill 时的说明。
   */
  description: string
  /**
   * 注入给模型的 skill 指令。
   *
   * 后续可在 onBeforeRequest 中编译为 system/developer message。
   */
  instructions?: string | ((context: SkillRuntimeContext) => MaybePromise<string>)
  /**
   * Skill 暴露的工具列表。
   *
   * 后续可在 onBeforeRequest 中合并到 requestBody.tools，并复用 toolPlugin 执行 tool_calls。
   */
  tools?: ChatCompletionFunctionTool[] | ((context: SkillRuntimeContext) => MaybePromise<ChatCompletionFunctionTool[]>)
  /**
   * Skill 目录下除入口文件和工具配置外的文件数据。
   *
   * files 表示 skill 自带的静态文件全集；本轮选择哪些文件应由编译策略决定。
   */
  files?: SkillFileResource[]
  /**
   * 业务侧自定义元数据。
   */
  metadata?: Record<string, unknown>
}

/**
 * 本轮 skill 解析结果。
 *
 * 该对象会写入 customContext.__tiny_robot_skill，供后续插件或业务回调读取。
 */
export interface SkillPluginState {
  /**
   * 当前 turn 激活的 skill 定义。
   */
  activeSkills: SkillDefinition[]
  /**
   * 当前 turn 激活的 skill 名称。便于展示、日志和序列化。
   */
  activeSkillNames: string[]
  /**
   * 当前 turn 的运行时工具。
   *
   * 由 toolPlugin.getTools(context) 读取并统一注入、执行。
   */
  runtimeTools?: RuntimeTool[]
}

/**
 * Skill 引用。
 *
 * 可以传入 skill name，也可以直接传入 SkillDefinition。
 * 传入 name 时会从 options.skills 中查找；查不到的名称会被忽略。
 */
type SkillRef = string | SkillDefinition

/**
 * skillPlugin 配置项。
 */
export type SkillPluginOptions = MessageEnginePlugin & {
  /**
   * 可用 skill 列表。
   */
  skills: SkillDefinition[]
  /**
   * 获取当前 turn 激活的 skills。
   *
   * 这是 skillPlugin 唯一的激活入口。UI 选择、规则匹配、模型选择、后端策略
   * 或独立的 skills 管理工具都应在外部收敛为这个结果，插件不关心激活来源。
   */
  getActiveSkills?: (context: SkillResolveContext) => MaybePromise<SkillRef[] | undefined>
  /**
   * Skill 解析完成后触发。
   *
   * 可用于记录日志、同步 UI 状态或调试激活结果。
   */
  onSkillsResolved?: (state: SkillPluginState, context: BasePluginContext) => MaybePromise<void>
  /**
   * 单个 skill 被激活时触发。
   */
  onSkillActivated?: (
    skill: SkillDefinition,
    context: BasePluginContext & { activeSkills: SkillDefinition[] },
  ) => MaybePromise<void>
  /**
   * 请求前的 skill 编译钩子。
   *
   * 当前插件暂不内置 prompt/tools 注入策略，业务侧可以先在这里实验编译逻辑。
   * 后续稳定后再沉淀为内置实现。
   */
  compileSkills?: (state: SkillPluginState, context: BeforeRequestContext) => MaybePromise<void>
}

const uniqueSkills = (skills: SkillDefinition[]) => {
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

const skillPluginContextKey = '__tiny_robot_skill'

const skillFileToolNames = {
  listSkillFiles: 'list_skill_files',
  readSkillFile: 'read_skill_file',
} as const

const skillFileTools: Array<RuntimeTool['tool']> = [
  {
    type: 'function',
    function: {
      name: skillFileToolNames.listSkillFiles,
      description: 'List files available from the active skills.',
      parameters: {
        type: 'object',
        properties: {
          skillName: {
            type: 'string',
            description: 'Optional active skill name. When omitted, files from all active skills are listed.',
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
      description: 'Read a file from an active skill by skill name and relative path.',
      parameters: {
        type: 'object',
        properties: {
          skillName: {
            type: 'string',
            description: 'Active skill name that owns the file.',
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

const hasActiveSkillFiles = (skills: SkillDefinition[]) => skills.some((skill) => Boolean(skill.files?.length))

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

const createSkillFileRuntimeTools = (activeSkills: SkillDefinition[]): RuntimeTool[] => {
  if (!hasActiveSkillFiles(activeSkills)) {
    return []
  }

  const findSkill = (skillName?: unknown) => {
    if (typeof skillName !== 'string' || !skillName) {
      return undefined
    }

    return activeSkills.find((skill) => skill.name === skillName)
  }

  return [
    {
      tool: skillFileTools[0],
      handler: (toolCall) => {
        const toolArguments = parseSkillToolArguments(toolCall)
        const skill = findSkill(toolArguments.skillName)
        const skills = skill ? [skill] : activeSkills

        return {
          files: skills.flatMap((activeSkill) =>
            (activeSkill.files ?? []).map((file) => getSkillFileSummary(activeSkill.name, file)),
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

const compileActiveSkills = async (state: SkillPluginState, context: BeforeRequestContext) => {
  const instructions: string[] = []

  for (const skill of state.activeSkills) {
    const runtimeContext: SkillRuntimeContext = {
      ...context,
      skill,
      activeSkills: state.activeSkills,
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

export const skillPlugin = (options: SkillPluginOptions): MessageEnginePlugin => {
  const { skills, getActiveSkills, onSkillsResolved, onSkillActivated, compileSkills, ...restOptions } = options

  const skillMap = new Map(skills.map((skill) => [skill.name, skill]))

  const resolveSkillRefs = (skillRefs: SkillRef[] = []) => {
    const activeSkills = skillRefs
      .map((skill) => {
        if (typeof skill === 'string') {
          return skillMap.get(skill)
        }

        return skill
      })
      .filter((skill): skill is SkillDefinition => Boolean(skill))

    return uniqueSkills(activeSkills)
  }

  const resolveActiveSkills = async (context: BasePluginContext) => {
    const resolveContext: SkillResolveContext = { ...context, skills }
    return resolveSkillRefs(await getActiveSkills?.(resolveContext))
  }

  const provideSkillTools = async (context: BasePluginContext) => {
    const state = context.customContext[skillPluginContextKey] as SkillPluginState | undefined
    if (!state) {
      return []
    }

    const skillTools: ChatCompletionFunctionTool[] = []
    for (const skill of state.activeSkills) {
      const runtimeContext: SkillRuntimeContext = {
        ...context,
        skill,
        activeSkills: state.activeSkills,
      }
      skillTools.push(...(await resolveSkillTools(skill, runtimeContext)))
    }

    return [...(state.runtimeTools ?? []), ...skillTools]
  }

  return {
    name: 'skill',
    ...restOptions,
    provideTools: provideSkillTools,
    onTurnStart: async (context) => {
      const activeSkills = await resolveActiveSkills(context)
      const runtimeTools = createSkillFileRuntimeTools(activeSkills)
      const state: SkillPluginState = {
        activeSkills,
        activeSkillNames: activeSkills.map((skill) => skill.name),
        runtimeTools: runtimeTools.length ? runtimeTools : undefined,
      }

      context.setCustomContext({ [skillPluginContextKey]: state })

      for (const skill of activeSkills) {
        await onSkillActivated?.(skill, { ...context, activeSkills })
      }

      await onSkillsResolved?.(state, context)
      return restOptions.onTurnStart?.(context)
    },
    onBeforeRequest: async (context) => {
      const state = context.customContext[skillPluginContextKey] as SkillPluginState | undefined

      if (state) {
        await compileActiveSkills(state, context)
        await compileSkills?.(state, context)
      }

      return restOptions.onBeforeRequest?.(context)
    },
  } as MessageEnginePlugin & ToolProvider
}
