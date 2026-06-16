import type { ComputedRef, Ref } from 'vue'
import { isRef, unref } from 'vue'
import type { SkillRequestContext, SkillSelection } from '../../../message/plugins'
import { skillPlugin as createCoreSkillPlugin } from '../../../message/plugins'
import type { BasePluginContext as CoreBasePluginContext } from '../../../message/types'
import type { SkillCandidate, SkillDefinition } from '../../../skills/types'
import type { MaybePromise } from '../../../types'
import type { BasePluginContext, UseMessagePlugin } from '../types'
import type { VueMessagePluginRuntime } from '../types.internal'

type VueSkillSource = SkillDefinition[] | undefined
type VueSkillSourceRef = VueSkillSource | Ref<VueSkillSource> | ComputedRef<VueSkillSource>

type VueSkillSelectionOptions =
  | {
      mode: 'manual'
      skillNames: string[]
    }
  | {
      mode: 'auto'
      preferredSkillNames?: string[]
      maxSelectedSkills?: number
    }
  | {
      mode: 'none'
    }

export type UseMessageSkillPluginOptions = UseMessagePlugin & {
  /**
   * Controls how skills are selected for the current turn.
   */
  selection?: VueSkillSelectionOptions | ((context: BasePluginContext) => MaybePromise<VueSkillSelectionOptions>)
  /**
   * 当前请求要使用的 skills。支持普通数组、ref 或 computed。
   */
  skills?: VueSkillSourceRef
  /**
   * 动态返回当前请求要使用的 skills。
   */
  getSkills?: (context: BasePluginContext) => MaybePromise<VueSkillSourceRef>
  /**
   * 自动选择时提供候选摘要。
   */
  getSkillCandidates?: (context: BasePluginContext) => MaybePromise<SkillCandidate[]>
  /**
   * 根据 name 解析完整 skill。manual 和 auto 最终都会通过它取得 SkillDefinition。
   */
  getSkillByName?: (name: string, context: BasePluginContext) => MaybePromise<SkillDefinition | undefined>
  /**
   * skills 解析并转换为请求上下文后触发。
   */
  onSkillsResolved?: (skillContext: SkillRequestContext, context: BasePluginContext) => MaybePromise<void>
}

const resolveSkillSource = (source: VueSkillSourceRef): VueSkillSource => {
  return isRef(source) ? (unref(source) as VueSkillSource) : source
}

export const skillPlugin = (options: UseMessageSkillPluginOptions): UseMessagePlugin => {
  const { selection, skills, getSkills, getSkillCandidates, getSkillByName, onSkillsResolved, ...restOptions } = options

  return {
    name: 'skill',
    __corePluginFactory(runtime: VueMessagePluginRuntime) {
      const toVueContext = (context: CoreBasePluginContext) => runtime.createVueBaseContext(context)
      const resolveSelection = async (context: CoreBasePluginContext): Promise<SkillSelection> => {
        const vueContext = toVueContext(context)
        const vueSelection = typeof selection === 'function' ? await selection(vueContext) : selection

        if (!vueSelection) {
          const skillSource = getSkills ? await getSkills(vueContext) : skills
          const resolvedSkills = resolveSkillSource(skillSource) ?? []

          return {
            mode: 'manual',
            skillNames: resolvedSkills.map((skill) => skill.name),
          }
        }

        if (vueSelection.mode === 'manual') {
          return {
            mode: 'manual',
            skillNames: vueSelection.skillNames,
          }
        }

        if (vueSelection.mode === 'auto') {
          return {
            mode: 'auto',
            preferredSkillNames: vueSelection.preferredSkillNames,
            maxSelectedSkills: vueSelection.maxSelectedSkills,
          }
        }

        return {
          mode: 'none',
        }
      }

      return createCoreSkillPlugin({
        ...runtime.createCorePlugin(restOptions),
        selection: resolveSelection,
        getSkillCandidates: getSkillCandidates
          ? (context) => getSkillCandidates(toVueContext(context))
          : async (context) => {
              const vueContext = toVueContext(context)
              const skillSource = getSkills ? await getSkills(vueContext) : skills
              return resolveSkillSource(skillSource) ?? []
            },
        getSkillByName: getSkillByName
          ? (name, context) => getSkillByName(name, toVueContext(context))
          : async (name, context) => {
              const vueContext = toVueContext(context)
              const skillSource = getSkills ? await getSkills(vueContext) : skills
              return resolveSkillSource(skillSource)?.find((skill) => skill.name === name)
            },
        onSkillsResolved: onSkillsResolved
          ? (skillContext, context) => onSkillsResolved(skillContext, toVueContext(context))
          : undefined,
      })
    },
  } as UseMessagePlugin
}
