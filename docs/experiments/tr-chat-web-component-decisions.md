# TrChat Web Component Experiment Decisions

This is the durable decision and follow-up register for validating TrChat as Web Components. It records why choices were made and separates prototype-critical work from questions that should not delay the experiment.

Actionable follow-up work is tracked in [`tr-chat-web-component-todo.md`](./tr-chat-web-component-todo.md).

## Baseline

- Source documentation PR: `opentiny/tiny-robot#452`
- Initial source commit: `c855826eba33f1d151514c9469b56fd09e679ae0`
- Re-read the PR source before final verification and record the final baseline commit in the report.

## Accepted for the prototype

- Export the experiment from `@opentiny/tiny-robot-chat/experimental` rather than a separate package.
- Provide `<tr-chat>` and `<tr-chat-ui>` as separate elements and register them explicitly with an idempotent `defineTrChatElements()` helper.
- Build a self-contained ESM with Vue 3.5 or later bundled into the experimental artifact.
- Use Vue `defineCustomElement()` with thin TrChat-specific adapter components. Fall back to a handwritten `HTMLElement` wrapper only if the prototype demonstrates a blocking Vue defect.
- Render in Light DOM and require an explicit `@opentiny/tiny-robot-chat/experimental/web-component.css` import.
- Measure behavioral parity rather than Vue-syntax identity.
- Use attributes for primitive inputs and DOM properties for objects, functions, Runtime instances, and renderers. Do not parse complex JSON attributes.
- Emit kebab-case DOM `CustomEvent`s with the payload directly in `detail`; use cancelable events where the Vue behavior has a preventable default action.
- Map Vue `update:*` events mechanically to `*-update` DOM events so that update signals remain distinct from existing `*-change` events.
- Keep controlled state controlled: emit changes and let the caller write new values back. Preserve separate default properties for uncontrolled state.
- Support every static customization point with Light DOM slots and every scoped customization point with DOM renderers. Native `TrChat` / `TrChatUI` own renderer resolution, returned-node replacement, and the consumer cleanup `AbortSignal`; Web Component wrappers pass `renderers` through without reconstructing Vue scoped slots.
- Resolve each scoped customization deterministically as `Vue scoped slot > DOM renderer > built-in fallback`, including structural visibility decisions for empty state and aside regions.
- Keep the DOM `layout-empty-state` context free of the Vue-only `renderComposer(): VNode` callback. Treat a framework-neutral Composer Outlet as a separate follow-up decision.
- Expose a non-Vue `createChatRuntime()` returning `{ runtime, dispose }`, and allow advanced callers to inject an existing Runtime. Removing an element disposes only a runtime it owns and must not delete persisted conversations.
- Keep the existing default conversation storage key, expose storage configuration, and warn when multiple active owned runtimes share the default key.
- Emit a one-time `ready` event after first mount and provide `whenTrChatReady(element)` for callers that need to invoke public methods without an initialization race.
- Classify matrix results as `direct`, `adapted`, `partial`, `blocked`, `not-applicable`, or `not-run`. Coverage is `(direct + adapted) / applicable`; partial results are not assigned arbitrary fractional credit.
- Use a deterministic mock for the full matrix, followed by one real streaming-model smoke test and one real MCP smoke test when suitable credentials and endpoints are available.
- Run the full matrix in Chromium and core smoke tests in Firefox and WebKit.
- Normalize dynamic content before automated screenshot comparison. Only material layout, overflow, popover-placement, and responsive regressions block the prototype conclusion.
- Preserve the 18 Vue documentation demos as baselines and add parallel experimental examples.
- Keep public contract, lifecycle, and example-matrix tests if the experimental entry is retained; remove implementation-only diagnostics and tests that protect no lasting production behavior.
- Register only the default element names in the helper, while exporting constructors for advanced manual registration.
- Ship native DOM TypeScript contracts for properties, methods, events, renderers, and the Runtime factory; defer framework-specific type augmentation.
- Keep a Markdown statistics report and a machine-readable compatibility matrix. Do not commit temporary screenshots, traces, video, or raw runner output.
- If the prototype misses the go/no-go standard, keep the report but do not publish the experimental export.

## Prototype go/no-go rule

All 18 documentation examples must have an explicit result. Message send, streaming, cancellation, conversations, error recovery, responsive layout, and lifecycle must have no blocking defect. Direct platform support and adapter-provided support must be reported separately, especially for scoped customization.

## Deferred decisions

These questions are intentionally recorded but are not prototype acceptance criteria.

- **Experimental versioning policy**: provisionally allow breaking experimental changes in a minor release when accompanied by a changelog and migration note. Revisit only if the prototype is promoted into a published experimental API.
- **SSR**: server rendering and hydration remain deferred. The later stabilization batch added an SSR-safe Node conditional import; custom-element registration still runs only in the browser.
- **Shadow DOM**: evaluate feasibility and migration cost in the report; do not implement it in the first prototype.
- **Additional bundles**: defer IIFE/UMD, external-Vue, CDN-optimized, and code-split variants until bundle measurements justify them.
- **Framework-specific integrations**: Vanilla JS is the primary consumer. React, Angular, and Vue receive smoke coverage only; dedicated wrappers and type augmentation are later work.
- **Full cross-browser matrix**: Firefox and WebKit receive core smoke coverage, not every example permutation.
- **Full accessibility certification**: keep keyboard and basic accessibility checks in scope, but defer a complete audit and certification.
- **Advanced performance work**: record bundle size and representative mount timing; defer long-running memory, stress, and performance budgets.
- **CSP and nonce support**: the separate stylesheet avoids inline-style pressure, but formal CSP validation is later work.
- **Legacy browsers and polyfills**: no support work beyond the browsers in the agreed matrix.
- **Promotion and deprecation process**: define how experimental APIs graduate, change, or disappear only after the prototype conclusion.
