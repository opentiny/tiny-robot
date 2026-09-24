import type { QuickAssistRecommendationModule } from '../core/types'
import type {
  GetSuggestions,
  MergeSuggestions,
  QuickAssistContext,
  QuickAssistMessages,
  QuickAssistSuggestionInput,
  Suggestion,
  SuggestionFactory,
} from '../types'

export interface RecommendationResolverOptions {
  suggestions?: QuickAssistSuggestionInput[]
  getSuggestions?: GetSuggestions
  mergeSuggestions?: MergeSuggestions
  maxSuggestions: number
  messages: QuickAssistMessages
}

function renderMessage(
  message: string | ((text: string) => string) | undefined,
  text: string,
  fallback: string,
): string {
  const value = typeof message === 'function' ? message(text) : message
  return (value ?? fallback).replace(/\{text\}/gu, text)
}

function defaultSuggestions(context: QuickAssistContext, messages: QuickAssistMessages): Suggestion[] {
  const text = context.text
  return [
    {
      id: 'explain',
      label: renderMessage(messages.defaultExplain, text, `解释 ${text}`),
      prompt: `请结合当前页面上下文解释「${text}」是什么意思`,
    },
    {
      id: 'use-case',
      label: renderMessage(messages.defaultUseCase, text, `${text} 适用场景`),
      prompt: `请结合当前页面上下文说明「${text}」的适用场景`,
    },
  ]
}

function isFactory(value: QuickAssistSuggestionInput): value is SuggestionFactory {
  return (
    typeof value === 'object' &&
    typeof (value as SuggestionFactory).getLabel === 'function' &&
    typeof (value as SuggestionFactory).getPrompt === 'function'
  )
}

function copySuggestion(value: Suggestion): Suggestion {
  return value.meta ? { ...value, meta: { ...value.meta } } : { ...value }
}

function validateSuggestion(value: unknown, index: number): Suggestion {
  if (!value || typeof value !== 'object') throw new Error(`Suggestion ${index} must be an object`)
  const item = value as Partial<Suggestion>
  if (typeof item.id !== 'string' || !item.id.trim()) throw new Error(`Suggestion ${index} has an invalid id`)
  if (typeof item.label !== 'string') throw new Error(`Suggestion ${index} has an invalid label`)
  if (typeof item.prompt !== 'string') throw new Error(`Suggestion ${index} has an invalid prompt`)
  return copySuggestion({
    id: item.id,
    label: item.label,
    prompt: item.prompt,
    ...(item.meta ? { meta: item.meta } : {}),
  })
}

function dedupeAndLimit(values: Suggestion[], maxSuggestions: number): Suggestion[] {
  const seen = new Set<string>()
  const result: Suggestion[] = []
  for (const value of values) {
    if (seen.has(value.id)) continue
    seen.add(value.id)
    result.push(copySuggestion(value))
    if (result.length >= maxSuggestions) break
  }
  return result
}

function defaultMerge(base: Suggestion[], incoming: Suggestion[], maxSuggestions: number): Suggestion[] {
  return dedupeAndLimit([...base, ...incoming], maxSuggestions)
}

/** Resolve synchronous templates and optional asynchronous recommendations. */
export function createRecommendationResolver(
  options: RecommendationResolverOptions,
): QuickAssistRecommendationModule & {
  resolveAsync: (context: QuickAssistContext, signal: AbortSignal) => Promise<Suggestion[]>
} {
  if (!Number.isInteger(options.maxSuggestions) || options.maxSuggestions <= 0) {
    throw new Error('QuickAssist maxSuggestions must be a positive integer')
  }
  const configured = options.suggestions
  const hasConfiguredSuggestions = configured !== undefined
  const staticInputs = configured ?? []

  const resolveBase = (context: QuickAssistContext): Suggestion[] => {
    const inputs = hasConfiguredSuggestions ? staticInputs : []
    if (!hasConfiguredSuggestions && !options.getSuggestions) {
      return defaultMerge(defaultSuggestions(context, options.messages), [], options.maxSuggestions)
    }
    const values = inputs.map((input, index) => {
      if (isFactory(input)) {
        let label: string
        let prompt: string
        try {
          label = input.getLabel(context)
          prompt = input.getPrompt(context)
        } catch (error) {
          throw error instanceof Error ? error : new Error(String(error))
        }
        return validateSuggestion({ id: input.id, label, prompt }, index)
      }
      return validateSuggestion(input, index)
    })
    return dedupeAndLimit(values, options.maxSuggestions)
  }

  const resolveAsync = async (context: QuickAssistContext, signal: AbortSignal): Promise<Suggestion[]> => {
    if (!options.getSuggestions) return []
    if (signal.aborted) return []
    const incoming = await options.getSuggestions(context, signal)
    if (signal.aborted) return []
    if (!Array.isArray(incoming)) throw new Error('getSuggestions must return an array')
    // Keep the complete provider result here. A duplicate of a base template
    // may be followed by a useful new item; limiting before merge would hide it
    // from both the default and custom merge strategies.
    return incoming.map((item, index) => validateSuggestion(item, index))
  }

  const merge = (base: Suggestion[], incoming: Suggestion[], context: QuickAssistContext): Suggestion[] => {
    const normalizedBase = base.map((item, index) => validateSuggestion(item, index))
    const normalizedIncoming = incoming.map((item, index) => validateSuggestion(item, index))
    const merged = options.mergeSuggestions
      ? options.mergeSuggestions([...normalizedBase], [...normalizedIncoming], context)
      : defaultMerge(normalizedBase, normalizedIncoming, options.maxSuggestions)
    if (!Array.isArray(merged)) throw new Error('mergeSuggestions must return an array')
    return dedupeAndLimit(
      merged.map((item, index) => validateSuggestion(item, index)),
      options.maxSuggestions,
    )
  }

  return { resolveBase, resolveAsync, merge }
}

export { defaultSuggestions, dedupeAndLimit }
