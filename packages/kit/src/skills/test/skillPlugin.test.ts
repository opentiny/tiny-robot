import { describe, expect, it, vi } from 'vitest'
import { createNativeMessageAdapter } from '../../message/adapters/native'
import { createMessageEngine } from '../../message/core/engine'
import { lengthPlugin, skillPlugin, thinkingPlugin, toolPlugin } from '../../message/plugins'
import type { SkillDefinition } from '../types'
import type { CreateMessageEngineOptions, MessageRequestBody } from '../../message/types'
import { mockResponseProvider } from '../../message/test/mockResponseProvider'

const silentDefaultPlugins = [thinkingPlugin({ disabled: true }), lengthPlugin({ disabled: true })]

const createTestMessageEngine = (options: CreateMessageEngineOptions) =>
  createMessageEngine(createNativeMessageAdapter(), options)

describe('skillPlugin', () => {
  it('injects skill instructions before request', async () => {
    const responseProvider = vi.fn(mockResponseProvider('ok'))
    const weatherSkill: SkillDefinition = {
      name: 'weather',
      description: 'Weather skill',
      instructions: 'Use wttr.in for weather requests.',
    }

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          getSkills: () => [weatherSkill],
        }),
        toolPlugin({
          getTools: async () => [],
          callTool: async () => 'fallback',
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('weather in London')

    const requestBody = responseProvider.mock.calls[0]?.[0]
    expect(requestBody.messages[0]).toMatchObject({
      role: 'system',
      content: expect.stringContaining('Use wttr.in for weather requests.'),
    })
    expect(requestBody.messages[1]).toMatchObject({ role: 'user', content: 'weather in London' })
    expect(requestBody.tools).toBeUndefined()
  })

  it('executes built-in skill file runtime tools from turn state', async () => {
    const responseProvider = vi.fn(async (requestBody: MessageRequestBody) => {
      const hasToolResult = requestBody.messages.some((message) => message.role === 'tool')

      if (!hasToolResult) {
        return {
          id: 'tool-call',
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: 'mock',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '',
                tool_calls: [
                  {
                    id: 'call-1',
                    type: 'function',
                    function: {
                      name: 'read_skill_file',
                      arguments: JSON.stringify({
                        skillName: 'vue-best-practices',
                        path: 'references/reactivity.md',
                      }),
                    },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        }
      }

      expect(JSON.parse(requestBody.messages.at(-1)?.content as string)).toMatchObject({
        file: {
          skillName: 'vue-best-practices',
          path: 'references/reactivity.md',
          kind: 'text',
        },
        content: '# Reactivity',
      })

      return {
        id: 'final-answer',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'done',
            },
            finish_reason: 'stop',
          },
        ],
      }
    })
    const vueSkill: SkillDefinition = {
      name: 'vue-best-practices',
      description: 'Vue skill',
      instructions: 'Follow Vue best practices.',
      files: [
        {
          id: 'references/reactivity.md',
          path: 'references/reactivity.md',
          kind: 'text',
          content: '# Reactivity',
          mimeType: 'text/markdown',
        },
      ],
    }

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          getTools: async () => [],
          callTool: async () => {
            throw new Error('fallback should not run')
          },
        }),
        skillPlugin({
          getSkills: () => [vueSkill],
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('read skill file')

    expect(responseProvider).toHaveBeenCalledTimes(2)
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'done',
    })
  })

  it('does not inject instructions or tools when getSkills returns undefined', async () => {
    const responseProvider = vi.fn(mockResponseProvider('ok'))
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          getSkills: () => undefined,
        }),
        toolPlugin({
          getTools: async () => [],
          callTool: async () => 'fallback',
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('hello')

    const requestBody = responseProvider.mock.calls[0]?.[0]
    expect(requestBody.messages[0]).toMatchObject({ role: 'user', content: 'hello' })
    expect(requestBody.tools).toBeUndefined()
  })

  it('executes skill command runtime tools through the provided executor', async () => {
    const executeSkillCommand = vi.fn(async (request) => ({
      ok: true,
      skillName: request.skillName,
      command: request.command,
      args: request.args,
      runtime: request.skill.metadata?.runtime,
    }))
    const responseProvider = vi.fn(async (requestBody: MessageRequestBody) => {
      const hasToolResult = requestBody.messages.some((message) => message.role === 'tool')

      if (!hasToolResult) {
        expect(requestBody.tools?.map((tool) => tool.function.name)).toContain('execute_skill_command')

        return {
          id: 'command-call',
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: 'mock',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '',
                tool_calls: [
                  {
                    id: 'call-1',
                    type: 'function',
                    function: {
                      name: 'execute_skill_command',
                      arguments: JSON.stringify({
                        skillName: 'ppt',
                        command: 'ppt-render',
                        args: ['--input', 'deck.pptx'],
                      }),
                    },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        }
      }

      expect(JSON.parse(requestBody.messages.at(-1)?.content as string)).toMatchObject({
        ok: true,
        skillName: 'ppt',
        command: 'ppt-render',
        args: ['--input', 'deck.pptx'],
      })

      return {
        id: 'final-answer',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'done',
            },
            finish_reason: 'stop',
          },
        ],
      }
    })
    const pptSkill: SkillDefinition = {
      name: 'ppt',
      description: 'Presentation skill',
      instructions: 'Use ppt commands.',
      metadata: {
        runtime: {
          id: 'ppt-runtime',
        },
      },
    }

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          getTools: async () => [],
          callTool: async () => {
            throw new Error('fallback should not run')
          },
        }),
        skillPlugin({
          getSkills: () => [pptSkill],
          executeSkillCommand,
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('render ppt')

    expect(executeSkillCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        skill: pptSkill,
        skillName: 'ppt',
        command: 'ppt-render',
        args: ['--input', 'deck.pptx'],
      }),
      expect.objectContaining({
        customContext: expect.any(Object),
      }),
    )
    expect(responseProvider).toHaveBeenCalledTimes(2)
  })

  it('resolves plugin state before running custom turn hooks', async () => {
    const resolvedState = vi.fn()
    const turnStart = vi.fn()
    const weatherSkill: SkillDefinition = {
      name: 'weather',
      description: 'Weather skill',
      instructions: 'Use wttr.in.',
    }
    const responseProvider = vi.fn(mockResponseProvider('ok'))
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          getSkills: () => [weatherSkill],
          onSkillsResolved: (state) => {
            resolvedState(state.skillNames)
          },
          onTurnStart: (context) => {
            turnStart(context.customContext.__tiny_robot_skill)
          },
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('weather')

    expect(resolvedState).toHaveBeenCalledWith(['weather'])
    expect(turnStart).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: [weatherSkill],
        skillNames: ['weather'],
      }),
    )
    expect(resolvedState.mock.invocationCallOrder[0]).toBeLessThan(turnStart.mock.invocationCallOrder[0])
  })
})
