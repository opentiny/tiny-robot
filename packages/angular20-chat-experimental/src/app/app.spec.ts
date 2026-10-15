import { TestBed } from '@angular/core/testing';
import type { TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental';
import { App } from './app';

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
});
