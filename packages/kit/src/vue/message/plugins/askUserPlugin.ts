import type { ToolCall } from '../../../types'
import { toolPlugin } from './toolPlugin'

type ToolPluginOptions = Parameters<typeof toolPlugin>[0]

export type AskUserToolPluginOptions = Omit<
  ToolPluginOptions,
  'askUser' | 'getTools' | 'beforeCallTools' | 'shouldPauseToolCall' | 'callTool'
> & {
  /**
   * Provides the product's ordinary tools. The AskUser runtime tool is added
   * by toolPlugin when askUser is enabled.
   */
  getTools?: ToolPluginOptions['getTools']
  /** Executes the product's ordinary tools. */
  callTool?: ToolPluginOptions['callTool']
}

/**
 * @deprecated Prefer toolPlugin({ askUser: true, ... }) so AskUser is composed
 * directly into the product's existing toolPlugin configuration.
 */
export const askUserToolPlugin = (options: AskUserToolPluginOptions = {}): ReturnType<typeof toolPlugin> => {
  const { getTools, callTool, ...restOptions } = options

  return toolPlugin({
    ...restOptions,
    askUser: true,
    getTools: getTools ?? (async () => []),
    callTool:
      callTool ??
      (async (toolCall: ToolCall) => {
        throw new Error(`No handler for ${toolCall.type} tool call`)
      }),
  })
}
