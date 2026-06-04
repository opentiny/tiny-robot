# AGENTS.md

## Current Task

Add pause/resume support to `packages/kit` `useMessage` `toolPlugin`.

Goals:

- Pause before `callTool`.
- Persist a displayable tool-call state while paused.
- Support local storage and later manual resume of the pending `callTool`.
- Expose resume through the plugin command mechanism.

## Changed Files

- `packages/kit/src/message/types.ts`
- `packages/kit/src/message/core/engine.ts`
- `packages/kit/src/message/plugins/toolPlugin.ts`
- `packages/kit/src/vue/message/types.ts`
- `packages/components/src/bubble/composables/useToolCall.ts`
- `packages/components/vite.config.ts`
- `docs/.vitepress/config.mts`

There are staged and unstaged changes mixed together. Before continuing, inspect:

```bash
git status --short
git diff --cached
git diff
```

## Fixed So Far

1. Core `RequestState` includes `paused`.

2. Vue `RequestState` also includes `paused`; the earlier dts error where `"paused"` was not assignable is fixed.

3. `MessageEngine.runPluginCommand` type now matches the three-argument implementation:

   ```ts
   runPluginCommand<T = unknown>(pluginName: string, commandName: string, payload?: unknown): Promise<T>
   ```

4. `toolPlugin` adds `shouldPauseToolCall` and checks it after creating the tool message, before `processToolCall`.

5. Tool execution is extracted into `processToolCall`, so normal execution and resume can reuse the same logic.

6. Non-paused tool calls in `onAfterRequest` now `return processToolCall(...)`, so `requestNext()` no longer runs before tool execution finishes.

7. `resumeToolCall` now searches `context.getState().messages` instead of `context.currentTurn`, so it can find persisted paused tool calls after the original turn has ended.

8. Component-side `ToolCallStatus` includes `awaiting-approval`.

9. `isAllToolCallsCompleted` no longer fails dts build on `assistantMessage.state.toolCall` being `unknown`; it uses a local typed assertion:

   ```ts
   const toolCallState = assistantMessage.state?.toolCall as Record<string, Record<string, unknown>> | undefined
   ```

10. `pnpm -F @opentiny/tiny-robot-kit build` passes, including dts generation.

11. Temporary components build issue is fixed in `packages/components/vite.config.ts`: dynamic entry generation now only includes directories that actually contain `src/<name>/index.ts`. `pnpm -F @opentiny/tiny-robot build` passes.

12. `resumeToolCall` can now request the next model turn after all tool calls complete.

   Engine plugin command context now includes `requestNext()`. `toolPlugin.resumeToolCall` calls `requestNext()` once `isAllToolCallsCompleted(...)` returns true.

   When a command requests continuation, `runPluginCommand` delegates the follow-up request to `runTurnLifecycle()`. `runTurn()` and command-triggered continuation now share the same lifecycle path. Resume continuations call `onTurnResume`; other lifecycle steps still go through request execution, `onTurnPause` / `onTurnEnd`, `onError`, and `onFinally`.

13. `onTurnPause` lifecycle hook has been added.

   Naming choice: use `onTurnPause`, not `onTurnPaused`, to stay consistent with existing `onTurnStart` / `onTurnEnd` action-style lifecycle names.

   Engine now routes request completion through shared finish logic:

   - If `requestState === 'paused'`, run `onTurnPause`.
   - Otherwise set `completed` and run `onTurnEnd`.

   This finish logic is used by both normal `runTurn()` and command-triggered continuation.

14. Vue `UseMessageReturn` now exposes `runPluginCommand`.

   `useMessage()` returns `engine.runPluginCommand`, so Vue users can call:

   ```ts
   message.runPluginCommand('tool', 'resumeToolCall', { toolCallId })
   ```

15. Pause reason is stored on the tool-call state instead of `processingState`.

   `processingState` remains scoped to `requestState === 'processing'`. When a tool call is paused, the global state is `requestState: 'paused'`, and the detailed reason is stored on `assistantMessage.state.toolCall[toolCallId].status = 'awaiting-approval'`.

16. `findPendingToolCall` intentionally only searches the latest assistant/tool-call tail group.

   This is now documented in code. Resume is scoped to the latest pending tool-call group rather than searching historical messages globally.

17. `isAllToolCallsCompleted` completion semantics are clarified in code.

   `running` and `awaiting-approval` are the only non-terminal statuses. If a tool message has no status, completion falls back to whether the matching tool message has meaningful content. Failure status is not special-cased; only terminal vs non-terminal matters.

18. `onTurnResume` lifecycle hook has been added.

   Command `requestNext` now accepts `{ resume: true }`. `toolPlugin.resumeToolCall` calls `requestNext({ resume: true })` after all tool calls complete. The follow-up request enters `runTurnLifecycle({ resume: true })`, which calls `onTurnResume` instead of `onTurnStart`; the two hooks are mutually exclusive for that lifecycle pass.

19. `hasPausedToolCall` is kept as a turn-local runtime flag.

   Each lifecycle pass resets it in either `onTurnStart` or `onTurnResume`, so it does not need to be derived from persisted message state for the current design.

20. Kit test startup issue is fixed.

   `packages/kit` now has `vite@^6.0.0` as a dev dependency, so `vitest@4` resolves against a compatible Vite version instead of the workspace's Vite 5. `pnpm -F @opentiny/tiny-robot-kit test` now passes.

21. Vue ordinary plugins now support `commands`.

   `UseMessagePlugin` exposes `commands`, and `createCorePlugin` maps Vue command handlers into core plugin commands with Vue base context, `appendMessage`, and `requestNext`.

22. Resume lifecycle restores `currentTurn`.

   When `runTurnLifecycle({ resume: true })` starts, engine restores `runtime.currentTurn` from persisted messages by scanning backward from the message tail to the latest `role: 'user'` message. `onTurnResume` and later hooks can see the resumed turn context.

## Open Issues By Priority

No P0 items are currently open.

No P1 items are currently open.

### P2 - API Completeness / Polish

1. Add focused tests for the pause/resume flow.

   Suggested cases:

   - Tool call pauses and does not call `callTool`.
   - Paused tool call does not trigger `requestNext`.
   - Resume calls `callTool`.
   - Multiple tool calls with mixed paused/running behavior.
   - All tool calls complete and continue the model request.
   - Resume works from `initialMessages` after local restore.

## Current Verification

Passed:

```bash
pnpm -F @opentiny/tiny-robot-kit build
pnpm -F @opentiny/tiny-robot-kit test
pnpm -F @opentiny/tiny-robot build
```

## Suggested Next Order

1. P2: add focused pause/resume tests.
