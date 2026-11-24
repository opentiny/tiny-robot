import { expectTypeOf, test } from 'vitest'
import {
  skillPlugin,
  type SkillPluginOptions,
  type LegacySkillPluginOptions,
  type SessionSkillPluginOptions,
  type BasePluginContext,
} from '../../core'
import type { SkillDefinition } from '../types'
import { isSkillContextMessage, type SkillRequestMetadata, type SkillLoadResult } from '../../index'

const skill: SkillDefinition = { name: 'A', description: 'summary', instructions: 'instructions' }
const sources = { getSkillCandidates: () => [skill], getSkillByName: () => skill }

test('preserves legacy conditionals, generic options, and public session types', () => {
  const old: LegacySkillPluginOptions<{ mode: 'none' }> = { selection: { mode: 'none' } }
  skillPlugin(old)
  expectTypeOf<SkillPluginOptions['selection']>().toEqualTypeOf<NonNullable<SkillPluginOptions['selection']>>()
  skillPlugin<{ mode: 'manual'; skills: SkillDefinition[] }>({ selection: { mode: 'manual', skills: [skill] } })
  skillPlugin({ selection: { mode: 'auto' }, ...sources })
  skillPlugin<{ mode: 'none' }>({ selection: async () => ({ mode: 'none' as const }) })
  const session = {
    scope: 'session',
    sessionId: 'chat',
    deduplication: 'context',
    explicitSkillLoading: 'model',
    ...sources,
  } satisfies SessionSkillPluginOptions
  skillPlugin(session)
  skillPlugin({
    scope: 'session',
    getSkillCandidates: (context) => {
      expectTypeOf(context).toEqualTypeOf<BasePluginContext>()
      return [skill]
    },
    getSkillByName: () => skill,
  })
  const metadata: SkillRequestMetadata = { tinyRobotSkill: { requestedSkillNames: ['A'] } }
  expectTypeOf(isSkillContextMessage({ role: 'user', metadata })).toEqualTypeOf<boolean>()
  expectTypeOf<SkillLoadResult>().toHaveProperty('skill')
})

test('rejects incomplete or mixed public options, including variables', () => {
  // @ts-expect-error auto still requires its resolver
  skillPlugin({ selection: { mode: 'auto' }, getSkillCandidates: () => [skill] })
  // @ts-expect-error manual names still require a resolver
  skillPlugin({ selection: { mode: 'manual', skillNames: ['A'] } })
  // @ts-expect-error an explicit session id must be a string
  skillPlugin({ scope: 'session', sessionId: 1, ...sources })
  // @ts-expect-error session requires candidates
  skillPlugin({ scope: 'session', sessionId: 'chat', getSkillByName: () => skill })
  // @ts-expect-error unknown deduplication
  skillPlugin({ scope: 'session', sessionId: 'chat', deduplication: 'always', ...sources })
  // @ts-expect-error explicit loading is only configurable in session mode
  skillPlugin({ selection: { mode: 'none' }, explicitSkillLoading: 'model' })
  const mixed = { scope: 'session' as const, sessionId: 'chat', selection: { mode: 'none' as const }, ...sources }
  // @ts-expect-error variables cannot mix the two branches
  skillPlugin(mixed)
  // @ts-expect-error legacy calls cannot take session settings
  const invalid: SkillPluginOptions = { selection: { mode: 'none' }, deduplication: 'none' }
  void invalid
})
