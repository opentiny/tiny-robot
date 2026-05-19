import { isRef, unref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { skillPlugin as createCoreSkillPlugin } from '../../../message/plugins'
import type { SkillPluginState } from '../../../message/plugins'
import type { MaybePromise } from '../../../types'
import type { SkillDefinition } from '../../../skills/types'
import type { VueMessagePluginRuntime } from '../types.internal'
import type { BasePluginContext, UseMessagePlugin } from '../types'

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
   * skills 解析并转换为插件状态后触发。
   */
  onSkillsResolved?: (state: SkillPluginState, context: BasePluginContext) => MaybePromise<void>
}

const resolveSkillSource = (source: VueSkillSourceRef): VueSkillSource => {
  return isRef(source) ? (unref(source) as VueSkillSource) : source
}

export const skillPlugin = (options: UseMessageSkillPluginOptions): UseMessagePlugin => {
  const { skills, getSkills, onSkillsResolved, ...restOptions } = options

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
        onSkillsResolved: onSkillsResolved
          ? (state, context) => onSkillsResolved(state, runtime.createVueBaseContext(context))
          : undefined,
      })
    },
  } as UseMessagePlugin
}
