import type { ComputedRef, Ref } from 'vue'
import { isRef, unref } from 'vue'
import type { SkillPluginOptions, SkillRequestContext, SkillSelection } from '../../../message/plugins'
import { getSkillRequestContext, skillPlugin as createCoreSkillPlugin } from '../../../message/plugins'
import type { BasePluginContext as CoreBasePluginContext } from '../../../message/types'
import type { SkillCandidate, SkillDefinition } from '../../../skills/types'
import type { MaybePromise } from '../../../types'
import type { BasePluginContext, UseMessagePlugin } from '../types'
import type { VueMessagePluginRuntime } from '../types.internal'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>
export type UseMessageSkillPluginOptions = UseMessagePlugin & {
  /**
   * 当前 skill 选择模式，默认 manual。支持普通值、ref 或 computed。
   */
  mode?: MaybeRef<'manual' | 'auto' | 'none' | undefined>
  /**
   * skills 支持普通数组、ref 或 computed。
   *
   * manual 模式下表示已经选中的完整 skills，不建议和 skillNames 同时传。
   * auto 模式下表示候选 skill 集合，同时作为默认 getSkillByName 来源，不建议和 getSkillCandidates / getSkillByName 同时传。
   * 传入 selection 时，skills 只作为默认候选集合和 getSkillByName 来源。
   */
  skills?: MaybeRef<SkillDefinition[] | undefined>
  /**
   * manual 模式下最终启用的 skill names。支持普通数组、ref 或 computed。
   *
   * 只用于 manual 模式。使用 skillNames 时需要提供 getSkillByName。
   * auto 模式请使用 preferredSkillNames。
   */
  skillNames?: MaybeRef<string[] | undefined>
  /**
   * auto 模式下的 preferred skill names。支持普通数组、ref 或 computed。
   */
  preferredSkillNames?: MaybeRef<string[] | undefined>
  /**
   * auto 模式下最多启用的 skill 数。支持普通值、ref 或 computed。
   */
  maxSelectedSkills?: MaybeRef<number | undefined>
  /**
   * 高级入口，类型与 core skillPlugin 的 selection 一致。
   *
   * 传入后会覆盖顶层 mode / skillNames / preferredSkillNames / maxSelectedSkills 配置。
   * 需要响应式时请使用 getter，在函数内读取 ref；静态配置可直接传 plain object。
   */
  selection?: SkillSelection | ((context: BasePluginContext) => MaybePromise<SkillSelection>)
  /**
   * auto 模式下提供候选摘要。不建议和 skills 同时传。
   */
  getSkillCandidates?: (context: BasePluginContext) => MaybePromise<SkillCandidate[]>
  /**
   * 根据 name 解析完整 skill。
   *
   * manual + skillNames、auto + getSkillCandidates 时需要提供。
   * 如果传了 skills 且没有传 getSkillByName，会默认从 skills 中按 name 查找。
   */
  getSkillByName?: (name: string, context: BasePluginContext) => MaybePromise<SkillDefinition | undefined>
  /**
   * skills 解析并转换为请求上下文后触发。
   */
  onSkillsResolved?: (skillContext: SkillRequestContext, context: BasePluginContext) => MaybePromise<void>
  /**
   * 新的 skill instructions 生成并写入 skill context 后立即触发。
   */
  onInstructionsResolved?: (skillContext: SkillRequestContext, context: BasePluginContext) => MaybePromise<void>
  /**
   * auto 模式下，模型通过 select_skills 工具选择 skill names 后触发。
   */
  onSkillSelectionResolved?: (
    event: {
      mode: 'auto'
      candidates: SkillCandidate[]
      preferredSkillNames?: string[]
      requestedSkillNames: string[]
    },
    context: BasePluginContext,
  ) => MaybePromise<void>
}

const resolveSkillSource = (source: MaybeRef<SkillDefinition[] | undefined>) => {
  return isRef(source) ? (unref(source) as SkillDefinition[] | undefined) : source
}

const resolveRef = <T>(source: MaybeRef<T> | undefined): T | undefined => {
  if (source === undefined) {
    return undefined
  }

  return isRef(source) ? (unref(source) as T) : source
}

const resolveTopLevelSelection = (options: {
  mode: MaybeRef<'manual' | 'auto' | 'none' | undefined> | undefined
  skillNames: MaybeRef<string[] | undefined> | undefined
  skills: MaybeRef<SkillDefinition[] | undefined> | undefined
  preferredSkillNames: MaybeRef<string[] | undefined> | undefined
  maxSelectedSkills: MaybeRef<number | undefined> | undefined
}): SkillSelection => {
  const resolvedMode = resolveRef(options.mode) ?? 'manual'

  if (resolvedMode === 'manual') {
    const resolvedSkillNames = resolveRef(options.skillNames)

    if (resolvedSkillNames !== undefined) {
      return {
        mode: 'manual',
        skillNames: resolvedSkillNames,
      }
    }

    return {
      mode: 'manual',
      skills: resolveSkillSource(options.skills) ?? [],
    }
  }

  if (resolvedMode === 'auto') {
    return {
      mode: 'auto',
      preferredSkillNames: resolveRef(options.preferredSkillNames),
      maxSelectedSkills: resolveRef(options.maxSelectedSkills),
    }
  }

  return {
    mode: 'none',
  }
}

export const skillPlugin = (options: UseMessageSkillPluginOptions): UseMessagePlugin => {
  const {
    selection,
    mode,
    skillNames,
    preferredSkillNames,
    maxSelectedSkills,
    skills,
    getSkillCandidates,
    getSkillByName,
    onInstructionsResolved,
    onSkillsResolved,
    onSkillSelectionResolved,
    ...restOptions
  } = options

  return {
    name: 'skill',
    __corePluginFactory(runtime: VueMessagePluginRuntime) {
      const toVueContext = (context: CoreBasePluginContext) => runtime.createVueBaseContext(context)
      const resolveSelection = async (context: CoreBasePluginContext): Promise<SkillSelection> => {
        if (selection) {
          const vueContext = toVueContext(context)
          return typeof selection === 'function' ? await selection(vueContext) : selection
        }

        return resolveTopLevelSelection({
          mode,
          skillNames,
          skills,
          preferredSkillNames,
          maxSelectedSkills,
        })
      }

      // Vue selection is resolved at request time, so core validates resolver requirements at runtime.
      return createCoreSkillPlugin({
        ...runtime.createCorePlugin(restOptions),
        selection: resolveSelection,
        onInstructionsResolved: onInstructionsResolved
          ? (skillContext, context) => onInstructionsResolved(skillContext, toVueContext(context))
          : undefined,
        getSkillCandidates: getSkillCandidates
          ? (context) => getSkillCandidates(toVueContext(context))
          : skills !== undefined
            ? () => resolveSkillSource(skills) ?? []
            : undefined,
        getSkillByName: getSkillByName
          ? (name, context) => getSkillByName(name, toVueContext(context))
          : skills !== undefined
            ? (name) => resolveSkillSource(skills)?.find((skill) => skill.name === name)
            : undefined,
        onSkillsResolved: onSkillsResolved
          ? (skillContext, context) => onSkillsResolved(skillContext, toVueContext(context))
          : undefined,
        onSkillSelectionResolved: onSkillSelectionResolved
          ? (event, context) => onSkillSelectionResolved(event, toVueContext(context))
          : undefined,
      } as SkillPluginOptions)
    },
  } as UseMessagePlugin
}

export { getSkillRequestContext }
export type { SkillRequestContext, SkillSelection }
