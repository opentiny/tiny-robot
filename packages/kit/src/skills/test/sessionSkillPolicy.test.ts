import { afterEach, describe, expect, it, vi } from 'vitest'
import { TOOL_RESUME_COMMAND } from '../../message/plugins'
import type { MessageRequestBody } from '../../message/types'
import { loadResults, optionsFor, reply, requestTool, sessionEngine } from './sessionTestUtils'

afterEach(() => vi.unstubAllGlobals())

describe('session skill execution policy', () => {
  it.each(['catalog', 'explicit'] as const)(
    'does not commit %s content after its plugin is disabled during preparation',
    async (phase) => {
      let started!: () => void
      const loading = new Promise<void>((resolve) => {
        started = resolve
      })
      let release!: () => void
      const blocked = new Promise<void>((resolve) => {
        release = resolve
      })
      let disabled = false
      const engine = sessionEngine(
        optionsFor({
          disabled: () => phase === 'explicit' && disabled,
          getSkillCandidates: async () => {
            if (phase === 'catalog') {
              started()
              await blocked
            }
            return [{ name: 'A', description: 'A summary' }]
          },
          getSkillByName: async () => {
            started()
            await blocked
            return { name: 'A', description: 'summary', instructions: 'A instructions' }
          },
        }),
        async (body) => {
          expect(loadResults(body.messages)).toEqual([])
          expect(body.tools ?? []).toEqual([])
          if (phase === 'catalog') expect(body.messages.map((message) => message.role)).toEqual(['user'])
          return reply()
        },
        [],
        { disabled: () => phase === 'catalog' && disabled },
      )
      const sending = engine.send({
        role: 'user',
        content: '@A',
        ...(phase === 'explicit' ? { metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } } } : {}),
      })
      await loading
      disabled = true
      release()
      await sending
    },
  )

  it('keeps late resource data out of an aborted turn', async () => {
    let started!: () => void
    const reading = new Promise<void>((resolve) => {
      started = resolve
    })
    let release!: (text: string) => void
    const pending = new Promise<string>((resolve) => {
      release = resolve
    })
    const engine = sessionEngine(
      optionsFor({
        getSkillByName: () => ({
          name: 'A',
          description: '',
          instructions: '',
          resources: [
            {
              path: 'guide.md',
              resourceId: 'guide.md',
              kind: 'text',
              readText: () => {
                started()
                return pending
              },
            },
          ],
        }),
      }),
      async () => reply('', [requestTool('read_skill_file', { skillName: 'A', path: 'guide.md' }, 'read-late')]),
    )
    const sending = engine.sendMessage('read')
    await reading
    await engine.abort()
    await sending
    release('late private data')
    await new Promise((resolve) => setImmediate(resolve))
    expect(engine.getState().messages.find((message) => message.role === 'tool')?.content).not.toContain(
      'late private data',
    )
    expect(engine.getState().messages.find((message) => message.role === 'assistant')?.state).toMatchObject({
      toolCall: { 'read-late': { status: 'cancelled' } },
    })
  })

  it('retains the original user metadata in a restored explicit-request turn', async () => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    })
    const config = optionsFor({
      onTurnResume: (context) => {
        expect(context.currentTurn.find((message) => message.metadata?.business === 'original')).toMatchObject({
          content: '@A original request',
        })
      },
    })
    const first = sessionEngine(
      config,
      async () => reply('', [requestTool('load_skills', { skillNames: ['B'] }, 'pause-B')]),
      [],
      { shouldPauseToolCall: () => true },
    )
    await first.send({
      role: 'user',
      content: '@A original request',
      metadata: { business: 'original', tinyRobotSkill: { requestedSkillNames: ['A'] } },
    })
    const restored = sessionEngine(config, async () => reply(), JSON.parse(JSON.stringify(first.getState().messages)))
    await restored.dispatchCommand(TOOL_RESUME_COMMAND, { toolCallId: 'pause-B' })
    expect(restored.getState().requestState).toBe('completed')
  })

  it('denies a runtime source disabled after tool collection', async () => {
    let disabled = false
    let round = 0
    const engine = sessionEngine(
      optionsFor({ disabled: () => disabled }),
      async () => (round++ === 0 ? reply('', [requestTool('load_skills', { skillNames: ['A'] })]) : reply()),
      [],
      {
        beforeCallTools: async () => {
          disabled = true
        },
      },
    )
    await engine.sendMessage('load A')
    expect(engine.getState().messages.find((message) => message.role === 'tool')).toMatchObject({
      content: 'Tool call disabled.',
    })
    expect(engine.getState().messages.find((message) => message.role === 'assistant')?.state).toMatchObject({
      toolCall: { load_skills: { status: 'denied' } },
    })
  })

  it('preloads explicitly requested Skills with tools disabled and retains the first preload', async () => {
    let disabled = true
    const engine = sessionEngine(
      optionsFor(),
      async (body) => {
        expect(body.messages.map((message) => message.role)).toEqual(
          disabled ? ['user', 'user'] : ['system', 'user', 'user', 'assistant', 'user', 'user'],
        )
        expect(loadResults(body.messages)).toMatchObject(
          disabled ? [{ name: 'A', instructions: 'A instructions' }] : [{ name: 'A' }, { name: 'B' }],
        )
        expect(
          body.tools?.some((tool) => tool.type === 'function' && tool.function.name === 'load_skills') ?? false,
        ).toBe(!disabled)
        return reply()
      },
      [],
      { disabled: () => disabled },
    )
    await engine.send({ role: 'user', content: '@A', metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } } })
    disabled = false
    await engine.send({ role: 'user', content: '@B now', metadata: { tinyRobotSkill: { requestedSkillNames: ['B'] } } })
    expect(engine.getState().messages.find((message) => message.content === '@A')).toMatchObject({
      metadata: { tinyRobotSkill: { preload: { result: { skills: [{ name: 'A', status: 'loaded' }] } } } },
    })
  })

  it('keeps projected model-mode requests stable across turns when tools are toggled', async () => {
    const requests: MessageRequestBody[] = []
    let disabled = false
    const engine = sessionEngine(
      optionsFor({ explicitSkillLoading: 'model' }),
      async (body) => {
        requests.push(structuredClone(body))
        return reply()
      },
      [],
      { disabled: () => disabled },
    )
    await engine.send({ role: 'user', content: '@A q1', metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } } })
    disabled = true
    await engine.send({ role: 'user', content: '@B q2', metadata: { tinyRobotSkill: { requestedSkillNames: ['B'] } } })
    disabled = false
    await engine.sendMessage('q3')
    expect(requests[0].messages.at(-1)?.content).toBe('@A q1\n\nUser-requested Skills: ["A"].')
    expect(requests[1].messages.at(-1)?.content).toBe('@B q2\n\nUser-requested Skills: ["B"].')
    expect(requests[1].messages.slice(0, requests[0].messages.length)).toEqual(requests[0].messages)
    expect(requests[2].messages.slice(0, requests[1].messages.length)).toEqual(requests[1].messages)
  })

  it.each(['catalog', 'preload'] as const)(
    'runs the application hook when tools are disabled during %s',
    async (stage) => {
      let disabled = false
      let applicationPrepared = false
      const engine = sessionEngine(
        optionsFor({
          async getSkillCandidates() {
            if (stage === 'catalog') disabled = true
            return [{ name: 'A', description: 'A summary' }]
          },
          async getSkillByName() {
            disabled = true
            return { name: 'A', description: 'A summary', instructions: 'A instructions' }
          },
          onTurnStart() {
            applicationPrepared = true
          },
        }),
        async (body) => {
          expect(loadResults(body.messages)).toMatchObject([{ name: 'A', instructions: 'A instructions' }])
          return reply(applicationPrepared ? 'application prepared' : 'application skipped')
        },
        [],
        { disabled: () => disabled },
      )
      await engine.send({ role: 'user', content: '@A', metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } } })
      expect(engine.getState().messages.at(-1)?.content).toBe('application prepared')
    },
  )

  it.each([false, true])('rechecks resource availability after persisted approval, removed=%s', async (removed) => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    })
    let available = true
    const config = optionsFor({
      getSkillByName: () =>
        available
          ? {
              name: 'A',
              description: 'summary',
              instructions: 'guide',
              resources: [{ path: 'guide.md', resourceId: 'guide.md', kind: 'text', text: 'Current guide' }],
            }
          : undefined,
    })
    const engine = sessionEngine(
      config,
      async () => reply('', [requestTool('read_skill_file', { skillName: 'A', path: 'guide.md' }, 'read-A')]),
      [],
      { shouldPauseToolCall: () => true },
    )
    await engine.sendMessage('read guide')
    expect(engine.getState().requestState).toBe('paused')
    available = !removed
    const restored = sessionEngine(
      config,
      async (body) => {
        const result = JSON.parse(String(body.messages.find((message) => message.role === 'tool')?.content))
        expect(result).toMatchObject(removed ? { error: 'skill_unavailable' } : { content: 'Current guide' })
        return reply()
      },
      JSON.parse(JSON.stringify(engine.getState().messages)),
    )
    expect(restored.getState().requestState).toBe('paused')
    await restored.dispatchCommand(TOOL_RESUME_COMMAND, { toolCallId: 'read-A' })
    expect(restored.getState().requestState).toBe('completed')
  })

  it('keeps all tools closed after reaching the round limit', async () => {
    let round = 0
    const engine = sessionEngine(
      optionsFor(),
      async (body) => {
        if (round++ === 0) return reply('', [requestTool('load_skills', { skillNames: ['A'] })])
        expect(body).toMatchObject({ tools: [], tool_choice: 'none' })
        return reply()
      },
      [],
      { maxToolRounds: 0 },
    )
    await engine.sendMessage('finish')
    expect(engine.getState().messages.at(-1)?.content).toBe('done')
  })

  it('preserves runtime source identity across persisted approval', async () => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    })
    let disabled = false
    const config = optionsFor({ disabled: () => disabled })
    const first = sessionEngine(
      config,
      async () => reply('', [requestTool('load_skills', { skillNames: ['A'] }, 'load-A')]),
      [],
      { shouldPauseToolCall: () => true },
    )
    await first.sendMessage('load')
    disabled = true
    const restored = sessionEngine(
      config,
      async (body) => {
        expect(body.messages.find((message) => message.role === 'tool')).toMatchObject({
          content: 'Tool call disabled.',
        })
        return reply()
      },
      JSON.parse(JSON.stringify(first.getState().messages)),
    )
    await restored.dispatchCommand(TOOL_RESUME_COMMAND, { toolCallId: 'load-A' })
    expect(restored.getState().requestState).toBe('completed')
  })

  it('cancels explicit loading before the first provider request and can retry', async () => {
    let started!: () => void
    const loading = new Promise<void>((resolve) => {
      started = resolve
    })
    let blocked = true
    const engine = sessionEngine(
      optionsFor({
        deduplication: 'context',
        getSkillByName: () => {
          if (blocked) {
            started()
            return new Promise(() => {})
          }
          return { name: 'A', description: 'summary', instructions: 'A instructions' }
        },
      }),
      async (body) => {
        expect(loadResults(body.messages)).toMatchObject([
          { name: 'A', status: 'loaded', instructions: 'A instructions' },
        ])
        return reply()
      },
    )
    const sending = engine.send({
      role: 'user',
      content: '@A',
      metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } },
    })
    await loading
    await expect(Promise.all([sending, engine.abort()])).resolves.toEqual([undefined, undefined])
    expect(engine.getState().requestState).toBe('aborted')
    blocked = false
    await engine.send({
      role: 'user',
      content: '@A retry',
      metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } },
    })
    expect(engine.getState().requestState).toBe('completed')
  })
})
