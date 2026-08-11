import type { UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import type { ChatMessageItem } from '../types'
import { readRunConfigFromMessage } from '../utils/runConfig'

function getLastUserMessage(currentTurn: ChatMessageItem[]) {
  return [...currentTurn].reverse().find((message) => message.role === 'user')
}

export function createRunConfigPlugin(): UseMessagePlugin {
  return {
    name: 'chat-run-config',
    onTurnStart({ currentTurn, setCustomContext }) {
      setCustomContext({
        runConfig: readRunConfigFromMessage(getLastUserMessage(currentTurn)),
      })
    },
  }
}
