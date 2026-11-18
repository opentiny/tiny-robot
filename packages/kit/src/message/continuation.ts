/** Internal user prompts inserted to continue a truncated answer. */
export const AUTO_CONTINUATION_METADATA_KEY = 'autoContinuation'

export function isAutoContinuationMessage(message: { metadata?: Record<string, unknown> }): boolean {
  return message.metadata?.[AUTO_CONTINUATION_METADATA_KEY] === true
}
