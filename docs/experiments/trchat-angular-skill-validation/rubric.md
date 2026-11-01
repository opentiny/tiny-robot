# Angular integration evaluation rubric

Freeze this rubric and the prompts below before dispatching any implementation agent. Run the two standalone prompts verbatim, with only the project path changed; give the skill-enabled agent the skill path separately. Do not give either agent implementation hints or access to the other fixture. The controller runs all checks independently and records commands, exit codes, browser observations, and evidence paths. A criterion passes only when its stated evidence is observed; failure, omission, or missing evidence is a fail. Record not applicable only for criteria explicitly scoped to another fixture. Report each criterion separately and totals as passes / applicable criteria; do not infer correctness from code or screenshots alone where runtime behavior is required.

## Frozen standalone prompt

> In this Angular 20 project, integrate the published `@opentiny/tiny-robot-chat@1.0.0-alpha.0` web component into a usable chat page. Use published public APIs and show a sized, responsive chat interface. Demonstrate complex configuration passed to the element, and display feedback from a chat DOM event. Provide a deterministic local demonstration of built-in rendering, ordered custom renderer selection and unmatched fallback; model selection; restoring history; an image attachment; a fake MCP tool call with a visible result; and an application Skill whose instruction is visibly included in a request. Use `@opentiny/tiny-robot-kit@1.0.0-alpha.0` if direct Kit APIs are needed. Use a same-origin application-owned proxy for provider requests, with a harmless test secret only on the server side. Make the demonstrations testable without a remote model or real credentials. Run the relevant checks and production build, and explain how to exercise each flow.

## Frozen NgModule prompt

> In this Angular 20 NgModule project, integrate the published `@opentiny/tiny-robot-chat@1.0.0-alpha.0` web component into a usable, responsive chat page using published public APIs. Pass complex configuration to the element and display feedback from a chat DOM event. Make the page demonstrable without a remote model or real credentials. Run the relevant checks and production build, and explain how to exercise it.

## Frozen SSR prompt

> In this Angular 20 SSR and hydration project, integrate the published `@opentiny/tiny-robot-chat@1.0.0-alpha.0` web component on an actual route using published public APIs. Render a usable, responsive chat page, pass complex configuration to the element, and display feedback from a chat DOM event. Make it demonstrable without a remote model or real credentials. Run the relevant checks and production build, and explain how to start the server and exercise the route.

## Scoring

All four fixtures are scored on the first seven criteria. The two standalone fixtures are also scored on the next seven and standalone behavior. NgModule and SSR behavior apply only to their respective fixtures. Controller and reviewer must record concrete evidence for every applicable row.

| Criterion | Pass evidence |
| --- | --- |
| Registry version and provenance | Consumer verifier passes; installed chat manifest is exactly `1.0.0-alpha.0`, direct Kit dependency if used is exactly that version, and canonical package paths are within this fixture's `node_modules`, not the TinyRobot workspace. Lockfile and package manager match the fixture. |
| Public imports | Consumer verifier passes and source imports only published public package exports, with no workspace links or private source paths. |
| Registration | Browser exposes the registered `tr-chat` element and it renders; registration is safe to repeat. |
| Schema placement | Production template compilation succeeds for the actual chat-containing Angular compilation boundary with the appropriate custom-elements schema. |
| CSS and layout | Published component styles load; chat has usable nonzero dimensions at desktop and 390 px without horizontal page overflow. |
| Property delivery | Browser inspection confirms a complex configuration object arrives as an element property with its intended values, rather than as a serialized attribute. |
| DOM event feedback | Exercise a chat DOM event and observe corresponding visible Angular page feedback. |
| Renderer precedence and fallback | Browser shows a built-in renderer, the first matching custom renderer's sentinel when rules overlap, and default output for an unmatched message. |
| Model selection | Select a model and observe the selected model in the deterministic request or equivalent visible output. |
| History | Restore a known history and observe its messages in the chat. |
| Attachment | Select an image and observe it delivered to the chat/request or visible attachment state. |
| Fake MCP | Invoke a deterministic fake MCP tool and observe its known result in the UI or captured request flow. |
| Application Skill | Trigger an application Skill and observe its distinctive instruction in the outgoing deterministic request. |
| Proxy secrecy | With a known fake secret configured server-side, inspect tracked files, browser configuration, element properties, pre-proxy requests, production assets and source maps; the secret is confined to server-side environment/proxy handling. Consumer verifier secret scan passes. |
| Standalone behavior | Production build and relevant checks pass; desktop and 390 px browser runs exercise the flows above without blocking console errors. |
| NgModule behavior | Production build and relevant checks pass; the actual chat page renders and its property/event flow works in a browser without blocking console errors. |
| SSR and hydration | Production build and relevant checks pass; an HTTP response for the actual chat route succeeds, then browser hydration completes with one element definition and working property/event flow, without server, hydration, or console errors. |

Use a harmless unique secret for secrecy testing, supply it to the server environment only, and scan all produced browser assets including source maps. Capture screenshots for stable visible states and preserve command output and browser observations outside the repository until summarized. A screenshot alone does not establish request payload, secrecy, registration count, or hydration correctness. Report remote provider behavior as untested unless independently exercised.
