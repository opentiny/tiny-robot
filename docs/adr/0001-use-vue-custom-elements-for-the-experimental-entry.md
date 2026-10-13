---
status: accepted
---

# Use Vue custom elements for the experimental entry

The `@opentiny/tiny-robot-chat/experimental` entry will create `<tr-chat>` and `<tr-chat-ui>` with Vue's `defineCustomElement()` plus thin adapter components. The experimental build will bundle Vue 3.5 or later so that it can use Light DOM without raising the stable package entry's Vue `^3.3.11` compatibility floor. The adapters own only TrChat-specific boundaries such as DOM event normalization, renderer properties, Runtime disposal, and public methods.

## Considered Options

- `defineCustomElement()` was selected because Vue already implements property upgrade, attribute reflection, connection and movement handling, unmounting, and `defineExpose()` forwarding.
- A handwritten `HTMLElement` plus `createApp()` was rejected as the default because it would duplicate those lifecycle rules. It remains the fallback if the prototype finds a blocking Vue Custom Element defect.
- A native rewrite was rejected because it would test a second implementation rather than test whether the existing TrChat can cross the Web Component boundary.

## Consequences

The experimental artifact carries its own Vue runtime and must report the resulting bundle cost. Vue's default event and slot behavior is not accepted as the public contract; the adapter must expose DOM-native events and renderer-based scoped customization.
