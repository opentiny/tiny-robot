# Angular 20 × TrChat experimental

Private workspace consumer used to prove that the Vue-based TrChat Web Component works in an Angular 20 standalone application.

The project was created with the official Angular CLI 20 flow:

```bash
pnpm dlx @angular/cli@20 new angular20-chat-experimental \
  --directory packages/angular20-chat-experimental \
  --standalone --routing=false --style=css --skip-git --skip-install \
  --package-manager=pnpm --strict --defaults
```

It consumes only the package's public experimental exports:

```ts
import {
  defineTrChatElements,
  type CreateChatRuntimeOptions,
} from '@opentiny/tiny-robot-chat/experimental';

defineTrChatElements();
```

```css
@import '@opentiny/tiny-robot-chat/experimental/web-component.css';
```

`experimental/web-component.css` is self-contained and includes the TinyRobot component styles required by the element. When the host has an explicit height, set `--tr-layout-height: 100%` on the element so the inner layout uses the host bounds instead of the viewport default. If the host can be narrower than the layout's default 320px main column, override `--tr-layout-main-min-width` as well; this fixture uses `0` and verifies a 320px viewport without horizontal overflow.

Angular integration uses `CUSTOM_ELEMENTS_SCHEMA`, property binding for `runtimeOptions`, standard DOM events, and the element's public `send()` method. The response provider is deterministic and does not require external credentials.

From the repository root:

```bash
pnpm -F @opentiny/tiny-robot-chat build
pnpm -F @opentiny/tiny-robot-angular20-experimental test
pnpm -F @opentiny/tiny-robot-angular20-experimental build
pnpm -F @opentiny/tiny-robot-angular20-experimental test:e2e
```
