import type { UseMessagePlugin } from '@opentiny/tiny-robot-kit'

export const ERROR_STATE_PLUGIN_NAME = 'error-state'

export type ChatErrorPluginContext = Parameters<NonNullable<UseMessagePlugin['onError']>>[0]

export interface ErrorStatePluginOptions {
  disabled?: UseMessagePlugin['disabled']
  normalizeError?: (error: unknown, context: ChatErrorPluginContext) => unknown
}

const normalizeError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return { message: String(error) }
  }

  const normalizedError: {
    name: string
    message: string
    code?: string | number
  } = {
    name: error.name,
    message: error.message,
  }
  const code = (error as Error & { code?: unknown }).code

  if (typeof code === 'string' || typeof code === 'number') {
    normalizedError.code = code
  }

  return normalizedError
}

export function errorStatePlugin(options: ErrorStatePluginOptions = {}): UseMessagePlugin {
  return {
    name: ERROR_STATE_PLUGIN_NAME,
    disabled: options.disabled,
    onError(context) {
      const targetMessage = [...context.currentTurn].reverse().find((message) => message.role === 'assistant')

      if (!targetMessage) {
        return
      }

      const targetIndex = context.messages.indexOf(targetMessage)
      const target = context.messages[targetIndex]

      if (!target) {
        return
      }

      const normalizedError = options.normalizeError
        ? options.normalizeError(context.error, context)
        : normalizeError(context.error)

      if (normalizedError == null) {
        return
      }

      target.state = { ...target.state, error: normalizedError }
    },
  }
}
