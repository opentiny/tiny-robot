# Skill-enabled standalone evaluation

The skill-enabled agent received the frozen standalone prompt and the `skills/trchat-angular-integration` path. Its fixture was clean at commit `0d3e7bd`. The controller used Node 22.23.1 and ran the verifier, test, and build for both subjects; the skill fixture also received a standalone typecheck. These results are interim: Task 7 has not independently verified browser, network, proxy, or stub behavior. Pending rows count as non-passes in the total.

## Controller-verified evidence

- `node skills/trchat-angular-integration/scripts/verify-consumer.mjs <fixture> --build-dir <fixture-dist> --test-secret harmless-alpha-test-secret`: exit 0. All checks passed, including package versions, public exports/imports, ignored and untracked `.env.local`, and secret absence from build output.
- Independent inspection found `pnpm-lock.yaml` was the sole root lockfile, matching pnpm. An import scan of `src`, `server`, and `package.json` found only `@opentiny/tiny-robot-chat/experimental` and `@opentiny/tiny-robot-kit`, with no private or workspace source paths.
- `pnpm exec tsc -p tsconfig.app.json --noEmit`: exit 0 (additional skill-fixture check).
- `pnpm test --watch=false --browsers=ChromeHeadless`: exit 0, 1/1 test passed.
- `NG_BUILD_MAX_WORKERS=2 pnpm build`: exit 0; production build passed, initial bundle 2.18 MB.
- The test and build required approved unsandboxed execution after sandbox process or bind failures. These checks do not establish browser flow traces.

## Rubric results

| Criterion | Result | Evidence or missing evidence |
| --- | --- | --- |
| Registry version and provenance | Pass | Consumer verifier passed its package, version, provenance, and fixture checks; independent inspection confirmed the sole root lockfile was `pnpm-lock.yaml`, matching pnpm. |
| Public imports | Pass | Consumer verifier passed its public export and import checks; the independent import scan found only the two published package exports and no private or workspace source paths. |
| Registration | Pending | No independent browser observation of rendering and repeat-safe registration. |
| Schema placement | Pass | Controller production build compiled the chat-containing template. |
| CSS and layout | Pending | No independent desktop and 390 px layout observations. |
| Property delivery | Pending | No independent browser inspection of the element property. |
| DOM event feedback | Pending | No independent browser exercise and visible feedback observation. |
| Renderer precedence and fallback | Pending | No independent trace from element inputs through renderer APIs to all three outputs. |
| Model selection | Pending | No independent observation linking selection to a request or equivalent output. |
| History | Pending | No independent browser observation of restored messages. |
| Attachment | Pending | No independent observation of delivery or visible attachment state. |
| Fake MCP | Pending | No independent trace from a TrChat action through the configured MCP API to its result. |
| Application Skill | Pending | No independent trace from the TrChat action and Skill configuration to the outgoing instruction. |
| Proxy secrecy | Pending | Verifier secret scan passed, but no independent end-to-end browser/proxy/stub trace or complete required secrecy inspection was recorded. |
| Standalone behavior | Pending | Build and smoke test passed; independent desktop and 390 px flow runs and console checks are missing. |

**Interim total: 3 / 15 applicable criteria passed.** NgModule and SSR criteria apply to their respective fixtures, not this standalone fixture.

## Agent-reported observations

The agent reported exercising a provider response, ordered renderer and fallback, model and Skill toggles, fake MCP `echo:alpha`, history restore, and sample attachment removal. It reported server logs for the Skill flag and MCP arguments; local file selection and attachment error handling remained unverified. These reports are not controller-verified runtime or network evidence; remote provider behavior was not independently exercised.

## Comparison context

Both agents received the same frozen prompt and used the same model and effort; only this agent received the skill path. This fixture passed the consumer verifier, including the ignored local environment file check that failed for the baseline. The evidence does not isolate which instruction caused that difference, and the pending runtime criteria prevent a complete comparison of behavior.
