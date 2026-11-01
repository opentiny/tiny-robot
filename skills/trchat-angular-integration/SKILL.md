---
name: trchat-angular-integration
description: Add, repair, or validate TrChat Web Component integration in Angular 20+ applications. Excludes native Vue TrChat work and authoring runtime business Skills.
---

# TrChat Angular integration

Inspect the application's Angular version, package manager, compilation boundaries, rendering mode, build configuration and existing integration before changing it. Use published packages, not monorepo source imports. Pin `@opentiny/tiny-robot-chat` to exactly `1.0.0-alpha.0`; if directly importing `@opentiny/tiny-robot-kit`, pin it to the same version. Inspect the installed package exports and declarations for the requested APIs.

Follow [Angular host modes](references/angular-host-modes.md) for schema placement, browser-only registration, SSR/hydration and typed element access. Load `@opentiny/tiny-robot-chat/experimental/web-component.css` globally and give the host and its ancestors a usable size. Use the public `@opentiny/tiny-robot-chat/experimental` entrypoint.

Assign complex configuration as JavaScript properties, not serialized attributes. Keep `runtimeOptions` and renderer arrays stable unless an intentional change is required; consult the installed element types for properties, DOM event `detail`, and methods. Use `whenTrChatReady` before calling methods that depend on readiness. For custom renderers or advanced capabilities, inspect the public declarations and relevant installed package documentation before implementing them.

Keep provider credentials on an application-owned server or proxy; never place secrets in browser configuration, source, or generated assets. Exercise the requested interaction in the app, run its relevant checks and build, and run the read-only [consumer verifier](scripts/verify-consumer.mjs):

```sh
node path/to/skills/trchat-angular-integration/scripts/verify-consumer.mjs <projectRoot> [--build-dir DIR] [--test-secret VALUE]
```

Review every reported check; the verifier supplements rather than replaces browser, SSR, hydration, and application tests.
