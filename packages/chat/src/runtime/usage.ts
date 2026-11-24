import { isChatTokenUsage } from '@opentiny/tiny-robot-kit'
import type { ChatTokenUsage } from '@opentiny/tiny-robot-kit'

export { isChatTokenUsage }

export function resolveChatTokenUsage(value: unknown): ChatTokenUsage | undefined {
  return isChatTokenUsage(value) ? value : undefined
}
