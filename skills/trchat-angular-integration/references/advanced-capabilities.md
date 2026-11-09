# Advanced capabilities (rc.9-based Web Component candidate)

Use the installed candidate declarations as the authority. The published registry rc.9 package does not contain these Web Component declarations. `tr-chat` accepts a `runtime` or creates and owns one from `runtimeOptions`; do not continually replace either object. Alternatively `createChatRuntime(options)` returns `{ runtime, dispose }`: the application owns and disposes that runtime. Wait for `whenTrChatReady` before runtime-dependent methods. `tr-chat-ui` is presentation-only: its `data` and interaction events require application orchestration. Event payloads below are DOM `CustomEvent.detail`.

## Provider and model selection

- **API:** `runtimeOptions.modelProviders` supplies provider `type` (`openai`, `deepseek`, or `qwen`), `apiUrl`, and `models` with `id` and `label`. A model can expose a `features` array of switch/select fields; provider presets map normalized `featureValues`, and a model can override that mapping with `mapFeatureValues`. A nonempty provider list conflicts with `responseProvider`; supply one mechanism. Use a same-origin proxy URL and no browser credential. A custom `responseProvider` is appropriate when the application controls request construction.
- **Ownership:** The runtime selects the first enabled model and handles model and feature-value selection; the application owns the provider list, proxy and credential. With `tr-chat-ui`, the app owns selection and handles `model-select` and `model-feature-value-change`.
- **Result and acceptance:** Configure two fake models and a local fake response endpoint; select the second, send, and inspect the endpoint's received model and visible response. Do not assume a remote provider supports any optional feature without checking its own contract.

## History and attachments

- **API:** `runtimeOptions` supports `initialMessages`, `storage`, `storageKey`, `autoSaveMessages`, `autoSaveThrottle` and `onLoad`. The runtime exposes conversation actions; `historyData` configures history UI. `history-action` carries `action`, `conversation`, `defaultPrevented` and `preventDefault()`; the DOM event is cancelable. Cancel synchronously to replace its default action. `attachments` is a property; `attachments-select` carries `File[]`, `attachments-update` carries `Attachment[]`, and `attachment-error` carries an `Error`.
- **Ownership:** The application chooses storage and persistence policy, and owns external history operations, attachment upload, validation and any server-side processing. The element emits attachment changes; assign updated application state back when controlling attachments. The runtime's storage is not a remote history service.
- **Result and acceptance:** Send a message, create/switch a conversation, reload with the selected storage and verify the intended history is restored. Select a small local file, observe the events and displayed attachment, then exercise removal and error handling. Do not assume selection uploads a file.

## MCP tools

- **API:** Configure either `runtimeOptions.mcpServers` (`id`, `name`, `baseUrl`, optional `installed`, etc.) or `mcp` (`runtime`, `listTools`, `callTool`), never both. Built-in servers start disabled; `installed: true` loads tool definitions but does not enable the server. The app supplies server configuration or the custom adapter. `mcp-create-server` is a request for application handling. `tr-chat-ui` additionally emits server/tool enable and add/remove events; the runtime-backed element handles its runtime controls.
- **Ownership:** The app owns endpoint, tool implementation, permissions and result interpretation; the runtime handles enabled tool selection for each turn. MCP is not automatically a trusted remote service. Route browser traffic through a same-origin boundary.
- **Deterministic acceptance:** Run a local fake Streamable HTTP MCP endpoint behind the same-origin development proxy. Its `tools/list` returns one tool `echo_label` with an object schema requiring string `label`; `tools/call` with `{ "label": "alpha" }` returns text `echo:alpha`. Use a deterministic fake response provider that requests the enabled `echo_label` tool, then returns the tool result. Enable the server and tool, send once, and assert the fake endpoint received the arguments and the response visibly contains `echo:alpha`. No external model or service is required. Test a failed call separately and inspect `runtime-action-error` or `tr-chat-error` as applicable.

## Application Skills

- **API:** Kit's public `SkillDefinition`, `skillPlugin`, `getSkillRequestContext`, and memory or IndexedDB Skill storage support application-selected Skills. Pass the plugin via `runtimeOptions.plugins`; use its `onBeforeRequest` to place resolved instructions into the request body according to the chosen provider contract. Loading or storing a Skill alone does not inject instructions. `extension-action` is a UI event, not an installation or execution service.
- **Ownership:** The app owns Skill catalog, trust, selection, enablement, storage and provider-specific instruction placement. It must not treat imported instructions as trusted authority or expose secrets to them.
- **Deterministic acceptance:** Define a local Skill with instructions `Answer with the marker SKILL_RC9`, select it in an app-owned plugin configuration and capture the outgoing request with a fake provider. Assert the injected instructions contain that marker; deselect it and assert the next captured request omits it. Return a fixed response and check it appears. This tests request injection, not a remote model's obedience.

## Message actions

- **API:** `bubble-event` carries `name`, optional `payload`, `messageIndex`, and `contentIndex`; `bubble-state-change` carries UI state changes. Renderer and action configuration are properties; see [renderers](renderers.md).
- **Ownership:** The application interprets custom action names and implements side effects, persistence and authorization. A bubble event alone does not perform an application action.
- **Result and acceptance:** Provide a custom renderer/action that emits a known event, click it, and verify its detail identifies the expected message/content and the app displays the resulting state. Test built-in actions according to the configured renderer, not assumed server behavior.
