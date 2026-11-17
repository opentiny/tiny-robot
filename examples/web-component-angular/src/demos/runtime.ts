import { Component, signal } from '@angular/core'
import { ChatDemoComponent } from '../chat-demo.component'

@Component({
  selector: 'demo-runtime-page',
  standalone: true,
  imports: [ChatDemoComponent],
  templateUrl: './runtime.html',
})
export class RuntimeDemoComponent {
  readonly enabled = signal(true)
  readonly mounted = signal(true)
  readonly generation = signal(0)
  mount(enabled: boolean) {
    this.enabled.set(enabled)
    this.mounted.set(true)
    this.generation.update((value) => value + 1)
  }
}
