import type { MessageRequestBody } from '../types'

type RequestBodyFinalizer = (requestBody: MessageRequestBody) => void

const requestBodyFinalizers = new WeakMap<MessageRequestBody, RequestBodyFinalizer[]>()

export const addRequestBodyFinalizer = (requestBody: MessageRequestBody, finalizer: RequestBodyFinalizer): void => {
  const finalizers = requestBodyFinalizers.get(requestBody) ?? []
  finalizers.push(finalizer)
  requestBodyFinalizers.set(requestBody, finalizers)
}

export const runRequestBodyFinalizers = (requestBody: MessageRequestBody): void => {
  const finalizers = requestBodyFinalizers.get(requestBody) ?? []
  requestBodyFinalizers.delete(requestBody)

  for (const finalizer of finalizers) {
    finalizer(requestBody)
  }
}
