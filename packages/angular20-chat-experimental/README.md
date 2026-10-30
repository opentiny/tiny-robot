# Angular 20 × TrChat experimental

Private external-consumer fixture used to prove that the published TrChat alpha Web Component works in an Angular 20 standalone application. It pins `@opentiny/tiny-robot-chat` and `@opentiny/tiny-robot-kit` to `1.0.0-alpha.0` and includes deterministic end-to-end scenarios for streaming chat, server-style history, native MCP `tools/call`, TinyRobot Kit Skills, text/image attachments, multimodal messages, message actions, responsive layout, and accessibility.

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

Angular integration uses `CUSTOM_ELEMENTS_SCHEMA`, property binding for `runtimeOptions`, standard DOM events, and the element's public `send()` method. The default response provider is deterministic and does not require external credentials.

## Optional DeepSeek API

The model picker also exposes the current public DeepSeek API models, `deepseek-flash` (DeepSeek V4.1 Flash, text and image input) and `deepseek-v4-pro` (text input). Their thinking toggle and `low` / `high` / `max` effort options use TrChat's DeepSeek provider preset. These identifiers and capabilities were checked against the official [model list](https://api-docs.deepseek.com/api/list-models/) and [quick start](https://api-docs.deepseek.com/quick_start/agent_integrations/) on 2026-10-30.

Copy the example file and add your own key locally:

```bash
cp packages/angular20-chat-experimental/.env.example \
  packages/angular20-chat-experimental/.env.local
```

```dotenv
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
DEEPSEEK_API_BASE_URL=https://api.deepseek.com
```

The Angular development server reads this file through `proxy.conf.cjs`. Browser requests go to the same-origin `/api/deepseek/chat/completions` path, and only the development proxy adds the bearer token. The key is never assigned to `runtimeOptions` or bundled into browser JavaScript. `.env.local` is ignored by Git.

Restart `ng serve` after changing `.env.local`. A production deployment must provide an equivalent server-side `/api/deepseek` proxy; the static Angular build cannot safely carry the API key.

From the repository root:

Use an Angular 20 supported Node LTS release (the final verification used Node 22.23.4). Node 26.11.1 is unsupported by Angular 20 and aborts in the esbuild service before application diagnostics are emitted.

```bash
pnpm -F @opentiny/tiny-robot-angular20-experimental test:package
pnpm -F @opentiny/tiny-robot-angular20-experimental test
pnpm -F @opentiny/tiny-robot-angular20-experimental test:proxy
pnpm -F @opentiny/tiny-robot-angular20-experimental build
pnpm -F @opentiny/tiny-robot-angular20-experimental test:e2e
```
