import type { ComputedRef, Ref } from 'vue'
import { isRef, unref } from 'vue'
import type { SkillRequestContext } from '../../../message/plugins'
import { skillPlugin as createCoreSkillPlugin } from '../../../message/plugins'
import type { SkillCommandRequest, SkillCommandResult } from '../../../skills/compiler'
import type { SkillDefinition } from '../../../skills/types'
import type { MaybePromise } from '../../../types'
import type { BasePluginContext, UseMessagePlugin } from '../types'
import type { VueMessagePluginRuntime } from '../types.internal'

export type VueSkillSource = SkillDefinition[] | undefined
export type VueSkillSourceRef = VueSkillSource | Ref<VueSkillSource> | ComputedRef<VueSkillSource>

export type UseMessageSkillPluginOptions = UseMessagePlugin & {
  /**
   * 当前请求要使用的 skills。支持普通数组、ref 或 computed。
   */
  skills?: VueSkillSourceRef
  /**
   * 动态返回当前请求要使用的 skills。
   */
  getSkills?: (context: BasePluginContext) => MaybePromise<VueSkillSourceRef>
  /**
   * 执行模型为某个 skill 规划的后端命令。
   *
   * @experimental 该 API 仍在设计和验证中，命令协议、返回结构和安全边界后续可能调整。
   */
  executeSkillCommand?: (request: SkillCommandRequest, context: BasePluginContext) => MaybePromise<SkillCommandResult>
  /**
   * skills 解析并转换为请求上下文后触发。
   */
  onSkillsResolved?: (skillContext: SkillRequestContext, context: BasePluginContext) => MaybePromise<void>
}

const resolveSkillSource = (source: VueSkillSourceRef): VueSkillSource => {
  return isRef(source) ? (unref(source) as VueSkillSource) : source
}

export const skillPlugin = (options: UseMessageSkillPluginOptions): UseMessagePlugin => {
  const { skills, getSkills, executeSkillCommand, onSkillsResolved, ...restOptions } = options

  return {
    name: 'skill',
    __corePluginFactory(runtime: VueMessagePluginRuntime) {
      return createCoreSkillPlugin({
        ...runtime.createCorePlugin(restOptions),
        getSkills: async (context) => {
          const vueContext = runtime.createVueBaseContext(context)
          const skillSource = getSkills ? await getSkills(vueContext) : skills
          return resolveSkillSource(skillSource)
        },
        executeSkillCommand: executeSkillCommand
          ? (request, context) => executeSkillCommand(request, runtime.createVueBaseContext(context))
          : undefined,
        onSkillsResolved: onSkillsResolved
          ? (skillContext, context) => onSkillsResolved(skillContext, runtime.createVueBaseContext(context))
          : undefined,
      })
    },
  } as UseMessagePlugin
}
