import { compileSkillInstructions, createSkillRuntimeTools } from '../../skills/compiler'
import type { SkillCommandRequest, SkillCommandResult } from '../../skills/compiler'
import type { SkillDefinition } from '../../skills/types'
import type { MaybePromise } from '../../types'
import type { BasePluginContext, MessageEnginePlugin } from '../types'
import type { RuntimeTool, ToolProvider } from './toolPlugin'

/**
 * Skill 插件的转换状态。
 *
 * 该状态会写入 customContext.__tiny_robot_skill，供消息钩子和插件回调读取同一份编译结果。
 */
export interface SkillPluginState {
  skills: SkillDefinition[]
  skillNames: string[]
  runtimeTools: RuntimeTool[]
}

/**
 * 将已选择的 skills 转换为消息指令和工具的配置项。
 */
export type SkillPluginOptions = MessageEnginePlugin & {
  /**
   * 返回本次请求要使用的 skills。
   *
   * 插件只转换返回的 skills；选择、存储和集合管理由调用方负责。
   */
  getSkills?: (context: BasePluginContext) => MaybePromise<SkillDefinition[] | undefined>
  /**
   * 执行模型为某个 skill 规划的后端命令。
   *
   * @experimental 该 API 仍在设计和验证中，命令协议、返回结构和安全边界后续可能调整。
   *
   * 插件只负责暴露 execute_skill_command 并转发参数；沙箱、镜像和权限控制由调用方实现。
   */
  executeSkillCommand?: (request: SkillCommandRequest, context: BasePluginContext) => MaybePromise<SkillCommandResult>
  /**
   * skills 解析并规整为插件状态后触发。
   */
  onSkillsResolved?: (state: SkillPluginState, context: BasePluginContext) => MaybePromise<void>
}

const skillPluginContextKey = '__tiny_robot_skill'

export const skillPlugin = (options: SkillPluginOptions): MessageEnginePlugin & ToolProvider => {
  const { getSkills, executeSkillCommand, onSkillsResolved, ...restOptions } = options

  return {
    name: 'skill',
    ...restOptions,
    provideTools: async (context: BasePluginContext) => {
      const state = context.customContext[skillPluginContextKey] as SkillPluginState | undefined
      return state?.runtimeTools ?? []
    },
    onTurnStart: async (context) => {
      const skills = (await getSkills?.(context)) ?? []
      const state: SkillPluginState = {
        skills,
        skillNames: skills.map((skill) => skill.name),
        runtimeTools: createSkillRuntimeTools(skills, {
          executeSkillCommand: executeSkillCommand && ((request) => executeSkillCommand(request, context)),
        }),
      }

      context.setCustomContext({ [skillPluginContextKey]: state })

      await onSkillsResolved?.(state, context)
      return restOptions.onTurnStart?.(context)
    },
    onBeforeRequest: async (context) => {
      const state = context.customContext[skillPluginContextKey] as SkillPluginState | undefined

      if (state) {
        const skillInstructions = await compileSkillInstructions(state.skills)
        if (skillInstructions) {
          context.requestBody.messages = [skillInstructions, ...context.requestBody.messages]
        }
      }

      return restOptions.onBeforeRequest?.(context)
    },
  } satisfies MessageEnginePlugin & ToolProvider
}
