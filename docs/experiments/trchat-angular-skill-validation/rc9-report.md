# TrChat Angular RC.9-based Web Component validation

## Conclusion and version boundary

The Angular integration paths passed against a **locally packed Web Component candidate based on upstream `v1.0.0-rc.9`**. The published registry artifact `@opentiny/tiny-robot-chat@1.0.0-rc.9` does not contain `./experimental` or `./experimental/web-component.css`; this report does not claim that registry rc.9 supports the Web Component. The tested candidate combines the rc.9 TrChat source baseline with this branch's Web Component implementation.

The standalone, NgModule, and SSR/hydration fixtures met every applicable criterion in the frozen [RC.9 rubric](rc9-rubric.md). No real DeepSeek key or remote provider was used. Provider, MCP, Skill, history, renderer, attachment, and model-feature flows used deterministic local services so the validation remained unattended and reproducible.

## Candidate provenance

All fixtures were fresh Angular 20 consumers under `/private/tmp/trchat-rc9-eval`. They installed locally packed `1.0.0-rc.9` tarballs, not workspace links or registry Chat rc.9. Installed manifests and canonical paths were checked inside each fixture's `node_modules`; the Chat candidate exported both required experimental entrypoints.

Final candidate SHA-256 values:

| Package | SHA-256 |
| --- | --- |
| `@opentiny/tiny-robot-chat` | `be6df5da62d9598f73273217fe77a6d8c2ecc13ef07a4f983abb52b4f3987a79` |
| `@opentiny/tiny-robot` | `b7e7e833ba932e92479c82f3756180efd50c33d112e9f3e7462fdaf41df67318` |
| `@opentiny/tiny-robot-kit` | `97d2aca5025fbecf794f3d59bf1f0d404be4d283a2b13e32638c940eaccdc5cd` |
| `@opentiny/tiny-robot-svgs` | `41699a37c1c4fcc7ced7057b8ab43fef146808ed56ff8b486e67ff53d2170202` |

The consumer verifier now requires a local `.tgz` direct dependency declaration, an existing regular tarball file, and a matching npm/pnpm lockfile resolution. It rejects a bare registry `1.0.0-rc.9`, a missing tarball, or a mismatched lockfile even if stale candidate files remain in `node_modules`. It also requires the installed package version, package graph, canonical `node_modules` location, Vue peer compatibility, public browser/CSS exports, and absence of workspace protocols.

## Angular fixture results

| Fixture | Result | Browser/business evidence | Production evidence |
| --- | --- | --- | --- |
| Standalone CSR | Passed | 27/27 Playwright; renderer precedence/fallback, RC.9 switch/select feature values, model selection, history, image attachment, MCP, Skill, DOM methods/events, right aside, floating layout, desktop and 390 px; no console errors | Build passed; verifier 9/9; 2.25 MB initial bundle with a non-failing 53.89 kB warning-budget overage |
| NgModule CSR | Passed | Real `standalone: false` declaration and module schema; property identity; a real `model-feature-value-change` from the Reasoning control; desktop and 390 px; no console warnings/errors | Build passed; verifier 9/9; 2.08 MB raw / 503.60 kB estimated transfer |
| SSR/hydration | Passed | HTTP 200 server response with SSR context and `ngSkipHydration`; no server-rendered `<tr-chat>`; browser registration/readiness/property/method; a real Reasoning switch changed runtime state from false to true and forwarded one feature event; desktop and 390 px; no console/page/network errors | SSR build and typecheck passed; verifier 9/9; server response 71,302 bytes |

Visual evidence: standalone [desktop](screenshots/rc9/standalone-desktop.png) and [390 px](screenshots/rc9/standalone-mobile-390.png); NgModule [desktop](screenshots/rc9/ngmodule-desktop.png) and [390 px](screenshots/rc9/ngmodule-mobile-390.png); SSR [desktop](screenshots/rc9/ssr-desktop.png) and [390 px](screenshots/rc9/ssr-mobile-390.png).

## Capability evidence

| Capability | Result and observed contract |
| --- | --- |
| Registration and properties | Repeat-safe browser registration and complex JavaScript property delivery passed in all three host modes. |
| Built-in and custom renderers | Built-in rendering, equal-priority custom match ordering, first-match precedence, and unmatched Markdown fallback passed inside TrChat. |
| Model selection and features | Multiple local models were selectable. RC.9 `features` switch/select fields and `model-feature-value-change` details were observed. |
| Feature-value ownership | `<tr-chat>` forwards the DOM event and updates its Runtime internally. A follow-up SSR browser check used the real Reasoning switch and observed `false → true` in the control, event detail, and `runtime.composer.model.featureValues`, with exactly one forwarded event and no host writeback. Presentation-only `<tr-chat-ui>` instead leaves orchestration and writeback to the host. |
| History | Known conversations were created/restored and their messages were observed. |
| Image attachment | An image attachment reached TrChat's visible/traced request flow. |
| MCP | A TrChat action invoked a deterministic fake MCP tool and returned the known result through the traced flow. |
| Skill | Enabling the application Skill injected `SKILL_RC9` into the outgoing local request; disabling/restoring state was tested. |
| Provider boundary | Model requests used an application-owned same-origin proxy and deterministic local provider. The harmless test secrets were absent from sources, browser assets, and source maps. |
| SSR boundary | The server emitted the Angular shell/placeholder only. TrChat was registered and created in the browser inside `ngSkipHydration`, then completed its property/event/method flow. |

## Regression found and fixed

The first full repository run exposed a real rc.9 merge regression in `TrLayout`: the right-drawer overflow callback synchronously read `rightDrawerFallback` before its initialization. All 51 Layout cases failed because the shared page could not mount, and the isolated standalone consumer reproduced the same TDZ error when `rightAside` was enabled.

The fallback now has a stable reactive reference before `useLayoutAsideStates` is created, and its computed value is synchronized only after both aside states exist. Components and the Chat experimental bundle were rebuilt and repacked. The focused Layout suite then passed 51/51, the corrected standalone candidate passed its right-aside cases, and the full repository suites passed.

## Repository and skill verification

| Check | Result |
| --- | --- |
| Chat typecheck, unit tests, stable and experimental builds | Passed; Chat unit tests 102/102 |
| Experimental exports/dist/SSR scripts | Passed; 7/7 |
| Focused Web Component/renderer/layout Playwright | Passed; 56/56 before the rc.9 merge fix, plus Layout 51/51 after the fix |
| Full repository E2E | Passed; 159/159 |
| Full component suite | Passed; 494/494 |
| Skill verifier regression tests | Passed; 42/42 after local-tarball, missing-file, npm/pnpm lockfile-mismatch, and bare-registry rejection coverage was added |
| Release-script suite | Passed; 67/67 after the final verifier tests are included |
| Candidate npm/pnpm installation | Passed |
| Skill structure quick validation | Passed |

## Remaining limits

- The registry `@opentiny/tiny-robot-chat@1.0.0-rc.9` remains unusable for this Web Component integration. A future published prerelease must include the tested experimental exports before consumers can replace local candidate tarballs.
- The NgModule fixture needs `skipLibCheck: true` because candidate/Vue-generated third-party declarations produce TypeScript 5.9 errors. Angular strict templates and the actual NgModule schema boundary compile successfully; declaration compatibility remains a release concern. Its original diagnostic listener also performed a redundant host writeback; that writeback is excluded from capability evidence, and the separate real-control SSR check proves `<tr-chat>` updates its Runtime internally.
- The standalone initial browser bundle is 2.25 MB and exceeds its warning budget by 53.89 kB, though it remains below the configured error budget.
- SSR validation covers client-created TrChat inside an Angular hydration boundary, not server-rendered TrChat markup. It did not send a real chat message because provider/MCP/Skill business flows were already exercised in the standalone fixture.
- No real DeepSeek credential, remote DeepSeek response, native operating-system file picker, or remote MCP server was exercised.

No package was published, no branch was pushed, and no real credential was stored during this validation.
