import {
  createQuickAssist,
  type AIAdapter,
  type AIRequest,
  type QuickAssistContext,
  type QuickAssistActivationInput,
  type QuickAssistActivationView,
  type QuickAssistAnchorShortcut,
  type QuickAssistSelectionSource,
  type QuickAssistInstance,
  type QuickAssistOptions,
  type SelectionSnapshot,
  type Suggestion,
  type ValidateSuggestion,
} from '@opentiny/tiny-robot/vanilla'

export const adapter: AIAdapter = { submit: (_request: AIRequest) => undefined }
export const validateSuggestion: ValidateSuggestion = (suggestion, context) => suggestion.prompt.includes(context.text)
export const options: QuickAssistOptions = {
  adapter,
  sanitizeContext: (context: QuickAssistContext) => context,
  selection: { validate: (snapshot: SelectionSnapshot) => snapshot.text.length > 0 },
  trigger: { showDelay: 200 },
  getSuggestions: (_context, signal): Suggestion[] =>
    signal.aborted ? [] : [{ id: 'test', label: '解释', prompt: '请解释' }],
  validateSuggestion,
}
export const create: (options: QuickAssistOptions) => QuickAssistInstance = createQuickAssist

// Public activation contracts must resolve through the published package declaration entry.
export const validateActivation = (view: QuickAssistActivationView): boolean => view.text.length > 0
export function activatePublic(
  instance: QuickAssistInstance,
  input: QuickAssistActivationInput | QuickAssistAnchorShortcut,
) {
  instance.activate(input)
}
export function registerPublic(instance: QuickAssistInstance, source: QuickAssistSelectionSource): () => void {
  return instance.registerSource(source)
}
