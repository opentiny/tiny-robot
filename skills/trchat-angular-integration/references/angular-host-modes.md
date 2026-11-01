# Angular host modes

Use Angular 20+ and the published `@opentiny/tiny-robot-chat@1.0.0-alpha.0` experimental entrypoint. `CUSTOM_ELEMENTS_SCHEMA` belongs to the compilation scope of the template containing `<tr-chat>` or `<tr-chat-ui>`:

- **Standalone:** add `schemas: [CUSTOM_ELEMENTS_SCHEMA]` to that standalone component's `@Component` metadata.
- **NgModule:** add it to the `@NgModule` declaring the component whose template contains the element. Importing a module elsewhere does not apply its schema to a different compilation scope.
- **Mixed:** apply the appropriate rule at each actual template boundary. A standalone component owns its own schema even when used by an NgModule; an NgModule-declared component uses its declaring module's schema.

Load `@opentiny/tiny-robot-chat/experimental/web-component.css` in the application's global styles configuration. Size the element and its containing layout explicitly; percentage heights require sized ancestors.

## Browser, server, and hydration

Call `defineTrChatElements()` only in the browser before creating the elements. Registration is idempotent for the same constructors; do not call it on the server. The package supports SSR import through its Node export, but its server registration function throws. For SSR/hydration, keep the element out of server markup and defer its creation until a browser render callback. Put `ngSkipHydration` on the Angular wrapper **component host** so Angular recreates that subtree instead of reconciling DOM modified by a custom element. Validate this boundary with the application's SSR and hydration configuration. For CSR the same wrapper works; the skip marker is only needed for hydration.

The following standalone wrapper illustrates the boundary; for an NgModule set `standalone: false` in the component metadata, remove the component `schemas`, declare it in the module, and put the schema on that module. Angular 20 components default to standalone. Use `<app-chat-host ngSkipHydration />` in an SSR/hydrated parent template.

```ts
import { afterNextRender, ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, NgZone, ViewChild } from '@angular/core';
import { defineTrChatElements, whenTrChatReady } from '@opentiny/tiny-robot-chat/experimental';
import type { CreateChatRuntimeOptions, TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental';

@Component({
  selector: 'app-chat-host', standalone: true, schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: '@if (browserReady) { <tr-chat #chat></tr-chat> }',
  styles: ['tr-chat { display: block; height: 100%; min-height: 30rem; }'],
})
export class ChatHostComponent {
  browserReady = false;
  // Supply app-owned options once; providers must call a server-side proxy.
  readonly options: CreateChatRuntimeOptions = {};
  private element?: TrChatHTMLElement;
  private readonly onError = (event: CustomEvent) => {
    this.zone.run(() => { console.error(event.detail); this.cdr.markForCheck(); });
  };

  constructor(private zone: NgZone, private cdr: ChangeDetectorRef) {
    afterNextRender(() => {
      defineTrChatElements();
      this.browserReady = true;
      this.cdr.markForCheck();
    });
  }

  @ViewChild('chat') set chat(ref: ElementRef<TrChatHTMLElement> | undefined) {
    this.element?.removeEventListener('tr-chat-error', this.onError);
    this.element = ref?.nativeElement;
    if (this.element) {
      this.element.addEventListener('tr-chat-error', this.onError);
      this.element.runtimeOptions = this.options;
    }
  }

  async snapshot() {
    const element = this.element;
    if (!element) return undefined;
    await whenTrChatReady(element);
    return element.getRuntimeSnapshot();
  }

  ngOnDestroy() { this.element?.removeEventListener('tr-chat-error', this.onError); }
}
```

`afterNextRender` is browser-only. Set `runtimeOptions` immediately after connection or before connection, and do not recreate it on each Angular change detection pass: changing its identity can replace the owned runtime. Alternatively assign an application-owned `runtime` property according to the installed declarations. Use `TrChatUIHTMLElement` for `<tr-chat-ui>`. Handle DOM `CustomEvent.detail`, not Vue emit argument conventions. Native listeners may run outside Angular's zone; re-enter with `NgZone.run` and mark an OnPush view for checking when updating Angular state. Remove listeners on teardown. Check actual event names and method signatures in the installed public declarations.
