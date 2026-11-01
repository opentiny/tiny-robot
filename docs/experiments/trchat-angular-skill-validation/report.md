# TrChat Angular integration skill: final validation

## Scope and conclusion

The Angular integration skill and its consumer verifier were validated against published `@opentiny/tiny-robot-chat@1.0.0-alpha.0` in Angular 20 fixtures. The skill-enabled standalone, NgModule, and SSR/hydration fixtures met all applicable criteria in the frozen [rubric](rubric.md). This establishes the observed local alpha integration paths, not compatibility with every application or provider.

The [skill](../../../skills/trchat-angular-integration/SKILL.md) covers standalone, NgModule, mixed compilation boundaries, client-side rendering, and SSR/hydration guidance. Its read-only [consumer verifier](../../../skills/trchat-angular-integration/scripts/verify-consumer.mjs) checks package provenance and public exports, installed OpenTiny dependency resolution and Vue compatibility, local environment-file handling, and optionally browser build output for a supplied test secret. It supplements application and browser testing.

## Deterministic results

Final checks passed: skill quick validation; verifier tests (29/29); release-script tests (53/53); and `git diff --check 227b14051..HEAD`. The final consumer verifier passed against each skill-enabled fixture after its final production build. Node 22.23.1 was used for fixture checks. Browser-backed tests and builds ran outside the sandbox after process or bind restrictions caused sandbox failures.

| Fixture | Final production build | Initial browser bundle, raw (estimated transfer) | Other checks |
| --- | --- | --- | --- |
| Standalone | Passed | 2.18 MB (504.47 kB) | Typecheck passed; ChromeHeadless 1/1 |
| NgModule | Passed | 2.06 MB (496.92 kB) | ChromeHeadless 1/1 |
| SSR/hydration | Browser and server passed | 2.18 MB (526.65 kB) | Typecheck passed; ChromeHeadless 1/1 |

The final verifier changes did not alter fixture runtime behavior. Temporary runtime assertions and fixture projects were not retained as tracked product artifacts.

## Browser and visual acceptance

The standalone fixture exercised property delivery and DOM event feedback, built-in and ordered custom rendering plus unmatched fallback, model selection, restored history, a sample SVG attachment, a local MCP echo call, and an application Skill whose distinctive instruction was traced into and out of provider requests. Repeat registration preserved the same custom-element constructor. Desktop and 390 px layouts had usable dimensions without page-level horizontal overflow. A long raw tool-result line clips within the narrow mobile chat card, without blocking the verified result. See [flows](screenshots/skill-standalone-flows.jpg), [desktop](screenshots/skill-standalone-desktop.jpg), and [390 px](screenshots/skill-standalone-mobile-390.jpg).

The NgModule page delivered its configuration as a property, sent a message, displayed the local response, and updated Angular feedback. See [desktop](screenshots/skill-ngmodule-desktop.jpg) and [390 px](screenshots/skill-ngmodule-mobile-390.jpg).

The SSR route returned a loading shell; after hydration the browser created one registered element and exercised its property and event flow. The element was created client-side inside an `ngSkipHydration` boundary: this does not demonstrate server-rendered TrChat markup. See [desktop](screenshots/skill-ssr-desktop.jpg) and [390 px](screenshots/skill-ssr-mobile-390.jpg). Controller checks observed no browser warnings or errors in these runs, and the SSR follow-up produced no server error output.

## Strict rubric and baseline comparison

| Fixture | Passed / applicable |
| --- | --- |
| Skill-enabled standalone | 15 / 15 |
| Skill-enabled NgModule | 8 / 8 |
| Skill-enabled SSR/hydration | 8 / 8 |
| Baseline standalone, interim | 1 / 15 |

The [skill summary](skill-summary.md) records criterion-level evidence. The [baseline summary](baseline-summary.md) is interim: pending independent browser, network, proxy, and stub evidence counted as non-passes. Its test and build passed; the consumer verifier failed because `.env.local` was not ignored. Both standalone agents received the same frozen prompt and model/effort, with the skill path supplied only to the skill-enabled agent. The incomplete baseline and observed difference do not establish a completed head-to-head product comparison or which instruction caused the difference.

## Independent review and fixes

Independent review found that the verifier did not check all installed OpenTiny transitive packages or Vue peer compatibility. A test-driven fix added graph checks, followed by review findings for an external `semver` dependency that broke copied standalone use, nested pnpm Robot resolution contexts, and a directly installed Kit's Vue context. The second fix removed that dependency, traversed real resolver contexts, checked direct Kit separately, and validated expected peer declarations and stable Vue versions. Regression coverage includes copied execution, nested Kit/SVG contexts, direct Kit Vue, malformed, prerelease and boundary versions, and peer declaration drift. Task re-review found no remaining actionable issue. No generated consumer fixture or real credential was found among tracked changes.

## Security boundary

The browser sent requests to an application-owned same-origin proxy, which forwarded them to a deterministic local provider stub. A unique harmless secret was supplied only to the proxy process; tracked files, browser configuration and element properties, the pre-proxy request, browser assets, and source maps were inspected, and the verifier's secret scan passed. Production applications still own authentication, authorization, secret storage, and provider forwarding. No real credential or remote DeepSeek request was used.

## Support and remaining risks

| Area | Evidence and limits |
| --- | --- |
| Angular 20 | Fully tested for the three fixture modes above. |
| Angular 21+ | Best-effort guidance; unverified. |
| Mixed standalone/NgModule | Schema-boundary guidance provided; no separate mixed fixture was tested. |
| CSR and SSR | CSR and client-created SSR/hydration paths tested; no server-rendered TrChat markup. |
| Provider and MCP | Deterministic local flows tested; remote DeepSeek and other remote providers untested. |
| Attachments | Sample SVG delivery observed; native local-file picker and attachment error flow not independently exercised. |

The experimental alpha API and large initial browser bundles warrant application-specific compatibility and performance checks. Temporary fixture installation reported 32 dependency audit findings (4 low, 27 moderate, 1 high); no audit mutation was applied. The broader unchanged component suite previously showed sender deletion E2E failures `TC-BS-01` and `TC-DL-07`; the focused skill and release checks passed, and this task did not change those components.
