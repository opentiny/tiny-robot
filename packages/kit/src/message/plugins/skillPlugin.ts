import type { MaybePromise } from '../../types'
import type { BasePluginContext, MessageEnginePlugin } from '../types'
import { compileSkillInstructions, compileSkillTools, createSkillCompilerState } from '../../skills/compiler'
import type { SkillCompilerState } from '../../skills/compiler'
import type { SkillDefinition } from '../../skills/types'
import type { ToolProvider } from './toolPlugin'

/**
 * Skill 插件的转换状态。
 *
 * 该状态会写入 customContext.__tiny_robot_skill，供消息钩子和插件回调读取同一份编译结果。
 */
export type SkillPluginState = SkillCompilerState

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
   * skills 解析并规整为编译状态后触发。
   */
  onSkillsResolved?: (state: SkillPluginState, context: BasePluginContext) => MaybePromise<void>
}

const skillPluginContextKey = '__tiny_robot_skill'

export const skillPlugin = (options: SkillPluginOptions): MessageEnginePlugin & ToolProvider => {
  const { getSkills, onSkillsResolved, ...restOptions } = options

  return {
    name: 'skill',
    ...restOptions,
    provideTools: async (context: BasePluginContext) => {
      const state = context.customContext[skillPluginContextKey] as SkillPluginState | undefined
      return state ? compileSkillTools(state) : []
    },
    onTurnStart: async (context) => {
      const state = createSkillCompilerState((await getSkills?.(context)) ?? [])

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
