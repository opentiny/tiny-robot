import { expectTypeOf, test } from 'vitest'
import { computed, ref } from 'vue'
import {
  skillPlugin,
  type UseMessageSkillPluginOptions,
  type UseMessageSessionSkillPluginOptions,
  type BasePluginContext,
} from '../../index'

const skills = ref([{ name: 'A', description: 'summary', instructions: 'instructions' }])
const sources = { getSkillCandidates: () => skills.value, getSkillByName: () => skills.value[0] }

test('keeps reactive legacy inputs and common lifecycle indexed access', () => {
  const hook: NonNullable<UseMessageSkillPluginOptions['onBeforeRequest']> = (context) => {
    expectTypeOf(context.messages).toBeArray()
  }
  skillPlugin({ skills, mode: ref('manual'), onBeforeRequest: hook })
  skillPlugin({
    mode: computed(() => 'auto' as const),
    skills,
    preferredSkillNames: ref(['A']),
    maxSelectedSkills: ref(2),
  })
  skillPlugin({ skillNames: computed(() => ['A']), getSkillByName: () => skills.value[0] })
  skillPlugin({ selection: () => ({ mode: 'manual', skills: skills.value }) })
  const session: UseMessageSessionSkillPluginOptions = {
    scope: 'session',
    sessionId: 'chat',
    explicitSkillLoading: 'preload',
    ...sources,
    onBeforeRequest: hook,
  }
  skillPlugin(session)
  skillPlugin({
    scope: 'session',
    getSkillCandidates: (context) => {
      expectTypeOf(context).toEqualTypeOf<BasePluginContext>()
      return skills.value
    },
    getSkillByName: () => skills.value[0],
  })
})

test('rejects mixed vue session options and unsupported reactive settings', () => {
  const mixed = { scope: 'session' as const, sessionId: 'chat', skills, ...sources }
  // @ts-expect-error legacy reactive skills cannot be mixed into a session
  skillPlugin(mixed)
  // @ts-expect-error legacy injection hook is not a session hook
  skillPlugin({ scope: 'session', sessionId: 'chat', ...sources, onInstructionsResolved: () => {} })
  // @ts-expect-error session identity is not reactive
  skillPlugin({ scope: 'session', sessionId: ref('chat'), ...sources })
  // @ts-expect-error unknown explicit loading mode
  skillPlugin({ scope: 'session', sessionId: 'chat', explicitSkillLoading: 'always', ...sources })
  // @ts-expect-error scope is required for session-only options
  skillPlugin({ sessionId: 'chat', deduplication: 'context', ...sources })
})

test('preserves interface extension of the legacy public options', () => {
  interface BusinessSkillOptions extends UseMessageSkillPluginOptions {
    feature?: boolean
  }
  const options: BusinessSkillOptions = { mode: 'manual', skills, feature: true }
  skillPlugin(options)
  expectTypeOf(options.mode).toEqualTypeOf<UseMessageSkillPluginOptions['mode']>()
})
