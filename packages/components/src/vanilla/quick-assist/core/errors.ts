/** Preserve the pipeline stage when asynchronous context construction fails. */
export class QuickAssistStageError extends Error {
  constructor(
    readonly stage: 'context' | 'sanitize',
    cause: unknown,
  ) {
    super(cause instanceof Error ? cause.message : String(cause))
    this.name = 'QuickAssistStageError'
  }
}
