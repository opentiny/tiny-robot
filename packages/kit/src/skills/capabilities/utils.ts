import type { RuntimeTool } from '../../message/plugins/toolPlugin'

export const parseToolArguments = (toolCall: Parameters<RuntimeTool['handler']>[0]): Record<string, unknown> => {
  const rawArguments = toolCall.function.arguments

  if (!rawArguments) {
    return {}
  }

  try {
    const parsed = JSON.parse(rawArguments)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}
