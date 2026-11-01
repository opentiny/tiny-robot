# Baseline standalone evaluation

The baseline agent received the frozen standalone prompt without the skill path. Its fixture was clean at commit `5c71bb3cdd55cd2c4415e734dc7c225d9fbf631b`. The controller used the same Node 22.23.1 environment and checks for both subjects. These results are interim: Task 7 has not independently verified browser, network, proxy, or stub behavior. Pending rows count as non-passes in the total.

## Controller-verified evidence

- `node skills/trchat-angular-integration/scripts/verify-consumer.mjs <fixture> --build-dir <fixture-dist> --test-secret harmless-alpha-test-secret`: exit 1. Package, version, export, import, and build-secret checks passed; `.env.local` was not ignored by Git.
- `pnpm test --watch=false --browsers=ChromeHeadless`: exit 0, 1/1 test passed.
- `NG_BUILD_MAX_WORKERS=2 pnpm build`: exit 0; production build passed, initial bundle 2.18 MB.
- The test and build required approved unsandboxed execution after sandbox process or bind failures. These checks do not establish browser flow traces.

## Rubric results

| Criterion | Result | Evidence or missing evidence |
| --- | --- | --- |
| Registry version and provenance | Fail | Package/version checks passed, but the required consumer verifier exited 1. |
| Public imports | Fail | Import/export checks passed, but the required consumer verifier exited 1. |
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
| Proxy secrecy | Pending | Verifier build-secret checks passed, but no independent end-to-end browser/proxy/stub trace or complete required secrecy inspection was recorded; verifier also failed. |
| Standalone behavior | Pending | Build and smoke test passed; independent desktop and 390 px flow runs and console checks are missing. |

**Interim total: 1 / 15 applicable criteria passed.** NgModule and SSR criteria apply to their respective fixtures, not this standalone fixture.

## Agent-reported observations

The agent reported visible built-in, custom, and fallback rendering, model selection, restored history, an attachment card, a fake MCP result, and a Skill phrase. It did not independently inspect the browser request payload for the image or Skill instruction, nor connect browser and server/stub evidence for the same proxy request. The deterministic response itself does not prove Skill injection. These reports are not controller-verified runtime evidence; remote provider behavior was not independently exercised.

## Comparison context

Both agents received the same frozen prompt and used the same model and effort; only the other agent received the skill path. The baseline verifier failure was the unignored local environment file, while the skill fixture passed that check. This observed difference does not by itself establish which instruction caused it, and the pending runtime criteria prevent a complete comparison of behavior.
