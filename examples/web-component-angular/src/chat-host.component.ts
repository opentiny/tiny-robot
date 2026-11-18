import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, inject, input, output } from '@angular/core'
import type { ChatUIOptions } from '@opentiny/tiny-robot-chat/experimental'
import type { LayoutFloatingState } from '@opentiny/tiny-robot-chat'
import { createLocalRuntime } from './runtime'

@Component({
  selector: 'demo-chat-host',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: [':host { display: block; height: 100%; }'],
  template: `<tr-chat
    [title]="title()"
    [ui]="ui()"
    [floatingState]="floatingState()"
    [isEmpty]="isEmpty()"
    [runtime]="enabled() ? owned.runtime : undefined"
    (ready)="elementEvent.emit($event)"
    (floating-state-update)="elementEvent.emit($event)"
  />`,
})
export class ChatHostComponent {
  readonly title = input.required<string>()
  readonly ui = input.required<ChatUIOptions>()
  readonly floatingState = input<LayoutFloatingState | undefined>(undefined)
  readonly isEmpty = input<boolean | undefined>(undefined)
  readonly enabled = input(true)
  readonly elementEvent = output<Event>()
  readonly owned = createLocalRuntime()
  constructor() {
    inject(DestroyRef).onDestroy(() => this.owned.dispose())
  }
}
