import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import type { ChatRuntime } from '@opentiny/tiny-robot-chat/experimental'
import { PROMPT_GROUPS, SLOT_UI } from '../../../web-component-shared/ordinary-slots.js'
import { createLocalRuntime } from '../runtime'

@Component({
  selector: 'demo-ordinary-slots-page',
  standalone: true,
  imports: [FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './ordinary-slots.html',
})
export class OrdinarySlotsDemoComponent {
  kind = 'chat'
  topic = '产品接入'
  slots = { welcome: false, prompts: false, header: true, prefix: false, footer: false, footerRight: false }
  welcomeText = '支持产品咨询、接入指导与问题排查。'
  badge = 'AI'
  footerText = '请勿发送密码等敏感信息。'
  footerRightText = 'Enter 发送'
  empty = true
  mounted = true
  promptGroup = 0
  ui = SLOT_UI
  runtime?: ChatRuntime
  private owned?: ReturnType<typeof createLocalRuntime>

  constructor() {
    this.updateRuntime()
    inject(DestroyRef).onDestroy(() => this.owned?.dispose())
  }

  changePrompts() {
    this.promptGroup = (this.promptGroup + 1) % PROMPT_GROUPS.length
    this.ui = { ...SLOT_UI, prompts: { items: PROMPT_GROUPS[this.promptGroup] } }
  }

  changeKind(kind: string) {
    this.kind = kind
    this.updateRuntime()
  }

  toggleMounted() {
    this.mounted = !this.mounted
    this.updateRuntime()
  }

  private updateRuntime() {
    this.owned?.dispose()
    this.owned = undefined
    this.runtime = undefined
    if (this.mounted && this.kind === 'chat') {
      this.owned = createLocalRuntime()
      this.runtime = this.owned.runtime
    }
  }
}
