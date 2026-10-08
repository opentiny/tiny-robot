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
  id: 'project-setup',
  title: '配置项目',
  steps: [
    {
      id: 'framework',
      title: '选择框架',
      summary: '选择前端框架',
      type: 'single',
      required: true,
      options: [
        { label: 'Vue', value: 'vue' },
        { label: 'React', value: 'react', disabled: true },
      ],
    },
    {
      id: 'features',
      title: '选择功能',
      summary: '选择功能',
      type: 'multiple',
      options: [
        { label: 'TypeScript', value: 'typescript' },
        { label: '测试', value: 'test' },
      ],
    },
    {
      id: 'notes',
      title: '补充说明',
      summary: '补充说明',
      type: 'text',
    },
    {
      id: 'confirm',
      title: '确认配置',
      summary: '确认配置',
      type: 'confirm',
      required: true,
    },
  ],
}

describe('ask_user protocol', () => {
  it('appends model instructions to an existing system message only once', () => {
    const messages = [
      { role: 'system' as const, content: 'Product instructions.' },
      { role: 'user' as const, content: 'Configure the project.' },
    ]

    const injected = appendAskUserSystemPrompt(messages, 'Use the form when clarification is needed.')
    const systemContent = String(injected[0]?.content)

    expect(systemContent).toContain('Product instructions.')
    expect(systemContent).toContain('Use the form when clarification is needed.')
    expect(ASK_USER_SYSTEM_PROMPT).toContain('Every step must include `summary`.')
    expect(ASK_USER_SYSTEM_PROMPT).toContain('make `summary` identical to `title`')
    expect(systemContent).toContain(ASK_USER_SYSTEM_PROMPT_START)
    expect(appendAskUserSystemPrompt(injected, ASK_USER_SYSTEM_PROMPT)).toBe(injected)
    expect(messages[0]?.content).toBe('Product instructions.')
  })

  it('parses and normalizes the tool arguments', () => {
    expect(parseAskUserArguments(JSON.stringify(args))).toEqual(args)
    expect(parseAskUserArguments({ ...args, title: '  配置项目  ' }).title).toBe('配置项目')

    const parsed = parseAskUserArguments({
      ...args,
      steps: [{ ...args.steps[0], summary: '  选择前端框架  ' }],
    })
    expect(parsed.steps[0].summary).toBe('选择前端框架')
    expect(() =>
      parseAskUserArguments({
        ...args,
        steps: [{ ...args.steps[0], summary: undefined }],
      }),
    ).toThrow('summary must be a string')
    expect(() =>
      parseAskUserArguments({
        ...args,
        steps: [{ ...args.steps[0], summary: 'a'.repeat(81) }],
      }),
    ).toThrow('at most 80 characters')
  })

  it('rejects malformed definitions before rendering', () => {
    expect(() => parseAskUserArguments('{')).toThrow('valid JSON')
    expect(() =>
      parseAskUserArguments({
        ...args,
        steps: [{ ...args.steps[0] }, { ...args.steps[1], id: args.steps[0].id }],
      }),
    ).toThrow('duplicate id')
    expect(() =>
      parseAskUserArguments({
        ...args,
        steps: [
          {
            ...args.steps[0],
            options: [
              { label: 'Vue', value: 'vue' },
              { label: 'Vue 2', value: 'vue' },
            ],
          },
        ],
      }),
    ).toThrow('duplicate value')
  })

  it('normalizes valid answers and preserves false', () => {
    expect(
      validateAndNormalizeAnswers(args.steps, {
        framework: { selected: ['vue'] },
        features: { selected: ['test', 'typescript'] },
        notes: '  extra notes  ',
        confirm: false,
        ignoredUnknownKey: 'discarded',
      }),
    ).toEqual({
      framework: { selected: ['vue'] },
      features: { selected: ['test', 'typescript'] },
      notes: 'extra notes',
      confirm: false,
    })
  })

  it('allows ignored answers and rejects unknown, disabled, and duplicate answers', () => {
    const requiredSteps = args.steps.filter((step) => step.id === 'framework' || step.id === 'confirm')

    expect(validateAndNormalizeAnswers(requiredSteps, {})).toEqual({
      framework: { selected: [] },
      confirm: null,
    })
    expect(
      validateAndNormalizeAnswers(args.steps, {
        framework: null,
        features: 'ignored',
        notes: 'ignored',
        confirm: null,
      }),
    ).toEqual({
      framework: { selected: [] },
      features: { selected: [] },
      notes: 'ignored',
      confirm: null,
    })
    expect(() =>
      validateAndNormalizeAnswers(args.steps, {
        framework: { selected: ['react'] },
        confirm: true,
      }),
    ).toThrow('disabled option')
    expect(() =>
      validateAndNormalizeAnswers(args.steps, {
        framework: { selected: ['vue', 'vue'] },
        confirm: true,
      }),
    ).toThrow('duplicate selected')
    expect(() =>
      validateAndNormalizeAnswers(args.steps, {
        framework: { selected: ['unknown'] },
        confirm: true,
      }),
    ).toThrow('unknown option')
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
                    function: {
                      name: ASK_USER_TOOL_NAME,
                      arguments: JSON.stringify(args),
                    },
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
          type: 'ask_user_result',
          interactionId: args.id,
          status: 'submitted',
          answers: {
            framework: { selected: ['vue'] },
            features: { selected: [] },
            notes: 'extra notes',
            confirm: false,
          },
        }),
      })

      return {
        id: 'ask-user-final',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: '配置已提交。' },
            finish_reason: 'stop',
          },
        ],
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
        { type: 'ask_user', id: args.id, steps: args.steps },
      ],
      state: {
        askUser: { status: 'active', answers: {} },
        askUserRuntime: { interactionId: args.id, toolCallId: 'call-ask-user' },
        toolCall: { 'call-ask-user': { status: 'awaiting-approval' } },
      },
    })

    const state = assistantMessage?.state as Record<string, unknown>
    state.askUser = {
      ...(state.askUser as Record<string, unknown>),
      status: 'submitted',
      answers: {
        framework: { selected: ['vue'] },
        features: { selected: [] },
        notes: 'extra notes',
        confirm: false,
      },
    }

    await expect(
      engine.dispatchCommand(TOOL_RESUME_COMMAND, {
        toolCallId: 'call-ask-user',
      }),
    ).resolves.toEqual({ status: 'resumed', toolCallId: 'call-ask-user' })

    expect(responseProvider).toHaveBeenCalledTimes(2)
    expect(engine.getState().messages.at(-1)).toMatchObject({ role: 'assistant', content: '配置已提交。' })
  })

  it('rejects more than one ask_user call in one assistant response', async () => {
    const integration = createAskUserToolIntegration()
    const toolCall = (id: string) => ({
      id,
      type: 'function' as const,
      function: { name: ASK_USER_TOOL_NAME, arguments: JSON.stringify(args) },
    })
    const context = {
      getState: () => ({
        messages: [],
        requestState: 'processing',
        isProcessing: true,
        isPaused: false,
        canStartTurn: false,
      }),
    } as never

    await expect(integration.beforeCallTools([toolCall('call-a'), toolCall('call-b')], context)).rejects.toThrow(
      'Only one ask_user call',
    )
  })
})
