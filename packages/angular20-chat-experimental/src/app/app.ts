import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, signal, ViewChild } from '@angular/core';
import {
  defineTrChatElements,
  type CreateChatRuntimeOptions,
  type TrChatHTMLElement,
} from '@opentiny/tiny-robot-chat/experimental';

defineTrChatElements();

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: {
    '[attr.data-integration-status]': 'sendState()',
  },
})
export class App {
  @ViewChild('chat') private chat?: ElementRef<TrChatHTMLElement>;

  protected readonly ready = signal(false);
  protected readonly sendState = signal<'idle' | 'sending' | 'complete' | 'error'>('idle');
  protected readonly errorMessage = signal('');

  readonly runtimeOptions = {
    storageKey: 'tiny-robot-angular20-experimental',
    responseProvider: async () => ({
      id: 'angular20-completion',
      object: 'chat.completion' as const,
      created: 1,
      model: 'angular20-mock',
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          message: { role: 'assistant' as const, content: 'Angular 20 response complete' },
          delta: undefined,
          logprobs: null,
          finish_reason: 'stop' as const,
        },
      ],
    }),
  } satisfies CreateChatRuntimeOptions;

  protected onReady(): void {
    this.ready.set(true);
  }

  protected onRuntimeError(event: Event): void {
    const detail = (event as CustomEvent<{ error?: unknown }>).detail;
    this.errorMessage.set(String(detail?.error ?? 'Unknown Runtime error'));
    this.sendState.set('error');
  }

  protected async sendMessage(): Promise<void> {
    const element = this.chat?.nativeElement;
    if (!element) return;

    this.sendState.set('sending');
    this.errorMessage.set('');
    const sent = await element.send({ text: 'Hello from Angular 20' });
    this.sendState.set(sent ? 'complete' : 'error');
  }
}
