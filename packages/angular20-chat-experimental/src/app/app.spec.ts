import { TestBed } from '@angular/core/testing';
import type { TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental';
import { App } from './app';
import { trChatEventDetail } from './tr-chat-dom-events';

describe('Angular 20 TrChat experimental consumer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  it('binds owned Runtime options to the custom element as a complex property', () => {
    const warnings: string[] = [];
    spyOn(console, 'warn').and.callFake((...args: unknown[]) => warnings.push(args.join(' ')));
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const chat = fixture.nativeElement.querySelector('tr-chat') as TrChatHTMLElement | null;

    expect(chat).not.toBeNull();
    expect(chat?.runtimeOptions?.modelProviders?.[0]?.models[0]?.capabilities).toEqual({
      thinking: true,
      search: true,
    });
    expect(chat?.runtimeOptions?.storageKey).toBe('tiny-robot-angular20-application-v1');
    expect(chat?.getAttribute('runtime-options')).toBeNull();

    chat!.title = 'Angular host title';
    expect(chat?.getAttribute('title')).toBe('Angular host title');
    expect(warnings.some((warning) => warning.includes('prop "title" conflicts'))).toBeFalse();
  });

  it('offers the current DeepSeek models through a same-origin provider without browser secrets', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const chat = fixture.nativeElement.querySelector('tr-chat') as TrChatHTMLElement;
    const providers = chat.runtimeOptions?.modelProviders ?? [];
    const deepSeek = providers.find((provider) => provider.type === 'deepseek');

    expect(deepSeek?.apiUrl).toBe(`${window.location.origin}/api/deepseek`);
    expect(deepSeek?.apiKey).toBeUndefined();
    expect(deepSeek?.models.map((model) => model.id)).toEqual([
      'deepseek-flash',
      'deepseek-v4-pro',
    ]);
    expect(deepSeek?.models.every((model) => model.capabilities?.thinking)).toBeTrue();
  });

  it('reflects the ready CustomEvent and exposes the Angular-owned application shell', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const chat = host.querySelector('tr-chat');

    expect(host.querySelector<HTMLInputElement>('input[aria-label="搜索会话"]')).not.toBeNull();
    expect(
      host.querySelector<HTMLButtonElement>('[data-testid="new-conversation"]'),
    ).not.toBeNull();
    expect(
      host.querySelector<HTMLButtonElement>('button[aria-label="打开示例设置"]'),
    ).not.toBeNull();

    chat?.dispatchEvent(new CustomEvent('ready'));
    fixture.detectChanges();

    expect(host.querySelector('[data-testid="ready-state"]')?.textContent).toContain('ready');
  });

  it('extracts typed details from standard TrChat DOM events', () => {
    const asideEvent = new CustomEvent<boolean>('right-aside-open-update', { detail: true });
    const inputEvent = new CustomEvent<string>('input-value-update', { detail: 'Angular value' });

    expect(trChatEventDetail(asideEvent, 'right-aside-open-update')).toBeTrue();
    expect(trChatEventDetail(inputEvent, 'input-value-update')).toBe('Angular value');
  });

  it('consumes the unified error contract from the custom element', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const chat = host.querySelector('tr-chat');

    chat?.dispatchEvent(
      new CustomEvent('tr-chat-error', {
        detail: {
          source: 'runtime',
          code: 'runtime_action_failed',
          cause: new Error('Angular unified error'),
          recoverable: true,
          action: 'sendMessage',
        },
      }),
    );
    fixture.detectChanges();

    expect(host.querySelector('[data-testid="runtime-error"]')?.textContent).toContain(
      'Angular unified error',
    );
  });
});
