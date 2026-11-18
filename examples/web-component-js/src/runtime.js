import { createChatRuntime } from '@opentiny/tiny-robot-chat'
import { LOCAL_REPLY } from '../../web-component-shared/data.js'

// 每个宿主视图拥有自己的 Runtime。
export function createLocalRuntime() {
  return createChatRuntime({
    conversation: {
      autoSaveMessages: false,
      useMessageOptions: {
        responseProvider: async () => ({
          id: 'local-reply',
          object: 'chat.completion',
          created: 1,
          model: 'local',
          system_fingerprint: null,
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: LOCAL_REPLY },
              delta: undefined,
              logprobs: null,
              finish_reason: 'stop',
            },
          ],
        }),
      },
    },
  })
}
