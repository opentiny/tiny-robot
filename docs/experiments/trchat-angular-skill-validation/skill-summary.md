# Skill-enabled Angular host-mode evaluation

The standalone, NgModule, and SSR agents received their respective frozen prompts and the `skills/trchat-angular-integration` path. The controller independently ran fixture checks and browser acceptance with Node 22.23.1. Angular builds and browser-backed tests ran outside the sandbox after sandbox process or bind restrictions caused aborts. A pass requires all evidence stated in the rubric; missing evidence is scored as a fail.

## Standalone

The consumer verifier passed package provenance, public imports, the ignored and untracked `.env.local`, and the harmless secret scan. Typecheck passed; ChromeHeadless passed 1/1 test; the production build passed with a 2.18 MB initial bundle. Independent inspection found `pnpm-lock.yaml` was the sole root lockfile and imports used published exports.

| Criterion | Result | Controller evidence |
| --- | --- | --- |
| Registry version and provenance | Pass | Consumer verifier passed exact package versions and fixture provenance; the sole root lockfile matched pnpm. |
| Public imports | Pass | Consumer verifier and independent import scan found published exports and no private or workspace source paths. |
| Registration | Pass | One registered element rendered. A temporary ChromeHeadless test called the public defineTrChatElements() twice and confirmed the registered constructor stayed the same; 2/2 tests passed and the temporary test was removed. |
| Schema placement | Pass | Production build compiled the chat-containing template. |
| CSS and layout | Pass | The styled chat was approximately 1067 × 848 px on desktop and 345 px wide at 390 px, with no horizontal body overflow. |
| Property delivery | Pass | The complex `runtimeOptions` object reached the element as a property and drove visible flows; it was not serialized as an attribute. |
| DOM event feedback | Pass | DOM events updated the Angular feedback panel. |
| Renderer precedence and fallback | Pass | Initial history displayed the built-in Markdown fallback and the first of two overlapping custom matches; a separate unmatched message used the default fallback. |
| Model selection | Pass | Switching Demo One to Demo Two produced `Local response from demo-two`; the provider stub logged `model: demo-two`. |
| History | Pass | Reloading and selecting the persisted `alpha integration ch` conversation restored messages and the tool result. |
| Attachment | Pass | The sample SVG appeared in the composer and was delivered with the sent message. Native local-file selection and attachment error handling were not independently exercised. |
| Fake MCP | Pass | The chat displayed `local__echo_label` and `echo:alpha`; the MCP server logged `tools/call` for `echo_label` with label `alpha`. |
| Application Skill | Pass | Toggling the Skill changed the provider stub trace from `skill: true` to `skill: false`. The stub computes that flag by checking whether serialized request messages include `SKILL_ALPHA`, tracing the distinctive instruction to the outgoing request. |
| Proxy secrecy | Pass | The browser used same-origin `/api/chat`; the proxy logged forwarding and the local provider stub logged the selected model, Skill flag and tool count before returning the visible response. The fake secret was supplied only to the proxy process and was absent from tracked files, browser configuration, element properties, pre-proxy request, build output and source maps; the verifier scan passed. |
| Standalone behavior | Pass | Build, typecheck and test passed; desktop and 390 px browser runs exercised the flows with no console warnings or errors. |

**Total: 15 / 15 applicable criteria passed.** Screenshots: [flows](screenshots/skill-standalone-flows.jpg), [desktop](screenshots/skill-standalone-desktop.jpg), and [390 px](screenshots/skill-standalone-mobile-390.jpg). A long raw tool-result line clips inside the narrow chat card, without page-level horizontal overflow or blocking the verified result.

## NgModule

The consumer verifier passed; ChromeHeadless passed 1/1 test; the production build passed with a 2.06 MB initial bundle. The actual NgModule page sent `NgModule integration`, displayed the deterministic response, and updated its feedback.

| Criterion | Result | Controller evidence |
| --- | --- | --- |
| Registry version and provenance | Pass | Consumer verifier passed package and fixture checks. |
| Public imports | Pass | Consumer verifier passed public import and export checks. |
| Registration | Pass | The element rendered and worked. The shared published registration helper was independently called twice in the standalone browser test, preserving the same registered constructor. |
| Schema placement | Pass | Production build compiled the actual NgModule chat page. |
| CSS and layout | Pass | The styled chat measured approximately 1050 × 1000 px on desktop and 349 px wide at 390 px, without page overflow. |
| Property delivery | Pass | The actual chat page accepted complex property configuration. |
| DOM event feedback | Pass | Sending a message updated the Angular feedback to `Chat updated · 1 conversation`. |
| NgModule behavior | Pass | Verifier, test and production build passed; the actual page rendered, sent a message, displayed the local response, and updated feedback without console warnings or errors. |

**Total: 8 / 8 applicable criteria passed.** Screenshots: [desktop](screenshots/skill-ngmodule-desktop.jpg) and [390 px](screenshots/skill-ngmodule-mobile-390.jpg).

## SSR and hydration

The browser-build consumer verifier and typecheck passed; ChromeHeadless passed 1/1 test; the browser/server production build passed with a 2.18 MB initial browser bundle. `curl http://localhost:4111/chat` returned the heading and `Loading chat…`, with no server-rendered `<tr-chat>`; an `ngSkipHydration` wrapper allowed the browser to create it after hydration.

| Criterion | Result | Controller evidence |
| --- | --- | --- |
| Registry version and provenance | Pass | Consumer verifier passed package and fixture checks against the browser build. |
| Public imports | Pass | Consumer verifier passed public import and export checks. |
| Registration | Pass | The browser created and used the registered element. The shared published registration helper was independently called twice in the standalone browser test, preserving the same registered constructor. |
| Schema placement | Pass | Browser/server production build compiled the actual chat route. |
| CSS and layout | Pass | The styled chat measured approximately 982 × 698 px on desktop and 333 px wide at 390 px, without page overflow. |
| Property delivery | Pass | The hydrated route accepted the complex property configuration. |
| DOM event feedback | Pass | Sending `SSR hydration check` displayed the local response and updated feedback to `Conversation updated · 2 messages`. |
| SSR and hydration | Pass | The route returned successfully; the browser hydrated with exactly one working element backed by the single registered constructor, with no controller-observed console warnings or errors. |

**Total: 8 / 8 applicable criteria passed.** Screenshots: [desktop](screenshots/skill-ssr-desktop.jpg) and [390 px](screenshots/skill-ssr-mobile-390.jpg).

## Scope and comparison

All provider and MCP behavior was deterministic and local; no remote DeepSeek request or real credential was used. The baseline standalone fixture passed its test and build but failed the consumer verifier because `.env.local` was not ignored; the controller did not repair it. The two standalone agents received the same frozen prompt and model/effort, with the skill path supplied only to the skill-enabled agent. This does not isolate which instruction caused the difference. Fixture dependency installation reported audit findings, and the generated fixtures' initial browser bundles were approximately 2.06–2.18 MB raw.
