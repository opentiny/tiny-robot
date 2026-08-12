import type { ChatCompletion, ResponseProvider } from '@opentiny/tiny-robot-kit'
import { createDeferred } from './deferred'

export function createResponseProvider(content = 'ok'): ResponseProvider {
  const response: ChatCompletion = {
    id: 'fixture-response',
    object: 'chat.completion',
    created: 0,
    model: 'fixture-model',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content },
        delta: undefined,
        logprobs: null,
        finish_reason: 'stop',
      },
    ],
  }

  return async () => response
}

export function createRejectingResponseProvider(error: unknown): ResponseProvider {
  return async () => {
    throw error
  }
}

export function createDeferredResponseProvider() {
  const deferred = createDeferred<ChatCompletion>()
  const provider: ResponseProvider = () => deferred.promise
  return { provider, deferred }
}

export function createCancellableResponseProvider() {
  const deferred = createDeferred<ChatCompletion>()
  const provider: ResponseProvider = (_requestBody, signal): Promise<ChatCompletion> => {
    return new Promise<ChatCompletion>((resolve, reject) => {
      if (signal.aborted) {
        const error = new Error('The operation was aborted')
        error.name = 'AbortError'
        reject(error)
        return
      }

      const abort = () => {
        const error = new Error('The operation was aborted')
        error.name = 'AbortError'
        reject(error)
      }

      signal.addEventListener('abort', abort, { once: true })
      deferred.promise.then(
        (value) => {
          signal.removeEventListener('abort', abort)
          resolve(value)
        },
        (error) => {
          signal.removeEventListener('abort', abort)
          reject(error)
        },
      )
    })
  }

  return { provider, deferred }
}
