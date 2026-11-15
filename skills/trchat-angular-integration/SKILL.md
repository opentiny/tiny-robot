---
name: trchat-angular-integration
description: Add, repair, or validate TrChat Web Component integration in Angular 20+ applications. Excludes native Vue TrChat work and authoring runtime business Skills.
---

# TrChat Angular integration

Inspect the application's Angular version, package manager, compilation boundaries, rendering mode, build configuration and existing integration before changing it. The Web Component candidate is based on `1.0.1`. During repository validation, declare Chat and any directly imported Kit package as local `file:...1.0.1.tgz` dependencies, then confirm their installed manifest version is exactly `1.0.1`. The published registry package `@opentiny/tiny-robot-chat@1.0.1` does not include the Web Component. Do not use a bare registry version, workspace link, override-only indirection, or monorepo source import. Inspect the installed Chat manifest before editing: it must export both `./experimental` and `./experimental/web-component.css`, otherwise stop and report that the installed package cannot support this integration.

Follow [Angular host modes](references/angular-host-modes.md) for schema placement, browser-only registration, SSR/hydration and typed element access. Load `@opentiny/tiny-robot-chat/experimental/web-component.css` globally and give the host and its ancestors a usable size. Use the public `@opentiny/tiny-robot-chat/experimental` entrypoint.

Assign complex configuration as JavaScript properties, not serialized attributes. Keep `runtimeOptions` and renderer arrays stable unless an intentional change is required; consult the installed element types for properties, DOM event `detail`, and methods. Use `whenTrChatReady` before calling methods that depend on readiness. For built-in or custom renderers, follow the [renderer reference](references/renderers.md). For providers, history, attachments, MCP, Skills, and actions, follow [advanced capabilities](references/advanced-capabilities.md). Use [troubleshooting](references/troubleshooting.md) for security boundaries and integration failures.

Keep provider credentials on an application-owned server or proxy; never place secrets in browser configuration, source, or generated assets. Exercise the requested interaction in the app, run its relevant checks and build, and run the read-only [consumer verifier](scripts/verify-consumer.mjs):

```sh
node path/to/skills/trchat-angular-integration/scripts/verify-consumer.mjs <projectRoot> [--build-dir DIR] [--test-secret VALUE]
```

Review every reported check; the verifier supplements rather than replaces browser, SSR, hydration, and application tests.
