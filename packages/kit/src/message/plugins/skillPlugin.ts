import type { MaybePromise } from '../../types'
import type { BasePluginContext, BeforeRequestContext, MessageEnginePlugin } from '../types'
import { compileSkillInstructions, compileSkillTools, createSkillCompilerState } from '../../skills/compiler'
import type { SkillCompilerState } from '../../skills/compiler'
import type { SkillDefinition } from '../../skills/types'
import type { ToolProvider } from './toolPlugin'

/**
 * TODO(skillPlugin):
 * 1. 为 read_skill_file 增加长度限制和可配置截断策略，避免超长文件一次性进入上下文。
 *    Add size limits and configurable truncation for read_skill_file to avoid injecting
 *    oversized files into context in one call.
 * 2. 实现 skill files 消费策略：支持文件选择、去重、上下文格式化与长度控制。
 *    Implement skill files consumption strategy: file selection, deduplication,
 *    context formatting, and length control.
 * 3. 增加 Vue 层状态暴露封装：将当前 skills 同步给 UI 展示或调试面板。
 *    Expose Vue-side state for current skills so UI/debug panels can display them.
 * 4. 补充测试：覆盖 getSkills、customContext 写入、compileSkills 调用、
 *    重名 skill 去重以及和其他插件的 hook 顺序。
 *    Add tests for getSkills, customContext state, compileSkills,
 *    duplicate skill deduplication, and plugin hook ordering.
 */

/**
 * 本轮 skill 转换状态。
 *
 * 该对象会写入 customContext.__tiny_robot_skill，供后续插件或业务回调读取。
 */
export type SkillPluginState = SkillCompilerState

/**
 * skillPlugin 配置项。
 */
export type SkillPluginOptions = MessageEnginePlugin & {
  /**
   * 获取当前 turn 要转换的 skills。
   *
   * skillPlugin 不持有、不查询、不缓存可用 skill 列表。UI 选择、规则匹配、模型选择、后端策略
   * 或独立的 skills 管理工具都应在外部收敛为本轮要转换的 SkillDefinition 列表。
   */
  getSkills?: (context: BasePluginContext) => MaybePromise<SkillDefinition[] | undefined>
  /**
   * Skills 获取并去重完成后触发。
   *
   * 可用于记录日志、同步 UI 状态或调试本轮转换结果。
   */
  onSkillsResolved?: (state: SkillPluginState, context: BasePluginContext) => MaybePromise<void>
  /**
   * 请求前的 skill 编译钩子。
   *
   * 当前插件暂不内置 prompt/tools 注入策略，业务侧可以先在这里实验编译逻辑。
   * 后续稳定后再沉淀为内置实现。
   */
  compileSkills?: (state: SkillPluginState, context: BeforeRequestContext) => MaybePromise<void>
}

const skillPluginContextKey = '__tiny_robot_skill'

export const skillPlugin = (options: SkillPluginOptions): MessageEnginePlugin => {
  const { getSkills, onSkillsResolved, compileSkills, ...restOptions } = options

  const provideSkillTools = async (context: BasePluginContext) => {
    const state = context.customContext[skillPluginContextKey] as SkillPluginState | undefined
    return state ? compileSkillTools(state, context) : []
  }

  return {
    name: 'skill',
    ...restOptions,
    provideTools: provideSkillTools,
    onTurnStart: async (context) => {
      const state = createSkillCompilerState((await getSkills?.(context)) ?? [])

      context.setCustomContext({ [skillPluginContextKey]: state })

      await onSkillsResolved?.(state, context)
      return restOptions.onTurnStart?.(context)
    },
    onBeforeRequest: async (context) => {
      const state = context.customContext[skillPluginContextKey] as SkillPluginState | undefined

      if (state) {
        await compileSkillInstructions(state, context)
        await compileSkills?.(state, context)
      }

      return restOptions.onBeforeRequest?.(context)
    },
  } as MessageEnginePlugin & ToolProvider
}
