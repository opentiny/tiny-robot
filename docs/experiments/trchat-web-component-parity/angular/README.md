# Angular composer parity demo

`parity-host.ts` is a standalone Angular 20 component that can be imported by a Standalone root, by an NgModule's `imports`, or by an SSR root. Add `<app-parity-host ngSkipHydration />` to the host template and visit `/?parity`. For CSR the attribute is harmless; for SSR it preserves the explicit browser-created subtree boundary. The server renders a hidden placeholder only. The component registers and creates both elements in `afterNextRender`, assigns complex values as properties before connection, and removes owned elements/listeners on destruction.

The host sets `--tr-layout-height: 100%` so the native layout fits each caller-owned card. The demo exercises both tags through actual Angular buttons: prepare/clear/focus a draft, true/false/automatic empty state, and an initial native `input-prefix` slot. Its presentation element uses an Angular signal as the controlled draft and handles `input-value-update` through typed `CustomEvent.detail`. Sender listeners receive original drag/paste events and demonstrate local file receipt; they do not perform uploads. All responses and storage are deterministic and local.

Use locally packed **1.0.1-based candidate** tarballs for Chat, Components, Kit and SVG. The registry Chat 1.0.1 artifact does not contain the experimental exports. Keep the tarball dependency paths and matching npm/pnpm lockfile, install normally, and run the consumer verifier before testing. Never use workspace links or source imports.

The validation performed for this report reused the three existing fixtures under `/private/tmp/trchat-1.0.1-eval/{standalone,ngmodule,ssr}`. They now install tarballs from `/private/tmp/trchat-parity-reviewed-1.0.1-packages/`. Build each host with its Angular CLI; these macOS builds required execution outside the sandbox because the native build tooling aborted inside it. Node 22.23.1 was used for the final builds. Do not treat temporary fixture directory names containing `rc9` as version evidence; installed manifests and the verifier establish the 1.0.1 baseline.

Serve the Standalone and NgModule `dist/*/browser` production directories on ports 4320 and 4219. Start the SSR production `server.mjs` with `PORT=4319`. Then run from the repository root:

```sh
TRCHAT_STANDALONE_URL=http://127.0.0.1:4320 node docs/experiments/trchat-web-component-parity/angular/validate.mjs
```

`TRCHAT_FIXTURES` overrides the fixture root used to resolve the consumer's Playwright installation. `TRCHAT_EVIDENCE` overrides the screenshot output directory. The browser validator checks the server placeholder boundary, actual Angular draft/focus controls, all ten sender events across both tags, original payload identity, native cancellation, local File receipt, DOM property identity, tri-state/attribute empty-state behavior and desktop/390px geometry. It writes nine screenshots and `browser-results.json`. Synthetic DragEvent/ClipboardEvent payloads validate the public event bridge; native OS pickers/clipboard permissions are outside this scenario.
