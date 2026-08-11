import type { UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import type { ChatMessageItem } from '../types'
import { CHAT_RUN_CONFIG_CONTEXT_KEY, readRunConfigFromMessage } from '../utils/runConfig'

function getLastUserMessage(currentTurn: ChatMessageItem[]) {
  return [...currentTurn].reverse().find((message) => message.role === 'user')
}

export function createRunConfigContextPlugin(): UseMessagePlugin {
  return {
    name: 'chat-run-config-context',
    onTurnStart({ currentTurn, setCustomContext }) {
      setCustomContext({
        [CHAT_RUN_CONFIG_CONTEXT_KEY]: readRunConfigFromMessage(getLastUserMessage(currentTurn)),
      })
    },
  }
}
