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
@import '@opentiny/tiny-robot-chat/experimental.css';
```

Angular integration uses `CUSTOM_ELEMENTS_SCHEMA`, property binding for `runtimeOptions`, standard DOM events, and the element's public `send()` method. The response provider is deterministic and does not require external credentials.

From the repository root:

```bash
pnpm -F @opentiny/tiny-robot-chat build
pnpm -F @opentiny/tiny-robot-angular20-experimental test
pnpm -F @opentiny/tiny-robot-angular20-experimental build
pnpm -F @opentiny/tiny-robot-angular20-experimental test:e2e
```
