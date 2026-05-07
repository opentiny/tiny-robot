import { sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import type { ChatCompletion, MessageRequestBody } from '@opentiny/tiny-robot-kit'
import { isImageAttachment, type AttachmentLike } from '@/shared/attachments'
import type { ResponseProvider } from '@/types'

export interface ChatProviderErrorOptions {
  providerId?: string
  message: string
  httpStatus?: number
  code?: string
  retryable?: boolean
  cause?: unknown
}

export class ChatProviderError extends Error {
  providerId?: string
  httpStatus?: number
  statusCode?: number
  code?: string
  retryable?: boolean
  cause?: unknown

  constructor(options: ChatProviderErrorOptions) {
    super(options.message)
    this.name = 'ChatProviderError'
    this.providerId = options.providerId
    this.httpStatus = options.httpStatus
    this.statusCode = options.httpStatus
    this.code = options.code
    this.retryable = options.retryable
    if (options.cause !== undefined) {
      this.cause = options.cause
    }
  }
}

export interface OpenAICompatibleResponseProviderOptions {
  providerId: string
  model: string
  endpoint?: string
  baseURL?: string
  apiPath?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  headers?: Record<string, string>
  credentials?: RequestCredentials
}

function resolveEndpoint(options: OpenAICompatibleResponseProviderOptions): string {
  if (options.endpoint) {
    return options.endpoint
  }

  if (!options.baseURL) {
    throw new Error('[createOpenAICompatibleResponseProvider] Either endpoint or baseURL must be provided')
  }

  const baseURL = options.baseURL.replace(/\/+$/, '')
  const apiPath = options.apiPath ?? '/chat/completions'
  const normalizedApiPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`

  return `${baseURL}${normalizedApiPath}`
}

function toMultimodalContent(message: Partial<Record<string, unknown>>): string | Array<Record<string, unknown>> {
  const attachments = message.attachments as AttachmentLike[] | undefined
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return (message.content as string) ?? ''
  }

  const parts: Array<Record<string, unknown>> = [{ type: 'text', text: (message.content as string) ?? '' }]

  for (const attachment of attachments) {
    const url = attachment.url
    if (!url) continue

    if (isImageAttachment(attachment)) {
      parts.push({ type: 'image_url', image_url: { url } })
    }
    // Future: video_url, file, etc.
  }

  return parts
}

function buildOpenAICompatibleRequestBody(
  options: OpenAICompatibleResponseProviderOptions,
  requestBody: MessageRequestBody,
) {
  const { messages: requestMessages, ...extraRequestFields } = requestBody

  const serializedMessages = requestMessages.map((msg) => {
    const hasAttachments =
      Array.isArray((msg as Record<string, unknown>).attachments) &&
      ((msg as Record<string, unknown>).attachments as unknown[]).length > 0

    if (!hasAttachments) return msg

    const { attachments: _, ...rest } = msg as Record<string, unknown>
    return { ...rest, content: toMultimodalContent(msg as Record<string, unknown>) }
  })

  const messages = options.systemPrompt
    ? [{ role: 'system', content: options.systemPrompt }, ...serializedMessages]
    : serializedMessages

  const body: Record<string, unknown> = {
    ...extraRequestFields,
    model: options.model,
    messages,
    stream: true,
    stream_options: { include_usage: true },
  }

  if (options.temperature !== undefined) {
    body.temperature = options.temperature
  }

  if (options.maxTokens !== undefined) {
    body.max_tokens = options.maxTokens
  }

  return body
}

async function parseProviderErrorResponse(response: Response) {
  const text = await response.text()
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    try {
      const payload = JSON.parse(text) as
        | {
            error?: {
              message?: string
              code?: string
            }
            message?: string
            code?: string
          }
        | undefined

      return {
        message: payload?.error?.message ?? payload?.message ?? text,
        code: payload?.error?.code ?? payload?.code,
      }
    } catch {
      return {
        message: text,
        code: undefined,
      }
    }
  }

  return {
    message: text,
    code: undefined,
  }
}

function inferRetryable(httpStatus?: number, code?: string) {
  if (httpStatus === 401 || httpStatus === 403 || code === 'invalid_api_key') {
    return false
  }

  if (httpStatus === 429 || code === 'rate_limit_exceeded') {
    return true
  }

  if (httpStatus && httpStatus >= 500) {
    return true
  }

  return true
}

export function createOpenAICompatibleResponseProvider(
  options: OpenAICompatibleResponseProviderOptions,
): ResponseProvider {
  const endpoint = resolveEndpoint(options)
  const { headers = {}, credentials } = options

  return async function* (requestBody, abortSignal) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...headers,
      },
      body: JSON.stringify(buildOpenAICompatibleRequestBody(options, requestBody)),
      signal: abortSignal,
      credentials,
    })

    if (!response.ok) {
      const parsed = await parseProviderErrorResponse(response)

      throw new ChatProviderError({
        providerId: options.providerId,
        message: `${options.providerId} API error ${response.status}: ${parsed.message}`,
        httpStatus: response.status,
        code: parsed.code,
        retryable: inferRetryable(response.status, parsed.code),
      })
    }

    let pendingChunk: ChatCompletion | undefined

    for await (const chunk of sseStreamToGenerator<ChatCompletion>(response, { signal: abortSignal })) {
      const hasChoices = Array.isArray(chunk.choices) && chunk.choices.length > 0

      if (!hasChoices && chunk.usage != null) {
        // usage-only chunk (DashScope stream_options pattern):
        // merge usage into the buffered previous chunk and yield together
        yield pendingChunk != null ? { ...pendingChunk, usage: chunk.usage } : chunk
        pendingChunk = undefined
      } else {
        if (pendingChunk) yield pendingChunk
        pendingChunk = chunk
      }
    }

    if (pendingChunk) yield pendingChunk
  }
}
