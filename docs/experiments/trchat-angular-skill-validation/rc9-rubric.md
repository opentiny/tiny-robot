# Angular RC.9-based Web Component validation rubric

## Provenance boundary

The upstream baseline is the source tagged `v1.0.0-rc.9`. The registry artifact `@opentiny/tiny-robot-chat@1.0.0-rc.9` does **not** publish the Web Component entrypoints. Every Angular fixture must therefore install locally packed `1.0.0-rc.9` candidate tarballs from this branch and prove that the installed Chat manifest exports both `./experimental` and `./experimental/web-component.css`. A result from the registry Chat package does not satisfy this rubric.

## Fixtures

- Angular 20 standalone CSR application.
- Angular 20 NgModule CSR application with `standalone: false` at the declaring boundary.
- Angular 20 SSR/hydration application that registers and creates TrChat only in the browser.

All fixtures must use only public package entrypoints and must be isolated from workspace links and private source imports.

## Acceptance criteria

| Area | Required evidence |
| --- | --- |
| Candidate provenance | Exact `1.0.0-rc.9` manifests, candidate experimental exports, canonical package paths inside fixture `node_modules`, matching lockfile, and consumer verifier pass. |
| Angular integration | Correct `CUSTOM_ELEMENTS_SCHEMA` scope, global candidate CSS, repeat-safe browser registration, complex objects assigned as properties, and production build pass. |
| Core DOM contract | `ready`/methods work and Angular visibly receives a DOM event with its `CustomEvent.detail`. |
| Responsive UI | Desktop and 390 px browser inspection shows nonzero usable chat dimensions and no page-level horizontal overflow. |
| Built-in/custom rendering | Built-in renderer, deterministic first custom match, and unmatched fallback are observed inside TrChat. |
| Model behavior | Multiple models are selectable; RC.9 `features` switch/select state and `model-feature-value-change` detail are observed. |
| History | Known restored messages appear in TrChat. |
| Image attachment | An image attachment reaches visible TrChat state or the traced request. |
| MCP | A TrChat action invokes a deterministic local fake MCP tool and its known result is traced back to the action. |
| Skill | An enabled application Skill injects the distinctive `SKILL_RC9` instruction into the traced outgoing request; disabling it removes the instruction. |
| Provider/proxy boundary | Browser request reaches an application-owned same-origin proxy and deterministic local provider; a harmless test secret remains server-only and is absent from source, element properties, browser assets, and source maps. |
| NgModule mode | A real non-standalone declaring component renders TrChat and completes its property/event flow without blocking console errors. |
| SSR/hydration | Route returns successful server HTML, browser hydration completes with one definition and one usable element, and no server/hydration/blocking console error occurs. TrChat itself may remain client-created inside `ngSkipHydration`. |
| Repository regression | Chat unit/type/build checks, Web Component browser checks, release/skill checks, package installation, and the repository browser/component suites pass after RC.9 integration. |

Screenshots support visual claims but do not replace runtime traces. Remote DeepSeek behavior and real credentials are out of scope; deterministic local endpoints are required so the suite remains unattended and reproducible.
