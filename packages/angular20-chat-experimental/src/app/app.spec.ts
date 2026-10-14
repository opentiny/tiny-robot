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
    expect(typeof chat?.runtimeOptions?.responseProvider).toBe('function');
    expect(chat?.getAttribute('runtime-options')).toBeNull();

    chat!.title = 'Angular host title';
    expect(chat?.getAttribute('title')).toBe('Angular host title');
    expect(warnings.some((warning) => warning.includes('prop "title" conflicts'))).toBeFalse();
  });

  it('reflects the ready CustomEvent and exposes a send control', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const chat = host.querySelector('tr-chat');

    expect(host.querySelector<HTMLButtonElement>('[data-testid="send"]')).not.toBeNull();

    chat?.dispatchEvent(new CustomEvent('ready'));
    fixture.detectChanges();

    expect(host.querySelector('[data-testid="ready-state"]')?.textContent).toContain('ready');
  });
});
