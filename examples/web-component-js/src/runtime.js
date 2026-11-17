import { effectScope } from 'vue'
import { useChatRuntime } from '@opentiny/tiny-robot-chat'
import { LOCAL_REPLY } from '../../web-component-shared/data.js'

// 本地回复不依赖 API 服务或密钥；每个宿主视图拥有自己的 Runtime。
export function createLocalRuntime() {
  const scope = effectScope()
  const runtime = scope.run(() =>
    useChatRuntime({
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
    }),
  )
  if (!runtime) throw new Error('本地 Runtime 创建失败')
  return {
    runtime,
    release() {
      void runtime.actions.abort?.()
      scope.stop()
    },
  }
}
