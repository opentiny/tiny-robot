import { Component, DestroyRef, inject } from '@angular/core'
import type { ChatRuntime, ChatUIOptions } from '@opentiny/tiny-robot-chat'
import { env } from './environments/env.generated'
import { createChatConfig } from './chat/config'
import { createAppRuntime } from './chat/runtime'
import { ChatPageComponent } from './pages/chat-page.component'
import { WorkspacePageComponent } from './pages/workspace-page.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatPageComponent, WorkspacePageComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly workspace = location.pathname.replace(/\/+$/, '') === '/workspace'
  runtime?: ChatRuntime
  ui: ChatUIOptions = {}
  error = ''
  dark = localStorage.getItem('tiny-robot-color-mode') === 'dark'
  constructor() {
    this.applyTheme()
    const destroy = inject(DestroyRef)
    try {
      const config = createChatConfig(env, location.origin)
      if (!config.modelProviders.length) return
      const owned = createAppRuntime(config)
      this.runtime = owned.runtime
      this.ui = config.ui
      destroy.onDestroy(() => {
        void owned.dispose().catch(console.error)
      })
    } catch {
      this.error = '模型配置无法加载，请检查 .env 中的服务地址与模型 ID。'
    }
  }
  toggleTheme() {
    this.dark = !this.dark
    this.applyTheme()
  }
  private applyTheme() {
    document.documentElement.setAttribute('data-tr-color-mode', this.dark ? 'dark' : 'light')
    localStorage.setItem('tiny-robot-color-mode', this.dark ? 'dark' : 'light')
  }
}
