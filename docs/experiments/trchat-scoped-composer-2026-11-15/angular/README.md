# Angular scoped composer validation

`scoped-host.ts` is a reusable Angular 20 standalone component. Import `ScopedComposerHost` in a Standalone root, an NgModule's `imports`, or an SSR root. Add `<app-scoped-host ngSkipHydration />` and visit `/?scoped`. The component registers and creates custom elements inside `afterNextRender`; the server renders a hidden placeholder. All Renderers, runtime options, data and attachments are DOM properties. The UI draft is written back from typed `CustomEvent.detail`.

The demo exercises the two approved P1 improvements on both tags:

- `sender-actions-inline`, `sender-footer`, `sender-footer-right` use the native cursor-aware insert, append and replace operations. The public scope exposes boolean disabled/loading/hasContent and focus/blur operations; no editor instance.
- `layout-empty-state` calls `renderComposer()` synchronously and includes its returned DOM container in the Renderer output. The component mounts the real native composer internally.

The welcome controls replace the outer Renderer, restore the default placement and call retired handles. Draft and attachments survive Renderer/placement changes, while expired handles are inert. Replacing the outer invocation may recreate the editor and does not preserve selection or IME composition across that explicit teardown. Ordinary draft/UI-option updates and Runtime-generated model/attachment updates preserve an active invocation's editor. Native scoped operations edit optimistically and emit update requests; Angular remains responsible for accepted `inputValue` writeback. They are not veto/transaction APIs.

Only one native welcome composer is mounted. Calls are idempotent inside a Renderer invocation; an omitted target, callback failure or sender=false mounts no hidden editor. Existing Vue slots keep precedence. Custom-element static footer slots are fallback when the matching scoped Renderer is absent. Built-in toolbar, upload and submit controls remain present.

Install locally packed **1.0.1-based candidates** for Chat, Components, Kit and SVG. Registry Chat 1.0.1 does not provide experimental exports. This task uses the existing fixtures under `/private/tmp/trchat-1.0.1-eval/{standalone,ngmodule,ssr}`; `provenance.json` records the final candidate path/hashes and installed versions. Do not use source imports or workspace links. Final builds use Node22 and Angular CLI, outside this sandbox because native Angular build tooling aborts within it.

Serve Standalone's production `dist/*/browser` directory on port4320, NgModule on4219, and start SSR's production `server.mjs` with `PORT=4319`. From repository root:

```sh
node docs/experiments/trchat-scoped-composer-2026-11-15/angular/validate.mjs
```

`TRCHAT_FIXTURES` overrides the consumer fixture root used to load Playwright; `TRCHAT_EVIDENCE` overrides screenshot output. The validator checks DOM property identity, native edits/selection, Angular controlled writeback, stale signal/handle behavior, welcome/default placement, exact draft restoration, attachments/tool preservation, direct clipboard detail and cancellation, SSR placeholder boundary and responsive control geometry. It saves desktop1440×1080 and two390×844 views per host (nine screenshots) plus `browser-results.json`.

The demo uses the supported `sender.showWordLimit: false` option to leave room for its extra scoped actions on narrow screens. Native toolbar, upload, clear and submit controls keep their original layout. Geometry checks include visible native and custom buttons; hidden attachment preview controls have no layout box and are excluded. Each mobile chat frame is 520px tall so the welcome and composer are visible together.

All provider responses and storage are local deterministic fixtures. Clipboard payloads use synthetic native DOM events with local File objects; native OS permissions/pickers and remote providers/MCP remain outside validation. `sender-content` rich-editor replacement remains a separate API-design boundary.
