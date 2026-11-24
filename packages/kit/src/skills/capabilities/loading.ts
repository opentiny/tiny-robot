import type { RuntimeTool } from '../../message/plugins/toolPlugin'
import type { createSessionSkillLoader } from '../session/loading'
import { asRecord } from '../session/protocol'

export const createSkillLoadingRuntimeTools = (
  sessionId: string | undefined,
  loader: ReturnType<typeof createSessionSkillLoader>,
): RuntimeTool[] => [
  {
    tool: {
      type: 'function',
      function: {
        name: 'load_skills',
        description:
          'Load full instructions for relevant skills. You may load additional skills throughout the conversation.',
        parameters: {
          type: 'object',
          properties: { skillNames: { type: 'array', minItems: 1, items: { type: 'string' } } },
          required: ['skillNames'],
          additionalProperties: false,
        },
      },
    },
    handler: async (call, context) => {
      let names: unknown
      try {
        names = asRecord(JSON.parse(call.function.arguments || '{}'))?.skillNames
      } catch {
        /* Report invalid arguments below. */
      }
      const result = await loader.load(names as string[], context)
      context.mutate('messages', () => {
        context.toolMessage.metadata ??= {}
        context.toolMessage.metadata.tinyRobotSkillContext = {
          version: 1,
          kind: 'load-result',
          ...(sessionId === undefined ? {} : { sessionId }),
          source: 'auto',
        }
      })
      return result
    },
  },
]
