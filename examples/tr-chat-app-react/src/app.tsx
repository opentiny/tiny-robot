import { useLayoutEffect, useState } from 'react'
import type { ChatRuntime } from '@opentiny/tiny-robot-chat'
import { createChatConfig } from './chat/config'
import { createAppRuntime } from './chat/runtime'
import { ChatPage } from './pages/chat-page'
import { WorkspacePage } from './pages/workspace-page'

export function App() {
  const workspace = location.pathname.replace(/\/+$/, '') === '/workspace'
  const [configResult] = useState(() => {
    try {
      return { config: createChatConfig(import.meta.env, location.origin), error: '' }
    } catch {
      return { config: undefined, error: '模型配置无法加载，请检查 .env 中的服务地址与模型 ID。' }
    }
  })
  const [runtime, setRuntime] = useState<ChatRuntime>()
  const [error, setError] = useState(configResult.error)
  const [dark, setDark] = useState(() => localStorage.getItem('tiny-robot-color-mode') === 'dark')
  const config = configResult.config
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-tr-color-mode', dark ? 'dark' : 'light')
    localStorage.setItem('tiny-robot-color-mode', dark ? 'dark' : 'light')
  }, [dark])
  useLayoutEffect(() => {
    if (!config?.modelProviders.length) return
    try {
      const owned = createAppRuntime(config)
      setRuntime(owned.runtime)
      return () => {
        void owned.dispose().catch(console.error)
      }
    } catch {
      setError('模型配置无法加载，请检查 .env 中的服务地址与模型 ID。')
    }
  }, [config])
  return (
    <div className="app-shell">
      <header className="app-bar">
        <strong>TinyRobot AI</strong>
        <nav aria-label="应用页面">
          <a href="/chat" aria-current={!workspace ? 'page' : undefined}>
            完整聊天
          </a>
          <a href="/workspace" aria-current={workspace ? 'page' : undefined}>
            工作台
          </a>
          <button type="button" aria-label="切换主题" onClick={() => setDark(!dark)}>
            {dark ? '浅色模式' : '深色模式'}
          </button>
        </nav>
      </header>
      {runtime && config && !error ? (
        workspace ? (
          <WorkspacePage runtime={runtime} ui={config.ui} />
        ) : (
          <ChatPage runtime={runtime} ui={config.ui} />
        )
      ) : (
        <main className="setup">
          <h1>{error ? '模型配置无法加载' : '模型服务尚未配置'}</h1>
          <p>
            {error ||
              '请在当前示例项目的 .env 中填写模型服务的真实 API Key，或填写你自己的模型接口地址，然后重新启动应用。'}
          </p>
        </main>
      )}
    </div>
  )
}
