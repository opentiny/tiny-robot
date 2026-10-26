import type { ChatCompletion } from 'openai/resources'
import { describe, expect, it, vi } from 'vitest'
import { createNativeMessageAdapter } from '../adapters/native'
import { createMessageEngine } from '../core/engine'
import {
  ASK_USER_TOOL_NAME,
  ASK_USER_SYSTEM_PROMPT,
  ASK_USER_SYSTEM_PROMPT_START,
  appendAskUserSystemPrompt,
  createAskUserToolIntegration,
  askUserTool,
  lengthPlugin,
  parseAskUserArguments,
  thinkingPlugin,
  TOOL_RESUME_COMMAND,
  toolPlugin,
  validateAndNormalizeAnswers,
  type AskUserToolArguments,
} from '../plugins'
import type { CreateMessageEngineOptions, ResponseProvider } from '../types'

const silentDefaultPlugins = [thinkingPlugin({ disabled: true }), lengthPlugin({ disabled: true })]

const createTestMessageEngine = (options: CreateMessageEngineOptions) =>
  createMessageEngine(createNativeMessageAdapter(), options)

const args: AskUserToolArguments = {
  heading: '项目配置',
  questions: [
    {
      id: 'framework',
      question: '选择前端框架',
      options: [{ label: 'Vue' }, { label: 'React' }],
      multiSelect: false,
      allowCustom: true,
    },
    {
      id: 'features',
      question: '选择需要的功能',
      options: [{ label: '测试' }, { label: 'TypeScript' }],
      multiSelect: true,
      allowCustom: true,
    },
    { id: 'notes', question: '补充说明' },
    {
      id: 'confirm',
      question: '确认配置',
      options: [{ label: '确认' }, { label: '取消' }],
      multiSelect: false,
      allowCustom: false,
    },
  ],
}

describe('ask_user protocol', () => {
  it('describes the dependency and parallel execution rules', () => {
    expect(ASK_USER_SYSTEM_PROMPT).toContain('dependent follow-up')
    expect(ASK_USER_SYSTEM_PROMPT).toContain('Do not include another tool call in the same response as')
    expect(ASK_USER_SYSTEM_PROMPT).toContain('do not add an "Other" or "Custom" option')

    const system = [{ role: 'system' as const, content: 'Base instructions' }]
    const injected = appendAskUserSystemPrompt(system)
    expect(injected[0]?.content).toContain(ASK_USER_SYSTEM_PROMPT_START)
    expect(injected[0]?.content).toContain('Do not include another tool call')
    expect(appendAskUserSystemPrompt(injected, ASK_USER_SYSTEM_PROMPT)).toBe(injected)
  })

  it('parses text and choice questions and normalizes labels', () => {
    const parsed = parseAskUserArguments({
      heading: '  配置  ',
      questions: [
        { id: 'name', question: '  姓名  ' },
        {
          id: 'framework',
          question: '框架',
          options: [{ label: '  Vue  ', description: '  渐进式框架  ' }],
          multiSelect: false,
          allowCustom: true,
        },
      ],
    })

    expect(parsed).toEqual({
      heading: '配置',
      questions: [
        { id: 'name', question: '姓名' },
        {
          id: 'framework',
          question: '框架',
          options: [{ label: 'Vue', description: '渐进式框架' }],
          multiSelect: false,
          allowCustom: true,
        },
      ],
    })
  })

  it('rejects legacy UI fields, duplicate ids and duplicate labels', () => {
    expect(() => parseAskUserArguments({ id: 'legacy', questions: [{ id: 'q', question: '问题' }] })).toThrow(
      'arguments.id is not supported',
    )
    expect(() =>
      parseAskUserArguments({
        questions: [
          { id: 'q', question: '问题' },
          { id: 'q', question: '重复问题' },
        ],
      }),
    ).toThrow('duplicate id')
    expect(() =>
      parseAskUserArguments({
        questions: [
          {
            id: 'q',
            question: '问题',
            options: [{ label: '同名' }, { label: '同名' }],
            multiSelect: false,
            allowCustom: false,
          },
        ],
      }),
    ).toThrow('duplicate label')
    expect(() => parseAskUserArguments({ questions: [{ id: 'q', question: '问题', multiSelect: false }] })).toThrow(
      'require options',
    )
    expect(() => parseAskUserArguments({ questions: [{ id: '__proto__', question: '问题' }] })).toThrow('must match')
    expect(() => parseAskUserArguments({ heading: '', questions: [{ id: 'q', question: '问题' }] })).toThrow(
      'non-empty when provided',
    )
    expect(() =>
      parseAskUserArguments({
        questions: [
          {
            id: 'q',
            question: '问题',
            options: [{ label: '选项', description: '' }],
            multiSelect: false,
            allowCustom: false,
          },
        ],
      }),
    ).toThrow('non-empty when provided')
  })

  it('normalizes answered and skipped values into one result shape', () => {
    expect(
      validateAndNormalizeAnswers(args.questions, {
        framework: 'Vue',
        features: ['测试', '自定义服务'],
        notes: '  额外说明  ',
        confirm: '',
      }),
    ).toEqual({
      framework: { status: 'answered', value: 'Vue' },
      features: { status: 'answered', value: ['测试', '自定义服务'] },
      notes: { status: 'answered', value: '额外说明' },
      confirm: { status: 'skipped' },
    })

    expect(validateAndNormalizeAnswers(args.questions, {})).toEqual({
      framework: { status: 'skipped' },
      features: { status: 'skipped' },
      notes: { status: 'skipped' },
      confirm: { status: 'skipped' },
    })
  })

  it('enforces choice mode and allowCustom', () => {
    expect(() => validateAndNormalizeAnswers(args.questions, { framework: 'Svelte' })).not.toThrow()
    expect(() => validateAndNormalizeAnswers(args.questions, { confirm: '自定义' })).toThrow('unknown option')
    expect(() => validateAndNormalizeAnswers(args.questions, { framework: ['Vue'] })).toThrow('must be a string')
    expect(() => validateAndNormalizeAnswers(args.questions, { features: ['测试', '测试'] })).toThrow(
      'duplicate options',
    )
    expect(() => validateAndNormalizeAnswers(args.questions, { notes: 'x'.repeat(4001) })).toThrow('at most 4000')
    expect(() =>
      validateAndNormalizeAnswers(args.questions, {
        features: Array.from({ length: 51 }, (_, index) => `custom-${index}`),
      }),
    ).toThrow('at most 50 values')
    const longQuestions = Array.from({ length: 6 }, (_, index) => ({
      id: `note-${index}`,
      question: `Note ${index}`,
    }))
    expect(() =>
      validateAndNormalizeAnswers(
        longQuestions,
        Object.fromEntries(longQuestions.map((question) => [question.id, 'x'.repeat(4000)])),
      ),
    ).toThrow('at most 20000 characters in total')
  })

  it('publishes the new model-facing schema', () => {
    const parameters = askUserTool.function.parameters as {
      required: string[]
      properties: Record<string, { properties?: Record<string, unknown> }>
    }
    expect(parameters.required).toEqual(['questions'])
    expect(parameters.properties).toHaveProperty('heading')
    expect(parameters.properties).toHaveProperty('questions')
    expect(parameters.properties).not.toHaveProperty('steps')
  })
})

describe('ask_user tool integration', () => {
  it('pauses, renders the UI content, resumes, and returns a structured result', async () => {
    const integration = createAskUserToolIntegration()
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      const hasToolResult = requestBody.messages.some((message) => message.role === 'tool')

      if (!hasToolResult) {
        expect(
          requestBody.tools?.some((tool) => tool.type === 'function' && tool.function.name === ASK_USER_TOOL_NAME),
        ).toBe(true)
        return {
          id: 'ask-user-call',
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: 'mock',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '请补充配置。',
                tool_calls: [
                  {
                    id: 'call-ask-user',
                    type: 'function',
                    function: { name: ASK_USER_TOOL_NAME, arguments: JSON.stringify(args) },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        } as ChatCompletion
      }

      const assistantMessage = requestBody.messages.find(
        (message) => message.role === 'assistant' && Array.isArray(message.tool_calls),
      )
      expect(assistantMessage?.content).toEqual([{ type: 'text', text: '请补充配置。' }])
      expect(requestBody.messages.at(-1)).toMatchObject({
        role: 'tool',
        tool_call_id: 'call-ask-user',
        content: JSON.stringify({
          outcome: 'submitted',
          answers: {
            framework: { status: 'answered', value: 'Vue' },
            features: { status: 'skipped' },
            notes: { status: 'answered', value: 'extra notes' },
            confirm: { status: 'skipped' },
          },
        }),
      })

      return {
        id: 'ask-user-final',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [{ index: 0, message: { role: 'assistant', content: '配置已提交。' }, finish_reason: 'stop' }],
      } as ChatCompletion
    })

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          getTools: integration.getTools,
          beforeCallTools: integration.beforeCallTools,
          shouldPauseToolCall: integration.shouldPauseToolCall,
          onBeforeRequest: integration.onBeforeRequest,
          onToolCallEnd: integration.onToolCallEnd,
          callTool: async () => 'fallback',
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('开始配置')
    expect(engine.getState()).toMatchObject({ requestState: 'paused', isPaused: true })

    const assistantMessage = engine.getState().messages.find((message) => message.role === 'assistant')
    expect(assistantMessage).toMatchObject({
      content: [
        { type: 'text', text: '请补充配置。' },
        { type: 'ask_user', heading: args.heading },
      ],
      state: {
        askUser: { status: 'active', answers: {} },
        askUserRuntime: { toolCallId: 'call-ask-user' },
      },
    })

    const state = assistantMessage?.state as Record<string, unknown>
    state.askUser = {
      ...(state.askUser as Record<string, unknown>),
      status: 'submitted',
      answers: { framework: 'Vue', notes: '  extra notes  ' },
    }

    await expect(engine.dispatchCommand(TOOL_RESUME_COMMAND, { toolCallId: 'call-ask-user' })).resolves.toEqual({
      status: 'resumed',
      toolCallId: 'call-ask-user',
    })
    expect(responseProvider).toHaveBeenCalledTimes(2)
  })

  it('returns malformed ask_user calls as failed tool results', async () => {
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      const toolMessages = requestBody.messages.filter((message) => message.role === 'tool')
      if (toolMessages.length === 0) {
        return {
          id: 'malformed-ask-user-call',
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: 'mock',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: null,
                tool_calls: [
                  {
                    id: 'call-malformed-ask-user',
                    type: 'function',
                    function: { name: ASK_USER_TOOL_NAME, arguments: '{' },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        } as ChatCompletion
      }

      expect(toolMessages).toMatchObject([
        {
          role: 'tool',
          tool_call_id: 'call-malformed-ask-user',
          content: JSON.stringify({ outcome: 'failed', reason: 'ask_user arguments must be valid JSON' }),
        },
      ])
      return {
        id: 'malformed-ask-user-final',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [{ index: 0, message: { role: 'assistant', content: '已处理无效工具调用。' }, finish_reason: 'stop' }],
      } as ChatCompletion
    })

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({ askUser: true, getTools: async () => [], callTool: async () => 'fallback' }),
      ],
      responseProvider,
    })

    await engine.sendMessage('触发无效表单')
    expect(responseProvider).toHaveBeenCalledTimes(2)
    expect(engine.getState().messages.at(-1)).toMatchObject({ role: 'assistant', content: '已处理无效工具调用。' })
  })

  it.each([
    { format: 'string', content: 'Base instructions' },
    { format: 'array', content: [{ type: 'text' as const, text: 'Base instructions' }] },
  ])(
    'sanitizes closing requests and continuations with a $format system prompt',
    async ({ content: systemContent }) => {
      const callTool = vi.fn(async () => 'lookup result')
      const onBeforeRequest = vi.fn()
      let requestCount = 0
      const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
        requestCount += 1

        if (requestCount <= 2) {
          expect(JSON.stringify(requestBody.messages)).toContain(ASK_USER_SYSTEM_PROMPT_START)
        }

        if (requestCount === 1) {
          return {
            id: 'closing-ask-user-start',
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: 'mock',
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  content: '需要补充信息。',
                  tool_calls: [
                    {
                      id: 'call-closing-ask-user',
                      type: 'function',
                      function: {
                        name: ASK_USER_TOOL_NAME,
                        arguments: JSON.stringify({ questions: [{ id: 'name', question: '姓名' }] }),
                      },
                    },
                  ],
                },
                finish_reason: 'tool_calls',
              },
            ],
          } as ChatCompletion
        }

        if (requestCount === 2) {
          return {
            id: 'closing-ask-user-next-tool',
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
                      id: 'call-after-ask-user',
                      type: 'function',
                      function: { name: 'lookup', arguments: '{}' },
                    },
                  ],
                },
                finish_reason: 'tool_calls',
              },
            ],
          } as ChatCompletion
        }

        expect(requestBody.tools).toEqual([])
        expect(requestBody.tool_choice).toBe('none')
        expect(
          requestBody.messages.some(
            (message) =>
              Array.isArray(message.content) &&
              message.content.some((item) => item && typeof item === 'object' && item.type === 'ask_user'),
          ),
        ).toBe(false)
        expect(JSON.stringify(requestBody.messages)).not.toContain('tiny-robot-ask-user-instructions')
        expect(requestBody.messages.find((message) => message.role === 'system')?.content).toEqual(systemContent)
        expect(requestBody.messages.find((message) => message.role === 'assistant')?.content).toEqual([
          { type: 'text', text: '需要补充信息。' },
        ])
        expect(requestBody.messages.find((message) => message.role === 'tool')?.content).toBe(
          JSON.stringify({ outcome: 'submitted', answers: { name: { status: 'answered', value: 'Ada' } } }),
        )

        return {
          id: 'closing-ask-user-final',
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: 'mock',
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: requestCount === 3 ? '尚未结束。' : '已结束。' },
              finish_reason: requestCount === 3 ? 'length' : 'stop',
            },
          ],
        } as ChatCompletion
      })

      const engine = createTestMessageEngine({
        initialMessages: [{ role: 'system', content: systemContent }],
        plugins: [
          ...silentDefaultPlugins,
          lengthPlugin(),
          toolPlugin({
            askUser: true,
            maxToolRounds: 1,
            getTools: async () => [{ type: 'function', function: { name: 'lookup', parameters: { type: 'object' } } }],
            onBeforeRequest,
            callTool,
          }),
        ],
        responseProvider,
      })

      await engine.sendMessage('结束这个请求')
      expect(engine.getState().requestState).toBe('paused')

      const assistantMessage = engine.getState().messages.find((message) => message.role === 'assistant')
      const state = assistantMessage?.state as Record<string, unknown>
      state.askUser = {
        ...(state.askUser as Record<string, unknown>),
        status: 'submitted',
        answers: { name: 'Ada' },
      }

      await expect(
        engine.dispatchCommand(TOOL_RESUME_COMMAND, { toolCallId: 'call-closing-ask-user' }),
      ).resolves.toEqual({ status: 'resumed', toolCallId: 'call-closing-ask-user' })
      expect(requestCount).toBe(4)
      expect(onBeforeRequest).toHaveBeenCalledTimes(4)
      expect(callTool).not.toHaveBeenCalled()
      expect(engine.getState().requestState).toBe('completed')
      expect(assistantMessage).toMatchObject({
        content: [{ type: 'text', text: '需要补充信息。' }, { type: 'ask_user' }],
        state: { askUser: { status: 'submitted' } },
      })
      expect(engine.getState().messages[0]?.content).toEqual(systemContent)
    },
  )

  it.each(['denied', 'cancelled', 'failed'] as const)('marks the form as error when ask_user ends as %s', (status) => {
    const integration = createAskUserToolIntegration()
    const assistantMessage = {
      role: 'assistant' as const,
      content: '',
      state: {
        askUser: { status: 'active' as const, currentStep: 0, answers: {}, completedStepIds: [] },
        askUserRuntime: { toolCallId: 'call-ask-user' },
      },
    }
    const toolCall = {
      id: 'call-ask-user',
      type: 'function' as const,
      function: { name: ASK_USER_TOOL_NAME, arguments: JSON.stringify(args) },
    }

    integration.onToolCallEnd(toolCall, {
      assistantMessage,
      status,
      error: new Error(`ask_user ${status}`),
      mutate: (_key: string, mutate: () => void) => mutate(),
    } as never)

    expect(assistantMessage.state.askUser).toMatchObject({
      status: status === 'denied' || status === 'cancelled' ? 'cancelled' : 'error',
      retryable: false,
      error: `ask_user ${status}`,
    })
  })

  it('returns a structured cancellation result when ask_user is rejected', () => {
    const integration = createAskUserToolIntegration()
    const assistantMessage = {
      role: 'assistant' as const,
      content: '',
      state: {
        askUser: { status: 'active' as const, currentStep: 0, answers: {}, completedStepIds: [] },
        askUserRuntime: { toolCallId: 'call-ask-user' },
      },
    }
    const toolMessage = { role: 'tool' as const, tool_call_id: 'call-ask-user', content: 'Tool call failed.' }
    const toolCall = {
      id: 'call-ask-user',
      type: 'function' as const,
      function: { name: ASK_USER_TOOL_NAME, arguments: JSON.stringify(args) },
    }

    integration.onToolCallEnd(toolCall, {
      assistantMessage,
      toolMessage,
      status: 'denied',
      error: new Error('User cancelled the form'),
      mutate: (_key: string, mutate: () => void) => mutate(),
    } as never)

    expect(JSON.parse(String(toolMessage.content))).toEqual({
      outcome: 'cancelled',
      reason: 'User cancelled the form',
    })
  })

  it('rejects more than one ask_user call in one assistant response', async () => {
    const integration = createAskUserToolIntegration()
    const toolCall = (id: string) => ({
      id,
      type: 'function' as const,
      function: { name: ASK_USER_TOOL_NAME, arguments: JSON.stringify(args) },
    })

    await expect(integration.beforeCallTools([toolCall('call-a'), toolCall('call-b')], {} as never)).rejects.toThrow(
      'Only one ask_user call',
    )
  })

  it('defers sibling tools in every ask_user response', async () => {
    const integration = createAskUserToolIntegration()
    const askUserCall = {
      id: 'call-ask-user',
      type: 'function' as const,
      function: { name: ASK_USER_TOOL_NAME, arguments: JSON.stringify(args) },
    }
    const siblingCall = {
      id: 'call-deploy',
      type: 'function' as const,
      function: { name: 'deploy', arguments: '{}' },
    }

    const context = {
      assistantMessage: { role: 'assistant', content: '' },
      mutate: (_key: string, mutate: () => void) => mutate(),
    } as never
    await expect(integration.beforeCallTools([askUserCall, siblingCall], context)).resolves.toBeUndefined()
    expect(integration.shouldDeferToolCall(siblingCall)).toBe(true)
    expect(integration.shouldDeferToolCall(siblingCall)).toBe(false)
  })

  it('defers sibling tools even when the ask_user arguments are malformed', async () => {
    const integration = createAskUserToolIntegration()
    const malformedAskUserCall = {
      id: 'call-malformed-ask-user',
      type: 'function' as const,
      function: { name: ASK_USER_TOOL_NAME, arguments: '{' },
    }
    const siblingCall = {
      id: 'call-delete',
      type: 'function' as const,
      function: { name: 'delete', arguments: '{}' },
    }

    await expect(integration.beforeCallTools([malformedAskUserCall, siblingCall], {} as never)).resolves.toBeUndefined()
    expect(integration.shouldDeferToolCall(siblingCall)).toBe(true)
  })
})
