import {
  createQuickAssist,
  type AIAdapter,
  type AIRequest,
  type QuickAssistContext,
  type QuickAssistInstance,
  type QuickAssistOptions,
  type SelectionSnapshot,
  type Suggestion,
} from '@opentiny/tiny-robot/vanilla'

export const adapter: AIAdapter = { submit: (_request: AIRequest) => undefined }
export const options: QuickAssistOptions = {
  adapter,
  sanitizeContext: (context: QuickAssistContext) => context,
  selection: { validate: (snapshot: SelectionSnapshot) => snapshot.text.length > 0 },
  getSuggestions: (_context, signal): Suggestion[] =>
    signal.aborted ? [] : [{ id: 'test', label: '解释', prompt: '请解释' }],
}
export const create: (options: QuickAssistOptions) => QuickAssistInstance = createQuickAssist
