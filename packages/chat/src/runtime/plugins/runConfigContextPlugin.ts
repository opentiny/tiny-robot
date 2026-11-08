import type { UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import type { ChatMessageItem } from '../../types'
import type { ChatResolvedProviderModel } from '../provider/types'
import { CHAT_RUN_CONFIG_CONTEXT_KEY, readRunConfigFromMessage } from '../runConfig'

function getLastUserMessage(currentTurn: ChatMessageItem[]) {
  return [...currentTurn].reverse().find((message) => message.role === 'user')
}

export function createRunConfigContextPlugin(
  resolveModel?: (modelId: string) => ChatResolvedProviderModel | undefined,
): UseMessagePlugin {
  return {
    name: 'chat-run-config-context',
    onTurnStart({ currentTurn, setCustomContext }) {
      setCustomContext({
        [CHAT_RUN_CONFIG_CONTEXT_KEY]: readRunConfigFromMessage(getLastUserMessage(currentTurn), resolveModel),
      })
    },
  }
}
