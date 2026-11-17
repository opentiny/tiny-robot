import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import type { TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental'
import { ChatDemoComponent } from '../chat-demo.component'

@Component({
  selector: 'demo-methods-page',
  standalone: true,
  imports: [FormsModule, ChatDemoComponent],
  templateUrl: './methods.html',
})
export class MethodsDemoComponent {
  chat?: TrChatHTMLElement
  text = '通过元素方法发送'
  result = '等待操作'
  async run(action: 'set' | 'clear' | 'focus' | 'send') {
    const chat = this.chat
    if (!chat) return
    try {
      if (action === 'set') {
        chat.setInputValue(this.text)
        this.result = '已设置输入'
      }
      if (action === 'clear') {
        chat.clearInput()
        this.result = '已清空输入'
      }
      if (action === 'focus') this.result = `聚焦结果：${await chat.focusInput()}`
      if (action === 'send') this.result = `发送结果：${await chat.send({ text: this.text })}`
    } catch (error) {
      this.result = String(error)
    }
  }
}
