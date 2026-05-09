import { describe, expect, it, vi } from 'vitest'
import { createNativeMessageAdapter } from '../adapters/native'
import { createMessageEngine } from '../core/engine'
import { lengthPlugin, skillPlugin, thinkingPlugin, toolPlugin } from '../plugins'
import type { CreateMessageEngineOptions, MessageRequestBody } from '../types'
import { mockResponseProvider } from './mockResponseProvider'

const silentDefaultPlugins = [thinkingPlugin({ disabled: true }), lengthPlugin({ disabled: true })]

const createTestMessageEngine = (options: CreateMessageEngineOptions) =>
  createMessageEngine(createNativeMessageAdapter(), options)

describe('skillPlugin', () => {
  it('injects active skill instructions and tools before request', async () => {
    const responseProvider = vi.fn(mockResponseProvider('ok'))
    const skillTool = {
      type: 'function',
      function: {
        name: 'get_weather',
        description: 'Get weather',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    } as const

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          skills: [
            {
              name: 'weather',
              description: 'Weather skill',
              instructions: 'Use wttr.in for weather requests.',
              tools: [skillTool],
            },
          ],
          getActiveSkills: () => ['weather'],
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
    expect(requestBody.tools).toEqual([skillTool])
  })

  it('resolves dynamic skill instructions and tools with runtime context', async () => {
    const responseProvider = vi.fn(mockResponseProvider('ok'))

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          skills: [
            {
              name: 'dynamic',
              description: 'Dynamic skill',
              instructions: ({ skill, activeSkills }) => `${skill.name}:${activeSkills.length}`,
              tools: ({ skill }) => [
                {
                  type: 'function',
                  function: {
                    name: `${skill.name}_tool`,
                    description: 'Dynamic tool',
                    parameters: {
                      type: 'object',
                      properties: {},
                    },
                  },
                },
              ],
            },
          ],
          getActiveSkills: () => ['dynamic'],
        }),
        toolPlugin({
          getTools: async () => [],
          callTool: async () => 'fallback',
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('run dynamic skill')

    const requestBody = responseProvider.mock.calls[0]?.[0]
    expect(requestBody.messages[0].content).toContain('dynamic:1')
    expect(requestBody.tools![0].function.name).toBe('dynamic_tool')
  })

  it('throws duplicate tool names through toolPlugin when skill tools conflict', async () => {
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          skills: [
            {
              name: 'duplicate-skill',
              description: 'Duplicate skill',
              tools: [
                {
                  type: 'function',
                  function: {
                    name: 'duplicate_tool',
                    description: 'Duplicated skill tool',
                  },
                },
              ],
            },
          ],
          getActiveSkills: () => ['duplicate-skill'],
        }),
        toolPlugin({
          getTools: async () => [
            {
              type: 'function',
              function: {
                name: 'duplicate_tool',
                description: 'Duplicated user tool',
              },
            },
          ],
          callTool: async () => 'fallback',
        }),
      ],
      responseProvider: async () => {
        throw new Error('responseProvider should not be called')
      },
    })

    await expect(engine.sendMessage('trigger duplicate tool')).rejects.toThrow(
      'Duplicate tool name "duplicate_tool" detected.',
    )
  })

  it('exposes built-in skill file runtime tools when active skills have files', async () => {
    const responseProvider = vi.fn(mockResponseProvider('ok'))

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          skills: [
            {
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
            },
          ],
          getActiveSkills: () => ['vue-best-practices'],
        }),
        toolPlugin({
          getTools: async () => [],
          callTool: async () => 'fallback',
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('review this Vue component')

    const requestBody = responseProvider.mock.calls[0]?.[0]
    expect(requestBody.tools?.map((tool) => tool.function.name)).toEqual(['list_skill_files', 'read_skill_file'])
    expect(requestBody.tools?.[0].function.parameters).toMatchObject({
      type: 'object',
      properties: {
        skillName: expect.objectContaining({ type: 'string' }),
      },
    })
    expect(requestBody.tools?.[1].function.parameters).toMatchObject({
      type: 'object',
      required: ['skillName', 'path'],
      properties: {
        skillName: expect.objectContaining({ type: 'string' }),
        path: expect.objectContaining({ type: 'string' }),
      },
    })
  })

  it('does not expose built-in skill file runtime tools when active skills have no files', async () => {
    const responseProvider = vi.fn(mockResponseProvider('ok'))

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          skills: [
            {
              name: 'plain',
              description: 'Plain skill',
              instructions: 'No files here.',
            },
          ],
          getActiveSkills: () => ['plain'],
        }),
        toolPlugin({
          getTools: async () => [],
          callTool: async () => 'fallback',
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('run plain skill')

    const requestBody = responseProvider.mock.calls[0]?.[0]
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
          skills: [
            {
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
            },
          ],
          getActiveSkills: () => ['vue-best-practices'],
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
})
