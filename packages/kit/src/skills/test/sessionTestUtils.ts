import type { SessionSkillLoadResult } from '../session/types'
import type { ChatCompletion, ChatCompletionMessageToolCall } from 'openai/resources'
import { createMessageEngine } from '../../message/core/engine'
import { createNativeMessageAdapter } from '../../message/adapters/native'
import { lengthPlugin, thinkingPlugin, toolPlugin } from '../../message/plugins'
import { createSessionSkillPlugin } from '../../message/plugins/sessionSkillPlugin'
import type { SessionSkillPluginOptions } from '../../message/plugins/skillPlugin.types'
import type { ChatMessage, MessageStateAdapter, ResponseProvider } from '../../message/types'

export const reply = (content = 'done', tool_calls?: ChatCompletionMessageToolCall[]): ChatCompletion => ({
  id: 'mock',
  object: 'chat.completion',
  created: 1,
  model: 'mock',
  choices: [
    {
      index: 0,
      logprobs: null,
      finish_reason: tool_calls ? 'tool_calls' : 'stop',
      message: { role: 'assistant', content, refusal: null, ...(tool_calls ? { tool_calls } : {}) },
    },
  ],
})

export const requestTool = (name: string, args: object, id = name): ChatCompletionMessageToolCall => ({
  id,
  type: 'function',
  function: { name, arguments: JSON.stringify(args) },
})

export const optionsFor = (extra: Partial<SessionSkillPluginOptions> = {}): SessionSkillPluginOptions => ({
  scope: 'session',
  sessionId: 'chat',
  getSkillCandidates: () => [
    { name: 'A', description: 'A summary' },
    { name: 'B', description: 'B summary' },
  ],
  getSkillByName: (name) =>
    ['A', 'B'].includes(name)
      ? { name, description: `${name} summary`, instructions: `${name} instructions` }
      : undefined,
  ...extra,
})

export const sessionEngine = (
  options: SessionSkillPluginOptions,
  responseProvider: ResponseProvider,
  initialMessages: ChatMessage[] = [],
  tools: Partial<Parameters<typeof toolPlugin>[0]> = {},
  adapter: MessageStateAdapter = createNativeMessageAdapter(),
) =>
  createMessageEngine(adapter, {
    initialMessages,
    responseProvider,
    plugins: [
      thinkingPlugin({ disabled: true }),
      lengthPlugin({ disabled: true }),
      toolPlugin({ getTools: () => [], callTool: () => 'unknown tool', ...tools }),
      createSessionSkillPlugin(options),
    ],
  })

export const loadResults = (messages: ChatMessage[]) =>
  messages.flatMap((message) => {
    if (typeof message.content !== 'string') return []
    try {
      const result = message.content.split('\n\nSkill preload result:\n').at(-1)!
      return JSON.parse(result).skills ?? []
    } catch {
      return []
    }
  })

export const legacyExplicitSkillResult = (sessionId: string, result: SessionSkillLoadResult): ChatMessage => ({
  role: 'user',
  content: JSON.stringify(result),
  metadata: { tinyRobotSkillContext: { version: 1, kind: 'load-result', sessionId, source: 'explicit' } },
})
